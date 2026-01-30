/**
 * HeatingSystemAlert — L'Opportunité (Subsidy Sniper)
 * =====================================================
 * Transforme le point faible (chauffage fioul/gaz) en opportunité financière.
 * Stratégie: Ne pas alarmer, mais révéler une "subvention cachée" à capturer.
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface HeatingSystemAlertProps {
    heatingType?: string; // Ex: "fioul", "gaz", "électrique", "PAC"
    dpeData?: {
        type_energie_chauffage?: string;
        type_installation_chauffage?: string;
    };
    className?: string;
}

// Liste des systèmes éligibles au "Coup de Pouce Chauffage"
const ELIGIBLE_SYSTEMS = ["fioul", "gaz", "fuel", "mazout", "GPL"];

// Montants estimés selon le type de chauffage à remplacer
const SUBSIDY_AMOUNTS: Record<string, number> = {
    fioul: 5000,
    gaz: 4000,
    fuel: 5000,
    mazout: 5000,
    GPL: 4000,
};

export function HeatingSystemAlert({
    heatingType,
    dpeData,
    className = ""
}: HeatingSystemAlertProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Détection du système de chauffage
    const detectedSystem = heatingType?.toLowerCase() || dpeData?.type_energie_chauffage?.toLowerCase() || "";

    // Vérifier si éligible
    const isEligible = ELIGIBLE_SYSTEMS.some(system => detectedSystem.includes(system));

    // Si pas éligible, ne rien afficher
    if (!isEligible) {
        return null;
    }

    // Déterminer le montant bonus
    const matchedSystem = ELIGIBLE_SYSTEMS.find(system => detectedSystem.includes(system));
    const bonusAmount = matchedSystem ? (SUBSIDY_AMOUNTS[matchedSystem] || 4500) : 4500;

    // Déterminer le type de chauffage pour le wording
    const systemName = detectedSystem.includes("fioul") || detectedSystem.includes("fuel") || detectedSystem.includes("mazout")
        ? "fioul"
        : "gaz";

    return (
        <AnimatePresence>
            <motion.div
                className={`relative overflow-hidden ${className}`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
            >
                {/* Carte principale - Style "Unlock" (Or/Émeraude) */}
                <div className="card-bento p-6 md:p-8 bg-gradient-to-br from-amber-900/20 via-emerald-900/10 to-emerald-900/20 border-emerald-500/30 relative group hover:border-emerald-400/50 transition-all">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Animated background orbs */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/10 blur-[50px] rounded-full animate-pulse delay-75" />

                    <div className="relative z-10">
                        {/* Header */}
                        <div className="flex items-start gap-4 mb-6">
                            {/* Icon */}
                            <div className="flex-shrink-0">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-emerald-500/30 flex items-center justify-center backdrop-blur-sm shadow-lg">
                                    <span className="text-3xl">🎯</span>
                                </div>
                            </div>

                            {/* Title */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-300 rounded-full uppercase tracking-wider">
                                        🔓 Opportunité Détectée
                                    </span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-emerald-300 leading-tight">
                                    Cible verrouillée : Chauffage {systemName}
                                </h3>
                            </div>
                        </div>

                        {/* Main Message */}
                        <div className="mb-6">
                            <p className="text-base md:text-lg text-white/90 font-medium leading-relaxed mb-3">
                                Votre chauffage {systemName} vous rend éligible au
                                <span className="font-bold text-emerald-300"> &quot;Coup de Pouce Chauffage&quot;</span>.
                            </p>
                            <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-sm text-muted">Bonus estimé :</span>
                                <span className="text-4xl font-black text-emerald-400 tracking-tight">
                                    +{bonusAmount.toLocaleString('fr-FR')} €
                                </span>
                                <span className="text-sm font-bold text-emerald-300/80 uppercase tracking-wider">
                                    immédiats
                                </span>
                            </div>
                        </div>

                        {/* Details (Collapsible) */}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full text-left mb-4 flex items-center justify-between gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-emerald-500/30 transition-all group/btn"
                        >
                            <span className="text-sm font-semibold text-emerald-300 group-hover/btn:text-emerald-200">
                                {isExpanded ? "Masquer les détails" : "Comment ça marche ?"}
                            </span>
                            <motion.span
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                                className="text-emerald-400"
                            >
                                ▼
                            </motion.span>
                        </button>

                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-4 bg-black/20 rounded-xl border border-white/10 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <span className="text-emerald-400 font-bold">✓</span>
                                            <p className="text-sm text-white/80">
                                                <strong className="text-emerald-300">Remplacement éligible :</strong> Pompe à chaleur, chaudière biomasse, ou réseau de chaleur
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="text-emerald-400 font-bold">✓</span>
                                            <p className="text-sm text-white/80">
                                                <strong className="text-emerald-300">Cumulable avec MPR :</strong> Cette prime s&apos;ajoute à MaPrimeRénov&apos; Copropriété
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="text-emerald-400 font-bold">✓</span>
                                            <p className="text-sm text-white/80">
                                                <strong className="text-emerald-300">Délai limité :</strong> Le dispositif est renforcé jusqu&apos;en décembre 2026
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Call to Action */}
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="flex-1">
                                    <p className="text-emerald-300 font-semibold mb-1">
                                        💡 Cette subvention est déjà intégrée dans votre plan
                                    </p>
                                    <p className="text-xs text-muted">
                                        Ne laissez pas passer cette opportunité limitée dans le temps
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center animate-pulse">
                                        <span className="text-xl">💰</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating badge "Nouveau" (optionnel) */}
                <motion.div
                    className="absolute -top-2 -right-2 z-20"
                    initial={{ scale: 0, rotate: -12 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: "spring" }}
                >
                    <div className="px-3 py-1 bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full shadow-lg">
                        <span className="text-xs font-black text-black uppercase tracking-wider">
                            ⚡ Boost 2026
                        </span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
