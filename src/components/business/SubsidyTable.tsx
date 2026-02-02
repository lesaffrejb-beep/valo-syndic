/**
 * SubsidyTable — Tableau Comparatif MaPrimeRénov' Copro 2026
 * ===========================================================
 * Affichage premium des aides pour les 4 profils de revenus.
 * Design: Obsidian/Stealth Wealth (Noir, Gris, Or)
 *
 * AUDIT 31/01/2026: Clarification ajoutée
 * - Le taux collectif (30-55%) s'applique à TOUS les lots
 * - Les primes individuelles (0€ à 3000€) varient selon le profil
 * - Cette distinction doit être claire pour éviter la confusion
 */

"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
    calculateSubsidies,
    type SimulationInputs,
    type SubsidyBreakdown,
    type IncomeProfile,
} from "@/lib/subsidy-calculator";
import { formatCurrency } from "@/lib/calculator";
import { DEFAULT_TRANSITION } from "@/lib/animations";

// =============================================================================
// CONFIGURATION DES PROFILS
// =============================================================================

const PROFILE_CONFIG: Record<
    IncomeProfile,
    {
        label: string;
        color: string;
        bgColor: string;
        borderColor: string;
        emoji: string;
        hint: string;
    }
> = {
    Blue: {
        label: "Très Modeste",
        color: "#60A5FA", // Blue-400
        bgColor: "rgba(96, 165, 250, 0.1)",
        borderColor: "rgba(96, 165, 250, 0.3)",
        emoji: "🔵",
        hint: "≤ 17 363 € (1 pers.)",
    },
    Yellow: {
        label: "Modeste",
        color: "#FBBF24", // Yellow-400
        bgColor: "rgba(251, 191, 36, 0.1)",
        borderColor: "rgba(251, 191, 36, 0.3)",
        emoji: "🟡",
        hint: "≤ 22 461 € (1 pers.)",
    },
    Purple: {
        label: "Intermédiaire",
        color: "#A78BFA", // Purple-400
        bgColor: "rgba(167, 139, 250, 0.1)",
        borderColor: "rgba(167, 139, 250, 0.3)",
        emoji: "🟣",
        hint: "≤ 30 549 € (1 pers.)",
    },
    Pink: {
        label: "Aisé",
        color: "#F472B6", // Pink-400
        bgColor: "rgba(244, 114, 182, 0.1)",
        borderColor: "rgba(244, 114, 182, 0.3)",
        emoji: "🌸",
        hint: "Au-dessus des plafonds",
    },
};

// =============================================================================
// COMPOSANTS INTERNES
// =============================================================================

interface ProfileBadgeProps {
    profile: IncomeProfile;
    showHint?: boolean;
}

function ProfileBadge({ profile, showHint = false }: ProfileBadgeProps) {
    const config = PROFILE_CONFIG[profile];

    return (
        <div className="flex flex-col gap-1">
            <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border"
                style={{
                    backgroundColor: config.bgColor,
                    borderColor: config.borderColor,
                    color: config.color,
                }}
            >
                <span className="text-sm">{config.emoji}</span>
                <span className="font-semibold text-sm">{config.label}</span>
            </div>
            {showHint && (
                <span className="text-xs text-muted mt-1">{config.hint}</span>
            )}
        </div>
    );
}

// =============================================================================
// COMPOSANT PRINCIPAL
// =============================================================================

interface SubsidyTableProps {
    /** Paramètres de simulation */
    inputs: SimulationInputs;

    /** Affichage compact (optionnel) */
    compact?: boolean;
}

export function SubsidyTable({ inputs, compact = false }: SubsidyTableProps) {
    const [showLegend, setShowLegend] = useState(false);

    // Calcul des aides pour tous les profils
    const result = calculateSubsidies(inputs);
    const { profiles } = result;

    const profileOrder: IncomeProfile[] = ["Blue", "Yellow", "Purple", "Pink"];

    return (
        <motion.div
            className="group relative overflow-hidden p-8 md:p-12 h-full flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={DEFAULT_TRANSITION}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-semibold text-main flex items-center gap-3">
                        <span className="text-2xl">🎯</span>
                        Tableau Décisionnel MPR Copro 2026
                    </h3>
                    <p className="text-sm text-muted mt-1">
                        Comparaison par profil de revenus (Hors Île-de-France)
                    </p>
                </div>

                {/* Bouton légende */}
                <button
                    onClick={() => setShowLegend(!showLegend)}
                    className="btn-ghost text-xs"
                >
                    {showLegend ? "Masquer" : "Voir"} les seuils
                </button>
            </div>

            {/* Légende (conditionnelle) */}
            {showLegend && (
                <motion.div
                    className="mb-6 p-4 bg-surface-highlight rounded-xl border border-boundary"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                        Barème Revenus 2026 (Hors IdF)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {profileOrder.map((profile) => {
                            const config = PROFILE_CONFIG[profile];
                            return (
                                <div
                                    key={profile}
                                    className="flex items-center gap-2 text-xs"
                                >
                                    <span>{config.emoji}</span>
                                    <div>
                                        <p className="font-medium text-main">
                                            {config.label}
                                        </p>
                                        <p className="text-muted">{config.hint}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Table Desktop */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-boundary">
                            <th className="text-left py-4 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                                Profil
                            </th>
                            <th className="text-right py-4 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                                Coût Réel
                            </th>
                            <th className="text-right py-4 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                                Total Aides Publiques
                            </th>
                            <th className="text-right py-4 px-4 text-xs font-semibold text-success uppercase tracking-wider">
                                Boost Privé/Local
                            </th>
                            <th className="text-right py-4 px-4 text-xs font-semibold text-primary uppercase tracking-wider">
                                Reste à Charge
                            </th>
                            <th className="text-right py-4 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                                Mensualité
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {profileOrder.map((profile, index) => {
                            const data = profiles[profile];
                            return (
                                <motion.tr
                                    key={profile}
                                    className="border-b border-boundary/50 hover:bg-surface-hover transition-colors group"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <td className="py-4 px-4">
                                        <ProfileBadge profile={profile} />
                                    </td>
                                    <td className="py-4 px-4 text-right text-main font-medium tabular-nums">
                                        {formatCurrency(data.workShareBeforeAid)}
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-main font-semibold tabular-nums">
                                                -{formatCurrency(data.totalPublicSubsidies)}
                                            </span>
                                            <span className="text-xs text-muted">
                                                MPR {Math.round(data.mprRate * 100)}% + AMO + Prime
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        {data.privateLocalBoost > 0 ? (
                                            <div className="flex flex-col items-end">
                                                <span className="text-success font-bold tabular-nums">
                                                    -{formatCurrency(data.privateLocalBoost)}
                                                </span>
                                                <span className="text-xs text-success-400/70">
                                                    CEE + Locales
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-subtle text-sm">—</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <span className="text-2xl font-bold text-primary tabular-nums">
                                            {formatCurrency(data.remainingCost)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-main font-medium tabular-nums">
                                                {formatCurrency(data.monthlyPayment)}
                                            </span>
                                            <span className="text-xs text-muted">
                                                / mois
                                            </span>
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Cards Mobile/Tablet */}
            <div className="lg:hidden space-y-4">
                {profileOrder.map((profile, index) => {
                    const data = profiles[profile];
                    const config = PROFILE_CONFIG[profile];

                    return (
                        <motion.div
                            key={profile}
                            className="p-4 rounded-xl border"
                            style={{
                                backgroundColor: config.bgColor,
                                borderColor: config.borderColor,
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            {/* Header Card */}
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-boundary/30">
                                <ProfileBadge profile={profile} showHint />
                                <div className="text-right">
                                    <p className="text-xs text-muted">
                                        Reste à charge
                                    </p>
                                    <p
                                        className="text-2xl font-bold tabular-nums"
                                        style={{ color: config.color }}
                                    >
                                        {formatCurrency(data.remainingCost)}
                                    </p>
                                </div>
                            </div>

                            {/* Détails */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm text-muted">
                                        Coût Réel
                                    </span>
                                    <span className="text-main font-medium tabular-nums">
                                        {formatCurrency(data.workShareBeforeAid)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm text-muted">
                                        Total Aides Publiques
                                    </span>
                                    <div className="text-right">
                                        <p className="text-main font-semibold tabular-nums">
                                            -{formatCurrency(data.totalPublicSubsidies)}
                                        </p>
                                        <p className="text-xs text-muted">
                                            MPR {Math.round(data.mprRate * 100)}% + AMO + Prime
                                        </p>
                                    </div>
                                </div>

                                {data.privateLocalBoost > 0 && (
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-sm text-muted">
                                            Boost Privé/Local
                                        </span>
                                        <div className="text-right">
                                            <p className="text-success font-bold tabular-nums">
                                                -{formatCurrency(data.privateLocalBoost)}
                                            </p>
                                            <p className="text-xs text-success-400/70">
                                                CEE + Locales
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-baseline pt-3 border-t border-boundary/30">
                                    <span className="text-sm text-muted">
                                        Effort Mensuel
                                    </span>
                                    <div className="text-right">
                                        <p className="text-main font-medium tabular-nums">
                                            {formatCurrency(data.monthlyPayment)}
                                        </p>
                                        <p className="text-xs text-muted">
                                            / mois (20 ans)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Footer Notes */}
            <div className="mt-6 pt-4 border-t border-boundary/30 space-y-3">
                {/* Clarification Socle vs Prime - AUDIT 31/01/2026 */}
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-xs text-muted leading-relaxed">
                        <span className="font-semibold text-primary">À savoir :</span> Le taux MPR affiché ({Math.round(result.profiles.Pink.mprRate * 100)}%) est le <strong>socle collectif</strong> versé à la copropriété.
                        Il s&apos;applique à tous les lots, quel que soit le profil du propriétaire.
                        Les <strong>primes individuelles</strong> (jusqu&apos;à 3 000€) sont versées en complément uniquement aux ménages modestes et très modestes.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 text-xs text-muted">
                    <div className="flex items-start gap-2">
                        <span>ℹ️</span>
                        <p>
                            Mensualité calculée sur un prêt <strong>Éco-PTZ à 0%</strong> sur{" "}
                            <strong>20 ans</strong>. Aucun intérêt.
                        </p>
                    </div>
                    <div className="flex items-start gap-2">
                        <span>📋</span>
                        <p>
                            Barème hors Île-de-France. Simulation indicative.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
