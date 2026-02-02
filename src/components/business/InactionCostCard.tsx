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
            className="group card-bento overflow-visible relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={DEFAULT_TRANSITION}
        >
            <div className="flex flex-col gap-1 mb-10 relative z-10">
                <h3 className="text-xl font-black text-white flex items-center gap-3 tracking-tight">
                    Érosion Patrimoniale
                </h3>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Coût de l&apos;inaction sur 36 mois</p>
            </div>

            {/* Comparaison avant/after — INTERNAL TACTILE CARDS */}
            <div className="grid grid-cols-2 gap-4 mb-10 relative z-10">
                <motion.div
                    className="bg-black/20 rounded-[24px] p-6 text-center border border-white/5 shadow-tactile-inner"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-3">
                        Coût (2026)
                    </p>
                    <p className="text-2xl font-black text-white/80 tabular-nums tracking-tighter">
                        <AnimatedCurrency value={getAdjustedValue(inactionCost.currentCost)} duration={1.2} />
                    </p>
                </motion.div>

                <motion.div
                    className="bg-black/20 rounded-[24px] p-6 text-center border border-red-500/10 shadow-tactile-inner"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex flex-col gap-3">
                        <p className="text-[10px] uppercase tracking-widest text-red-400 font-bold">
                            Coût (2029)
                        </p>
                        <p className="text-2xl font-black text-red-500 tabular-nums tracking-tighter">
                            <AnimatedCurrency value={getAdjustedValue(inactionCost.projectedCost3Years)} duration={1.5} />
                        </p>
                        <div className="bg-red-500/10 border border-red-500/10 rounded-lg py-1 px-2 mx-auto">
                            <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest">
                                +{inflationPercent.toFixed(1)}%/an BTP
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Depréciation Attractivité */}
            {inactionCost.valueDepreciation > 0 && (
                <motion.div
                    className="bg-amber-500/5 rounded-[24px] p-6 mb-8 border border-amber-500/10 relative z-10 flex items-center justify-between group-hover:bg-amber-500/10 transition-all duration-500"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-amber-500/80 font-bold mb-1">
                            Décote &quot;Passoire&quot;
                        </p>
                        <p className="text-[9px] text-white/20 font-mono">Perte d&apos;attractivité locative/vente</p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-black text-amber-500 tabular-nums tracking-tighter">
                            <AnimatedCurrency value={getAdjustedValue(inactionCost.valueDepreciation)} duration={1.8} />
                        </p>
                    </div>
                </motion.div>
            )}

            {/* TOTAL — MONEY SHOT - RED/ORANGE for urgency */}
            <motion.div
                className="bg-gradient-to-br from-red-950/40 to-orange-950/20 rounded-[28px] p-8 text-center border border-red-500/20 relative z-10 shadow-glass group-hover:border-red-500/40 transition-all duration-700"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
            >
                <div className="flex flex-col gap-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-red-400/70 font-bold">
                        Impact Patrimonial Total (36 mois)
                    </p>
                    <div className="relative inline-block">
                        <p className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-red-400 bg-clip-text tabular-nums tracking-tighter drop-shadow-2xl">
                            <AnimatedCurrency value={getAdjustedValue(inactionCost.totalInactionCost)} duration={2} />
                        </p>
                        <motion.div
                            className="absolute -inset-4 bg-red-500/10 blur-xl rounded-full -z-10"
                            animate={{ opacity: [0.2, 0.4, 0.2] }}
                            transition={{ duration: 4, repeat: Infinity }}
                        />
                    </div>
                    {isMaPoche && <p className="text-[10px] text-red-300/50 uppercase tracking-widest font-bold font-mono">Calculé sur votre part de millièmes</p>}
                </div>
            </motion.div>


        </motion.div>
    );
}
