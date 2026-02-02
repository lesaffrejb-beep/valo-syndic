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
        className={`w-full max-w-5xl mx-auto py-28 px-6 flex flex-col gap-10 ${className}`}
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
            <div className="min-h-screen bg-[#020202] flex items-center justify-center">
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
            <div className="min-h-screen bg-[#020202] flex items-center justify-center">
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
        <div className="min-h-screen bg-[#020202] text-neutral-200 font-sans selection:bg-amber-600/30 selection:text-white">

            {/* ================================================================
                ZONE 0 — THE HOOK (L'Ancrage)
                Presque plein écran, centré, Street View en fond
                ================================================================ */}
            <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4">
                {/* Background: Street View with heavy dark overlay (80%) */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <StreetViewHeader
                        address={diagnosticInput.address}
                        coordinates={diagnosticInput.coordinates}
                    />
                    {/* Heavy gradient overlay for readability - 80% opacity */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/85 to-[#020202]" />
                </div>

                {/* Content */}
                <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center gap-10 py-20">
                    {/* MPR Suspension Alert (conditional) */}
                    <MprSuspensionAlert isSuspended={isMprCoproSuspended()} />

                    {/* Hero Text — More impactful typography */}
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
                            <span className="bg-gradient-to-r from-white via-white to-neutral-400 bg-clip-text text-transparent">
                                Révélez le potentiel caché
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-neutral-300 via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                                de votre copropriété.
                            </span>
                        </h1>
                        <p className="text-neutral-400 text-lg md:text-xl tracking-tight max-w-lg mx-auto leading-relaxed">
                            Transformez une dépense en investissement patrimonial sécurisé.
                        </p>
                    </div>

                    {/* Address Input — Premium, Bigger (h-14), More prominent */}
                    <div className="w-full max-w-2xl">
                        <AddressAutocomplete
                            defaultValue={diagnosticInput.address || ""}
                            placeholder="Entrez l'adresse de votre copropriété..."
                            className="w-full [&_input]:h-14 [&_input]:text-lg [&_input]:px-6 [&_input]:rounded-2xl [&_input]:border-white/10 [&_input]:bg-black/60 [&_input]:backdrop-blur-xl [&_input]:shadow-2xl"
                            onSelect={(data) => {
                                setDiagnosticInput((prev) => ({
                                    ...prev,
                                    address: data.address,
                                    postalCode: data.postalCode,
                                    city: data.city,
                                    coordinates: data.coordinates,
                                    currentDPE: (data.dpeData?.dpe as DPELetter) || prev.currentDPE,
                                }));
                            }}
                        />
                        {/* Address display below input */}
                        {diagnosticInput.address && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center mt-4 text-neutral-500 text-sm"
                            >
                                📍 {diagnosticInput.address}
                            </motion.p>
                        )}
                    </div>

                    {/* Scroll indicator */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5, duration: 0.5 }}
                        className="mt-12"
                    >
                        <div className="flex flex-col items-center gap-3 text-neutral-500">
                            <span className="text-[10px] uppercase tracking-[0.3em] font-medium">Découvrir</span>
                            <motion.div
                                animate={{ y: [0, 8, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="w-6 h-10 border border-neutral-600 rounded-full flex justify-center pt-2"
                            >
                                <div className="w-1.5 h-2.5 bg-neutral-500 rounded-full" />
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ================================================================
                ZONE 1 — THE DIAGNOSTIC (La Douleur)
                Vibe: Froid, Clinique, Urgent
            ================================================================ */}
            <Section id="diagnostic">
                <SectionTitle
                    label="Le Diagnostic"
                    title="Ce que révèle votre immeuble"
                    labelColor="text-red-500/70"
                />

                {/* Heating System Alert */}
                <HeatingSystemAlert heatingType={diagnosticInput.heatingSystem || null} />

                {/* Risks Card */}
                {diagnosticInput.coordinates && (
                    <div className="bg-[#0A0A0A]/70 backdrop-blur-xl rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden hover:border-white/[0.12] transition-colors">
                        <RisksCard coordinates={diagnosticInput.coordinates} />
                    </div>
                )}

                {/* Inaction Cost Card — Dominant, Warning accent */}
                <div className="bg-[#0A0A0A]/70 backdrop-blur-xl rounded-3xl border border-red-500/15 shadow-2xl hover:border-red-500/25 transition-colors">
                    <InactionCostCard inactionCost={inactionCost} />
                </div>

                {/* Benchmark Chart — Social Proof */}
                <BenchmarkChart
                    currentDPE={diagnosticInput.currentDPE}
                    city={diagnosticInput.city}
                    className="bg-[#0A0A0A]/70 backdrop-blur-xl rounded-3xl border border-white/[0.08] hover:border-white/[0.12] transition-colors"
                />
            </Section>

            {/* ================================================================
                ZONE 2 — THE PROJECTION (La Vision)
                Vibe: Lumineux (Gold/Bronze accents), Espoir
            ================================================================ */}
            <Section id="projection">
                <SectionTitle
                    label="La Projection"
                    title="Avant / Après : le point de bascule"
                    labelColor="text-amber-500/80"
                />

                {/* Comparison Split Screen — The Visual Tipping Point */}
                <ComparisonSplitScreen
                    inactionCost={inactionCost}
                    valuation={valuation}
                    financing={financing}
                />

                {/* Valuation Card — Focus on the positive number */}
                <ValuationCard
                    valuation={valuation}
                    financing={financing}
                    marketTrend={marketTrend}
                    isPassoire={isPassoire}
                />
            </Section>

            {/* ================================================================
                ZONE 3 — THE FINANCIAL ENGINE (La Logique)
                Vibe: Technique, Dense mais structuré, Hedge Fund dashboard
            ================================================================ */}
            <Section id="financing">
                <SectionTitle
                    label="Le Moteur Financier"
                    title="Plan de financement détaillé"
                    labelColor="text-neutral-500"
                />

                {/* Financing Card — The macro view */}
                <FinancingCard
                    financing={financing}
                    numberOfUnits={diagnosticInput.numberOfUnits}
                />

                {/* Subsidy Table — Collapsible for rhythm */}
                <details className="group">
                    <summary className="cursor-pointer flex items-center justify-between p-5 bg-[#0A0A0A]/70 backdrop-blur-xl rounded-2xl border border-white/[0.08] hover:border-white/[0.15] transition-all shadow-lg">
                        <span className="text-sm font-semibold text-neutral-200">
                            Voir le tableau comparatif des aides par profil
                        </span>
                        <span className="text-neutral-400 group-open:rotate-180 transition-transform duration-300">▼</span>
                    </summary>
                    <div className="mt-4">
                        <SubsidyTable inputs={simulationInputs} />
                    </div>
                </details>
            </Section>

            {/* ================================================================
                ZONE 4 — THE PERSONALIZATION (Le "Moi")
                Vibe: Interactif, Personnel
            ================================================================ */}
            <Section id="personalization">
                <SectionTitle
                    label="Personnalisation"
                    title="Et pour vous, concrètement ?"
                    labelColor="text-emerald-500/80"
                />

                {/* Profile Selector — iOS style tabs */}
                <ProfileSelector selected={selectedProfile} onSelect={setSelectedProfile} />

                {/* Tantieme Calculator — Most interactive component */}
                <div className="bg-[#0A0A0A]/70 backdrop-blur-xl rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden hover:border-emerald-500/20 transition-colors">
                    <TantiemeCalculator
                        financing={financing}
                        simulationInputs={simulationInputs}
                    />
                </div>

                {/* Transparent Receipt — The indisputable final result */}
                <div className="bg-[#0A0A0A]/70 backdrop-blur-xl rounded-3xl border border-white/[0.08] shadow-2xl hover:border-white/[0.12] transition-colors">
                    <TransparentReceipt financing={financing} />
                </div>
            </Section>

            {/* ================================================================
                ZONE 5 — THE CLOSING (Action)
                Important bottom padding
            ================================================================ */}
            <Section id="closing" className="pb-32">
                <SectionTitle
                    label="Passez à l'action"
                    title="Téléchargez votre rapport"
                    labelColor="text-amber-500/80"
                />

                {/* Action Buttons Grid */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {/* Primary: PDF Download */}
                    <DownloadPdfButton result={diagnosticResult} />

                    {/* Secondary: PPTX Download */}
                    <DownloadPptxButton result={diagnosticResult} />
                </div>

                {/* Legal Warning */}
                <div className="mt-12">
                    <LegalWarning variant="footer" className="opacity-40 text-[10px]" />
                </div>
            </Section>

            {/* ================================================================
                FLOATING MODULE — OBJECTION HANDLER
                Fixed bottom-right, opens side drawer
            ================================================================ */}
            <motion.button
                onClick={() => setShowObjections(true)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2 }}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center shadow-2xl hover:bg-white/10 hover:border-amber-600/30 transition-all group"
                title="Avocat du Diable — Répondre aux objections"
            >
                <MessageCircle className="w-6 h-6 text-neutral-400 group-hover:text-amber-500 transition-colors" />
            </motion.button>

            {/* Objection Handler Drawer */}
            <AnimatePresence mode="wait">
                {showObjections && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[90] flex justify-end"
                        key="objection-modal"
                    >
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowObjections(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="relative h-full w-full max-w-md bg-[#020202] border-l border-white/10 shadow-2xl overflow-y-auto z-[100]"
                        >
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-amber-600/10 border border-amber-600/20 rounded-xl flex items-center justify-center">
                                            <ShieldAlert className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-neutral-200 tracking-tight">Avocat du Diable</h2>
                                            <p className="text-xs text-neutral-500">Répondez aux objections en AG</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowObjections(false)}
                                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-neutral-500 hover:text-neutral-300"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Content */}
                                <ObjectionHandler />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
