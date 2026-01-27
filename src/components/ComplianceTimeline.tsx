/**
 * ComplianceTimeline — Frise chronologique Loi Climat
 * La "Bombe à retardement" visualisée.
 * ✨ Version animée avec Framer Motion
 */

"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { DPE_PROHIBITION_DATES, DPE_STATUS_LABELS, type DPELetter } from "@/lib/constants";
import { formatDate } from "@/lib/calculator";

interface ComplianceTimelineProps {
    currentDPE: DPELetter;
}

export function ComplianceTimeline({ currentDPE }: ComplianceTimelineProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const today = new Date();

    const entries: Array<{
        dpe: DPELetter;
        date: Date;
        isPast: boolean;
        isCurrent: boolean;
    }> = [];

    // Construire les entrées de la timeline
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
            className="card group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.005 }}
        >
            <h3 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                ⏳ Calendrier Loi Climat
            </h3>

            <div className="relative">
                {/* Ligne de temps animée */}
                <motion.div
                    className="absolute left-4 top-0 w-0.5 bg-gradient-to-b from-danger-500 via-warning-500 to-borders"
                    initial={{ height: 0 }}
                    animate={isInView ? { height: "100%" } : {}}
                    transition={{ duration: 1, ease: "easeOut" }}
                />

                <div className="space-y-6">
                    {entries.map(({ dpe, date, isPast, isCurrent }, index) => {
                        const status = DPE_STATUS_LABELS[dpe];
                        const isCurrentDPE = dpe === currentDPE;

                        return (
                            <motion.div
                                key={dpe}
                                className={`relative pl-10 ${isCurrentDPE ? "scale-[1.02]" : ""}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={isInView ? { opacity: 1, x: 0 } : {}}
                                transition={{
                                    duration: 0.5,
                                    delay: 0.2 + index * 0.15,
                                    ease: [0.25, 0.46, 0.45, 0.94]
                                }}
                            >
                                {/* Point sur la timeline avec pulse */}
                                <motion.div
                                    className={`absolute left-2.5 w-3 h-3 rounded-full border-2 ${isPast
                                        ? "bg-danger-500 border-danger-500"
                                        : isCurrentDPE
                                            ? "bg-warning-500 border-warning-500"
                                            : "bg-surface border-borders"
                                        }`}
                                    initial={{ scale: 0 }}
                                    animate={isInView ? {
                                        scale: 1,
                                        boxShadow: isCurrentDPE
                                            ? ["0 0 0 0 rgba(234, 179, 8, 0)", "0 0 0 8px rgba(234, 179, 8, 0.3)", "0 0 0 0 rgba(234, 179, 8, 0)"]
                                            : undefined
                                    } : {}}
                                    transition={isCurrentDPE
                                        ? { scale: { delay: 0.3 + index * 0.15 }, boxShadow: { repeat: Infinity, duration: 2 } }
                                        : { delay: 0.3 + index * 0.15 }
                                    }
                                />

                                <motion.div
                                    className={`p-4 rounded-xl border ${isCurrentDPE
                                        ? "bg-warning/10 border-warning/30 shadow-md shadow-warning-500/10"
                                        : isPast
                                            ? "bg-danger/10 border-danger/30"
                                            : "bg-surface border-borders"
                                        }`}
                                    whileHover={{ scale: 1.01 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <motion.span
                                                className="text-lg"
                                                animate={isCurrentDPE ? { scale: [1, 1.1, 1] } : {}}
                                                transition={{ repeat: Infinity, duration: 2 }}
                                            >
                                                {status.emoji}
                                            </motion.span>
                                            <span className="font-bold text-text-main">DPE {dpe}</span>
                                            {isCurrentDPE && (
                                                <motion.span
                                                    className="text-xs bg-primary text-black px-2 py-0.5 rounded-full font-bold"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.5 + index * 0.15, type: "spring" }}
                                                >
                                                    VOTRE BIEN
                                                </motion.span>
                                            )}
                                        </div>
                                        <span
                                            className={`text-sm font-medium ${isPast ? "text-danger-500" : "text-text-muted"
                                                }`}
                                        >
                                            {formatDate(date)}
                                        </span>
                                    </div>

                                    <p
                                        className={`mt-2 text-sm ${isPast ? "text-danger-500 font-semibold" : "text-text-muted"
                                            }`}
                                    >
                                        {isPast
                                            ? "🔴 INTERDICTION EN VIGUEUR"
                                            : `Interdiction de louer dans ${Math.ceil(
                                                (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)
                                            )} mois`}
                                    </p>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Alerte si DPE concerné */}
            {(currentDPE === "G" || currentDPE === "F" || currentDPE === "E") && (
                <motion.div
                    className="mt-6 p-4 bg-danger/10 border border-danger/30 rounded-xl"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.8 }}
                >
                    <p className="text-danger-500 font-medium text-sm">
                        ⚠️ Votre bien est concerné par les interdictions de location.
                        {currentDPE === "G" && " La location est déjà interdite depuis le 1er janvier 2025."}
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}
