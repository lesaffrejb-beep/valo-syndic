"use client";

import { motion } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useState } from "react";

export function ShareButton() {
    const { playSound } = useSoundEffects();
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        playSound("click");

        const shareData = {
            title: "VALO-SYNDIC",
            text: "Diagnostic Patrimonial & Rénovation Énergétique",
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                playSound("success");
            } catch (err) {
                // Ignore abort errors
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                playSound("success");
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error("Failed to copy", err);
            }
        }
    };

    return (
        <motion.button
            onClick={handleShare}
            className={`
                relative flex items-center justify-center w-9 h-9 rounded-lg
                transition-all duration-300
                bg-surface text-muted border border-boundary hover:text-main hover:border-boundary-active
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Partager la simulation"
        >
            {copied ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            ) : (
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
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
            )}
        </motion.button>
    );
}
