/**
 * InactionCostCard — Visualisation du coût de l'inaction
 * Le module "anxiogène" qui pousse à l'action.
 */

import { type InactionCost } from "@/lib/schemas";
import { formatCurrency } from "@/lib/calculator";
import { TECHNICAL_PARAMS } from "@/lib/constants";

interface InactionCostCardProps {
    inactionCost: InactionCost;
}

export function InactionCostCard({ inactionCost }: InactionCostCardProps) {
    const inflationPercent = TECHNICAL_PARAMS.constructionInflationRate * 100;

    return (
        <div className="bg-gradient-to-br from-danger-50 to-warning-50 rounded-xl shadow-sm border border-danger-200 p-6">
            <h3 className="text-lg font-semibold text-danger-900 mb-4 flex items-center gap-2">
                💸 Coût de l'Inaction
            </h3>

            <p className="text-sm text-gray-700 mb-4">
                Si vous attendez 3 ans de plus, voici ce que vous perdez :
            </p>

            {/* Comparaison avant/après */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/70 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Coût aujourd'hui
                    </p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                        {formatCurrency(inactionCost.currentCost)}
                    </p>
                </div>

                <div className="bg-white/70 rounded-lg p-4 text-center border-2 border-danger-300">
                    <p className="text-xs text-danger-600 uppercase tracking-wide">
                        Coût dans 3 ans
                    </p>
                    <p className="text-xl font-bold text-danger-700 mt-1">
                        {formatCurrency(inactionCost.projectedCost3Years)}
                    </p>
                    <p className="text-xs text-danger-600 mt-1">
                        +{inflationPercent.toFixed(1)}%/an (BT01)
                    </p>
                </div>
            </div>

            {/* Perte de valeur */}
            {inactionCost.valueDepreciation > 0 && (
                <div className="bg-white/70 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">📉</span>
                            <span className="text-sm text-gray-700">Décote "Passoire"</span>
                        </div>
                        <span className="font-bold text-danger-600">
                            -{formatCurrency(inactionCost.valueDepreciation)}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Perte de valeur vénale estimée (−12% vs bien rénové)
                    </p>
                </div>
            )}

            {/* Total */}
            <div className="bg-danger-600 text-white rounded-lg p-4 text-center">
                <p className="text-sm uppercase tracking-wide opacity-90">
                    🔴 Perte totale estimée
                </p>
                <p className="text-3xl font-black mt-1">
                    {formatCurrency(inactionCost.totalInactionCost)}
                </p>
                <p className="text-xs opacity-80 mt-2">
                    Ne laissez pas l'inflation vous voler votre patrimoine
                </p>
            </div>
        </div>
    );
}
