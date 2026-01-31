"use client";

import { formatCurrency, formatPercent } from "@/lib/calculator";
import { type ValuationResult, type FinancingPlan } from "@/lib/schemas";
import { useViewModeStore } from "@/stores/useViewModeStore";
import { getMarketTrend } from "@/lib/market-data";

interface ValuationCardProps {
    valuation: ValuationResult;
    financing?: FinancingPlan;
    marketTrend?: {
        national: number;
        comment?: string;
    };
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
export function ValuationCard({ valuation, financing, marketTrend }: ValuationCardProps) {
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

                {/* 1. La Valeur Verte */}
                <div className="relative z-10">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs uppercase tracking-wider text-muted font-semibold">
                            {isMarketDown ? "Capital Protégé" : "Plus-Value Latente"} {isMaPoche && '(Ma Part)'}
                        </span>
                        <span className={`text-xs font-mono px-2 py-0.5 rounded ${isMarketDown ? 'bg-cyan-900/20 text-cyan-400' : 'bg-success-900/20 text-success-400'}`}>
                            {isMarketDown ? 'ANTI-DÉCOTE' : `+${formatPercent(valuation.greenValueGainPercent)}`}
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-4xl lg:text-5xl font-black tracking-tight leading-none drop-shadow-md ${accentColorClass}`}>
                            +{formatCurrency(displayGreenValueGain)}
                        </span>
                    </div>
                    <p className="text-xs text-subtle mt-2">
                        {isMarketDown
                            ? "Bouclier patrimonial contre la baisse du marché des passoires"
                            : 'Gain de "Valeur Verte" immédiat à la fin des travaux'}
                    </p>
                </div>

                {/* Market Context - AUDIT 31/01/2026 */}
                {isMarketDeclining && (
                    <div className="bg-warning-900/10 border border-warning-500/20 rounded-lg p-3 text-xs">
                        <div className="flex items-start gap-2">
                            <span className="text-warning-400">📊</span>
                            <div>
                                <p className="text-warning-300 font-medium">Contexte marché</p>
                                <p className="text-muted mt-1">
                                    Tendance nationale : <span className="text-warning-400">{(marketTrend.threeMonths * 100).toFixed(1)}%</span> sur 3 mois.
                                    {isPassoire && " Sans rénovation, votre bien subit cette baisse + la décote passoire."}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Divider with calculation logic */}
                <div className="relative h-px bg-boundary/50 my-1 flex items-center justify-center">
                    <span className="bg-surface px-2 text-[10px] text-muted uppercase tracking-widest">
                        Net de Travaux
                    </span>
                </div>

                {/* 2. Le Net (ROI) */}
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-wider text-muted font-semibold mb-1">
                            Gain Net Réel
                        </p>
                        <p className="text-xs text-subtle">
                            (Plus-value - Reste à charge)
                        </p>
                    </div>

                    <div className={`text-right ${displayNetROI >= 0 ? 'text-main' : 'text-warning-500'}`}>
                        <span className="text-3xl font-bold tabular-nums">
                            {displayNetROI >= 0 ? '+' : ''}{formatCurrency(displayNetROI)}
                        </span>
                    </div>
                </div>

                {/* Context Hint */}
                {financing && !isFullyFunded && (
                    <div className="bg-surface-highlight rounded-lg p-3 border border-boundary/40 flex justify-between items-center text-xs">
                        <span className="text-muted">Coût travaux déduit :</span>
                        <span className="text-main font-medium">-{formatCurrency(displayRemainingCost)}</span>
                    </div>
                )}
            </div>

            {/* Footer Source */}
            <div className="px-6 py-3 bg-surface-highlight/30 border-t border-boundary/50 text-[10px] text-muted">
                <div className="flex justify-between items-center">
                    <span>
                        {valuation.salesCount ? `Basé sur ${valuation.salesCount} ventes réelles` : 'Estimation théorique'}
                    </span>
                    <span className="font-medium opacity-50">
                        Source : {valuation.priceSource || 'Etalab DVF'}
                    </span>
                </div>
                {isMarketDeclining && (
                    <p className="mt-1 text-warning-400/70">
                        Tendance marché : Notaires de France (12/2025)
                    </p>
                )}
            </div>
        </div>

    );
}
