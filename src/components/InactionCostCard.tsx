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
            className="group glass-panel-spotlight overflow-hidden relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            <h3 className="text-lg font-semibold text-danger mb-4 flex items-center gap-2 relative z-10">
                💸 Coût de l'Inaction
            </h3>

            <p className="text-sm text-text-muted mb-4 relative z-10">
                Si vous attendez 3 ans de plus, voici ce que vous perdez :
            </p>

            {/* Comparaison avant/après */}
            <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                <motion.div
                    className="bg-background/50 rounded-lg p-4 text-center border border-borders"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <p className="label-mono">
                        Coût aujourd'hui
                    </p>
                    <p className="text-xl font-bold text-text-main mt-1 tabular-nums">
                        <AnimatedCurrency value={inactionCost.currentCost} duration={1.2} />
                    </p>
                </motion.div>

                <motion.div
                    className="bg-danger/10 rounded-lg p-4 text-center border border-danger/20"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <p className="label-mono text-danger-500">
                        Coût dans 3 ans
                    </p>
                    <p className="text-xl font-bold text-danger-500 mt-1 tabular-nums">
                        <AnimatedCurrency value={inactionCost.projectedCost3Years} duration={1.5} />
                    </p>
                </motion.div>
            </div>

            {/* Perte de valeur */}
            {inactionCost.valueDepreciation > 0 && (
                <motion.div
                    className="bg-background/50 rounded-lg p-4 mb-4 border border-borders relative z-10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <p className="label-mono mb-2">
                        Décote valeur verte estimée
                    </p>
                    <p className="text-lg font-bold text-warning tabular-nums">
                        <AnimatedCurrency value={inactionCost.valueDepreciation} duration={1.8} />
                    </p>
                </motion.div>
            )}

            {/* Total — L'Or Alchimique */}
            <motion.div
                className="bg-gradient-to-r from-danger/10 to-warning/5 rounded-xl p-6 text-center border border-danger/20 relative z-10"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
            >
                <p className="label-mono text-danger-500 mb-2">
                    Total perdu (3 ans)
                </p>
                <p className="text-4xl font-bold text-gold-premium tabular-nums">
                    <AnimatedCurrency value={inactionCost.totalInactionCost} duration={2} />
                </p>
            </motion.div>

            <div className="mt-4 p-4 bg-background/30 rounded-lg border border-warning/20 relative z-10">
                <p className="text-xs text-text-muted italic">
                    ⚠️ <strong className="text-warning-500">Important :</strong> Ce montant inclut
                    l'inflation BT01 sur le coût des travaux et la perte de valeur locative potentielle.
                    Chaque mois d'attente aggrave la situation.
                </p>
            </div>
        </motion.div>
    );
}
