"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface MprSuspensionAlertProps {
    isSuspended: boolean;
}

export function MprSuspensionAlert({ isSuspended }: MprSuspensionAlertProps) {
    return (
        <AnimatePresence>
            {isSuspended && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-4xl mx-auto mb-16 p-8 rounded-[2.5rem] bg-danger/5 border border-danger/20 backdrop-blur-3xl shadow-glow-risks relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <AlertTriangle className="w-32 h-32 text-danger -rotate-12 translate-x-8 translate-y-[-2rem]" />
                    </div>

                    <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-10">
                        <div className="bg-danger/10 p-5 rounded-3xl border border-danger/20 flex-shrink-0 shadow-tactile-inner">
                            <AlertTriangle className="w-10 h-10 text-danger" />
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                <span className="bg-danger/20 text-danger text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-[0.2em] border border-danger/30">
                                    Alerte Réglementaire
                                </span>
                                <span className="text-danger/40 text-[10px] font-mono tracking-widest hidden sm:inline">REF: LDF-2026-SUSP</span>
                            </div>
                            <h4 className="text-2xl font-black text-white tracking-tight leading-tight">
                                Suspension temporaire MaPrimeRénov&apos; 2026
                            </h4>
                            <p className="text-muted/80 text-base mt-2 max-w-2xl">
                                Le dispositif national est en attente du vote budgétaire annuel. Les simulations d&apos;aides actuelles utilisent le barème 2025 comme base projectionnelle.
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-[10px] font-bold">AN</div>
                                <div className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-[10px] font-bold">CC</div>
                            </div>
                            <span className="text-[10px] text-white/40 font-medium uppercase tracking-tighter">Impacté par le vote</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
