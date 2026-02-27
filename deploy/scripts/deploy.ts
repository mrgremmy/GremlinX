/**
 * GremlinX NFT Deployment Script
 *
 * Deploys 3 OP721 NFT collections to OPNet testnet.
 * Each collection has a max supply of 20. After deployment, run mint.ts to mint NFTs.
 *
 * PREREQUISITES:
 * 1. Build the contract: cd ../contract && npm install && npm run build
 * 2. Install deps here: cd ../scripts && npm install
 * 3. Set MNEMONIC environment variable with a funded OPNet testnet wallet
 *    Example: set MNEMONIC=your 24 word mnemonic phrase here ...
 *
 * IMPORTANT: You need testnet BTC in the deployer wallet.
 * OPNet testnet uses Signet — get testnet BTC from an OPNet faucet.
 *
 * Usage: npm run deploy
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import {
    JSONRpcProvider,
    getContract,
    IOP721Contract,
    OP_721_ABI,
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
const OUTPUT_FILE = path.join(__dirname, 'deployed-collections.json');

const COLLECTIONS = [
    {
        name: 'Bitcoin Apes',
        symbol: 'BAPE',
        maxSupply: 20n,
        baseURI: 'https://gremlinx.btc/nft/bape/',
    },
    {
        name: 'OPNet Punks',
        symbol: 'OPNK',
        maxSupply: 20n,
        baseURI: 'https://gremlinx.btc/nft/opnk/',
    },
    {
        name: 'Chain Glyphs',
        symbol: 'GLYPH',
        maxSupply: 20n,
        baseURI: 'https://gremlinx.btc/nft/glyph/',
    },
];

// ─── Main ────────────────────────────────────────────────────────
async function main(): Promise<void> {
    const mnemonic = process.env['MNEMONIC'];
    if (!mnemonic) {
        console.error('ERROR: Set the MNEMONIC environment variable.');
        console.error('  Windows: set MNEMONIC=your 24 word phrase here');
        console.error('  Linux:   export MNEMONIC="your 24 word phrase here"');
        process.exit(1);
    }

    // Check bytecode exists
    if (!fs.existsSync(WASM_PATH)) {
        console.error(`ERROR: Contract bytecode not found at ${WASM_PATH}`);
        console.error('Build the contract first: cd ../contract && npm install && npm run build');
        process.exit(1);
    }

    const bytecode = new Uint8Array(fs.readFileSync(WASM_PATH));
    console.log(`Loaded bytecode: ${bytecode.length} bytes`);

    const wallet = new Mnemonic(mnemonic, '', NETWORK, MLDSASecurityLevel.LEVEL2);
    const deployer = wallet.deriveOPWallet(AddressTypes.P2TR, 0);
    console.log(`Deployer address: ${deployer.p2tr}`);

    const provider = new JSONRpcProvider({ url: RPC_URL, network: NETWORK });
    const factory = new TransactionFactory();

    const results: Array<{
        name: string;
        symbol: string;
        contractAddress: string;
    }> = [];

    for (const col of COLLECTIONS) {
        console.log(`\nDeploying "${col.name}" (${col.symbol})...`);

        // Build calldata
        const calldata = new BinaryWriter();
        calldata.writeStringWithLength(col.name);
        calldata.writeStringWithLength(col.symbol);
        calldata.writeStringWithLength(col.baseURI);
        calldata.writeU256(col.maxSupply);

        // Get UTXOs
        const utxos = await provider.utxoManager.getUTXOs({
            address: deployer.p2tr,
        });

        if (utxos.length === 0) {
            console.error('No UTXOs! Fund the deployer wallet with testnet BTC first.');
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

        // Broadcast
        await provider.sendRawTransaction(deployment.transaction[0]);
        await provider.sendRawTransaction(deployment.transaction[1]);

        console.log(`  Contract address: ${deployment.contractAddress}`);
        results.push({
            name: col.name,
            symbol: col.symbol,
            contractAddress: deployment.contractAddress,
        });

        // Wait a bit between deployments
        await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    // Save results
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
    console.log(`\nAll 3 collections deployed! Results saved to ${OUTPUT_FILE}`);
    console.log('\nNext step: npm run mint');

    await provider.close();
}

main().catch((err: unknown) => {
    console.error('Deployment failed:', err);
    process.exit(1);
});
