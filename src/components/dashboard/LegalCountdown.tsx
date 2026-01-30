/**
 * LegalCountdown — Compte à Rebours Légal
 * ========================================
 * Affiche le countdown avant interdiction de louer
 */

"use client";

import { motion } from "framer-motion";
import { type DPELetter, DPE_PROHIBITION_DATES } from "@/lib/constants";
import { useMemo } from "react";

interface LegalCountdownProps {
    dpeLetter: DPELetter;
    className?: string;
}

export function LegalCountdown({ dpeLetter, className = "" }: LegalCountdownProps) {
    const countdown = useMemo(() => {
        const prohibitionDate = DPE_PROHIBITION_DATES[dpeLetter];

        if (!prohibitionDate) {
            return null;
        }

        const now = new Date();
        const daysRemaining = Math.ceil((prohibitionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isPast = daysRemaining < 0;

        return {
            date: prohibitionDate,
            daysRemaining: Math.abs(daysRemaining),
            isPast,
        };
    }, [dpeLetter]);

    if (!countdown) {
        return (
            <div className={`card-bento p-6 bg-success-900/10 border-success-500/20 ${className}`}>
                <div className="text-center">
                    <p className="text-lg font-bold text-success-400">✅ Immeuble Conforme</p>
                    <p className="text-sm text-muted mt-2">
                        Aucune interdiction de louer prévue pour le DPE {dpeLetter}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className={`card-bento p-6 md:p-8 ${
                countdown.isPast
                    ? "bg-danger-900/20 border-danger-500/40"
                    : "bg-warning-900/10 border-warning-500/30"
            } ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="text-center">
                {countdown.isPast ? (
                    <>
                        <div className="text-6xl mb-4">🚫</div>
                        <h3 className="text-2xl md:text-3xl font-black text-danger-400 mb-3">
                            Interdiction Active
                        </h3>
                        <p className="text-lg text-danger-300 mb-4">
                            La location est interdite depuis le{" "}
                            {countdown.date.toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </p>
                        <p className="text-sm text-muted">
                            Déjà {countdown.daysRemaining} jours de retard
                        </p>
                    </>
                ) : (
                    <>
                        <div className="text-6xl mb-4 animate-pulse">⏰</div>
                        <h3 className="text-2xl md:text-3xl font-black text-warning-400 mb-3">
                            Interdiction dans {countdown.daysRemaining} jours
                        </h3>
                        <p className="text-lg text-warning-300 mb-4">
                            Location interdite à partir du{" "}
                            {countdown.date.toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </p>
                        <p className="text-sm text-muted">
                            Loi Climat & Résilience — DPE {dpeLetter}
                        </p>
                    </>
                )}
            </div>
        </motion.div>
    );
}
