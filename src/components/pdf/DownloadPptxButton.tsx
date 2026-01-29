'use client';

import dynamic from 'next/dynamic';
import { type DiagnosticResult } from '@/lib/schemas';
import { useState, useEffect } from 'react';

// Dynamic import to avoid SSR issues with pptxgenjs
const PptxButtonContent = dynamic(
    () => import('./PptxButtonContent').then((mod) => mod.PptxButtonContent),
    {
        ssr: false,
        loading: () => (
            <button disabled className="btn-secondary opacity-50 cursor-not-allowed flex items-center gap-2">
                <span className="animate-spin">*</span>
                <span className="hidden sm:inline">Chargement...</span>
            </button>
        ),
    }
);

interface DownloadPptxButtonProps {
    result: DiagnosticResult;
}

export function DownloadPptxButton({ result }: DownloadPptxButtonProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    return <PptxButtonContent result={result} />;
}

export default DownloadPptxButton;
