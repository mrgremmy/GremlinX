const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

/**
 * Resolve an IPFS URI to an HTTP URL.
 */
export function resolveIPFS(uri: string): string {
    if (uri.startsWith('ipfs://')) {
        return uri.replace('ipfs://', IPFS_GATEWAY);
    }
    return uri;
}
