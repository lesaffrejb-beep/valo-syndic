import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de sécurité Next.js
 * Ajoute les headers de sécurité recommandés
 */
export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Content Security Policy
    // Durcir la politique : retirer 'unsafe-eval' et 'unsafe-inline'
    response.headers.set(
        'Content-Security-Policy',
        [
            "default-src 'self'",
            // Autoriser les scripts depuis self et blobs/ data (maps reste autorisé explicitement)
            "script-src 'self' blob: data: https://maps.googleapis.com",
            // Workers autorisés depuis self et blobs
            "worker-src 'self' blob: data:",
            // Interdire les styles inline pour durcir la CSP
            "style-src 'self'",
            "img-src 'self' data: blob: maps.googleapis.com maps.gstatic.com",
            "font-src 'self' data:",
            "connect-src 'self' https://api-adresse.data.gouv.fr https://georisques.gouv.fr https://maps.googleapis.com *.sentry.io data:",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ].join('; ')
    );

    // Empêche l'inclusion dans un iframe (clickjacking protection)
    response.headers.set('X-Frame-Options', 'DENY');

    // Empêche le sniffing MIME type
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // Politique de référent restrictive
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // XSS Protection (legacy browsers)
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Permissions Policy (limiter les API navigateur)
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=()'
    );

    return response;
}

export const config = {
    matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
