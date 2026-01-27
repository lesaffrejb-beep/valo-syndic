"use client";

import { motion } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export function SoundToggle() {
    const { isMuted, toggleMute } = useSoundEffects();

    const handleClick = () => {
        toggleMute();
    };

    return (
        <motion.button
            onClick={handleClick}
            className={`
                relative flex items-center justify-center w-9 h-9 rounded-lg
                transition-all duration-300
                ${!isMuted
                    ? "bg-surface text-primary border border-primary/30"
                    : "bg-surface text-muted border border-boundary hover:text-main hover:border-boundary-active"
                }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={isMuted ? "Activer les sons" : "Désactiver les sons"}
        >
            {isMuted ? (
                // Muted speaker
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" x2="17" y1="9" y2="15" />
                    <line x1="17" x2="23" y1="9" y2="15" />
                </svg>
            ) : (
                // Active speaker
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
            )}
        </motion.button>
    );
}
