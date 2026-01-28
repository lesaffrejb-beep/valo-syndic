import { formatCurrency, formatPercent } from "@/lib/calculator";
import { type ValuationResult } from "@/lib/schemas";

interface ValuationCardProps {
    valuation: ValuationResult;
}

export function ValuationCard({ valuation }: ValuationCardProps) {
    return (
        <div className="card-bento px-6 py-5 flex flex-col justify-between relative overflow-hidden group h-full">
            <div className="flex flex-col md:flex-row items-end justify-between gap-6 h-full">
                {/* Gauche : Montant */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-success-100/10 text-success-500 uppercase tracking-wide border border-success-500/20">
                            Valorisation
                        </span>
                    </div>
                    <p className="text-3xl lg:text-4xl font-black text-success-500 tracking-tight leading-none mb-1">
                        +{formatCurrency(valuation.greenValueGain)}
                    </p>
                    <p className="text-sm font-medium text-success-400">
                        soit +{formatPercent(valuation.greenValueGainPercent)} de &quot;Valeur Verte&quot;
                    </p>
                </div>

                {/* Droite : Explication & ROI */}
                <div className="flex-1 w-full md:w-auto md:text-right pt-4 border-t border-boundary md:border-t-0 md:pt-0">
                    <p className="text-xs text-muted uppercase tracking-wider mb-1">ROI Net Propriétaire</p>
                    <div className="flex md:justify-end items-baseline gap-2">
                        <span className={`text-xl font-bold ${valuation.netROI >= 0 ? 'text-main' : 'text-danger-500'}`}>
                            {valuation.netROI >= 0 ? '+' : ''}{formatCurrency(valuation.netROI)}
                        </span>
                        <span className="text-xs text-muted">net travaux</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
