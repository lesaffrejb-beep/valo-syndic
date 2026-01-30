"use client";

import { useEffect, useState } from "react";
import { getClimateProjection, type ClimateProjection } from "@/actions/getClimateData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ClimateRiskCardProps {
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

/**
 * CLIMATE TIME BOMB - Projection 2050 (RCP 8.5)
 * Sensibilisation aux risques de confort thermique futur
 * Stratégie : montrer que sans isolation, le dernier étage devient inhabitable
 */
export const ClimateRiskCard = ({ coordinates }: ClimateRiskCardProps) => {
    const [projection, setProjection] = useState<ClimateProjection | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!coordinates) {
            setProjection(null);
            return;
        }

        setLoading(true);
        getClimateProjection(coordinates.latitude, coordinates.longitude)
            .then(setProjection)
            .finally(() => setLoading(false));
    }, [coordinates]);

    // Pas de coordonnées = pas d'affichage
    if (!coordinates) {
        return null;
    }

    // Loading state
    if (loading) {
        return (
            <div className="card-bento animate-pulse">
                <div className="h-6 bg-surface-hover rounded w-1/2 mb-4" />
                <div className="h-32 bg-surface-hover rounded mb-4" />
                <div className="h-4 bg-surface-hover rounded w-3/4" />
            </div>
        );
    }

    // Pas de données
    if (!projection) {
        return (
            <div className="card-bento">
                <div className="flex items-center gap-2 text-muted text-sm">
                    <span>🌡️</span>
                    <span>Données climatiques indisponibles</span>
                </div>
            </div>
        );
    }

    // Préparer les données pour le "Hockey Stick Chart"
    const chartData = generateHockeyStickData(
        projection.current.avgSummerTemp,
        projection.future2050.avgSummerTemp
    );

    return (
        <div className="card-bento h-full">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-main mb-1 flex items-center gap-2">
                        <span>🌡️</span> Climate Time Bomb
                    </h3>
                    <p className="text-sm text-muted">
                        Projection 2050 (Scénario RCP 8.5)
                    </p>
                </div>
            </div>

            {/* Indicateur Choc - Hero Metric */}
            <div className="text-center mb-8">
                <div className="text-6xl font-bold text-danger mb-2">
                    {projection.future2050.uninhabitableDays}
                </div>
                <div className="text-sm text-muted">
                    jours inhabitables par an en 2050
                </div>
                <div className="text-xs text-subtle mt-1">
                    (Températures extrêmes {'>'}35°C)
                </div>
            </div>

            {/* Hockey Stick Chart */}
            <div className="mb-6">
                <div className="text-xs text-muted mb-3 text-center">
                    Évolution de la température maximale estivale
                </div>
                <ResponsiveContainer width="100%" height={200} minWidth={0}>
                    <LineChart data={chartData}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.05)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="year"
                            stroke="#9CA3AF"
                            style={{ fontSize: '12px' }}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="#9CA3AF"
                            style={{ fontSize: '12px' }}
                            tickLine={false}
                            domain={['auto', 'auto']}
                            unit="°C"
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#161719',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                padding: '8px 12px',
                            }}
                            labelStyle={{ color: '#9CA3AF', fontSize: '12px' }}
                            itemStyle={{ color: '#FFFFFF', fontSize: '13px' }}
                        />

                        {/* Ligne Bleue - Climat Passé (Stable) */}
                        <Line
                            type="monotone"
                            dataKey="stable"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            dot={{ fill: '#3B82F6', r: 4 }}
                            name="Climat actuel"
                        />

                        {/* Ligne Rouge - Projection RCP 8.5 (Croissance) */}
                        <Line
                            type="monotone"
                            dataKey="projection"
                            stroke="#EF4444"
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            dot={{ fill: '#EF4444', r: 5 }}
                            name="Scénario RCP 8.5"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Stats Comparatives */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <StatBox
                    label="Aujourd'hui"
                    value={`${projection.current.heatDays} j`}
                    sublabel="Jours >30°C"
                    variant="neutral"
                />
                <StatBox
                    label="2050"
                    value={`${projection.future2050.heatDays} j`}
                    sublabel="Jours >30°C"
                    variant="danger"
                />
            </div>

            {/* Climate Verdict */}
            <div className="p-4 bg-warning/5 border border-warning/20 rounded-xl mb-4">
                <p className="text-sm text-muted leading-relaxed">
                    ⚠️ <strong className="text-main">Sans isolation renforcée</strong>, votre toiture
                    ne sera pas conçue pour ce climat. Risque de perte de valeur
                    locative majeure au dernier étage.
                </p>
            </div>

            {/* Référence Ville */}
            <div className="text-xs text-subtle text-center">
                En 2050 : {projection.similarCity}
            </div>

            {/* Source */}
            <div className="text-xs text-subtle/60 text-center mt-2">
                Source : {projection.dataSource}
            </div>
        </div>
    );
};

/**
 * Generate "Hockey Stick" chart data
 * Slight growth until 2030, then exponential
 */
function generateHockeyStickData(currentTemp: number, futureTemp: number) {
    const years = [2020, 2025, 2030, 2040, 2050];
    const delta = futureTemp - currentTemp;

    return years.map((year) => {
        const progress = (year - 2020) / 30; // 30 years span

        // Stable climate (flat line)
        const stable = currentTemp;

        // RCP 8.5 projection (exponential curve)
        // Slow growth until 2030, then accelerates
        let projection: number | null;

        if (year <= 2025) {
            projection = currentTemp + (delta * 0.1 * progress);
        } else if (year <= 2030) {
            projection = currentTemp + (delta * 0.2);
        } else if (year <= 2040) {
            projection = currentTemp + (delta * 0.5);
        } else {
            projection = futureTemp;
        }

        return {
            year: year.toString(),
            stable: Math.round(stable * 10) / 10,
            projection: Math.round(projection * 10) / 10,
        };
    });
}

/**
 * StatBox Component - Compact stats display
 */
const StatBox = ({
    label,
    value,
    sublabel,
    variant
}: {
    label: string;
    value: string;
    sublabel: string;
    variant: 'neutral' | 'danger';
}) => {
    return (
        <div className={`p-3 rounded-xl border transition-colors ${variant === 'danger'
            ? 'bg-danger/5 border-danger/20'
            : 'bg-surface-hover/50 border-boundary'
            }`}>
            <div className="text-xs text-muted mb-1">{label}</div>
            <div className={`text-2xl font-bold mb-0.5 ${variant === 'danger' ? 'text-danger' : 'text-main'
                }`}>
                {value}
            </div>
            <div className="text-xs text-subtle">{sublabel}</div>
        </div>
    );
};
