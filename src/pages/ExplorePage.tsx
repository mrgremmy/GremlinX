import { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getPublishedCollections, type PublishedCollection } from '../config/contracts.ts';
import { nftService } from '../services/NFTService.ts';
import { marketplaceService } from '../services/MarketplaceService.ts';
import { FormatUtils } from '../utils/formatting.ts';
import type { CollectionInfo, NFTItem } from '../types/nft.ts';
import { Skeleton } from '../components/ui/Skeleton.tsx';

interface CollectionWithItems {
    readonly info: CollectionInfo;
    readonly published: PublishedCollection;
    readonly previewItems: readonly NFTItem[];
}

interface CollectionStats {
    readonly floorPriceSats: bigint | null;
    readonly volumeSats: bigint;
}

/** Landing / explore page — marketplace homepage. */
export function ExplorePage(): JSX.Element {
    const navigate = useNavigate();
    const [collections, setCollections] = useState<CollectionWithItems[]>([]);
    const [collectionStats, setCollectionStats] = useState<Map<string, CollectionStats>>(new Map());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load(): Promise<void> {
            setLoading(true);
            const published = getPublishedCollections();
            if (published.length === 0) {
                setCollections([]);
                setLoading(false);
                return;
            }

            const results: CollectionWithItems[] = [];
            for (const col of published) {
                try {
                    const info = await nftService.getCollectionInfo(col.address);
                    const previewItems = await nftService.getCollectionNFTs(col.address, 4);
                    results.push({ info, published: col, previewItems });
                } catch {
                    // Skip collections that fail to load
                }
            }
            setCollections(results);
            setLoading(false);

            // Fetch floor prices & volume in background
            const statsMap = new Map<string, CollectionStats>();
            for (const col of results) {
                try {
                    let floor: bigint | null = null;
                    const supply = Number(col.info.totalSupply);
                    for (let i = 1; i <= supply; i++) {
                        const listing = await marketplaceService.getListingAsync(col.info.address, BigInt(i));
                        if (listing && (floor === null || listing.priceSats < floor)) {
                            floor = listing.priceSats;
                        }
                    }
                    const globalStats = await marketplaceService.getStatsAsync();
                    statsMap.set(col.info.address, {
                        floorPriceSats: floor,
                        volumeSats: globalStats?.totalVolume ?? 0n,
                    });
                } catch {
                    statsMap.set(col.info.address, { floorPriceSats: null, volumeSats: 0n });
                }
            }
            setCollectionStats(statsMap);
        }
        void load();
    }, []);

    const goCollection = useCallback(
        (address: string): void => {
            void navigate(`/collection/${address}`);
        },
        [navigate],
    );

    const hasCollections = collections.length > 0;

    return (
        <div className="explore-page">
            {/* ====== HERO ====== */}
            {hasCollections ? (
                <section className="hero-spotlight" onClick={(): void => goCollection(collections[0].info.address)}>
                    <div className="hero-spotlight-bg hero-spotlight-bg-gradient" />
                    <div className="hero-spotlight-overlay" />
                    <div className="hero-spotlight-content">
                        <span className="hero-spotlight-badge">Featured Collection</span>
                        <h1 className="hero-spotlight-title">{collections[0].info.name}</h1>
                        <p className="hero-spotlight-desc">
                            {collections[0].info.description ?? `${collections[0].info.symbol} — ${collections[0].info.totalSupply.toString()} items on Bitcoin L1`}
                        </p>
                        <div className="hero-spotlight-stats">
                            <div className="spotlight-stat">
                                <span className="spotlight-stat-value">{collections[0].info.totalSupply.toString()}</span>
                                <span className="spotlight-stat-label">Items</span>
                            </div>
                            <div className="spotlight-stat">
                                <span className="spotlight-stat-value">{collections[0].info.symbol}</span>
                                <span className="spotlight-stat-label">Symbol</span>
                            </div>
                        </div>
                        <button className="btn btn-primary btn-lg">View Collection</button>
                    </div>
                </section>
            ) : (
                <section className="hero-spotlight hero-empty">
                    <div className="hero-spotlight-bg hero-spotlight-bg-gradient" />
                    <div className="hero-spotlight-overlay" />
                    <div className="hero-spotlight-content">
                        <h1 className="hero-spotlight-title">Welcome to GremlinX</h1>
                        <p className="hero-spotlight-desc">
                            The first NFT marketplace on Bitcoin L1. Publish your OP721 collection to get started.
                        </p>
                        <Link to="/publish" className="btn btn-primary btn-lg">Publish a Collection</Link>
                    </div>
                </section>
            )}

            {/* ====== COLLECTIONS ====== */}
            <section className="home-section">
                <div className="section-header">
                    <h2 className="section-title">All Collections</h2>
                    <span className="section-subtitle">Indexed directly from the Bitcoin blockchain</span>
                </div>

                {loading ? (
                    <div className="trending-grid">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="trending-card">
                                <Skeleton className="nft-image-skeleton" />
                                <Skeleton className="nft-text-skeleton" />
                            </div>
                        ))}
                    </div>
                ) : hasCollections ? (
                    <div className="collections-table">
                        <div className="table-header">
                            <span className="th-rank">#</span>
                            <span className="th-collection">Collection</span>
                            <span className="th-floor">Floor Price</span>
                            <span className="th-change">24h %</span>
                            <span className="th-volume">Volume</span>
                            <span className="th-items">Items</span>
                        </div>
                        {collections.map((col, index) => {
                            const stats = collectionStats.get(col.info.address);
                            return (
                                <div
                                    key={col.info.address}
                                    className="table-row"
                                    onClick={(): void => goCollection(col.info.address)}
                                >
                                    <span className="td-rank">{index + 1}</span>
                                    <div className="td-collection">
                                        <div className="table-icon table-icon-letter">
                                            {col.info.symbol.charAt(0)}
                                        </div>
                                        <div className="table-col-info">
                                            <span className="table-col-name">{col.info.name}</span>
                                            <span className="table-col-symbol">{col.info.symbol}</span>
                                        </div>
                                    </div>
                                    <span className="td-floor">
                                        {stats?.floorPriceSats ? `${FormatUtils.satsToBTC(stats.floorPriceSats)} BTC` : '—'}
                                    </span>
                                    <span className="td-change">—</span>
                                    <span className="td-volume">
                                        {stats && stats.volumeSats > 0n ? `${FormatUtils.satsToBTC(stats.volumeSats)} BTC` : '—'}
                                    </span>
                                    <span className="td-items">{col.info.totalSupply.toString()}</span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="explore-empty-state">
                        <div className="explore-empty-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <line x1="12" y1="8" x2="12" y2="16" />
                                <line x1="8" y1="12" x2="16" y2="12" />
                            </svg>
                        </div>
                        <h3>No Collections Yet</h3>
                        <p>Be the first to publish an OP721 NFT collection on GremlinX!</p>
                        <Link to="/publish" className="btn btn-primary btn-md">Publish Collection</Link>
                    </div>
                )}
            </section>

            {/* ====== BROWSE ITEMS ====== */}
            {hasCollections && (
                <section className="home-section">
                    <div className="section-header">
                        <h2 className="section-title">Browse NFTs</h2>
                        <span className="section-subtitle">Preview items from published collections</span>
                    </div>
                    <div className="browse-grid">
                        {collections.flatMap((col) =>
                            col.previewItems.slice(0, 4).map((item) => (
                                <div
                                    key={`${item.collectionAddress}:${item.tokenId}`}
                                    className="browse-card"
                                    onClick={(): void => {
                                        void navigate(`/collection/${item.collectionAddress}/${item.tokenId.toString()}`);
                                    }}
                                >
                                    <div className="browse-card-img-wrap">
                                        {item.metadata?.image ? (
                                            <img src={item.metadata.image} alt={item.metadata.name ?? 'NFT'} className="browse-card-img" />
                                        ) : (
                                            <div className="browse-card-img browse-card-blank" />
                                        )}
                                    </div>
                                    <div className="browse-card-body">
                                        <span className="browse-card-collection">{col.info.name}</span>
                                        <span className="browse-card-name">
                                            {item.metadata?.name ?? `#${item.tokenId.toString()}`}
                                        </span>
                                    </div>
                                </div>
                            )),
                        )}
                    </div>
                </section>
            )}

            {/* ====== HOW IT WORKS ====== */}
            <section className="home-section how-it-works">
                <div className="section-header">
                    <h2 className="section-title">How It Works</h2>
                    <span className="section-subtitle">Trade NFTs natively on Bitcoin — no bridges, no wrapping</span>
                </div>
                <div className="steps-grid">
                    <div className="step-card">
                        <div className="step-number">1</div>
                        <h3>Connect Wallet</h3>
                        <p>Connect your OP_WALLET to the OPNet Bitcoin network.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">2</div>
                        <h3>Publish Collection</h3>
                        <p>Enter your OP721 contract address. GremlinX indexes it from the blockchain.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">3</div>
                        <h3>Buy & Sell</h3>
                        <p>Browse, list, and buy NFTs. All transactions settle on Bitcoin L1.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
