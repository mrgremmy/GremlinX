/**
 * Deploy "BlankFT" collection — 20 blank white NFTs on OPNet testnet.
 * Then mint all 20 to the deployer wallet.
 *
 * Usage:
 *   set MNEMONIC=wink install isolate tornado organ asset kitchen odor dynamic kiss craft juice
 *   npx tsx deploy-blankft.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import {
    JSONRpcProvider,
    getContract,
    IOP721Contract,
    OP_721_ABI,
    type TransactionParameters,
    type CallResult,
    type OPNetEvent,
    type BitcoinInterfaceAbi,
    BitcoinAbiTypes,
} from 'opnet';
import {
    TransactionFactory,
    Address,
    AddressTypes,
    Mnemonic,
    MLDSASecurityLevel,
    BinaryWriter,
    type IDeploymentParameters,
} from '@btc-vision/transaction';
import { networks } from '@btc-vision/bitcoin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Configuration ───────────────────────────────────────────────
const NETWORK = networks.opnetTestnet;
const RPC_URL = 'https://testnet.opnet.org';
const WASM_PATH = path.join(__dirname, '..', 'contract', 'build', 'GremlinNFT.wasm');
const OUTPUT_FILE = path.join(__dirname, 'blankft-deployed.json');

const COLLECTION = {
    name: 'BlankFT',
    symbol: 'BLNK',
    maxSupply: 20n,
    // data: URI serving blank white image metadata — will be resolved per token
    baseURI: 'data:application/json,',
};

// Extend OP721 with our mint function
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

// ─── Main ────────────────────────────────────────────────────────
async function main(): Promise<void> {
    const mnemonic = process.env['MNEMONIC'];
    if (!mnemonic) {
        console.error('ERROR: Set MNEMONIC env var.');
        process.exit(1);
    }

    if (!fs.existsSync(WASM_PATH)) {
        console.error(`ERROR: Bytecode not found at ${WASM_PATH}`);
        process.exit(1);
    }

    const bytecode = new Uint8Array(fs.readFileSync(WASM_PATH));
    console.log(`Loaded bytecode: ${bytecode.length} bytes`);

    const wallet = new Mnemonic(mnemonic, '', NETWORK, MLDSASecurityLevel.LEVEL2);
    const deployer = wallet.deriveOPWallet(AddressTypes.P2TR, 0);
    console.log(`Deployer address: ${deployer.p2tr}`);

    const provider = new JSONRpcProvider({ url: RPC_URL, network: NETWORK });
    const factory = new TransactionFactory();

    // ─── Step 1: Deploy ──────────────────────────────────────────
    console.log(`\nDeploying "${COLLECTION.name}" (${COLLECTION.symbol})...`);

    const calldata = new BinaryWriter();
    calldata.writeStringWithLength(COLLECTION.name);
    calldata.writeStringWithLength(COLLECTION.symbol);
    calldata.writeStringWithLength(COLLECTION.baseURI);
    calldata.writeU256(COLLECTION.maxSupply);

    const utxos = await provider.utxoManager.getUTXOs({
        address: deployer.p2tr,
    });

    if (utxos.length === 0) {
        console.error('No UTXOs! Fund the deployer wallet first.');
        process.exit(1);
    }

    const challenge = await provider.getChallenge();

    const deploymentParams: IDeploymentParameters = {
        from: deployer.p2tr,
        utxos,
        signer: deployer.keypair,
        mldsaSigner: deployer.mldsaKeypair,
        network: NETWORK,
        feeRate: 5,
        priorityFee: 0n,
        gasSatFee: 15_000n,
        bytecode,
        calldata: calldata.getBuffer(),
        challenge,
        linkMLDSAPublicKeyToAddress: true,
        revealMLDSAPublicKey: true,
    };

    const deployment = await factory.signDeployment(deploymentParams);

    await provider.sendRawTransaction(deployment.transaction[0]);
    await provider.sendRawTransaction(deployment.transaction[1]);

    const contractAddress = deployment.contractAddress;
    console.log(`\n  Contract address: ${contractAddress}`);

    // Save deployment result
    const result = {
        name: COLLECTION.name,
        symbol: COLLECTION.symbol,
        contractAddress,
        deployedAt: new Date().toISOString(),
    };
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
    console.log(`  Saved to ${OUTPUT_FILE}`);

    // ─── Step 2: Wait for indexing ───────────────────────────────
    console.log('\n  Waiting for contract to be indexed on chain...');

    let indexed = false;
    for (let attempt = 1; attempt <= 20; attempt++) {
        try {
            const info = await provider.getPublicKeyInfo(contractAddress, false);
            if (info) {
                indexed = true;
                console.log(`  Contract indexed after ${attempt * 15}s`);
                break;
            }
        } catch {
            // Not indexed yet
        }
        console.log(`  Not indexed yet, waiting 15s... (attempt ${attempt}/20)`);
        await new Promise((resolve) => setTimeout(resolve, 15000));
    }

    if (!indexed) {
        console.log('\n  Contract not indexed after 5 minutes.');
        console.log('  You can run the mint step later with: npx tsx mint-blankft.ts');
        await provider.close();
        return;
    }

    // ─── Step 3: Mint 20 NFTs ────────────────────────────────────
    console.log('\n  Minting 20 BlankFT NFTs...');

    const mintTo = await provider.getPublicKeyInfo(deployer.p2tr, false);

    const nft = getContract<IGremlinNFT>(
        contractAddress,
        GREMLIN_NFT_ABI,
        provider,
        NETWORK,
        deployer.address,
    );

    const simulation = await nft.mint(mintTo, 20n);

    if (simulation.revert) {
        console.error(`  Mint revert: ${simulation.revert}`);
        await provider.close();
        return;
    }

    const params: TransactionParameters = {
        signer: deployer.keypair,
        mldsaSigner: deployer.mldsaKeypair,
        refundTo: deployer.p2tr,
        maximumAllowedSatToSpend: 50000n,
        feeRate: 5,
        network: NETWORK,
    };

    const receipt = await simulation.sendTransaction(params);
    console.log(`  Minted! TX: ${receipt.transactionId}`);

    console.log('\n=== DONE ===');
    console.log(`Collection: ${COLLECTION.name}`);
    console.log(`Address:    ${contractAddress}`);
    console.log(`Minted:     20 NFTs to ${deployer.p2tr}`);
    console.log(`\nAdd this to your GremlinX site via "Publish Collection"!`);

    await provider.close();
}

main().catch((err: unknown) => {
    console.error('Failed:', err);
    process.exit(1);
});
