/**
 * Basic client-side address validation.
 * For full validation, use AddressVerificator from @btc-vision/transaction.
 */
export function isPlausibleAddress(address: string): boolean {
    if (!address) return false;
    if (address.startsWith('0x') && address.length === 66) return true;
    if (address.startsWith('op1')) return true;
    if (/^(bc1|bcrt1|tb1)[a-z0-9]{39,87}$/i.test(address)) return true;
    return false;
}
