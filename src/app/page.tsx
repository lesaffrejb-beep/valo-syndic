/**
 * VALO-SYNDIC — Page d'accueil
 * Dashboard de diagnostic flash immobilier.
 * Design "Neo-Bank" Premium 2025/2026
 */

"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from "framer-motion";

// Structural Components
import { SubsidyTable } from "@/components/business/SubsidyTable";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// Feature Components
import { DiagnosticForm } from "@/components/business/form/DiagnosticForm";
import { ComplianceTimeline } from "@/components/ComplianceTimeline";
import { FinancingCard } from "@/components/business/FinancingCard";
import { InactionCostCard } from "@/components/business/InactionCostCard"; // Keep for fallback or remove if unused?
import { ComparisonSplitScreen } from "@/components/business/ComparisonSplitScreen"; // [NEW] VS Component
import { LegalWarning } from "@/components/business/LegalWarning";
import { EnergyInflationChart } from "@/components/EnergyInflationChart";
import { DPEGauge } from "@/components/DPEGauge";
import { FinancingBreakdownChart } from "@/components/business/charts/FinancingBreakdownChart";

import { UrgencyScore } from "@/components/UrgencyScore";

// Narrative Components
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import { GESBadge } from "@/components/dashboard/GESBadge";
import { LegalCountdown } from "@/components/dashboard/LegalCountdown";
import { FinancialProjection } from "@/components/dashboard/FinancialProjection";
import { DPEDistributionChart } from "@/components/dashboard/DPEDistributionChart";
import { HeatingSystemAlert } from "@/components/dashboard/HeatingSystemAlert";

// Persuasion Components
import { TantiemeCalculator } from "@/components/business/TantiemeCalculator";
import { BenchmarkChart } from "@/components/business/BenchmarkChart";
import { MarketBenchmark } from "@/components/business/MarketBenchmark";

import { ValuationCard } from "@/components/business/ValuationCard";
import { InvestorTaxCard } from "@/components/business/InvestorTaxCard";
// import { CostValueBalance } from "@/components/business/CostValueBalance"; // REMOVED

import { StaggerContainer } from "@/components/ui/AnimatedCard";
import { ViewModeToggle } from "@/components/ui/ViewModeToggle";

// V3 Premium Components
import { StreetViewHeader } from "@/components/business/StreetViewHeader";
import { RisksCard } from "@/components/business/RisksCard";
import { ClimateRiskCard } from "@/components/business/ClimateRiskCard";

// God View
import { MassAudit } from "@/components/business/MassAudit";

// Core Logic
import { simulateDiagnostic } from "@/app/actions/simulate";
import { type DiagnosticInput, type DiagnosticResult, DiagnosticInputSchema, type GhostExtensionImport } from "@/lib/schemas";
import { type SimulationInputs } from "@/lib/subsidy-calculator";
import { BrandingModal } from "@/components/BrandingModal";
import { JsonImporter } from "@/components/import/JsonImporter";
import { getLocalRealEstatePrice } from "@/actions/getRealEstateData";
import { AuthModal } from "@/components/auth/AuthModal";
import { useProjectSave } from "@/hooks/useProjectSave";

// Lazy Loaded Components (Heavy Buttons)
const DownloadPdfButton = dynamic(
    () => import('@/components/pdf/DownloadPdfButton').then(mod => mod.DownloadPdfButton),
    { ssr: false, loading: () => <BtnLoading /> }
);

const DownloadConvocationButton = dynamic(
    () => import('@/components/pdf/DownloadConvocationButton').then(mod => mod.DownloadConvocationButton),
    { ssr: false, loading: () => <BtnLoading /> }
);

// Import PPTX via SSR-safe wrapper (fixes SSR issues with pptxgenjs)
import { PptxButtonWrapper } from '@/components/pdf/PptxButtonWrapper';


const BtnLoading = () => (
    <div className="btn-secondary opacity-50 cursor-not-allowed flex items-center gap-2">
        ⏳ <span className="hidden sm:inline">Chargement...</span>
    </div>
);

export default function HomePage() {
    const [result, setResult] = useState<DiagnosticResult | null>(null);
    const [currentInput, setCurrentInput] = useState<DiagnosticInput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"flash" | "mass">("flash");
    const [showBrandingModal, setShowBrandingModal] = useState(false);

    // Authentication & Save
    const { saveProject, isLoading: isSaving, showAuthModal, setShowAuthModal } = useProjectSave();
    const [saveSuccess, setSaveSuccess] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load simulation from session storage (Dashboard navigation)
    useEffect(() => {
        const loadedData = sessionStorage.getItem('valo_loaded_simulation');
        if (loadedData) {
            try {
                const { input, result: loadedResult } = JSON.parse(loadedData);
                setCurrentInput(input);
                setResult(loadedResult);
                sessionStorage.removeItem('valo_loaded_simulation');
                setTimeout(() => {
                    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            } catch (err) {
                console.error('Failed to load simulation from session:', err);
            }
        }
    }, []);

    const handleSubmit = async (data: DiagnosticInput) => {
        // Mode démo caché
        if (data.address?.toLowerCase().includes("demo")) {
            // ... (demo logic could be here if needed)
        }

        setIsLoading(true);
        setCurrentInput(data);

        // Fetch Real Estate Data if coordinates are available
        let enrichedData = { ...data };

        if (data.coordinates) {
            try {
                const marketData = await getLocalRealEstatePrice(
                    data.coordinates.latitude,
                    data.coordinates.longitude
                );

                if (marketData) {
                    enrichedData = {
                        ...enrichedData,
                        averagePricePerSqm: marketData.averagePriceSqm,
                        priceSource: "DVF (Etalab)",
                        salesCount: marketData.salesCount,
                    };
                }
            } catch (error) {
                console.error("Failed to fetch market data", error);
                // Fallback is automatic (handled in calculator)
            }
        }

        // Server Action call - protects business logic
        setTimeout(async () => {
            const response = await simulateDiagnostic(enrichedData);

            if (!response.success) {
                alert(`Erreur de calcul: ${response.error}`);
                setIsLoading(false);
                return;
            }

            setResult(response.data);
            setIsLoading(false);
            // Wait for render cycle
            setTimeout(() => {
                document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }, 500);
    };

    const handleReset = () => {
        setResult(null);
        setCurrentInput(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // === SAUVEGARDE JSON ===
    const handleSave = () => {
        if (!result || !currentInput) return;

        const saveData = {
            version: "1.0",
            savedAt: new Date().toISOString(),
            input: currentInput,
            result: result,
        };

        const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `valo-syndic_${currentInput.city || "simulation"}_${new Date().toISOString().split("T")[0]}.valo`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e: ProgressEvent<FileReader>) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                const validatedInput = DiagnosticInputSchema.parse(data.input);
                setCurrentInput(validatedInput);

                const response = await simulateDiagnostic(validatedInput);
                if (!response.success) {
                    alert(`Erreur de calcul: ${response.error}`);
                    return;
                }

                setResult(response.data);
                setTimeout(() => {
                    document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
                }, 100);
            } catch (err) {
                console.error("Erreur chargement fichier:", err);
                alert("Fichier invalide. Vérifiez le format .valo");
            }
        };
        reader.readAsText(file);
        event.target.value = "";
    };

    // === IMPORT JSON DEPUIS EXTENSION ===
    const handleGhostImport = (data: GhostExtensionImport) => {
        // Calculate total tantièmes
        const totalTantiemes = data.lots.reduce((sum, lot) => sum + lot.tantiemes, 0);

        // Show success message with stats
        const stats = `✅ ${data.lots.length} lots importés !\n\nTotal Tantièmes: ${totalTantiemes}\n\nSource: ${data.url || 'Extension Ghost'}`;
        alert(stats);

        // Scroll to form if not visible
        if (!result) {
            document.getElementById('diagnostic-form')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Handle save to Supabase
    const handleSaveToCloud = async () => {
        if (!result) return;

        const projectName = result.input.city
            ? `Simulation ${result.input.city}`
            : 'Nouvelle simulation';

        const savedId = await saveProject(result, projectName);

        if (savedId) {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }
    };

    // PREPARE INPUTS FOR SUB-COMPONENTS
    const simulationInputs: SimulationInputs | undefined = result ? {
        workAmountHT: result.financing.worksCostHT,
        amoAmountHT: result.financing.amoAmount,
        nbLots: result.input.numberOfUnits,
        energyGain: result.financing.energyGainPercent,
        initialDPE: result.input.currentDPE,
        targetDPE: result.input.targetDPE,
        isFragile: false, // Feature not yet in UI input
        ceePerLot: result.input.ceeBonus,
        localAidPerLot: result.input.localAidAmount
    } : undefined;

    // === NOUVEAU FLOW: ADDRESS SEARCH -> BOOM ===
    const handleAddressSelect = (data: {
        address: string;
        postalCode: string;
        city: string;
        coordinates?: { longitude: number; latitude: number };
        dpeData?: any;
    }) => {
        // 1. Construct Diagnostic Input from DPE Data
        const dpe = data.dpeData;
        const currentDPE = (dpe?.etiquette_dpe as "A" | "B" | "C" | "D" | "E" | "F" | "G") || "F"; // Pessimist default
        const currentGES = (dpe?.etiquette_ges as "A" | "B" | "C" | "D" | "E" | "F" | "G") || undefined;

        // Target is usually B or C (2 steps better)
        const targetDPE = currentDPE === "G" || currentDPE === "F" ? "C" : "B";

        const input: DiagnosticInput = {
            address: data.address,
            postalCode: data.postalCode,
            city: data.city,
            coordinates: data.coordinates,

            numberOfUnits: 20, // Default hypothesis if unknown
            currentDPE: currentDPE,
            currentGES: currentGES,
            co2Emissions: dpe?.etiquette_ges ? undefined : undefined, // Could map if numeric value available
            targetDPE: targetDPE,

            estimatedCostHT: 25000 * 20, // Rough estimate ~25k/unit

            // Financial Defaults
            averagePricePerSqm: 3500, // Will be enriched by API
            priceSource: "Estimation",

            // Subsidy Defaults
            ceeBonus: 3000,
            investorRatio: 40,
            commercialLots: 0,
            localAidAmount: 0,
            alurFund: 0,
        };

        // 2. Trigger Simulation
        handleSubmit(input);
    };

    return (
        <div className="min-h-screen bg-app">
            <BrandingModal isOpen={showBrandingModal} onClose={() => setShowBrandingModal(false)} />
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onSuccess={() => {
                    if (result) {
                        handleSaveToCloud();
                    }
                }}
            />

            <Header
                onOpenBranding={() => setShowBrandingModal(true)}
                onSave={handleSave}
                onLoad={handleLoad}
                hasResult={!!result}
                fileInputRef={fileInputRef}
                onOpenAuth={() => setShowAuthModal(true)}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
                {/* Mode Selector */}
                {!result && (
                    <div className="flex justify-center mb-12">
                        <div className="p-1 bg-surface border border-boundary rounded-xl flex gap-1">
                            <button
                                onClick={() => setActiveTab("flash")}
                                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "flash"
                                    ? "bg-primary-900 text-primary-400 shadow-glow border border-primary-500/30"
                                    : "text-muted hover:text-main"
                                    }`}
                            >
                                ⚡ Diagnostic Flash
                            </button>
                            <button
                                onClick={() => {
                                    window.alert("Fonctionnalité disponible en V3\n\nL'audit de parc sera disponible prochainement.");
                                }}
                                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "mass"
                                    ? "bg-primary-900 text-primary-400 shadow-glow border border-primary-500/30"
                                    : "text-muted hover:text-main"
                                    }`}
                            >
                                🌐 Audit de Parc
                            </button>
                        </div>
                    </div>
                )}

                {/* Hero Section Flash */}
                {!result && activeTab === "flash" && (
                    <section className="mb-12">
                        <div className="text-center mb-10">
                            <h2 className="text-5xl md:text-6xl font-black text-main mb-6 tracking-tight leading-tight">
                                Ne gérez plus des charges.
                                <br />
                                <span className="text-gradient">Pilotez un investissement.</span>
                            </h2>
                            <p className="text-xl text-muted max-w-2xl mx-auto leading-relaxed mb-10">
                                Entrez l&apos;adresse de votre copropriété.
                                <br />
                                Notre IA détecte instantanément le potentiel financier caché.
                            </p>

                            {/* SEARCH BAR BOOM */}
                            <div className="max-w-xl mx-auto relative z-20">
                                <div className="p-1.5 rounded-2xl bg-surface border border-boundary shadow-2xl shadow-primary-900/20">
                                    <AddressAutocomplete
                                        className="w-full"
                                        placeholder="📍 Tapez l'adresse de l'immeuble..."
                                        onSelect={handleAddressSelect}
                                    />
                                </div>
                                <div className="mt-4 flex justify-center gap-4 text-xs text-muted">
                                    <span className="flex items-center gap-1">⚡ Analyse instantanée</span>
                                    <span className="flex items-center gap-1">🔒 Données sécurisées</span>
                                    <span className="flex items-center gap-1">🏛️ Source Gouv.fr</span>
                                </div>
                            </div>
                        </div>

                        {/* Hidden Import for Power Users */}
                        <div className="flex justify-center opacity-50 hover:opacity-100 transition-opacity">
                            <JsonImporter onImport={handleGhostImport} />
                        </div>

                        <LegalWarning variant="footer" className="mt-12" />
                    </section>
                )}

                {/* Hero Section Mass Audit */}
                {!result && activeTab === "mass" && (
                    <section className="mb-12">
                        <MassAudit />
                        <LegalWarning variant="footer" className="mt-8" />
                    </section>
                )}

                {/* Results Section */}
                <AnimatePresence mode="wait">
                    {result && simulationInputs && (
                        <motion.section
                            id="results"
                            className="space-y-16"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                            <StaggerContainer staggerDelay={0.1} className="flex flex-col gap-24 md:gap-32">

                                {/* 
                                 * =================================================================================
                                 * ACTE 1: LE DIAGNOSTIC (L'URGENCE)
                                 * "Etat des Lieux" - DPE F vs C, Benchmark, Countdown
                                 * =================================================================================
                                 */}
                                <div className="space-y-8">
                                    {/* Street View Banner */}
                                    {result.input.coordinates && (
                                        <StreetViewHeader
                                            address={result.input.address || undefined}
                                            coordinates={result.input.coordinates}
                                        />
                                    )}

                                    {/* Header Card DPE */}
                                    <div className="card-bento p-8 md:p-10 gap-8">
                                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 flex-wrap gap-y-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="px-3 py-1 bg-white/5 border border-white/10 text-xs font-semibold rounded-full uppercase tracking-wider text-muted">
                                                        Diagnostic Vital
                                                    </span>
                                                </div>
                                                <h2 className="text-3xl md:text-4xl font-black text-main mb-2 tracking-tight">
                                                    État des Lieux
                                                </h2>
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-muted">
                                                        {result.input.address && `${result.input.address}, `}
                                                        {result.input.city} • {result.input.numberOfUnits} lots
                                                    </p>
                                                    {/* BOOM: Social Proof */}
                                                    <p className="text-xs font-semibold text-danger-400 bg-danger-950/30 border border-danger-900/50 px-2 py-1 rounded-md w-fit">
                                                        ⚠ 85% des immeubles du quartier sont mieux classés.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {/* BOOM: GES Badge */}
                                                {result.input.currentGES && (
                                                    <GESBadge
                                                        gesLetter={result.input.currentGES}
                                                        gesValue={result.input.co2Emissions ?? 0}
                                                    />
                                                )}

                                            </div>
                                        </div>

                                        <div className="w-full pt-8 border-t border-boundary/50 mt-8">
                                            <DPEGauge currentDPE={result.input.currentDPE} targetDPE={result.input.targetDPE} />
                                        </div>
                                    </div>

                                    {/* Benchmark & Chrono Grid */}
                                    <div className="space-y-6">
                                        {/* NEW: DPE Distribution Chart — L'EGO */}
                                        <DPEDistributionChart
                                            currentDPE={result.input.currentDPE}
                                            city={result.input.city}
                                            postalCode={result.input.postalCode}
                                        />

                                        {/* Original Benchmark & Timeline */}
                                        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                                            <div className="flex-1 h-full">
                                                {/* Benchmark Card */}
                                                <BenchmarkChart currentDPE={result.input.currentDPE} className="h-full" />
                                            </div>
                                            <div className="flex-1 h-full">
                                                <ComplianceTimeline
                                                    currentDPE={result.input.currentDPE}
                                                    className="h-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                {/* 
                                 * =================================================================================
                                 * ACTE 1.5: LE CHOC (LEGAL COUNTDOWN)
                                 * bannière sombre "Interdiction de louer"
                                 * =================================================================================
                                 */}
                                <div className="w-full">
                                    <LegalCountdown dpeLetter={result.input.currentDPE} className="w-full shadow-2xl shadow-red-900/20" />
                                </div>


                                {/* 
                                 * =================================================================================
                                 * ACTE 2: LE COÛT (LA DOULEUR)
                                 * "L'Érosion Patrimoniale" - Split Screen VS
                                 * =================================================================================
                                 */}
                                <div className="space-y-8">
                                    <div className="text-center max-w-2xl mx-auto mb-8">
                                        <span className="text-danger-400 font-bold uppercase tracking-widest text-xs mb-3 block animate-pulse">
                                            Le Coût de l&apos;Inaction
                                        </span>
                                        <h2 className="text-3xl md:text-5xl font-black text-main leading-tight">
                                            L&apos;immobilisme vous coûte <br />
                                            <span className="text-danger">de l&apos;argent chaque jour.</span>
                                        </h2>
                                    </div>

                                    {/* THE SPLIT SCREEN COMPARATOR */}
                                    <ComparisonSplitScreen
                                        inactionCost={result.inactionCost}
                                        valuation={result.valuation}
                                        financing={result.financing}
                                    />

                                    {/* Inflation Context */}
                                    <div className="w-full opacity-80 hover:opacity-100 transition-opacity">
                                        <EnergyInflationChart currentCost={result.inactionCost.currentCost} />
                                    </div>
                                </div>


                                {/* 
                                 * =================================================================================
                                 * ACTE 3: LA VALEUR (L'APPÂT)
                                 * "Transformation en Investissement"
                                 * =================================================================================
                                 */}
                                {/* Act 3 is partially covered by the split screen right side, but let's reinforce it with Value details */}
                                {/* SECTION "VALEUR VERTE" REMOVED - MERGED INTO SPLIT SCREEN */}


                                {/* 
                                 * =================================================================================
                                 * ACTE 4: LA RÉVÉLATION (LE MOTEUR CACHÉ)
                                 * "Financement Global + Subsidy Sniper" - BENTO GRID
                                 * =================================================================================
                                 */}
                                <div className="space-y-8">
                                    <div className="text-center max-w-3xl mx-auto mb-8">
                                        <span className="px-3 py-1 bg-gradient-to-r from-primary-900/50 to-primary-800/20 border border-primary-500/30 rounded-full text-xs font-bold text-primary-300 uppercase tracking-wider mb-4 inline-block">
                                            Ingénierie Financière
                                        </span>
                                        <h2 className="text-3xl md:text-5xl font-black text-main leading-none mb-6">
                                            Le Financement &quot;Sniper&quot;
                                        </h2>
                                        <p className="text-lg text-muted">
                                            Notre algorithme a détecté les aides spécifiques à votre copropriété et
                                            à chaque profil individuel.
                                        </p>
                                    </div>

                                    {/* BENTO GRID LAYOUT - RESTRUCTURED */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min">

                                        {/* NEW: Heating System Alert — L'OPPORTUNITÉ */}
                                        <div className="md:col-span-12 order-1">
                                            <HeatingSystemAlert
                                                heatingType="gaz"
                                                // TODO: Remplacer par la vraie donnée du DPE si disponible
                                                // heatingType={result.input.heatingType}
                                            />
                                        </div>

                                        {/* 1. HERO CONTENT: SUBSIDY TABLE (Full Width) */}
                                        <div className="md:col-span-12 order-2">
                                            <SubsidyTable inputs={simulationInputs} />
                                        </div>

                                        {/* 2. FINANCING PIE (Left) - Span 8 */}
                                        <div className="md:col-span-12 lg:col-span-8 card-obsidian min-h-[350px] order-3">
                                            <h3 className="text-xl font-bold text-main mb-6 flex items-center gap-2">
                                                🌍 Financement Global
                                            </h3>
                                            <FinancingBreakdownChart financing={result.financing} />
                                        </div>

                                        {/* 3. KEY METRICS (Right) - Span 4 - Stacked Squares */}
                                        <div className="md:col-span-12 lg:col-span-4 flex flex-col md:flex-row lg:flex-col gap-6 order-4 h-full">
                                            {/* Taux Courture - Redesigned */}
                                            <div className="card-obsidian bg-success-900/10 border-success-500/20 flex-1 flex flex-row items-center p-6 gap-5 relative overflow-hidden group hover:border-success-500/40 transition-all">
                                                <div className="absolute inset-0 bg-success-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                                <div className="w-14 h-14 rounded-2xl bg-success-500/10 flex items-center justify-center flex-shrink-0 border border-success-500/20 text-3xl shadow-sm">
                                                    🛡️
                                                </div>

                                                <div>
                                                    <p className="text-4xl font-black text-white tracking-tighter leading-none mb-1">
                                                        {Math.round((1 - (result.financing.remainingCost / result.financing.totalCostHT)) * 100)}%
                                                    </p>
                                                    <p className="text-sm font-bold text-success-300 leading-tight">Taux de couverture</p>
                                                    <p className="text-[10px] text-success-400/60 uppercase tracking-wide mt-1">Prêt 0% inclus</p>
                                                </div>
                                            </div>

                                            {/* Bonus Hunter - Redesigned */}
                                            <div className="card-obsidian bg-primary-900/10 border-primary-500/20 flex-1 p-6 relative overflow-hidden flex flex-col justify-center hover:border-primary-500/40 transition-all">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-[50px] rounded-full pointer-events-none" />

                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-xl border border-primary-500/20">
                                                        🎁
                                                    </div>
                                                    <h4 className="text-sm font-bold text-primary-300 uppercase tracking-wider">
                                                        Bonus Capturés
                                                    </h4>
                                                </div>

                                                <ul className="space-y-3">
                                                    {(result.input.currentDPE === 'F' || result.input.currentDPE === 'G') && (
                                                        <li className="flex items-center gap-3 text-sm font-medium text-white/90">
                                                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] font-bold border border-emerald-500/30">✓</div>
                                                            Sortie de Passoire
                                                        </li>
                                                    )}
                                                    {result.financing.energyGainPercent >= 50 && (
                                                        <li className="flex items-center gap-3 text-sm font-medium text-white/90">
                                                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] font-bold border border-emerald-500/30">✓</div>
                                                            Rénovation Globale
                                                        </li>
                                                    )}
                                                    {result.financing.ceeAmount > 0 && (
                                                        <li className="flex items-center gap-3 text-sm font-medium text-white/90">
                                                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] font-bold border border-emerald-500/30">✓</div>
                                                            Primes CEE
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                {/* 
                                 * =================================================================================
                                 * ACTE 5: L'INDIVIDUALISATION (LE "MOI")
                                 * "Votre Effort Réel" - Tantieme Calculator with Profile Link
                                 * =================================================================================
                                 */}
                                <div className="space-y-8 pb-12">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                        <div>
                                            <h2 className="text-3xl font-black text-main mb-2">Votre Réalité</h2>
                                            <p className="text-muted text-lg">Simulez votre mensualité précise en fonction de votre situation.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <div className="lg:col-span-2 space-y-6">
                                            {/* Financial Projection - The "Closing" */}
                                            {result.input.currentDPE && result.input.address && ( // Only if we have some data
                                                <FinancialProjection
                                                    dpeData={{
                                                        numero_dpe: "",
                                                        etiquette_dpe: result.input.currentDPE,
                                                        etiquette_ges: result.input.currentGES || "C",
                                                        conso_kwh_m2_an: 250, // default if missing
                                                        annee_construction: 1970,
                                                        surface_habitable: 65, // typical T3
                                                        date_etablissement: new Date().toISOString(),
                                                        cout_total_ttc: result.inactionCost.currentCost / result.input.numberOfUnits // Estimate per unit
                                                    }}
                                                    className="w-full bg-surface-raised border-primary-500/20 shadow-glow mb-6"
                                                />
                                            )}

                                            <TantiemeCalculator
                                                financing={result.financing}
                                                simulationInputs={simulationInputs}
                                            />
                                        </div>
                                        <div className="lg:col-span-1 space-y-4">
                                            {/* Call to Actions */}
                                            <div className="card-bento p-6 flex flex-col justify-center items-center text-center h-full gap-4 bg-primary-900/5 hover:bg-primary-900/10 transition-colors border-primary-500/20">
                                                <h3 className="font-bold text-main">Prêt à voter ?</h3>
                                                <p className="text-sm text-muted">Téléchargez la synthèse pour votre AG.</p>
                                                <div className="flex flex-col gap-3 w-full">
                                                    <DownloadPdfButton result={result} />
                                                    <button
                                                        onClick={handleSaveToCloud}
                                                        className="w-full py-2.5 rounded-lg text-sm font-semibold border border-boundary/50 hover:bg-surface-hover transition-colors"
                                                    >
                                                        Sauvegarder le projet
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <LegalWarning variant="banner" className="mt-8" />
                            </StaggerContainer>
                        </motion.section>
                    )}
                </AnimatePresence>
            </main>

            <Footer
                onSave={() => {
                    handleSave();
                }}
                onLoad={() => fileInputRef.current?.click()}
                hasResult={!!result}
            />
        </div >
    );
}
