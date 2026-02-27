import { providerService } from './ProviderService.ts';

/**
 * Address resolution service.
 *
 * OPNet contracts store ownership as the MLDSA hashed public key (0x-prefixed hex),
 * while wallets provide bech32m P2TR addresses (opt1p...).  This service resolves
 * between the two formats so ownership comparisons work.
 */
class AddressService {
    private static instance: AddressService;

    /** opt1p address → MLDSA hex (lowercase, no 0x prefix) */
    private readonly p2trToMldsa = new Map<string, string>();

    /** MLDSA hex (lowercase, no 0x) → opt1p address */
    private readonly mldsaToP2tr = new Map<string, string>();

    /** opt1 address → tweaked pubkey hex (0x-prefixed) */
    private readonly tweakedPubkeyCache = new Map<string, string>();

    private constructor() {}

    public static getInstance(): AddressService {
        if (!AddressService.instance) {
            AddressService.instance = new AddressService();
        }
        return AddressService.instance;
    }

    /**
     * Resolve an opt1p wallet address to its MLDSA hashed public key.
     * Returns lowercase hex WITHOUT the 0x prefix.
     */
    public async resolveToMldsa(p2trAddress: string): Promise<string | null> {
        const key = p2trAddress.toLowerCase();
        const cached = this.p2trToMldsa.get(key);
        if (cached) return cached;

        try {
            const provider = providerService.getProvider();
            const raw = await (provider as unknown as {
                getPublicKeysInfoRaw(addr: string): Promise<Record<string, {
                    tweakedPubkey?: string;
                    p2tr?: string;
                    mldsaHashedPublicKey?: string;
                }>>;
            }).getPublicKeysInfoRaw(p2trAddress);

            const entry = raw[p2trAddress] ?? raw[key];
            if (!entry?.mldsaHashedPublicKey) return null;

            const mldsa = entry.mldsaHashedPublicKey.toLowerCase();
            this.p2trToMldsa.set(key, mldsa);

            // Also cache the reverse mapping
            if (entry.p2tr) {
                this.mldsaToP2tr.set(mldsa, entry.p2tr.toLowerCase());
            }

            return mldsa;
        } catch {
            return null;
        }
    }

    /**
     * Get the P2TR address for a MLDSA hex key, if previously resolved.
     * Returns null if the mapping isn't cached (we can't do reverse lookups via RPC).
     */
    public getP2trFromMldsa(mldsaHex: string): string | null {
        const key = mldsaHex.replace(/^0x/i, '').toLowerCase();
        return this.mldsaToP2tr.get(key) ?? null;
    }

    /**
     * Resolve any opt1 address (opt1sq... or opt1p...) to its tweaked pubkey hex.
     * This is the format needed for Address.fromString() for contract addresses.
     * Returns 0x-prefixed hex string.
     */
    public async resolveToTweakedPubkey(address: string): Promise<string | null> {
        // Already hex
        if (address.startsWith('0x')) return address;

        const key = address.toLowerCase();
        const cached = this.tweakedPubkeyCache.get(key);
        if (cached) return cached;

        try {
            const provider = providerService.getProvider();
            const raw = await (provider as unknown as {
                getPublicKeysInfoRaw(addr: string): Promise<Record<string, {
                    tweakedPubkey?: string;
                    p2tr?: string;
                    mldsaHashedPublicKey?: string;
                }>>;
            }).getPublicKeysInfoRaw(address);

            const entry = raw[address] ?? raw[key];
            if (!entry?.tweakedPubkey) return null;

            const hex = `0x${entry.tweakedPubkey}`;
            this.tweakedPubkeyCache.set(key, hex);
            return hex;
        } catch {
            return null;
        }
    }

    /**
     * Check if two addresses refer to the same wallet.
     * Handles comparisons between:
     *   - Two opt1p addresses (direct comparison)
     *   - An opt1p address and a 0x MLDSA hash
     *   - Two 0x hashes
     */
    public async addressesMatch(a: string | null, b: string | null): Promise<boolean> {
        if (!a || !b) return false;

        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();

        // Direct match
        if (aLower === bLower) return true;

        // Normalize: strip 0x prefix for hex values
        const aNorm = aLower.replace(/^0x/, '');
        const bNorm = bLower.replace(/^0x/, '');
        if (aNorm === bNorm) return true;

        // One is opt1p (bech32), the other is 0x hex (MLDSA hash)
        const aIsOpt = aLower.startsWith('opt1');
        const bIsOpt = bLower.startsWith('opt1');

        if (aIsOpt && !bIsOpt) {
            const aMldsa = await this.resolveToMldsa(a);
            return aMldsa === bNorm;
        }
        if (bIsOpt && !aIsOpt) {
            const bMldsa = await this.resolveToMldsa(b);
            return bMldsa === aNorm;
        }

        // Both are opt1p but didn't match directly — resolve both
        if (aIsOpt && bIsOpt) {
            const aMldsa = await this.resolveToMldsa(a);
            const bMldsa = await this.resolveToMldsa(b);
            return !!aMldsa && aMldsa === bMldsa;
        }

        return false;
    }

    /** Clear all caches. */
    public clearCache(): void {
        this.p2trToMldsa.clear();
        this.mldsaToP2tr.clear();
        this.tweakedPubkeyCache.clear();
    }
}

export const addressService = AddressService.getInstance();
