/**
 * LegalWarning — Composant d'alerte réglementaire
 * Affiche le disclaimer obligatoire OPQIBI.
 */

import { LEGAL } from "@/lib/constants";

interface LegalWarningProps {
    variant?: "inline" | "banner" | "footer";
    className?: string;
}

export function LegalWarning({
    variant = "inline",
    className = "",
}: LegalWarningProps) {
    const baseStyles =
        "text-xs text-gray-500 border-l-2 border-gray-300 pl-3 italic";

    const variantStyles = {
        inline: "py-2",
        banner: "bg-gray-50 py-3 px-4 rounded-md border border-gray-200",
        footer: "py-4 text-center border-t border-gray-200 mt-8",
    };

    return (
        <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
            <p>⚠️ {LEGAL.disclaimer}</p>
        </div>
    );
}

/**
 * DVFDisclaimer — Mention source données DVF
 */
export function DVFDisclaimer({ className = "" }: { className?: string }) {
    return (
        <p className={`text-xs text-gray-400 italic ${className}`}>
            📊 {LEGAL.dvfDisclaimer}
        </p>
    );
}
