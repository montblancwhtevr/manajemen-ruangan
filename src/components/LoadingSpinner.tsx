'use client';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    label?: string;
    fullPage?: boolean;
}

export default function LoadingSpinner({
    size = 'md',
    label,
    fullPage = false
}: LoadingSpinnerProps) {
    const spinner = (
        <div className={`spinner-container ${fullPage ? 'full-page' : ''}`}>
            <div className={`spinner spinner-${size}`} />
            {label && <p className="mt-2 text-muted">{label}</p>}

            <style jsx>{`
                .full-page {
                    min-height: 100vh;
                    width: 100%;
                }
            `}</style>
        </div>
    );

    return spinner;
}
