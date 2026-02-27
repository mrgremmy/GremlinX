import { useCallback, useEffect, useState } from 'react';
import { nftService } from '../services/NFTService.ts';
import { contractService } from '../services/ContractService.ts';
import type { NFTItem } from '../types/nft.ts';

interface UseNFTDetailResult {
    readonly item: NFTItem | null;
    readonly loading: boolean;
    readonly error: string | null;
    readonly refresh: () => void;
}

/**
 * Fetch detailed data for a single NFT.
 * Always queries the blockchain — no more demo/mock data.
 */
export function useNFTDetail(
    collectionAddress: string | null,
    tokenId: bigint | null,
): UseNFTDetailResult {
    const [item, setItem] = useState<NFTItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (): Promise<void> => {
        if (!collectionAddress || tokenId === null) return;
        setLoading(true);
        setError(null);

        try {
            const nft = contractService.getNFTContract(collectionAddress);
            const result = await nftService.getNFTItem(nft, collectionAddress, tokenId);
            setItem(result);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to load NFT';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [collectionAddress, tokenId]);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    return { item, loading, error, refresh: fetchData };
}
