import { networks, type Network } from '@btc-vision/bitcoin';

/** RPC endpoints keyed by network */
export const RPC_URLS: Record<string, string> = {
    testnet: 'https://testnet.opnet.org',
    mainnet: 'https://api.opnet.org',
    regtest: 'http://localhost:9001',
};

/** Default network for GremlinX (OPNet testnet / Signet-fork) */
export const DEFAULT_NETWORK: Network = networks.opnetTestnet;
export const DEFAULT_RPC_URL = 'https://testnet.opnet.org';
