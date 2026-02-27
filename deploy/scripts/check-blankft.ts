/**
 * Quick contract health check — verifies the BlankFT contract is indexed
 * and responding to OP721 standard calls.
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
const CONTRACT = 'opt1sqz7xdgzme4xpmt6rjqmhrxyflgj7tuh09s3k7mhe';

async function main(): Promise<void> {
    const provider = new JSONRpcProvider({ url: RPC_URL, network: NETWORK });

    console.log('=== BlankFT Contract Health Check ===\n');
    console.log(`Contract: ${CONTRACT}`);
    console.log(`RPC:      ${RPC_URL}\n`);

    // 1. Check if contract is indexed
    try {
        const info = await provider.getPublicKeyInfo(CONTRACT, false);
        console.log('✅ Contract is indexed on chain');
        console.log(`   Public key info: ${JSON.stringify(info).slice(0, 120)}...`);
    } catch (err) {
        console.error('❌ Contract NOT indexed:', err);
        await provider.close();
        return;
    }

    // 2. Get contract instance
    const nft = getContract<IOP721Contract>(
        CONTRACT,
        OP_721_ABI,
        provider,
        NETWORK,
    );

    // 3. Try metadata()
    try {
        const meta = await nft.metadata();
        console.log('\n✅ metadata() call succeeded');
        console.log(`   name:        ${meta.properties.name}`);
        console.log(`   symbol:      ${meta.properties.symbol}`);
        console.log(`   totalSupply: ${meta.properties.totalSupply}`);
    } catch (err) {
        console.error('\n❌ metadata() FAILED:', err);
    }

    // 4. Try ownerOf(0) — first token
    try {
        const result = await nft.ownerOf(0n);
        console.log(`\n✅ ownerOf(0) = ${result.properties.owner}`);
    } catch (err) {
        console.error('\n❌ ownerOf(0) FAILED:', err);
    }

    // 5. Try tokenURI(0)
    try {
        const result = await nft.tokenURI(0n);
        console.log(`✅ tokenURI(0) = "${result.properties.uri}"`);
    } catch (err) {
        console.error('❌ tokenURI(0) FAILED:', err);
    }

    // 6. Try balanceOf for deployer
    try {
        const deployerAddr = await provider.getPublicKeyInfo(
            'opt1psp5t7lrpe5qmatth3tnyykqdtxjepfcnqs6eqvcnd69yemnsrcjsvt8ht7',
            false,
        );
        const balance = await nft.balanceOf(deployerAddr);
        console.log(`✅ balanceOf(deployer) = ${balance.properties.balance}`);
    } catch (err) {
        console.error('❌ balanceOf(deployer) FAILED:', err);
    }

    console.log('\n=== Done ===');
    await provider.close();
}

main().catch((err) => {
    console.error('Script failed:', err);
    process.exit(1);
});
