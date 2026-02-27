import { Outlet } from 'react-router-dom';
import { useWalletConnect } from '@btc-vision/walletconnect';
import { Navbar } from './Navbar.tsx';
import { Footer } from './Footer.tsx';
import { ToastContainer } from '../ui/Toast.tsx';
import { useWalletSignature, TOS_MESSAGE } from '../../hooks/useWalletSignature.ts';

/** App shell — navbar + signature gate + page content + footer + toast layer. */
export function Layout(): JSX.Element {
    const { walletAddress, disconnect } = useWalletConnect();
    const { hasAccepted, isPending, accept, reject } = useWalletSignature(walletAddress ?? null);

    const showGate = Boolean(walletAddress) && isPending && !hasAccepted;

    function handleReject(): void {
        reject();
        disconnect();
    }

    return (
        <div className="app-layout">
            <Navbar />
            <main className="main-content">
                <Outlet />
            </main>
            <Footer />
            <ToastContainer />

            {/* Signature Gate Overlay */}
            {showGate && (
                <div className="signature-overlay">
                    <div className="signature-modal">
                        <h2>Welcome to GremlinX</h2>
                        <pre className="signature-message">{TOS_MESSAGE}</pre>
                        <p className="signature-note">
                            This does not trigger a transaction or cost any gas.
                        </p>
                        <div className="signature-actions">
                            <button
                                className="btn btn-primary btn-md"
                                onClick={accept}
                            >
                                Sign &amp; Accept
                            </button>
                            <button
                                className="btn btn-ghost btn-md"
                                onClick={handleReject}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
