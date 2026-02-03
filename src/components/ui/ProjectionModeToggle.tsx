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
                group flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-300
                ${isProjectionMode
                    ? "bg-gold text-black shadow-[0_0_20px_rgba(229,192,123,0.4)]"
                    : "bg-transparent text-muted hover:text-white hover:bg-white/5"
                }
            `}
            title={isProjectionMode ? "Désactiver Mode Projection (AG)" : "Activer Mode Projection (AG)"}
        >
            <div className="relative w-3.5 h-3.5">
                <Monitor className={`w-3.5 h-3.5 transition-all ${isProjectionMode ? "scale-100" : "scale-100"}`} />
                {isProjectionMode && (
                    <motion.div
                        layoutId="active-glow"
                        className="absolute inset-0 bg-white/50 blur-lg rounded-full"
                    />
                )}
            </div>
            <span className="text-[10px] xl:text-[11px] font-medium tracking-[0.15em] uppercase">
                <span className="hidden 2xl:inline">{isProjectionMode ? "Mode AG ON" : "Mode AG"}</span>
                <span className="2xl:hidden">{isProjectionMode ? "AG ON" : "AG"}</span>
            </span>
        </button>
    );
}
