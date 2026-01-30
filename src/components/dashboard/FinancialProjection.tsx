import { useMemo } from 'react';
import type { DPEData } from '@/hooks/useAddressSearch';

interface FinancialProjectionProps {
    dpeData: DPEData;
    className?: string;
}

export function FinancialProjection({ dpeData, className = "" }: FinancialProjectionProps) {
    // Calculs simplifiés pour la projection
    // Si on a le coût réel du DPE, on l'utilise. Sinon on estime.

    const estimatedCost = dpeData.cout_total_ttc || (dpeData.conso_kwh_m2_an * dpeData.surface_habitable * 0.25); // 0.25€ du kwh moy

    // Projection sur 10 ans avec inflation énergétique (ex: +5% par an)
    const inflationRate = 0.05;
    let accumulatedCost = 0;
    let currentAnnual = estimatedCost;

    for (let i = 0; i < 10; i++) {
        accumulatedCost += currentAnnual;
        currentAnnual *= (1 + inflationRate);
    }

    const formatEuro = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className={`p-4 rounded-xl border border-white/10 bg-surface ${className}`}>
            <h3 className="text-sm font-semibold text-main mb-4">💰 Projection Financière (10 ans)</h3>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <p className="text-xs text-muted mb-1">Coût Annuel Actuel</p>
                    <p className="text-xl font-bold text-white">{formatEuro(estimatedCost)}</p>
                    <p className="text-[10px] text-subtle">Basé sur DPE & Prix Énergie</p>
                </div>

                <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                    <p className="text-xs text-primary-300 mb-1">Coût Cumulé 10 ans</p>
                    <p className="text-xl font-bold text-primary-100">{formatEuro(accumulatedCost)}</p>
                    <p className="text-[10px] text-primary-400/70">Avec inflation 5%/an</p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                    <span className="text-xl">📉</span>
                    <div>
                        <p className="text-xs font-medium text-white">Potentiel de Valorisation</p>
                        <p className="text-[10px] text-muted">
                            Une rénovation globale (B) réduirait la facture par {(dpeData.etiquette_dpe === 'G' || dpeData.etiquette_dpe === 'F') ? '4' : '2'}.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
