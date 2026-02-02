/**
 * VALO-SYNDIC — Homepage "Obsidian Cockpit" V2.0
 * ====================================================================
 * Design Philosophy: "Stealth Wealth" — Obsidian + Gold + Electric Blue
 * Narrative Flow: PEUR → SOLUTION → GAIN
 *
 * AUDIT 01/02/2026: Complete redesign following LE_CENTRE.md principles
 * - Hero Metric dominates (75€/mois)
 * - Bento Grid tells a story
 * - Glassmorphism 2.0 with colored glows
 * - Data freshness indicators
 * - Accounting-grade proof (ReceiptLedger)
 */

"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Activity, ShieldAlert, X, Download } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import type { SavedSimulation, DiagnosticInput, DiagnosticResult } from '@/lib/schemas';

// NEW COMPONENTS - Stealth Wealth Redesign
import { HeroMetric } from '@/components/business/HeroMetric';
import { SubsidySniper } from '@/components/business/SubsidySniper';
import { ReceiptLedger } from '@/components/business/ReceiptLedger';
import { ValueShield } from '@/components/business/ValueShield';

// EXISTING COMPONENTS (Kept)
import { MprSuspensionAlert } from '@/components/business/MprSuspensionAlert';
import { HeatingSystemAlert } from '@/components/business/HeatingSystemAlert';
import { MarketLiquidityAlert } from '@/components/business/MarketLiquidityAlert';
import { ComplianceTimeline } from '@/components/ComplianceTimeline';
import { RisksCard } from '@/components/business/RisksCard';
import { ObjectionHandler } from '@/components/business/ObjectionHandler';
import { MagicalAddressInput } from '@/components/ui/MagicalAddressInput';
import { InactionCostCard } from '@/components/business/InactionCostCard';

// UTILITIES
import { isMprCoproSuspended, getLocalPassoiresShare, getMarketTrend } from '@/lib/market-data';
import { generateDiagnostic } from '@/lib/calculator';
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

export default function CockpitPage() {
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
    const runCalculation = useCallback((input: DiagnosticInput) => {
        try {
            setCalculationError(null);
            const result = generateDiagnostic(input);
            setDiagnosticResult(result);
        } catch (err) {
            console.error("Calculation error:", err);
            setCalculationError(err instanceof Error ? err.message : "Erreur de calcul");
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

    // Total subsidies for SubsidySniper
    const totalSubsidies = financing.mprAmount + financing.ceeAmount + financing.amoAmount + financing.localAidAmount;

    // Estimated monthly energy savings (rough estimate)
    const estimatedEnergySavings = Math.round(financing.monthlyPayment * 0.4);

    // --- RENDER ---
    return (
        <div className="min-h-screen bg-obsidian text-white font-sans pb-48 bg-noise selection:bg-gold/30 selection:text-white relative">

            <div className="max-w-[1680px] mx-auto px-6 md:px-8 lg:px-12 py-8 space-y-6 relative z-10">

                {/* HEADER: Minimal Brand + Magic Input */}
                <header className="flex flex-col items-center gap-6 py-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-gold" />
                        </div>
                        <h1 className="text-base font-mono text-white/40 tracking-[0.25em] uppercase">
                            Cockpit <span className="text-white/90">Valo-Syndic</span>
                        </h1>
                    </div>

                    <MagicalAddressInput
                        onStartSimulation={(data) => {
                            // Normalisation du type de chauffage pour le schéma
                            let normalizedHeating: "electrique" | "gaz" | "fioul" | "bois" | "urbain" | "autre" | undefined;

                            if (data.heatingSystem === 'elec') normalizedHeating = 'electrique';
                            else if (data.heatingSystem === 'gaz' || data.heatingSystem === 'fioul') normalizedHeating = data.heatingSystem;

                            setDiagnosticInput((prev) => ({
                                ...prev,
                                address: data.address || prev.address,
                                postalCode: data.postalCode || prev.postalCode,
                                city: data.city || prev.city,
                                numberOfUnits: data.numberOfUnits || prev.numberOfUnits,
                                currentDPE: (data.currentDPE as DPELetter) || prev.currentDPE,
                                targetDPE: (data.targetDPE as DPELetter) || prev.targetDPE,
                                estimatedCostHT: typeof data.estimatedCostHT === 'number' ? data.estimatedCostHT : prev.estimatedCostHT,
                                averagePricePerSqm: typeof data.pricePerSqm === 'number' ? data.pricePerSqm : prev.averagePricePerSqm,
                                heatingSystem: normalizedHeating || prev.heatingSystem,
                            }));

                            const cockpit = document.getElementById('cockpit-start');
                            if (cockpit) {
                                cockpit.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                    />
                </header>

                {/* ANCHOR FOR SCROLL */}
                <div id="cockpit-start" className="w-full h-px opacity-0" />

                {/* ZONE A: ALERTES CONTEXTUELLES */}
                <div className="space-y-3">
                    <MprSuspensionAlert isSuspended={isMprCoproSuspended()} />
                    <HeatingSystemAlert heatingType={diagnosticInput.heatingSystem} />
                    <MarketLiquidityAlert shareOfSales={getLocalPassoiresShare()} />
                </div>

                {/* ZONE HERO: THE MONEY SHOT (75€/mois) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <HeroMetric
                        monthlyPayment={financing.monthlyPayment}
                        totalCost={financing.totalCostTTC}
                        durationYears={20}
                        energySavings={estimatedEnergySavings}
                    />
                </motion.div>

                {/* BENTO GRID: PEUR → SOLUTION → GAIN (3 Columns) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* COLONNE 1: PEUR / CONTEXTE (Left - 4 cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        {/* Risk Radar */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="h-[380px]"
                        >
                            <RisksCard coordinates={diagnosticInput.coordinates} />
                        </motion.div>

                        {/* Climate Timeline */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="relative bg-charcoal bg-glass-gradient rounded-3xl border border-white/10
                                shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.1)]
                                backdrop-blur-xl overflow-hidden min-h-[400px]"
                        >
                            <div className="absolute inset-0 bg-noise opacity-[0.015] pointer-events-none" />
                            <div className="relative z-10 h-full p-6 overflow-hidden">
                                <ComplianceTimeline currentDPE={diagnosticInput.currentDPE} className="h-full" />
                            </div>
                        </motion.div>

                        {/* Cost of Inaction */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="min-h-[280px]"
                        >
                            <InactionCostCard inactionCost={inactionCost} />
                        </motion.div>
                    </div>

                    {/* COLONNE 2: SOLUTION / ENGINE (Center - 4 cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        {/* Receipt Ledger - The Accounting Proof */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="min-h-[520px] overflow-hidden"
                        >
                            <ReceiptLedger financing={financing} />
                        </motion.div>

                        {/* Subsidy Sniper */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="min-h-[500px] overflow-hidden"
                        >
                            <SubsidySniper
                                totalSubsidies={totalSubsidies}
                                totalWorkCost={financing.totalCostTTC}
                                mprAmount={financing.mprAmount}
                                ceeAmount={financing.ceeAmount}
                                amoAmount={financing.amoAmount}
                                localAidAmount={financing.localAidAmount}
                            />
                        </motion.div>
                    </div>

                    {/* COLONNE 3: GAIN / OUTCOME (Right - 4 cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        {/* Value Shield - The Patrimony Asset */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="h-auto min-h-[600px]"
                        >
                            <ValueShield
                                valuation={valuation}
                                financing={financing}
                                marketTrend={marketTrend}
                                isPassoire={isPassoire}
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
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowObjections(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            key="backdrop"
                        />

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

            {/* ZONE E: CONTROL BAR (Sticky Bottom) - REFINED */}
            <div className="fixed bottom-0 left-0 right-0 z-[80] pointer-events-none flex justify-center pb-5 perspective-[1000px]">
                <motion.div
                    initial={{ y: 100, opacity: 0, rotateX: 20 }}
                    animate={{ y: 0, opacity: 1, rotateX: 0 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 100, damping: 20 }}
                    className="pointer-events-auto w-auto min-w-[580px] bg-[#0A0B0D]/95 backdrop-blur-2xl border border-white/[0.08] rounded-full px-6 py-2.5 flex items-center gap-6 justify-between group"
                    style={{
                        boxShadow: "0 -8px 32px -16px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.06)"
                    }}
                >
                    <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent opacity-40" />

                    {/* LEFT: Status Indicator */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse shadow-[0_0_6px_rgba(212,175,55,0.6)]" />
                        <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">Cockpit Live</span>
                    </div>

                    {/* CENTER: Key Metric */}
                    <div className="flex items-center gap-3 border-x border-white/[0.06] px-6">
                        <span className="text-white/30 text-[10px] uppercase tracking-wider font-medium">
                            {viewMode === 'maPoche' ? 'Mon Effort' : 'Effort Global'}
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-white tabular-nums">
                                {Math.round(getAdjustedValue(financing.monthlyPayment))}
                            </span>
                            <span className="text-[10px] text-gold font-semibold">€/mois</span>
                        </div>
                    </div>

                    {/* RIGHT: Actions */}
                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => setShowObjections(!showObjections)}
                            className={`h-8 px-3.5 rounded-full border text-[10px] font-mono tracking-wide transition-all active:scale-95 flex items-center gap-1.5 ${showObjections ? 'bg-gold/10 border-gold/25 text-gold' : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:bg-white/[0.06] hover:text-white/70'}`}
                        >
                            <ShieldAlert className="w-3 h-3" />
                            <span>Objections</span>
                        </button>

                        <button className="h-8 px-5 rounded-full bg-gold text-obsidian border border-gold/40 text-[10px] font-bold tracking-wide transition-all active:scale-95 hover:brightness-105 flex items-center gap-1.5 shadow-[0_0_16px_-4px_rgba(212,175,55,0.35)]">
                            <Download className="w-3 h-3" />
                            EXPORT
                        </button>
                    </div>

                </motion.div>
            </div>

        </div>
    );
}
