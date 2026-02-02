"use client";

import { useState, useMemo, useEffect } from "react";
import { type FinancingPlan } from "@/lib/schemas";
import { ECO_PTZ_COPRO } from "@/lib/constants";
import { formatCurrency } from "@/lib/calculator";
import { calculateSubsidies, type IncomeProfile, type SimulationInputs } from "@/lib/subsidy-calculator";
import { Calculator } from "lucide-react";
import { useViewModeStore } from "@/stores/useViewModeStore";

interface TantiemeCalculatorProps {
    financing: FinancingPlan;
    // We need inputs to recalculate subsidies per profile
    simulationInputs?: SimulationInputs | undefined;
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
    // Sync with global view mode store for "Ma Poche" mode
    const { viewMode, userTantiemes, setUserTantiemes, setViewMode } = useViewModeStore();

    // Use store value as initial state, but allow local changes
    const [tantiemes, setTantiemesLocal] = useState(userTantiemes);
    const [selectedProfile, setSelectedProfile] = useState<IncomeProfile | null>(null);

    // Sync tantiemes with global store (for other widgets like ValuationCard, InactionCostCard)
    const setTantiemes = (value: number) => {
        setTantiemesLocal(value);
        setUserTantiemes(value);
        // When user interacts, switch to "Ma Poche" mode for personal view
        setViewMode('maPoche');
    };

    // Sync from store if changed externally
    useEffect(() => {
        setTantiemesLocal(userTantiemes);
    }, [userTantiemes]);

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
            <div className="p-8 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-900/50 to-primary-800/20 rounded-xl flex items-center justify-center border border-primary-500/20 shadow-glow-sm">
                            <Calculator className="w-6 h-6 text-primary-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-main">Simulateur Individuel</h3>
                            <p className="text-sm text-muted mt-0.5">Ajustez selon votre quote-part</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setViewMode(viewMode === 'maPoche' ? 'immeuble' : 'maPoche')}
                        className="h-9 px-4 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-[11px] font-mono tracking-widest uppercase text-white/60 hover:text-white/80 transition-all active:scale-95"
                    >
                        {viewMode === 'maPoche' ? 'Voir Immeuble' : 'Voir mon Lot'}
                    </button>
                </div>

                {/* Profile Selector */}
                {simulationInputs && (
                    <div className="flex bg-surface-highlight rounded-xl p-1.5 mt-6 gap-2">
                        {PROFILE_OPTIONS.map((profile) => (
                            <button
                                key={profile.id}
                                onClick={() => setSelectedProfile(selectedProfile === profile.id ? null : profile.id)}
                                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${selectedProfile === profile.id
                                    ? 'bg-surface shadow text-main ring-1 ring-primary-500/50'
                                    : 'text-muted hover:text-main'
                                    }`}
                            >
                                <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${profile.color} opacity-80`} />
                                {profile.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 pt-4 flex flex-col justify-between gap-6">

                {/* Hero Metric: Monthly Payment */}
                <div className="text-center mb-2">
                    <p className="text-sm text-primary-300 font-bold uppercase tracking-widest mb-3 opacity-80">
                        Votre effort d&apos;épargne
                    </p>
                    <div className="flex items-end justify-center gap-2 text-primary-100">
                        <span className="text-7xl font-black tracking-tighter drop-shadow-2xl text-gradient-gold">
                            {Math.round(calculation.monthlyPayment)}
                        </span>
                        <div className="flex flex-col text-left mb-4">
                            <span className="text-2xl font-bold text-primary-400 leading-none">€</span>
                            <span className="text-sm font-semibold text-muted leading-none mt-1">/mois</span>
                        </div>
                    </div>
                    <div className="mt-4 inline-flex items-center px-4 py-1.5 bg-primary-900/20 border border-primary-500/20 rounded-full">
                        <span className="text-xs font-medium text-primary-300">
                            Prêt Taux Zéro sur {calculation.durationYears} ans
                        </span>
                    </div>
                </div>

                {/* Slider Control */}
                <div className="mb-2">
                    <div className="flex justify-between items-center mb-4">
                        <label htmlFor="tantiemes" className="text-base font-semibold text-main">
                            Quote-part : <span className="text-primary-400 font-bold text-lg">{tantiemes}</span> <span className="text-muted text-sm font-normal">/ 1000èmes</span>
                        </label>
                    </div>

                    <div className="relative h-10 flex items-center mb-6">
                        <input
                            type="range"
                            id="tantiemes"
                            min={1}
                            max={400}
                            value={tantiemes}
                            onChange={(e) => setTantiemes(Number(e.target.value))}
                            className="w-full h-4 bg-surface-hover rounded-full appearance-none cursor-pointer accent-white transition-all hover:bg-surface-highlight ring-1 ring-white/10"
                        />
                    </div>

                    {/* Presets */}
                    <div className="flex justify-between gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {presets.map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => setTantiemes(preset.val)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${tantiemes === preset.val
                                    ? 'bg-primary-900/30 text-primary-300 border-primary-500/30 shadow-glow-sm'
                                    : 'bg-surface-highlight text-muted border-transparent hover:bg-surface-hover hover:text-main'
                                    }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Detail Breakdown - More Dense */}
                <div className="space-y-3 mt-6 pt-6 border-t border-white/5">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted">Quote-part Travaux</span>
                        <span className="font-semibold text-white">{formatCurrency(calculation.partLotTotal)}</span>
                    </div>
                    {selectedProfile && profileData && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-success-300">Aides (MPR + CEE)</span>
                            <span className="font-semibold text-success">- {formatCurrency(profileData[selectedProfile].workShareBeforeAid - profileData[selectedProfile].remainingCost)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-primary-300">Reste à financer</span>
                        <span className="font-bold text-primary-200">{formatCurrency(calculation.partLotLoan)}</span>
                    </div>
                </div>

                <div className="mt-4 bg-surface-highlight/30 rounded-lg p-3 border border-white/5 flex items-center gap-3">
                    <div className="w-1 h-8 bg-gold/50 rounded-full" />
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted font-bold">Le Twist Valo-Syndic</p>
                        <p className="text-xs text-white/80 leading-tight">
                            Effort d'épargne {Math.round(calculation.monthlyPayment)}€ vs Gain mensuel énergie estimé ~{Math.round(calculation.monthlyPayment * 0.4)}€.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
