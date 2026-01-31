/**
 * ComplianceTimeline — Frise chronologique Loi Climat
 * La "Bombe à retardement" visualisée.
 * ✨ Version animée avec Framer Motion
 * 🔄 Refactoring: Horizontal Layout
 */

"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { DPE_PROHIBITION_DATES, DPE_STATUS_LABELS, type DPELetter } from "@/lib/constants";
import { formatDate } from "@/lib/calculator";

interface ComplianceTimelineProps {
    currentDPE: DPELetter;
    className?: string;
}

export function ComplianceTimeline({ currentDPE, className = "" }: ComplianceTimelineProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const today = new Date();

    const entries: Array<{
        dpe: DPELetter;
        date: Date;
        isPast: boolean;
        isCurrent: boolean;
    }> = [];

    // Construire les entrées de la timeline - Chronologique (G -> F -> E)
    // G = 2025 (Déjà passé ou imminent)
    // F = 2028
    // E = 2034
    (["G", "F", "E"] as const).forEach((dpe) => {
        const date = DPE_PROHIBITION_DATES[dpe];
        if (date) {
            entries.push({
                dpe,
                date,
                isPast: date < today,
                isCurrent: dpe === currentDPE,
            });
        }
    });

    return (
        <motion.div
            ref={ref}
            className={`card-bento p-8 ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h3 className="text-xl font-bold text-main mb-8 flex items-center gap-2">
                ⏳ Calendrier Loi Climat & Résilience
            </h3>

            <div className="relative">
                {/* Ligne de temps - Verticale Mobile / Horizontale Desktop */}
                {/* Mobile Line (Vertical Left) */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-danger via-warning to-boundary md:hidden" />

                {/* Desktop Line (Horizontal Center) */}
                <motion.div
                    className="absolute hidden md:block top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-danger via-warning to-boundary transform -translate-y-1/2 z-0"
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={isInView ? { scaleX: 1 } : {}}
                    transition={{ duration: 1, ease: "easeOut" }}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative z-10">
                    {entries.map(({ dpe, date, isPast, isCurrent }, index) => {
                        const status = DPE_STATUS_LABELS[dpe];
                        const isCurrentDPE = dpe === currentDPE;

                        return (
                            <motion.div
                                key={dpe}
                                className={`relative pl-12 md:pl-0 md:pt-12 md:text-center group ${isCurrentDPE ? "scale-[1.02]" : ""}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{
                                    duration: 0.5,
                                    delay: 0.2 + index * 0.15,
                                    ease: [0.25, 0.46, 0.45, 0.94]
                                }}
                            >
                                {/* Point sur la timeline */}
                                <motion.div
                                    className={`absolute left-2.5 md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 w-4 h-4 rounded-full border-2 z-20 ${isPast
                                        ? "bg-danger border-danger"
                                        : isCurrentDPE
                                            ? "bg-warning border-warning"
                                            : "bg-surface border-boundary"
                                        }`}
                                    initial={{ scale: 0 }}
                                    animate={isInView ? {
                                        scale: 1,
                                        ...(isCurrentDPE ? {
                                            boxShadow: ["0 0 0 0 rgba(212, 182, 121, 0)", "0 0 0 12px rgba(212, 182, 121, 0.3)", "0 0 0 0 rgba(212, 182, 121, 0)"]
                                        } : {})
                                    } : {}}
                                    transition={isCurrentDPE
                                        ? { scale: { delay: 0.3 + index * 0.15 }, boxShadow: { repeat: Infinity, duration: 2 } }
                                        : { delay: 0.3 + index * 0.15 }
                                    }
                                />

                                {/* Card Content */}
                                <motion.div
                                    className={`p-4 rounded-xl border h-full flex flex-col justify-between ${isCurrentDPE
                                        ? "bg-warning/10 border-warning/30 shadow-lg shadow-warning/5"
                                        : isPast
                                            ? "bg-danger/10 border-danger/30"
                                            : "bg-surface/50 border-boundary" // More transparent background
                                        }`}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="mb-2">
                                        <div className="flex items-center md:justify-center gap-2 mb-2">
                                            <span className="text-2xl">{status.emoji}</span>
                                            <span className="font-bold text-main text-lg">DPE {dpe}</span>
                                        </div>
                                        <div className={`text-sm font-bold uppercase tracking-wider ${isPast ? "text-danger" : "text-muted"}`}>
                                            {formatDate(date)}
                                        </div>
                                    </div>

                                    {isCurrentDPE && (
                                        <div className="my-2 flex justify-center">
                                            <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                                                Votre Bien
                                            </span>
                                        </div>
                                    )}

                                    <div className="mt-2 text-sm leading-snug">
                                        {isPast ? (
                                            <span className="text-danger-300 font-medium">
                                                Location Interdite
                                            </span>
                                        ) : (
                                            <span className="text-muted">
                                                Interdit dans <br />
                                                <span className="text-main font-bold text-base">
                                                    {Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30))} mois
                                                </span>
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Alerte Contextuelle Footer */}
            {(currentDPE === "G" || currentDPE === "F" || currentDPE === "E") && (
                <motion.div
                    className="mt-8 p-4 bg-danger-900/20 border border-danger-500/30 rounded-xl flex items-center gap-4 max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 1 }}
                >
                    <span className="text-2xl">⚠️</span>
                    <p className="text-sm text-danger-200">
                        <span className="font-bold text-danger-400">Attention :</span> Votre copropriété est directement menacée par ce calendrier.
                        Sans travaux, les logements classés {currentDPE} deviendront progressivement impropres à la location.
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}

// 2025, 2028, 2034 are the default keys in constants, rendering in that order because of the array literal.
