/**
 * LegalCountdown — Compte à rebours interdiction de location
 * ============================================================
 * "Le Temps Presse" - Affiche le temps restant avant interdiction de louer
 *
 * Logique :
 * - G → Interdit depuis 01/01/2025 (DÉJÀ INTERDIT)
 * - F → Interdiction 01/01/2028
 * - E → Interdiction 01/01/2034
 * - D-A → Conforme (pas d'interdiction)
 */

"use client";

import { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DPE_PROHIBITION_DATES, type DPELetter } from "@/lib/constants";

interface LegalCountdownProps {
    currentDPE: DPELetter;
    className?: string;
}

interface TimeRemaining {
    years: number;
    months: number;
    days: number;
    totalDays: number;
    isExpired: boolean;
}

function calculateTimeRemaining(targetDate: Date | null): TimeRemaining {
    if (!targetDate) {
        return {
            years: 0,
            months: 0,
            days: 0,
            totalDays: 0,
            isExpired: false,
        };
    }

    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();

    if (diff <= 0) {
        return {
            years: 0,
            months: 0,
            days: 0,
            totalDays: 0,
            isExpired: true,
        };
    }

    const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = totalDays % 30;

    return {
        years,
        months,
        days,
        totalDays,
        isExpired: false,
    };
}

export function LegalCountdown({ currentDPE, className = "" }: LegalCountdownProps) {
    const prohibitionDate = DPE_PROHIBITION_DATES[currentDPE];

    // State pour forcer le re-render et mettre à jour le compte à rebours
    const [, setTick] = useState(0);

    // Mettre à jour le compte à rebours chaque jour
    useEffect(() => {
        const interval = setInterval(() => {
            setTick((prev) => prev + 1);
        }, 1000 * 60 * 60); // Update every hour

        return () => clearInterval(interval);
    }, []);

    const timeRemaining = useMemo(
        () => calculateTimeRemaining(prohibitionDate),
        [prohibitionDate]
    );

    // Pas d'interdiction pour D, C, B, A
    if (!prohibitionDate) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`card-bento p-4 ${className}`}
            >
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-success-600/40 to-success-700/40 rounded-xl flex items-center justify-center border border-success-500/20">
                        <span className="text-success-400 text-lg">✅</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-main">Statut Légal</h3>
                        <p className="text-xs text-muted">Loi Climat & Résilience</p>
                    </div>
                </div>

                <div className="p-4 bg-success-900/20 rounded-xl border border-success-500/30">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">🎉</span>
                        <div>
                            <p className="text-lg font-bold text-success-400 mb-1">
                                Conforme à la réglementation
                            </p>
                            <p className="text-sm text-success-300">
                                Aucune interdiction de louer prévue pour les DPE {currentDPE}.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    // DPE G, F, E : Afficher le compte à rebours
    const urgencyLevel = timeRemaining.isExpired
        ? "critical"
        : timeRemaining.totalDays < 365
            ? "critical"
            : timeRemaining.totalDays < 730
                ? "warning"
                : "info";

    const urgencyColors = {
        critical: {
            bg: "bg-danger-900/20",
            border: "border-danger-500/30",
            text: "text-danger-400",
            iconBg: "from-danger-600/40 to-danger-700/40",
            iconBorder: "border-danger-500/20",
            icon: "🔴",
        },
        warning: {
            bg: "bg-warning-900/20",
            border: "border-warning-500/30",
            text: "text-warning-400",
            iconBg: "from-warning-600/40 to-warning-700/40",
            iconBorder: "border-warning-500/20",
            icon: "🟡",
        },
        info: {
            bg: "bg-info-900/20",
            border: "border-info-500/30",
            text: "text-info-400",
            iconBg: "from-info-600/40 to-info-700/40",
            iconBorder: "border-info-500/20",
            icon: "🔵",
        },
    };

    const colors = urgencyColors[urgencyLevel];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`card-bento p-4 ${className}`}
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div
                    className={`w-10 h-10 bg-gradient-to-br ${colors.iconBg} rounded-xl flex items-center justify-center border ${colors.iconBorder}`}
                >
                    <span className="text-lg">{colors.icon}</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-main">Calendrier Légal</h3>
                    <p className="text-xs text-muted">Loi Climat & Résilience</p>
                </div>
            </div>

            {/* Compte à rebours ou Alerte Interdiction */}
            <div className={`p-4 ${colors.bg} rounded-xl border ${colors.border}`}>
                {timeRemaining.isExpired ? (
                    <div className="flex items-start gap-3">
                        <span className="text-3xl">🚫</span>
                        <div>
                            <p className="text-xl font-black text-danger-400 mb-2">
                                INTERDICTION EN VIGUEUR
                            </p>
                            <p className="text-sm text-danger-300 mb-2">
                                Les logements classés {currentDPE} sont interdits à la location
                                depuis le {prohibitionDate.toLocaleDateString("fr-FR")}.
                            </p>
                            <p className="text-xs text-danger-200/70 italic">
                                ⚖️ Risque de sanctions : amende jusqu&apos;à 5 000€ par logement
                            </p>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-3xl">⏰</span>
                            <p className={`text-xl font-black ${colors.text}`}>
                                Interdiction de louer dans
                            </p>
                        </div>

                        {/* Compteur temps restant */}
                        <div className="grid grid-cols-3 gap-3 mb-3">
                            <div className="text-center p-2 bg-surface rounded-lg border border-boundary">
                                <p className="text-2xl font-black text-main">{timeRemaining.years}</p>
                                <p className="text-xs text-muted">an{timeRemaining.years > 1 ? "s" : ""}</p>
                            </div>
                            <div className="text-center p-2 bg-surface rounded-lg border border-boundary">
                                <p className="text-2xl font-black text-main">{timeRemaining.months}</p>
                                <p className="text-xs text-muted">mois</p>
                            </div>
                            <div className="text-center p-2 bg-surface rounded-lg border border-boundary">
                                <p className="text-2xl font-black text-main">{timeRemaining.days}</p>
                                <p className="text-xs text-muted">jour{timeRemaining.days > 1 ? "s" : ""}</p>
                            </div>
                        </div>

                        {/* Détails */}
                        <div className="space-y-2 text-xs">
                            <p className={`font-bold ${colors.text}`}>
                                📅 Date limite : {prohibitionDate.toLocaleDateString("fr-FR", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </p>
                            <p className="text-muted">
                                Soit <strong className="text-main">{timeRemaining.totalDays} jours</strong> pour agir.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Argument commercial */}
            {!timeRemaining.isExpired && (
                <div className="mt-3 p-3 bg-surface-hover rounded-xl border border-boundary">
                    <p className="text-xs text-muted leading-relaxed">
                        💡 <strong>Anticipez maintenant :</strong> Les travaux prennent 12-18 mois (études + chantier).
                        Attendre = risque de saturation des artisans et envolée des prix.
                    </p>
                </div>
            )}
        </motion.div>
    );
}

/**
 * Variante compacte inline
 */
export function LegalCountdownCompact({ currentDPE, className = "" }: { currentDPE: DPELetter; className?: string }) {
    const prohibitionDate = DPE_PROHIBITION_DATES[currentDPE];
    const timeRemaining = useMemo(
        () => calculateTimeRemaining(prohibitionDate),
        [prohibitionDate]
    );

    if (!prohibitionDate) {
        return (
            <div className={`inline-flex items-center gap-2 ${className}`}>
                <span className="text-success-400">✅</span>
                <span className="text-xs text-muted">Conforme</span>
            </div>
        );
    }

    if (timeRemaining.isExpired) {
        return (
            <div className={`inline-flex items-center gap-2 ${className}`}>
                <span className="text-danger-400">🚫</span>
                <span className="text-xs font-bold text-danger-400">INTERDIT</span>
            </div>
        );
    }

    return (
        <div className={`inline-flex items-center gap-2 ${className}`}>
            <span className="text-warning-400">⏰</span>
            <span className="text-xs text-muted">
                {timeRemaining.totalDays} jours restants
            </span>
        </div>
    );
}
