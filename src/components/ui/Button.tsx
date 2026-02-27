import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    readonly variant?: 'primary' | 'secondary' | 'ghost';
    readonly size?: 'sm' | 'md' | 'lg';
    readonly children: ReactNode;
}

/** Themed button component. */
export function Button({
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    ...rest
}: ButtonProps): JSX.Element {
    return (
        <button className={`btn btn-${variant} btn-${size} ${className}`} {...rest}>
            {children}
        </button>
    );
}
