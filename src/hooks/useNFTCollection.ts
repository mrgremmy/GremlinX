import { useCallback, useEffect, useState } from 'react';
import { nftService } from '../services/NFTService.ts';
import type { CollectionInfo, NFTItem } from '../types/nft.ts';

interface UseNFTCollectionResult {
    readonly info: CollectionInfo | null;
    readonly items: readonly NFTItem[];
    readonly loading: boolean;
    readonly error: string | null;
    readonly refresh: () => void;
}

/**
 * Fetch collection info + NFT items for a given contract address.
 * Always queries the blockchain — no more demo/mock data.
 */
export function useNFTCollection(address: string | null): UseNFTCollectionResult {
    const [info, setInfo] = useState<CollectionInfo | null>(null);
    const [items, setItems] = useState<readonly NFTItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (): Promise<void> => {
        if (!address) return;
        setLoading(true);
        setError(null);

        try {
            const collectionInfo = await nftService.getCollectionInfo(address);
            setInfo(collectionInfo);

            const nftItems = await nftService.getCollectionNFTs(address, 50);
            setItems(nftItems);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to load collection';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [address]);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    return { info, items, loading, error, refresh: fetchData };
}
