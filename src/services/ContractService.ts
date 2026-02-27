import { getContract, type IOP721Contract, OP_721_ABI } from 'opnet';
import { Address } from '@btc-vision/transaction';
import { providerService } from './ProviderService.ts';

/**
 * Cached contract instances.
 * getContract is called ONCE per address and reused.
 */
class ContractService {
    private static instance: ContractService;
    private nftContracts: Map<string, IOP721Contract> = new Map();

    private constructor() {}

    public static getInstance(): ContractService {
        if (!ContractService.instance) {
            ContractService.instance = new ContractService();
        }
        return ContractService.instance;
    }

    /**
     * Get or create an OP721 contract instance.
     * @param address - Collection contract address (op1 or 0x format).
     * @param sender  - Optional sender address for simulation context.
     */
    public getNFTContract(address: string, sender?: Address): IOP721Contract {
        const key = address.toLowerCase();
        const cached = this.nftContracts.get(key);
        if (cached) return cached;

        const provider = providerService.getProvider();
        const network = providerService.getNetwork();
        const contract = getContract<IOP721Contract>(
            address,
            OP_721_ABI,
            provider,
            network,
            sender,
        );

        this.nftContracts.set(key, contract);
        return contract;
    }

    /** Clear all cached contracts (call on network change). */
    public clearCache(): void {
        this.nftContracts.clear();
    }
}

export const contractService = ContractService.getInstance();
