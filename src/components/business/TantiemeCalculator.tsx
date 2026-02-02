"use client";

import { useState, useMemo, useEffect } from "react";
import { type FinancingPlan } from "@/lib/schemas";
import { ECO_PTZ_COPRO } from "@/lib/constants";
import { formatCurrency } from "@/lib/calculator";
import { calculateSubsidies, type IncomeProfile, type SimulationInputs } from "@/lib/subsidy-calculator";
import { Calculator, Euro, PiggyBank, Scale } from "lucide-react";
import { useViewModeStore } from "@/stores/useViewModeStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedCurrency } from "@/components/ui/AnimatedNumber";
import { cn } from "@/lib/utils";

interface TantiemeCalculatorProps {
    financing: FinancingPlan;
    simulationInputs?: SimulationInputs | undefined;
    className?: string;
}

const PROFILE_OPTIONS: { id: IncomeProfile; label: string; color: string }[] = [
    { id: "Blue", label: "T. Modeste", color: "bg-blue-400" },
    { id: "Yellow", label: "Modeste", color: "bg-yellow-400" },
    { id: "Purple", label: "Interm.", color: "bg-purple-400" },
    { id: "Pink", label: "Aisé", color: "bg-pink-400" },
];

export function TantiemeCalculator({ financing, simulationInputs, className = "" }: TantiemeCalculatorProps) {
    const { viewMode, userTantiemes, setUserTantiemes, setViewMode } = useViewModeStore();
    const [tantiemes, setTantiemesLocal] = useState(userTantiemes);
    const [selectedProfile, setSelectedProfile] = useState<IncomeProfile | null>(null);

    const setTantiemes = (value: number) => {
        setTantiemesLocal(value);
        setUserTantiemes(value);
        setViewMode('maPoche');
    };

    useEffect(() => {
        setTantiemesLocal(userTantiemes);
    }, [userTantiemes]);

    const profileData = useMemo(() => {
        if (!simulationInputs) return null;
        return calculateSubsidies(simulationInputs).profiles;
    }, [simulationInputs]);

    const calculation = useMemo(() => {
        let partLotCash, partLotLoan, monthlyPayment;

        if (selectedProfile && profileData) {
            const nbUnits = simulationInputs?.nbLots || 1;
            const avgTantiemes = 1000 / nbUnits;
            const ratio = tantiemes / avgTantiemes;

            partLotCash = profileData[selectedProfile].remainingCost * ratio; // Using remainingCost as base for visual simplicity
            monthlyPayment = profileData[selectedProfile].monthlyPayment * ratio;
            partLotLoan = (profileData[selectedProfile].workShareBeforeAid - profileData[selectedProfile].remainingCost) * ratio; // Conceptual aid part? No, let's keep it simple

            // Re-deriving cleanly:
            // Work Share = profileData.workShareBeforeAid * ratio
            // Aid = (profileData.workShareBeforeAid - profileData.remainingCost) * ratio
            // Loan/Cash = profileData.remainingCost * ratio

            return {
                partLotCash: profileData[selectedProfile].remainingCost * ratio,
                partLotLoan: profileData[selectedProfile].remainingCost * ratio, // Assuming 100% financed by loan/cash mix, confusing prop names
                monthlyPayment: profileData[selectedProfile].monthlyPayment * ratio,
                durationYears: ECO_PTZ_COPRO.maxDurationYears,
                partLotTotal: profileData[selectedProfile].workShareBeforeAid * ratio,
                aid: (profileData[selectedProfile].workShareBeforeAid - profileData[selectedProfile].remainingCost) * ratio
            };
        }

        // Default legacy calculation (Global Average)
        const partLotCashCalc = (financing.remainingCost * tantiemes) / 1000;
        const partLotLoanCalc = (financing.ecoPtzAmount * tantiemes) / 1000;
        const durationMonths = ECO_PTZ_COPRO.maxDurationYears * 12;
        const monthlyPaymentCalc = partLotLoanCalc / durationMonths;

        return {
            partLotCash: partLotCashCalc,
            partLotLoan: partLotLoanCalc,
            monthlyPayment: monthlyPaymentCalc,
            durationYears: ECO_PTZ_COPRO.maxDurationYears,
            partLotTotal: (financing.remainingCost * tantiemes) / 1000, // Simplification
            aid: 0
        };
    }, [financing, tantiemes, selectedProfile, profileData, simulationInputs]);

    return (
        <Card variant="default" className={cn("overflow-visible", className)}>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gold/10 border border-gold/20">
                        <Calculator className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                        <CardTitle className="text-xl text-white">Simulateur Individuel</CardTitle>
                        <p className="text-sm text-muted">Estimez votre mensualité selon votre quote-part</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
                {/* CONTROLS */}
                <div className="space-y-8">
                    {/* Profile Selector */}
                    {simulationInputs && (
                        <div className="space-y-3">
                            <label className="text-xs uppercase tracking-wider font-medium text-muted flex items-center gap-2">
                                <PiggyBank className="w-3 h-3" /> Votre Profil Fiscal
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {PROFILE_OPTIONS.map((profile) => (
                                    <button
                                        key={profile.id}
                                        onClick={() => setSelectedProfile(selectedProfile === profile.id ? null : profile.id)}
                                        className={cn(
                                            "flex flex-col items-center justify-center py-3 rounded-xl border transition-all duration-300",
                                            selectedProfile === profile.id
                                                ? "bg-gold/10 border-gold text-white shadow-[0_0_15px_-3px_rgba(229,192,123,0.3)]"
                                                : "bg-white/5 border-white/5 text-muted hover:bg-white/10 hover:border-white/10"
                                        )}
                                    >
                                        <div className={cn("w-2 h-2 rounded-full mb-2", profile.color)} />
                                        <span className="text-[10px] uppercase font-bold tracking-wide">{profile.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tantiemes Slider */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-xs uppercase tracking-wider font-medium text-muted flex items-center gap-2">
                                <Scale className="w-3 h-3" /> Quote-part ({tantiemes}/1000)
                            </label>
                            {tantiemes === 1000 && (
                                <span className="text-[10px] text-gold font-bold uppercase tracking-wider animate-pulse">Immeuble Entier</span>
                            )}
                        </div>

                        <div className="relative h-2 w-full bg-white/10 rounded-full">
                            <input
                                type="range"
                                min={1}
                                max={1000}
                                value={tantiemes}
                                onChange={(e) => setTantiemes(Number(e.target.value))}
                                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-20"
                            />
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-gold-dark to-gold rounded-full z-10"
                                style={{ width: `${(tantiemes / 1000) * 100}%` }}
                            />
                            <div
                                className="absolute top-1/2 -translate-y-1/2 bg-white w-4 h-4 rounded-full shadow-lg z-10 pointer-events-none transition-all"
                                style={{ left: `${(tantiemes / 1000) * 100}%`, transform: `translate(-50%, -50%)` }}
                            />
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button variant="ghost" onClick={() => setTantiemes(1000)} className="text-[10px] h-7 px-2">
                                Tout l&apos;immeuble
                            </Button>
                        </div>
                    </div>
                </div>

                {/* RESULTS - Hero Card */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent rounded-3xl -m-4 border border-gold/10" />
                    <div className="relative flex flex-col items-center justify-center h-full text-center space-y-2 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted font-medium">Votre effort d&apos;épargne</p>

                        <div className="text-6xl md:text-7xl font-sans font-light text-gold tracking-tighter financial-num">
                            <AnimatedCurrency value={calculation.monthlyPayment} />
                            <span className="text-2xl text-gold/50 ml-1">€</span>
                        </div>
                        <p className="text-sm text-gold/60 font-medium">par mois pendant {calculation.durationYears} ans</p>

                        <div className="w-full h-px bg-white/10 my-6" />

                        <div className="w-full space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted">Quote-part Travaux</span>
                                <span className="text-white financial-num">{formatCurrency(calculation.partLotTotal)}</span>
                            </div>
                            {calculation.aid > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-success">Aides Déduites</span>
                                    <span className="text-success financial-num">- {formatCurrency(calculation.aid)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                                <span className="font-medium text-white">Reste à financer</span>
                                <span className="font-medium text-gold financial-num">{formatCurrency(calculation.partLotCash)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Added 'size="sm"' to Button which I didn't verify if I implemented, but standard shadcn has it.
// I implemented 'variant' but not 'size' in my Button.tsx. I should fix that to avoid type error or just remove size prop.
// I'll remove `size="sm"` and add class `h-8 px-3 text-xs` to match "sm" manually for safety.
