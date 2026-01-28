/**
 * UrgencyScore — Indicateur d'Urgence Visuel
 * ==========================================
 * Score de 0 à 100 avec jauge circulaire.
 * Design néo-banque avec code couleur dynamique.
 */

"use client";

import { useEffect, useState } from "react";
import { type ComplianceStatus } from "@/lib/schemas";
import { type DPELetter } from "@/lib/constants";
import { ParticleEmitter } from "@/components/ui/ParticleEmitter";

interface UrgencyScoreProps {
    compliance: ComplianceStatus;
    currentDPE: DPELetter;
}

// Calcul du score d'urgence (0-100)
function calculateUrgencyScore(compliance: ComplianceStatus, dpe: DPELetter): number {
    // DPE G déjà interdit = 100
    if (compliance.isProhibited) return 100;

    // DPE A-D sans interdiction = score bas
    if (!compliance.prohibitionDate) {
        const scores: Record<string, number> = { D: 20, C: 10, B: 5, A: 0 };
        return scores[dpe] || 15;
    }

    // Score basé sur le temps restant
    const days = compliance.daysUntilProhibition || 0;
    if (days <= 0) return 100;
    if (days <= 365) return 95; // < 1 an
    if (days <= 730) return 85; // < 2 ans
    if (days <= 1095) return 70; // < 3 ans
    if (days <= 1825) return 55; // < 5 ans
    return 40;
}

// Couleur selon le score
function getScoreColor(score: number): { bg: string; text: string; stroke: string } {
    if (score >= 80) return { bg: "bg-danger/10", text: "text-danger-500", stroke: "#EF4444" };
    if (score >= 60) return { bg: "bg-warning/10", text: "text-warning-500", stroke: "#F59E0B" };
    if (score >= 40) return { bg: "bg-warning/10", text: "text-warning-500", stroke: "#F59E0B" };
    return { bg: "bg-success/10", text: "text-success-500", stroke: "#10B981" };
}

// Message selon le score
function getScoreMessage(score: number): { title: string; subtitle: string } {
    if (score >= 90) return { title: "CRITIQUE", subtitle: "Action immédiate requise" };
    if (score >= 70) return { title: "URGENT", subtitle: "Délai de réaction court" };
    if (score >= 50) return { title: "ATTENTION", subtitle: "Anticipation recommandée" };
    if (score >= 30) return { title: "MODÉRÉ", subtitle: "Planification conseillée" };
    return { title: "SEREIN", subtitle: "Bien conforme" };
}

export function UrgencyScore({ compliance, currentDPE }: UrgencyScoreProps) {
    const [animatedScore, setAnimatedScore] = useState(0);
    const score = calculateUrgencyScore(compliance, currentDPE);
    const colors = getScoreColor(score);
    const message = getScoreMessage(score);

    // Animation du score
    useEffect(() => {
        const duration = 1500;
        const steps = 60;
        const increment = score / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= score) {
                setAnimatedScore(score);
                clearInterval(timer);
            } else {
                setAnimatedScore(Math.round(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [score]);

    // Calcul du cercle SVG (scaled x1.2)
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (animatedScore / 100) * circumference;

    return (
        <div className={`card-bento ${colors.bg} rounded-xl p-6 border border-boundary relative transition-colors duration-300 overflow-hidden`}>
            {/* Particle System for Critical Scores */}
            <ParticleEmitter active={score >= 80} color={colors.stroke} />

            {/* Glow based on score */}
            <div className={`absolute inset-0 bg-${colors.stroke}/5 rounded-xl`} />

            <h3 className="text-lg font-semibold text-main mb-4 flex items-center gap-2 relative z-10">
                🎯 Score d&apos;urgence
            </h3>

            <div className="flex items-center gap-8 relative z-10">
                {/* Cercle SVG - Scaled up x1.2 */}
                <div className="relative flex-shrink-0">
                    <svg width="144" height="144" className="transform -rotate-90">
                        {/* Background circle */}
                        <circle
                            cx="72"
                            cy="72"
                            r={radius}
                            fill="none"
                            stroke="#2A2A2A"
                            strokeWidth="10"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="72"
                            cy="72"
                            r={radius}
                            fill="none"
                            stroke={colors.stroke}
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            className="transition-all duration-1000 ease-out"
                            style={{ filter: `drop-shadow(0 0 6px ${colors.stroke})` }}
                        />
                    </svg>
                    {/* Score au centre */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-4xl font-black ${colors.text} tabular-nums`}>
                            {animatedScore}
                        </span>
                    </div>
                </div>

                {/* Message */}
                <div>
                    <p className={`text-xl font-bold ${colors.text}`}>{message.title}</p>
                    <p className="text-sm text-muted mt-1">{message.subtitle}</p>

                    {compliance.daysUntilProhibition && compliance.daysUntilProhibition > 0 && (
                        <div className="mt-3 p-2 bg-surface/50 rounded-lg border border-boundary">
                            <p className="text-xs text-muted">Temps restant</p>
                            <p className="font-semibold text-main tabular-nums">
                                {Math.floor(compliance.daysUntilProhibition / 30)} mois
                            </p>
                        </div>
                    )}

                    {compliance.isProhibited && (
                        <div className="mt-3 p-2 bg-danger/20 rounded-lg border border-danger/30">
                            <p className="text-xs text-danger-500 font-semibold">
                                🔴 INTERDICTION EN VIGUEUR
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
