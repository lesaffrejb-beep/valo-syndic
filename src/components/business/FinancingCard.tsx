/**
 * FinancingCard — Plan de financement détaillé
 * Le "Plan de Bataille" avec aides et mensualités.
 * ✨ Version animée avec Framer Motion
 */

"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { type FinancingPlan } from "@/lib/schemas";
import { formatPercent, formatCurrency } from "@/lib/calculator";
import { AnimatedCurrency, AnimatedPercent } from "@/components/ui/AnimatedNumber";

interface FinancingCardProps {
    financing: FinancingPlan;
    numberOfUnits: number;
}

import { DEFAULT_TRANSITION } from "@/lib/animations";

export function FinancingCard({ financing, numberOfUnits }: FinancingCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.div
            ref={ref}
            className="card-bento group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={DEFAULT_TRANSITION}
        >
            <h3 className="text-xl font-semibold text-main mb-6 flex items-center gap-3">
                <span className="text-2xl">💰</span> Plan de Financement
            </h3>

            {/* Coût Total & Breakdown */}
            <div className="mb-6 pb-6 border-b border-border">
                <div className="flex justify-between items-baseline mb-2">
                    <p className="label-technical">Travaux Seuls (HT)</p>
                    <p className="text-main font-medium"><AnimatedCurrency value={financing.worksCostHT} /></p>
                </div>

                {/* Détail frais annexes */}
                <div className="space-y-1 mb-4 pl-3 border-l-2 border-primary-500/20">
                    <div className="flex justify-between text-xs text-muted">
                        <span>+ Honoraires Syndic (3%)</span>
                        <span><AnimatedCurrency value={financing.syndicFees} /></span>
                    </div>
                    <div className="flex justify-between text-xs text-muted">
                        <span>+ Assurance DO (2%)</span>
                        <span><AnimatedCurrency value={financing.doFees} /></span>
                    </div>
                    <div className="flex justify-between text-xs text-muted">
                        <span>+ Aléas & Imprévus (3%)</span>
                        <span><AnimatedCurrency value={financing.contingencyFees} /></span>
                    </div>
                </div>

                <div className="flex justify-between items-end">
                    <div>
                        <p className="label-technical text-primary font-bold">Coût Projet Total (HT)</p>
                        <p className="text-xs text-muted mt-1">Base de calcul réelle</p>
                    </div>
                    <p className="text-value-xl text-primary tabular-nums">
                        <AnimatedCurrency value={financing.totalCostHT} duration={1.2} />
                    </p>
                </div>

                <p className="text-xs text-muted mt-2 text-right">
                    {formatCurrency(financing.costPerUnit)} / lot (Projet complet)
                </p>
            </div>

            {/* Aides */}
            <div className="space-y-4 mb-6">
                {/* MaPrimeRénov' */}
                <motion.div
                    className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.01 }}
                >
                    <div className="flex items-center gap-3">
                        <motion.span
                            className="text-2xl"
                            animate={{ rotate: [0, -10, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
                        >
                            💰
                        </motion.span>
                        <div>
                            <p className="font-medium text-primary">MaPrimeRénov&apos; Copro</p>
                            <p className="text-xs text-primary-400">
                                Taux : {formatPercent(financing.mprRate)}
                                {financing.exitPassoireBonus > 0 && " (dont +10% sortie passoire)"}
                            </p>
                        </div>
                    </div>
                    <span className="text-xl font-bold text-primary tabular-nums">
                        -<AnimatedCurrency value={financing.mprAmount} duration={1.3} />
                    </span>
                </motion.div>

                {/* Aides Locales (Si > 0) */}
                {financing.localAidAmount > 0 && (
                    <motion.div
                        className="flex items-center justify-between p-4 bg-success-500/10 rounded-lg border border-success-500/20"
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 0.45 }}
                        whileHover={{ scale: 1.01 }}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📍</span>
                            <div>
                                <p className="font-medium text-success-500">Aides Locales</p>
                                <p className="text-xs text-success-400">Subventions territoriales</p>
                            </div>
                        </div>
                        <span className="text-xl font-bold text-success-500 tabular-nums">
                            -<AnimatedCurrency value={financing.localAidAmount} duration={1.3} />
                        </span>
                    </motion.div>
                )}

                {/* Éco-PTZ */}
                <motion.div
                    className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/10"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.01 }}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🏦</span>
                        <div>
                            <p className="font-medium text-main">Éco-PTZ Copropriété</p>
                            <p className="text-xs text-muted">Taux 0% sur 20 ans</p>
                        </div>
                    </div>
                    <span className="text-xl font-bold text-main tabular-nums">
                        <AnimatedCurrency value={financing.ecoPtzAmount} duration={1.4} />
                    </span>
                </motion.div>
            </div>

            {/* Reste à charge */}
            <div className="flex justify-between items-baseline mb-3">
                <span className="font-medium text-muted">Reste à charge</span>
                <span className="text-2xl font-bold text-main tabular-nums">
                    <AnimatedCurrency value={financing.remainingCost} duration={1.5} />
                </span>
            </div>

            <div className="flex items-center justify-between text-sm text-muted p-3 bg-surface rounded-lg border border-boundary">
                <span>Mensualité Éco-PTZ</span>
                <motion.span
                    className="font-bold text-primary text-lg tabular-nums"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ repeat: Infinity, duration: 2.5, delay: 2 }}
                >
                    <AnimatedCurrency value={financing.monthlyPayment} duration={1.6} /> /mois
                </motion.span>
            </div>

            <p className="text-xs text-muted mt-3">
                Soit <AnimatedCurrency value={financing.remainingCostPerUnit} duration={1.3} /> à financer par lot (sur projet total)
            </p>

            {/* Gain énergétique */}
            <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-center gap-3">
                    <span className="text-sm text-muted">Gain énergétique estimé :</span>
                    <span className="text-xl font-medium text-success-500 tabular-nums">
                        -{Math.round(financing.energyGainPercent * 100)}%
                    </span>
                    {financing.energyGainPercent >= 0.35 && (
                        <span className="text-xs bg-success-500/10 text-success-500 px-3 py-1 rounded-full font-medium border border-success-500/20">
                            ✓ Éligible MPR
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
