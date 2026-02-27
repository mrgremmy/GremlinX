import { Link, useNavigate } from 'react-router-dom';
import { WalletButton } from '../wallet/WalletButton.tsx';
import { SearchBar } from '../ui/SearchBar.tsx';

/** Sticky top navbar — logo, centered search, wallet. */
export function Navbar(): JSX.Element {
    const navigate = useNavigate();

    function handleSearch(query: string): void {
        void navigate(`/explore?q=${encodeURIComponent(query)}`);
    }

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                {/* Left: Logo */}
                <Link to="/" className="navbar-logo">
                    <span className="logo-gremlin">Gremlin</span>
                    <span className="logo-x">X</span>
                </Link>

                {/* Center: Search */}
                <div className="navbar-search">
                    <SearchBar onSearch={handleSearch} placeholder="Search collections or addresses..." />
                </div>

                {/* Right: Publish + Profile + Wallet */}
                <div className="navbar-right">
                    <Link to="/publish" className="navbar-publish-btn" title="Publish Collection">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span className="navbar-publish-text">Publish</span>
                    </Link>
                    <Link to="/profile" className="navbar-profile-btn" title="Profile">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </Link>
                    <WalletButton />
                </div>
            </div>
        </nav>
    );
}
