'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { ConvocationDocument } from './ConvocationDocument';
import { type DiagnosticResult } from '@/lib/schemas';
import { useBrand } from '@/context/BrandContext';

interface ConvocationButtonContentProps {
    result: DiagnosticResult;
}

export function ConvocationButtonContent({ result }: ConvocationButtonContentProps) {
    const { brand } = useBrand();

    return (
        <PDFDownloadLink
            document={<ConvocationDocument result={result} brand={brand} />}
            fileName={`convocation-ag-${new Date().toISOString().split('T')[0]}.pdf`}
            className="btn-secondary flex items-center justify-center gap-2 group cursor-pointer"
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
                        <span>⚖️</span>
                        <span>Projet de Résolution</span>
                    </>
                );
            }}
        </PDFDownloadLink>
    );
}
