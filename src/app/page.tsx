/**
 * VALO-SYNDIC — Homepage "Obsidian Cockpit" (High-End Tactile Version)
 * ====================================================================
 * Design Rules:
 * - Depth: shadow-inner-light + shadow-glass
 * - Texture: bg-noise + bg-glass-gradient
 * - Logic: "Stealth Wealth"
 *
 * AUDIT 01/02/2026: Full wiring to calculator.ts engine
 * - Removed MOCK data
 * - generateDiagnostic() now drives all widgets
 * - TantiemeCalculator updates trigger full recalculation
 */

"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Activity, ShieldAlert, X, Download } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import type { SavedSimulation, DiagnosticInput, DiagnosticResult } from '@/lib/schemas';
import { MprSuspensionAlert } from '@/components/business/MprSuspensionAlert';
import { MarketLiquidityAlert } from '@/components/business/MarketLiquidityAlert';
import { ClimateRiskCard } from '@/components/business/ClimateRiskCard';
import { TransparentReceipt } from '@/components/business/TransparentReceipt';
import { ValuationCard } from '@/components/business/ValuationCard';
import { InactionCostCard } from '@/components/business/InactionCostCard';
import { TantiemeCalculator } from '@/components/business/TantiemeCalculator';
import { RisksCard } from '@/components/business/RisksCard';
import { ObjectionHandler } from '@/components/business/ObjectionHandler';
import { MagicalAddressInput } from '@/components/ui/MagicalAddressInput';
import { isMprCoproSuspended, getLocalPassoiresShare, getMarketTrend } from '@/lib/market-data';
import { generateDiagnostic } from '@/lib/calculator';
import type { SimulationInputs } from '@/lib/subsidy-calculator';
import type { DPELetter } from '@/lib/constants';
import { useViewModeStore } from '@/stores/useViewModeStore';

// --- DEFAULT INPUT VALUES (Demo Mode) ---
const DEFAULT_DIAGNOSTIC_INPUT: DiagnosticInput = {
    address: "12 Rue de la Paix, 49000 Angers",
    postalCode: "49000",
    city: "Angers",
    coordinates: {
        latitude: 47.4784,
        longitude: -0.5632,
    },
    currentDPE: "F" as DPELetter,
    targetDPE: "C" as DPELetter,
    numberOfUnits: 20,
    commercialLots: 0,
    estimatedCostHT: 400000,
    averagePricePerSqm: 3200,
    priceSource: "Etalab DVF",
    salesCount: 12,
    averageUnitSurface: 65,
    localAidAmount: 10000,
    alurFund: 0,
    ceeBonus: 40000,
    investorRatio: 30,
};

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<SavedSimulation | null>(null);
    const [showObjections, setShowObjections] = useState(false);

    // --- VIEW MODE STORE (Individual vs Global values) ---
    const { viewMode, getAdjustedValue } = useViewModeStore();

    // --- DIAGNOSTIC STATE (THE ENGINE) ---
    const [diagnosticInput, setDiagnosticInput] = useState<DiagnosticInput>(DEFAULT_DIAGNOSTIC_INPUT);
    const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
    const [calculationError, setCalculationError] = useState<string | null>(null);

    // --- CALCULATION ENGINE ---
    // Runs generateDiagnostic whenever inputs change
    const runCalculation = useCallback((input: DiagnosticInput) => {
        try {
            setCalculationError(null);
            const result = generateDiagnostic(input);
            setDiagnosticResult(result);
        } catch (err) {
            console.error("Calculation error:", err);
            setCalculationError(err instanceof Error ? err.message : "Erreur de calcul");
            // Keep previous result if available, don't crash
        }
    }, []);

    // Run calculation on mount and when inputs change
    useEffect(() => {
        runCalculation(diagnosticInput);
    }, [diagnosticInput, runCalculation]);

    // --- PROJECT LOADING ---
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchProjects = async () => {
            try {
                const { data, error: fetchError } = await supabase
                    .from('simulations')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                if (fetchError) throw fetchError;
                // Select the most recent project if available
                if (data && data.length > 0) {
                    setSelectedProject(data[0]);
                }
            } catch (err) {
                console.error('Failed to fetch projects:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, [user]);

    // Update diagnostic input if a saved project is selected
    useEffect(() => {
        if (selectedProject?.json_data?.input) {
            setDiagnosticInput(selectedProject.json_data.input);
        }
    }, [selectedProject]);

    // --- CONVERT DiagnosticInput TO SimulationInputs (for TantiemeCalculator) ---
    const simulationInputs: SimulationInputs | null = useMemo(() => {
        if (!diagnosticInput || !diagnosticResult) return null;

        return {
            workAmountHT: diagnosticInput.estimatedCostHT,
            amoAmountHT: diagnosticInput.numberOfUnits * 600, // AMO forfait par lot
            nbLots: diagnosticInput.numberOfUnits,
            energyGain: diagnosticResult.financing.energyGainPercent,
            initialDPE: diagnosticInput.currentDPE,
            targetDPE: diagnosticInput.targetDPE,
            isFragile: false,
            ceePerLot: diagnosticInput.ceeBonus ? diagnosticInput.ceeBonus / diagnosticInput.numberOfUnits : 0,
            localAidPerLot: diagnosticInput.localAidAmount ? diagnosticInput.localAidAmount / diagnosticInput.numberOfUnits : 0,
        };
    }, [diagnosticInput, diagnosticResult]);

    // --- GET MARKET TREND ---
    const marketTrend = useMemo(() => getMarketTrend(), []);

    // --- LOADING STATE ---
    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-obsidian flex items-center justify-center">
                <div className="text-gold/50 animate-pulse font-mono tracking-[0.2em] text-xs uppercase flex items-center gap-2">
                    <span className="w-2 h-2 bg-gold rounded-full animate-bounce" />
                    Chargement du Cockpit...
                </div>
            </div>
        );
    }

    // --- FALLBACK: If no result yet, show placeholder ---
    if (!diagnosticResult) {
        return (
            <div className="min-h-screen bg-obsidian flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gold/50 animate-pulse font-mono tracking-[0.2em] text-xs uppercase flex items-center gap-2 justify-center mb-4">
                        <span className="w-2 h-2 bg-gold rounded-full animate-bounce" />
                        Initialisation du Diagnostic...
                    </div>
                    {calculationError && (
                        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                            <p className="text-red-400 text-sm">{calculationError}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- EXTRACT CALCULATED DATA ---
    const { financing, valuation, inactionCost } = diagnosticResult;
    const isPassoire = diagnosticInput.currentDPE === "F" || diagnosticInput.currentDPE === "G";

    // --- OBSIDIAN CARD CLASS (High-End Tactile) ---
    const CARD_CLASS = "bg-charcoal bg-glass-gradient shadow-glass border border-white/5 rounded-2xl shadow-inner-light backdrop-blur-md relative overflow-hidden group transition-all duration-300 hover:shadow-inner-depth hover:border-white/10";

    // --- RENDER ---
    return (
        <div className="min-h-screen bg-obsidian text-white font-sans pb-48 bg-noise selection:bg-gold/30 selection:text-white relative">

            <div className="max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8 space-y-8 relative z-10">

                {/* HEADER: Magical Entry Point */}
                <header className="flex flex-col items-center gap-8 py-12">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-charcoal to-obsidian border border-white/10 shadow-inner-light flex items-center justify-center">
                            <Zap className="w-5 h-5 text-gold" />
                        </div>
                        <h1 className="text-lg font-mono text-white/60 tracking-[0.3em] uppercase">
                            Cockpit <span className="text-white">Valo-Syndic</span>
                        </h1>
                    </div>

                    <MagicalAddressInput
                        onStartSimulation={(data) => {
                            console.log("Starting simulation with:", data);
                            // 1. Update DiagnosticInput State (This triggers recalculation)
                            setDiagnosticInput((prev) => ({
                                ...prev,
                                address: data.address || prev.address,
                                numberOfUnits: data.numberOfUnits || prev.numberOfUnits,
                                currentDPE: (data.currentDPE as DPELetter) || prev.currentDPE,
                                // Keep other fields, they can be edited later
                            }));

                            // 2. Scroll to Cockpit
                            const cockpit = document.getElementById('cockpit-start');
                            if (cockpit) {
                                cockpit.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                    />
                </header>

                {/* ANCHOR FOR SCROLL */}
                <div id="cockpit-start" className="w-full h-px opacity-0" />

                {/* ZONE A: ALERTES (Contextual) */}
                <div className="space-y-4">
                    <MprSuspensionAlert isSuspended={isMprCoproSuspended()} />
                    <MarketLiquidityAlert shareOfSales={getLocalPassoiresShare()} />
                </div>

                {/* THE BENTO GRID (Zones B, C, D) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto">

                    {/* ZONE B: CONTEXTE (Left - 25% - 3 cols) */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                        {/* Risk Radar */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`${CARD_CLASS} aspect-square flex flex-col justify-between`}
                        >
                            <div className="absolute inset-0 bg-glass-shine opacity-0 group-hover:opacity-10 pointer-events-none" />

                            <div className="relative z-10 p-6">
                                <h3 className="font-mono text-[10px] uppercase tracking-widest text-gold mb-1">Analyse Terrain</h3>
                                <div className="flex items-center gap-2">
                                    <Activity className="w-3 h-3 text-white/50" />
                                    <p className="text-xs text-white/50">Risques Naturels</p>
                                </div>
                            </div>

                            <div className="flex-1 flex items-center justify-center p-4">
                                <div className="scale-75 origin-center opacity-80 group-hover:opacity-100 group-hover:scale-95 transition-all duration-500">
                                    <RisksCard coordinates={diagnosticInput.coordinates} />
                                </div>
                            </div>
                        </motion.div>

                        {/* Climate Timeline */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className={`${CARD_CLASS} flex-1 flex flex-col justify-center min-h-[300px]`}
                        >
                            <div className="absolute inset-0 bg-glass-shine opacity-0 group-hover:opacity-10 pointer-events-none" />
                            <div className="relative z-10 h-full p-1">
                                <ClimateRiskCard />
                            </div>
                        </motion.div>
                    </div>

                    {/* ZONE C: ENGINE (Center - 50% - 6 cols) */}
                    <div className="lg:col-span-6 flex flex-col gap-6 h-full">
                        {/* Calculator (The Engine) - Prominent Placement */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className={`${CARD_CLASS} flex-1 border-gold/10 hover:border-gold/30 shadow-neon-gold/5`}
                            style={{
                                boxShadow: "0 20px 50px -20px rgba(0,0,0,0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)"
                            }}
                        >
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
                            <div className="absolute -inset-1 bg-gold/5 blur-3xl opacity-20 pointer-events-none" />

                            <TantiemeCalculator
                                financing={financing}
                                simulationInputs={simulationInputs || undefined}
                                className="h-full"
                            />
                        </motion.div>
                    </div>

                    {/* ZONE D: PROJECTION (Right - 25% - 3 cols) */}
                    <div className="lg:col-span-3 flex flex-col gap-6">

                        {/* Receipt / Cost Structure */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className={`${CARD_CLASS} h-auto min-h-[300px] hover:shadow-inner-depth overflow-y-auto`}
                        >
                            <div className="p-2 h-full">
                                <TransparentReceipt
                                    financing={financing}
                                />
                            </div>
                        </motion.div>

                        {/* Valuation (Gain) */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className={`${CARD_CLASS} flex-1 min-h-[350px] hover:shadow-neon-gold border-gold/10 hover:border-gold/30`}
                        >
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold/10 blur-[100px] group-hover:bg-gold/20 transition-colors duration-700" />
                            <ValuationCard
                                valuation={valuation}
                                financing={financing}
                                marketTrend={marketTrend}
                                isPassoire={isPassoire}
                            />
                        </motion.div>

                        {/* Inaction Cost */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className={`${CARD_CLASS} h-auto min-h-[200px] hover:border-danger/30 hover:shadow-[0_0_30px_-10px_rgba(239,68,68,0.2)]`}
                        >
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-danger/5 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <InactionCostCard
                                inactionCost={inactionCost}
                            />
                        </motion.div>
                    </div>

                </div>

            </div>

            {/* MODAL: OBJECTIONS HANDLER */}
            <AnimatePresence mode="wait">
                {showObjections && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[90] flex justify-end"
                        key="modal-container"
                    >
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowObjections(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            key="backdrop"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="relative h-full w-full max-w-md bg-obsidian border-l border-white/10 shadow-2xl overflow-y-auto z-[100]"
                            key="drawer"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-2">
                                        <ShieldAlert className="w-5 h-5 text-gold" />
                                        <h2 className="text-xl font-bold text-gold">Avocat du Diable</h2>
                                    </div>
                                    <button onClick={() => setShowObjections(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/50 hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <ObjectionHandler />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ZONE E: SPACESHIP CONTROL BAR (Sticky Bottom) - REDUCED & SLEEK */}
            <div className="fixed bottom-0 left-0 right-0 z-[80] pointer-events-none flex justify-center pb-6 perspective-[1000px]">
                <motion.div
                    initial={{ y: 100, opacity: 0, rotateX: 20 }}
                    animate={{ y: 0, opacity: 1, rotateX: 0 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 100, damping: 20 }}
                    className="pointer-events-auto w-auto min-w-[600px] bg-[#09090B]/90 backdrop-blur-xl border border-white/10 shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.1)] rounded-full px-8 py-3 flex items-center gap-8 justify-between group"
                >
                    {/* Glow Line Top */}
                    <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-50" />

                    {/* LEFT: Branding/Status */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gold animate-pulse shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                            <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">Cockpit Live</span>
                        </div>
                    </div>

                    {/* CENTER: SUMMARY METRIC (Ex: Effort Epargne) */}
                    <div className="flex items-center gap-4 border-x border-white/10 px-8">
                        <span className="text-white/40 text-xs uppercase tracking-wider">
                            {viewMode === 'maPoche' ? 'Mon Effort' : 'Effort Global'}
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-white">
                                {Math.round(getAdjustedValue(financing.monthlyPayment))}
                            </span>
                            <span className="text-xs text-gold">€/mois</span>
                        </div>
                    </div>

                    {/* RIGHT: Export Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowObjections(!showObjections)}
                            className={`h-9 px-4 rounded-full border hover:bg-white/10 text-xs font-mono tracking-wide transition-all active:scale-95 flex items-center gap-2 ${showObjections ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-white/5 border-white/10 text-white/60'}`}
                        >
                            <ShieldAlert className="w-3 h-3" />
                            <span>Objections</span>
                        </button>

                        <button className="h-9 px-6 rounded-full bg-gold text-obsidian border border-gold/50 shadow-[0_0_20px_-5px_rgba(212,175,55,0.4)] hover:shadow-neon-gold hover:brightness-110 text-xs font-bold tracking-wide transition-all active:scale-95 flex items-center gap-2">
                            <Download className="w-3 h-3" />
                            EXPORT
                        </button>
                    </div>

                </motion.div>
            </div>

        </div>
    );
}
