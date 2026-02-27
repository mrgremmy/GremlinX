import { u256 } from '@btc-vision/as-bignum/assembly';
import {
    OP721,
    OP721InitParameters,
    Blockchain,
    Calldata,
    BytesWriter,
    SafeMath,
    Revert,
} from '@btc-vision/btc-runtime/runtime';

// White 400x400 SVG encoded as base64 (for data URI)
const WHITE_SVG_B64: string =
    'PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MDAnIGhlaWdodD0nNDAwJz48cmVjdCB3aWR0aD0nNDAwJyBoZWlnaHQ9JzQwMCcgZmlsbD0nd2hpdGUnLz48L3N2Zz4=';

/**
 * GremlinNFT — OP721 collection for GremlinX marketplace.
 * Overrides tokenURI to return proper inline JSON metadata with a white SVG.
 */
@final
export class GremlinNFT extends OP721 {
    public constructor() {
        super();
    }

    /**
     * Called once on deployment. Reads constructor params from calldata.
     * Calldata layout:
     *   - string: name
     *   - string: symbol
     *   - string: baseURI (unused — tokenURI is overridden)
     *   - u256:   maxSupply
     */
    public override onDeployment(calldata: Calldata): void {
        const name: string = calldata.readStringWithLength();
        const symbol: string = calldata.readStringWithLength();
        const baseURI: string = calldata.readStringWithLength();
        const maxSupply: u256 = calldata.readU256();

        this.instantiate(
            new OP721InitParameters(name, symbol, baseURI, maxSupply),
        );
    }

    /**
     * Override tokenURI to return proper JSON metadata inline.
     * Returns: data:application/json,{"name":"...","description":"...","image":"data:image/svg+xml;base64,..."}
     */
    @method({ name: 'tokenId', type: ABIDataTypes.UINT256 })
    @returns({ name: 'uri', type: ABIDataTypes.STRING })
    public override tokenURI(calldata: Calldata): BytesWriter {
        const tokenId = calldata.readU256();
        if (!this._exists(tokenId)) throw new Revert('Token does not exist');

        // Build JSON metadata with inline white SVG
        // Avoid # in data URI (it's a fragment separator) — use dash instead
        const json: string =
            '{"name":"' +
            this.name +
            ' ' +
            tokenId.toString() +
            '","description":"A blank white NFT on Bitcoin L1","image":"data:image/svg+xml;base64,' +
            WHITE_SVG_B64 +
            '"}';

        const uri: string = 'data:application/json,' + json;

        const w = new BytesWriter(String.UTF8.byteLength(uri) + 4);
        w.writeStringWithLength(uri);
        return w;
    }

    /**
     * Mint `quantity` NFTs to a given address. Only deployer may call.
     */
    @method(
        { name: 'to', type: ABIDataTypes.ADDRESS },
        { name: 'quantity', type: ABIDataTypes.UINT256 },
    )
    @returns({ name: 'success', type: ABIDataTypes.BOOL })
    @emit('Transferred')
    public mint(calldata: Calldata): BytesWriter {
        this.onlyDeployer(Blockchain.tx.sender);

        const to = calldata.readAddress();
        const quantity = calldata.readU256();

        const currentSupply = this.totalSupply;
        const max = this.maxSupply;

        if (SafeMath.add(currentSupply, quantity) > max) {
            throw new Revert('Exceeds max supply');
        }

        for (let i: u256 = u256.Zero; i < quantity; i = SafeMath.add(i, u256.One)) {
            const tokenId = this._nextTokenId.value;
            this._mint(to, tokenId);
            this._nextTokenId.value = SafeMath.add(tokenId, u256.One);
        }

        const writer: BytesWriter = new BytesWriter(1);
        writer.writeBoolean(true);
        return writer;
    }
}
