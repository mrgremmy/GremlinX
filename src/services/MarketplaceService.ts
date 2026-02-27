import type { Listing } from '../types/marketplace.ts';
import { MARKETPLACE_CONTRACT } from '../config/contracts.ts';
import { providerService } from './ProviderService.ts';
import { addressService } from './AddressService.ts';
import { getContract, type BaseContractProperties } from 'opnet';
import { ABIDataTypes, Address } from '@btc-vision/transaction';
import type { Network } from '@btc-vision/bitcoin';

/* ────────────────────────────────────────────────────────────
   Custom ABI for the GremlinMarketplace contract.
   Defines the methods we call from the frontend.
   ──────────────────────────────────────────────────────────── */

/**
 * Marketplace contract typed interface.
 * Each method returns a CallResult<T> from opnet.
 */
interface IMarketplaceContract extends BaseContractProperties {
    listNFT(collection: Address, tokenId: bigint, priceSats: bigint): Promise<{
        properties: { success: boolean };
        revert?: string;
        estimatedSatGas: bigint;
        sendTransaction: (params: unknown) => Promise<unknown>;
    }>;
    cancelListing(collection: Address, tokenId: bigint): Promise<{
        properties: { success: boolean };
        revert?: string;
        estimatedSatGas: bigint;
        sendTransaction: (params: unknown) => Promise<unknown>;
    }>;
    buyNFT(collection: Address, tokenId: bigint): Promise<{
        properties: { success: boolean };
        revert?: string;
        estimatedSatGas: bigint;
        sendTransaction: (params: unknown) => Promise<unknown>;
    }>;
    getListing(collection: Address, tokenId: bigint): Promise<{
        properties: { priceSats: bigint; seller: bigint };
        revert?: string;
    }>;
    getStats(): Promise<{
        properties: {
            totalVolume: bigint;
            totalSales: bigint;
            listingCount: bigint;
            feeBps: bigint;
        };
        revert?: string;
    }>;
}

/* ────────────────────────────────────────────────────────────
   Marketplace ABI definition.
   ──────────────────────────────────────────────────────────── */
const MARKETPLACE_ABI = [
    {
        name: 'listNFT',
        type: 'function',
        inputs: [
            { name: 'collection', type: ABIDataTypes.ADDRESS },
            { name: 'tokenId', type: ABIDataTypes.UINT256 },
            { name: 'priceSats', type: ABIDataTypes.UINT256 },
        ],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
    },
    {
        name: 'cancelListing',
        type: 'function',
        inputs: [
            { name: 'collection', type: ABIDataTypes.ADDRESS },
            { name: 'tokenId', type: ABIDataTypes.UINT256 },
        ],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
    },
    {
        name: 'buyNFT',
        type: 'function',
        inputs: [
            { name: 'collection', type: ABIDataTypes.ADDRESS },
            { name: 'tokenId', type: ABIDataTypes.UINT256 },
        ],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
    },
    {
        name: 'getListing',
        type: 'function',
        constant: true,
        inputs: [
            { name: 'collection', type: ABIDataTypes.ADDRESS },
            { name: 'tokenId', type: ABIDataTypes.UINT256 },
        ],
        outputs: [
            { name: 'priceSats', type: ABIDataTypes.UINT256 },
            { name: 'seller', type: ABIDataTypes.ADDRESS },
        ],
    },
    {
        name: 'getStats',
        type: 'function',
        constant: true,
        inputs: [],
        outputs: [
            { name: 'totalVolume', type: ABIDataTypes.UINT256 },
            { name: 'totalSales', type: ABIDataTypes.UINT256 },
            { name: 'listingCount', type: ABIDataTypes.UINT256 },
            { name: 'feeBps', type: ABIDataTypes.UINT256 },
        ],
    },
];

/* ────────────────────────────────────────────────────────────
   Marketplace Service — handles both mock and real modes.
   ──────────────────────────────────────────────────────────── */

class MarketplaceService {
    private static instance: MarketplaceService;

    /** In-memory mock listings for UI preview (when contract not deployed) */
    private mockListings: Map<string, Listing> = new Map();

    /** Cached contract instance */
    private contract: IMarketplaceContract | null = null;

    private constructor() {}

    public static getInstance(): MarketplaceService {
        if (!MarketplaceService.instance) {
            MarketplaceService.instance = new MarketplaceService();
        }
        return MarketplaceService.instance;
    }

    /** Whether the marketplace contract is deployed and ready. */
    public isContractLive(): boolean {
        return MARKETPLACE_CONTRACT !== null;
    }

    /**
     * Poll for transaction confirmation (1 block).
     * Resolves when the receipt is available or rejects on timeout/failure.
     * @param txHash  Transaction hash to watch
     * @param timeoutMs  Maximum wait time (default 5 minutes)
     * @param intervalMs  Poll interval (default 5 seconds)
     */
    public async waitForConfirmation(
        txHash: string,
        timeoutMs = 300_000,
        intervalMs = 5_000,
    ): Promise<void> {
        if (!txHash || txHash === 'submitted' || txHash === 'mock') return;

        const provider = providerService.getProvider();
        const deadline = Date.now() + timeoutMs;

        while (Date.now() < deadline) {
            try {
                const receipt = await provider.getTransactionReceipt(txHash);
                if (receipt) {
                    if (receipt.failed) {
                        throw new Error(receipt.revert ?? 'Transaction failed on-chain');
                    }
                    return; // Confirmed!
                }
            } catch (err: unknown) {
                // "not found" type errors are expected while pending — keep polling
                const msg = err instanceof Error ? err.message : '';
                if (msg.includes('failed') || msg.includes('revert')) throw err;
            }

            await new Promise((r) => setTimeout(r, intervalMs));
        }

        throw new Error('Transaction confirmation timed out. Check your wallet for status.');
    }

    /** Get the marketplace contract instance (cached). */
    private getContract(): IMarketplaceContract | null {
        if (!MARKETPLACE_CONTRACT) return null;
        if (this.contract) return this.contract;

        const provider = providerService.getProvider();
        const network: Network = providerService.getNetwork();

        this.contract = getContract<IMarketplaceContract>(
            MARKETPLACE_CONTRACT,
            MARKETPLACE_ABI as any,
            provider,
            network,
        );
        return this.contract;
    }

    /* ── Read methods ────────────────────────────────── */

    /** Get all mock listings (mock mode). */
    public getListings(): Listing[] {
        return Array.from(this.mockListings.values());
    }

    /** Get listing for a specific token — queries on-chain, falls back to mock. */
    public async getListingAsync(collection: string, tokenId: bigint): Promise<Listing | null> {
        const contract = this.getContract();
        if (contract) {
            try {
                // Resolve collection address to 0x hex tweaked pubkey
                const collHex = await addressService.resolveToTweakedPubkey(collection);
                if (!collHex) return null;
                const collAddr = Address.fromString(collHex);

                const result = await contract.getListing(collAddr, tokenId);
                if (result.revert || result.properties.priceSats === 0n) return null;
                return {
                    tokenId,
                    collectionAddress: collection,
                    seller: result.properties.seller.toString(16),
                    priceSats: result.properties.priceSats,
                    listedAt: 0,
                };
            } catch (err) {
                console.warn('[MarketplaceService] getListing on-chain failed:', err);
            }
        }

        // Mock fallback
        const key = `${collection.toLowerCase()}:${tokenId}`;
        return this.mockListings.get(key) ?? null;
    }

    /** Get listing (sync — mock only). */
    public getListing(collection: string, tokenId: bigint): Listing | null {
        const key = `${collection.toLowerCase()}:${tokenId}`;
        return this.mockListings.get(key) ?? null;
    }

    /** Fetch marketplace stats from on-chain contract. */
    public async getStatsAsync(): Promise<{
        totalVolume: bigint;
        totalSales: bigint;
        listingCount: bigint;
        feeBps: bigint;
    } | null> {
        const contract = this.getContract();
        if (!contract) return null;
        const result = await contract.getStats();
        if (result.revert) return null;
        return result.properties;
    }

    /* ── Write methods ───────────────────────────────── */

    /**
     * List an NFT for sale.
     * Resolves addresses, simulates on-chain, then sends transaction via wallet.
     * @param collection  Collection contract address (opt1sq... or 0x hex)
     * @param tokenId     Token ID to list
     * @param priceSats   Price in satoshis
     * @param senderAddress  The wallet's Address object from useWalletConnect (or null for mock)
     * @param refundAddress  The wallet's opt1p address for change output
     */
    public async listForSale(
        collection: string,
        tokenId: bigint,
        priceSats: bigint,
        senderAddress: Address | null,
        refundAddress: string,
    ): Promise<string> {
        const contract = this.getContract();

        if (contract && senderAddress) {
            // Resolve collection address to 0x hex tweaked pubkey
            const collHex = await addressService.resolveToTweakedPubkey(collection);
            if (!collHex) throw new Error('Could not resolve collection address');
            const collAddr = Address.fromString(collHex);

            // Set sender for simulation
            contract.setSender(senderAddress);

            // Simulate the listing
            const simulation = await contract.listNFT(
                collAddr,
                tokenId,
                priceSats,
            );

            if (simulation.revert) {
                throw new Error(simulation.revert);
            }

            // Send the real transaction via wallet (signer: null on frontend)
            const receipt = await simulation.sendTransaction({
                signer: null,
                mldsaSigner: null,
                refundTo: refundAddress,
                maximumAllowedSatToSpend: 50000n,
            });

            // Return the transaction hash
            const txHash = typeof receipt === 'object' && receipt !== null
                ? String((receipt as Record<string, unknown>)['transactionId'] ?? (receipt as Record<string, unknown>)['txid'] ?? 'submitted')
                : 'submitted';

            return txHash;
        }

        // Mock mode — no contract or not connected
        const key = `${collection.toLowerCase()}:${tokenId}`;
        this.mockListings.set(key, {
            tokenId,
            collectionAddress: collection,
            seller: refundAddress,
            priceSats,
            listedAt: Date.now(),
        });
        return 'mock';
    }

    /**
     * Buy an NFT.
     * Resolves addresses, simulates buyNFT on-chain, then sends transaction.
     */
    public async buyNFT(
        collection: string,
        tokenId: bigint,
        buyerAddress: Address | null,
        refundAddress: string,
    ): Promise<string> {
        const contract = this.getContract();

        if (contract && buyerAddress) {
            const collHex = await addressService.resolveToTweakedPubkey(collection);
            if (!collHex) throw new Error('Could not resolve collection address');
            const collAddr = Address.fromString(collHex);

            contract.setSender(buyerAddress);

            const simulation = await contract.buyNFT(collAddr, tokenId);

            if (simulation.revert) {
                throw new Error(simulation.revert);
            }

            const receipt = await simulation.sendTransaction({
                signer: null,
                mldsaSigner: null,
                refundTo: refundAddress,
                maximumAllowedSatToSpend: 50000n,
            });

            const txHash = typeof receipt === 'object' && receipt !== null
                ? String((receipt as Record<string, unknown>)['transactionId'] ?? (receipt as Record<string, unknown>)['txid'] ?? 'submitted')
                : 'submitted';

            return txHash;
        }

        throw new Error('Connect wallet to buy NFTs');
    }

    /**
     * Cancel a listing.
     * Resolves addresses, simulates cancelListing on-chain, then sends transaction.
     */
    public async cancelListing(
        collection: string,
        tokenId: bigint,
        sellerAddress: Address | null,
        refundAddress: string,
    ): Promise<string> {
        const contract = this.getContract();

        if (contract && sellerAddress) {
            const collHex = await addressService.resolveToTweakedPubkey(collection);
            if (!collHex) throw new Error('Could not resolve collection address');
            const collAddr = Address.fromString(collHex);

            contract.setSender(sellerAddress);

            const simulation = await contract.cancelListing(collAddr, tokenId);

            if (simulation.revert) {
                throw new Error(simulation.revert);
            }

            const receipt = await simulation.sendTransaction({
                signer: null,
                mldsaSigner: null,
                refundTo: refundAddress,
                maximumAllowedSatToSpend: 50000n,
            });

            const txHash = typeof receipt === 'object' && receipt !== null
                ? String((receipt as Record<string, unknown>)['transactionId'] ?? (receipt as Record<string, unknown>)['txid'] ?? 'submitted')
                : 'submitted';

            return txHash;
        }

        // Mock fallback
        const key = `${collection.toLowerCase()}:${tokenId}`;
        this.mockListings.delete(key);
        return 'mock';
    }

    /**
     * Approve the marketplace contract to transfer a specific NFT on behalf of the owner.
     * This must be called before listing — the marketplace needs approval to transfer
     * the NFT to the buyer when a purchase happens.
     *
     * @param collection  NFT collection address (opt1sq... or 0x hex)
     * @param tokenId     Token ID to approve
     * @param ownerAddress  The wallet's Address object (sender / owner)
     * @param refundAddress  The wallet's bech32 address for change
     * @returns Transaction hash of the approve call
     */
    public async approveForMarketplace(
        collection: string,
        tokenId: bigint,
        ownerAddress: Address,
        refundAddress: string,
    ): Promise<string> {
        if (!MARKETPLACE_CONTRACT) throw new Error('Marketplace contract not configured');

        const provider = providerService.getProvider();
        const network: Network = providerService.getNetwork();

        // Resolve the collection address
        const collHex = await addressService.resolveToTweakedPubkey(collection);
        if (!collHex) throw new Error('Could not resolve collection address');

        // Resolve marketplace address to 0x hex for the approve call
        const mktHex = await addressService.resolveToTweakedPubkey(MARKETPLACE_CONTRACT);
        if (!mktHex) throw new Error('Could not resolve marketplace address');
        const mktAddr = Address.fromString(mktHex);

        // ABI for the OP721 approve function
        const nftABI = [
            {
                name: 'approve',
                type: 'function',
                inputs: [
                    { name: 'operator', type: ABIDataTypes.ADDRESS },
                    { name: 'tokenId', type: ABIDataTypes.UINT256 },
                ],
                outputs: [],
            },
        ];

        // Create contract instance for the NFT collection
        const nftContract = getContract(
            collection,
            nftABI as any,
            provider,
            network,
        );

        nftContract.setSender(ownerAddress);

        // Simulate the approve call
        const simulation = await (nftContract as unknown as {
            approve(operator: Address, tokenId: bigint): Promise<{
                revert?: string;
                sendTransaction: (params: unknown) => Promise<unknown>;
            }>;
        }).approve(mktAddr, tokenId);

        if (simulation.revert) {
            throw new Error(simulation.revert);
        }

        const receipt = await simulation.sendTransaction({
            signer: null,
            mldsaSigner: null,
            refundTo: refundAddress,
            maximumAllowedSatToSpend: 50000n,
        });

        const txHash = typeof receipt === 'object' && receipt !== null
            ? String((receipt as Record<string, unknown>)['transactionId'] ?? (receipt as Record<string, unknown>)['txid'] ?? 'submitted')
            : 'submitted';

        return txHash;
    }

    /** Clear cached contract and mock data. */
    public clearCache(): void {
        this.mockListings.clear();
        this.contract = null;
    }
}

export const marketplaceService = MarketplaceService.getInstance();
