'use client';

import dynamic from 'next/dynamic';
import { type DiagnosticResult } from '@/lib/schemas';
import { useState, useEffect } from 'react';

// Dynamic import ensuring NO imports from @react-pdf/renderer happen in SSR
const ConvocationButtonContent = dynamic(
    () => import('./ConvocationButtonContent').then((mod) => mod.ConvocationButtonContent),
    {
        ssr: false,
        loading: () => (
            <button disabled className="btn-secondary opacity-50 cursor-not-allowed flex items-center gap-2">
                ⏳ <span className="hidden sm:inline">Chargement...</span>
            </button>
        ),
    }
);

interface DownloadConvocationButtonProps {
    result: DiagnosticResult;
}

export function DownloadConvocationButton({ result }: DownloadConvocationButtonProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    return <ConvocationButtonContent result={result} />;
}
