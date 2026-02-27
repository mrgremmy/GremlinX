import { useState } from 'react';
import { useWalletConnect } from '@btc-vision/walletconnect';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';
import { useToast } from '../../hooks/useToast.tsx';
import { marketplaceService } from '../../services/MarketplaceService.ts';
import { FormatUtils } from '../../utils/formatting.ts';

interface ListingModalProps {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly collectionAddress: string;
    readonly tokenId: bigint;
}

/** Modal to list an NFT for sale. Sends an on-chain listing transaction. */
export function ListingModal({
    open,
    onClose,
    collectionAddress,
    tokenId,
}: ListingModalProps): JSX.Element {
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'approving' | 'approve-confirming' | 'signing' | 'confirming'>('idle');
    const { addToast } = useToast();
    const { address, walletAddress } = useWalletConnect();

    async function handleList(): Promise<void> {
        if (!price || parseFloat(price) <= 0) {
            addToast('error', 'Invalid Price', 'Please enter a valid BTC price.');
            return;
        }

        if (!address || !walletAddress) {
            addToast('error', 'Not Connected', 'Connect your wallet first.');
            return;
        }

        setLoading(true);
        try {
            // Step 1: Approve marketplace to transfer this NFT
            setStatus('approving');
            const approveTxHash = await marketplaceService.approveForMarketplace(
                collectionAddress,
                tokenId,
                address,
                walletAddress,
            );

            // Wait for approval confirmation
            setStatus('approve-confirming');
            await marketplaceService.waitForConfirmation(approveTxHash);

            // Step 2: List the NFT on marketplace
            setStatus('signing');
            const sats = FormatUtils.btcToSats(price);
            const txHash = await marketplaceService.listForSale(
                collectionAddress,
                tokenId,
                sats,
                address,       // Address object for setSender
                walletAddress, // bech32 string for refundTo
            );
            // Transaction broadcast — now wait for block confirmation
            setStatus('confirming');
            await marketplaceService.waitForConfirmation(txHash);
            addToast('success', 'Listed!', `NFT listed for ${price} BTC — confirmed on-chain!`);
            onClose();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Could not list NFT.';
            addToast('error', 'Failed', msg);
        } finally {
            setLoading(false);
            setStatus('idle');
        }
    }

    return (
        <Modal open={open} onClose={onClose} title="List for Sale">
            <div className="modal-form">
                <label className="form-label">Price (BTC)</label>
                <input
                    type="text"
                    className="form-input"
                    value={price}
                    onChange={(e): void => setPrice(e.target.value)}
                    placeholder="0.001"
                />
                <Button
                    onClick={(): void => {
                        void handleList();
                    }}
                    disabled={loading || !price}
                >
                    {status === 'confirming'
                        ? 'Confirming listing on-chain…'
                        : status === 'signing'
                            ? 'Approve listing in wallet…'
                            : status === 'approve-confirming'
                                ? 'Confirming approval on-chain…'
                                : status === 'approving'
                                    ? 'Approve NFT transfer in wallet…'
                                    : 'Confirm Listing'}
                </Button>
            </div>
        </Modal>
    );
}
