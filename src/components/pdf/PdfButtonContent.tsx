'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { PDFDocument } from './PDFDocument';
import { type DiagnosticResult } from '@/lib/schemas';

interface PdfButtonContentProps {
    result: DiagnosticResult;
}

export function PdfButtonContent({ result }: PdfButtonContentProps) {
    return (
        <PDFDownloadLink
            document={<PDFDocument result={result} />}
            fileName={`audit-valo-syndic-${new Date().toISOString().split('T')[0]}.pdf`}
            className="btn-primary flex items-center justify-center gap-2 group cursor-pointer"
        >
            {/* @ts-ignore */}
            {({ blob, url, loading, error }: any) => {
                if (loading) {
                    return (
                        <>
                            <span className="animate-spin">⏳</span>
                            <span>Génération...</span>
                        </>
                    );
                }
                return (
                    <>
                        <span>📄</span>
                        <span>Télécharger le Rapport</span>
                    </>
                );
            }}
        </PDFDownloadLink>
    );
}
