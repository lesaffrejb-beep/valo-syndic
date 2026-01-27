/**
 * EnergyInflationChart — "La Courbe de la Peur"
 * =============================================
 * Visualisation de l'inflation des coûts de travaux sur 5 ans.
 * Design néo-banque avec gradient et animations.
 */

"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import { TECHNICAL_PARAMS } from "@/lib/constants";

interface EnergyInflationChartProps {
    currentCost: number;
    /** Nombre d'années à projeter */
    yearsToProject?: number;
}

interface ChartDataPoint {
    year: string;
    cost: number;
    isToday: boolean;
}

export function EnergyInflationChart({
    currentCost,
    yearsToProject = 5,
}: EnergyInflationChartProps) {
    const inflationRate = TECHNICAL_PARAMS.constructionInflationRate;

    // Générer les données pour le graphique
    const data: ChartDataPoint[] = [];
    for (let i = 0; i <= yearsToProject; i++) {
        const year = new Date().getFullYear() + i;
        const projectedCost = currentCost * Math.pow(1 + inflationRate, i);
        data.push({
            year: i === 0 ? "Aujourd'hui" : `${year}`,
            cost: Math.round(projectedCost),
            isToday: i === 0,
        });
    }

    const maxCost = data[data.length - 1].cost;
    const costIncrease = maxCost - currentCost;
    const increasePercent = ((maxCost / currentCost - 1) * 100).toFixed(0);

    // Format pour les montants
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("fr-FR", {
            notation: "compact",
            maximumFractionDigits: 0,
        }).format(value) + " €";

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    📈 Projection Coûts Travaux
                </h3>
                <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase">Inflation BTP</p>
                    <p className="text-sm font-bold text-danger-600">
                        +{(inflationRate * 100).toFixed(1)}%/an
                    </p>
                </div>
            </div>

            {/* Message anxiogène */}
            <div className="mb-4 p-3 bg-gradient-to-r from-danger-50 to-warning-50 rounded-lg border border-danger-100">
                <p className="text-sm text-danger-800">
                    <span className="font-semibold">⚠️ En attendant {yearsToProject} ans,</span> vous perdez{" "}
                    <span className="font-bold text-danger-600">{formatCurrency(costIncrease)}</span>{" "}
                    <span className="text-gray-600">(+{increasePercent}%)</span>
                </p>
            </div>

            {/* Chart */}
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="year"
                            tick={{ fontSize: 12, fill: "#6b7280" }}
                            axisLine={{ stroke: "#e5e7eb" }}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: "#6b7280" }}
                            tickFormatter={formatCurrency}
                            axisLine={{ stroke: "#e5e7eb" }}
                            width={70}
                        />
                        <Tooltip
                            formatter={(value: number | undefined) => [formatCurrency(value ?? 0), "Coût estimé"]}
                            contentStyle={{
                                backgroundColor: "#1f2937",
                                border: "none",
                                borderRadius: "8px",
                                color: "#fff",
                            }}
                            labelStyle={{ color: "#9ca3af" }}
                        />
                        <ReferenceLine
                            y={currentCost}
                            stroke="#3b82f6"
                            strokeDasharray="5 5"
                            label={{
                                value: "Aujourd'hui",
                                fill: "#3b82f6",
                                fontSize: 11,
                                position: "insideTopRight",
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="cost"
                            stroke="#ef4444"
                            strokeWidth={3}
                            fill="url(#costGradient)"
                            animationDuration={1500}
                            animationEasing="ease-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
                Projection basée sur l'indice BT01 — inflation construction {(inflationRate * 100).toFixed(1)}%/an
            </p>
        </div>
    );
}
