import type { IOP721Contract } from 'opnet';
import { contractService } from './ContractService.ts';
import { providerService } from './ProviderService.ts';
import type { CollectionInfo, NFTItem, NFTMetadata } from '../types/nft.ts';

/** IPFS gateway used to resolve ipfs:// URIs */
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

/**
 * Resolves an IPFS URI to an HTTP URL.
 */
function resolveIPFS(uri: string): string {
    if (uri.startsWith('ipfs://')) {
        return uri.replace('ipfs://', IPFS_GATEWAY);
    }
    return uri;
}

/**
 * NFT data fetching and caching service.
 */
class NFTService {
    private static instance: NFTService;

    /** metadata cache: collectionAddress:tokenId -> NFTMetadata */
    private metadataCache: Map<string, NFTMetadata> = new Map();

    /** collection info cache */
    private collectionCache: Map<string, CollectionInfo> = new Map();

    private constructor() {}

    public static getInstance(): NFTService {
        if (!NFTService.instance) {
            NFTService.instance = new NFTService();
        }
        return NFTService.instance;
    }

    /**
     * Fetch basic collection info via a single .metadata() call.
     */
    public async getCollectionInfo(address: string): Promise<CollectionInfo> {
        const cached = this.collectionCache.get(address.toLowerCase());
        if (cached) return cached;

        const nft = contractService.getNFTContract(address);
        const meta = await nft.metadata();
        const props = meta.properties;

        const info: CollectionInfo = {
            address,
            name: String(props.name ?? 'Unknown'),
            symbol: String(props.symbol ?? '???'),
            totalSupply: BigInt(props.totalSupply ?? 0n),
            icon: props.icon ? String(props.icon) : undefined,
            banner: props.banner ? String(props.banner) : undefined,
            description: props.description ? String(props.description) : undefined,
        };

        this.collectionCache.set(address.toLowerCase(), info);
        return info;
    }

    /**
     * Fetch all NFTs in a collection (up to a reasonable cap).
     */
    public async getCollectionNFTs(
        address: string,
        cap: number = 100,
    ): Promise<NFTItem[]> {
        const nft = contractService.getNFTContract(address);
        const info = await this.getCollectionInfo(address);
        const total = Number(info.totalSupply);
        const count = Math.min(total, cap);

        const items: NFTItem[] = [];

        // OP721 token IDs start at 1, not 0
        for (let i = 1; i <= count; i++) {
            const tokenId = BigInt(i);
            try {
                const item = await this.getNFTItem(nft, address, tokenId);
                items.push(item);
            } catch {
                // Skip tokens that fail (e.g. burned or not yet minted)
                console.warn(`Failed to load token ${i} from ${address}`);
            }
        }

        return items;
    }

    /**
     * Fetch a single NFT item with metadata.
     */
    public async getNFTItem(
        nft: IOP721Contract,
        collectionAddress: string,
        tokenId: bigint,
    ): Promise<NFTItem> {
        const [ownerResult, uriResult] = await Promise.all([
            nft.ownerOf(tokenId),
            nft.tokenURI(tokenId),
        ]);

        const owner = String(ownerResult.properties.owner ?? '');
        const tokenURI = String(uriResult.properties.uri ?? '');
        const metadata = await this.fetchMetadata(collectionAddress, tokenId, tokenURI);

        return {
            tokenId,
            owner,
            collectionAddress,
            tokenURI,
            metadata,
        };
    }

    /**
     * Fetch a single NFT by collection address + token ID (convenience).
     */
    public async getNFTByTokenId(collectionAddress: string, tokenId: bigint): Promise<NFTItem> {
        const nft = contractService.getNFTContract(collectionAddress);
        return this.getNFTItem(nft, collectionAddress, tokenId);
    }

    /**
     * Fetch NFT token IDs owned by a specific address.
     */
    public async getOwnedTokens(
        collectionAddress: string,
        ownerAddress: string,
    ): Promise<bigint[]> {
        const nft = contractService.getNFTContract(collectionAddress);
        const provider = providerService.getProvider();
        const ownerAddr = await provider.getPublicKeyInfo(ownerAddress, false);

        const balanceResult = await nft.balanceOf(ownerAddr);
        const balance = balanceResult.properties.balance;

        const tokenIds: bigint[] = [];
        for (let i = 0n; i < balance; i++) {
            const result = await nft.tokenOfOwnerByIndex(ownerAddr, i);
            tokenIds.push(result.properties.tokenId);
        }

        return tokenIds;
    }

    /**
     * Fetch and cache metadata for a token.
     * Handles data: URIs, IPFS URIs, and HTTP URLs.
     * Falls back to a generated default if metadata can't be fetched.
     */
    private async fetchMetadata(
        collection: string,
        tokenId: bigint,
        uri: string,
    ): Promise<NFTMetadata | null> {
        const key = `${collection.toLowerCase()}:${tokenId}`;
        const cached = this.metadataCache.get(key);
        if (cached) return cached;

        if (!uri) return this.defaultMetadata(tokenId);

        try {
            const url = resolveIPFS(uri);
            const res = await fetch(url);
            if (!res.ok) return this.defaultMetadata(tokenId);

            const json: unknown = await res.json();

            // If metadata is not a JSON object (e.g. just a number/string),
            // generate default metadata
            if (!json || typeof json !== 'object') {
                return this.defaultMetadata(tokenId);
            }

            const raw = json as Record<string, unknown>;
            const metadata: NFTMetadata = {
                name: String(raw['name'] ?? `#${tokenId}`),
                description: String(raw['description'] ?? ''),
                image: raw['image'] ? resolveIPFS(String(raw['image'])) : '',
                attributes: Array.isArray(raw['attributes'])
                    ? (raw['attributes'] as Record<string, unknown>[]).map((a) => ({
                          trait_type: String(a['trait_type'] ?? ''),
                          value: String(a['value'] ?? ''),
                      }))
                    : [],
            };

            this.metadataCache.set(key, metadata);
            return metadata;
        } catch {
            return this.defaultMetadata(tokenId);
        }
    }

    /** Generate default metadata when tokenURI returns invalid/missing data. */
    private defaultMetadata(tokenId: bigint): NFTMetadata {
        return {
            name: `#${tokenId}`,
            description: '',
            image: '',
            attributes: [],
        };
    }

    /** Clear all caches (call on network change). */
    public clearCache(): void {
        this.metadataCache.clear();
        this.collectionCache.clear();
    }
}

export const nftService = NFTService.getInstance();
