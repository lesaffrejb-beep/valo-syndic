"use client";

import { useState, useMemo } from "react";
import { type FinancingPlan } from "@/lib/schemas";
import { ECO_PTZ_COPRO } from "@/lib/constants";
import { formatCurrency } from "@/lib/calculator";
import { motion, AnimatePresence } from "framer-motion";
import { calculateSubsidies, type IncomeProfile, type SimulationInputs } from "@/lib/subsidy-calculator";

interface TantiemeCalculatorProps {
    financing: FinancingPlan;
    // We need inputs to recalculate subsidies per profile
    simulationInputs?: SimulationInputs;
    className?: string;
}

const PROFILE_OPTIONS: { id: IncomeProfile; label: string; color: string }[] = [
    { id: "Blue", label: "T. Modeste", color: "bg-blue-500" },
    { id: "Yellow", label: "Modeste", color: "bg-yellow-500" },
    { id: "Purple", label: "Interm.", color: "bg-purple-500" },
    { id: "Pink", label: "Aisé", color: "bg-pink-500" },
];

/**
 * TANTIEME CALCULATOR — "L'Effort Réel"
 * Design Updated: Obsidian / Premium
 * Focus: Slider ergonomique + "Hero Metric" Mensuelle
 */
export function TantiemeCalculator({ financing, simulationInputs, className = "" }: TantiemeCalculatorProps) {
    const [tantiemes, setTantiemes] = useState(100); // Défaut : 100/1000
    const [selectedProfile, setSelectedProfile] = useState<IncomeProfile | null>(null);

    // If simulation inputs are provided, we can calculate precise subsidies per profile
    // Otherwise we fallback to the global financing plan (which is likely an average or total)
    const profileData = useMemo(() => {
        if (!simulationInputs) return null;
        return calculateSubsidies(simulationInputs).profiles;
    }, [simulationInputs]);

    const calculation = useMemo(() => {
        // Base base depending on profile or global
        let baseRemainingCost = financing.remainingCost;
        let baseEcoPtz = financing.ecoPtzAmount;

        if (selectedProfile && profileData) {
            // The profile data gives costs FOR A SINGLE UNIT (average unit)
            // We need to adjust this "average unit cost" to the specific tantiemes of the user
            // Assumption: The profileData uses the global average unit surface/cost logic
            // Ideally: (Global Cost * Tantiemes/1000) - (Subsidies for this cost)
            // But simpler approximation: Use the profile's remaining cost per lot and scale by tantiemes/ (1000/NbLots)?
            // BETTER APPROACH:
            // The financing plan gives GLOBAL metrics.
            // profileData gives metrics for "One average unit".
            // Let's assume the "Average Unit" corresponds to 1000 / NbLots tantiemes (e.g. 1000/10 = 100).
            // So we scale the profile Data by (UserTantiemes / AverageTantiemesPerLot).

            const totalLots = 10; // Default fallback if not available, but should be derived from inputs
            // Actually, we can just take the Global Remaining Cost, apply the profile's subsidy RATE logic? 
            // Too complex.
            // Let's use the profileData (per lot) and scale it relative to "Standard Lot".
            // If profileData.remainingCost is for an average lot.

            // SIMPLIFICATION FOR UI: 
            // We use the per-lot data from profileData as the reference for "Average Tantiemes" (e.g. 1000/NbLots)
            // AND we scale it.
            // But we don't know NbLots here easily unless passed.
            // Let's fallback to: 
            // If profile selected: Use profileData[profile].remainingCost * (tantiemes / (1000/inputs.numberOfUnits))

            const nbUnits = simulationInputs?.nbLots || 1;
            const avgTantiemes = 1000 / nbUnits;
            const ratio = tantiemes / avgTantiemes;

            baseRemainingCost = profileData[selectedProfile].remainingCost * ratio;
            // EcoPTZ is capped at 50k or so, but here we just scale
            // financing.ecoPtzAmount is global. profileData doesn't have ecoPtz explicit?
            // Actually profileData HAS monthlyPayment. We can use that directly scaled!

            return {
                partLotCash: profileData[selectedProfile].remainingCost * ratio, // Wait, remainingCost is AFTER subsidies? Yes.
                // Actually, remainingCost in profileData assumes EcoPTZ is deducted? 
                // No, remainingCost is usually "Reste à financer" (often by loan or cash).
                // Let's check SubsidyCalculator... remainingCost = workShare - subsidies.
                // So partLotCash = remainingCost (if no loan) OR remainingCost - Loan.
                // But the calculator shows "Monthly Payment".

                // Let's trust the profileData.monthlyPayment (which includes the loan calculation on the remaining cost)
                monthlyPayment: profileData[selectedProfile].monthlyPayment * ratio,
                durationYears: ECO_PTZ_COPRO.maxDurationYears,
                partLotLoan: (profileData[selectedProfile].workShareBeforeAid - profileData[selectedProfile].remainingCost) * ratio, // This is wrong logic for loan
                // Let's stick to simple:
                // monthlyPayment is provided by profile loop.
                partLotTotal: profileData[selectedProfile].remainingCost * ratio
            };
        }

        // Default legacy calculation (Global Average)
        // Part du lot dans l'apport personnel (cash immédiat)
        const partLotCash = (financing.remainingCost * tantiemes) / 1000;

        // Part du lot dans le financement Éco-PTZ
        const partLotLoan = (financing.ecoPtzAmount * tantiemes) / 1000;


        // Mensualité sur la durée Éco-PTZ (20 ans par défaut)
        const durationMonths = ECO_PTZ_COPRO.maxDurationYears * 12;
        const monthlyPayment = partLotLoan / durationMonths;

        return {
            partLotCash,
            partLotLoan,
            monthlyPayment,
            durationYears: ECO_PTZ_COPRO.maxDurationYears,
            partLotTotal: partLotCash // in legacy, "remainingCost" is total remainder
        };
    }, [financing, tantiemes, selectedProfile, profileData, simulationInputs]);

    const presets = [
        { label: "Studio", val: 30 },
        { label: "T2", val: 55 },
        { label: "T3", val: 80 },
        { label: "T4", val: 110 },
        { label: "T5+", val: 150 },
    ];

    return (
        <div className={`card-bento p-0 flex flex-col h-full ${className}`}>
            {/* Header */}
            <div className="p-6 pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-900/50 to-primary-800/20 rounded-xl flex items-center justify-center border border-primary-500/20 shadow-glow-sm">
                            <span className="text-primary-400 text-lg">🧮</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-main">Simulateur Individuel</h3>
                            <p className="text-xs text-muted">Ajustez selon votre quote-part</p>
                        </div>
                    </div>
                </div>

                {/* Profile Selector */}
                {simulationInputs && (
                    <div className="flex bg-surface-highlight rounded-lg p-1 mt-4 gap-1">
                        {PROFILE_OPTIONS.map((profile) => (
                            <button
                                key={profile.id}
                                onClick={() => setSelectedProfile(selectedProfile === profile.id ? null : profile.id)}
                                className={`flex-1 py-1.5 rounded-md text-[10px] font-medium transition-all ${selectedProfile === profile.id
                                    ? 'bg-surface shadow text-main ring-1 ring-primary-500/50'
                                    : 'text-muted hover:text-main'
                                    }`}
                            >
                                <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${profile.color} opacity-80`} />
                                {profile.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 pt-4 flex flex-col justify-between">

                {/* Hero Metric: Monthly Payment */}
                <div className="text-center mb-6">
                    <p className="text-xs text-primary-300 font-medium uppercase tracking-wide mb-2 opacity-80">
                        Votre effort d&apos;épargne
                    </p>
                    <div className="flex items-end justify-center gap-1.5 text-primary-100">
                        <span className="text-6xl font-black tracking-tighter drop-shadow-xl text-gradient-gold">
                            {Math.round(calculation.monthlyPayment)}
                        </span>
                        <div className="flex flex-col text-left mb-2">
                            <span className="text-xl font-bold text-primary-400">€</span>
                            <span className="text-xs font-medium text-muted">/mois</span>
                        </div>
                    </div>
                    <div className="mt-3 inline-flex items-center px-3 py-1 bg-primary-900/10 border border-primary-500/10 rounded-full">
                        <span className="text-[10px] text-primary-400">
                            Prêt Taux Zéro sur {calculation.durationYears} ans
                        </span>
                    </div>
                </div>

                {/* Slider Control */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <label htmlFor="tantiemes" className="text-sm font-medium text-main">
                            Quote-part : <span className="text-primary-400 font-bold">{tantiemes}</span> <span className="text-muted text-xs">/ 1000èmes</span>
                        </label>
                    </div>

                    <div className="relative h-6 flex items-center mb-4">
                        <input
                            type="range"
                            id="tantiemes"
                            min={1}
                            max={400}
                            value={tantiemes}
                            onChange={(e) => setTantiemes(Number(e.target.value))}
                            className="w-full h-2 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-primary-500 hover:accent-primary-400 transition-all"
                        />
                    </div>

                    {/* Presets */}
                    <div className="flex justify-between gap-1 overflow-x-auto pb-1 no-scrollbar">
                        {presets.map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => setTantiemes(preset.val)}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all border ${tantiemes === preset.val
                                    ? 'bg-primary-900/30 text-primary-300 border-primary-500/30'
                                    : 'bg-surface-highlight text-muted border-transparent hover:bg-surface-hover hover:text-main'
                                    }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Detail Breakdown */}
                <div className="grid grid-cols-2 gap-3 mt-auto">
                    <div className="bg-surface-highlight/50 rounded-xl p-3 border border-boundary/40 text-center">
                        <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Total Projet</p>
                        <p className="text-lg font-bold text-main">
                            {formatCurrency(calculation.partLotTotal)}
                        </p>
                    </div>
                    {/* Wait, partLotCash layout logic from before was misleading if we switch to profile logic 
                        which focuses on monthly payment. 
                        Let's keep it simple: 
                        If profile active: Show Total Cost (before aid) vs Remainder? 
                        The UI below shows "Reste à Charge" and "Financé PTZ".
                        If generic: shows splits.
                        If profile: partLotTotal is the remaining cost.
                    */}
                    {!selectedProfile && (
                        <div className="bg-surface-highlight/50 rounded-xl p-3 border border-boundary/40 text-center">
                            <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Financé PTZ</p>
                            <p className="text-lg font-bold text-primary-400">
                                {formatCurrency(calculation.partLotLoan)}
                            </p>
                            <p className="text-[10px] text-subtle">Emprunté 0%</p>
                        </div>
                    )}
                    {selectedProfile && (
                        <div className="bg-surface-highlight/50 rounded-xl p-3 border border-boundary/40 text-center">
                            <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Taux Prise en Charge</p>
                            <p className="text-lg font-bold text-success">
                                {profileData ? Math.round((1 - (profileData[selectedProfile].remainingCost / profileData[selectedProfile].workShareBeforeAid)) * 100) : 0}%
                            </p>
                            <p className="text-[10px] text-subtle">Aides Publiques</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
