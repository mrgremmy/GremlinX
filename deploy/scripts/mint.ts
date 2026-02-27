/**
 * GremlinX NFT Minting Script
 *
 * Mints 20 NFTs per collection to the deployer wallet.
 * Run this AFTER deploy.ts has completed successfully.
 *
 * Usage: npm run mint
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
    type Address,
    AddressTypes,
    Mnemonic,
    MLDSASecurityLevel,
} from '@btc-vision/transaction';
import { networks } from '@btc-vision/bitcoin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const NETWORK = networks.opnetTestnet;
const RPC_URL = 'https://testnet.opnet.org';
const DEPLOYED_FILE = path.join(__dirname, 'deployed-collections.json');

// Extend the standard OP721 interface with our custom mint
type MintResult = CallResult<{ success: boolean }, OPNetEvent[]>;

interface IGremlinNFT extends IOP721Contract {
    mint(to: Address, quantity: bigint): Promise<MintResult>;
}

// Add mint function to the OP721 ABI
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

interface DeployedCollection {
    name: string;
    symbol: string;
    contractAddress: string;
}

async function main(): Promise<void> {
    const mnemonic = process.env['MNEMONIC'];
    if (!mnemonic) {
        console.error('ERROR: Set the MNEMONIC environment variable.');
        process.exit(1);
    }

    if (!fs.existsSync(DEPLOYED_FILE)) {
        console.error('ERROR: deployed-collections.json not found. Run deploy.ts first.');
        process.exit(1);
    }

    const collections: DeployedCollection[] = JSON.parse(
        fs.readFileSync(DEPLOYED_FILE, 'utf-8'),
    ) as DeployedCollection[];

    const wallet = new Mnemonic(mnemonic, '', NETWORK, MLDSASecurityLevel.LEVEL2);
    const deployer = wallet.deriveOPWallet(AddressTypes.P2TR, 0);
    console.log(`Minting from: ${deployer.p2tr}`);

    const provider = new JSONRpcProvider({ url: RPC_URL, network: NETWORK });
    const mintTo = await provider.getPublicKeyInfo(deployer.p2tr, false);

    const MINTED_FILE = path.join(__dirname, 'minted-collections.json');
    const alreadyMinted: Set<string> = new Set();
    if (fs.existsSync(MINTED_FILE)) {
        const prev = JSON.parse(fs.readFileSync(MINTED_FILE, 'utf-8')) as string[];
        for (const addr of prev) alreadyMinted.add(addr);
    }

    for (const col of collections) {
        if (alreadyMinted.has(col.contractAddress)) {
            console.log(`\nSkipping "${col.name}" (already minted)`);
            continue;
        }

        console.log(`\nMinting 20 NFTs for "${col.name}" (${col.contractAddress})...`);

        // Retry loop: wait for contract to be indexed
        let attempts = 0;
        const maxAttempts = 10;
        let success = false;

        while (attempts < maxAttempts && !success) {
            attempts++;
            try {
                const nft = getContract<IGremlinNFT>(
                    col.contractAddress,
                    GREMLIN_NFT_ABI,
                    provider,
                    NETWORK,
                    deployer.address,
                );

                // Mint 20 at once (quantity = 20)
                const simulation = await nft.mint(mintTo, 20n);

                if (simulation.revert) {
                    console.error(`  Mint would revert: ${simulation.revert}`);
                    break;
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
                alreadyMinted.add(col.contractAddress);
                fs.writeFileSync(MINTED_FILE, JSON.stringify([...alreadyMinted], null, 2));
                success = true;
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                if (msg.includes('No public key information found') && attempts < maxAttempts) {
                    console.log(`  Contract not indexed yet, waiting 15s... (attempt ${attempts}/${maxAttempts})`);
                    await new Promise((resolve) => setTimeout(resolve, 15000));
                } else {
                    console.error(`  Error: ${msg}`);
                    break;
                }
            }
        }

        // Wait between collections
        await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    console.log('\nAll NFTs minted! Update gremlinx/src/config/contracts.ts with:');
    for (const col of collections) {
        console.log(`  { address: '${col.contractAddress}', name: '${col.name}' },`);
    }

    await provider.close();
}

main().catch((err: unknown) => {
    console.error('Minting failed:', err);
    process.exit(1);
});
