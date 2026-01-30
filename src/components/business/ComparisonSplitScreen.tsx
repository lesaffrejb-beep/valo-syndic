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
    const isMaPoche = viewMode === "maPoche";

    // Data Calculation
    const totalLoss = getAdjustedValue(inactionCost.totalInactionCost);
    const netGain = getAdjustedValue(valuation.netROI);
    const totalWealthGap = totalLoss + netGain;

    return (
        <div className="relative w-full overflow-hidden rounded-3xl border border-boundary shadow-2xl">
            {/* Split Background */}
            <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2">
                <div className="bg-gradient-to-br from-danger-900/10 to-danger-900/5 border-r border-boundary/50" />
                <div className="bg-gradient-to-bl from-success-900/10 to-success-900/5" />
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2">
                {/* LEFT: THE CRASH (Inaction) */}
                <div className="p-8 md:p-12 flex flex-col justify-between group">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-danger-900/20 border border-danger-500/30 text-danger-400 text-xs font-bold uppercase tracking-wider mb-6">
                            🔴 Scénario Inaction
                        </div>
                        <h3 className="text-3xl font-black text-main tracking-tight mb-2">
                            L&apos;Enlisement
                        </h3>
                        <p className="text-muted text-lg leading-relaxed">
                            Votre patrimoine s&apos;érode chaque année sous l&apos;effet de l&apos;inflation travaux et de la décote énergétique.
                        </p>
                    </div>

                    <div className="mt-12 space-y-6">
                        <div className="flex justify-between items-end border-b border-danger-500/20 pb-4">
                            <span className="text-muted">Surcoût Travaux (+3 ans)</span>
                            <span className="text-xl font-bold text-danger tabular-nums">
                                -<AnimatedCurrency value={getAdjustedValue(inactionCost.projectedCost3Years - inactionCost.currentCost)} />
                            </span>
                        </div>
                        {inactionCost.valueDepreciation > 0 && (
                            <div className="flex justify-between items-end border-b border-danger-500/20 pb-4">
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
                <div className="p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
                    {/* Background Shine effect */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-success-500/10 blur-[100px] rounded-full pointer-events-none" />

                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success-900/20 border border-success-500/30 text-success-400 text-xs font-bold uppercase tracking-wider mb-6">
                            🟢 Scénario Valo-Syndic
                        </div>
                        <h3 className="text-3xl font-black text-main tracking-tight mb-2">
                            L&apos;Investissement
                        </h3>
                        <p className="text-muted text-lg leading-relaxed">
                            Vous transformez une passoire en actif liquide, conforme 2050 et valorisé par le marché.
                        </p>
                    </div>

                    <div className="mt-12 space-y-6">
                        <div className="flex justify-between items-end border-b border-success-500/20 pb-4">
                            <span className="text-muted">Reste à Charge (Après Aides)</span>
                            <span className="text-xl font-bold text-main tabular-nums">
                                -<AnimatedCurrency value={getAdjustedValue(financing.remainingCost)} />
                            </span>
                        </div>
                        <div className="flex justify-between items-end border-b border-success-500/20 pb-4">
                            <span className="text-muted">Gain Valeur Verte</span>
                            <span className="text-xl font-bold text-success tabular-nums">
                                +<AnimatedCurrency value={getAdjustedValue(valuation.greenValueGain)} />
                            </span>
                        </div>
                        <div className="pt-2">
                            <p className="text-sm font-medium text-success/70 mb-1">ENRICHISSEMENT NET</p>
                            <div className="text-4xl md:text-5xl font-black text-success tracking-tighter flex items-center gap-2">
                                +<AnimatedCurrency value={netGain} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CENTER PILL: THE GAP */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block z-20">
                <div className="bg-surface-highlight backdrop-blur-xl border border-boundary/50 shadow-2xl rounded-2xl p-4 text-center min-w-[200px] flex flex-col items-center gap-1 group hover:scale-105 transition-transform duration-300">
                    <span className="text-[10px] uppercase font-bold text-muted tracking-widest">Écart de Richesse</span>
                    <div className="text-2xl font-black bg-gradient-to-r from-danger to-success bg-clip-text text-transparent tabular-nums">
                        {formatCurrency(totalWealthGap)}
                    </div>
                    <span className="text-[10px] text-subtle">
                        Entre ne rien faire et agir
                    </span>
                </div>
            </div>
        </div>
    );
}
