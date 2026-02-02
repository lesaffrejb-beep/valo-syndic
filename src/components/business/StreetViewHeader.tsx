"use client";

import { useEffect, useState } from "react";

interface StreetViewHeaderProps {
    address?: string | undefined;
    coordinates?: {
        latitude: number;
        longitude: number;
    } | undefined;
}

/**
 * STREET VIEW HEADER
 * Affiche la façade de l'immeuble via Google Maps Static API
 * Fallback : Dégradé élégant si pas de clé API ou erreur
 * Full-screen background version for hero section
 */
export const StreetViewHeader = ({ address, coordinates }: StreetViewHeaderProps) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

    // Construire l'URL Street View - larger image for full background
    const streetViewUrl = apiKey && (coordinates || address)
        ? `https://maps.googleapis.com/maps/api/streetview?size=1600x900&location=${coordinates
            ? `${coordinates.latitude},${coordinates.longitude}`
            : encodeURIComponent(address || '')
        }&key=${apiKey}&fov=100&pitch=5`
        : null;

    useEffect(() => {
        setImageLoaded(false);
        setImageError(false);
    }, [streetViewUrl, apiKey]);

    // Fallback: Elegant gradient with subtle texture (no text overlay - handled by parent)
    if (!streetViewUrl || imageError) {
        return (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
                {/* Subtle radial gradient for depth */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)]" />
                {/* Noise texture for premium feel */}
                <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.9%22%20numOctaves%3D%221%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23noiseFilter%29%22%20opacity%3D%220.03%22%2F%3E%3C%2Fsvg%3E')]" />
            </div>
        );
    }

    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Image Street View - Full cover */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={streetViewUrl}
                alt={`Façade - ${address}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 scale-105 ${imageLoaded ? 'opacity-40' : 'opacity-0'
                    }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
            />

            {/* Loading state */}
            {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 animate-pulse" />
            )}

            {/* Subtle vignette for depth */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        </div>
    );
};
