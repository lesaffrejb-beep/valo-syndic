'use client';

import dynamic from 'next/dynamic';
import { type DiagnosticResult } from '@/lib/schemas';
import { useEffect, useState } from 'react';

// Dynamically import PDFDownloadLink to avoid SSR issues
const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
    {
        ssr: false,
        loading: () => (
            <button disabled className="btn-primary opacity-50 cursor-not-allowed">
                ⏳ Chargement du générateur PDF...
            </button>
        ),
    }
);

// We also need to dynamically import the Document component to avoid SSR issues if it uses browser APIs
// ensuring the entire PDF tree is client-side only.
import { PDFDocument } from './PDFDocument';

interface DownloadPdfButtonProps {
    result: DiagnosticResult;
}

export function DownloadPdfButton({ result }: DownloadPdfButtonProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null;
    }

    return (
        <PDFDownloadLink
            document={<PDFDocument result={result} />}
            fileName={`audit-valo-syndic-${new Date().toISOString().split('T')[0]}.pdf`}
            className="btn-primary flex items-center justify-center gap-2 group"
        >
            {/* @ts-ignore - render props signature issues in some versions */}
            {({ blob, url, loading, error }: any) =>
                loading ? (
                    '⏳ Génération du rapport...'
                ) : (
                    <>
                        📄 Télécharger le Rapport Officiel
                    </>
                )
            }
        </PDFDownloadLink>
    );
}
