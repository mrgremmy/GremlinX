/**
 * Mock featured collections for the homepage.
 * These are placeholder collections shown until real OP721 collections
 * are deployed on OPNet testnet. Replace with real data when available.
 */

export interface MockNFTItem {
    readonly id: string;
    readonly name: string;
    readonly image: string;
    readonly price: string;
    readonly lastSale?: string;
    readonly owner: string;
}

export interface MockCollection {
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
    readonly items: readonly MockNFTItem[];
}

/** Color-based gradient placeholders — no external image deps. */
function gradient(c1: string, c2: string, seed: number): string {
    const angle = (seed * 37) % 360;
    return `linear-gradient(${angle}deg, ${c1}, ${c2})`;
}

/** Generate a data URI SVG as a placeholder image. */
function placeholderSVG(bg1: string, bg2: string, text: string, seed: number): string {
    const angle = (seed * 47) % 360;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${angle})">
            <stop offset="0%" style="stop-color:${bg1}"/>
            <stop offset="100%" style="stop-color:${bg2}"/>
        </linearGradient></defs>
        <rect width="400" height="400" fill="url(#g)"/>
        <text x="200" y="210" text-anchor="middle" font-family="monospace" font-size="28" fill="rgba(255,255,255,0.7)">${text}</text>
    </svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function bannerSVG(bg1: string, bg2: string, text: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400" viewBox="0 0 1200 400">
        <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${bg1}"/>
            <stop offset="100%" style="stop-color:${bg2}"/>
        </linearGradient></defs>
        <rect width="1200" height="400" fill="url(#g)"/>
        <text x="600" y="210" text-anchor="middle" font-family="monospace" font-size="42" fill="rgba(255,255,255,0.6)">${text}</text>
    </svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const COLLECTIONS: MockCollection[] = [
    {
        address: '0x0000000000000000000000000000000000000001',
        name: 'Bitcoin Apes',
        symbol: 'BAPE',
        description: 'The first 10,000 ape-themed generative PFPs living natively on Bitcoin L1 through OPNet. No bridges, no wrapping — pure BTC.',
        banner: bannerSVG('#FF6B00', '#cc3300', 'BITCOIN APES'),
        icon: placeholderSVG('#FF6B00', '#cc3300', 'BAPE', 1),
        floorPrice: '0.025',
        totalVolume: '142.8',
        owners: 3842,
        totalSupply: 10000,
        change24h: 12.5,
        verified: true,
        items: Array.from({ length: 12 }, (_, i) => ({
            id: `bape-${i}`,
            name: `Bitcoin Ape #${i + 1}`,
            image: placeholderSVG('#FF6B00', '#991f00', `#${i + 1}`, i),
            price: (0.02 + Math.random() * 0.05).toFixed(4),
            lastSale: (0.018 + Math.random() * 0.04).toFixed(4),
            owner: `0x${(i + 1).toString(16).padStart(40, '0')}`,
        })),
    },
    {
        address: '0x0000000000000000000000000000000000000002',
        name: 'Satoshi Skulls',
        symbol: 'SKULL',
        description: 'Dark, hand-drawn 1/1 skull artwork collection. Each skull is unique. 5,000 total pieces inspired by cypherpunk aesthetics.',
        banner: bannerSVG('#8B00FF', '#2d004f', 'SATOSHI SKULLS'),
        icon: placeholderSVG('#8B00FF', '#2d004f', 'SKULL', 2),
        floorPrice: '0.018',
        totalVolume: '87.3',
        owners: 2156,
        totalSupply: 5000,
        change24h: -3.2,
        verified: true,
        items: Array.from({ length: 12 }, (_, i) => ({
            id: `skull-${i}`,
            name: `Skull #${i + 100}`,
            image: placeholderSVG('#8B00FF', '#1a002e', `#${i + 100}`, i + 50),
            price: (0.015 + Math.random() * 0.03).toFixed(4),
            lastSale: (0.012 + Math.random() * 0.025).toFixed(4),
            owner: `0x${(i + 100).toString(16).padStart(40, '0')}`,
        })),
    },
    {
        address: '0x0000000000000000000000000000000000000003',
        name: 'OPNet Punks',
        symbol: 'OPNK',
        description: 'Pixel-art punk avatars reimagined for the OPNet era. 8,888 punks with procedurally generated traits.',
        banner: bannerSVG('#00CED1', '#005f5f', 'OPNET PUNKS'),
        icon: placeholderSVG('#00CED1', '#005f5f', 'OPNK', 3),
        floorPrice: '0.042',
        totalVolume: '256.1',
        owners: 4521,
        totalSupply: 8888,
        change24h: 28.7,
        verified: true,
        items: Array.from({ length: 12 }, (_, i) => ({
            id: `opnk-${i}`,
            name: `OPNet Punk #${i + 200}`,
            image: placeholderSVG('#00CED1', '#003f3f', `#${i + 200}`, i + 100),
            price: (0.035 + Math.random() * 0.06).toFixed(4),
            lastSale: (0.030 + Math.random() * 0.05).toFixed(4),
            owner: `0x${(i + 200).toString(16).padStart(40, '0')}`,
        })),
    },
    {
        address: '0x0000000000000000000000000000000000000004',
        name: 'Chain Glyphs',
        symbol: 'GLYPH',
        description: 'Algorithmic on-chain art. Each glyph is a unique visual hash of a Bitcoin block. 2,100 total — one for each sat in 0.00002100 BTC.',
        banner: bannerSVG('#FFD700', '#8B6914', 'CHAIN GLYPHS'),
        icon: placeholderSVG('#FFD700', '#8B6914', 'GLYPH', 4),
        floorPrice: '0.088',
        totalVolume: '412.6',
        owners: 1890,
        totalSupply: 2100,
        change24h: 5.1,
        verified: true,
        items: Array.from({ length: 12 }, (_, i) => ({
            id: `glyph-${i}`,
            name: `Glyph #${i + 400}`,
            image: placeholderSVG('#FFD700', '#6B4F00', `#${i + 400}`, i + 200),
            price: (0.075 + Math.random() * 0.08).toFixed(4),
            lastSale: (0.065 + Math.random() * 0.07).toFixed(4),
            owner: `0x${(i + 400).toString(16).padStart(40, '0')}`,
        })),
    },
    {
        address: '0x0000000000000000000000000000000000000005',
        name: 'Taproot Tigers',
        symbol: 'TIGER',
        description: 'Fierce, vibrant tiger PFPs built with Tapscript tech. 6,666 total with 180+ traits. Roar on the blockchain.',
        banner: bannerSVG('#FF1493', '#8B0A50', 'TAPROOT TIGERS'),
        icon: placeholderSVG('#FF1493', '#8B0A50', 'TIGER', 5),
        floorPrice: '0.013',
        totalVolume: '34.2',
        owners: 1205,
        totalSupply: 6666,
        change24h: -8.4,
        verified: false,
        items: Array.from({ length: 12 }, (_, i) => ({
            id: `tiger-${i}`,
            name: `Tiger #${i + 500}`,
            image: placeholderSVG('#FF1493', '#5c0030', `#${i + 500}`, i + 300),
            price: (0.01 + Math.random() * 0.025).toFixed(4),
            owner: `0x${(i + 500).toString(16).padStart(40, '0')}`,
        })),
    },
    {
        address: '0x0000000000000000000000000000000000000006',
        name: 'Nakamoto Nodes',
        symbol: 'NODE',
        description: 'Abstract geometric art representing the beauty of distributed systems. Each node is 1/1 generative art seeded from block hashes.',
        banner: bannerSVG('#00FF88', '#006633', 'NAKAMOTO NODES'),
        icon: placeholderSVG('#00FF88', '#006633', 'NODE', 6),
        floorPrice: '0.055',
        totalVolume: '178.9',
        owners: 2834,
        totalSupply: 4444,
        change24h: 15.3,
        verified: true,
        items: Array.from({ length: 12 }, (_, i) => ({
            id: `node-${i}`,
            name: `Node #${i + 600}`,
            image: placeholderSVG('#00FF88', '#003d1f', `#${i + 600}`, i + 400),
            price: (0.045 + Math.random() * 0.06).toFixed(4),
            lastSale: (0.040 + Math.random() * 0.05).toFixed(4),
            owner: `0x${(i + 600).toString(16).padStart(40, '0')}`,
        })),
    },
];

export const MOCK_COLLECTIONS: readonly MockCollection[] = COLLECTIONS;

/** Platform-level mock stats. */
export const PLATFORM_STATS = {
    totalVolume: '1,112',
    collections: COLLECTIONS.length,
    totalNFTs: COLLECTIONS.reduce((sum, c) => sum + c.totalSupply, 0).toLocaleString(),
    uniqueOwners: '12,448',
} as const;

export { gradient };
