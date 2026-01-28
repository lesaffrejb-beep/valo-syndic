/**
 * DPEGauge — Jauge de Performance Énergétique
 * ============================================
 * Visualisation avant/après avec animation Framer Motion.
 * Design néo-banque premium + pulse sur passoire.
 */

"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { type DPELetter, DPE_KWH_VALUES } from "@/lib/constants";

interface DPEGaugeProps {
    currentDPE: DPELetter;
    targetDPE: DPELetter;
}

// Configuration des couleurs et positions pour chaque classe DPE
const DPE_CONFIG: Record<DPELetter, { color: string; position: number; bgClass: string }> = {
    G: { color: "#dc2626", position: 7, bgClass: "bg-red-600" },
    F: { color: "#ea580c", position: 14, bgClass: "bg-orange-600" },
    E: { color: "#f59e0b", position: 28, bgClass: "bg-amber-500" },
    D: { color: "#eab308", position: 43, bgClass: "bg-yellow-500" },
    C: { color: "#84cc16", position: 57, bgClass: "bg-lime-500" },
    B: { color: "#22c55e", position: 72, bgClass: "bg-green-500" },
    A: { color: "#16a34a", position: 86, bgClass: "bg-green-600" },
};

export function DPEGauge({ currentDPE, targetDPE }: DPEGaugeProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    const currentConfig = DPE_CONFIG[currentDPE];
    const targetConfig = DPE_CONFIG[targetDPE];

    // Calcul du gain
    const dpeOrder: DPELetter[] = ["G", "F", "E", "D", "C", "B", "A"];
    const currentIndex = dpeOrder.indexOf(currentDPE);
    const targetIndex = dpeOrder.indexOf(targetDPE);
    const classesGained = targetIndex - currentIndex;

    const isPassoire = currentDPE === "G" || currentDPE === "F";

    return (
        <motion.div
            ref={ref}
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 relative">
                {/* Ligne connectrice (Desktop only) */}
                <div className="hidden md:block absolute top-1/2 left-20 right-20 h-0.5 bg-gradient-to-r from-transparent via-boundary to-transparent -z-10" />

                {/* 1. DPE ACTUEL (Gauche) */}
                <div className="flex flex-col items-center gap-3 bg-surface p-4 rounded-2xl border border-boundary shadow-sm w-full md:w-auto min-w-[180px]">
                    <span className="text-sm font-bold text-muted uppercase tracking-wider">État Actuel</span>

                    <div className="relative">
                        <motion.div
                            className={`${currentConfig.bgClass} text-white w-16 h-16 rounded-2xl flex items-center justify-center font-black text-4xl shadow-lg border-2 border-white/20`}
                            animate={isPassoire ? {
                                scale: [1, 1.05, 1],
                                boxShadow: [
                                    "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                    "0 0 15px rgba(220, 38, 38, 0.5)",
                                    "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                ],
                            } : {}}
                            transition={isPassoire ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : {}}
                        >
                            {currentDPE}
                        </motion.div>
                        {isPassoire && (
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-surface animate-ping" />
                        )}
                    </div>

                    <p className="text-sm font-medium text-muted-foreground">{DPE_KWH_VALUES[currentDPE]} kWh/m²/an</p>

                    {/* Jauge Mini */}
                    <div className="relative h-2 w-full bg-app rounded-full overflow-hidden border border-boundary mt-1">
                        <div
                            className="absolute inset-0"
                            style={{ background: "linear-gradient(to right, #FF453A, #FFD60A, #32D74B)" }}
                        />
                        <motion.div
                            className="absolute right-0 top-0 bottom-0 bg-surface/90"
                            initial={{ width: "100%" }}
                            animate={isInView ? { width: `${100 - currentConfig.position}%` } : {}}
                            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.3 }}
                        />
                    </div>
                </div>

                {/* 2. ACTION (Centre) */}
                <div className="flex flex-col items-center justify-center z-10">
                    <motion.div
                        className="flex flex-col items-center gap-1"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="w-10 h-10 bg-success-500 text-white rounded-full flex items-center justify-center text-xl shadow-lg shadow-success-500/30 mb-2">
                            ↓
                        </div>
                        <div className="px-3 py-1 bg-success-500/10 rounded-full border border-success-500/20 backdrop-blur-sm">
                            <span className="text-xs font-bold text-success-600 whitespace-nowrap">
                                +{classesGained} classe{classesGained > 1 ? "s" : ""}
                            </span>
                        </div>
                    </motion.div>
                </div>

                {/* 3. DPE CIBLE (Droite) */}
                <div className="flex flex-col items-center gap-3 bg-app p-4 rounded-2xl border border-success-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)] w-full md:w-auto min-w-[180px]">
                    <span className="text-sm font-bold text-success-600 uppercase tracking-wider">État Projeté</span>

                    <motion.div
                        className={`${targetConfig.bgClass} text-white w-16 h-16 rounded-2xl flex items-center justify-center font-black text-4xl shadow-xl border-2 border-white/20`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={isInView ? { scale: 1, opacity: 1 } : {}}
                        transition={{ delay: 0.8, type: "spring" }}
                    >
                        {targetDPE}
                    </motion.div>

                    <p className="text-sm font-medium text-muted-foreground">{DPE_KWH_VALUES[targetDPE]} kWh/m²/an</p>

                    {/* Jauge Mini */}
                    <div className="relative h-2 w-full bg-app rounded-full overflow-hidden border border-boundary mt-1">
                        <div
                            className="absolute inset-0"
                            style={{ background: "linear-gradient(to right, #FF453A, #FFD60A, #32D74B)" }}
                        />
                        <motion.div
                            className="absolute right-0 top-0 bottom-0 bg-surface/90"
                            initial={{ width: "100%" }}
                            animate={isInView ? { width: `${100 - targetConfig.position}%` } : {}}
                            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.9 }}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
