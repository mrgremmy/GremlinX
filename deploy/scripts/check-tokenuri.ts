/**
 * Check tokenURI and contract p2tr address for OP_WALLET import.
 */
import {
    JSONRpcProvider,
    getContract,
    IOP721Contract,
    OP_721_ABI,
} from 'opnet';
import { networks } from '@btc-vision/bitcoin';

const NETWORK = networks.opnetTestnet;
const RPC_URL = 'https://testnet.opnet.org';
const CONTRACT = 'opt1sqqs5uuq2plf52scvrew33pqu3q6hzmvcxs996377';

async function main(): Promise<void> {
    const provider = new JSONRpcProvider({ url: RPC_URL, network: NETWORK });

    // Get the contract's full p2tr address (OP_WALLET might need this format)
    console.log('--- Contract address resolution ---');
    try {
        const raw = await (provider as any).getPublicKeysInfoRaw(CONTRACT);
        const entry = raw[CONTRACT];
        if (entry) {
            console.log('Contract opt1sq address:', CONTRACT);
            console.log('Contract p2tr address:  ', entry.p2tr);
            console.log('Tweaked pubkey:         ', entry.tweakedPubkey);
        }
    } catch (err: any) {
        console.log('Failed:', err.message);
    }

    const nft = getContract<IOP721Contract>(
        CONTRACT,
        OP_721_ABI,
        provider,
        NETWORK,
    );

    // Check tokenURI for tokens 1-3 (tokens start at 1, not 0)
    console.log('\n--- Token URIs ---');
    for (const id of [1n, 2n, 3n, 19n, 20n]) {
        try {
            const result = await nft.tokenURI(id);
            const uri = String(result.properties.uri);
            console.log(`tokenURI(${id}): "${uri}"`);
            
            // Try to parse if it's a data URI
            if (uri.startsWith('data:application/json,')) {
                const jsonPart = uri.replace('data:application/json,', '');
                console.log(`  JSON content: "${jsonPart}"`);
                try {
                    const parsed = JSON.parse(jsonPart);
                    console.log(`  Parsed OK:`, parsed);
                } catch {
                    console.log(`  ⚠️  NOT valid JSON`);
                }
            }
        } catch (err: any) {
            console.log(`tokenURI(${id}): ❌ ${err.message?.slice(0, 100)}`);
        }
    }

    // Check tokenOfOwnerByIndex for first few
    console.log('\n--- Token IDs owned by deployer ---');
    const deployerAddr = await provider.getPublicKeyInfo(
        'opt1psp5t7lrpe5qmatth3tnyykqdtxjepfcnqs6eqvcnd69yemnsrcjsvt8ht7',
        false,
    );
    for (let i = 0n; i < 5n; i++) {
        try {
            const result = await nft.tokenOfOwnerByIndex(deployerAddr, i);
            console.log(`tokenOfOwnerByIndex(deployer, ${i}): tokenId=${result.properties.tokenId}`);
        } catch (err: any) {
            console.log(`tokenOfOwnerByIndex(deployer, ${i}): ❌ ${err.message?.slice(0, 100)}`);
        }
    }

    console.log('\n=== Summary ===');
    console.log('Tokens start at ID 1 (not 0).');
    console.log('Token IDs are 1 through 20.');
    
    await provider.close();
}

main().catch((err) => {
    console.error('Script failed:', err);
    process.exit(1);
});
