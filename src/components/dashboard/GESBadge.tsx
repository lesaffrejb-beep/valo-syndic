/**
 * GESBadge — Badge Émissions de Gaz à Effet de Serre
 * ===================================================
 * Affiche la classe GES avec style premium
 */

"use client";

import { motion } from "framer-motion";
import { type DPELetter } from "@/lib/constants";

interface GESBadgeProps {
    gesLetter: DPELetter;
    gesValue?: number; // kgCO2/m²/an
    className?: string;
}

const GES_COLORS: Record<DPELetter, string> = {
    A: "#16a34a",
    B: "#22c55e",
    C: "#84cc16",
    D: "#eab308",
    E: "#f59e0b",
    F: "#ea580c",
    G: "#dc2626",
};

export function GESBadge({ gesLetter, gesValue, className = "" }: GESBadgeProps) {
    return (
        <motion.div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm ${className}`}
            style={{
                backgroundColor: `${GES_COLORS[gesLetter]}20`,
                borderColor: `${GES_COLORS[gesLetter]}40`,
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-white text-sm shadow-md"
                style={{ backgroundColor: GES_COLORS[gesLetter] }}
            >
                {gesLetter}
            </div>
            <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                    Émissions GES
                </p>
                {gesValue && (
                    <p className="text-sm font-bold text-main">
                        {gesValue} kgCO₂/m²/an
                    </p>
                )}
            </div>
        </motion.div>
    );
}
