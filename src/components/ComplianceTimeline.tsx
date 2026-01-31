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
            className={`card-bento p-5 pb-8 ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <h3 className="text-xl font-bold text-main flex items-center gap-2">
                    <span className="text-2xl">⏳</span>
                    <span>Calendrier Loi Climat</span>
                </h3>
            </div>

            <div className="relative py-0">
                {/* Ligne de temps - Connecteur Premium */}
                {/* Mobile (Vertical) */}
                <div className="absolute left-6 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-boundary to-transparent md:hidden" />

                {/* Desktop (Horizontal) */}
                <div className="absolute hidden md:block top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-boundary to-transparent z-0" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative z-10">
                    {entries.map(({ dpe, date, isPast, isCurrent }, index) => {
                        const status = DPE_STATUS_LABELS[dpe];
                        const isCurrentDPE = dpe === currentDPE;

                        return (
                            <motion.div
                                key={dpe}
                                className="relative pl-12 md:pl-0 md:pt-0 group" // [MOD] Reduced padding
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{
                                    duration: 0.5,
                                    delay: 0.1 + index * 0.1,
                                    ease: "easeOut"
                                }}
                            >
                                {/* Point d'ancrage sur la timeline */}
                                <div className={`absolute left-4 md:left-1/2 md:-translate-x-1/2 top-0 md:top-8 md:-translate-y-1/2 w-4 h-4 rounded-full border-2 bg-app z-20 transition-all duration-500
                                    ${isPast
                                        ? "border-danger shadow-glow-danger"
                                        : isCurrentDPE
                                            ? "border-warning scale-125 shadow-glow-warning"
                                            : "border-boundary"
                                    }`}
                                />

                                {/* Card Content - Pushed down on Desktop */}
                                <div className={`relative p-4 mt-0 md:mt-8 rounded-xl border transition-all duration-300 h-full flex flex-col items-start md:items-center md:text-center
                                    ${isCurrentDPE
                                        ? "bg-gradient-to-b from-warning/10 to-warning/5 border-warning/40 shadow-glow-warning ring-1 ring-warning/20 transform md:-translate-y-2" // Reduced translate
                                        : isPast
                                            ? "bg-danger/5 border-danger/20 opacity-80 hover:opacity-100"
                                            : "bg-surface/30 border-white/5 hover:bg-surface/50 hover:border-white/10"
                                    }`}
                                >
                                    {/* Date & Badge */}
                                    <div className="flex flex-col md:items-center gap-1 mb-4 w-full">
                                        <div className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit
                                            ${isPast
                                                ? "bg-danger/10 text-danger"
                                                : isCurrentDPE
                                                    ? "bg-warning/10 text-warning border border-warning/20"
                                                    : "bg-white/5 text-muted"
                                            }`}
                                        >
                                            {formatDate(date)}
                                        </div>
                                    </div>

                                    {/* Lettre DPE */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={`text-4xl font-black tracking-tighter ${isCurrentDPE ? 'text-warning' : 'text-main'}`}>
                                            {dpe}
                                        </span>
                                        {isCurrentDPE && (
                                            <span className="text-[10px] font-bold text-app bg-warning px-2 py-0.5 rounded uppercase tracking-wide">
                                                Actuel
                                            </span>
                                        )}
                                    </div>

                                    {/* Description Status */}
                                    <p className={`text-sm leading-relaxed ${isCurrentDPE ? 'text-white' : 'text-muted'}`}>
                                        {isPast ? (
                                            <span className="text-danger-300 font-medium flex items-center gap-2 md:justify-center">
                                                <span>🚫</span> Interdiction en cours
                                            </span>
                                        ) : (
                                            <>
                                                Interdit à la location dans <br />
                                                <span className={`block text-lg font-bold mt-1 ${isCurrentDPE ? 'text-warning' : 'text-main'}`}>
                                                    {Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30))} mois
                                                </span>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>


        </motion.div>
    );
}

// 2025, 2028, 2034 are the default keys in constants, rendering in that order because of the array literal.
