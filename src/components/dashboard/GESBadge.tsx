import { useMemo } from 'react';

interface GESBadgeProps {
    gesLetter: string;
    gesValue?: number;
    className?: string;
}

const gesColors: Record<string, { bg: string; text: string; border: string }> = {
    A: { bg: "bg-emerald-900/40", text: "text-emerald-400", border: "border-emerald-500/30" },
    B: { bg: "bg-emerald-900/30", text: "text-emerald-500", border: "border-emerald-500/20" },
    C: { bg: "bg-lime-900/30", text: "text-lime-400", border: "border-lime-500/30" },
    D: { bg: "bg-yellow-900/30", text: "text-yellow-400", border: "border-yellow-500/30" },
    E: { bg: "bg-orange-900/30", text: "text-orange-400", border: "border-orange-500/30" },
    F: { bg: "bg-red-900/30", text: "text-red-400", border: "border-red-500/30" },
    G: { bg: "bg-red-950/40", text: "text-red-500", border: "border-red-500/40" },
};

export function GESBadge({ gesLetter, gesValue, className = "" }: GESBadgeProps) {
    const letter = gesLetter.toUpperCase();
    const styles = gesColors[letter] || { bg: "bg-gray-800", text: "text-gray-400", border: "border-gray-700" };

    return (
        <div className={`inline-flex flex-col items-center justify-center p-3 rounded-xl border backdrop-blur-sm ${styles.bg} ${styles.border} ${className}`}>
            <span className="text-[10px] uppercase tracking-wider text-muted mb-1 opacity-80">Émissions GES</span>
            <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${styles.text}`}>{gesValue ?? letter}</span>
                {gesValue && <span className="text-xs text-muted">kgCO₂/m²/an</span>}
            </div>
            {gesValue && (
                <div className={`mt-1 px-2 py-0.5 rounded text-[10px] font-bold border ${styles.border} bg-black/20 ${styles.text}`}>
                    Classe {letter}
                </div>
            )}
        </div>
    );
}
