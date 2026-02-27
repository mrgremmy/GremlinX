import { useToast } from '../../hooks/useToast.tsx';

/** Toast notification container — fixed bottom-right. */
export function ToastContainer(): JSX.Element {
    const { toasts, removeToast } = useToast();

    return (
        <div className="toast-container">
            {toasts.map((t) => (
                <div key={t.id} className={`toast toast-${t.type}`}>
                    <div className="toast-content">
                        <strong className="toast-title">{t.title}</strong>
                        <p className="toast-message">{t.message}</p>
                    </div>
                    <button className="toast-dismiss" onClick={(): void => removeToast(t.id)}>
                        &times;
                    </button>
                </div>
            ))}
        </div>
    );
}
