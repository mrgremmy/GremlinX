/**
 * GremlinX Marketplace Deployment Script
 *
 * Deploys the GremlinMarketplace contract to OPNet testnet.
 * The marketplace enables listing, buying, and canceling OP721 NFT listings.
 *
 * PREREQUISITES:
 * 1. Build the contract: cd ../contract && npm install && npm run build:marketplace
 * 2. Install deps here: cd ../scripts && npm install
 * 3. Set MNEMONIC environment variable with a funded OPNet testnet wallet
 *
 * Usage: npm run deploy:marketplace
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { JSONRpcProvider } from 'opnet';
import {
    TransactionFactory,
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
const WASM_PATH = path.join(__dirname, '..', 'contract', 'build', 'GremlinMarketplace.wasm');
const OUTPUT_FILE = path.join(__dirname, 'deployed-marketplace.json');

// Marketplace fee: 250 basis points = 2.5%
const MARKETPLACE_FEE_BPS = 250n;

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
        console.error(`ERROR: Marketplace bytecode not found at ${WASM_PATH}`);
        console.error('Build it first: cd ../contract && npm run build:marketplace');
        process.exit(1);
    }

    const bytecode = new Uint8Array(fs.readFileSync(WASM_PATH));
    console.log(`Loaded marketplace bytecode: ${bytecode.length} bytes`);

    const wallet = new Mnemonic(mnemonic, '', NETWORK, MLDSASecurityLevel.LEVEL2);
    const deployer = wallet.deriveOPWallet(AddressTypes.P2TR, 0);
    console.log(`Deployer address: ${deployer.p2tr}`);

    const provider = new JSONRpcProvider({ url: RPC_URL, network: NETWORK });
    const factory = new TransactionFactory();

    console.log('\nDeploying GremlinMarketplace...');

    // Build calldata: feeRecipient (address), feeBps (u256)
    // Fee recipient = the deployer address
    const calldata = new BinaryWriter();
    calldata.writeAddress(deployer.address);
    calldata.writeU256(MARKETPLACE_FEE_BPS);

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

    const result = {
        name: 'GremlinMarketplace',
        contractAddress: deployment.contractAddress,
        feeBps: Number(MARKETPLACE_FEE_BPS),
        feeRecipient: deployer.p2tr,
        deployedAt: new Date().toISOString(),
    };

    console.log(`  Contract address: ${result.contractAddress}`);

    // Save result
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
    console.log(`\nMarketplace deployed! Result saved to ${OUTPUT_FILE}`);
    console.log(`\nNext: Update gremlinx/src/config/contracts.ts with:`);
    console.log(`  MARKETPLACE_CONTRACT = '${result.contractAddress}'`);

    await provider.close();
}

main().catch((err: unknown) => {
    console.error('Marketplace deployment failed:', err);
    process.exit(1);
});
