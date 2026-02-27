import { Address, AddressMap, ExtendedAddressMap, SchnorrSignature } from '@btc-vision/transaction';
import { CallResult, OPNetEvent, IOP_NETContract } from 'opnet';

// ------------------------------------------------------------------
// Event Definitions
// ------------------------------------------------------------------
export type TransferredEvent = {
    readonly operator: Address;
    readonly from: Address;
    readonly to: Address;
    readonly amount: bigint;
};

// ------------------------------------------------------------------
// Call Results
// ------------------------------------------------------------------

/**
 * @description Represents the result of the tokenURI function call.
 */
export type TokenURI = CallResult<
    {
        uri: string;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the mint function call.
 */
export type Mint = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<TransferredEvent>[]
>;

// ------------------------------------------------------------------
// IGremlinNFT
// ------------------------------------------------------------------
export interface IGremlinNFT extends IOP_NETContract {
    tokenURI(tokenId: bigint): Promise<TokenURI>;
    mint(to: Address, quantity: bigint): Promise<Mint>;
}
