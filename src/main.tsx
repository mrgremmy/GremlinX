import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { WalletConnectProvider } from '@btc-vision/walletconnect';
import { ToastProvider } from './hooks/useToast.tsx';
import { App } from './App.tsx';
import './styles/globals.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

createRoot(rootEl).render(
    <StrictMode>
        <WalletConnectProvider theme="dark">
            <ToastProvider>
                <App />
            </ToastProvider>
        </WalletConnectProvider>
    </StrictMode>,
);
