import { useState, useEffect, useCallback } from 'react';
import { useWalletConnect } from '@btc-vision/walletconnect';
import { useToast } from '../../hooks/useToast.tsx';
import { marketplaceService } from '../../services/MarketplaceService.ts';
import { FormatUtils } from '../../utils/formatting.ts';

/* ── Types ───────────────────────────────────────────────── */

type CheckoutStep = 'review' | 'confirm' | 'processing' | 'confirming' | 'success' | 'error';

interface BuyModalProps {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly collectionAddress: string;
    readonly collectionName: string;
    readonly tokenId: bigint;
    readonly tokenName: string;
    readonly tokenImage: string | null;
    readonly priceBTC: string;
    readonly ownerAddress: string;
}

/* ── Helpers ─────────────────────────────────────────────── */

const MARKETPLACE_FEE_PCT = 2;
const CREATOR_ROYALTY_PCT = 5;

function parseBTC(btc: string): number {
    return parseFloat(btc) || 0;
}

function fmtBTC(n: number): string {
    if (n === 0) return '0';
    return n.toFixed(8).replace(/0+$/, '').replace(/\.$/, '');
}

/* ── Component ───────────────────────────────────────────── */

/**
 * Full checkout modal — MagicEden / OpenSea style.
 * Steps: Review → Confirm → Processing → Success / Error
 */
export function BuyModal({
    open,
    onClose,
    collectionAddress,
    collectionName,
    tokenId,
    tokenName,
    tokenImage,
    priceBTC,
    ownerAddress,
}: BuyModalProps): JSX.Element | null {
    const [step, setStep] = useState<CheckoutStep>('review');
    const [errorMsg, setErrorMsg] = useState('');
    const { walletBalance, address, walletAddress } = useWalletConnect();
    const { addToast } = useToast();

    // Reset every open
    useEffect(() => {
        if (open) { setStep('review'); setErrorMsg(''); }
    }, [open]);

    // Price breakdown
    const itemPrice = parseBTC(priceBTC);
    const marketFee = itemPrice * (MARKETPLACE_FEE_PCT / 100);
    const royalty   = itemPrice * (CREATOR_ROYALTY_PCT / 100);
    const total     = itemPrice + marketFee + royalty;

    // Balance — walletBalance.total is in sats
    const walletBTCSats = walletBalance ? Number(walletBalance.total) : 0;
    const walletBTC = walletBTCSats / 1e8;
    const hasFunds = walletBTC >= total;

    // Escape to close
    useEffect(() => {
        if (!open) return;
        function handleKey(e: KeyboardEvent): void {
            if (e.key === 'Escape' && step !== 'processing') onClose();
        }
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [open, step, onClose]);

    const handleConfirm = useCallback(async (): Promise<void> => {
        if (!address || !walletAddress) {
            addToast('error', 'Not Connected', 'Connect your wallet first.');
            return;
        }
        setStep('processing');
        try {
            const txHash = await marketplaceService.buyNFT(collectionAddress, tokenId, address, walletAddress);
            // Transaction broadcast — now wait for block confirmation
            setStep('confirming');
            await marketplaceService.waitForConfirmation(txHash);
            setStep('success');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Transaction failed';
            setErrorMsg(msg);
            setStep('error');
        }
    }, [collectionAddress, tokenId, address, walletAddress, addToast]);

    if (!open) return null;

    /* ── Step: Review ──────────────────────────────────── */

    function renderReview(): JSX.Element {
        return (
            <>
                {/* NFT Preview Card */}
                <div className="bm-preview">
                    {tokenImage ? (
                        <img src={tokenImage} alt={tokenName} className="bm-nft-img" />
                    ) : (
                        <div className="bm-nft-img bm-nft-placeholder">
                            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
                                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                        </div>
                    )}
                    <div className="bm-nft-info">
                        <span className="bm-collection-name">{collectionName}</span>
                        <span className="bm-nft-name">{tokenName}</span>
                        <span className="bm-nft-id">{FormatUtils.formatTokenId(tokenId)}</span>
                    </div>
                </div>

                <div className="bm-divider" />

                {/* Price Breakdown */}
                <div className="bm-breakdown">
                    <div className="bm-row">
                        <span>Item price</span>
                        <span className="bm-row-val">{fmtBTC(itemPrice)} BTC</span>
                    </div>
                    <div className="bm-row">
                        <span>Marketplace fee <span className="bm-pct">{MARKETPLACE_FEE_PCT}%</span></span>
                        <span className="bm-row-val">{fmtBTC(marketFee)} BTC</span>
                    </div>
                    <div className="bm-row">
                        <span>Creator royalty <span className="bm-pct">{CREATOR_ROYALTY_PCT}%</span></span>
                        <span className="bm-row-val">{fmtBTC(royalty)} BTC</span>
                    </div>
                    <div className="bm-divider" />
                    <div className="bm-row bm-total-row">
                        <span>Total</span>
                        <span className="bm-row-val">{fmtBTC(total)} BTC</span>
                    </div>
                </div>

                {/* Wallet Balance */}
                <div className={`bm-balance ${!hasFunds ? 'bm-balance-low' : ''}`}>
                    <div className="bm-row">
                        <span>Your balance</span>
                        <span className="bm-row-val">
                            {walletBTC > 0 ? `${fmtBTC(walletBTC)} BTC` : 'Not connected'}
                        </span>
                    </div>
                    {!hasFunds && walletBTC > 0 && (
                        <span className="bm-balance-warn">
                            Insufficient funds — need {fmtBTC(total - walletBTC)} more BTC
                        </span>
                    )}
                </div>

                {/* Seller */}
                <div className="bm-seller">
                    <span className="bm-seller-label">Seller</span>
                    <span className="bm-seller-addr" title={ownerAddress}>
                        {FormatUtils.formatAddress(ownerAddress)}
                    </span>
                </div>

                {/* CTA */}
                <button
                    className="bm-btn bm-btn-primary"
                    onClick={(): void => setStep('confirm')}
                    disabled={!hasFunds || walletBTC === 0}
                >
                    {walletBTC === 0
                        ? 'Connect Wallet First'
                        : !hasFunds
                            ? 'Insufficient Funds'
                            : 'Continue to Confirm'}
                </button>
            </>
        );
    }

    /* ── Step: Confirm ─────────────────────────────────── */

    function renderConfirm(): JSX.Element {
        return (
            <>
                <div className="bm-confirm-hero">
                    <div className="bm-confirm-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                            <path d="M12 9v4m0 4h.01" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="12" cy="12" r="9" stroke="var(--accent)" strokeWidth="1.5" />
                        </svg>
                    </div>
                    <h3 className="bm-confirm-title">Confirm Purchase</h3>
                    <p className="bm-confirm-desc">
                        You are about to buy <strong>{tokenName}</strong> from{' '}
                        <strong>{collectionName}</strong> for{' '}
                        <strong>{fmtBTC(total)} BTC</strong> (incl. fees).
                    </p>
                    <p className="bm-confirm-sub">
                        This action is irreversible. Your wallet will prompt for signature.
                    </p>
                </div>

                <div className="bm-mini-summary">
                    <div className="bm-row bm-total-row">
                        <span>Total</span>
                        <span className="bm-row-val bm-total-big">{fmtBTC(total)} BTC</span>
                    </div>
                </div>

                <div className="bm-actions-pair">
                    <button className="bm-btn bm-btn-secondary" onClick={(): void => setStep('review')}>
                        Back
                    </button>
                    <button
                        className="bm-btn bm-btn-primary"
                        onClick={(): void => { void handleConfirm(); }}
                    >
                        Confirm &amp; Pay
                    </button>
                </div>
            </>
        );
    }

    /* ── Step: Processing ──────────────────────────────── */

    function renderProcessing(): JSX.Element {
        return (
            <div className="bm-status">
                <div className="bm-spinner" />
                <h3 className="bm-status-title">Sending Transaction</h3>
                <p className="bm-status-desc">Approve the transaction in your wallet…</p>

                <div className="bm-steps">
                    <div className="bm-step bm-step-done">
                        <div className="bm-step-dot" />
                        <span>Review</span>
                    </div>
                    <div className="bm-step-line bm-step-line-done" />
                    <div className="bm-step bm-step-done">
                        <div className="bm-step-dot" />
                        <span>Confirm</span>
                    </div>
                    <div className="bm-step-line bm-step-line-active" />
                    <div className="bm-step bm-step-active">
                        <div className="bm-step-dot" />
                        <span>Sign</span>
                    </div>
                    <div className="bm-step-line" />
                    <div className="bm-step">
                        <div className="bm-step-dot" />
                        <span>Confirm on-chain</span>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Step: Confirming (waiting for block) ──────────── */

    function renderConfirming(): JSX.Element {
        return (
            <div className="bm-status">
                <div className="bm-spinner" />
                <h3 className="bm-status-title">Waiting for Block Confirmation</h3>
                <p className="bm-status-desc">Transaction broadcast successfully. Waiting for the next block to confirm…</p>

                <div className="bm-steps">
                    <div className="bm-step bm-step-done">
                        <div className="bm-step-dot" />
                        <span>Review</span>
                    </div>
                    <div className="bm-step-line bm-step-line-done" />
                    <div className="bm-step bm-step-done">
                        <div className="bm-step-dot" />
                        <span>Confirm</span>
                    </div>
                    <div className="bm-step-line bm-step-line-done" />
                    <div className="bm-step bm-step-done">
                        <div className="bm-step-dot" />
                        <span>Sign</span>
                    </div>
                    <div className="bm-step-line bm-step-line-active" />
                    <div className="bm-step bm-step-active">
                        <div className="bm-step-dot" />
                        <span>Confirm on-chain</span>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Step: Success ─────────────────────────────────── */

    function renderSuccess(): JSX.Element {
        return (
            <div className="bm-status">
                <div className="bm-success-icon">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="var(--success)" strokeWidth="1.5" />
                        <path d="M8 12l2.5 2.5L16 9" stroke="var(--success)" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h3 className="bm-status-title">Purchase Complete!</h3>
                <p className="bm-status-desc">
                    <strong>{tokenName}</strong> is now in your wallet.
                </p>
                <div className="bm-success-summary">
                    <div className="bm-row">
                        <span>Paid</span>
                        <span className="bm-row-val">{fmtBTC(total)} BTC</span>
                    </div>
                    <div className="bm-row">
                        <span>Collection</span>
                        <span className="bm-row-val">{collectionName}</span>
                    </div>
                </div>
                <button className="bm-btn bm-btn-primary" onClick={onClose}>Done</button>
            </div>
        );
    }

    /* ── Step: Error ───────────────────────────────────── */

    function renderError(): JSX.Element {
        return (
            <div className="bm-status">
                <div className="bm-error-icon">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="var(--error)" strokeWidth="1.5" />
                        <path d="M15 9l-6 6M9 9l6 6" stroke="var(--error)" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>
                <h3 className="bm-status-title">Transaction Failed</h3>
                <p className="bm-status-desc">{errorMsg || 'Something went wrong. Please try again.'}</p>
                <div className="bm-actions-pair">
                    <button className="bm-btn bm-btn-secondary" onClick={onClose}>Close</button>
                    <button className="bm-btn bm-btn-primary" onClick={(): void => setStep('review')}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    /* ── Render Shell ─────────────────────────────────── */

    function renderStep(): JSX.Element {
        switch (step) {
            case 'review':     return renderReview();
            case 'confirm':    return renderConfirm();
            case 'processing': return renderProcessing();
            case 'confirming': return renderConfirming();
            case 'success':    return renderSuccess();
            case 'error':      return renderError();
        }
    }

    const canClose = step !== 'processing' && step !== 'confirming';

    return (
        <div className="bm-backdrop" onClick={canClose ? onClose : undefined}>
            <div className="bm-panel" onClick={(e): void => e.stopPropagation()}>
                {/* Header */}
                <div className="bm-header">
                    <h2 className="bm-title">
                        {step === 'review' && 'Checkout'}
                        {step === 'confirm' && 'Confirm Purchase'}
                        {step === 'processing' && 'Signing'}
                        {step === 'confirming' && 'Confirming'}
                        {step === 'success' && 'Success'}
                        {step === 'error' && 'Error'}
                    </h2>
                    {canClose && (
                        <button className="bm-close" onClick={onClose} aria-label="Close">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor"
                                    strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Progress bar */}
                <div className="bm-progress">
                    <div className={`bm-progress-bar ${
                        step === 'review' ? 'bm-w33' :
                        step === 'confirm' ? 'bm-w50' :
                        step === 'processing' ? 'bm-w66' :
                        step === 'confirming' ? 'bm-w83' : 'bm-w100'
                    }`} />
                </div>

                {/* Body */}
                <div className="bm-body">
                    {renderStep()}
                </div>
            </div>
        </div>
    );
}
