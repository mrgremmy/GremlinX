import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { useWalletConnect } from '@btc-vision/walletconnect';
import { useNFTDetail } from '../hooks/useNFTDetail.ts';
import { NFTTraits } from '../components/nft/NFTTraits.tsx';
import { Skeleton } from '../components/ui/Skeleton.tsx';
import { Button } from '../components/ui/Button.tsx';
import { EmptyState, ImageOffIcon } from '../components/ui/EmptyState.tsx';
import { ListingModal } from '../components/marketplace/ListingModal.tsx';
import { BuyModal } from '../components/marketplace/BuyModal.tsx';
import { FormatUtils } from '../utils/formatting.ts';
import { getPublishedCollections } from '../config/contracts.ts';
import { addressService } from '../services/AddressService.ts';
import { marketplaceService } from '../services/MarketplaceService.ts';
import { useToast } from '../hooks/useToast.tsx';

/** Full-screen NFT detail — large image + metadata + traits + actions. */
export function NFTDetailPage(): JSX.Element {
    const { address, tokenId } = useParams<{ address: string; tokenId: string }>();
    const navigate = useNavigate();
    const { walletAddress, address: walletAddrObj } = useWalletConnect();
    const { addToast } = useToast();

    const collectionAddress = address ?? '';
    const id = BigInt(tokenId ?? '0');
    const { item, loading, error } = useNFTDetail(collectionAddress, id);

    const [listingOpen, setListingOpen] = useState(false);
    const [buyOpen, setBuyOpen] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [listingPrice, setListingPrice] = useState<bigint | null>(null);
    const [delisting, setDelisting] = useState(false);

    // Fetch listing from on-chain contract
    const refreshListing = (): void => {
        void marketplaceService.getListingAsync(collectionAddress, id).then((listing) => {
            setListingPrice(listing?.priceSats ?? null);
        }).catch(() => {
            setListingPrice(null);
        });
    };

    // Load listing on mount
    useEffect(() => {
        refreshListing();
    }, [collectionAddress, id]); // eslint-disable-line react-hooks/exhaustive-deps

    // Resolve the raw 0x MLDSA owner to a displayable opt1p address
    const [ownerDisplay, setOwnerDisplay] = useState<string | null>(null);

    // Resolve ownership: walletAddress is opt1p..., item.owner is 0x MLDSA hash
    useEffect(() => {
        let cancelled = false;
        if (walletAddress && item?.owner) {
            void addressService.addressesMatch(walletAddress, item.owner).then((match) => {
                if (!cancelled) setIsOwner(match);
            });
        } else {
            setIsOwner(false);
        }
        return (): void => { cancelled = true; };
    }, [walletAddress, item?.owner]);

    // If the user is the owner, show their wallet address instead of the raw hex
    useEffect(() => {
        if (!item?.owner) {
            setOwnerDisplay(null);
            return;
        }
        // If owner is already a readable opt1 address, use it directly
        if (item.owner.startsWith('opt1')) {
            setOwnerDisplay(item.owner);
            return;
        }
        // If the connected wallet is the owner, show the wallet address
        if (isOwner && walletAddress) {
            setOwnerDisplay(walletAddress);
            return;
        }
        // Otherwise check if we have a cached P2TR for this MLDSA hash
        const resolved = addressService.getP2trFromMldsa(item.owner);
        setOwnerDisplay(resolved ?? item.owner);
    }, [item?.owner, isOwner, walletAddress]);

    const collectionName = useMemo(() => {
        const published = getPublishedCollections();
        const match = published.find(
            (c) => c.address.toLowerCase() === collectionAddress.toLowerCase(),
        );
        return match?.name ?? 'Collection';
    }, [collectionAddress]);

    if (loading) {
        return (
            <div className="detail-page loading-state">
                <Skeleton className="detail-image-skeleton" />
                <Skeleton className="detail-text-skeleton" />
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="detail-page">
                <EmptyState
                    icon={<ImageOffIcon />}
                    heading="NFT Not Found"
                    description="This NFT doesn't exist or failed to load. It may have been burned or the collection is not deployed yet."
                    actionLabel="Back to Explore"
                    actionHref="/explore"
                />
            </div>
        );
    }

    const price = listingPrice
        ? FormatUtils.satsToBTC(listingPrice)
        : (item.metadata?.price ?? null);

    return (
        <div className="detail-page">
            {/* Image */}
            <div className="detail-image-col">
                {item.metadata?.image ? (
                    <img
                        src={item.metadata.image}
                        alt={item.metadata.name ?? 'NFT'}
                        className="detail-image"
                    />
                ) : (
                    <div className="detail-image-placeholder">No Image</div>
                )}
            </div>

            {/* Info */}
            <div className="detail-info-col">
                <button
                    className="back-link"
                    onClick={(): void => {
                        void navigate(`/collection/${collectionAddress}`);
                    }}
                >
                    &larr; Back to Collection
                </button>

                <h1 className="detail-name">
                    {item.metadata?.name ?? FormatUtils.formatTokenId(item.tokenId)}
                </h1>
                <p className="detail-id">{FormatUtils.formatTokenId(item.tokenId)}</p>

                {item.metadata?.description && (
                    <p className="detail-description">{item.metadata.description}</p>
                )}

                {/* Price */}
                {price && (
                    <div className="detail-price-box">
                        <span className="detail-price-label">Price</span>
                        <span className="detail-price-value">{price} BTC</span>
                    </div>
                )}

                <div className="detail-owner">
                    <span className="label">Owner</span>
                    <Link to={`/profile/${ownerDisplay ?? item.owner}`} className="detail-owner-link" title={ownerDisplay ?? item.owner}>
                        {isOwner ? 'You' : FormatUtils.formatAddress(ownerDisplay ?? item.owner)}
                    </Link>
                </div>

                {/* Actions */}
                <div className="detail-actions">
                    {isOwner ? (
                        listingPrice ? (
                            /* Already listed — show Delist + Change Price */
                            <>
                                <Button
                                    variant="secondary"
                                    disabled={delisting}
                                    onClick={(): void => {
                                        if (!walletAddrObj || !walletAddress) {
                                            addToast('error', 'Not Connected', 'Connect your wallet first.');
                                            return;
                                        }
                                        setDelisting(true);
                                        void marketplaceService
                                            .cancelListing(collectionAddress, id, walletAddrObj, walletAddress)
                                            .then((txHash) => {
                                                addToast('success', 'Delisted', `Listing cancelled (tx: ${txHash.slice(0, 12)}…)`);
                                                setListingPrice(null);
                                            })
                                            .catch((err: unknown) => {
                                                const msg = err instanceof Error ? err.message : 'Could not cancel listing.';
                                                addToast('error', 'Failed', msg);
                                            })
                                            .finally(() => setDelisting(false));
                                    }}
                                >
                                    {delisting ? 'Delisting…' : 'Delist'}
                                </Button>
                                <Button onClick={(): void => setListingOpen(true)}>Change Price</Button>
                            </>
                        ) : (
                            <Button onClick={(): void => setListingOpen(true)}>List for Sale</Button>
                        )
                    ) : (
                        <Button onClick={(): void => setBuyOpen(true)} disabled={!price}>
                            {price ? 'Buy Now' : 'Not Listed'}
                        </Button>
                    )}
                </div>

                {/* Traits */}
                {item.metadata?.attributes && item.metadata.attributes.length > 0 && (
                    <div className="detail-traits">
                        <h3>Traits</h3>
                        <NFTTraits attributes={item.metadata.attributes} />
                    </div>
                )}
            </div>

            {/* Modals */}
            <ListingModal
                open={listingOpen}
                onClose={(): void => {
                    setListingOpen(false);
                    refreshListing();
                }}
                collectionAddress={collectionAddress}
                tokenId={id}
            />
            <BuyModal
                open={buyOpen}
                onClose={(): void => setBuyOpen(false)}
                collectionAddress={collectionAddress}
                collectionName={collectionName}
                tokenId={id}
                tokenName={item.metadata?.name ?? FormatUtils.formatTokenId(id)}
                tokenImage={item.metadata?.image ?? null}
                priceBTC={price ?? '0'}
                ownerAddress={item.owner}
            />
        </div>
    );
}
