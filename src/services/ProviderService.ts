import { JSONRpcProvider } from 'opnet';
import { type Network } from '@btc-vision/bitcoin';
import { DEFAULT_NETWORK, DEFAULT_RPC_URL } from '../config/networks.ts';

/**
 * Singleton provider service.
 * Never create multiple JSONRpcProvider instances.
 */
class ProviderService {
    private static instance: ProviderService;
    private provider: JSONRpcProvider | null = null;
    private currentNetwork: Network = DEFAULT_NETWORK;

    private constructor() {}

    public static getInstance(): ProviderService {
        if (!ProviderService.instance) {
            ProviderService.instance = new ProviderService();
        }
        return ProviderService.instance;
    }

    /** Get or create the singleton provider. */
    public getProvider(): JSONRpcProvider {
        if (!this.provider) {
            this.provider = new JSONRpcProvider({
                url: DEFAULT_RPC_URL,
                network: this.currentNetwork,
            });
        }
        return this.provider;
    }

    /** Current network. */
    public getNetwork(): Network {
        return this.currentNetwork;
    }

    /** Switch network — destroys and recreates the provider. */
    public switchNetwork(network: Network, rpcUrl: string): void {
        this.currentNetwork = network;
        this.provider = new JSONRpcProvider({ url: rpcUrl, network });
    }
}

export const providerService = ProviderService.getInstance();
