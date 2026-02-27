/** Toast notification severity */
export type ToastType = 'success' | 'error' | 'info' | 'pending';

/** A single toast notification */
export interface ToastMessage {
    readonly id: string;
    readonly type: ToastType;
    readonly title: string;
    readonly message: string;
}
