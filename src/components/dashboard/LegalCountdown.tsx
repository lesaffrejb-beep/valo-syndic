import { useMemo } from 'react';

interface LegalCountdownProps {
    dpeLetter: string;
    className?: string;
}

export function LegalCountdown({ dpeLetter, className = "" }: LegalCountdownProps) {
    const letter = dpeLetter.toUpperCase();

    // Réglementation (Loi Climat & Résilience)
    // G: 2025
    // F: 2028
    // E: 2034

    interface BanConfig {
        year: number;
        status: 'banned' | 'warning' | 'safe';
        label: string;
    }

    const getConfig = (l: string): BanConfig => {
        const currentYear = new Date().getFullYear();
        if (l === 'G') return { year: 2025, status: currentYear >= 2025 ? 'banned' : 'warning', label: "Interdiction Location G" };
        if (l === 'F') return { year: 2028, status: 'warning', label: "Interdiction Location F" };
        if (l === 'E') return { year: 2034, status: 'safe', label: "Interdiction Location E" };
        return { year: 0, status: 'safe', label: "Conforme" };
    };

    const config = getConfig(letter);
    const yearsRemaining = config.year - new Date().getFullYear();

    if (config.status === 'safe' && config.year === 0) {
        return null; // Pas d'affichage si A, B, C, D
    }

    const isCritical = yearsRemaining <= 2;

    return (
        <div className={`relative overflow-hidden rounded-xl border p-4 ${className} ${isCritical ? 'bg-red-950/20 border-red-900/50' : 'bg-orange-950/20 border-orange-900/50'}`}>
            <div className="flex justify-between items-start mb-2">
                <h3 className={`text-sm font-semibold ${isCritical ? 'text-red-400' : 'text-orange-400'}`}>
                    📅 Échéance Réglementaire
                </h3>
                <span className="text-xs px-2 py-1 rounded bg-black/40 border border-white/10 text-muted">
                    {config.label}
                </span>
            </div>

            <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-white">
                    {yearsRemaining > 0 ? yearsRemaining : '0'}
                </span>
                <span className="text-sm text-muted mb-1">
                    {yearsRemaining > 1 ? 'années restantes' : 'année restante'}
                </span>
            </div>

            <div className="mt-3 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${isCritical ? 'bg-red-500' : 'bg-orange-500'}`}
                    style={{ width: `${Math.max(5, 100 - (yearsRemaining * 10))}%` }}
                />
            </div>

            <p className="text-[10px] text-muted mt-2 italic">
                {yearsRemaining <= 0
                    ? "Le logement est théoriquement interdit à la location (sauf exceptions)."
                    : `Au 1er Janvier ${config.year}, ce logement sera considéré indécent.`}
            </p>
        </div>
    );
}
