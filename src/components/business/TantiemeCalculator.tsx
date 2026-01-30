"use client";

import { useState, useMemo } from "react";
import { type FinancingPlan } from "@/lib/schemas";
import { ECO_PTZ_COPRO } from "@/lib/constants";
import { formatCurrency } from "@/lib/calculator";
import { motion } from "framer-motion";

interface TantiemeCalculatorProps {
    financing: FinancingPlan;
    className?: string;
}

/**
 * TANTIEME CALCULATOR — "L'Effort Réel"
 * Design Updated: Obsidian / Premium
 * Focus: Slider ergonomique + "Hero Metric" Mensuelle
 */
export function TantiemeCalculator({ financing, className = "" }: TantiemeCalculatorProps) {
    const [tantiemes, setTantiemes] = useState(100); // Défaut : 100/1000

    const calculation = useMemo(() => {
        // Part du lot dans l'apport personnel (cash immédiat)
        const partLotCash = (financing.remainingCost * tantiemes) / 1000;

        // Part du lot dans le financement Éco-PTZ
        const partLotLoan = (financing.ecoPtzAmount * tantiemes) / 1000;

        // Mensualité sur la durée Éco-PTZ (20 ans par défaut)
        const durationMonths = ECO_PTZ_COPRO.maxDurationYears * 12;
        const monthlyPayment = partLotLoan / durationMonths;

        return {
            partLotCash,
            partLotLoan,
            monthlyPayment,
            durationYears: ECO_PTZ_COPRO.maxDurationYears,
        };
    }, [financing.remainingCost, financing.ecoPtzAmount, tantiemes]);

    const presets = [
        { label: "Studio", val: 30 },
        { label: "T2", val: 55 },
        { label: "T3", val: 80 },
        { label: "T4", val: 110 },
        { label: "T5+", val: 150 },
    ];

    return (
        <div className={`card-bento p-0 flex flex-col h-full ${className}`}>
            {/* Header */}
            <div className="p-6 pb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-900/50 to-primary-800/20 rounded-xl flex items-center justify-center border border-primary-500/20 shadow-glow-sm">
                        <span className="text-primary-400 text-lg">🧮</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-main">Simulateur Individuel</h3>
                        <p className="text-xs text-muted">Ajustez selon votre quote-part</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 pt-4 flex flex-col justify-between">

                {/* Hero Metric: Monthly Payment */}
                <div className="text-center mb-6">
                    <p className="text-xs text-primary-300 font-medium uppercase tracking-wide mb-2 opacity-80">
                        Votre effort d&apos;épargne
                    </p>
                    <div className="flex items-end justify-center gap-1.5 text-primary-100">
                        <span className="text-6xl font-black tracking-tighter drop-shadow-xl text-gradient-gold">
                            {Math.round(calculation.monthlyPayment)}
                        </span>
                        <div className="flex flex-col text-left mb-2">
                            <span className="text-xl font-bold text-primary-400">€</span>
                            <span className="text-xs font-medium text-muted">/mois</span>
                        </div>
                    </div>
                    <div className="mt-3 inline-flex items-center px-3 py-1 bg-primary-900/10 border border-primary-500/10 rounded-full">
                        <span className="text-[10px] text-primary-400">
                            Prêt Taux Zéro sur {calculation.durationYears} ans
                        </span>
                    </div>
                </div>

                {/* Slider Control */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <label htmlFor="tantiemes" className="text-sm font-medium text-main">
                            Quote-part : <span className="text-primary-400 font-bold">{tantiemes}</span> <span className="text-muted text-xs">/ 1000èmes</span>
                        </label>
                    </div>

                    <div className="relative h-6 flex items-center mb-4">
                        <input
                            type="range"
                            id="tantiemes"
                            min={1}
                            max={400}
                            value={tantiemes}
                            onChange={(e) => setTantiemes(Number(e.target.value))}
                            className="w-full h-2 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-primary-500 hover:accent-primary-400 transition-all"
                        />
                    </div>

                    {/* Presets */}
                    <div className="flex justify-between gap-1 overflow-x-auto pb-1 no-scrollbar">
                        {presets.map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => setTantiemes(preset.val)}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all border ${tantiemes === preset.val
                                        ? 'bg-primary-900/30 text-primary-300 border-primary-500/30'
                                        : 'bg-surface-highlight text-muted border-transparent hover:bg-surface-hover hover:text-main'
                                    }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Detail Breakdown */}
                <div className="grid grid-cols-2 gap-3 mt-auto">
                    <div className="bg-surface-highlight/50 rounded-xl p-3 border border-boundary/40 text-center">
                        <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Reste à Charge</p>
                        <p className="text-lg font-bold text-main">
                            {formatCurrency(calculation.partLotCash)}
                        </p>
                        <p className="text-[10px] text-subtle">Apport requis</p>
                    </div>
                    <div className="bg-surface-highlight/50 rounded-xl p-3 border border-boundary/40 text-center">
                        <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Financé PTZ</p>
                        <p className="text-lg font-bold text-primary-400">
                            {formatCurrency(calculation.partLotLoan)}
                        </p>
                        <p className="text-[10px] text-subtle">Emprunté 0%</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
