/**
 * DPEGauge — Jauge de Performance Énergétique
 * ============================================
 * Visualisation avant/après avec animation Framer Motion.
 * Design néo-banque premium + pulse sur passoire.
 */

"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { type DPELetter } from "@/lib/constants";

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
            className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.005 }}
        >
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                🌡️ Performance Énergétique
            </h3>

            {/* Double gauge */}
            <div className="space-y-6">
                {/* Gauge actuelle */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">DPE Actuel</span>
                        <motion.div
                            className={`${currentConfig.bgClass} text-white px-3 py-1.5 rounded-lg font-bold text-lg shadow-lg`}
                            animate={isPassoire ? {
                                scale: [1, 1.05, 1],
                                boxShadow: [
                                    "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                    "0 10px 15px -3px rgba(220, 38, 38, 0.3)",
                                    "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                ],
                            } : {}}
                            transition={isPassoire ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : {}}
                        >
                            {currentDPE}
                        </motion.div>
                    </div>
                    <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden">
                        {/* Gradient background */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    "linear-gradient(to right, #dc2626, #f97316, #eab308, #84cc16, #22c55e)",
                            }}
                        />
                        {/* Overlay animé */}
                        <motion.div
                            className="absolute right-0 top-0 bottom-0 bg-gray-100"
                            initial={{ width: "100%" }}
                            animate={isInView ? { width: `${100 - currentConfig.position}%` } : {}}
                            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.3 }}
                        />
                        {/* Indicator avec glow */}
                        <motion.div
                            className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-800 rounded-full shadow-lg"
                            style={{ boxShadow: "0 0 10px rgba(0,0,0,0.2)" }}
                            initial={{ left: "-10px", opacity: 0 }}
                            animate={isInView ? {
                                left: `calc(${currentConfig.position}% - 12px)`,
                                opacity: 1,
                            } : {}}
                            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.3 }}
                        />
                    </div>
                </div>

                {/* Flèche de progression animée */}
                <motion.div
                    className="flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 1, duration: 0.4, type: "spring" }}
                >
                    <div className="flex items-center gap-2 px-4 py-2 bg-success-50 rounded-full border border-success-200">
                        <motion.span
                            className="text-success-600 text-xl"
                            animate={{ y: [0, 3, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        >
                            ↓
                        </motion.span>
                        <span className="font-semibold text-success-700">
                            Gain de {classesGained} classe{classesGained > 1 ? "s" : ""}
                        </span>
                    </div>
                </motion.div>

                {/* Gauge cible */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">DPE Cible</span>
                        <motion.div
                            className={`${targetConfig.bgClass} text-white px-3 py-1.5 rounded-lg font-bold text-lg ring-2 ring-offset-2 ring-success-500 shadow-lg`}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={isInView ? { scale: 1, opacity: 1 } : {}}
                            transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
                        >
                            {targetDPE}
                        </motion.div>
                    </div>
                    <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden">
                        {/* Gradient background */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    "linear-gradient(to right, #dc2626, #f97316, #eab308, #84cc16, #22c55e)",
                            }}
                        />
                        {/* Overlay animé */}
                        <motion.div
                            className="absolute right-0 top-0 bottom-0 bg-gray-100"
                            initial={{ width: "100%" }}
                            animate={isInView ? { width: `${100 - targetConfig.position}%` } : {}}
                            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.6 }}
                        />
                        {/* Indicator */}
                        <motion.div
                            className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-success-600 rounded-full shadow-lg"
                            style={{ boxShadow: "0 0 12px rgba(34, 197, 94, 0.4)" }}
                            initial={{ left: "-10px", opacity: 0 }}
                            animate={isInView ? {
                                left: `calc(${targetConfig.position}% - 12px)`,
                                opacity: 1,
                            } : {}}
                            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.6 }}
                        />
                    </div>
                </div>
            </div>

            {/* Légende */}
            <div className="mt-6 flex justify-between text-xs text-gray-500">
                <span>G (Passoire)</span>
                <span>A (Performant)</span>
            </div>

            {/* Message commercial avec animation */}
            {isPassoire && (
                <motion.div
                    className="mt-4 p-4 bg-success-50 rounded-xl border border-success-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 1.5 }}
                >
                    <p className="text-sm text-success-800">
                        <span className="font-semibold">🎯 Bonus Sortie Passoire :</span> +10% de MaPrimeRénov'
                        pour passer de {currentDPE} à {targetDPE}
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}
