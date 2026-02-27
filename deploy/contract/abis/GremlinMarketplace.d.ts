import { Address, AddressMap, ExtendedAddressMap, SchnorrSignature } from '@btc-vision/transaction';
import { CallResult, OPNetEvent, IOP_NETContract } from 'opnet';

// ------------------------------------------------------------------
// Event Definitions
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// Call Results
// ------------------------------------------------------------------

/**
 * @description Represents the result of the listNFT function call.
 */
export type ListNFT = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<ListedEvent>[]
>;

/**
 * @description Represents the result of the cancelListing function call.
 */
export type CancelListing = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<CancelledEvent>[]
>;

/**
 * @description Represents the result of the buyNFT function call.
 */
export type BuyNFT = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<SoldEvent>[]
>;

/**
 * @description Represents the result of the getListing function call.
 */
export type GetListing = CallResult<
    {
        priceSats: bigint;
        seller: Address;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getStats function call.
 */
export type GetStats = CallResult<
    {
        totalVolume: bigint;
        totalSales: bigint;
        listingCount: bigint;
        feeBps: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the setFee function call.
 */
export type SetFee = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the setFeeRecipient function call.
 */
export type SetFeeRecipient = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the setPaused function call.
 */
export type SetPaused = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

// ------------------------------------------------------------------
// IGremlinMarketplace
// ------------------------------------------------------------------
export interface IGremlinMarketplace extends IOP_NETContract {
    listNFT(collection: Address, tokenId: bigint, priceSats: bigint): Promise<ListNFT>;
    cancelListing(collection: Address, tokenId: bigint): Promise<CancelListing>;
    buyNFT(collection: Address, tokenId: bigint): Promise<BuyNFT>;
    getListing(collection: Address, tokenId: bigint): Promise<GetListing>;
    getStats(): Promise<GetStats>;
    setFee(feeBps: bigint): Promise<SetFee>;
    setFeeRecipient(recipient: Address): Promise<SetFeeRecipient>;
    setPaused(paused: boolean): Promise<SetPaused>;
}
