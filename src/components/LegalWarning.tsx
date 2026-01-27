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
        "text-xs text-text-muted border-l-2 border-borders pl-3 italic";

    const variantStyles = {
        inline: "py-2",
        banner: "bg-surface py-3 px-4 rounded-md border border-borders",
        footer: "py-4 text-center border-t border-borders mt-8 text-text-muted",
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
        <p className={`text-xs text-text-muted/70 italic ${className}`}>
            📊 {LEGAL.dvfDisclaimer}
        </p>
    );
}
