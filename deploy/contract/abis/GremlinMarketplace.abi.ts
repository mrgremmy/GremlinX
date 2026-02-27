import { ABIDataTypes, BitcoinAbiTypes, OP_NET_ABI } from 'opnet';

export const GremlinMarketplaceEvents = [];

export const GremlinMarketplaceAbi = [
    {
        name: 'listNFT',
        inputs: [
            { name: 'collection', type: ABIDataTypes.ADDRESS },
            { name: 'tokenId', type: ABIDataTypes.UINT256 },
            { name: 'priceSats', type: ABIDataTypes.UINT256 },
        ],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'cancelListing',
        inputs: [
            { name: 'collection', type: ABIDataTypes.ADDRESS },
            { name: 'tokenId', type: ABIDataTypes.UINT256 },
        ],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'buyNFT',
        inputs: [
            { name: 'collection', type: ABIDataTypes.ADDRESS },
            { name: 'tokenId', type: ABIDataTypes.UINT256 },
        ],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getListing',
        inputs: [
            { name: 'collection', type: ABIDataTypes.ADDRESS },
            { name: 'tokenId', type: ABIDataTypes.UINT256 },
        ],
        outputs: [
            { name: 'priceSats', type: ABIDataTypes.UINT256 },
            { name: 'seller', type: ABIDataTypes.ADDRESS },
        ],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getStats',
        inputs: [],
        outputs: [
            { name: 'totalVolume', type: ABIDataTypes.UINT256 },
            { name: 'totalSales', type: ABIDataTypes.UINT256 },
            { name: 'listingCount', type: ABIDataTypes.UINT256 },
            { name: 'feeBps', type: ABIDataTypes.UINT256 },
        ],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'setFee',
        inputs: [{ name: 'feeBps', type: ABIDataTypes.UINT256 }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'setFeeRecipient',
        inputs: [{ name: 'recipient', type: ABIDataTypes.ADDRESS }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'setPaused',
        inputs: [{ name: 'paused', type: ABIDataTypes.BOOL }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    ...GremlinMarketplaceEvents,
    ...OP_NET_ABI,
];

export default GremlinMarketplaceAbi;
