import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
    readonly icon?: ReactNode;
    readonly heading: string;
    readonly description?: string;
    readonly actionLabel?: string;
    readonly actionHref?: string;
    readonly onAction?: () => void;
}

/** Centered empty / error state used site-wide. */
export function EmptyState({
    icon,
    heading,
    description,
    actionLabel,
    actionHref,
    onAction,
}: EmptyStateProps): JSX.Element {
    const navigate = useNavigate();

    function handleAction(): void {
        if (onAction) {
            onAction();
        } else if (actionHref) {
            void navigate(actionHref);
        }
    }

    return (
        <div className="empty-state">
            {icon && <div className="empty-state-icon">{icon}</div>}
            <h2 className="empty-state-heading">{heading}</h2>
            {description && <p className="empty-state-description">{description}</p>}
            {actionLabel && (
                <button className="btn btn-primary btn-md empty-state-action" onClick={handleAction}>
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

/* ====== Reusable SVG icons for empty states ====== */

export function SearchIcon(): JSX.Element {
    return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    );
}

export function CollectionIcon(): JSX.Element {
    return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    );
}

export function ImageOffIcon(): JSX.Element {
    return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
        </svg>
    );
}

export function WalletIcon(): JSX.Element {
    return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M16 10h.01" />
            <path d="M2 10h20" />
        </svg>
    );
}

export function AlertIcon(): JSX.Element {
    return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );
}

export function GalleryIcon(): JSX.Element {
    return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="2" />
            <path d="M7 2v20" />
            <path d="M17 2v20" />
            <path d="M2 12h20" />
            <path d="M2 7h5" />
            <path d="M2 17h5" />
            <path d="M17 7h5" />
            <path d="M17 17h5" />
        </svg>
    );
}
