import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de sécurité Next.js
 * Ajoute les headers de sécurité recommandés
 */
export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Content Security Policy
    // Permet les scripts/styles inline (nécessaire pour Next.js et certaines libs)
    response.headers.set(
        'Content-Security-Policy',
        [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data:",
            "worker-src 'self' blob: data: 'unsafe-eval' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline'",
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
