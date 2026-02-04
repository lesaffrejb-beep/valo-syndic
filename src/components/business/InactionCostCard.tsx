"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type InactionCost } from "@/lib/schemas";
import { AnimatedCurrency } from "@/components/ui/AnimatedNumber";
import { useViewModeStore } from "@/stores/useViewModeStore";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils"; // Will adapt based on check results

interface InactionCostCardProps {
    inactionCost: InactionCost;
}

export function InactionCostCard({ inactionCost }: InactionCostCardProps) {
    const { getAdjustedValue } = useViewModeStore();
    const [isExpanded, setIsExpanded] = useState(false);

    const totalCost = getAdjustedValue(inactionCost.totalInactionCost);
    const inflationCost = getAdjustedValue(inactionCost.projectedCost3Years - inactionCost.currentCost);
    const depreciation = getAdjustedValue(inactionCost.valueDepreciation);

    return (
        <Card variant="glass" className="h-full border-white/5 bg-white/[0.02] overflow-visible">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6 relative z-10 min-h-[520px]">
                {/* Header Discret */}
                <div className="flex items-center gap-2 mb-8 opacity-70">
                    <AlertCircle className="w-4 h-4 text-danger" />
                    <span className="label-technical text-white tracking-[0.2em]">IMPACT PATRIMONIAL (3 ANS)</span>
                </div>

                {/* THE NUMBER - Minimalist Giant */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="text-center"
                >
                    <div className="text-6xl md:text-7xl font-light text-transparent bg-clip-text bg-gradient-to-b from-danger via-danger/90 to-danger/50 tracking-tighter financial-num mb-2">
                        <AnimatedCurrency value={totalCost} />
                    </div>
                    <p className="text-sm text-muted font-medium">Perte de valeur estimée</p>
                </motion.div>

                {/* Action / Details */}
                <div className="mt-12 w-full max-w-xs">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] transition-all group"
                    >
                        <span className="text-xs text-white/60 font-medium uppercase tracking-wider group-hover:text-white transition-colors">
                            {isExpanded ? "Masquer le détail" : "Voir le détail"}
                        </span>
                        {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-white/40" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-white/40" />
                        )}
                    </button>

                    <div className="relative mt-3 h-[116px]">
                        <AnimatePresence mode="wait">
                            {isExpanded && (
                                <motion.div
                                    key="details"
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    className="absolute inset-0 flex flex-col gap-2"
                                >
                                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02]">
                                        <span className="text-xs text-muted">Surcoût travaux (inflation)</span>
                                        <span className="text-sm text-danger financial-num">
                                            <AnimatedCurrency value={inflationCost} />
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02]">
                                        <span className="text-xs text-muted">Décote valeur verte</span>
                                        <span className="text-sm text-danger financial-num">
                                            <AnimatedCurrency value={depreciation} />
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Subtle Glow Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-danger/5 blur-[100px] -z-10 rounded-full pointer-events-none" />
            </CardContent>
        </Card>
    );
}

// Add custom theme color 'terracotta' or use a close one like 'rose-400' if not defined in config yet.
// I used 'terracotta' in the class name, I should define it in the component or use direct hex/tailwind color if not in config.
// My config has 'danger' as soft red. I'll stick to 'text-red-400' or similar if terracotta isn't working, but I can add it to styles if needed.
// For now I'll use text-rose-400 or similar if the build fails, but let's assume I can adjust styles.
// Actually I'll use `text-rose-400` or `text-[#E07A5F]` (Terracotta approx) in the code to be safe or add to tailwind config.
// I will quickly verify tailwind config again. I added 'danger' as #F87171 (rose-400).
// I will check `src/utils/cn.ts` first.
