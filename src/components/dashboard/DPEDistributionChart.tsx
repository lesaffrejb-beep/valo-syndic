/**
 * DPEDistributionChart — Distribution DPE du Quartier
 * ====================================================
 * "Social Proof" - Affiche la position de l'immeuble par rapport aux autres
 * du quartier/ville avec données réelles depuis analytics_dpe_distribution
 *
 * Calcul dynamique : "X% des immeubles de votre quartier sont mieux classés que vous"
 */

"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { type DPELetter, DPE_ORDER } from "@/lib/constants";

interface DPEDistribution {
    code_postal: string;
    ville: string;
    etiquette_dpe: DPELetter;
    nombre_dpe: number;
    conso_moyenne: number;
    conso_mediane: number;
}

interface DPEDistributionChartProps {
    currentDPE: DPELetter;
    postalCode: string;
    city?: string;
    className?: string;
}

// Couleurs DPE
const DPE_COLORS: Record<DPELetter, string> = {
    A: "#16a34a",
    B: "#22c55e",
    C: "#84cc16",
    D: "#eab308",
    E: "#f59e0b",
    F: "#ea580c",
    G: "#dc2626",
};

export function DPEDistributionChart({
    currentDPE,
    postalCode,
    city = "",
    className = "",
}: DPEDistributionChartProps) {
    const [distribution, setDistribution] = useState<DPEDistribution[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Charger la distribution depuis Supabase
    useEffect(() => {
        async function fetchDistribution() {
            try {
                setIsLoading(true);
                setError(null);

                // Requête sur la vue analytics_dpe_distribution
                const { data, error: queryError } = await supabase
                    .from("analytics_dpe_distribution")
                    .select("*")
                    .eq("code_postal", postalCode)
                    .order("etiquette_dpe", { ascending: true });

                if (queryError) {
                    throw queryError;
                }

                setDistribution(data || []);
            } catch (err) {
                console.error("Error fetching DPE distribution:", err);
                setError("Impossible de charger les statistiques du quartier");
            } finally {
                setIsLoading(false);
            }
        }

        if (postalCode) {
            fetchDistribution();
        }
    }, [postalCode]);

    // Calculs statistiques
    const stats = useMemo(() => {
        if (distribution.length === 0) {
            return null;
        }

        // Total de DPE dans le quartier
        const totalDPE = distribution.reduce((sum, d) => sum + d.nombre_dpe, 0);

        // Position de l'utilisateur (index dans DPE_ORDER)
        const currentIndex = DPE_ORDER.indexOf(currentDPE);

        // Compter les DPE mieux classés (index supérieur)
        let betterCount = 0;
        distribution.forEach((d) => {
            const dpeIndex = DPE_ORDER.indexOf(d.etiquette_dpe);
            if (dpeIndex > currentIndex) {
                betterCount += d.nombre_dpe;
            }
        });

        // Pourcentage de DPE mieux classés
        const betterPercent = totalDPE > 0 ? (betterCount / totalDPE) * 100 : 0;

        // Consommation moyenne du quartier
        const avgConso =
            distribution.reduce((sum, d) => sum + d.conso_moyenne * d.nombre_dpe, 0) /
            totalDPE;

        // DPE le plus fréquent (mode)
        const mostCommon = distribution.reduce((prev, current) =>
            current.nombre_dpe > prev.nombre_dpe ? current : prev
        );

        return {
            totalDPE,
            betterPercent: Math.round(betterPercent),
            avgConso: Math.round(avgConso),
            mostCommon: mostCommon.etiquette_dpe,
            distribution: distribution.map((d) => ({
                dpe: d.etiquette_dpe,
                count: d.nombre_dpe,
                percent: Math.round((d.nombre_dpe / totalDPE) * 100),
            })),
        };
    }, [distribution, currentDPE]);

    if (isLoading) {
        return (
            <div className={`card-bento p-6 ${className}`}>
                <div className="flex items-center justify-center h-40">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className={`card-bento p-6 ${className}`}>
                <div className="text-center text-muted py-8">
                    <p className="text-sm">{error || "Pas de données disponibles pour ce code postal"}</p>
                </div>
            </div>
        );
    }

    const isBelowAverage = stats.betterPercent > 50;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`card-bento p-6 ${className}`}
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-600/40 to-orange-700/40 rounded-xl flex items-center justify-center border border-orange-500/20">
                    <span className="text-orange-400 text-lg">📊</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-main">Benchmark Quartier</h3>
                    <p className="text-sm text-muted">
                        {city || postalCode} • {stats.totalDPE} immeubles analysés
                    </p>
                </div>
            </div>

            {/* Distribution visuelle */}
            <div className="mb-6">
                <div className="flex items-center gap-1 h-8 rounded-lg overflow-hidden border border-boundary">
                    {stats.distribution.map((item) => (
                        <div
                            key={item.dpe}
                            className={`h-full flex items-center justify-center transition-all hover:opacity-80 ${item.dpe === currentDPE ? "ring-2 ring-white" : ""
                                }`}
                            style={{
                                width: `${item.percent}%`,
                                backgroundColor: DPE_COLORS[item.dpe],
                            }}
                            title={`${item.dpe}: ${item.percent}%`}
                        >
                            {item.percent >= 10 && (
                                <span className="text-xs font-bold text-white drop-shadow-sm">
                                    {item.dpe}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Légende */}
                <div className="flex flex-wrap gap-2 mt-3">
                    {stats.distribution.map((item) => (
                        <div key={item.dpe} className="flex items-center gap-1.5">
                            <div
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: DPE_COLORS[item.dpe] }}
                            />
                            <span className="text-xs text-muted">
                                {item.dpe} ({item.percent}%)
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Message Social Proof */}
            {isBelowAverage ? (
                <div className="p-4 bg-danger-900/20 rounded-xl border border-danger-500/30">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">📉</span>
                        <div>
                            <p className="text-lg font-bold text-danger-400 mb-1">
                                {stats.betterPercent}% des immeubles sont mieux classés
                            </p>
                            <p className="text-sm text-danger-300">
                                Votre copropriété ({currentDPE}) se situe dans le bas du classement du quartier.
                                Le DPE le plus fréquent est <strong>{stats.mostCommon}</strong>.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-success-900/20 rounded-xl border border-success-500/30">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">📈</span>
                        <div>
                            <p className="text-lg font-bold text-success-400 mb-1">
                                Meilleur que {100 - stats.betterPercent}% du quartier
                            </p>
                            <p className="text-sm text-success-300">
                                Votre copropriété ({currentDPE}) est dans la moyenne haute du secteur.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats additionnelles */}
            <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-3 bg-surface rounded-xl border border-boundary">
                    <p className="text-xs text-muted mb-1">📊 DPE le plus fréquent</p>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs text-white"
                            style={{ backgroundColor: DPE_COLORS[stats.mostCommon] }}
                        >
                            {stats.mostCommon}
                        </div>
                        <p className="text-sm font-bold text-main">Classe {stats.mostCommon}</p>
                    </div>
                </div>
                <div className="p-3 bg-surface rounded-xl border border-boundary">
                    <p className="text-xs text-muted mb-1">⚡ Conso. moyenne quartier</p>
                    <p className="text-sm font-bold text-main">
                        {stats.avgConso} <span className="text-xs text-muted">kWh/m²</span>
                    </p>
                </div>
            </div>

            {/* Source */}
            <p className="text-xs text-muted/50 mt-4 text-right">
                Source : Base DPE ADEME • Données temps réel
            </p>
        </motion.div>
    );
}
