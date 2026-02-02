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
 */
export const StreetViewHeader = ({ address, coordinates }: StreetViewHeaderProps) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

    // Construire l'URL Street View
    const streetViewUrl = apiKey && (coordinates || address)
        ? `https://maps.googleapis.com/maps/api/streetview?size=1200x400&location=${coordinates
            ? `${coordinates.latitude},${coordinates.longitude}`
            : encodeURIComponent(address || '')
        }&key=${apiKey}&fov=90&pitch=0`
        : null;

    useEffect(() => {
        // Debug logs requested by user


        setImageLoaded(false);
        setImageError(false);
    }, [streetViewUrl, apiKey]);

    // Fallback : Dégradé élégant (ou erreur rouge si debug)
    if (!streetViewUrl || imageError) {
        return (
            <div className={`relative w-full h-64 lg:h-80 rounded-2xl overflow-hidden flex items-center justify-center ${imageError ? 'bg-red-900/20 border border-red-500/50' : 'bg-gradient-to-r from-zinc-900 to-zinc-800'
                }`}>
                <div className="text-center z-10 px-6">
                    <h2 className={`text-3xl lg:text-4xl font-bold mb-2 ${imageError ? 'text-red-500' : 'text-white'}`}>
                        {imageError ? "Erreur Google Maps" : (address || "Copropriété")}
                    </h2>
                    <p className={`${imageError ? 'text-red-400 font-mono' : 'text-zinc-400'} text-sm`}>
                        {imageError ? "Vérifier la console pour le debug" : "Évaluation Patrimoniale"}
                    </p>
                </div>
                {/* Effet de profondeur */}
                {!imageError && <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_70%)]" />}
            </div>
        );
    }

    return (
        <div className="relative w-full h-64 lg:h-80 rounded-2xl overflow-hidden group">
            {/* Image Street View */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={streetViewUrl}
                alt={`Façade - ${address}`}
                className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
            />

            {/* Loading state */}
            {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 to-zinc-800 animate-pulse" />
            )}

            {/* Overlay avec dégradé */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Texte par-dessus */}
            <div className="absolute bottom-6 left-6 z-10">
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-1 drop-shadow-lg">
                    {address || "Adresse sélectionnée"}
                </h2>
                <p className="text-zinc-200 text-sm drop-shadow-md">
                    📍 Vue de la façade
                </p>
            </div>

            {/* Effet hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>
    );
};
