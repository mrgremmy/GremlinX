# GremlinX Deployment

Deploy OP721 NFT collections + the GremlinMarketplace contract on OPNet testnet.

## Contracts

### NFT Collections (OP721)

| Name | Symbol | Supply |
|------|--------|--------|
| Bitcoin Apes | BAPE | 20 |
| OPNet Punks | OPNK | 20 |
| Chain Glyphs | GLYPH | 20 |

### Marketplace

| Contract | Fee |
|----------|-----|
| GremlinMarketplace | 2.5% (250 bps) |

## Prerequisites

- **Node.js 20+**
- **OPNet testnet wallet** with funded BTC (signet)
- **24-word mnemonic** for the deployer wallet

## Step 1: Build ALL Contracts

```bash
cd contract
npm install
npm run build:all
```

This compiles both `GremlinNFT.wasm` and `GremlinMarketplace.wasm` to `contract/build/`.

## Step 2: Deploy NFT Collections

```bash
cd scripts
npm install

# Set your mnemonic (funded OPNet testnet wallet)
# Windows:
set MNEMONIC=word1 word2 word3 ... word24

# Linux/Mac:
export MNEMONIC="word1 word2 word3 ... word24"

npm run deploy
```

This deploys all 3 collections and saves addresses to `deployed-collections.json`.

## Step 3: Mint NFTs

```bash
npm run mint
```

Mints 20 NFTs per collection to the deployer wallet.

## Step 4: Deploy Marketplace

```bash
npm run deploy:marketplace
```

Deploys the GremlinMarketplace contract. Saves the address to `deployed-marketplace.json`.

## Step 5: Check Status

```bash
npm run status
```

## Step 6: Update Frontend

After deployment, update `gremlinx/src/config/contracts.ts`:

```typescript
export const KNOWN_COLLECTIONS: readonly KnownCollection[] = [
    { address: '<bitcoin-apes-address>', name: 'Bitcoin Apes' },
    { address: '<opnet-punks-address>', name: 'OPNet Punks' },
    { address: '<chain-glyphs-address>', name: 'Chain Glyphs' },
];

export const MARKETPLACE_CONTRACT: string | null = '<marketplace-address>';
```

The frontend will then fetch real on-chain data and use the marketplace contract for listings/purchases.

## Deploy Everything at Once

```bash
cd contract && npm install && npm run build:all
cd ../scripts && npm install
set MNEMONIC=your 24 word mnemonic here
npm run deploy:all
npm run mint
```

## Getting Testnet BTC

OPNet testnet uses a Signet fork. To get testnet BTC:
1. Use the OPNet testnet faucet (if available)
2. Or mine on the OPNet testnet node: https://github.com/btc-vision/bitcoin-core-opnet-testnet
