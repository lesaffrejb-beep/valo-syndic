/**
 * FinancingBreakdownChart — Répartition du financement
 * =====================================================
 * Visualisation en donut chart du plan de financement.
 * Design néo-banque avec animations.
 */

"use client";

import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { type FinancingPlan } from "@/lib/schemas";

interface FinancingBreakdownChartProps {
    financing: FinancingPlan;
}

// Design System Colors (from tailwind.config.ts tokens)
const COLORS = {
    mpr: "#22c55e",      // success-500
    ptz: "#3b82f6",      // blue-500
    local: "#10b981",    // emerald-500
    reste: "#6b7280",    // gray-500
};

export function FinancingBreakdownChart({ financing }: FinancingBreakdownChartProps) {
    const data = [
        {
            name: "MaPrimeRénov'",
            value: financing.mprAmount,
            color: COLORS.mpr,
            description: "Subvention de l'État",
        },
        {
            name: "Aides Locales",
            value: financing.localAidAmount,
            color: COLORS.local,
            description: "Subventions 49/44",
        },
        {
            name: "Éco-PTZ",
            value: financing.ecoPtzAmount,
            color: COLORS.ptz,
            description: "Prêt à taux zéro",
        },
        {
            name: "Reste à charge",
            value: financing.remainingCost,
            color: COLORS.reste,
            description: "À financer par la copro",
        },
    ].filter((item) => item.value > 0);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
        }).format(value);

    const formatPercent = (value: number) =>
        ((value / financing.totalCostHT) * 100).toFixed(0) + "%";

    // Calcul du taux de couverture par les aides
    const aidesCoverage = ((financing.mprAmount + financing.localAidAmount + financing.ecoPtzAmount) / financing.totalCostHT) * 100;

    return (
        <div className="card-bento p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-main flex items-center gap-2">
                    💰 Répartition du financement
                </h3>
                <div className="text-right">
                    <p className="text-xs text-muted uppercase">Couverture aides</p>
                    <p className="text-lg font-bold text-success-500">{aidesCoverage.toFixed(0)}%</p>
                </div>
            </div>

            {/* Donut Chart - No Legend (custom legend below) */}
            <div className="h-56 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={3}
                            dataKey="value"
                            animationDuration={1200}
                            animationEasing="ease-out"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    strokeWidth={0}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number | undefined) => formatCurrency(value ?? 0)}
                            contentStyle={{
                                backgroundColor: "#161719",
                                border: "1px solid rgba(255, 255, 255, 0.08)",
                                borderRadius: "8px",
                                color: "#fff",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
                            }}
                            itemStyle={{ color: "#e5e5e5" }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center label - Coût Total */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <p className="text-xs text-muted uppercase">Coût Total</p>
                        <p className="text-xl font-bold text-main">{formatCurrency(financing.totalCostHT)}</p>
                    </div>
                </div>
            </div>

            {/* Custom Legend - Vertical layout with proper spacing */}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-boundary">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm text-muted">{item.name}</span>
                        </div>
                        <div className="text-right">
                            <span className="font-semibold text-main">
                                {formatCurrency(item.value)}
                            </span>
                            <span className="text-xs text-muted ml-2">
                                ({formatPercent(item.value)})
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

