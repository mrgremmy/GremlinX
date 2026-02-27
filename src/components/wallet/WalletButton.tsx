import { useWalletConnect, SupportedWallets } from '@btc-vision/walletconnect';
import { FormatUtils } from '../../utils/formatting.ts';

/** Wallet connect / disconnect button in the navbar. */
export function WalletButton(): JSX.Element {
    const { walletAddress, connecting, walletBalance, network, connectToWallet, disconnect } =
        useWalletConnect();

    function handleConnect(): void {
        connectToWallet(SupportedWallets.OP_WALLET);
    }

    if (connecting) {
        return <button className="btn btn-primary btn-sm" disabled>Connecting...</button>;
    }

    if (walletAddress) {
        const btc = walletBalance ? FormatUtils.satsToBTC(BigInt(walletBalance.total)) : '0';
        const net = network?.network ?? 'unknown';

        return (
            <div className="wallet-pill">
                {net === 'testnet' && <span className="wallet-pill-net">Testnet</span>}
                <span className="wallet-pill-bal">{btc} BTC</span>
                <span className="wallet-pill-sep" />
                <span className="wallet-pill-addr">{FormatUtils.formatAddress(walletAddress, 5)}</span>
                <button className="wallet-pill-disconnect" onClick={disconnect} title="Disconnect">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                </button>
            </div>
        );
    }

    return (
        <button className="btn btn-primary btn-sm" onClick={handleConnect}>
            Connect Wallet
        </button>
    );
}
