import { Link } from 'react-router-dom';

/** Minimal footer with legal links. */
export function Footer(): JSX.Element {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <span className="footer-brand">
                    <span className="logo-gremlin">Gremlin</span>
                    <span className="logo-x">X</span>
                </span>
                <span className="footer-tagline">Trade NFTs on Bitcoin. No bridges. No bullshit.</span>
                <div className="footer-links">
                    <Link to="/terms" className="footer-legal-link">Terms</Link>
                    <Link to="/privacy" className="footer-legal-link">Privacy</Link>
                </div>
                <span className="footer-copy">&copy; {new Date().getFullYear()} GremlinX</span>
            </div>
        </footer>
    );
}
