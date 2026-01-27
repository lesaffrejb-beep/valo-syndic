/**
 * InactionCostCard — Visualisation du coût de l'inaction
 * Le module "anxiogène" qui pousse à l'action.
 * ✨ Version animée avec Framer Motion
 */

"use client";

import { motion } from "framer-motion";
import { type InactionCost } from "@/lib/schemas";
import { TECHNICAL_PARAMS } from "@/lib/constants";
import { AnimatedCurrency } from "@/components/ui/AnimatedNumber";

interface InactionCostCardProps {
    inactionCost: InactionCost;
}

export function InactionCostCard({ inactionCost }: InactionCostCardProps) {
    const inflationPercent = TECHNICAL_PARAMS.constructionInflationRate * 100;

    return (
        <motion.div
            className="bg-gradient-to-br from-danger-50 to-warning-50 rounded-2xl shadow-lg shadow-danger-500/10 border border-danger-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ scale: 1.005 }}
        >
            <h3 className="text-lg font-semibold text-danger-900 mb-4 flex items-center gap-2">
                💸 Coût de l'Inaction
            </h3>

            <p className="text-sm text-gray-700 mb-4">
                Si vous attendez 3 ans de plus, voici ce que vous perdez :
            </p>

            {/* Comparaison avant/après */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.div
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Coût aujourd'hui
                    </p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                        <AnimatedCurrency value={inactionCost.currentCost} duration={1.2} />
                    </p>
                </motion.div>

                <motion.div
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border-2 border-danger-300 shadow-sm shadow-danger-500/10"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <p className="text-xs text-danger-600 uppercase tracking-wide">
                        Coût dans 3 ans
                    </p>
                    <p className="text-xl font-bold text-danger-700 mt-1">
                        <AnimatedCurrency value={inactionCost.projectedCost3Years} duration={1.5} />
                    </p>
                    <p className="text-xs text-danger-600 mt-1">
                        +{inflationPercent.toFixed(1)}%/an (BT01)
                    </p>
                </motion.div>
            </div>

            {/* Perte de valeur */}
            {inactionCost.valueDepreciation > 0 && (
                <motion.div
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-4 shadow-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <motion.span
                                className="text-lg"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            >
                                📉
                            </motion.span>
                            <span className="text-sm text-gray-700">Décote "Passoire"</span>
                        </div>
                        <span className="font-bold text-danger-600">
                            -<AnimatedCurrency value={inactionCost.valueDepreciation} duration={1.3} />
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Perte de valeur vénale estimée (−12% vs bien rénové)
                    </p>
                </motion.div>
            )}

            {/* Total avec animation pulse */}
            <motion.div
                className="bg-gradient-to-r from-danger-600 to-danger-700 text-white rounded-xl p-6 text-center shadow-lg shadow-danger-600/30"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.02 }}
            >
                <p className="text-sm uppercase tracking-wide opacity-90">
                    🔴 Perte totale estimée
                </p>
                <motion.p
                    className="text-4xl font-black mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    <AnimatedCurrency value={inactionCost.totalInactionCost} duration={2} />
                </motion.p>
                <p className="text-xs opacity-80 mt-3">
                    Ne laissez pas l'inflation vous voler votre patrimoine
                </p>
            </motion.div>
        </motion.div>
    );
}
