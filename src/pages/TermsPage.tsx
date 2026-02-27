import { Link } from 'react-router-dom';

/** Terms of Service page — /terms */
export function TermsPage(): JSX.Element {
    return (
        <div className="legal-page">
            <h1>Terms of Service</h1>
            <p className="legal-updated">Last updated: February 27, 2026</p>

            <section>
                <h2>1. Platform Description</h2>
                <p>
                    GremlinX (&quot;the Platform&quot;) is a decentralized NFT marketplace built on
                    OPNet, a Bitcoin Layer 1 smart contract platform. GremlinX facilitates the
                    buying, selling, and trading of OP721 non-fungible tokens (NFTs) that exist
                    natively on the Bitcoin blockchain. All transactions settle directly on
                    Bitcoin — no bridges, no wrapping, no intermediaries.
                </p>
            </section>

            <section>
                <h2>2. User Eligibility</h2>
                <p>
                    By using GremlinX, you represent and warrant that you are at least 18 years
                    of age (or the age of majority in your jurisdiction), that you are not
                    located in, or a citizen or resident of, any jurisdiction subject to
                    comprehensive sanctions (including but not limited to North Korea, Iran,
                    Syria, Cuba, and the Crimea, Donetsk, or Luhansk regions), and that your
                    use of the Platform does not violate any applicable law or regulation.
                </p>
            </section>

            <section>
                <h2>3. Wallet Responsibility</h2>
                <p>
                    GremlinX is a non-custodial platform. You are solely responsible for the
                    security and management of your wallet, private keys, and seed phrases. The
                    Platform never has access to, stores, or controls your private keys or
                    funds. If you lose access to your wallet, GremlinX cannot recover your
                    assets. You acknowledge that blockchain transactions are irreversible and
                    that you bear full responsibility for all transactions initiated from your
                    wallet.
                </p>
            </section>

            <section>
                <h2>4. NFT Ownership &amp; Intellectual Property</h2>
                <p>
                    GremlinX facilitates the trading of NFTs but does not create, endorse, or
                    guarantee the intellectual property rights associated with any NFT content.
                    Purchasing an NFT grants you ownership of the on-chain token; it does not
                    necessarily grant copyright, trademark, or other IP rights to the underlying
                    artwork or media unless explicitly stated by the NFT creator. You agree not
                    to list, sell, or promote NFTs that contain stolen artwork, copyrighted
                    material used without permission, or content that violates any third-party
                    rights.
                </p>
            </section>

            <section>
                <h2>5. Fees &amp; Payments</h2>
                <p>
                    GremlinX may charge a marketplace fee on completed transactions. The current
                    fee structure is displayed at the time of each transaction. All fees are
                    collected on-chain and are non-refundable. In addition to marketplace fees,
                    you are responsible for any Bitcoin network transaction fees (gas) required
                    to execute on-chain operations. All payments are made in BTC. The Platform
                    does not accept fiat currency.
                </p>
            </section>

            <section>
                <h2>6. Prohibited Conduct</h2>
                <p>You agree not to:</p>
                <ul>
                    <li>Engage in wash trading, market manipulation, or artificial volume inflation</li>
                    <li>List or trade stolen NFTs or assets obtained through fraud</li>
                    <li>Upload, list, or promote illegal, harmful, hateful, or obscene content</li>
                    <li>Attempt to exploit, hack, or interfere with the Platform&apos;s smart contracts or infrastructure</li>
                    <li>Use the Platform for money laundering, terrorist financing, or any other illegal activity</li>
                    <li>Impersonate other users, collections, or entities</li>
                    <li>Circumvent any access restrictions or security measures</li>
                </ul>
                <p>
                    GremlinX reserves the right to delist collections, restrict access, or take
                    other action against users who violate these terms.
                </p>
            </section>

            <section>
                <h2>7. Limitation of Liability</h2>
                <p>
                    The Platform is provided on an &quot;as-is&quot; and &quot;as-available&quot;
                    basis without warranties of any kind, express or implied. GremlinX does not
                    warrant that the Platform will be uninterrupted, error-free, or secure, or
                    that any smart contract will function as intended. To the maximum extent
                    permitted by law, GremlinX shall not be liable for any indirect, incidental,
                    special, consequential, or punitive damages, including but not limited to
                    loss of funds, loss of NFTs, loss of data, or loss of profits, arising from
                    your use of the Platform, smart contract bugs, blockchain failures, or
                    third-party actions.
                </p>
            </section>

            <section>
                <h2>8. Dispute Resolution</h2>
                <p>
                    Any disputes arising from or relating to these Terms shall first be
                    attempted to be resolved through good-faith negotiation. If negotiation
                    fails, disputes shall be resolved through binding arbitration in accordance
                    with the rules of an internationally recognized arbitration body. Class
                    actions and class arbitrations are not permitted. You agree to resolve
                    disputes on an individual basis only.
                </p>
            </section>

            <section>
                <h2>9. Modification of Terms</h2>
                <p>
                    GremlinX reserves the right to modify, update, or replace these Terms at
                    any time. Changes will be effective upon posting to the Platform. Your
                    continued use of GremlinX after changes are posted constitutes acceptance
                    of the modified Terms. We encourage you to review these Terms periodically.
                </p>
            </section>

            <section>
                <h2>10. Governing Law</h2>
                <p>
                    These Terms shall be governed by and construed in accordance with the laws
                    of the jurisdiction in which GremlinX is incorporated, without regard to
                    conflict of law principles. You consent to the exclusive jurisdiction of
                    the courts in that jurisdiction for any legal proceedings arising from
                    these Terms.
                </p>
            </section>

            <section>
                <h2>11. Contact</h2>
                <p>
                    For questions about these Terms, reach out via the GremlinX community
                    channels or open an issue on the project&apos;s repository.
                </p>
            </section>

            <p className="legal-footer-link">
                See also: <Link to="/privacy">Privacy Policy</Link>
            </p>
        </div>
    );
}
