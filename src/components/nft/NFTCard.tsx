import { useState } from 'react';
import type { NFTItem } from '../../types/nft.ts';
import { FormatUtils } from '../../utils/formatting.ts';
import { Skeleton } from '../ui/Skeleton.tsx';

interface NFTImageProps {
    readonly src: string | undefined;
    readonly alt: string;
}

/** Lazy-loading NFT image with skeleton fallback. */
function NFTImage({ src, alt }: NFTImageProps): JSX.Element {
    const [loaded, setLoaded] = useState(false);
    const [errored, setErrored] = useState(false);

    if (!src || errored) {
        return (
            <div className="nft-image-placeholder">
                <span>No Image</span>
            </div>
        );
    }

    return (
        <div className="nft-image-wrapper">
            {!loaded && <Skeleton className="nft-image-skeleton" />}
            <img
                src={src}
                alt={alt}
                className={`nft-image ${loaded ? 'loaded' : 'loading'}`}
                onLoad={(): void => setLoaded(true)}
                onError={(): void => setErrored(true)}
                loading="lazy"
            />
        </div>
    );
}

interface NFTCardProps {
    readonly item: NFTItem;
    readonly collectionName?: string;
    readonly priceSats?: bigint;
    readonly onClick: () => void;
}

/** Single NFT card in the marketplace grid. */
export function NFTCard({ item, collectionName, priceSats, onClick }: NFTCardProps): JSX.Element {
    const name = item.metadata?.name ?? FormatUtils.formatTokenId(item.tokenId);
    // Prefer priceSats prop; fall back to metadata price string
    const priceDisplay = priceSats !== undefined && priceSats > 0n
        ? `${FormatUtils.satsToBTC(priceSats)} BTC`
        : item.metadata?.price
            ? `${item.metadata.price} BTC`
            : null;

    return (
        <div className="nft-card" onClick={onClick} role="button" tabIndex={0}>
            <NFTImage src={item.metadata?.image} alt={name} />
            <div className="nft-card-body">
                {collectionName && <span className="nft-card-collection">{collectionName}</span>}
                <span className="nft-card-name">{name}</span>
                <span className="nft-card-id">{FormatUtils.formatTokenId(item.tokenId)}</span>
                <div className="nft-card-footer">
                    <span className="nft-card-owner">
                        {FormatUtils.formatAddress(item.owner, 4)}
                    </span>
                    {priceDisplay && (
                        <span className="nft-card-price">{priceDisplay}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
