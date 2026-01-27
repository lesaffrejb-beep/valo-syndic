/**
 * FinancingCard — Plan de financement détaillé
 * Le "Plan de Bataille" avec aides et mensualités.
 * ✨ Version animée avec Framer Motion
 */

"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { type FinancingPlan } from "@/lib/schemas";
import { formatPercent } from "@/lib/calculator";
import { AnimatedCurrency, AnimatedPercent } from "@/components/ui/AnimatedNumber";

interface FinancingCardProps {
    financing: FinancingPlan;
    numberOfUnits: number;
}

export function FinancingCard({ financing, numberOfUnits }: FinancingCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.div
            ref={ref}
            className="glass-panel-spotlight group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            <h3 className="text-lg font-semibold text-success mb-4 flex items-center gap-2">
                💰 Plan de Financement
            </h3>

            <motion.div
                className="mb-6 pb-6 border-b border-borders"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.3 }}
            >
                <div className="flex justify-between items-baseline">
                    <span className="text-sm text-text-muted">Coût total des travaux (HT)</span>
                    <span className="text-2xl font-bold text-text-main tabular-nums">
                        <AnimatedCurrency value={financing.totalCostHT} duration={1.2} />
                    </span>
                </div>
                <p className="text-xs text-text-muted mt-1">
                    Soit <AnimatedCurrency value={financing.costPerUnit} duration={1} /> / lot ({numberOfUnits} lots)
                </p>
            </motion.div>

            {/* Aides */}
            <div className="space-y-4 mb-6">
                {/* MaPrimeRénov' */}
                <motion.div
                    className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20"
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
                            <p className="font-medium text-success-500">MaPrimeRénov' Copro</p>
                            <p className="text-xs text-success-600">
                                Taux : {formatPercent(financing.mprRate)}
                                {financing.exitPassoireBonus > 0 && " (dont +10% sortie passoire)"}
                            </p>
                        </div>
                    </div>
                    <span className="text-xl font-bold text-success-500 tabular-nums">
                        -<AnimatedCurrency value={financing.mprAmount} duration={1.3} />
                    </span>
                </motion.div>

                {/* Éco-PTZ */}
                <motion.div
                    className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.01 }}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🏦</span>
                        <div>
                            <p className="font-medium text-primary">Éco-PTZ Copropriété</p>
                            <p className="text-xs text-primary-400">Taux 0% sur 20 ans</p>
                        </div>
                    </div>
                    <span className="text-xl font-bold text-primary tabular-nums">
                        <AnimatedCurrency value={financing.ecoPtzAmount} duration={1.4} />
                    </span>
                </motion.div>
            </div>

            {/* Reste à charge */}
            <motion.div
                className="p-5 bg-background rounded-xl border border-borders"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.6, type: "spring" }}
            >
                <div className="flex justify-between items-baseline mb-3">
                    <span className="font-medium text-text-muted">Reste à charge</span>
                    <span className="text-2xl font-bold text-text-main tabular-nums">
                        <AnimatedCurrency value={financing.remainingCost} duration={1.5} />
                    </span>
                </div>

                <div className="flex items-center justify-between text-sm text-text-muted p-3 bg-surface rounded-lg border border-borders">
                    <span>Mensualité Éco-PTZ</span>
                    <motion.span
                        className="font-bold text-primary text-lg tabular-nums"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ repeat: Infinity, duration: 2.5, delay: 2 }}
                    >
                        <AnimatedCurrency value={financing.monthlyPayment} duration={1.6} /> /mois
                    </motion.span>
                </div>

                <p className="text-xs text-text-muted mt-3">
                    Soit <AnimatedCurrency value={financing.remainingCostPerUnit} duration={1.3} /> à financer par lot
                </p>
            </motion.div>

            {/* Gain énergétique */}
            <motion.div
                className="mt-4 pt-4 border-t border-borders"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.7 }}
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm text-text-muted">Gain énergétique estimé :</span>
                    <span className="font-bold text-success-500 text-lg tabular-nums">
                        <AnimatedPercent value={financing.energyGainPercent * 100} decimals={0} />
                    </span>
                    {financing.energyGainPercent >= 0.35 && (
                        <motion.span
                            className="text-xs bg-success/20 text-success-500 px-2 py-1 rounded-full font-medium"
                            initial={{ scale: 0 }}
                            animate={isInView ? { scale: 1 } : {}}
                            transition={{ delay: 1, type: "spring", stiffness: 300 }}
                        >
                            ✓ Éligible MPR
                        </motion.span>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
