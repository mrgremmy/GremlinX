/** NFT metadata from IPFS */
export interface NFTMetadata {
    readonly name: string;
    readonly description: string;
    readonly image: string;
    readonly attributes: readonly NFTAttribute[];
    readonly price?: string;
}

/** Single NFT attribute/trait */
export interface NFTAttribute {
    readonly trait_type: string;
    readonly value: string;
}

/** NFT item with on-chain + off-chain data */
export interface NFTItem {
    readonly tokenId: bigint;
    readonly owner: string;
    readonly collectionAddress: string;
    readonly tokenURI: string;
    readonly metadata: NFTMetadata | null;
}

/** Collection summary */
export interface CollectionInfo {
    readonly address: string;
    readonly name: string;
    readonly symbol: string;
    readonly totalSupply: bigint;
    readonly icon?: string;
    readonly banner?: string;
    readonly description?: string;
}
