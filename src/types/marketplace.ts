/** A marketplace listing */
export interface Listing {
    readonly tokenId: bigint;
    readonly collectionAddress: string;
    readonly seller: string;
    readonly priceSats: bigint;
    readonly listedAt: number;
}
