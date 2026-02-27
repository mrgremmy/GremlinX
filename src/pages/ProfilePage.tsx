import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWalletConnect, SupportedWallets } from '@btc-vision/walletconnect';
import type { NFTItem } from '../types/nft.ts';
import { nftService } from '../services/NFTService.ts';
import { marketplaceService } from '../services/MarketplaceService.ts';
import { getPublishedCollections } from '../config/contracts.ts';
import { NFTGrid } from '../components/nft/NFTGrid.tsx';
import { FormatUtils } from '../utils/formatting.ts';
import { Button } from '../components/ui/Button.tsx';
import { EmptyState, WalletIcon, GalleryIcon } from '../components/ui/EmptyState.tsx';
import { useGremlinPFP } from '../hooks/useGremlinPFP.ts';
import { PFPSelector } from '../components/profile/PFPSelector.tsx';

type TabId = 'collected' | 'listed' | 'activity';

/** Profile page — social-media-style identity page. Supports own profile and viewing others. */
export function ProfilePage(): JSX.Element {
    const navigate = useNavigate();
    const { address: routeAddress } = useParams<{ address?: string }>();
    const { walletAddress, walletBalance, connectToWallet } = useWalletConnect();

    // Decide which address to display — route param takes priority
    const displayAddress = routeAddress ?? walletAddress ?? null;
    const isOwnProfile = !routeAddress || (walletAddress?.toLowerCase() === routeAddress.toLowerCase());

    const { avatarId, avatarDataURI, selectAvatar } = useGremlinPFP(displayAddress);

    const [tab, setTab] = useState<TabId>('collected');
    const [ownedItems, setOwnedItems] = useState<NFTItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [pfpOpen, setPfpOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [listedItems, setListedItems] = useState<NFTItem[]>([]);
    const [listedPrices, setListedPrices] = useState<Map<string, bigint>>(new Map());
    const [listedLoading, setListedLoading] = useState(false);

    useEffect(() => {
        if (!displayAddress) return;

        async function load(): Promise<void> {
            setLoading(true);
            try {
                const results: NFTItem[] = [];
                const published = getPublishedCollections();
                for (const col of published) {
                    const tokenIds = await nftService.getOwnedTokens(
                        col.address,
                        displayAddress as string,
                    );
                    for (const tokenId of tokenIds) {
                        const item = await nftService.getNFTByTokenId(col.address, tokenId);
                        results.push(item);
                    }
                }
                setOwnedItems(results);
            } catch {
                /* swallow */
            } finally {
                setLoading(false);
            }
        }
        void load();
    }, [displayAddress]);

    // Fetch on-chain listings for owned items
    useEffect(() => {
        if (!ownedItems.length) {
            setListedItems([]);
            setListedPrices(new Map());
            return;
        }
        let cancelled = false;
        setListedLoading(true);

        async function fetchListings(): Promise<void> {
            const listed: NFTItem[] = [];
            const prices = new Map<string, bigint>();

            await Promise.allSettled(
                ownedItems.map(async (item) => {
                    const listing = await marketplaceService.getListingAsync(
                        item.collectionAddress,
                        item.tokenId,
                    );
                    if (listing && listing.priceSats > 0n) {
                        listed.push(item);
                        prices.set(
                            `${item.collectionAddress}:${item.tokenId}`,
                            listing.priceSats,
                        );
                    }
                }),
            );

            if (!cancelled) {
                setListedItems(listed);
                setListedPrices(prices);
                setListedLoading(false);
            }
        }

        void fetchListings();
        return (): void => { cancelled = true; };
    }, [ownedItems]);

    /** Sort owned items: listed first, then by tokenId. */
    const sortedOwned = useMemo(() => {
        const arr = [...ownedItems];
        arr.sort((a, b) => {
            const aListed = listedPrices.has(`${a.collectionAddress}:${a.tokenId}`) ? 1 : 0;
            const bListed = listedPrices.has(`${b.collectionAddress}:${b.tokenId}`) ? 1 : 0;
            return bListed - aListed;
        });
        return arr;
    }, [ownedItems, listedPrices]);

    const handleSelect = useCallback(
        (item: NFTItem): void => {
            void navigate(`/collection/${item.collectionAddress}/${item.tokenId.toString()}`);
        },
        [navigate],
    );

    function handleConnect(): void {
        connectToWallet(SupportedWallets.OP_WALLET);
    }

    function handleCopy(): void {
        if (!displayAddress) return;
        void navigator.clipboard.writeText(displayAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    if (!displayAddress) {
        return (
            <div className="profile-page not-connected">
                <EmptyState
                    icon={<WalletIcon />}
                    heading="Connect Your Wallet"
                    description="View your NFTs, track activity, and manage your collection. Connect your OP_WALLET to get started."
                    actionLabel="Connect OP_WALLET"
                    onAction={handleConnect}
                />
            </div>
        );
    }

    const btcBalance = isOwnProfile && walletBalance
        ? FormatUtils.satsToBTC(BigInt(walletBalance.total))
        : null;

    return (
        <div className="profile-page connected">
            {/* ====== BANNER ====== */}
            <section className="profile-banner">
                <div className="profile-banner-gradient" />
            </section>

            {/* ====== IDENTITY AREA ====== */}
            <section className="profile-identity">
                {isOwnProfile ? (
                    <button
                        className="profile-pfp-wrapper"
                        onClick={(): void => setPfpOpen(true)}
                        title="Change avatar"
                    >
                        <img
                            src={avatarDataURI}
                            alt="Profile avatar"
                            className="profile-pfp"
                        />
                        <span className="profile-pfp-edit">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            </svg>
                        </span>
                    </button>
                ) : (
                    <div className="profile-pfp-wrapper profile-pfp-static">
                        <img src={avatarDataURI} alt="Profile avatar" className="profile-pfp" />
                    </div>
                )}

                <div className="profile-address-row">
                    <span className="profile-address-clean" title={displayAddress}>
                        {FormatUtils.formatAddress(displayAddress, 8)}
                    </span>
                    <button className="profile-copy-btn" onClick={handleCopy} title="Copy address">
                        {copied ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                        )}
                    </button>
                </div>
            </section>

            {/* ====== BALANCE (own profile only) ====== */}
            {btcBalance !== null && (
                <section className="profile-balance-area">
                    <span className="profile-btc-icon">₿</span>
                    <span className="profile-btc-value">{btcBalance} BTC</span>
                </section>
            )}

            {/* ====== STATS ROW ====== */}
            <section className="profile-stats-row">
                <div className="profile-stat-item">
                    <span className="profile-stat-number">{ownedItems.length}</span>
                    <span className="profile-stat-label">NFTs Owned</span>
                </div>
                <div className="profile-stat-item">
                    <span className="profile-stat-number">
                        {new Set(ownedItems.map((i) => i.collectionAddress)).size}
                    </span>
                    <span className="profile-stat-label">Collections</span>
                </div>
                <div className="profile-stat-item">
                    <span className="profile-stat-number">—</span>
                    <span className="profile-stat-label">Total Value</span>
                </div>
                <div className="profile-stat-item">
                    <span className="profile-stat-number">{listedItems.length}</span>
                    <span className="profile-stat-label">Listed</span>
                </div>
            </section>

            {/* ====== TABS ====== */}
            <div className="profile-tabs">
                {(['collected', 'listed', 'activity'] as const).map((t) => (
                    <Button
                        key={t}
                        variant={tab === t ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={(): void => setTab(t)}
                    >
                        {t === 'collected' ? 'Collected' : t === 'listed' ? 'Listed' : 'Activity'}
                    </Button>
                ))}
            </div>

            {/* ====== TAB CONTENT ====== */}
            <section className="profile-content">
                {tab === 'collected' && (
                    ownedItems.length === 0 && !loading ? (
                        <EmptyState
                            icon={<GalleryIcon />}
                            heading="No NFTs Yet"
                            description={isOwnProfile ? 'Start exploring collections and build your on-chain identity.' : 'This user has no NFTs yet.'}
                            actionLabel={isOwnProfile ? 'Explore Collections' : undefined}
                            actionHref={isOwnProfile ? '/explore' : undefined}
                        />
                    ) : (
                        <NFTGrid items={sortedOwned} loading={loading} listingPrices={listedPrices} onSelect={handleSelect} />
                    )
                )}
                {tab === 'listed' && (
                    listedItems.length === 0 && !listedLoading ? (
                        <EmptyState
                            icon={<GalleryIcon />}
                            heading="No Active Listings"
                            description="When NFTs are listed for sale, they'll appear here."
                        />
                    ) : (
                        <NFTGrid
                            items={listedItems}
                            loading={listedLoading}
                            listingPrices={listedPrices}
                            onSelect={handleSelect}
                        />
                    )
                )}
                {tab === 'activity' && (
                    <EmptyState
                        icon={<GalleryIcon />}
                        heading="Transaction History Coming Soon"
                        description="Buy, sell, and transfer activity will be tracked here."
                    />
                )}
            </section>

            {/* PFP Selector Modal (own profile only) */}
            {isOwnProfile && (
                <PFPSelector
                    open={pfpOpen}
                    onClose={(): void => setPfpOpen(false)}
                    currentId={avatarId}
                    onSelect={selectAvatar}
                />
            )}
        </div>
    );
}
