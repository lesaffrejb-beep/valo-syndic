/**
 * DPEDistributionChart — L'Ego (Benchmark Social)
 * ================================================
 * Compare le DPE de l'utilisateur avec la distribution du quartier.
 * Stratégie: Piquer l'ego en montrant que l'utilisateur est "dernier de la classe".
 */

"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { type DPELetter } from "@/lib/constants";

interface DPEDistributionChartProps {
    currentDPE: DPELetter;
    city?: string;
    postalCode?: string;
    className?: string;
}

interface DPEDistribution {
    dpe_letter: DPELetter;
    count: number;
}

// Couleurs DPE officielles
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
    city = "Angers",
    postalCode,
    className = ""
}: DPEDistributionChartProps) {
    const [distribution, setDistribution] = useState<DPEDistribution[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch distribution data from API
    useEffect(() => {
        // Mock data pour la démo (remplacer par fetch réel vers l'API)
        // TODO: Créer l'endpoint /api/analytics/dpe-distribution
        const mockDistribution: DPEDistribution[] = [
            { dpe_letter: "A", count: 5 },
            { dpe_letter: "B", count: 12 },
            { dpe_letter: "C", count: 45 },
            { dpe_letter: "D", count: 78 },
            { dpe_letter: "E", count: 92 },
            { dpe_letter: "F", count: 124 },
            { dpe_letter: "G", count: 44 },
        ];

        // Simulate API delay
        setTimeout(() => {
            setDistribution(mockDistribution);
            setIsLoading(false);
        }, 300);

        // Real implementation would be:
        /*
        fetch(`/api/analytics/dpe-distribution?city=${city}&postalCode=${postalCode}`)
            .then(res => res.json())
            .then(data => {
                setDistribution(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch DPE distribution:', err);
                setIsLoading(false);
            });
        */
    }, [city, postalCode]);

    // Calculate social proof percentage
    const socialProof = useMemo(() => {
        if (distribution.length === 0) return null;

        const dpeOrder: DPELetter[] = ["G", "F", "E", "D", "C", "B", "A"];
        const currentIndex = dpeOrder.indexOf(currentDPE);

        const totalBuildings = distribution.reduce((sum, item) => sum + item.count, 0);

        // Count buildings better than current DPE
        const betterBuildings = distribution
            .filter(item => {
                const itemIndex = dpeOrder.indexOf(item.dpe_letter);
                return itemIndex > currentIndex;
            })
            .reduce((sum, item) => sum + item.count, 0);

        const percentBetter = Math.round((betterBuildings / totalBuildings) * 100);

        return {
            percentBetter,
            totalBuildings,
            betterBuildings,
        };
    }, [distribution, currentDPE]);

    // Calculate max count for scaling
    const maxCount = Math.max(...distribution.map(d => d.count), 1);

    if (isLoading) {
        return (
            <div className={`card-bento p-8 ${className}`}>
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-white/5 rounded w-3/4"></div>
                    <div className="h-4 bg-white/5 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    const isBadPerformer = socialProof && socialProof.percentBetter >= 50;

    return (
        <motion.div
            className={`card-bento p-6 md:p-8 ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header avec Social Proof */}
            <div className="mb-8">
                {isBadPerformer && socialProof ? (
                    <>
                        <h3 className="text-2xl md:text-3xl font-black text-danger-400 mb-3 leading-tight">
                            {socialProof.percentBetter}% des immeubles de {city}
                            <br />
                            sont mieux classés que vous.
                        </h3>
                        <p className="text-sm text-muted">
                            Sur {socialProof.totalBuildings} immeubles analysés dans votre quartier
                        </p>
                    </>
                ) : (
                    <>
                        <h3 className="text-2xl md:text-3xl font-black text-success-400 mb-3 leading-tight">
                            Vous êtes dans le top {socialProof && (100 - socialProof.percentBetter)}% de {city}
                        </h3>
                        <p className="text-sm text-muted">
                            Votre immeuble performe mieux que la moyenne
                        </p>
                    </>
                )}
            </div>

            {/* Distribution Chart */}
            <div className="space-y-4">
                {(["A", "B", "C", "D", "E", "F", "G"] as DPELetter[]).map((letter) => {
                    const data = distribution.find(d => d.dpe_letter === letter);
                    const count = data?.count || 0;
                    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    const isUserDPE = letter === currentDPE;

                    return (
                        <motion.div
                            key={letter}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * (7 - ["G", "F", "E", "D", "C", "B", "A"].indexOf(letter)) }}
                        >
                            <div className="flex items-center gap-4">
                                {/* Label */}
                                <div className="w-12 flex-shrink-0">
                                    <div
                                        className={`
                                            w-10 h-10 rounded-lg flex items-center justify-center
                                            font-black text-sm transition-all
                                            ${isUserDPE
                                                ? 'ring-2 ring-white shadow-lg scale-110'
                                                : 'opacity-60'
                                            }
                                        `}
                                        style={{
                                            backgroundColor: DPE_COLORS[letter],
                                            color: 'white'
                                        }}
                                    >
                                        {letter}
                                    </div>
                                </div>

                                {/* Bar */}
                                <div className="flex-1 relative">
                                    <div className="h-12 bg-white/5 rounded-lg overflow-hidden border border-white/10">
                                        <motion.div
                                            className={`h-full flex items-center px-3 transition-all ${
                                                isUserDPE ? 'shadow-glow' : ''
                                            }`}
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: isUserDPE
                                                    ? DPE_COLORS[letter]
                                                    : `${DPE_COLORS[letter]}40`, // 40 = 25% opacity in hex
                                            }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 0.8, delay: 0.2 }}
                                        >
                                            {count > 0 && (
                                                <span className={`text-sm font-bold ${
                                                    isUserDPE ? 'text-white' : 'text-gray-400'
                                                }`}>
                                                    {count} {count === 1 ? 'immeuble' : 'immeubles'}
                                                </span>
                                            )}
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Badge "VOUS" */}
                                {isUserDPE && (
                                    <motion.div
                                        className="flex-shrink-0"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5, type: "spring" }}
                                    >
                                        <div className="px-3 py-1 bg-danger-900/30 border border-danger-500/50 rounded-full">
                                            <span className="text-xs font-bold text-danger-300 uppercase tracking-wider">
                                                ← Vous
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Call to Action */}
            {isBadPerformer && (
                <motion.div
                    className="mt-8 p-4 bg-danger-900/20 rounded-xl border border-danger-500/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <p className="text-sm font-semibold text-danger-300 mb-1">
                                Urgence sociale : Votre copropriété tire le quartier vers le bas
                            </p>
                            <p className="text-xs text-danger-400/80">
                                Chaque jour de retard creuse l&apos;écart avec vos voisins.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Source */}
            <p className="text-xs text-muted/50 mt-6 text-right">
                Source : ADEME DPE {city} • Données 2024-2026
            </p>
        </motion.div>
    );
}
