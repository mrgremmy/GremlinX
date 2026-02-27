import { useCallback, useEffect, useState } from 'react';
import { nftService } from '../services/NFTService.ts';
import { contractService } from '../services/ContractService.ts';
import type { NFTItem } from '../types/nft.ts';

interface UseUserNFTsResult {
    readonly items: readonly NFTItem[];
    readonly loading: boolean;
    readonly error: string | null;
    readonly refresh: () => void;
}

/**
 * Fetch all NFTs owned by a given address in a specific collection.
 */
export function useUserNFTs(
    collectionAddress: string | null,
    ownerAddress: string | null,
): UseUserNFTsResult {
    const [items, setItems] = useState<readonly NFTItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (): Promise<void> => {
        if (!collectionAddress || !ownerAddress) return;
        setLoading(true);
        setError(null);

        try {
            const tokenIds = await nftService.getOwnedTokens(collectionAddress, ownerAddress);
            const nft = contractService.getNFTContract(collectionAddress);

            const nftItems: NFTItem[] = [];
            for (const tokenId of tokenIds) {
                const item = await nftService.getNFTItem(nft, collectionAddress, tokenId);
                nftItems.push(item);
            }
            setItems(nftItems);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to load your NFTs';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [collectionAddress, ownerAddress]);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    return { items, loading, error, refresh: fetchData };
}
