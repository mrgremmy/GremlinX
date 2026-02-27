/**
 * Mint 20 NFTs for a single collection.
 * Exported as a function for use by redeploy-remaining.ts
 */

import {
    getContract,
    IOP721Contract,
    OP_721_ABI,
    type TransactionParameters,
    type CallResult,
    type OPNetEvent,
    type BitcoinInterfaceAbi,
    BitcoinAbiTypes,
    type JSONRpcProvider,
} from 'opnet';
import type { Address, Wallet } from '@btc-vision/transaction';

type MintResult = CallResult<{ success: boolean }, OPNetEvent[]>;

interface IGremlinNFT extends IOP721Contract {
    mint(to: Address, quantity: bigint): Promise<MintResult>;
}

const GREMLIN_NFT_ABI: BitcoinInterfaceAbi = [
    ...OP_721_ABI,
    {
        name: 'mint',
        type: BitcoinAbiTypes.Function,
        constant: false,
        payable: false,
        inputs: [
            { name: 'to', type: 'ADDRESS' },
            { name: 'quantity', type: 'UINT256' },
        ],
        outputs: [
            { name: 'success', type: 'BOOL' },
        ],
    },
];

export async function mint(
    provider: JSONRpcProvider,
    deployer: Wallet,
    contractAddress: string,
    collectionName: string,
): Promise<void> {
    console.log(`  Minting 20 NFTs for "${collectionName}" (${contractAddress})...`);

    const mintTo = await provider.getPublicKeyInfo(deployer.p2tr, false);
    const network = deployer.network;

    const nft = getContract<IGremlinNFT>(
        contractAddress,
        GREMLIN_NFT_ABI,
        provider,
        network,
        deployer.address,
    );

    const simulation = await nft.mint(mintTo, 20n);

    if (simulation.revert) {
        console.error(`    Mint would revert: ${simulation.revert}`);
        return;
    }

    const params: TransactionParameters = {
        signer: deployer.keypair,
        mldsaSigner: deployer.mldsaKeypair,
        refundTo: deployer.p2tr,
        maximumAllowedSatToSpend: 50000n,
        feeRate: 5,
        network,
    };

    const receipt = await simulation.sendTransaction(params);
    console.log(`    Minted! TX: ${receipt.transactionId}`);
}
