"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info } from "lucide-react";

interface MprSuspensionAlertProps {
    isSuspended: boolean;
}

export function MprSuspensionAlert({ isSuspended }: MprSuspensionAlertProps) {
    return (
        <AnimatePresence>
            {isSuspended && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-red-950/20 border-b border-red-900/30 overflow-hidden sticky top-0 z-[100] backdrop-blur-md"
                >
                    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-red-500/10 p-1.5 rounded-full">
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                                <span className="text-red-200 text-sm font-bold tracking-tight">
                                    Avis Financier :
                                </span>
                                <span className="text-red-200/80 text-xs sm:text-sm">
                                    Suspension temporaire de MaPrimeRénov&apos; Copropriété 2026.
                                </span>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-red-900/40 rounded-full border border-red-800/50">
                            <Info className="w-3 h-3 text-red-300" />
                            <span className="text-[10px] text-red-200 font-medium uppercase tracking-widest">
                                RÈGLEMENTAIRE
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
