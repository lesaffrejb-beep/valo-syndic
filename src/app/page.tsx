/**
 * VALO-SYNDIC — Homepage "Stealth Wealth" Scrollytelling
 * =====================================================
 * Design Philosophy: Obsidian + Gold - "Luxe Discret"
 * Narrative Flow: ANCRAGE → DOULEUR → VISION → LOGIQUE → PERSONNEL → ACTION
 *
 * REDESIGN 02/02/2026: Narration Linéaire (Scrollytelling)
 * - L'utilisateur ne voit qu'une chose à la fois
 * - Le scroll déclenche la révélation (Fade In Up)
 * - Pas de Bento Grid, pas de dashboard illisible
 */

"use client";

import { useEffect, useState, useCallback, useMemo, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, FileText, Presentation, MessageCircle } from 'lucide-react';

// --- CORE IMPORTS ---
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { generateDiagnostic } from '@/lib/calculator';
import { isMprCoproSuspended, getMarketTrend } from '@/lib/market-data';
import { useViewModeStore } from '@/stores/useViewModeStore';
import type { SavedSimulation, DiagnosticInput, DiagnosticResult } from '@/lib/schemas';
import type { DPELetter } from '@/lib/constants';
import type { SimulationInputs } from '@/lib/subsidy-calculator';

// --- UI COMPONENTS ---
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';

// --- BUSINESS COMPONENTS ---
import { StreetViewHeader } from '@/components/business/StreetViewHeader';
import { MprSuspensionAlert } from '@/components/business/MprSuspensionAlert';
import { HeatingSystemAlert } from '@/components/business/HeatingSystemAlert';
import { RisksCard } from '@/components/business/RisksCard';
import { InactionCostCard } from '@/components/business/InactionCostCard';
import { ComparisonSplitScreen } from '@/components/business/ComparisonSplitScreen';
import { ValuationCard } from '@/components/business/ValuationCard';
import { BenchmarkChart } from '@/components/business/BenchmarkChart';
import { FinancingCard } from '@/components/business/FinancingCard';
import { SubsidyTable } from '@/components/business/SubsidyTable';
import { TantiemeCalculator } from '@/components/business/TantiemeCalculator';
import { TransparentReceipt } from '@/components/business/TransparentReceipt';
import { ObjectionHandler } from '@/components/business/ObjectionHandler';
import { LegalWarning } from '@/components/business/LegalWarning';

// --- PDF COMPONENTS ---
import { DownloadPdfButton } from '@/components/pdf/DownloadPdfButton';
import { DownloadPptxButton } from '@/components/pdf/DownloadPptxButton';

// =============================================================================
// SECTION WRAPPER — Standardized Animation Container
// =============================================================================

interface SectionProps {
    children: ReactNode;
    delay?: number;
    className?: string;
    id?: string;
}

const Section = ({ children, delay = 0, className = "", id }: SectionProps) => (
    <motion.section
        id={id}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay, ease: "easeOut" }}
        className={`w-full max-w-4xl mx-auto py-20 px-6 flex flex-col gap-12 ${className}`}
    >
        {children}
    </motion.section>
);

// Section Title Component for consistent styling
interface SectionTitleProps {
    label: string;
    title: string;
    labelColor?: string;
}

const SectionTitle = ({ label, title, labelColor = "text-neutral-500" }: SectionTitleProps) => (
    <div className="text-center mb-12">
        <span className={`text-[10px] uppercase tracking-[0.3em] font-semibold ${labelColor}`}>{label}</span>
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-3">
            {title}
        </h2>
    </div>
);

// =============================================================================
// PROFILE SELECTOR — iOS Style Segmented Control
// =============================================================================

type IncomeProfile = "Blue" | "Yellow" | "Purple" | "Pink";

interface ProfileSelectorProps {
    selected: IncomeProfile | null;
    onSelect: (profile: IncomeProfile | null) => void;
}

const PROFILES: { id: IncomeProfile; label: string; color: string }[] = [
    { id: "Blue", label: "Très Modeste", color: "bg-blue-500" },
    { id: "Yellow", label: "Modeste", color: "bg-yellow-500" },
    { id: "Purple", label: "Intermédiaire", color: "bg-purple-500" },
    { id: "Pink", label: "Aisé", color: "bg-pink-500" },
];

const ProfileSelector = ({ selected, onSelect }: ProfileSelectorProps) => (
    <div className="w-full">
        <p className="text-[10px] text-neutral-500 mb-3 uppercase tracking-[0.2em] font-medium">Votre profil fiscal</p>
        <div className="flex bg-[#0A0A0A]/70 backdrop-blur-xl rounded-2xl p-1.5 border border-white/[0.08] shadow-lg">
            {PROFILES.map((profile) => (
                <button
                    key={profile.id}
                    onClick={() => onSelect(selected === profile.id ? null : profile.id)}
                    className={`flex-1 py-3.5 px-3 rounded-xl text-xs font-semibold transition-all ${selected === profile.id
                        ? 'bg-white/10 text-white shadow-lg border border-white/[0.08]'
                        : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.03]'
                        }`}
                >
                    <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${profile.color} opacity-90`} />
                    {profile.label}
                </button>
            ))}
        </div>
    </div>
);

// =============================================================================
// DEFAULT INPUT VALUES (Demo Mode)
// =============================================================================

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

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function ScrollytellingPage() {
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<SavedSimulation | null>(null);
    const [showObjections, setShowObjections] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<IncomeProfile | null>(null);
    const [showManualForm, setShowManualForm] = useState(false);
    const [isAddressSelected, setIsAddressSelected] = useState(false);

    // --- DIAGNOSTIC STATE ---
    const [diagnosticInput, setDiagnosticInput] = useState<DiagnosticInput>(DEFAULT_DIAGNOSTIC_INPUT);
    const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
    const [calculationError, setCalculationError] = useState<string | null>(null);

    // --- VIEW MODE STORE ---
    const { viewMode, getAdjustedValue } = useViewModeStore();

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

    // --- MARKET TREND ---
    const marketTrend = useMemo(() => getMarketTrend(), []);

    // --- SIMULATION INPUTS FOR SUBSIDY TABLE ---
    const simulationInputs: SimulationInputs = useMemo(() => {
        if (!diagnosticResult) {
            return {
                workAmountHT: 0,
                amoAmountHT: 0,
                nbLots: diagnosticInput.numberOfUnits,
                energyGain: 0,
                initialDPE: diagnosticInput.currentDPE,
                targetDPE: diagnosticInput.targetDPE,
                ceePerLot: 0,
                localAidPerLot: 0,
            };
        }

        const { financing } = diagnosticResult;

        return {
            workAmountHT: financing.worksCostHT,
            amoAmountHT: financing.totalCostHT - financing.worksCostHT - financing.syndicFees - financing.doFees - financing.contingencyFees,
            nbLots: diagnosticInput.numberOfUnits,
            energyGain: financing.energyGainPercent,
            initialDPE: diagnosticInput.currentDPE,
            targetDPE: diagnosticInput.targetDPE,
            ceePerLot: (diagnosticInput.ceeBonus || 0) / diagnosticInput.numberOfUnits,
            localAidPerLot: (diagnosticInput.localAidAmount || 0) / diagnosticInput.numberOfUnits,
        };
    }, [diagnosticResult, diagnosticInput]);
    // --- LOADING STATE ---
    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-neutral-500 animate-pulse font-mono tracking-[0.2em] text-xs uppercase flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-600/50 rounded-full animate-bounce" />
                    Chargement...
                </div>
            </div>
        );
    }

    // --- FALLBACK: If no result yet ---
    if (!diagnosticResult) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-neutral-500 animate-pulse font-mono tracking-[0.2em] text-xs uppercase flex items-center gap-2 justify-center mb-4">
                        <span className="w-2 h-2 bg-amber-600/50 rounded-full animate-bounce" />
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



    // ==========================================================================
    // RENDER — SCROLLYTELLING NARRATIVE
    // ==========================================================================

    return (
        <div className="min-h-screen font-sans selection:bg-gold-glow selection:text-white">

            {/* ================================================================
                ZONE 0 — THE HOOK
                ================================================================ */}
            <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-4 overflow-hidden">
                {/* Background: Hero Glow + Noise */}
                <div className="absolute inset-0 z-0 bg-hero-glow opacity-60" />

                {/* Street View with heavy overlay */}
                <div className="absolute inset-0 z-0 mix-blend-overlay opacity-40">
                    <StreetViewHeader
                        address={diagnosticInput.address}
                        coordinates={diagnosticInput.coordinates}
                    />
                </div>

                {/* MPR Suspension Alert (Fixed at top) */}
                <div className="absolute top-0 left-0 w-full z-[100]">
                    <MprSuspensionAlert isSuspended={isMprCoproSuspended()} />
                </div>

                {/* Content */}
                <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center gap-8 py-20 pt-32">

                    {/* Hero Text — Impact */}
                    <div className="text-center relative z-10">
                        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-[1.1] mb-8 drop-shadow-2xl">
                            <span className="bg-gradient-to-br from-white via-white to-white/70 bg-clip-text text-transparent">
                                Révélez le potentiel
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
                                de votre copropriété.
                            </span>
                        </h1>
                        <p className="text-neutral-400 text-lg md:text-xl font-medium max-w-lg mx-auto leading-relaxed text-balance">
                            Transformez une obligation légale en <span className="text-white decoration-gold underline decoration-2 underline-offset-4">levier patrimonial</span>.
                        </p>
                    </div>

                    {/* Address Input — Premium Floating Slab */}
                    <div className="w-full max-w-2xl relative z-[60]">
                        <AddressAutocomplete
                            defaultValue={diagnosticInput.address || ""}
                            placeholder="Entrez l'adresse de votre copropriété..."
                            className="w-full [&_input]:h-16 [&_input]:text-lg [&_input]:px-8 [&_input]:rounded-2xl [&_input]:border-white/10 [&_input]:bg-black/80 [&_input]:backdrop-blur-xl [&_input]:shadow-2xl [&_input]:transition-all [&_input]:duration-300 focus:[&_input]:border-gold/50 focus:[&_input]:shadow-neon-gold"
                            onSelect={(data) => {
                                setIsAddressSelected(true);
                                setDiagnosticInput((prev) => ({
                                    ...prev,
                                    address: data.address,
                                    postalCode: data.postalCode,
                                    city: data.city,
                                    coordinates: data.coordinates,
                                    currentDPE: (data.dpeData?.dpe as DPELetter) || prev.currentDPE,
                                }));
                            }}
                            onManualTrigger={() => setShowManualForm(true)}
                        />

                        {/* Early Data Proof / Property Summary */}
                        <AnimatePresence>
                            {isAddressSelected && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-between gap-6"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                                            <ShieldAlert className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Zone de marché</p>
                                            <p className="text-sm font-bold text-white">{diagnosticInput.city} ({diagnosticInput.postalCode})</p>
                                        </div>
                                    </div>
                                    <div className="h-8 w-[1px] bg-white/10" />
                                    <div>
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Prix Quartier</p>
                                        <p className="text-sm font-bold text-amber-500">{diagnosticInput.averagePricePerSqm} €/m²</p>
                                    </div>
                                    <div className="h-8 w-[1px] bg-white/10" />
                                    <div className="flex flex-col items-center">
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">DPE</p>
                                        <span className={`text-xs font-black px-2 py-0.5 rounded bg-red-500 text-white`}>{diagnosticInput.currentDPE}</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Manual Form Fallback */}
                        <AnimatePresence>
                            {showManualForm && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-8 p-8 bg-zinc-900/50 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden"
                                >
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-2 flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-white tracking-tight">Saisie Manuelle</h3>
                                            <button onClick={() => setShowManualForm(false)} className="text-white/40 hover:text-white transition-colors">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">DPE Actuel</label>
                                            <select
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-amber-500/50 transition-colors appearance-none"
                                                value={diagnosticInput.currentDPE}
                                                onChange={(e) => setDiagnosticInput(prev => ({ ...prev, currentDPE: e.target.value as DPELetter }))}
                                            >
                                                {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(l => <option key={l} value={l}>{l}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Nombre de lots</label>
                                            <input
                                                type="number"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-amber-500/50 transition-colors"
                                                value={diagnosticInput.numberOfUnits}
                                                onChange={(e) => setDiagnosticInput(prev => ({ ...prev, numberOfUnits: parseInt(e.target.value) }))}
                                            />
                                        </div>

                                        <div className="col-span-2 space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Budget Travaux Estimé (€ HT)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-amber-500/50 transition-colors"
                                                value={diagnosticInput.estimatedCostHT}
                                                onChange={(e) => setDiagnosticInput(prev => ({ ...prev, estimatedCostHT: parseInt(e.target.value) }))}
                                            />
                                        </div>

                                        <button
                                            onClick={() => setShowManualForm(false)}
                                            className="col-span-2 mt-4 py-4 bg-amber-500 text-black font-black uppercase tracking-widest rounded-2xl shadow-glow hover:scale-[1.02] transition-all"
                                        >
                                            Actualiser le Diagnostic
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Scroll indicator - SIMPLIFIED */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.5 }}
                        className="mt-8"
                    >
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="text-neutral-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ================================================================
                ZONE 1 — THE DIAGNOSTIC (La Douleur)
                Theme: Risks (Red/Danger)
            ================================================================ */}
            <Section id="diagnostic" className="bg-section-gradient-1 rounded-[3rem] my-4 border border-risks/10 shadow-glow-risks">
                <div className="text-center mb-8">
                    <span className="text-xs uppercase tracking-[0.3em] text-risks font-medium">Le Diagnostic</span>
                    <h2 className="text-3xl font-bold text-neutral-200 tracking-tight mt-2">
                        Ce que révèle votre immeuble
                    </h2>
                </div>

                {/* Heating System Alert */}
                <HeatingSystemAlert heatingType={diagnosticInput.heatingSystem || null} />

                {/* Risks Card */}
                {diagnosticInput.coordinates && (
                    <div className="bg-[#0A0A0A]/60 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
                        <RisksCard coordinates={diagnosticInput.coordinates} />
                    </div>
                )}

                {/* InactionCostCard — Dominant, Warning accent */}
                <div className="bg-[#0A0A0A]/60 backdrop-blur-xl rounded-[2rem] border border-risks/20 shadow-glow-risks p-6 md:p-10">
                    <InactionCostCard inactionCost={inactionCost} />
                </div>

                {/* Benchmark Chart — Social Proof */}
                <BenchmarkChart
                    currentDPE={diagnosticInput.currentDPE}
                    city={diagnosticInput.city}
                    className="bg-[#0A0A0A]/60 backdrop-blur-xl rounded-2xl border border-white/5"
                />
            </Section>

            {/* ================================================================
                ZONE 2 — THE PROJECTION (La Vision)
                Theme: Valuation (Green/Success)
            ================================================================ */}
            <Section id="projection" className="bg-section-gradient-2 rounded-[3rem] my-4 border border-valuation/10 shadow-glow-valuation">
                <div className="text-center mb-8">
                    <span className="text-xs uppercase tracking-[0.3em] text-valuation font-medium">La Projection</span>
                    <h2 className="text-3xl font-bold text-white tracking-tight mt-2">
                        Avant / Après : le point de bascule
                    </h2>
                </div>

                <ComparisonSplitScreen
                    inactionCost={inactionCost}
                    valuation={valuation}
                    financing={financing}
                />
            </Section>

            {/* ================================================================
                ZONE 3 — THE FINANCING PLAN (La Logique)
                Theme: Finance (Gold)
            ================================================================ */}
            <Section id="finance" className="bg-section-gradient-3 rounded-[3rem] my-4 border border-gold/10 shadow-glow-finance">
                <div className="text-center mb-8">
                    <span className="text-xs uppercase tracking-[0.3em] text-gold font-medium">Le Financement</span>
                    <h2 className="text-3xl font-bold text-white tracking-tight mt-2">
                        Une rentabilité immédiate
                    </h2>
                </div>

                {/* Financing Card — The "Breakdown" and "Bottom Line" */}
                {/* Add standard Bento padding wrapper */}
                <div className="bg-[#0A0A0A]/60 backdrop-blur-xl rounded-[2rem] border border-emerald-500/10 shadow-glow-finance p-8 md:p-12">
                    <FinancingCard
                        financing={financing}
                        numberOfUnits={diagnosticInput.numberOfUnits}
                    />
                </div>

                {/* Subsidy Table — The PROOF */}
                <div className="mt-8">
                    <SubsidyTable inputs={simulationInputs} />
                </div>
            </Section>

            {/* ================================================================
                ZONE 4 — THE PERSONAL IMPACT (Le Personnel)
                Theme: Deep Blue/Indigo (Trust)
            ================================================================ */}
            <Section id="my-pocket" className="bg-indigo-950/10 rounded-[3rem] my-4 border border-indigo-500/10 shadow-tactile relative overflow-hidden">
                {/* Background decorative blob */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="flex flex-col items-center justify-center gap-6 mb-12 relative z-10 text-center">
                    <div>
                        <span className="text-xs uppercase tracking-[0.3em] text-indigo-400 font-medium">Votre Poche</span>
                        <h2 className="text-3xl font-bold text-white tracking-tight mt-2">
                            Ce que ça change pour vous
                        </h2>
                    </div>

                    {/* GLOBAL VIEW TOGGLE for this section */}
                    <div className="bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10 flex">
                        <button
                            onClick={() => useViewModeStore.getState().setViewMode('immeuble')}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${viewMode === 'immeuble'
                                ? 'bg-indigo-500 text-white shadow-lg'
                                : 'text-neutral-500 hover:text-white'
                                }`}
                        >
                            Immeuble
                        </button>
                        <button
                            onClick={() => useViewModeStore.getState().setViewMode('maPoche')}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${viewMode === 'maPoche'
                                ? 'bg-indigo-500 text-white shadow-lg'
                                : 'text-neutral-500 hover:text-white'
                                }`}
                        >
                            Mon Lot
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-6 relative z-10">
                    {/* 1. Valuation Card (Top) */}
                    <div className="bg-[#0A0A0A]/60 backdrop-blur-xl rounded-[2.5rem] border border-indigo-500/20 shadow-glow-valuation p-8 md:p-10 flex flex-col justify-center w-full">
                        <ValuationCard
                            valuation={valuation}
                            financing={financing}
                            className="bg-transparent border-none shadow-none h-full"
                        />
                    </div>

                    {/* 2. Tantieme Calculator (Bottom) */}
                    <div className="bg-[#0A0A0A]/60 backdrop-blur-xl rounded-[2.5rem] border border-indigo-500/20 shadow-glow-finance w-full">
                        <TantiemeCalculator
                            financing={financing}
                            simulationInputs={simulationInputs}
                            className="bg-transparent border-none shadow-none h-full"
                        />
                    </div>
                </div>

                {/* REMOVED DUPLICATE PROFILE SELECTOR */}
            </Section>

            {/* ================================================================
                ZONE 5 — THE CALL TO ACTION (L'Action)
                Vibe: Concluant, Urgence positive
            ================================================================ */}
            <Section id="action">
                <div className="text-center mb-10">
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
                        Ne laissez pas dormir<br />
                        <span className="text-amber-500">votre patrimoine.</span>
                    </h2>
                    <p className="text-neutral-400 text-lg max-w-lg mx-auto">
                        Votre immeuble a un potentiel inattendu. Téléchargez votre rapport complet pour le présenter en AG.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-6">
                    {/* Action Buttons Row */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
                        {/* 1. Objections Button */}
                        <button
                            onClick={() => setShowObjections(!showObjections)}
                            className="h-14 px-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold transition-all flex items-center gap-2"
                        >
                            <MessageCircle className="w-5 h-5 text-neutral-400" />
                            <span>{showObjections ? "Masquer les arguments" : "Arguments pour l'AG"}</span>
                        </button>

                        {/* 2. Primary Download Report */}
                        <DownloadPdfButton
                            result={diagnosticResult}
                            variant="primary"
                            className="h-14 px-8 text-lg rounded-2xl shadow-glow-finance bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-2"
                        />

                        {/* 3. PowerPoint */}
                        <DownloadPptxButton
                            result={diagnosticResult}
                            className="h-14 px-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-4 mt-8 opacity-60">
                        <LegalWarning />
                    </div>

                    <AnimatePresence>
                        {showObjections && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="w-full max-w-2xl overflow-hidden"
                            >
                                <div className="pt-8">
                                    <ObjectionHandler />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>


                </div>
            </Section >
        </div >
    );
}

// Add these to global css or tailwind config if missing
// .shadow-glow-risks { ... }
// .shadow-glow-finance { ... }
// .shadow-glow-valuation { ... }
