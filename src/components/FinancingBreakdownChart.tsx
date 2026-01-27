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
    Legend,
    Tooltip,
} from "recharts";
import { type FinancingPlan } from "@/lib/schemas";

interface FinancingBreakdownChartProps {
    financing: FinancingPlan;
}

const COLORS = {
    mpr: "#22c55e", // Vert - MaPrimeRénov'
    ptz: "#3b82f6", // Bleu - Éco-PTZ
    reste: "#6b7280", // Gris - Reste à charge
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
    const aidesCoverage = ((financing.mprAmount + financing.ecoPtzAmount) / financing.totalCostHT) * 100;

    // Custom Label for Recharts
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        return null;
    };

    return (
        <div className="card-bento p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-main flex items-center gap-2">
                    💰 Répartition du Financement
                </h3>
                <div className="text-right">
                    <p className="text-xs text-muted uppercase">Couverture Aides</p>
                    <p className="text-lg font-bold text-success-500">{aidesCoverage.toFixed(0)}%</p>
                </div>
            </div>

            {/* Donut Chart */}
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
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
                                backgroundColor: "#171717", // Neutral-900 like
                                border: "1px solid #262626", // Neutral-800
                                borderRadius: "8px",
                                color: "#fff",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                            itemStyle={{ color: "#e5e5e5" }}
                        />
                        <Legend
                            formatter={(value, entry) => {
                                const item = data.find((d) => d.name === value);
                                return (
                                    <span className="text-sm text-secondary">
                                        {value} ({item ? formatPercent(item.value) : ""})
                                    </span>
                                );
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Centre du donut - Total */}
            <div className="text-center -mt-4 mb-4">
                <p className="text-xs text-muted uppercase">Coût Total</p>
                <p className="text-xl font-bold text-main">{formatCurrency(financing.totalCostHT)}</p>
            </div>

            {/* Breakdown détaillé */}
            <div className="space-y-3 mt-4 pt-4 border-t border-boundary">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm text-secondary">{item.name}</span>
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
