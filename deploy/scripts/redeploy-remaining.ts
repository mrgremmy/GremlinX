/**
 * Redeploy the remaining 2 collections that weren't mined.
 * Deploys one at a time, waiting for confirmation between each.
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

const NETWORK = networks.opnetTestnet;
const RPC_URL = 'https://testnet.opnet.org';
const WASM_PATH = path.join(__dirname, '..', 'contract', 'build', 'GremlinNFT.wasm');
const OUTPUT_FILE = path.join(__dirname, 'deployed-collections.json');

const COLLECTIONS_TO_DEPLOY = [
    {
        name: 'Chain Glyphs',
        symbol: 'GLYPH',
        maxSupply: 20n,
        baseURI: 'https://gremlinx.btc/nft/glyph/',
    },
];

async function waitForUtxos(
    provider: JSONRpcProvider,
    address: string,
    minCount: number,
    maxWaitMs: number,
): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
        const utxos = await provider.utxoManager.getUTXOs({ address });
        if (utxos.length >= minCount) return true;
        console.log(`  Waiting for confirmed UTXOs (have ${utxos.length}, need ${minCount})...`);
        await new Promise((r) => setTimeout(r, 15000));
    }
    return false;
}

async function main(): Promise<void> {
    const mnemonic = process.env['MNEMONIC'];
    if (!mnemonic) {
        console.error('ERROR: Set MNEMONIC env var.');
        process.exit(1);
    }

    const bytecode = new Uint8Array(fs.readFileSync(WASM_PATH));
    console.log(`Loaded bytecode: ${bytecode.length} bytes`);

    const wallet = new Mnemonic(mnemonic, '', NETWORK, MLDSASecurityLevel.LEVEL2);
    const deployer = wallet.deriveOPWallet(AddressTypes.P2TR, 0);
    console.log(`Deployer: ${deployer.p2tr}`);

    const provider = new JSONRpcProvider({ url: RPC_URL, network: NETWORK });
    const factory = new TransactionFactory();

    // Load existing results (Bitcoin Apes already deployed)
    const existing = fs.existsSync(OUTPUT_FILE)
        ? (JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8')) as Array<{ name: string; symbol: string; contractAddress: string }>)
        : [];

    for (const col of COLLECTIONS_TO_DEPLOY) {
        console.log(`\n--- Deploying "${col.name}" (${col.symbol}) ---`);

        // Wait for UTXOs
        const hasUtxos = await waitForUtxos(provider, deployer.p2tr, 1, 300000);
        if (!hasUtxos) {
            console.error('Timed out waiting for UTXOs. Try again later.');
            process.exit(1);
        }

        const utxos = await provider.utxoManager.getUTXOs({ address: deployer.p2tr });
        console.log(`  Found ${utxos.length} UTXOs`);

        const calldata = new BinaryWriter();
        calldata.writeStringWithLength(col.name);
        calldata.writeStringWithLength(col.symbol);
        calldata.writeStringWithLength(col.baseURI);
        calldata.writeU256(col.maxSupply);

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

        console.log(`  Deployed! Contract: ${deployment.contractAddress}`);

        // Replace old entry or add new
        const idx = existing.findIndex((e) => e.name === col.name);
        const entry = { name: col.name, symbol: col.symbol, contractAddress: deployment.contractAddress };
        if (idx >= 0) existing[idx] = entry;
        else existing.push(entry);

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(existing, null, 2));
        console.log(`  Saved to ${OUTPUT_FILE}`);

        // Now wait for this deployment to confirm before deploying the next
        console.log('  Waiting for deployment to be indexed...');
        const indexed = await waitForContract(provider, deployment.contractAddress, 600000);
        if (!indexed) {
            console.log('  WARNING: Contract not indexed yet, but continuing...');
        } else {
            console.log('  Contract indexed!');
        }
    }

    console.log('\n=== All collections deployed! ===');
    for (const e of existing) {
        console.log(`  ${e.name}: ${e.contractAddress}`);
    }

    await provider.close();
}

async function waitForContract(
    provider: JSONRpcProvider,
    contractAddress: string,
    maxWaitMs: number,
): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
        try {
            await provider.getPublicKeyInfo(contractAddress, true);
            return true;
        } catch {
            await new Promise((r) => setTimeout(r, 15000));
        }
    }
    return false;
}

main().catch((err: unknown) => {
    console.error('Failed:', err);
    process.exit(1);
});
