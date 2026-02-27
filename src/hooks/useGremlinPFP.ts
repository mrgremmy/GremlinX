import { useState, useCallback, useEffect } from 'react';
import { getRandomAvatarId, getAvatarById, svgToDataURI, type GremlinAvatar } from '../data/gremlinAvatars.ts';

const STORAGE_PREFIX = 'gremlinx_pfp_';

interface UseGremlinPFPResult {
    readonly avatarId: string;
    readonly avatarDataURI: string;
    readonly avatar: GremlinAvatar | undefined;
    readonly selectAvatar: (id: string) => void;
}

/**
 * Manages gremlin PFP selection per wallet address.
 * Assigns a random avatar on first visit; persists in localStorage.
 */
export function useGremlinPFP(walletAddress: string | null): UseGremlinPFPResult {
    const [avatarId, setAvatarId] = useState<string>('orange');

    useEffect(() => {
        if (!walletAddress) return;
        const key = STORAGE_PREFIX + walletAddress.toLowerCase();
        const stored = localStorage.getItem(key);
        if (stored) {
            setAvatarId(stored);
        } else {
            const random = getRandomAvatarId(walletAddress);
            localStorage.setItem(key, random);
            setAvatarId(random);
        }
    }, [walletAddress]);

    const selectAvatar = useCallback(
        (id: string): void => {
            if (!walletAddress) return;
            const key = STORAGE_PREFIX + walletAddress.toLowerCase();
            localStorage.setItem(key, id);
            setAvatarId(id);
        },
        [walletAddress],
    );

    const avatar = getAvatarById(avatarId);
    const avatarDataURI = avatar ? svgToDataURI(avatar.svg) : '';

    return { avatarId, avatarDataURI, avatar, selectAvatar };
}
