/**
 * Demo collections for the GremlinX marketplace.
 * 3 collections with 20 items each, realistic traits, deterministic data.
 * These live entirely in the frontend — no chain calls needed.
 * Replace with real OP721 data when contracts are deployed.
 */

export interface DemoAttribute {
    readonly trait_type: string;
    readonly value: string;
}

export interface DemoNFTItem {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly image: string;
    readonly price?: string;
    readonly lastSale?: string;
    readonly owner: string;
    readonly attributes: readonly DemoAttribute[];
}

export interface DemoCollection {
    readonly address: string;
    readonly name: string;
    readonly symbol: string;
    readonly description: string;
    readonly banner: string;
    readonly icon: string;
    readonly floorPrice: string;
    readonly totalVolume: string;
    readonly owners: number;
    readonly totalSupply: number;
    readonly change24h: number;
    readonly verified: boolean;
    readonly items: readonly DemoNFTItem[];
}

/* ---- SVG placeholder helpers ---- */

function placeholderSVG(bg1: string, bg2: string, label: string, seed: number): string {
    const angle = (seed * 47 + 30) % 360;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
<defs><linearGradient id="g${seed}" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${angle})">
<stop offset="0%" style="stop-color:${bg1}"/><stop offset="100%" style="stop-color:${bg2}"/>
</linearGradient></defs>
<rect width="400" height="400" fill="url(#g${seed})"/>
<text x="200" y="210" text-anchor="middle" font-family="monospace" font-size="28" fill="rgba(255,255,255,0.7)">${label}</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function bannerSVG(bg1: string, bg2: string, label: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400" viewBox="0 0 1200 400">
<defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" style="stop-color:${bg1}"/><stop offset="100%" style="stop-color:${bg2}"/>
</linearGradient></defs>
<rect width="1200" height="400" fill="url(#bg)"/>
<text x="600" y="210" text-anchor="middle" font-family="monospace" font-size="42" fill="rgba(255,255,255,0.55)">${label}</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/* ---- Trait pools ---- */

const APE_TRAITS: Record<string, readonly string[]> = {
    Background: ['Jungle', 'Sunset', 'Night Sky', 'BTC Orange', 'Digital Rain'],
    Fur:        ['Brown', 'Golden', 'Dark', 'White', 'Zombie'],
    Eyes:       ['Normal', 'Laser', 'Sunglasses', '3D Glasses', 'Closed'],
    Mouth:      ['Grin', 'Cigar', 'Open', 'Diamond Teeth', 'Banana'],
    Hat:        ['Crown', 'Beanie', 'Cap', 'None', 'Pirate Hat'],
};

const PUNK_TRAITS: Record<string, readonly string[]> = {
    Background: ['Electric Blue', 'Neon Purple', 'Matrix Green', 'Blood Red', 'Solar Yellow'],
    Type:       ['Classic', 'Zombie', 'Ape', 'Alien', 'Robot'],
    Hair:       ['Mohawk', 'Beanie', 'Wild', 'Bald', 'Hoodie'],
    Eyes:       ['Normal', 'Shades', 'VR Headset', '3D Glasses', 'Cyclops'],
    Accessory:  ['Pipe', 'Earring', 'Gold Chain', 'None', 'Scar'],
};

const GLYPH_TRAITS: Record<string, readonly string[]> = {
    Pattern:    ['Spiral', 'Grid', 'Wave', 'Fractal', 'Lattice'],
    Palette:    ['Monochrome', 'Gold', 'Neon', 'Binary', 'Plasma'],
    Complexity: ['Simple', 'Medium', 'Complex', 'Chaotic', 'Minimal'],
    Origin:     ['Genesis Block', 'Halving', 'Random', 'Milestone', 'Mempool'],
};

/* ---- Demo wallet addresses ---- */
const DEMO_WALLETS = [
    'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297',
    'bc1p4qhjfg3r8n7s6y2kz4m5v0xw9lp2a3d6h8j0k4f7qtc5e9u3y2xzsvmw',
    'bc1p3rmf0ats5eg0j5gn5d0hdcws7f6r9gq5vxhp2k7yq3ce08n4gqsmt79dn',
    'bc1p9kz4x5mqf7h3j2r8d6l0y4vp3a2s5t7w9c1f6g8e0qn2d4m7k3xpgv8s',
    'bc1p2w6q9m3f5k7j1h4r8d0l6y3v7p5a9s2t4w8c1f3g6e0n2d5m8kxrjtu2',
];

/* ---- Item generator ---- */

function generateItems(
    prefix: string,
    slug: string,
    startNum: number,
    count: number,
    c1: string,
    c2: string,
    basePrice: number,
    step: number,
    traits: Record<string, readonly string[]>,
): DemoNFTItem[] {
    const traitTypes = Object.keys(traits);
    return Array.from({ length: count }, (_, i) => {
        const attrs: DemoAttribute[] = traitTypes.map((type, ti) => ({
            trait_type: type,
            value: traits[type][(i + ti) % traits[type].length],
        }));
        const num = startNum + i;
        const name = `${prefix} #${num}`;
        // ~40% of items are "listed" (have a price)
        const isListed = i % 5 < 2;
        return {
            id: `${slug}-${i}`,
            name,
            description: `${name} — ${attrs.map((a) => a.value).join(', ')}.`,
            image: placeholderSVG(c1, c2, `#${num}`, i + startNum),
            price: isListed ? (basePrice + i * step).toFixed(4) : undefined,
            lastSale: i % 3 !== 0 ? (basePrice * 0.85 + i * step * 0.8).toFixed(4) : undefined,
            owner: DEMO_WALLETS[i % DEMO_WALLETS.length],
            attributes: attrs,
        };
    });
}

/* ---- 3 demo collections ---- */

const COLLECTIONS: DemoCollection[] = [
    {
        address: 'bc1p-demo-bitcoin-apes-collection-0001',
        name: 'Bitcoin Apes',
        symbol: 'BAPE',
        description:
            'Ape-themed generative PFPs living natively on Bitcoin L1 through OPNet. ' +
            'No bridges, no wrapping — pure BTC. Each ape is procedurally generated from 200+ traits.',
        banner: bannerSVG('#FF6B00', '#cc3300', 'BITCOIN APES'),
        icon: placeholderSVG('#FF6B00', '#cc3300', 'BAPE', 999),
        floorPrice: '0.025',
        totalVolume: '12.4',
        owners: 8,
        totalSupply: 20,
        change24h: 12.5,
        verified: true,
        items: generateItems('Bitcoin Ape', 'bape', 1, 20, '#FF6B00', '#991f00', 0.025, 0.004, APE_TRAITS),
    },
    {
        address: 'bc1p-demo-opnet-punks-collection-0002',
        name: 'OPNet Punks',
        symbol: 'OPNK',
        description:
            'Pixel-art punk avatars reimagined for the OPNet era. Procedurally generated punks ' +
            'living on Bitcoin L1. A nod to CryptoPunks, built for the OPNet future.',
        banner: bannerSVG('#00CED1', '#005f5f', 'OPNET PUNKS'),
        icon: placeholderSVG('#00CED1', '#005f5f', 'OPNK', 998),
        floorPrice: '0.042',
        totalVolume: '18.7',
        owners: 6,
        totalSupply: 20,
        change24h: 28.7,
        verified: true,
        items: generateItems('OPNet Punk', 'opnk', 200, 20, '#00CED1', '#003f3f', 0.042, 0.005, PUNK_TRAITS),
    },
    {
        address: 'bc1p-demo-chain-glyphs-collection-0003',
        name: 'Chain Glyphs',
        symbol: 'GLYPH',
        description:
            'Algorithmic on-chain art. Each glyph is a unique visual hash of a Bitcoin block. ' +
            '20 total — generative, immutable, beautiful.',
        banner: bannerSVG('#FFD700', '#8B6914', 'CHAIN GLYPHS'),
        icon: placeholderSVG('#FFD700', '#8B6914', 'GLYPH', 997),
        floorPrice: '0.088',
        totalVolume: '22.1',
        owners: 5,
        totalSupply: 20,
        change24h: 5.1,
        verified: true,
        items: generateItems('Glyph', 'glyph', 400, 20, '#FFD700', '#6B4F00', 0.088, 0.006, GLYPH_TRAITS),
    },
];

export const DEMO_COLLECTIONS: readonly DemoCollection[] = COLLECTIONS;

/** Platform-level stats. */
export const DEMO_STATS = {
    totalVolume: '53.2',
    collections: COLLECTIONS.length.toString(),
    totalNFTs: COLLECTIONS.reduce((sum, c) => sum + c.totalSupply, 0).toString(),
    uniqueOwners: '15',
} as const;

/** Look up a demo collection by its address. */
export function findDemoCollection(address: string): DemoCollection | undefined {
    return COLLECTIONS.find((c) => c.address === address);
}

/** Look up a specific NFT item within a demo collection. */
export function findDemoItem(
    collectionAddress: string,
    tokenIndex: number,
): DemoNFTItem | undefined {
    const col = findDemoCollection(collectionAddress);
    if (!col) return undefined;
    return col.items[tokenIndex];
}
