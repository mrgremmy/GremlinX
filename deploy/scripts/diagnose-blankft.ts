/**
 * Deep diagnostic for BlankFT contract — tests every OP721 method
 * that OP_WALLET would call during "Import NFT Collection".
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
const DEPLOYER = 'opt1psp5t7lrpe5qmatth3tnyykqdtxjepfcnqs6eqvcnd69yemnsrcjsvt8ht7';

async function main(): Promise<void> {
    const provider = new JSONRpcProvider({ url: RPC_URL, network: NETWORK });

    console.log('=== BlankFT Deep Diagnostic ===\n');
    console.log(`Contract: ${CONTRACT}`);
    console.log(`Deployer: ${DEPLOYER}\n`);

    // 1. getPublicKeyInfo on contract
    console.log('--- Test 1: getPublicKeyInfo(contract) ---');
    try {
        const info = await provider.getPublicKeyInfo(CONTRACT, false);
        console.log('  ✅ OK:', JSON.stringify(info).slice(0, 200));
    } catch (err: any) {
        console.log('  ❌ FAILED:', err.message?.slice(0, 200));
    }

    // 2. getPublicKeysInfoRaw on contract
    console.log('\n--- Test 2: getPublicKeysInfoRaw(contract) ---');
    try {
        const raw = await (provider as any).getPublicKeysInfoRaw(CONTRACT);
        console.log('  ✅ OK:', JSON.stringify(raw).slice(0, 200));
    } catch (err: any) {
        console.log('  ❌ FAILED:', err.message?.slice(0, 200));
    }

    // 3. Get contract instance
    const nft = getContract<IOP721Contract>(
        CONTRACT,
        OP_721_ABI,
        provider,
        NETWORK,
    );

    // 4. metadata()
    console.log('\n--- Test 3: metadata() ---');
    try {
        const meta = await nft.metadata();
        console.log('  ✅ OK');
        console.log('  name:', meta.properties.name);
        console.log('  symbol:', meta.properties.symbol);
        console.log('  totalSupply:', String(meta.properties.totalSupply));
        console.log('  All properties:', JSON.stringify(meta.properties, (_, v) => typeof v === 'bigint' ? v.toString() : v));
    } catch (err: any) {
        console.log('  ❌ FAILED:', err.message?.slice(0, 200));
    }

    // 5. ownerOf(0)
    console.log('\n--- Test 4: ownerOf(0n) ---');
    try {
        const result = await nft.ownerOf(0n);
        console.log('  ✅ OK, owner:', String(result.properties.owner));
    } catch (err: any) {
        console.log('  ❌ FAILED:', err.message?.slice(0, 200));
    }

    // 6. ownerOf(1)
    console.log('\n--- Test 5: ownerOf(1n) ---');
    try {
        const result = await nft.ownerOf(1n);
        console.log('  ✅ OK, owner:', String(result.properties.owner));
    } catch (err: any) {
        console.log('  ❌ FAILED:', err.message?.slice(0, 200));
    }

    // 7. tokenURI(0)
    console.log('\n--- Test 6: tokenURI(0n) ---');
    try {
        const result = await nft.tokenURI(0n);
        console.log('  ✅ OK, uri:', JSON.stringify(String(result.properties.uri)));
    } catch (err: any) {
        console.log('  ❌ FAILED:', err.message?.slice(0, 200));
    }

    // 8. balanceOf(deployer)
    console.log('\n--- Test 7: balanceOf(deployer) ---');
    try {
        const deployerAddr = await provider.getPublicKeyInfo(DEPLOYER, false);
        const balance = await nft.balanceOf(deployerAddr);
        console.log('  ✅ OK, balance:', String(balance.properties.balance));
    } catch (err: any) {
        console.log('  ❌ FAILED:', err.message?.slice(0, 200));
    }

    // 9. tokenOfOwnerByIndex(deployer, 0)
    console.log('\n--- Test 8: tokenOfOwnerByIndex(deployer, 0) ---');
    try {
        const deployerAddr = await provider.getPublicKeyInfo(DEPLOYER, false);
        const result = await nft.tokenOfOwnerByIndex(deployerAddr, 0n);
        console.log('  ✅ OK, tokenId:', String(result.properties.tokenId));
    } catch (err: any) {
        console.log('  ❌ FAILED:', err.message?.slice(0, 200));
    }

    // 10. Check if mint TX is confirmed
    console.log('\n--- Test 9: Check mint TX ---');
    const MINT_TX = '96ff5f1cbe6171449a82598f3aa9e555c873c9414df241b43bbc1fb8613c5f1d';
    try {
        const tx = await provider.getTransaction(MINT_TX);
        console.log('  ✅ TX found:', tx ? 'yes' : 'no');
        if (tx) {
            console.log('  Status:', JSON.stringify(tx).slice(0, 300));
        }
    } catch (err: any) {
        console.log('  ❌ FAILED:', err.message?.slice(0, 200));
    }

    console.log('\n=== Done ===');
    await provider.close();
}

main().catch((err) => {
    console.error('Script failed:', err);
    process.exit(1);
});
