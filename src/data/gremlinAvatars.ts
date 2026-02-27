/**
 * 10 gremlin avatar SVGs in different colors.
 * Used as default profile pictures for GremlinX users.
 */

export interface GremlinAvatar {
    readonly id: string;
    readonly name: string;
    readonly svg: string;
}

function gremlin(body: string, dark: string, glow: string): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
<rect width="200" height="200" rx="24" fill="#0a0a0f"/>
<circle cx="100" cy="115" r="55" fill="${body}" opacity="0.12"/>
<ellipse cx="100" cy="116" rx="54" ry="56" fill="${body}"/>
<path d="M48,84 L28,32 L68,68 Z" fill="${dark}"/>
<path d="M152,84 L172,32 L132,68 Z" fill="${dark}"/>
<path d="M50,82 L32,38 L66,68 Z" fill="${body}" opacity="0.6"/>
<path d="M150,82 L168,38 L134,68 Z" fill="${body}" opacity="0.6"/>
<ellipse cx="74" cy="108" rx="16" ry="18" fill="#e8e8ed"/>
<ellipse cx="126" cy="108" rx="16" ry="18" fill="#e8e8ed"/>
<circle cx="78" cy="108" r="9" fill="#1a1a25"/>
<circle cx="130" cy="108" r="9" fill="#1a1a25"/>
<circle cx="81" cy="104" r="3.5" fill="${glow}"/>
<circle cx="133" cy="104" r="3.5" fill="${glow}"/>
<path d="M60,92 Q74,83 88,93" stroke="${dark}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<path d="M112,93 Q126,83 140,92" stroke="${dark}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<ellipse cx="100" cy="126" rx="5" ry="3" fill="${dark}"/>
<path d="M68,140 Q100,168 132,140" stroke="#1a1a25" stroke-width="2.5" fill="${dark}" opacity="0.35" stroke-linecap="round"/>
<rect x="78" y="139" width="7" height="8" rx="1.5" fill="#e8e8ed"/>
<rect x="88" y="139" width="7" height="8" rx="1.5" fill="#e8e8ed"/>
<rect x="98" y="139" width="7" height="8" rx="1.5" fill="#e8e8ed"/>
<rect x="108" y="139" width="7" height="8" rx="1.5" fill="#e8e8ed"/>
<rect x="118" y="139" width="7" height="8" rx="1.5" fill="#e8e8ed"/>
</svg>`;
}

function holoGremlin(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
<defs><linearGradient id="holo" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" stop-color="#ff6b00"/><stop offset="20%" stop-color="#ff1493"/>
<stop offset="40%" stop-color="#8b00ff"/><stop offset="60%" stop-color="#00ced1"/>
<stop offset="80%" stop-color="#00ff88"/><stop offset="100%" stop-color="#ffd700"/>
</linearGradient></defs>
<rect width="200" height="200" rx="24" fill="#0a0a0f"/>
<circle cx="100" cy="115" r="55" fill="url(#holo)" opacity="0.12"/>
<ellipse cx="100" cy="116" rx="54" ry="56" fill="url(#holo)"/>
<path d="M48,84 L28,32 L68,68 Z" fill="url(#holo)" opacity="0.7"/>
<path d="M152,84 L172,32 L132,68 Z" fill="url(#holo)" opacity="0.7"/>
<ellipse cx="74" cy="108" rx="16" ry="18" fill="#e8e8ed"/>
<ellipse cx="126" cy="108" rx="16" ry="18" fill="#e8e8ed"/>
<circle cx="78" cy="108" r="9" fill="#1a1a25"/>
<circle cx="130" cy="108" r="9" fill="#1a1a25"/>
<circle cx="81" cy="104" r="3.5" fill="#fff"/>
<circle cx="133" cy="104" r="3.5" fill="#fff"/>
<path d="M60,92 Q74,83 88,93" stroke="#555" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<path d="M112,93 Q126,83 140,92" stroke="#555" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<ellipse cx="100" cy="126" rx="5" ry="3" fill="#444"/>
<path d="M68,140 Q100,168 132,140" stroke="#1a1a25" stroke-width="2.5" fill="#333" opacity="0.35" stroke-linecap="round"/>
<rect x="78" y="139" width="7" height="8" rx="1.5" fill="#e8e8ed"/>
<rect x="88" y="139" width="7" height="8" rx="1.5" fill="#e8e8ed"/>
<rect x="98" y="139" width="7" height="8" rx="1.5" fill="#e8e8ed"/>
<rect x="108" y="139" width="7" height="8" rx="1.5" fill="#e8e8ed"/>
<rect x="118" y="139" width="7" height="8" rx="1.5" fill="#e8e8ed"/>
</svg>`;
}

export const GREMLIN_AVATARS: readonly GremlinAvatar[] = [
    { id: 'orange',  name: 'Blaze',     svg: gremlin('#FF6B00', '#b34700', '#ffe0b3') },
    { id: 'green',   name: 'Toxin',     svg: gremlin('#00CC44', '#008830', '#b3ffcc') },
    { id: 'purple',  name: 'Venom',     svg: gremlin('#8B00FF', '#5c00aa', '#d9b3ff') },
    { id: 'pink',    name: 'Bubblegum', svg: gremlin('#FF1493', '#b30e68', '#ffb3d9') },
    { id: 'blue',    name: 'Frost',     svg: gremlin('#3399FF', '#2266cc', '#b3d9ff') },
    { id: 'red',     name: 'Inferno',   svg: gremlin('#FF3333', '#b32424', '#ffb3b3') },
    { id: 'gold',    name: 'Midas',     svg: gremlin('#FFD700', '#b39700', '#fff5b3') },
    { id: 'white',   name: 'Ghost',     svg: gremlin('#c8c8d0', '#8888a0', '#ffffff') },
    { id: 'grey',    name: 'Shadow',    svg: gremlin('#666680', '#3d3d4d', '#aaaabd') },
    { id: 'holo',    name: 'Prisma',    svg: holoGremlin() },
];

/** Convert SVG string to data URI. */
export function svgToDataURI(svg: string): string {
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Get a random avatar ID (deterministic from wallet address if provided). */
export function getRandomAvatarId(seed?: string): string {
    if (seed) {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
        }
        return GREMLIN_AVATARS[Math.abs(hash) % GREMLIN_AVATARS.length].id;
    }
    return GREMLIN_AVATARS[Math.floor(Math.random() * GREMLIN_AVATARS.length)].id;
}

/** Find avatar by ID. */
export function getAvatarById(id: string): GremlinAvatar | undefined {
    return GREMLIN_AVATARS.find((a) => a.id === id);
}
