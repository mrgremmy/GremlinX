import { Blockchain } from '@btc-vision/btc-runtime/runtime';
import { GremlinMarketplace } from './GremlinMarketplace';
import { revertOnError } from '@btc-vision/btc-runtime/runtime/abort/abort';

// Factory — required by OPNet runtime
Blockchain.contract = (): GremlinMarketplace => {
    return new GremlinMarketplace();
};

// Runtime exports
export * from '@btc-vision/btc-runtime/runtime/exports';

// Abort handler
export function abort(
    message: string,
    fileName: string,
    line: u32,
    column: u32,
): void {
    revertOnError(message, fileName, line, column);
}
