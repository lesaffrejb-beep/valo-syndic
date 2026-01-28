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
    const baseStyles = "text-xs text-muted";

    const variantStyles = {
        inline: "border-l-2 border-boundary pl-3 italic py-2",
        banner: "py-4 text-center italic",
        footer: "py-4 text-center border-t border-boundary mt-8",
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
        <p className={`text-xs text-muted/70 italic ${className}`}>
            📊 {LEGAL.dvfDisclaimer}
        </p>
    );
}
