"use client";

import { motion } from "framer-motion";
import { useProjectionMode } from "@/hooks/useProjectionMode";

export function ProjectionModeToggle() {
    const { isProjectionMode, toggleProjectionMode } = useProjectionMode();

    return (
        <motion.button
            onClick={toggleProjectionMode}
            className={`
                relative flex items-center gap-2 px-3 py-2 rounded-lg
                transition-all duration-300 text-sm font-medium
                ${isProjectionMode
                    ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(212,182,121,0.3)] border border-primary/50"
                    : "bg-white/[0.02] border border-white/[0.06] text-muted hover:text-main hover:bg-white/[0.04] hover:border-white/[0.12]"
                }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title={isProjectionMode ? "Désactiver mode projection" : "Activer mode projection AG"}
        >
            {/* Projector icon */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M5 7L3 5" />
                <path d="M9 6V3" />
                <path d="M13 7L15 5" />
                <circle cx="9" cy="13" r="3" />
                <path d="M11.83 12H20a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2.17" />
                <path d="M16 16h2" />
            </svg>

            <span className="hidden sm:inline">
                {isProjectionMode ? "Mode AG actif" : "Projection AG"}
            </span>

            {/* Active indicator */}
            {isProjectionMode && (
                <motion.span
                    className="absolute -top-1 -right-1 w-3 h-3 bg-success-500 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                >
                    <span className="absolute inset-0 bg-success-500 rounded-full animate-ping opacity-75" />
                </motion.span>
            )}
        </motion.button>
    );
}
