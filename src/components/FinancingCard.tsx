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
            className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.005 }}
        >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                🚀 Plan de Financement
            </h3>

            {/* Coût total */}
            <motion.div
                className="mb-6 pb-6 border-b border-gray-100"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.3 }}
            >
                <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gray-600">Coût total des travaux (HT)</span>
                    <span className="text-2xl font-bold text-gray-900">
                        <AnimatedCurrency value={financing.totalCostHT} duration={1.2} />
                    </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    Soit <AnimatedCurrency value={financing.costPerUnit} duration={1} /> / lot ({numberOfUnits} lots)
                </p>
            </motion.div>

            {/* Aides */}
            <div className="space-y-4 mb-6">
                {/* MaPrimeRénov' */}
                <motion.div
                    className="flex items-center justify-between p-4 bg-success-50 rounded-xl border border-success-100"
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
                            <p className="font-medium text-success-800">MaPrimeRénov' Copro</p>
                            <p className="text-xs text-success-600">
                                Taux : {formatPercent(financing.mprRate)}
                                {financing.exitPassoireBonus > 0 && " (dont +10% sortie passoire)"}
                            </p>
                        </div>
                    </div>
                    <span className="text-xl font-bold text-success-700">
                        -<AnimatedCurrency value={financing.mprAmount} duration={1.3} />
                    </span>
                </motion.div>

                {/* Éco-PTZ */}
                <motion.div
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-indigo-50 rounded-xl border border-primary-100"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.01 }}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🏦</span>
                        <div>
                            <p className="font-medium text-primary-800">Éco-PTZ Copropriété</p>
                            <p className="text-xs text-primary-600">Taux 0% sur 20 ans</p>
                        </div>
                    </div>
                    <span className="text-xl font-bold text-primary-700">
                        <AnimatedCurrency value={financing.ecoPtzAmount} duration={1.4} />
                    </span>
                </motion.div>
            </div>

            {/* Reste à charge */}
            <motion.div
                className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.6, type: "spring" }}
            >
                <div className="flex justify-between items-baseline mb-3">
                    <span className="font-medium text-gray-700">Reste à charge</span>
                    <span className="text-2xl font-bold text-gray-900">
                        <AnimatedCurrency value={financing.remainingCost} duration={1.5} />
                    </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 p-3 bg-white rounded-lg shadow-sm">
                    <span>Mensualité Éco-PTZ</span>
                    <motion.span
                        className="font-bold text-primary-600 text-lg"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ repeat: Infinity, duration: 2.5, delay: 2 }}
                    >
                        <AnimatedCurrency value={financing.monthlyPayment} duration={1.6} /> /mois
                    </motion.span>
                </div>

                <p className="text-xs text-gray-500 mt-3">
                    Soit <AnimatedCurrency value={financing.remainingCostPerUnit} duration={1.3} /> à financer par lot
                </p>
            </motion.div>

            {/* Gain énergétique */}
            <motion.div
                className="mt-4 pt-4 border-t border-gray-100"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.7 }}
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Gain énergétique estimé :</span>
                    <span className="font-bold text-success-600 text-lg">
                        <AnimatedPercent value={financing.energyGainPercent * 100} decimals={0} />
                    </span>
                    {financing.energyGainPercent >= 0.35 && (
                        <motion.span
                            className="text-xs bg-success-100 text-success-700 px-2 py-1 rounded-full font-medium"
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
