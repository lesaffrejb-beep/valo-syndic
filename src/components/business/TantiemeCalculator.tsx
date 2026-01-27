/**
 * TantiemeCalculator — Calculateur d'effort mensuel individualisé
 * L'Argument Ultime : "Je paye 87€/mois, pas 300k€"
 */

"use client";

import { useState, useMemo } from "react";
import { type FinancingPlan } from "@/lib/schemas";
import { ECO_PTZ_COPRO } from "@/lib/constants";

interface TantiemeCalculatorProps {
    financing: FinancingPlan;
    className?: string;
}

export function TantiemeCalculator({ financing, className = "" }: TantiemeCalculatorProps) {
    const [tantiemes, setTantiemes] = useState(100); // Défaut : 100/1000

    const calculation = useMemo(() => {
        // Part du lot dans le reste à charge
        const partLot = (financing.remainingCost * tantiemes) / 1000;

        // Mensualité sur la durée Éco-PTZ (20 ans par défaut)
        const durationMonths = ECO_PTZ_COPRO.maxDurationYears * 12;
        const monthlyPayment = partLot / durationMonths;

        // Mensualité sur 15 ans (alternative)
        const monthlyPayment15 = partLot / (15 * 12);

        return {
            partLot,
            monthlyPayment,
            monthlyPayment15,
            durationYears: ECO_PTZ_COPRO.maxDurationYears,
        };
    }, [financing.remainingCost, tantiemes]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className={`card-bento p-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-900/30 rounded-xl flex items-center justify-center border border-primary-500/20">
                    <span className="text-primary-400 text-lg">🧮</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-main">Calculateur de Tantièmes</h3>
                    <p className="text-sm text-muted">Votre effort réel, personnalisé</p>
                </div>
            </div>

            {/* Slider */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                    <label htmlFor="tantiemes" className="text-sm font-medium text-secondary">
                        Vos Tantièmes
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={tantiemes}
                            onChange={(e) => setTantiemes(Math.max(1, Math.min(1000, Number(e.target.value))))}
                            className="w-20 px-3 py-1.5 text-center text-sm font-bold text-primary-400 bg-primary-900/20 border border-primary-500/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            min={1}
                            max={1000}
                        />
                        <span className="text-sm text-muted">/ 1000</span>
                    </div>
                </div>
                <input
                    type="range"
                    id="tantiemes"
                    min={1}
                    max={500}
                    value={Math.min(tantiemes, 500)}
                    onChange={(e) => setTantiemes(Number(e.target.value))}
                    className="w-full h-2 bg-boundary rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-xs text-muted mt-1">
                    <span>1</span>
                    <span>Studio</span>
                    <span>T3</span>
                    <span>Duplex</span>
                    <span>500+</span>
                </div>
            </div>

            {/* Résultat Principal */}
            <div className="bg-gradient-to-br from-primary-900/40 to-primary-800/20 rounded-xl p-6 text-center mb-6 border border-primary-500/20">
                <p className="text-sm text-primary-300 font-medium mb-2">
                    Votre effort mensuel avec Éco-PTZ ({calculation.durationYears} ans)
                </p>
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-black text-primary-400">
                        {Math.round(calculation.monthlyPayment)}
                    </span>
                    <span className="text-2xl font-bold text-primary-500">€</span>
                    <span className="text-lg text-primary-600">/mois</span>
                </div>
                <p className="text-xs text-primary-400/80 mt-2">
                    Soit {formatCurrency(calculation.partLot)} au total pour votre lot
                </p>
            </div>

            {/* Comparaison */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface rounded-lg p-4 text-center border border-boundary">
                    <p className="text-xs text-muted mb-1">Sur 15 ans</p>
                    <p className="text-xl font-bold text-secondary">
                        {Math.round(calculation.monthlyPayment15)} €
                        <span className="text-sm font-normal text-muted">/mois</span>
                    </p>
                </div>
                <div className="bg-surface rounded-lg p-4 text-center border border-boundary">
                    <p className="text-xs text-muted mb-1">Coût global copro</p>
                    <p className="text-xl font-bold text-secondary">
                        {formatCurrency(financing.remainingCost)}
                    </p>
                </div>
            </div>

            {/* Message persuasif */}
            <div className="mt-6 p-4 bg-success-900/20 rounded-lg border border-success-500/30">
                <p className="text-sm text-success-300 text-center">
                    💡 <strong>Moins qu&apos;un abonnement télécom</strong> pour valoriser votre patrimoine
                    et sécuriser sa location jusqu&apos;en 2034+
                </p>
            </div>
        </div>
    );
}
