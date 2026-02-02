"use client";

import { useState, useEffect } from "react";
import { Monitor, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export function ProjectionModeToggle() {
    const [isProjectionMode, setIsProjectionMode] = useState(false);

    useEffect(() => {
        // Check local storage or system preference on mount
        const isProjector = document.body.classList.contains("projection-mode");
        setIsProjectionMode(isProjector);
    }, []);

    const toggleProjectionMode = () => {
        const body = document.body;
        if (body.classList.contains("projection-mode")) {
            body.classList.remove("projection-mode");
            setIsProjectionMode(false);
        } else {
            body.classList.add("projection-mode");
            setIsProjectionMode(true);
        }
    };

    return (
        <button
            onClick={toggleProjectionMode}
            className={`
                group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300
                ${isProjectionMode
                    ? "bg-gold text-black shadow-[0_0_20px_rgba(229,192,123,0.4)]"
                    : "bg-transparent text-muted hover:text-white hover:bg-white/5"
                }
            `}
            title={isProjectionMode ? "Désactiver Mode Projection (AG)" : "Activer Mode Projection (AG)"}
        >
            <div className="relative w-5 h-5">
                <Monitor className={`w-5 h-5 transition-all ${isProjectionMode ? "scale-100" : "scale-100"}`} />
                {isProjectionMode && (
                    <motion.div
                        layoutId="active-glow"
                        className="absolute inset-0 bg-white/50 blur-lg rounded-full"
                    />
                )}
            </div>
            <span className="hidden lg:inline text-xs font-bold tracking-wide uppercase">
                {isProjectionMode ? "AG Mode ON" : "AG Mode"}
            </span>
        </button>
    );
}
