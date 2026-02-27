/**
 * Published collection stored in localStorage.
 */
export interface PublishedCollection {
    readonly address: string;
    readonly name: string;
    readonly symbol: string;
    readonly totalSupply: number;
    readonly publishedAt: string;
}

const STORAGE_KEY = 'gremlinx_published_collections';

/** Load published collections from localStorage. */
export function getPublishedCollections(): PublishedCollection[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as PublishedCollection[];
    } catch {
        return [];
    }
}

/** Save a new published collection. */
export function addPublishedCollection(col: PublishedCollection): void {
    const existing = getPublishedCollections();
    // Deduplicate by address
    const filtered = existing.filter(
        (c) => c.address.toLowerCase() !== col.address.toLowerCase(),
    );
    filtered.push(col);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/** Remove a published collection by address. */
export function removePublishedCollection(address: string): void {
    const existing = getPublishedCollections();
    const filtered = existing.filter(
        (c) => c.address.toLowerCase() !== address.toLowerCase(),
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/** Get all known collection addresses (for profile page iteration). */
export function getKnownAddresses(): string[] {
    return getPublishedCollections().map((c) => c.address);
}

/**
 * Marketplace contract address.
 * Set to null to use local mock listings until a real contract is deployed.
 */
export const MARKETPLACE_CONTRACT: string | null = 'opt1sqzhzs9xcj9ajd23lj548phhaema3cx95esxyq73m';
