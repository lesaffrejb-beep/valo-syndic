/**
 * BenchmarkChart — Comparaison DPE vs Moyenne Régionale
 * "Vous sur-consommez de X% par rapport à vos voisins"
 */

"use client";

import { useMemo } from "react";
import { type DPELetter, DPE_NUMERIC_VALUE } from "@/lib/constants";

interface BenchmarkChartProps {
    currentDPE: DPELetter;
    city?: string | undefined;
    className?: string | undefined;
}

// Données benchmark Angers (Maine-et-Loire)
const REGIONAL_BENCHMARK = {
    city: "Angers",
    averageDPE: "D" as DPELetter,
    averageConsumption: 250, // kWh/m²/an
    source: "ADEME 2024",
};

// Consommation moyenne par classe DPE (kWh/m²/an)
const DPE_CONSUMPTION: Record<DPELetter, number> = {
    A: 50,
    B: 90,
    C: 150,
    D: 250,
    E: 330,
    F: 420,
    G: 500,
};

export function BenchmarkChart({ currentDPE, city = "Angers", className = "" }: BenchmarkChartProps) {
    const analysis = useMemo(() => {
        const yourConsumption = DPE_CONSUMPTION[currentDPE];
        const avgConsumption = REGIONAL_BENCHMARK.averageConsumption;

        const excessPercent = Math.round(((yourConsumption - avgConsumption) / avgConsumption) * 100);
        const isAboveAverage = excessPercent > 0;

        const yourScore = DPE_NUMERIC_VALUE[currentDPE];
        const avgScore = DPE_NUMERIC_VALUE[REGIONAL_BENCHMARK.averageDPE];
        const scoreDiff = avgScore - yourScore;

        return {
            yourConsumption,
            avgConsumption,
            excessPercent: Math.abs(excessPercent),
            isAboveAverage,
            scoreDiff,
        };
    }, [currentDPE]);

    const getDPEColor = (dpe: DPELetter): string => {
        const colors: Record<DPELetter, string> = {
            A: "#00a651",
            B: "#51b747",
            C: "#b4ce00",
            D: "#fff200",
            E: "#f7981c",
            F: "#ea5a0b",
            G: "#e30613",
        };
        return colors[dpe];
    };

    const yourBarWidth = Math.min((analysis.yourConsumption / 600) * 100, 100);
    const avgBarWidth = (analysis.avgConsumption / 600) * 100;

    return (
        <div className={`card-bento p-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-600/40 to-orange-700/40 rounded-xl flex items-center justify-center border border-orange-500/20">
                    <span className="text-orange-400 text-lg">📊</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-main">Benchmark Régional</h3>
                    <p className="text-sm text-muted">Comparaison avec {city}</p>
                </div>
            </div>

            {/* Barres de comparaison */}
            <div className="space-y-4 mb-6">
                {/* Votre copro */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-secondary">Votre Copro ({currentDPE})</span>
                        <span className="text-sm font-bold text-main">{analysis.yourConsumption} kWh/m²</span>
                    </div>
                    <div className="h-8 bg-boundary rounded-lg overflow-hidden">
                        <div
                            className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                            style={{
                                width: `${yourBarWidth}%`,
                                backgroundColor: getDPEColor(currentDPE),
                            }}
                        >
                            <span className="text-xs font-bold text-black drop-shadow-sm">
                                {currentDPE}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Moyenne régionale */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-secondary">
                            Moyenne {REGIONAL_BENCHMARK.city} ({REGIONAL_BENCHMARK.averageDPE})
                        </span>
                        <span className="text-sm font-bold text-main">{analysis.avgConsumption} kWh/m²</span>
                    </div>
                    <div className="h-8 bg-boundary rounded-lg overflow-hidden">
                        <div
                            className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                            style={{
                                width: `${avgBarWidth}%`,
                                backgroundColor: getDPEColor(REGIONAL_BENCHMARK.averageDPE),
                            }}
                        >
                            <span className="text-xs font-bold text-black drop-shadow-sm">
                                {REGIONAL_BENCHMARK.averageDPE}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Message clé */}
            {analysis.isAboveAverage ? (
                <div className="p-4 bg-danger-900/20 rounded-xl border border-danger-500/30">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <p className="text-lg font-bold text-danger-400 mb-1">
                                Vous sur-consommez de {analysis.excessPercent}%
                            </p>
                            <p className="text-sm text-danger-300">
                                par rapport à vos voisins angevins.
                                {analysis.scoreDiff >= 2 && " C'est " + analysis.scoreDiff + " classes DPE d'écart !"}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-success-900/20 rounded-xl border border-success-500/30">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">✅</span>
                        <div>
                            <p className="text-lg font-bold text-success-400 mb-1">
                                Vous êtes {analysis.excessPercent}% sous la moyenne
                            </p>
                            <p className="text-sm text-success-300">
                                Votre copropriété est plus performante que la moyenne régionale.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Source */}
            <p className="text-xs text-muted/50 mt-4 text-right">
                Source : {REGIONAL_BENCHMARK.source}
            </p>
        </div>
    );
}
