import type { NFTAttribute } from '../../types/nft.ts';

interface NFTTraitsProps {
    readonly attributes: readonly NFTAttribute[];
}

/** Grid of trait badges. */
export function NFTTraits({ attributes }: NFTTraitsProps): JSX.Element {
    if (attributes.length === 0) {
        return <p className="text-secondary">No traits available</p>;
    }

    return (
        <div className="trait-grid">
            {attributes.map((attr, i) => (
                <div key={i} className="trait-card">
                    <span className="trait-type">{attr.trait_type}</span>
                    <span className="trait-value">{attr.value}</span>
                </div>
            ))}
        </div>
    );
}
