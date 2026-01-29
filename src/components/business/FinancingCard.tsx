/**
 * FinancingCard — Plan de financement détaillé
 * Le "Plan de Bataille" avec aides et mensualités.
 * ✨ Version animée avec Framer Motion
 */

"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { BenchmarkBadge } from "@/components/ui/BenchmarkBadge";
import {
    loadBenchmarks,
    evaluateCostPerLotSync,
    type BenchmarkData,
    type BenchmarkResult,
} from "@/lib/services/marketBenchmarkService";
import { type FinancingPlan } from "@/lib/schemas";
import { formatPercent, formatCurrency } from "@/lib/calculator";
import { AnimatedCurrency, AnimatedPercent } from "@/components/ui/AnimatedNumber";
import { useViewModeStore } from "@/stores/useViewModeStore";

interface FinancingCardProps {
    financing: FinancingPlan;
    numberOfUnits: number;
}

import { DEFAULT_TRANSITION } from "@/lib/animations";

export function FinancingCard({ financing, numberOfUnits }: FinancingCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const { viewMode, getAdjustedValue } = useViewModeStore();
    const isMaPoche = viewMode === 'maPoche';

    // Market Watchdog — Benchmark Evaluation
    const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null);
    const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null);

    useEffect(() => {
        loadBenchmarks().then((data) => {
            if (data) {
                setBenchmarkData(data);
            }
        });
    }, []);

    useEffect(() => {
        if (benchmarkData && numberOfUnits > 0 && financing.worksCostHT > 0) {
            const result = evaluateCostPerLotSync(
                financing.worksCostHT,
                numberOfUnits,
                benchmarkData
            );
            setBenchmarkResult(result);
        }
    }, [benchmarkData, financing.worksCostHT, numberOfUnits]);

    return (
        <motion.div
            ref={ref}
            className="card-bento group relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={DEFAULT_TRANSITION}
        >
            <div className="relative z-10">
                <h3 className="text-xl font-semibold text-main mb-8 flex items-center gap-3">
                    <span className="text-2xl">💰</span> Plan de Financement & Aides
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Colonne GAUCHE : La Facture */}
                    <div className="flex flex-col h-full border-b md:border-b-0 md:border-r border-boundary/50 md:pr-8 pb-8 md:pb-0">
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-muted uppercase tracking-wider mb-6">Détail du Projet</h4>

                            {/* Travaux Seuls */}
                            <div className="flex justify-between items-baseline mb-4 group/item">
                                <p className="text-sm text-body group-hover/item:text-main transition-colors">Travaux de rénovation (HT)</p>
                                <p className="text-main font-medium"><AnimatedCurrency value={financing.worksCostHT} /></p>
                            </div>

                            {/* Frais Annexes */}
                            <div className="space-y-3 mb-6 pl-4 border-l-2 border-boundary">
                                <div className="flex justify-between text-sm text-muted">
                                    <span>Honoraires Syndic (3%)</span>
                                    <span><AnimatedCurrency value={financing.syndicFees} /></span>
                                </div>
                                <div className="flex justify-between text-sm text-muted">
                                    <span>Assurance DO (2%)</span>
                                    <span><AnimatedCurrency value={financing.doFees} /></span>
                                </div>
                                <div className="flex justify-between text-sm text-muted">
                                    <span>Aléas & Imprévus (3%)</span>
                                    <span><AnimatedCurrency value={financing.contingencyFees} /></span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <div className="p-4 bg-surface-highlight rounded-xl border border-primary-500/20">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <p className="text-primary-400 font-bold uppercase text-xs tracking-wider">Total Projet</p>
                                        <p className="text-xs text-muted">Avant déduction des aides</p>
                                    </div>
                                    <p className="text-2xl md:text-3xl font-bold text-main tabular-nums tracking-tight">
                                        <AnimatedCurrency value={financing.totalCostHT} duration={1.2} />
                                    </p>
                                </div>
                                {/* Market Watchdog Badge */}
                                {benchmarkResult && (
                                    <div className="mt-2">
                                        <BenchmarkBadge
                                            status={benchmarkResult.status}
                                            label={benchmarkResult.label}
                                        />
                                    </div>
                                )}
                                <div className="text-right mt-2">
                                    <p className="text-xs text-muted">
                                        Soit <span className="text-main font-medium">{formatCurrency(financing.costPerUnit)}</span> / lot
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Colonne DROITE : Le Financement */}
                    <div className="flex flex-col h-full">
                        <h4 className="text-sm font-medium text-muted uppercase tracking-wider mb-6">Solutions de Financement</h4>

                        <div className="space-y-4 flex-1">
                            {/* MaPrimeRénov' */}
                            <motion.div
                                className="flex items-center justify-between p-4 bg-gradient-to-br from-primary-900/40 to-primary-900/10 rounded-xl border border-primary-500/30 shadow-sm hover:border-primary-500/50 transition-colors"
                                whileHover={{ scale: 1.01 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary-900/50 rounded-lg border border-primary-500/20">
                                        <span className="text-xl">🏛️</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-primary-300">MaPrimeRénov&apos;</p>
                                        <p className="text-xs text-primary-400/80">
                                            {formatPercent(financing.mprRate)} prise en charge
                                        </p>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-primary-300 tabular-nums">
                                    -<AnimatedCurrency value={financing.mprAmount} duration={1.3} />
                                </span>
                            </motion.div>

                            {/* Éco-PTZ */}
                            <motion.div
                                className="flex items-center justify-between p-4 bg-surface rounded-xl border border-boundary hover:border-gold-500/30 transition-colors group/ptz"
                                whileHover={{ scale: 1.01 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-surface-highlight rounded-lg border border-boundary group-hover/ptz:border-gold-500/20">
                                        <span className="text-xl">🏦</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-main">Éco-PTZ Copro</p>
                                        <p className="text-xs text-muted">Taux 0% • Durée 20 ans</p>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-body tabular-nums">
                                    <AnimatedCurrency value={financing.ecoPtzAmount} duration={1.4} />
                                </span>
                            </motion.div>
                        </div>

                        {/* Reste à Charge & Mensualité */}
                        <div className="mt-8 pt-6 border-t border-boundary">
                            <div className="flex flex-col sm:flex-row items-end justify-between gap-4">
                                <div className="w-full sm:w-auto">
                                    <p className="text-sm text-muted mb-1">
                                        Reste à charge {isMaPoche ? '(votre part)' : 'final'}
                                    </p>
                                    <p className="text-3xl font-bold text-main tabular-nums">
                                        <AnimatedCurrency value={getAdjustedValue(financing.remainingCost)} duration={1.5} />
                                    </p>
                                    <p className="text-xs text-subtle mt-1">
                                        (Après subventions)
                                    </p>
                                </div>

                                <div className="text-right">
                                    <div className="inline-flex flex-col items-end p-3 bg-surface-highlight rounded-lg border border-primary-500/20 shadow-glow-sm">
                                        <span className="text-xs text-primary-400 font-medium uppercase tracking-wide mb-1">
                                            Mensualité {isMaPoche ? 'estimée' : 'Copro'}
                                        </span>
                                        <span className="text-2xl font-bold text-primary-300 tabular-nums">
                                            <AnimatedCurrency value={getAdjustedValue(financing.monthlyPayment)} duration={1.6} />
                                            <span className="text-sm font-normal text-muted ml-1">/mois</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Gain Énergétique */}
                <div className="mt-8 pt-4 border-t border-boundary/30 flex justify-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success-900/20 border border-success-500/20">
                        <span className="text-xs text-success-400">⚡ Gain énergétique projeté :</span>
                        <span className="text-sm font-bold text-success-400">
                            -{Math.round(financing.energyGainPercent * 100)}%
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
