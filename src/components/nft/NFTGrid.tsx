import type { NFTItem } from '../../types/nft.ts';
import { NFTCard } from './NFTCard.tsx';
import { Skeleton } from '../ui/Skeleton.tsx';
import { EmptyState, GalleryIcon } from '../ui/EmptyState.tsx';

interface NFTGridProps {
    readonly items: readonly NFTItem[];
    readonly loading: boolean;
    readonly collectionName?: string;
    readonly listingPrices?: Map<string, bigint>;
    readonly onSelect: (item: NFTItem) => void;
}

/** Responsive NFT card grid with loading skeletons. */
export function NFTGrid({ items, loading, collectionName, listingPrices, onSelect }: NFTGridProps): JSX.Element {
    if (loading) {
        return (
            <div className="nft-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="nft-card-skeleton">
                        <Skeleton className="nft-image-skeleton" />
                        <Skeleton className="nft-text-skeleton" />
                        <Skeleton className="nft-text-skeleton short" />
                    </div>
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <EmptyState
                icon={<GalleryIcon />}
                heading="No NFTs Found"
                description="This collection doesn't have any items yet, or they haven't been indexed."
                actionLabel="Explore Collections"
                actionHref="/explore"
            />
        );
    }

    return (
        <div className="nft-grid">
            {items.map((item) => (
                <NFTCard
                    key={`${item.collectionAddress}:${item.tokenId}`}
                    item={item}
                    collectionName={collectionName}
                    priceSats={listingPrices?.get(item.tokenId.toString())
                        ?? listingPrices?.get(`${item.collectionAddress}:${item.tokenId}`)}
                    onClick={(): void => onSelect(item)}
                />
            ))}
        </div>
    );
}
