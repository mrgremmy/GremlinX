interface SkeletonProps {
    readonly className?: string;
}

/** Animated loading skeleton placeholder. */
export function Skeleton({ className = '' }: SkeletonProps): JSX.Element {
    return <div className={`skeleton ${className}`} />;
}
