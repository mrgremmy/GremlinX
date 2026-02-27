/**
 * GremlinX Collection Status Checker
 *
 * Reads deployed-collections.json and queries each contract for:
 * - Name, symbol, totalSupply
 * - Token owners for each minted NFT
 *
 * Usage: npm run status
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
import { Address } from '@btc-vision/transaction';
import { networks } from '@btc-vision/bitcoin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const NETWORK = networks.opnetTestnet;
const RPC_URL = 'https://testnet.opnet.org';
const DEPLOYED_FILE = path.join(__dirname, 'deployed-collections.json');

interface DeployedCollection {
    name: string;
    symbol: string;
    contractAddress: string;
}

async function main(): Promise<void> {
    if (!fs.existsSync(DEPLOYED_FILE)) {
        console.error('No deployed-collections.json found. Run deploy.ts first.');
        process.exit(1);
    }

    const collections: DeployedCollection[] = JSON.parse(
        fs.readFileSync(DEPLOYED_FILE, 'utf-8'),
    ) as DeployedCollection[];

    const provider = new JSONRpcProvider({ url: RPC_URL, network: NETWORK });

    for (const col of collections) {
        console.log(`\n=== ${col.name} (${col.symbol}) ===`);
        console.log(`  CA: ${col.contractAddress}`);

        try {
            const nft = getContract<IOP721Contract>(
                Address.fromString(col.contractAddress),
                OP_721_ABI,
                provider,
                NETWORK,
            );

            const meta = await nft.metadata();
            const props = meta.properties;
            console.log(`  Name: ${String(props.name)}`);
            console.log(`  Total Supply: ${String(props.totalSupply)}`);
        } catch (err: unknown) {
            console.error(`  Error querying ${col.name}:`, err);
        }
    }

    await provider.close();
}

main().catch((err: unknown) => {
    console.error('Status check failed:', err);
    process.exit(1);
});
