import { useState, useCallback, useContext, createContext, type ReactNode } from 'react';
import type { ToastMessage, ToastType } from '../types/common.ts';

interface ToastContextValue {
    readonly toasts: readonly ToastMessage[];
    readonly addToast: (type: ToastType, title: string, message: string) => void;
    readonly removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { readonly children: ReactNode }): JSX.Element {
    const [toasts, setToasts] = useState<readonly ToastMessage[]>([]);

    const removeToast = useCallback((id: string): void => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback(
        (type: ToastType, title: string, message: string): void => {
            const id = `toast-${++nextId}`;
            const toast: ToastMessage = { id, type, title, message };
            setToasts((prev) => [...prev, toast]);

            setTimeout(() => {
                removeToast(id);
            }, 5000);
        },
        [removeToast],
    );

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
