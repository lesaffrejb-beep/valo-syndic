/**
 * FinancingCard — Plan de financement détaillé
 * Le "Plan de Bataille" avec aides et mensualités.
 */

import { type FinancingPlan } from "@/lib/schemas";
import { formatCurrency, formatPercent } from "@/lib/calculator";

interface FinancingCardProps {
    financing: FinancingPlan;
    numberOfUnits: number;
}

export function FinancingCard({ financing, numberOfUnits }: FinancingCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                🚀 Plan de Financement
            </h3>

            {/* Coût total */}
            <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gray-600">Coût total des travaux (HT)</span>
                    <span className="text-2xl font-bold text-gray-900">
                        {formatCurrency(financing.totalCostHT)}
                    </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    Soit {formatCurrency(financing.costPerUnit)} / lot ({numberOfUnits} lots)
                </p>
            </div>

            {/* Aides */}
            <div className="space-y-4 mb-6">
                {/* MaPrimeRénov' */}
                <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">💰</span>
                        <div>
                            <p className="font-medium text-success-800">MaPrimeRénov' Copro</p>
                            <p className="text-xs text-success-600">
                                Taux : {formatPercent(financing.mprRate)}
                                {financing.exitPassoireBonus > 0 && " (dont +10% sortie passoire)"}
                            </p>
                        </div>
                    </div>
                    <span className="text-lg font-bold text-success-700">
                        -{formatCurrency(financing.mprAmount)}
                    </span>
                </div>

                {/* Éco-PTZ */}
                <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🏦</span>
                        <div>
                            <p className="font-medium text-primary-800">Éco-PTZ Copropriété</p>
                            <p className="text-xs text-primary-600">Taux 0% sur 20 ans</p>
                        </div>
                    </div>
                    <span className="text-lg font-bold text-primary-700">
                        {formatCurrency(financing.ecoPtzAmount)}
                    </span>
                </div>
            </div>

            {/* Reste à charge */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-baseline mb-2">
                    <span className="font-medium text-gray-700">Reste à charge</span>
                    <span className="text-xl font-bold text-gray-900">
                        {formatCurrency(financing.remainingCost)}
                    </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Mensualité Éco-PTZ</span>
                    <span className="font-semibold text-primary-600">
                        {formatCurrency(financing.monthlyPayment)} / mois
                    </span>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                    Soit {formatCurrency(financing.remainingCostPerUnit)} à financer par lot
                </p>
            </div>

            {/* Gain énergétique */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Gain énergétique estimé :</span>
                    <span className="font-bold text-success-600">
                        {formatPercent(financing.energyGainPercent)}
                    </span>
                    {financing.energyGainPercent >= 0.35 && (
                        <span className="text-xs bg-success-100 text-success-700 px-2 py-0.5 rounded-full">
                            ✓ Éligible MPR
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
