import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { nftService } from '../services/NFTService.ts';
import { addPublishedCollection, getPublishedCollections, removePublishedCollection, type PublishedCollection } from '../config/contracts.ts';
import { Button } from '../components/ui/Button.tsx';

/** Publish Collection page — enter a contract address to index from blockchain. */
export function PublishPage(): JSX.Element {
    const navigate = useNavigate();
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [published, setPublished] = useState<PublishedCollection[]>(getPublishedCollections);

    const handlePublish = useCallback(async (): Promise<void> => {
        const trimmed = address.trim();
        if (!trimmed) {
            setError('Please enter a contract address.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Query the blockchain for collection info
            const info = await nftService.getCollectionInfo(trimmed);

            const col: PublishedCollection = {
                address: trimmed,
                name: info.name,
                symbol: info.symbol,
                totalSupply: Number(info.totalSupply),
                publishedAt: new Date().toISOString(),
            };

            addPublishedCollection(col);
            setPublished(getPublishedCollections());
            setSuccess(`Published "${info.name}" (${info.symbol}) — ${info.totalSupply.toString()} items indexed from blockchain!`);
            setAddress('');

            // Clear nftService cache so fresh data is fetched
            nftService.clearCache();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to index collection';
            setError(`Could not index collection: ${msg}. Make sure the contract address is correct and the contract is deployed on OPNet testnet.`);
        } finally {
            setLoading(false);
        }
    }, [address]);

    function handleRemove(addr: string): void {
        removePublishedCollection(addr);
        setPublished(getPublishedCollections());
    }

    function handleView(addr: string): void {
        void navigate(`/collection/${addr}`);
    }

    return (
        <div className="publish-page">
            {/* Hero */}
            <section className="publish-hero">
                <h1 className="publish-title">Publish Your Collection</h1>
                <p className="publish-subtitle">
                    Enter your OP721 contract address and GremlinX will index it directly from the Bitcoin blockchain.
                    No approval needed — if it&apos;s deployed on OPNet, it&apos;s ready to trade.
                </p>
            </section>

            {/* Input Form */}
            <section className="publish-form">
                <div className="publish-input-row">
                    <input
                        type="text"
                        className="publish-input"
                        placeholder="Enter contract address (e.g. opt1sq...)"
                        value={address}
                        onChange={(e): void => setAddress(e.target.value)}
                        onKeyDown={(e): void => {
                            if (e.key === 'Enter') void handlePublish();
                        }}
                        disabled={loading}
                    />
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={(): void => { void handlePublish(); }}
                        disabled={loading || !address.trim()}
                    >
                        {loading ? 'Indexing...' : 'Publish'}
                    </Button>
                </div>

                {error && <div className="publish-error">{error}</div>}
                {success && <div className="publish-success">{success}</div>}
            </section>

            {/* Published Collections */}
            <section className="publish-list">
                <h2 className="publish-list-title">Published Collections</h2>
                {published.length === 0 ? (
                    <div className="publish-empty">
                        <p>No collections published yet. Enter a contract address above to get started!</p>
                    </div>
                ) : (
                    <div className="publish-grid">
                        {published.map((col) => (
                            <div key={col.address} className="publish-card">
                                <div className="publish-card-icon">
                                    <span className="publish-card-symbol">{col.symbol}</span>
                                </div>
                                <div className="publish-card-body">
                                    <span className="publish-card-name">{col.name}</span>
                                    <span className="publish-card-address" title={col.address}>
                                        {col.address.slice(0, 12)}...{col.address.slice(-6)}
                                    </span>
                                    <span className="publish-card-meta">
                                        {col.totalSupply} items &middot; Published {new Date(col.publishedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="publish-card-actions">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={(): void => handleView(col.address)}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(): void => handleRemove(col.address)}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* How It Works */}
            <section className="publish-how">
                <h3>How Publishing Works</h3>
                <div className="publish-steps">
                    <div className="publish-step">
                        <div className="publish-step-number">1</div>
                        <div>
                            <strong>Deploy your OP721 contract</strong>
                            <p>Deploy an OP721 NFT collection on the OPNet testnet.</p>
                        </div>
                    </div>
                    <div className="publish-step">
                        <div className="publish-step-number">2</div>
                        <div>
                            <strong>Paste the contract address</strong>
                            <p>Enter the contract address above. GremlinX queries the blockchain for collection data.</p>
                        </div>
                    </div>
                    <div className="publish-step">
                        <div className="publish-step-number">3</div>
                        <div>
                            <strong>Browse &amp; trade</strong>
                            <p>Your collection is live! Anyone can view, buy, and sell NFTs from it.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
