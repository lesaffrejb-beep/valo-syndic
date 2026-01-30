/**
 * GESBadge — Affichage de l'étiquette GES (Émissions de Gaz à Effet de Serre)
 * ============================================================================
 * "Le Carbone Oublié" - Affiche l'étiquette GES à côté du DPE
 * Argument : Impact PPPT & Taxe Carbone
 */

"use client";

import { motion } from "framer-motion";
import type { DPELetter } from "@/lib/constants";

interface GESBadgeProps {
    gesLetter: DPELetter | string;
    className?: string;
    showDetails?: boolean;
}

// Configuration des couleurs GES (dégradé violet pour différencier du DPE)
const GES_CONFIG: Record<string, { color: string; bgClass: string; label: string }> = {
    A: {
        color: "#8b5cf6",
        bgClass: "bg-gradient-to-br from-purple-500 to-purple-600",
        label: "Excellent"
    },
    B: {
        color: "#a78bfa",
        bgClass: "bg-gradient-to-br from-purple-400 to-purple-500",
        label: "Bon"
    },
    C: {
        color: "#c4b5fd",
        bgClass: "bg-gradient-to-br from-purple-300 to-purple-400",
        label: "Assez bon"
    },
    D: {
        color: "#ddd6fe",
        bgClass: "bg-gradient-to-br from-purple-200 to-purple-300",
        label: "Moyen"
    },
    E: {
        color: "#f59e0b",
        bgClass: "bg-gradient-to-br from-amber-400 to-orange-500",
        label: "Médiocre"
    },
    F: {
        color: "#ea580c",
        bgClass: "bg-gradient-to-br from-orange-500 to-red-500",
        label: "Mauvais"
    },
    G: {
        color: "#dc2626",
        bgClass: "bg-gradient-to-br from-red-500 to-red-600",
        label: "Très mauvais"
    },
};

export function GESBadge({ gesLetter, className = "", showDetails = true }: GESBadgeProps) {
    const letter = (gesLetter?.toUpperCase() || "G") as DPELetter;
    const config = GES_CONFIG[letter];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`card-bento p-4 ${className}`}
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600/40 to-purple-700/40 rounded-xl flex items-center justify-center border border-purple-500/20">
                    <span className="text-purple-400 text-lg">🌍</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-main">Émissions GES</h3>
                    <p className="text-xs text-muted">Le Carbone Oublié</p>
                </div>
            </div>

            {/* Badge GES */}
            <div className="flex items-center gap-4 mb-4">
                <div
                    className={`${config!.bgClass} text-white w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg ring-4 ring-white/10`}
                >
                    {letter}
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-muted mb-1">Classe Carbone</p>
                    <p className="text-lg font-bold text-main">{config!.label}</p>
                </div>
            </div>

            {/* Détails & Arguments */}
            {showDetails && (
                <div className="space-y-3">
                    {/* Alerte si mauvais score */}
                    {(letter === "F" || letter === "G") && (
                        <div className="p-3 bg-danger-900/20 rounded-xl border border-danger-500/30">
                            <div className="flex items-start gap-2">
                                <span className="text-lg">⚠️</span>
                                <div className="text-xs text-danger-300">
                                    <p className="font-bold mb-1">Impact réglementaire</p>
                                    <p>• Taxe carbone en hausse (56€/tCO2 en 2026)</p>
                                    <p>• PPPT : Risque de non-conformité</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Info générale */}
                    <div className="p-3 bg-surface-hover rounded-xl border border-boundary">
                        <p className="text-xs text-muted leading-relaxed">
                            💡 <strong>Pourquoi c&apos;est important ?</strong>
                            <br />
                            L&apos;étiquette GES mesure vos émissions de CO2.
                            Elle influence les futures réglementations et la taxe carbone.
                        </p>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

/**
 * Variante compacte pour affichage inline
 */
export function GESBadgeCompact({ gesLetter, className = "" }: { gesLetter: DPELetter | string; className?: string }) {
    const letter = (gesLetter?.toUpperCase() || "G") as DPELetter;
    const config = GES_CONFIG[letter];

    return (
        <div className={`inline-flex items-center gap-2 ${className}`}>
            <div
                className={`${config!.bgClass} text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm`}
            >
                {letter}
            </div>
            <span className="text-xs text-muted">GES {letter}</span>
        </div>
    );
}
