"use client";

import { formatCurrency, formatPercent } from "@/lib/calculator";
import { type ValuationResult, type FinancingPlan } from "@/lib/schemas";
import { useViewModeStore } from "@/stores/useViewModeStore";

interface ValuationCardProps {
    valuation: ValuationResult;
    financing?: FinancingPlan;
}

export function ValuationCard({ valuation, financing }: ValuationCardProps) {
    const { viewMode, getAdjustedValue } = useViewModeStore();
    const isMaPoche = viewMode === 'maPoche';

    // Smart display: if remainingCost is 0, show single "Gain Net Immédiat" block
    const isFullyFunded = financing ? financing.remainingCost === 0 : valuation.netROI === valuation.greenValueGain;

    // Adjusted values for "Ma Poche" mode
    const displayGreenValueGain = getAdjustedValue(valuation.greenValueGain);
    const displayNetROI = getAdjustedValue(valuation.netROI);

    return (
        <div className="card-bento px-6 py-5 flex flex-col justify-between relative overflow-hidden group h-full">
            {isFullyFunded ? (
                // Single block: 100% financed scenario
                <div className="flex flex-col items-center justify-center text-center py-4">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-success-500/20 text-success-400 uppercase tracking-wide border border-success-500/30">
                            🎯 Gain net {isMaPoche ? '(votre part)' : 'immédiat'}
                        </span>
                    </div>
                    <p className="text-4xl lg:text-5xl font-black text-success-500 tracking-tight leading-none mb-2">
                        +{formatCurrency(displayGreenValueGain)}
                    </p>
                    <p className="text-sm text-success-400 font-medium mb-1">
                        soit +{formatPercent(valuation.greenValueGainPercent)} de &quot;Valeur Verte&quot;
                    </p>
                    <p className="text-xs text-muted mt-2 max-w-sm">
                        100% financé par les aides et l&apos;Éco-PTZ — Aucun apport personnel requis
                    </p>
                </div>
            ) : (
                // Dual display: when there's a remaining cost
                <div className="flex flex-col md:flex-row items-end justify-between gap-6 h-full">
                    {/* Left: Green Value Gain */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-success-100/10 text-success-500 uppercase tracking-wide border border-success-500/20">
                                Valorisation {isMaPoche && '(votre part)'}
                            </span>
                        </div>
                        <p className="text-3xl lg:text-4xl font-black text-success-500 tracking-tight leading-none mb-1 break-words">
                            +{formatCurrency(displayGreenValueGain)}
                        </p>
                        <p className="text-sm font-medium text-success-400">
                            soit +{formatPercent(valuation.greenValueGainPercent)} de &quot;Valeur Verte&quot;
                        </p>
                    </div>

                    {/* Right: Net ROI */}
                    <div className="flex-1 w-full md:w-auto md:text-right pt-4 border-t border-boundary md:border-t-0 md:pt-0">
                        <p className="text-xs text-muted uppercase tracking-wider mb-1">ROI net {isMaPoche ? '(vous)' : 'propriétaire'}</p>
                        <div className="flex md:justify-end items-baseline gap-2">
                            <span className={`text-xl font-bold ${displayNetROI >= 0 ? 'text-main' : 'text-danger-500'}`}>
                                {displayNetROI >= 0 ? '+' : ''}{formatCurrency(displayNetROI)}
                            </span>
                            <span className="text-xs text-muted">net travaux</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

