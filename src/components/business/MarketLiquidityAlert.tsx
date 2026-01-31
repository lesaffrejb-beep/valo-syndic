/**
 * MarketLiquidityAlert — Alerte Liquidité Marché
 * ===============================================
 * Affiche une alerte sur la part des passoires thermiques sur le marché.
 * Argument de vente basé sur la concurrence et la liquidité.
 *
 * AUDIT 31/01/2026: Composant créé pour utiliser les données Notaires
 * Source: "15% des ventes sont des F/G" (DP Immobilier 08.12.2025)
 */

"use client";

import { motion } from "framer-motion";
import { getPassoiresShare, getMarketTrend, getDataLastUpdate } from "@/lib/market-data";
import type { DPELetter } from "@/lib/constants";

interface MarketLiquidityAlertProps {
    /** DPE actuel du bien */
    currentDPE: DPELetter;
    /** Variante d'affichage */
    variant?: "card" | "inline" | "compact";
    /** Afficher les sources */
    showSources?: boolean;
}

export function MarketLiquidityAlert({
    currentDPE,
    variant = "card",
    showSources = true,
}: MarketLiquidityAlertProps) {
    const passoiresShare = getPassoiresShare();
    const marketTrend = getMarketTrend("national");
    const lastUpdate = getDataLastUpdate();

    // Déterminer si le bien est une passoire
    const isPassoire = currentDPE === "F" || currentDPE === "G";
    const isAtRisk = currentDPE === "E";

    // Calculer le pourcentage affiché
    const passoiresPercent = Math.round(passoiresShare * 100);

    // Message principal selon le DPE
    const getMessage = () => {
        if (isPassoire) {
            return {
                title: "Votre bien est en concurrence directe",
                message: `${passoiresPercent}% des biens en vente sont des passoires thermiques (F/G). Sans rénovation, vous êtes en compétition avec ces biens décotés.`,
                urgency: "high" as const,
                icon: "⚠️",
            };
        }
        if (isAtRisk) {
            return {
                title: "Anticipez l'évolution réglementaire",
                message: `Les logements E seront interdits à la location en 2034. Rénover maintenant vous donne un avantage concurrentiel.`,
                urgency: "medium" as const,
                icon: "📊",
            };
        }
        return {
            title: "Votre bien est bien positionné",
            message: `Avec un DPE ${currentDPE}, votre bien se distingue des ${passoiresPercent}% de passoires sur le marché.`,
            urgency: "low" as const,
            icon: "✅",
        };
    };

    const info = getMessage();

    // Styles selon urgency
    const urgencyStyles = {
        high: {
            bg: "bg-danger-900/20",
            border: "border-danger-500/40",
            title: "text-danger-300",
            icon: "text-danger-400",
        },
        medium: {
            bg: "bg-warning-900/20",
            border: "border-warning-500/40",
            title: "text-warning-300",
            icon: "text-warning-400",
        },
        low: {
            bg: "bg-success-900/20",
            border: "border-success-500/40",
            title: "text-success-300",
            icon: "text-success-400",
        },
    };

    const style = urgencyStyles[info.urgency];

    // Variante Card
    if (variant === "card") {
        return (
            <motion.div
                className={`card-bento ${style.bg} border ${style.border}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                    <span className={`text-2xl ${style.icon}`}>{info.icon}</span>
                    <div>
                        <h4 className={`font-semibold ${style.title}`}>
                            {info.title}
                        </h4>
                        <p className="text-sm text-muted mt-1">
                            {info.message}
                        </p>
                    </div>
                </div>

                {/* Stats */}
                {isPassoire && (
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-boundary/30">
                        <StatBox
                            label="Passoires sur le marché"
                            value={`${passoiresPercent}%`}
                            trend="stable"
                        />
                        <StatBox
                            label="Tendance prix"
                            value={`${(marketTrend.threeMonths * 100).toFixed(1)}%`}
                            trend={marketTrend.threeMonths < 0 ? "down" : marketTrend.threeMonths > 0 ? "up" : "stable"}
                            period="3 mois"
                        />
                    </div>
                )}

                {/* Sources */}
                {showSources && (
                    <div className="mt-4 pt-3 border-t border-boundary/20">
                        <p className="text-[10px] text-muted">
                            Sources: Notaires de France (12/2025) • Données: {lastUpdate}
                        </p>
                    </div>
                )}
            </motion.div>
        );
    }

    // Variante Inline
    if (variant === "inline") {
        return (
            <motion.div
                className={`flex items-center gap-3 p-3 rounded-lg ${style.bg} border ${style.border}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <span className={`text-xl ${style.icon}`}>{info.icon}</span>
                <div className="flex-1">
                    <span className={`text-sm font-medium ${style.title}`}>
                        {info.title}
                    </span>
                    <span className="text-xs text-muted ml-2">
                        — {passoiresPercent}% de passoires sur le marché
                    </span>
                </div>
            </motion.div>
        );
    }

    // Variante Compact
    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${style.bg} border ${style.border}`}>
            <span className="text-sm">{info.icon}</span>
            <span className={`text-xs font-medium ${style.title}`}>
                {passoiresPercent}% passoires F/G
            </span>
        </div>
    );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface StatBoxProps {
    label: string;
    value: string;
    trend: "up" | "down" | "stable";
    period?: string;
}

function StatBox({ label, value, trend, period }: StatBoxProps) {
    const trendIcon = {
        up: "↗️",
        down: "↘️",
        stable: "→",
    };

    const trendColor = {
        up: "text-danger-400", // Prix qui montent = mauvais pour acheteurs
        down: "text-success-400", // Prix qui baissent = opportunité
        stable: "text-muted",
    };

    return (
        <div className="text-center">
            <p className="text-xs text-muted uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-lg font-bold ${trendColor[trend]}`}>
                {value} {trendIcon[trend]}
            </p>
            {period && <p className="text-[10px] text-muted">sur {period}</p>}
        </div>
    );
}

/**
 * Composant simplifié pour afficher juste le pourcentage de passoires
 * Utile dans les headers ou sidebars
 */
export function PassoiresIndicator() {
    const passoiresShare = getPassoiresShare();
    const percent = Math.round(passoiresShare * 100);

    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="text-warning-400">📊</span>
            <span className="text-muted">
                <span className="font-bold text-main">{percent}%</span> des ventes = passoires F/G
            </span>
        </div>
    );
}
