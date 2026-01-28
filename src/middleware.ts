import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de sécurité Next.js
 * Ajoute les headers de sécurité recommandés (X-Frame-Options, etc.)
 */
export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Empêche l'inclusion dans un iframe (clickjacking protection)
    response.headers.set('X-Frame-Options', 'DENY');

    // Empêche le sniffing MIME type
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // Politique de référent restrictive
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // XSS Protection (legacy browsers)
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;
}

export const config = {
    matcher: '/:path*',
};
