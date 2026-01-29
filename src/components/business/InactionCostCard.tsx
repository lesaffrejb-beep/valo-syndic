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
import { useViewModeStore } from "@/stores/useViewModeStore";

interface InactionCostCardProps {
    inactionCost: InactionCost;
}

import { DEFAULT_TRANSITION } from "@/lib/animations";

export function InactionCostCard({ inactionCost }: InactionCostCardProps) {
    const inflationPercent = TECHNICAL_PARAMS.constructionInflationRate * 100;
    const { viewMode, getAdjustedValue } = useViewModeStore();
    const isMaPoche = viewMode === 'maPoche';

    return (
        <motion.div
            className="group card-bento overflow-hidden relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={DEFAULT_TRANSITION}
        >
            <h3 className="text-xl font-semibold text-main mb-6 flex items-center gap-3 relative z-10">
                <span className="text-2xl">📉</span> Érosion Patrimoniale Estimée
            </h3>



            {/* Comparaison avant/après */}
            <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                <motion.div
                    className="bg-app rounded-xl p-5 text-center border border-border"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <p className="label-technical">
                        Coût Travaux (2026)
                    </p>
                    <p className="text-xl font-medium text-main mt-2 tabular-nums">
                        <AnimatedCurrency value={getAdjustedValue(inactionCost.currentCost)} duration={1.2} />
                    </p>
                </motion.div>

                <motion.div
                    className="bg-app rounded-xl p-5 text-center border border-danger/20"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <p className="label-technical text-danger">
                        Coût Travaux (2029)
                    </p>
                    <p className="text-xl font-medium text-danger mt-2 tabular-nums">
                        <AnimatedCurrency value={getAdjustedValue(inactionCost.projectedCost3Years)} duration={1.5} />
                    </p>
                    <p className="text-xs text-danger/70 mt-1">
                        +{inflationPercent.toFixed(1)}%/an (BTP)
                    </p>
                </motion.div>
            </div>

            {/* Perte de valeur */}
            {inactionCost.valueDepreciation > 0 && (
                <motion.div
                    className="bg-app rounded-xl p-5 mb-6 border border-border relative z-10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <p className="label-technical mb-2">
                        + Perte d&apos;Attractivité (Décote)
                    </p>
                    <p className="text-lg font-medium text-warning tabular-nums">
                        <AnimatedCurrency value={getAdjustedValue(inactionCost.valueDepreciation)} duration={1.8} />
                    </p>
                    <p className="text-xs text-muted mt-1">
                        Écart grandissant avec le marché rénové
                    </p>
                </motion.div>
            )}

            {/* Total — MATTE LUXURY */}
            <motion.div
                className="bg-app rounded-card p-6 text-center border border-danger/30 relative z-10"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
            >
                <p className="label-technical text-danger mb-2">
                    Perte Totale {isMaPoche ? '(votre part)' : ''} (3 ans)
                </p>
                <p className="text-4xl font-medium text-primary tabular-nums">
                    <AnimatedCurrency value={getAdjustedValue(inactionCost.totalInactionCost)} duration={2} />
                </p>
            </motion.div>


        </motion.div>
    );
}
