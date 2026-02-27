/**
 * Formatting utilities used throughout GremlinX.
 */
export class FormatUtils {
    /**
     * Truncate an address for display.
     * @param address - Full address string.
     * @param chars   - Characters to show on each side (default 6).
     */
    public static formatAddress(address: string, chars: number = 6): string {
        if (address.length <= chars * 2 + 3) return address;
        return `${address.slice(0, chars)}...${address.slice(-chars)}`;
    }

    /**
     * Format satoshis as BTC string.
     */
    public static satsToBTC(sats: bigint): string {
        const whole = sats / 100_000_000n;
        const frac = sats % 100_000_000n;
        const fracStr = frac.toString().padStart(8, '0').replace(/0+$/, '');
        if (fracStr.length === 0) return `${whole}`;
        return `${whole}.${fracStr}`;
    }

    /**
     * Parse a BTC string into satoshis.
     */
    public static btcToSats(btc: string): bigint {
        const [whole = '0', frac = ''] = btc.split('.');
        const paddedFrac = frac.padEnd(8, '0').slice(0, 8);
        return BigInt(whole) * 100_000_000n + BigInt(paddedFrac);
    }

    /**
     * Format a token ID for display.
     */
    public static formatTokenId(tokenId: bigint): string {
        return `#${tokenId.toString().padStart(3, '0')}`;
    }
}
