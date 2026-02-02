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
            <div className="absolute inset-0 bg-gradient-to-br from-deep via-deep-light to-deep">
                {/* Subtle radial gradient for depth */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)]" />
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
                <div className="absolute inset-0 bg-gradient-to-br from-deep via-deep-light to-deep animate-pulse" />
            )}

            {/* Subtle vignette for depth */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,7,0.8)_100%)]" />
        </div>
    );
};
