"use client";

import { motion } from "framer-motion";
import { type InactionCost, type ValuationResult, type FinancingPlan } from "@/lib/schemas";
import { formatCurrency } from "@/lib/calculator";
import { useViewModeStore } from "@/stores/useViewModeStore";
import { AnimatedCurrency } from "@/components/ui/AnimatedNumber";

interface ComparisonSplitScreenProps {
    inactionCost: InactionCost;
    valuation: ValuationResult;
    financing: FinancingPlan;
}

export function ComparisonSplitScreen({ inactionCost, valuation, financing }: ComparisonSplitScreenProps) {
    const { viewMode, getAdjustedValue } = useViewModeStore();

    // Data Calculation
    const totalLoss = getAdjustedValue(inactionCost.totalInactionCost);
    const netGain = getAdjustedValue(valuation.netROI);
    // const totalWealthGap = totalLoss + netGain; // Removed as per request

    // For the Balance Visual in Right Card
    const cost = getAdjustedValue(financing.remainingCost);
    const valueGain = getAdjustedValue(valuation.greenValueGain);
    const maxVal = Math.max(cost, valueGain);
    const costPct = maxVal > 0 ? (cost / maxVal) * 100 : 0;
    const gainPct = maxVal > 0 ? (valueGain / maxVal) * 100 : 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT: THE CRASH (Inaction) */}
            <div className="card-obsidian p-8 md:p-10 flex flex-col justify-between group bg-danger-900/5 border-danger-500/10 hover:border-danger-500/20 transition-all">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-danger-900/20 border border-danger-500/20 text-danger-400 text-xs font-bold uppercase tracking-wider mb-6">
                        🔴 Scénario Inaction
                    </div>
                    <h3 className="text-3xl font-bold text-main tracking-tight mb-2">
                        L&apos;Enlisement
                    </h3>
                    <p className="text-muted text-lg leading-relaxed">
                        Votre patrimoine s&apos;érode chaque année sous l&apos;effet de l&apos;inflation travaux et de la décote énergétique.
                    </p>
                </div>

                <div className="mt-12 space-y-6">
                    <div className="flex justify-between items-end border-b border-danger-500/10 pb-4">
                        <span className="text-muted">Surcoût Travaux (+3 ans)</span>
                        <span className="text-xl font-bold text-danger tabular-nums">
                            -<AnimatedCurrency value={getAdjustedValue(inactionCost.projectedCost3Years - inactionCost.currentCost)} />
                        </span>
                    </div>
                    {inactionCost.valueDepreciation > 0 && (
                        <div className="flex justify-between items-end border-b border-danger-500/10 pb-4">
                            <span className="text-muted">Décote Passoire</span>
                            <span className="text-xl font-bold text-danger tabular-nums">
                                -<AnimatedCurrency value={getAdjustedValue(inactionCost.valueDepreciation)} />
                            </span>
                        </div>
                    )}
                    <div className="pt-2">
                        <p className="text-sm font-medium text-danger/70 mb-1">PERTE TOTALE ESTIMÉE</p>
                        <p className="text-4xl md:text-5xl font-black text-danger tracking-tighter">
                            -<AnimatedCurrency value={totalLoss} />
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT: THE UPSIDE (Action) */}
            <div className="card-obsidian p-8 md:p-10 flex flex-col justify-between relative overflow-hidden bg-success-900/5 border-success-500/10 hover:border-success-500/20 transition-all">
                {/* Background Shine effect */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-success-500/10 blur-[100px] rounded-full pointer-events-none" />

                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success-900/20 border border-success-500/20 text-success-400 text-xs font-bold uppercase tracking-wider mb-6">
                        🟢 Scénario Valo-Syndic
                    </div>
                    <h3 className="text-3xl font-bold text-main tracking-tight mb-2">
                        L&apos;Investissement
                    </h3>
                    <p className="text-muted text-lg leading-relaxed">
                        Transformation en actif liquide, conforme 2050 et valorisé.
                    </p>
                </div>

                {/* THE BALANCE VISUAL */}
                <div className="mt-8 mb-4 space-y-3">
                    {/* Bars Comparison */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium uppercase tracking-wide">
                            <span className="text-main">Coût Réel</span>
                            <span className="text-success-400">Plus-Value</span>
                        </div>
                        <div className="h-4 bg-surface-highlight rounded-full flex overflow-hidden relative">
                            {/* Cost Bar (Left) */}
                            <motion.div
                                className="h-full bg-main opacity-30"
                                initial={{ width: 0 }}
                                animate={{ width: `${costPct}%` }}
                                transition={{ duration: 1 }}
                            />
                            {/* Value Bar (Right, overlapping or stacked logic? User said "Balance visual". Side by side is clearer for "Scale") */}
                            {/* Actually, let's do two separate bars aligned to compare lengths directly like the CostValueBalance component did */}
                        </div>

                        {/* Let's replicate the CostValueBalance mini-bars here instead of a single bar */}
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                                <div className="h-2 bg-surface rounded-full overflow-hidden mb-1">
                                    <motion.div
                                        className="h-full bg-red-400/50"
                                        style={{ width: `${costPct}%` }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${costPct}%` }}
                                    />
                                </div>
                                <p className="text-xs text-muted">Coût: {formatCurrency(cost)}</p>
                            </div>
                            <div>
                                <div className="h-2 bg-surface rounded-full overflow-hidden mb-1">
                                    <motion.div
                                        className="h-full bg-success-500"
                                        style={{ width: `${gainPct}%` }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${gainPct}%` }}
                                    />
                                </div>
                                <p className="text-xs text-success-400">Gain: {formatCurrency(valueGain)}</p>
                            </div>
                        </div>

                    </div>
                </div>


                <div className="mt-4 space-y-6 pt-6 border-t border-success-500/10">
                    <div className="pt-2">
                        <p className="text-sm font-medium text-success/70 mb-1">ENRICHISSEMENT NET</p>
                        <div className="text-4xl md:text-5xl font-black text-success tracking-tighter flex items-center gap-2">
                            +<AnimatedCurrency value={netGain} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
