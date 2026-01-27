/**
 * DPEGauge — Jauge de Performance Énergétique
 * ============================================
 * Visualisation avant/après avec animation fluide.
 * Design néo-banque premium.
 */

"use client";

import { useEffect, useState } from "react";
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
    const [animatedCurrent, setAnimatedCurrent] = useState(0);
    const [animatedTarget, setAnimatedTarget] = useState(0);

    const currentConfig = DPE_CONFIG[currentDPE];
    const targetConfig = DPE_CONFIG[targetDPE];

    // Animation d'entrée
    useEffect(() => {
        const timer1 = setTimeout(() => setAnimatedCurrent(currentConfig.position), 300);
        const timer2 = setTimeout(() => setAnimatedTarget(targetConfig.position), 600);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [currentConfig.position, targetConfig.position]);

    // Calcul du gain
    const dpeOrder: DPELetter[] = ["G", "F", "E", "D", "C", "B", "A"];
    const currentIndex = dpeOrder.indexOf(currentDPE);
    const targetIndex = dpeOrder.indexOf(targetDPE);
    const classesGained = targetIndex - currentIndex;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                🌡️ Performance Énergétique
            </h3>

            {/* Double gauge */}
            <div className="space-y-6">
                {/* Gauge actuelle */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">DPE Actuel</span>
                        <div
                            className={`${currentConfig.bgClass} text-white px-3 py-1 rounded-lg font-bold text-lg`}
                        >
                            {currentDPE}
                        </div>
                    </div>
                    <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                        {/* Gradient background */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    "linear-gradient(to right, #dc2626, #f97316, #eab308, #84cc16, #22c55e)",
                            }}
                        />
                        {/* Overlay to hide unfilled part */}
                        <div
                            className="absolute right-0 top-0 bottom-0 bg-gray-100 transition-all duration-1000 ease-out"
                            style={{ width: `${100 - animatedCurrent}%` }}
                        />
                        {/* Indicator */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-gray-800 rounded-full shadow-lg transition-all duration-1000 ease-out"
                            style={{ left: `calc(${animatedCurrent}% - 10px)` }}
                        />
                    </div>
                </div>

                {/* Flèche de progression */}
                <div className="flex items-center justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 bg-success-50 rounded-full border border-success-200">
                        <span className="text-success-600 text-xl">↓</span>
                        <span className="font-semibold text-success-700">
                            Gain de {classesGained} classe{classesGained > 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                {/* Gauge cible */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">DPE Cible</span>
                        <div
                            className={`${targetConfig.bgClass} text-white px-3 py-1 rounded-lg font-bold text-lg ring-2 ring-offset-2 ring-success-500`}
                        >
                            {targetDPE}
                        </div>
                    </div>
                    <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                        {/* Gradient background */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    "linear-gradient(to right, #dc2626, #f97316, #eab308, #84cc16, #22c55e)",
                            }}
                        />
                        {/* Overlay */}
                        <div
                            className="absolute right-0 top-0 bottom-0 bg-gray-100 transition-all duration-1000 ease-out"
                            style={{ width: `${100 - animatedTarget}%` }}
                        />
                        {/* Indicator */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-success-600 rounded-full shadow-lg transition-all duration-1000 ease-out"
                            style={{ left: `calc(${animatedTarget}% - 10px)` }}
                        />
                    </div>
                </div>
            </div>

            {/* Légende */}
            <div className="mt-6 flex justify-between text-xs text-gray-500">
                <span>G (Passoire)</span>
                <span>A (Performant)</span>
            </div>

            {/* Message commercial */}
            {currentDPE === "G" || currentDPE === "F" ? (
                <div className="mt-4 p-3 bg-success-50 rounded-lg border border-success-200">
                    <p className="text-sm text-success-800">
                        <span className="font-semibold">🎯 Bonus Sortie Passoire :</span> +10% de MaPrimeRénov'
                        pour passer de {currentDPE} à {targetDPE}
                    </p>
                </div>
            ) : null}
        </div>
    );
}
