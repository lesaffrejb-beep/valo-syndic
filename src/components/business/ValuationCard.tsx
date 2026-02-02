"use client";

import { formatCurrency, formatPercent } from "@/lib/calculator";
import { type ValuationResult, type FinancingPlan } from "@/lib/schemas";
import { useViewModeStore } from "@/stores/useViewModeStore";


interface ValuationCardProps {
    valuation: ValuationResult;
    financing?: FinancingPlan;
    marketTrend?: {
        national: number;
        comment?: string;
    };
    isPassoire?: boolean;
}

/**
 * VALUATION CARD — "Le Verdict Financier"
 * Design Updated: Obsidian / Premium
 *
 * AUDIT 31/01/2026: Narratif ajusté
 * - Terminologie "Protection de valeur" au lieu de "Gain" si marché baissier
 * - Contexte marché affiché pour transparence
 * - Mention de la source des données
 */
export function ValuationCard({ valuation, financing, marketTrend, isPassoire = false }: ValuationCardProps) {
    const { viewMode, getAdjustedValue } = useViewModeStore();
    const isMaPoche = viewMode === 'maPoche';

    // Values
    const displayGreenValueGain = getAdjustedValue(valuation.greenValueGain);
    const displayNetROI = getAdjustedValue(valuation.netROI);
    const displayRemainingCost = financing ? getAdjustedValue(financing.remainingCost) : 0;

    // Protection Logic
    const isMarketDown = marketTrend ? marketTrend.national < 0 : false;
    const title = isMarketDown ? "🛡️ Préservation de Capital" : "📈 Valorisation & ROI";
    const accentColorClass = isMarketDown ? "text-cyan-400" : "text-success-500";
    const badgeColorClass = isMarketDown
        ? "bg-cyan-900/20 text-cyan-400 border-cyan-500/20"
        : (displayNetROI >= 0 ? 'bg-success-900/20 text-success-400 border-success-500/20' : 'bg-warning-900/20 text-warning-400 border-warning-500/20');

    // Smart display logic
    const isFullyFunded = financing ? financing.remainingCost === 0 : false;


    return (
        <div className="card-bento h-full relative overflow-hidden group p-0">
            {/* Header Section */}
            <div className="p-6 pb-4 border-b border-boundary/50">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-main flex items-center gap-2">
                            {title}
                        </h3>
                        <p className="text-sm text-muted mt-1">
                            {isMarketDown ? "Sécurisation de votre actif immobilier" : "Impact financier de la rénovation"}
                        </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${isMarketDown
                        ? "bg-cyan-900/20 text-cyan-400 border-cyan-500/20"
                        : (displayNetROI >= 0 ? 'bg-success-900/20 text-success-400 border-success-500/20' : 'bg-warning-900/20 text-warning-400 border-warning-500/20')
                        }`}>
                        {isMarketDown ? 'SÉCURISÉ' : (displayNetROI >= 0 ? 'RENTABLE' : 'EFFORT REQUIS')}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6 pt-5 grid grid-cols-1 gap-6">

                {/* 1. La Valeur Verde */}
                <div className="relative z-10 bg-black/20 p-6 rounded-[24px] border border-white/5 shadow-tactile-inner group-hover:border-white/10 transition-all">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-bold mb-1">
                                {isMarketDown ? "Capital Protégé" : "Plus-Value Latente"}
                            </span>
                            <span className="text-[9px] font-mono text-white/20">Estimation Etalab 2026</span>
                        </div>
                        <div className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border ${isMarketDown ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-success-500/10 border-success-500/20 text-success-400'}`}>
                            {isMarketDown ? '🛡️ ANTI-DÉCOTE' : `📈 +${formatPercent(valuation.greenValueGainPercent)}`}
                        </div>
                    </div>

                    <div className="flex items-baseline gap-3">
                        <span className={`text-5xl lg:text-6xl font-black tracking-tighter leading-none ${accentColorClass} transition-all duration-500`}>
                            +{formatCurrency(displayGreenValueGain)}
                        </span>
                    </div>
                </div>

                {/* Market Context - AUDIT 31/01/2026 */}
                {isMarketDown && marketTrend && (
                    <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 text-xs">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/10">
                                <span className="text-amber-400">📊</span>
                            </div>
                            <div>
                                <p className="text-amber-200/60 font-medium uppercase tracking-widest text-[9px] mb-1">Contexte marché</p>
                                <p className="text-white/40 leading-relaxed">
                                    Tendance : <span className="text-amber-400 font-bold">{(marketTrend.national * 100).toFixed(1)}%</span>.
                                    {isPassoire && " Sans rénovation, votre bien subit cette baisse + la décote passoire énergétique."}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Divider with calculation logic */}
                <div className="flex items-center gap-4 px-2">
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[9px] text-white/20 uppercase tracking-[0.3em] font-mono whitespace-nowrap">Net de Travaux</span>
                    <div className="h-px flex-1 bg-white/5" />
                </div>

                {/* 2. Le Net (ROI) */}
                <div className="relative z-10 flex items-center justify-between bg-white/[0.02] p-6 rounded-[24px] border border-white/5">
                    <div className="flex flex-col gap-1">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">
                            Gain Net Réel
                        </p>
                        <p className="text-[9px] text-white/10 font-mono italic">
                            (Plus-value - Reste à charge)
                        </p>
                    </div>

                    <div className={`text-right ${displayNetROI >= 0 ? 'text-white' : 'text-amber-500'}`}>
                        <span className="text-4xl font-black tracking-tighter tabular-nums">
                            {displayNetROI >= 0 ? '+' : ''}{formatCurrency(displayNetROI)}
                        </span>
                    </div>
                </div>

                {/* Context Hint */}
                {financing && !isFullyFunded && (
                    <div className="px-6 py-2 flex justify-between items-center text-[10px] font-mono">
                        <span className="text-white/10">Coût travaux déduit :</span>
                        <span className="text-white/40 font-bold">-{formatCurrency(displayRemainingCost)}</span>
                    </div>
                )}
            </div>

        </div>

    );
}
