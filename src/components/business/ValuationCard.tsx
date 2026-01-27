import { formatCurrency, formatPercent } from "@/lib/calculator";
import { type ValuationResult } from "@/lib/schemas";

interface ValuationCardProps {
    valuation: ValuationResult;
}

export function ValuationCard({ valuation }: ValuationCardProps) {
    return (
        <div className="card-bento p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="text-6xl">📈</span>
            </div>

            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-success-100 text-success-700 uppercase tracking-wide">
                        Valorisation Patrimoniale
                    </span>
                </div>
                <h3 className="text-xl font-bold text-main mb-1">
                    Valeur Verte
                </h3>
                <p className="text-sm text-muted">
                    Impact estimé de la rénovation sur la valeur de revente, basé sur la prime DPE cible.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div>
                    <p className="text-xs text-muted mb-1 uppercase tracking-wider">Gain de valeur Brut</p>
                    <p className="text-3xl lg:text-4xl font-bold text-success-600 tracking-tight">
                        +{formatCurrency(valuation.greenValueGain)}
                    </p>
                    <p className="text-sm font-medium text-success-700 mt-1">
                        soit +{formatPercent(valuation.greenValueGainPercent)}
                    </p>
                </div>

                <div className="pt-4 border-t border-boundary md:border-t-0 md:border-l md:pl-6 md:pt-0">
                    <p className="text-xs text-muted mb-1 uppercase tracking-wider">Retour sur Investissement Net</p>
                    <p className="text-xs text-subtle mb-2">
                        (Gain value - Reste à charge)
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-bold ${valuation.netROI >= 0 ? 'text-main' : 'text-danger-600'}`}>
                            {valuation.netROI >= 0 ? '+' : ''}{formatCurrency(valuation.netROI)}
                        </span>
                    </div>
                    <p className="text-xs text-subtle mt-2">
                        *Estimation basée sur un prix moyen de {formatCurrency(valuation.pricePerSqm)}/m²
                    </p>
                </div>
            </div>
        </div>
    );
}
