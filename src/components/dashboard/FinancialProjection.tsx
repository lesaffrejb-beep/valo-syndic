/**
 * FinancialProjection — Projection Financière Mensuelle
 * =======================================================
 * "L'Effort Réel" - Affiche le reste à charge mensuel par lot sur 15 ans
 *
 * Calcul :
 * 1. Coût Travaux Total (HT)
 * 2. - Aides (MaPrimeRénov, Éco-PTZ, etc.)
 * 3. = Reste à Charge Global
 * 4. ÷ Nombre de lots
 * 5. ÷ 180 mois (15 ans)
 * 6. = Effort d'épargne mensuel par lot
 */

"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface FinancialProjectionProps {
    totalCost: number; // Coût total travaux (€ HT)
    totalAids: number; // Total des aides (€)
    numberOfUnits: number; // Nombre de lots
    className?: string;
    showDetails?: boolean;
}

const LOAN_DURATION_YEARS = 15;
const LOAN_DURATION_MONTHS = LOAN_DURATION_YEARS * 12; // 180 mois

export function FinancialProjection({
    totalCost,
    totalAids,
    numberOfUnits,
    className = "",
    showDetails = true,
}: FinancialProjectionProps) {
    const calculations = useMemo(() => {
        // 1. Reste à charge global
        const globalRemaining = Math.max(0, totalCost - totalAids);

        // 2. Reste à charge par lot
        const perUnit = numberOfUnits > 0 ? globalRemaining / numberOfUnits : 0;

        // 3. Effort mensuel par lot sur 15 ans
        const monthlyPerUnit = perUnit / LOAN_DURATION_MONTHS;

        // 4. Taux d'aide
        const aidRate = totalCost > 0 ? (totalAids / totalCost) * 100 : 0;

        return {
            globalRemaining,
            perUnit,
            monthlyPerUnit,
            aidRate,
        };
    }, [totalCost, totalAids, numberOfUnits]);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
        }).format(amount);

    const formatCurrencyDetailed = (amount: number) =>
        new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`card-bento p-4 ${className}`}
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600/40 to-emerald-700/40 rounded-xl flex items-center justify-center border border-emerald-500/20">
                    <span className="text-emerald-400 text-lg">💰</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-main">Projection Financière</h3>
                    <p className="text-xs text-muted">L&apos;Effort Réel par Lot</p>
                </div>
            </div>

            {/* Effort Mensuel - Mise en avant */}
            <div className="p-4 bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 rounded-2xl border border-emerald-500/30 mb-4">
                <div className="text-center">
                    <p className="text-sm text-emerald-400 font-medium mb-2">
                        Effort d&apos;épargne mensuel par lot
                    </p>
                    <div className="flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-black text-emerald-400">
                            {formatCurrency(calculations.monthlyPerUnit)}
                        </span>
                        <span className="text-sm text-muted">/mois</span>
                    </div>
                    <p className="text-xs text-emerald-300/70 mt-2">
                        Sur {LOAN_DURATION_YEARS} ans ({LOAN_DURATION_MONTHS} mois)
                    </p>
                </div>
            </div>

            {/* Détails Financiers */}
            {showDetails && (
                <div className="space-y-3">
                    {/* Répartition */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-surface rounded-xl border border-boundary">
                            <p className="text-xs text-muted mb-1">💼 Coût Total</p>
                            <p className="text-lg font-bold text-main">
                                {formatCurrency(totalCost)}
                            </p>
                        </div>
                        <div className="p-3 bg-success-900/20 rounded-xl border border-success-500/30">
                            <p className="text-xs text-success-400 mb-1">🎁 Aides</p>
                            <p className="text-lg font-bold text-success-400">
                                -{formatCurrency(totalAids)}
                            </p>
                        </div>
                    </div>

                    {/* Reste à charge */}
                    <div className="p-3 bg-surface-hover rounded-xl border border-boundary">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-xs text-muted">Reste à Charge Global</p>
                            <p className="text-sm font-bold text-main">
                                {formatCurrency(calculations.globalRemaining)}
                            </p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-muted">Par lot ({numberOfUnits} lots)</p>
                            <p className="text-sm font-bold text-main">
                                {formatCurrency(calculations.perUnit)}
                            </p>
                        </div>
                    </div>

                    {/* Taux d'aide */}
                    <div className="flex items-center justify-between p-3 bg-info-900/20 rounded-xl border border-info-500/30">
                        <span className="text-xs text-info-400">📊 Taux de subvention</span>
                        <span className="text-sm font-bold text-info-400">
                            {calculations.aidRate.toFixed(1)}%
                        </span>
                    </div>

                    {/* Argument commercial */}
                    <div className="p-3 bg-surface-hover rounded-xl border border-boundary">
                        <p className="text-xs text-muted leading-relaxed">
                            💡 <strong>Comparaison :</strong> {formatCurrencyDetailed(calculations.monthlyPerUnit)}/mois,
                            c&apos;est moins qu&apos;un abonnement streaming pour transformer votre patrimoine
                            et éviter les interdictions de location.
                        </p>
                    </div>

                    {/* Info Éco-PTZ */}
                    <div className="p-3 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-xl border border-purple-500/30">
                        <div className="flex items-start gap-2">
                            <span className="text-lg">🏦</span>
                            <div className="text-xs text-purple-300">
                                <p className="font-bold mb-1">Éco-PTZ Copropriété</p>
                                <p>
                                    Prêt 0% sur {LOAN_DURATION_YEARS} ans disponible. Plafond 50 000€ par lot.
                                    Demandez à votre syndic d&apos;activer ce dispositif.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

/**
 * Variante compacte pour affichage inline
 */
export function FinancialProjectionCompact({
    totalCost,
    totalAids,
    numberOfUnits,
    className = "",
}: {
    totalCost: number;
    totalAids: number;
    numberOfUnits: number;
    className?: string;
}) {
    const globalRemaining = Math.max(0, totalCost - totalAids);
    const perUnit = numberOfUnits > 0 ? globalRemaining / numberOfUnits : 0;
    const monthlyPerUnit = perUnit / LOAN_DURATION_MONTHS;

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
        }).format(amount);

    return (
        <div className={`inline-flex items-center gap-2 ${className}`}>
            <span className="text-emerald-400">💰</span>
            <span className="text-sm font-bold text-main">
                {formatCurrency(monthlyPerUnit)}/mois
            </span>
            <span className="text-xs text-muted">par lot</span>
        </div>
    );
}
