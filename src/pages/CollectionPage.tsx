import { useParams, useNavigate } from 'react-router-dom';
import { useCallback, useState, useMemo, useEffect } from 'react';
import type { NFTItem } from '../types/nft.ts';
import { useNFTCollection } from '../hooks/useNFTCollection.ts';
import { NFTGrid } from '../components/nft/NFTGrid.tsx';
import { Skeleton } from '../components/ui/Skeleton.tsx';
import { EmptyState, CollectionIcon } from '../components/ui/EmptyState.tsx';
import { marketplaceService } from '../services/MarketplaceService.ts';
import { FormatUtils } from '../utils/formatting.ts';

type CollectionTab = 'items' | 'activity';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface SaleEvent {
    readonly tokenId: bigint;
    readonly priceSats: bigint;
    readonly buyer: string;
    readonly seller: string;
    readonly timestamp: number;
}

/** Collection page — banner/stats + scoped NFT grid. */
export function CollectionPage(): JSX.Element {
    const { address } = useParams<{ address: string }>();
    const navigate = useNavigate();
    const collectionAddress = address ?? '';

    const { info, items, loading, error } = useNFTCollection(collectionAddress);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<CollectionTab>('items');

    // Fetch on-chain listing prices for all items
    const [listingPrices, setListingPrices] = useState<Map<string, bigint>>(new Map());
    const [volumeSats, setVolumeSats] = useState<bigint>(0n);
    // @ts-expect-error - setter included for potential future use
    const [salesHistory, setSalesHistory] = useState<SaleEvent[]>([]);

    useEffect(() => {
        if (!items.length || !collectionAddress) return;
        let cancelled = false;

        async function fetchListings(): Promise<void> {
            const prices = new Map<string, bigint>();
            // Query each token in parallel
            const results = await Promise.allSettled(
                items.map(async (item) => {
                    const listing = await marketplaceService.getListingAsync(
                        collectionAddress,
                        item.tokenId,
                    );
                    if (listing && listing.priceSats > 0n) {
                        prices.set(item.tokenId.toString(), listing.priceSats);
                    }
                }),
            );
            void results; // consume
            if (!cancelled) setListingPrices(prices);

            // Fetch global marketplace stats (volume)
            try {
                const stats = await marketplaceService.getStatsAsync();
                if (!cancelled && stats) setVolumeSats(stats.totalVolume);
            } catch { /* ignore */ }
        }

        void fetchListings();
        return (): void => { cancelled = true; };
    }, [items, collectionAddress]);

    /** Floor price = lowest listed price. */
    const floorPriceSats = useMemo<bigint | null>(() => {
        let floor: bigint | null = null;
        for (const price of listingPrices.values()) {
            if (floor === null || price < floor) floor = price;
        }
        return floor;
    }, [listingPrices]);

    /** Sort items: listed (has price) first, then unlisted. */
    const sortedItems = useMemo(() => {
        const arr = [...items];
        arr.sort((a, b) => {
            const aListed = listingPrices.has(a.tokenId.toString()) || a.metadata?.price ? 1 : 0;
            const bListed = listingPrices.has(b.tokenId.toString()) || b.metadata?.price ? 1 : 0;
            return bListed - aListed;
        });
        return arr;
    }, [items, listingPrices]);

    const handleSelect = useCallback(
        (item: NFTItem): void => {
            void navigate(`/collection/${collectionAddress}/${item.tokenId.toString()}`);
        },
        [navigate, collectionAddress],
    );

    function handleCopyCA(): void {
        void navigator.clipboard.writeText(collectionAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    if (loading) {
        return (
            <div className="collection-page loading-state">
                <Skeleton className="banner-skeleton" />
                <Skeleton className="stats-skeleton" />
            </div>
        );
    }

    if (error || !info) {
        return (
            <div className="collection-page">
                <EmptyState
                    icon={<CollectionIcon />}
                    heading="Collection Not Found"
                    description="This collection doesn't exist or failed to load. It may not be deployed on the OPNet testnet yet."
                    actionLabel="Back to Explore"
                    actionHref="/explore"
                />
            </div>
        );
    }

    const listedCount = sortedItems.filter(
        (i) => listingPrices.has(i.tokenId.toString()) || i.metadata?.price,
    ).length;

    return (
        <div className="collection-page">
            {/* Banner */}
            <section className="collection-banner-area">
                {info.banner ? (
                    <img src={info.banner} alt={info.name} className="collection-banner-img" />
                ) : (
                    <div className="collection-banner-fallback" />
                )}
                <div className="collection-banner-overlay" />
            </section>

            <section className="collection-info">
                {info.icon && (
                    <img src={info.icon} alt={info.name} className="collection-icon-large" />
                )}
                <h1 className="collection-name">{info.name}</h1>
                {/* Contract Address */}
                <div className="collection-ca-row">
                    <span className="collection-ca-label">CA</span>
                    <span className="collection-ca-value" title={info.address}>
                        {info.address}
                    </span>
                    <button className="collection-ca-copy" onClick={handleCopyCA} title="Copy contract address">
                        {copied ? (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        ) : (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                        )}
                    </button>
                </div>
                {info.description && (
                    <p className="collection-description">{info.description}</p>
                )}
            </section>

            {/* Stats */}
            <section className="collection-stats">
                <div className="stat">
                    <span className="stat-value">
                        {floorPriceSats ? `${FormatUtils.satsToBTC(floorPriceSats)} BTC` : '—'}
                    </span>
                    <span className="stat-label">Floor Price</span>
                </div>
                <div className="stat">
                    <span className="stat-value">—</span>
                    <span className="stat-label">24h %</span>
                </div>
                <div className="stat">
                    <span className="stat-value">
                        {volumeSats > 0n ? `${FormatUtils.satsToBTC(volumeSats)} BTC` : '—'}
                    </span>
                    <span className="stat-label">Volume</span>
                </div>
                <div className="stat">
                    <span className="stat-value">{info.totalSupply.toString()}</span>
                    <span className="stat-label">Items</span>
                </div>
                <div className="stat">
                    <span className="stat-value">{listedCount}</span>
                    <span className="stat-label">Listed</span>
                </div>
            </section>

            {/* Tabs */}
            <section className="collection-tabs">
                <button
                    className={`collection-tab-btn${activeTab === 'items' ? ' collection-tab-active' : ''}`}
                    onClick={(): void => setActiveTab('items')}
                >
                    Items
                </button>
                <button
                    className={`collection-tab-btn${activeTab === 'activity' ? ' collection-tab-active' : ''}`}
                    onClick={(): void => setActiveTab('activity')}
                >
                    Activity
                </button>
            </section>

            {/* Tab Content */}
            {activeTab === 'items' ? (
                <section className="collection-grid">
                    <NFTGrid
                        items={sortedItems}
                        loading={false}
                        collectionName={info.name}
                        listingPrices={listingPrices}
                        onSelect={handleSelect}
                    />
                </section>
            ) : (
                <section className="collection-activity">
                    {salesHistory.length > 0 ? (
                        <div className="activity-table">
                            <div className="activity-header">
                                <span>Event</span>
                                <span>Item</span>
                                <span>Price</span>
                                <span>From</span>
                                <span>To</span>
                                <span>Time</span>
                            </div>
                            {salesHistory.map((sale, i) => (
                                <div key={i} className="activity-row">
                                    <span className="activity-event-badge">Sale</span>
                                    <span className="activity-item">#{sale.tokenId.toString()}</span>
                                    <span className="activity-price">{FormatUtils.satsToBTC(sale.priceSats)} BTC</span>
                                    <span className="activity-addr" title={sale.seller}>{FormatUtils.formatAddress(sale.seller, 4)}</span>
                                    <span className="activity-addr" title={sale.buyer}>{FormatUtils.formatAddress(sale.buyer, 4)}</span>
                                    <span className="activity-time">{new Date(sale.timestamp).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="activity-empty">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                            <p>No sales yet for this collection.</p>
                            <span className="activity-empty-sub">Sales will appear here once NFTs are purchased.</span>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
