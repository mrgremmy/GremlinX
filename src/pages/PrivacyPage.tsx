import { Link } from 'react-router-dom';

/** Privacy Policy page — /privacy */
export function PrivacyPage(): JSX.Element {
    return (
        <div className="legal-page">
            <h1>Privacy Policy</h1>
            <p className="legal-updated">Last updated: February 27, 2026</p>

            <section>
                <h2>1. Introduction</h2>
                <p>
                    GremlinX (&quot;the Platform,&quot; &quot;we,&quot; &quot;us&quot;) is a
                    decentralized NFT marketplace on Bitcoin via OPNet. We are committed to
                    protecting your privacy. This policy explains what data we collect, how we
                    use it, and your rights.
                </p>
            </section>

            <section>
                <h2>2. Data We Collect</h2>
                <p>Because GremlinX is a non-custodial, wallet-based platform, we collect very little data:</p>
                <ul>
                    <li>
                        <strong>Wallet addresses</strong> — Your public wallet address is visible
                        on the blockchain and is used to display your profile and transaction
                        history. This is inherently public blockchain data.
                    </li>
                    <li>
                        <strong>Transaction history</strong> — All NFT purchases, sales, and
                        listings are recorded on the Bitcoin blockchain and are publicly visible.
                        We index this data to display marketplace activity.
                    </li>
                    <li>
                        <strong>Local preferences</strong> — Avatar selection, TOS acceptance
                        status, and UI preferences are stored in your browser&apos;s localStorage.
                        This data never leaves your device.
                    </li>
                    <li>
                        <strong>Analytics (if enabled)</strong> — We may use privacy-respecting
                        analytics to understand usage patterns (page views, feature usage). This
                        data is aggregated and anonymized.
                    </li>
                </ul>
            </section>

            <section>
                <h2>3. Data We Do NOT Collect</h2>
                <p>GremlinX does not and will not:</p>
                <ul>
                    <li>Require or store personal information (name, email, phone number)</li>
                    <li>Perform KYC (Know Your Customer) verification</li>
                    <li>Store private keys, seed phrases, or wallet passwords</li>
                    <li>Track your activity across other websites</li>
                    <li>Sell, rent, or share your data with third parties for advertising</li>
                </ul>
            </section>

            <section>
                <h2>4. Cookies &amp; Local Storage</h2>
                <p>
                    GremlinX uses browser localStorage to persist your preferences (avatar
                    choice, TOS acceptance). We do not use tracking cookies. If analytics are
                    enabled, they may use first-party cookies strictly for aggregated usage
                    statistics. You can clear all stored data at any time through your
                    browser&apos;s settings.
                </p>
            </section>

            <section>
                <h2>5. Third-Party Services</h2>
                <p>GremlinX may interact with the following third-party services:</p>
                <ul>
                    <li>
                        <strong>OPNet RPC nodes</strong> — To fetch blockchain data
                        (collection info, token ownership, transaction status).
                    </li>
                    <li>
                        <strong>IPFS gateways</strong> — To resolve NFT metadata and images
                        stored on the InterPlanetary File System.
                    </li>
                    <li>
                        <strong>OP_WALLET browser extension</strong> — For wallet connection,
                        transaction signing, and balance queries. The wallet extension operates
                        independently under its own privacy policy.
                    </li>
                </ul>
                <p>
                    We do not control these third-party services and recommend reviewing their
                    respective privacy policies.
                </p>
            </section>

            <section>
                <h2>6. Your Rights</h2>
                <p>
                    Even though GremlinX collects minimal data, we respect your data rights in
                    the spirit of GDPR and similar frameworks:
                </p>
                <ul>
                    <li>
                        <strong>Right to Access</strong> — You can view all data associated with
                        your wallet address directly on the blockchain and in your browser&apos;s
                        localStorage.
                    </li>
                    <li>
                        <strong>Right to Deletion</strong> — Clear your browser&apos;s localStorage
                        to remove all locally stored preferences. On-chain data (transactions,
                        token ownership) is immutable by nature of blockchain technology.
                    </li>
                    <li>
                        <strong>Right to Portability</strong> — Your NFTs and transaction history
                        are on a public blockchain and can be accessed by any compatible tool
                        or service.
                    </li>
                    <li>
                        <strong>Right to Opt Out</strong> — You may disconnect your wallet at
                        any time to stop interacting with the Platform.
                    </li>
                </ul>
            </section>

            <section>
                <h2>7. Data Security</h2>
                <p>
                    GremlinX is a client-side application. Your wallet interactions happen
                    directly between your browser and the blockchain. We do not operate
                    centralized servers that store user data. The Platform&apos;s security relies
                    on the Bitcoin blockchain&apos;s cryptographic guarantees and the security of
                    your wallet extension.
                </p>
            </section>

            <section>
                <h2>8. Changes to This Policy</h2>
                <p>
                    We may update this Privacy Policy from time to time. Changes will be posted
                    on this page with an updated &quot;Last updated&quot; date. Your continued
                    use of GremlinX after changes constitutes acceptance.
                </p>
            </section>

            <section>
                <h2>9. Contact</h2>
                <p>
                    For privacy-related questions or concerns, reach out via the GremlinX
                    community channels or open an issue on the project&apos;s repository.
                </p>
            </section>

            <p className="legal-footer-link">
                See also: <Link to="/terms">Terms of Service</Link>
            </p>
        </div>
    );
}
