/**
 * Wait for BlankFT contract to be indexed, then mint.
 * More patient than the deploy script — waits up to 30 minutes.
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
    Address,
    AddressTypes,
    Mnemonic,
    MLDSASecurityLevel,
} from '@btc-vision/transaction';
import { networks } from '@btc-vision/bitcoin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NETWORK = networks.opnetTestnet;
const RPC_URL = 'https://testnet.opnet.org';

// Read contract address from deployed file
const deployedFile = path.join(__dirname, 'blankft-deployed.json');
const deployed = JSON.parse(fs.readFileSync(deployedFile, 'utf-8'));
const CONTRACT_ADDRESS: string = deployed.contractAddress;

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

async function main(): Promise<void> {
    const mnemonic = process.env['MNEMONIC'];
    if (!mnemonic) {
        console.error('Set MNEMONIC env var.');
        process.exit(1);
    }

    const wallet = new Mnemonic(mnemonic, '', NETWORK, MLDSASecurityLevel.LEVEL2);
    const deployer = wallet.deriveOPWallet(AddressTypes.P2TR, 0);
    const provider = new JSONRpcProvider({ url: RPC_URL, network: NETWORK });

    console.log(`\nContract:  ${CONTRACT_ADDRESS}`);
    console.log(`Deployer:  ${deployer.p2tr}`);
    console.log(`Waiting up to 30 minutes for indexing...\n`);

    // Wait for indexing — 60 attempts x 30s = 30 minutes
    let indexed = false;
    for (let attempt = 1; attempt <= 60; attempt++) {
        try {
            // Try multiple methods to check
            const info = await provider.getPublicKeyInfo(CONTRACT_ADDRESS, false);
            if (info) {
                indexed = true;
                console.log(`\n✅ Contract indexed after ~${attempt * 30}s!`);
                break;
            }
        } catch {
            // Try calling metadata directly as alternative check
            try {
                const nft = getContract<IOP721Contract>(
                    CONTRACT_ADDRESS,
                    OP_721_ABI,
                    provider,
                    NETWORK,
                );
                const meta = await nft.metadata();
                if (meta.properties.name) {
                    indexed = true;
                    console.log(`\n✅ Contract indexed (metadata check) after ~${attempt * 30}s!`);
                    console.log(`   Name: ${meta.properties.name}, Symbol: ${meta.properties.symbol}`);
                    break;
                }
            } catch {
                // Still not indexed
            }
        }
        const elapsed = Math.floor((attempt * 30) / 60);
        const secs = (attempt * 30) % 60;
        console.log(`  Waiting... ${elapsed}m${secs}s elapsed (attempt ${attempt}/60)`);
        await new Promise((resolve) => setTimeout(resolve, 30000));
    }

    if (!indexed) {
        console.error('\n❌ Contract still not indexed after 30 minutes.');
        console.error('The Signet network may be experiencing delays. Try again later.');
        await provider.close();
        process.exit(1);
    }

    // Mint 20 NFTs
    console.log('\nMinting 20 BlankFT NFTs...');

    const mintTo = await provider.getPublicKeyInfo(deployer.p2tr, false);

    const nft = getContract<IGremlinNFT>(
        CONTRACT_ADDRESS,
        GREMLIN_NFT_ABI,
        provider,
        NETWORK,
        deployer.address,
    );

    const simulation = await nft.mint(mintTo, 20n);

    if (simulation.revert) {
        console.error(`Mint revert: ${simulation.revert}`);
        await provider.close();
        process.exit(1);
    }

    console.log('Simulation OK, sending transaction...');

    const params: TransactionParameters = {
        signer: deployer.keypair,
        mldsaSigner: deployer.mldsaKeypair,
        refundTo: deployer.p2tr,
        maximumAllowedSatToSpend: 50000n,
        feeRate: 5,
        network: NETWORK,
    };

    const receipt = await simulation.sendTransaction(params);
    console.log(`\n✅ Minted! TX: ${receipt.transactionId}`);

    // Save mint result
    const mintResult = {
        contractAddress: CONTRACT_ADDRESS,
        txId: receipt.transactionId,
        mintedAt: new Date().toISOString(),
        quantity: 20,
        to: deployer.p2tr,
    };
    const mintFile = path.join(__dirname, 'blankft-minted.json');
    fs.writeFileSync(mintFile, JSON.stringify(mintResult, null, 2));

    console.log(`\n=== DONE ===`);
    console.log(`Collection: BlankFT (BLNK)`);
    console.log(`Address:    ${CONTRACT_ADDRESS}`);
    console.log(`Minted:     20 NFTs to ${deployer.p2tr}`);

    await provider.close();
}

main().catch((err: unknown) => {
    console.error('Failed:', err);
    process.exit(1);
});
