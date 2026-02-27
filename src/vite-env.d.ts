/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

// React 19 no longer exposes global JSX namespace.
// Re-export for convenience with strict TypeScript.
import type { JSX as ReactJSX } from 'react';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface Element extends ReactJSX.Element {}
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface IntrinsicElements extends ReactJSX.IntrinsicElements {}
    }
}
