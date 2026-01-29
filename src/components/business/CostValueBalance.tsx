/**
 * CostValueBalance — "Cost vs Value" Balance Chart
 * A simple horizontal bar comparison: Cost (Red) vs Value Gain (Green)
 * The ultimate argument for investors: "You're not spending, you're gaining."
 */

"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/calculator";
import { useViewModeStore } from "@/stores/useViewModeStore";

interface CostValueBalanceProps {
    /** The remaining cost after subsidies (expense) */
    cost: number;
    /** The green value gain (patrimony increase) */
    valueGain: number;
}

export function CostValueBalance({ cost, valueGain }: CostValueBalanceProps) {
    const { getAdjustedValue, viewMode } = useViewModeStore();
    const isMaPoche = viewMode === 'maPoche';

    const displayCost = getAdjustedValue(cost);
    const displayValueGain = getAdjustedValue(valueGain);

    // Calculate bar widths relative to the larger value
    const maxValue = Math.max(displayCost, displayValueGain);
    const costPercent = maxValue > 0 ? (displayCost / maxValue) * 100 : 0;
    const gainPercent = maxValue > 0 ? (displayValueGain / maxValue) * 100 : 0;

    // Net balance
    const netBalance = displayValueGain - displayCost;
    const isPositive = netBalance >= 0;

    return (
        <div className="card-bento p-6">
            {/* Header */}
            <h3 className="text-lg font-semibold text-main mb-6 flex items-center gap-2">
                <span className="text-xl">⚖️</span> Coût vs Plus-Value
            </h3>

            <div className="space-y-4">
                {/* Cost Bar */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted">Dépense {isMaPoche && '(votre part)'}</span>
                        <span className="text-sm font-bold text-danger-500 tabular-nums">
                            {formatCurrency(displayCost)}
                        </span>
                    </div>
                    <div className="h-4 bg-surface rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-danger-600 to-danger-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${costPercent}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                    </div>
                </div>

                {/* Value Gain Bar */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted">Gain Patrimonial {isMaPoche && '(votre part)'}</span>
                        <span className="text-sm font-bold text-success-500 tabular-nums">
                            +{formatCurrency(displayValueGain)}
                        </span>
                    </div>
                    <div className="h-4 bg-surface rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-success-600 to-success-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${gainPercent}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        />
                    </div>
                </div>
            </div>

            {/* Net Balance */}
            <div className={`mt-6 p-4 rounded-xl border ${isPositive ? 'bg-success-900/20 border-success-500/30' : 'bg-danger-900/20 border-danger-500/30'}`}>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-main">
                        {isPositive ? '📈 Solde net positif' : '📉 Solde net à financer'}
                    </span>
                    <span className={`text-xl font-bold tabular-nums ${isPositive ? 'text-success-400' : 'text-danger-400'}`}>
                        {isPositive ? '+' : ''}{formatCurrency(netBalance)}
                    </span>
                </div>
                {isPositive && displayCost === 0 && (
                    <p className="text-xs text-success-400/80 mt-2">
                        💡 Investissement immédiat = Plus-value à la signature
                    </p>
                )}
            </div>
        </div>
    );
}
