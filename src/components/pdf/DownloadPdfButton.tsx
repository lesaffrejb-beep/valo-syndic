'use client';

import dynamic from 'next/dynamic';
import { type DiagnosticResult } from '@/lib/schemas';
import { useState, useEffect } from 'react';

// Dynamic import of the component that uses @react-pdf/renderer
// ensuring NO imports from that library happen in the main bundle/SSR.
const PdfButtonContent = dynamic(
    () => import('./PdfButtonContent').then((mod) => mod.PdfButtonContent),
    {
        ssr: false,
        loading: () => (
            <button disabled className="btn-primary opacity-50 cursor-not-allowed flex items-center gap-2">
                ⏳ <span className="hidden sm:inline">Chargement PDF...</span>
            </button>
        ),
    }
);

interface DownloadPdfButtonProps {
    result: DiagnosticResult;
}

export function DownloadPdfButton({ result }: DownloadPdfButtonProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    return <PdfButtonContent result={result} />;
}
