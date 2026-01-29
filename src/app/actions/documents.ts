'use server';

import { renderToStream } from '@react-pdf/renderer';
import PptxGenJS from 'pptxgenjs';
import { generateAGPresentation } from '@/lib/pptx';
import { PDFDocumentEnhanced } from '@/components/pdf/PDFDocumentEnhanced';
import { type DiagnosticResult } from '@/lib/schemas';
import React from 'react';

/**
 * Server Action to generate PDF
 * Returns a base64 string of the PDF
 */
export async function generatePdfAction(
    result: DiagnosticResult,
    brand?: any,
    targetProfile?: any
): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
        const stream = await renderToStream(
            React.createElement(PDFDocumentEnhanced, {
                result,
                brand,
                targetProfile,
                showAllProfiles: true
            }) as React.ReactElement
        );

        // Convert stream to buffer
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
            chunks.push(Buffer.from(chunk));
        }
        const buffer = Buffer.concat(chunks);

        return {
            success: true,
            data: buffer.toString('base64')
        };
    } catch (error) {
        console.error('PDF Generation Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Server Action to generate PPTX
 * Returns a base64 string of the PPTX
 */
export async function generatePptxAction(
    result: DiagnosticResult,
    brand?: any
): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
        // Output as base64 directly
        const data = await generateAGPresentation(result, brand, undefined, 'base64');

        return {
            success: true,
            data: data as string
        };
    } catch (error) {
        console.error('PPTX Generation Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
