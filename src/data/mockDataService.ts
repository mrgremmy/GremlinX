/**
 * Resolves demo/mock collection data into the same types
 * used by the rest of the app (CollectionInfo, NFTItem).
 *
 * When a page navigates to a demo collection address, this service
 * returns fully populated data without any chain calls.
 */

import {
    DEMO_COLLECTIONS,
    findDemoCollection,
    type DemoCollection,
    type DemoNFTItem,
} from './demoCollections.ts';
import type { CollectionInfo, NFTItem, NFTMetadata, NFTAttribute } from '../types/nft.ts';

/** Check if an address belongs to a demo collection. */
export function isDemoAddress(address: string): boolean {
    return DEMO_COLLECTIONS.some((c) => c.address === address);
}

/** Convert a DemoCollection to CollectionInfo. */
export function getDemoCollectionInfo(address: string): CollectionInfo | null {
    const col = findDemoCollection(address);
    if (!col) return null;
    return toCollectionInfo(col);
}

/** Convert all items in a demo collection to NFTItem[]. */
export function getDemoCollectionItems(address: string): NFTItem[] {
    const col = findDemoCollection(address);
    if (!col) return [];
    return col.items.map((item, index) => toNFTItem(item, col.address, index));
}

/** Get a single demo NFT item by token index. */
export function getDemoNFTItem(address: string, tokenIndex: number): NFTItem | null {
    const col = findDemoCollection(address);
    if (!col) return null;
    const item = col.items[tokenIndex];
    if (!item) return null;
    return toNFTItem(item, col.address, tokenIndex);
}

/* ---- Internal converters ---- */

function toCollectionInfo(col: DemoCollection): CollectionInfo {
    return {
        address: col.address,
        name: col.name,
        symbol: col.symbol,
        totalSupply: BigInt(col.totalSupply),
        icon: col.icon,
        banner: col.banner,
        description: col.description,
    };
}

function toNFTItem(item: DemoNFTItem, collectionAddress: string, tokenIndex: number): NFTItem {
    const attributes: NFTAttribute[] = item.attributes.map((a) => ({
        trait_type: a.trait_type,
        value: a.value,
    }));

    const metadata: NFTMetadata = {
        name: item.name,
        description: item.description,
        image: item.image,
        attributes,
        price: item.price,
    };

    return {
        tokenId: BigInt(tokenIndex),
        owner: item.owner,
        collectionAddress,
        tokenURI: '',
        metadata,
    };
}
