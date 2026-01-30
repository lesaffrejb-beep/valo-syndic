"use client";

import React from 'react';

interface HeatingSystemAlertProps {
    heatingType: string | null | undefined;
}

/**
 * HeatingSystemAlert Component
 * Détecte une installation fossile pour proposer une prime.
 * Style "Notification Premium" avec bordure Or/Vert Émeraude.
 */
export function HeatingSystemAlert({ heatingType }: HeatingSystemAlertProps) {
    // Logique : Si le type de chauffage contient "fioul" ou "gaz", affiche le composant.
    if (!heatingType) return null;

    const isFossilFuel =
        heatingType.toLowerCase().includes('gaz') ||
        heatingType.toLowerCase().includes('fioul');

    if (!isFossilFuel) return null;

    return (
        <div className="relative overflow-hidden group">
            {/* Bordure animée premium (Gold/Emerald) */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-primary via-success to-primary rounded-2xl blur-sm opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-glow" />

            <div className="relative card-bento border-primary/20 bg-surface/80 backdrop-blur-xl flex flex-col sm:flex-row items-center gap-6 p-6">
                {/* Icone / Badge */}
                <div className="flex-shrink-0 h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="text-3xl" role="img" aria-label="Target">🎯</span>
                </div>

                {/* Contenu textuel */}
                <div className="flex-grow text-center sm:text-left">
                    <div className="flex flex-col gap-1">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-primary">
                            Opportunité Détectée
                        </h4>
                        <div className="flex flex-col">
                            <span className="text-xl font-semibold text-main">
                                Cible verrouillée : Chauffage {heatingType.includes('Gaz') || heatingType.includes('gaz') ? 'Gaz' : 'Fioul'} détecté.
                            </span>
                            <p className="text-muted text-sm mt-1">
                                Vous êtes éligible au programme <span className="text-success font-medium">"Coup de Pouce Chauffage"</span>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Badge Bonus */}
                <div className="flex-shrink-0 flex flex-col items-center sm:items-end justify-center px-6 py-3 bg-success/10 border border-success/20 rounded-xl">
                    <span className="text-xs font-semibold text-success uppercase tracking-tighter">Bonus Estimé</span>
                    <span className="text-2xl font-bold text-success">+5 000 €</span>
                    <span className="text-[10px] text-success/60 uppercase">Immédiats</span>
                </div>
            </div>
        </div>
    );
}
