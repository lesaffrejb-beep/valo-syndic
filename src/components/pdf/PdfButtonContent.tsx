'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { PDFDocument } from './PDFDocument';
import { type DiagnosticResult } from '@/lib/schemas';
import { useBrandStore } from "@/stores/useBrandStore";

interface PdfButtonContentProps {
    result: DiagnosticResult;
}

export function PdfButtonContent({ result }: PdfButtonContentProps) {
    const brand = useBrandStore((state) => state.brand);

    // Transform brand for PDF compatibility (null → undefined)
    const pdfBrand = brand ? {
        agencyName: brand.agencyName,
        primaryColor: brand.primaryColor,
        logoUrl: brand.logoUrl ?? undefined,
        contactEmail: brand.contactEmail,
    } : undefined;

    return (
        <PDFDownloadLink
            document={<PDFDocument result={result} brand={pdfBrand as any} />}
            fileName={`audit-valo-syndic-${new Date().toISOString().split('T')[0]}.pdf`}
            className="btn-primary flex items-center justify-center gap-2 group cursor-pointer hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
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
