"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

interface MprSuspensionAlertProps {
    isSuspended: boolean;
}

export function MprSuspensionAlert({ isSuspended }: MprSuspensionAlertProps) {
    const [isVisible, setIsVisible] = useState(true);

    if (!isSuspended) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="w-full bg-danger/10 backdrop-blur-md border-b border-danger/20 text-danger z-[100] relative overflow-hidden"
                >
                    <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-xs md:text-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
                            <p className="truncate">
                                <span className="font-bold text-danger uppercase tracking-wider mr-2">Alerte Réglementaire</span>
                                Suspension temporaire MaPrimeRénov&apos; 2026 en attente du vote budgétaire.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="p-1 hover:bg-white/5 rounded-full transition-colors ml-4 shrink-0"
                        >
                            <X className="w-4 h-4 text-danger" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
