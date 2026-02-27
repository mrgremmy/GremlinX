import { useState, useEffect, useCallback } from 'react';

const STORAGE_PREFIX = 'gremlinx_tos_';

export const TOS_MESSAGE =
    'Welcome to GremlinX!\n\n' +
    'By signing this message, you agree to the GremlinX Terms of Service ' +
    'and Privacy Policy.\n\n' +
    'This signature does not trigger a blockchain transaction or cost any gas.\n\n' +
    'Terms: /terms\n' +
    'Privacy: /privacy';

interface UseWalletSignatureResult {
    /** Whether the user has accepted TOS for this wallet. */
    readonly hasAccepted: boolean;
    /** Whether we are waiting for the user to sign. */
    readonly isPending: boolean;
    /** Record acceptance (call after user clicks "Sign & Accept"). */
    readonly accept: () => void;
    /** Reject — caller should disconnect wallet. */
    readonly reject: () => void;
}

/**
 * Manages TOS acceptance per wallet address via localStorage.
 *
 * NOTE: Uses localStorage consent flag for now.
 * When OP_WALLET exposes `signMessage()`, wire it here for
 * cryptographic signature verification.
 */
export function useWalletSignature(walletAddress: string | null): UseWalletSignatureResult {
    const [hasAccepted, setHasAccepted] = useState(false);
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        if (!walletAddress) {
            setHasAccepted(false);
            setIsPending(false);
            return;
        }
        const key = STORAGE_PREFIX + walletAddress.toLowerCase();
        const stored = localStorage.getItem(key);
        if (stored === 'true') {
            setHasAccepted(true);
        } else {
            setIsPending(true);
        }
    }, [walletAddress]);

    const accept = useCallback((): void => {
        if (!walletAddress) return;
        // TODO: Wire walletInstance.signMessage(TOS_MESSAGE) here
        // For now, store consent flag in localStorage
        const key = STORAGE_PREFIX + walletAddress.toLowerCase();
        localStorage.setItem(key, 'true');
        setHasAccepted(true);
        setIsPending(false);
    }, [walletAddress]);

    const reject = useCallback((): void => {
        setHasAccepted(false);
        setIsPending(false);
    }, []);

    return { hasAccepted, isPending, accept, reject };
}
