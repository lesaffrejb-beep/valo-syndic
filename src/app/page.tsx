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
import { InactionCostCard } from "@/components/business/InactionCostCard";
import { LegalWarning } from "@/components/business/LegalWarning";
import { EnergyInflationChart } from "@/components/EnergyInflationChart";
import { DPEGauge } from "@/components/DPEGauge";
import { FinancingBreakdownChart } from "@/components/business/charts/FinancingBreakdownChart";

import { UrgencyScore } from "@/components/UrgencyScore";

// Persuasion Components
import { TantiemeCalculator } from "@/components/business/TantiemeCalculator";
import { BenchmarkChart } from "@/components/business/BenchmarkChart";
import { MarketBenchmark } from "@/components/business/MarketBenchmark";

import { ValuationCard } from "@/components/business/ValuationCard";
import { InvestorTaxCard } from "@/components/business/InvestorTaxCard";
import { CostValueBalance } from "@/components/business/CostValueBalance";

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

    return (
        <div className="min-h-screen bg-app">
            <BrandingModal isOpen={showBrandingModal} onClose={() => setShowBrandingModal(false)} />
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onSuccess={() => {
                    // Retry save after successful auth
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
                                    /* setActiveTab("mass"); */
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
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface rounded-lg border border-boundary mb-6">
                                <span className="text-sm">🏢</span>
                                <span className="text-sm font-medium text-muted">
                                    Solution utilisée par +200 cabinets de syndic
                                </span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-main mb-4 tracking-tight">
                                Votre diagnostic patrimonial
                                <br />
                                <span className="text-gradient">en 60 secondes</span>
                            </h2>
                            <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
                                Analysez le potentiel de financement de vos travaux de rénovation
                                énergétique avec <span className="font-medium text-main">MaPrimeRénov&apos; Copropriété</span> et <span className="font-medium text-main">l&apos;Éco-PTZ</span>.
                            </p>
                        </div>

                        <div id="diagnostic-form" className="card-bento p-8 md:p-12 mb-12 shadow-none rounded-3xl">
                            {/* Import Button */}
                            <div className="flex justify-end mb-6">
                                <JsonImporter onImport={handleGhostImport} />
                            </div>

                            <DiagnosticForm onSubmit={handleSubmit} isLoading={isLoading} />
                        </div>

                        <LegalWarning variant="footer" className="mt-8" />
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
                    {result && (
                        <motion.section
                            id="results"
                            className="space-y-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                            <StaggerContainer staggerDelay={0.1} className="flex flex-col gap-6 md:gap-8">
                                {/* V3: Street View Banner */}
                                {result.input.coordinates && (
                                    <StreetViewHeader
                                        address={result.input.address || undefined}
                                        coordinates={result.input.coordinates}
                                    />
                                )}

                                {/* Summary Header */}
                                <div className="card-bento p-8 md:p-10 gap-8">
                                    <div className="flex flex-col gap-8">
                                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="px-3 py-1 bg-primary-900/30 text-primary-400 border border-primary-500/20 text-xs font-medium rounded-full">
                                                        Diagnostic Flash
                                                    </span>
                                                    <span className="text-xs text-muted">
                                                        Généré le {new Date().toLocaleDateString("fr-FR")}
                                                    </span>
                                                </div>
                                                <h2 className="text-3xl md:text-4xl font-bold text-main mb-2 tracking-tight">
                                                    📊 Évaluation Préliminaire
                                                </h2>
                                                <p className="text-muted">
                                                    {result.input.address && `${result.input.address}, `}
                                                    {result.input.city || "Votre copropriété"} •{" "}
                                                    <span className="font-medium">{result.input.numberOfUnits} lots</span>
                                                </p>
                                            </div>
                                            {/* View Mode Toggle */}
                                            <ViewModeToggle />
                                        </div>

                                        {/* New Horizontal Timeline */}
                                        <div className="w-full pt-4 border-t border-boundary/50">
                                            <DPEGauge currentDPE={result.input.currentDPE} targetDPE={result.input.targetDPE} />
                                        </div>
                                    </div>
                                </div>

                                {/* Score & Urgency Row - REMOVED/INTEGRATED */}
                                {/* 
                                     * =================================================================================
                                     * SECTION 1: LE CONTEXTE (L'URGENCE)
                                     * "Why act now?" - Climate Risk & Compliance Timeline
                                     * =================================================================================
                                     */}
                                <section className="mb-24">
                                    <div className="mb-8">
                                        <span className="text-secondary-400 font-bold uppercase tracking-widest text-xs mb-2 block animate-pulse">
                                            Urgence & Conformité
                                        </span>
                                        <h2 className="text-3xl lg:text-4xl font-black text-main leading-tight">
                                            Le monde change, <br />
                                            <span className="text-muted">votre immeuble doit s&apos;adapter.</span>
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-auto lg:h-[420px]">
                                        <div className="h-full">
                                            {result.input.coordinates && (
                                                <ClimateRiskCard coordinates={result.input.coordinates} />
                                            )}
                                        </div>
                                        <div className="h-full">
                                            <InactionCostCard inactionCost={result.inactionCost} />
                                        </div>
                                    </div>
                                </section>


                                {/* 
                                     * =================================================================================
                                     * SECTION 2: LA TRANSFORMATION (LA VALEUR)
                                     * "Turn a cost into an investment" - Valuation & ROI
                                     * =================================================================================
                                     */}
                                <section className="mb-24">
                                    <div className="mb-8 max-w-2xl">
                                        <span className="text-success-400 font-bold uppercase tracking-widest text-xs mb-2 block">
                                            Opportunité Patrimoniale
                                        </span>
                                        <h2 className="text-3xl lg:text-4xl font-black text-main leading-tight">
                                            Ne dépensez pas, <br />
                                            <span className="text-gradient-gold">investissez.</span>
                                        </h2>
                                        <p className="text-lg text-muted mt-4 leading-relaxed">
                                            La rénovation n&apos;est pas une charge, c&apos;est le seul levier pour
                                            protéger la valeur de votre bien face à l&apos;obsolescence énergétique.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-auto lg:h-[450px]">
                                        {/* 1. Valuation & ROI */}
                                        <div className="h-full">
                                            <ValuationCard
                                                valuation={result.valuation}
                                                financing={result.financing}
                                            />
                                        </div>

                                        {/* 2. Visual Balance (Consolidated CostValue) */}
                                        <div className="h-full">
                                            <CostValueBalance
                                                cost={result.financing.remainingCost}
                                                valueGain={result.valuation.greenValueGain}
                                            />
                                        </div>
                                    </div>
                                </section>


                                {/* 
                                     * =================================================================================
                                     * SECTION 3: LES MOYENS (LE FINANCEMENT)
                                     * "We have the subsidies" - Global Financing
                                     * =================================================================================
                                     */}
                                <section className="mb-24">
                                    <div className="mb-8">
                                        <span className="text-primary-400 font-bold uppercase tracking-widest text-xs mb-2 block">
                                            Ingénierie Financière
                                        </span>
                                        <h2 className="text-3xl lg:text-4xl font-black text-main leading-tight">
                                            Un financement <br />
                                            <span className="text-muted">optimisé à l&apos;euro près.</span>
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 gap-8 mb-8">
                                        {/* Main Financing Card (Full Width) */}
                                        <FinancingCard
                                            financing={result.financing}
                                            numberOfUnits={result.input.numberOfUnits}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Breakdown Chart */}
                                        <FinancingBreakdownChart financing={result.financing} />

                                        {/* Tantieme Calculator (Moved here as "Personal Check") */}
                                        <TantiemeCalculator financing={result.financing} />
                                    </div>
                                </section>


                                {/* 
                                     * =================================================================================
                                     * SECTION 4: LE COUP DE POUCE CACHÉ (PROFILS & BONUS)
                                     * "The Hidden Engine" - Detailed Subsidy Table
                                     * =================================================================================
                                     */}
                                <section className="mb-12">
                                    <div className="mb-8 text-center max-w-3xl mx-auto">
                                        <div className="inline-block p-1 px-3 rounded-full bg-primary-900/20 border border-primary-500/30 mb-4">
                                            <span className="text-primary-300 text-xs font-bold tracking-wide">
                                                ✨ LE SECRET LE MIEUX GARDÉ
                                            </span>
                                        </div>
                                        <h2 className="text-3xl font-black text-main leading-tight mb-4">
                                            Des aides individuelles <br />
                                            <span className="text-muted">jusqu&apos;à 90% de prise en charge.</span>
                                        </h2>
                                        <p className="text-muted">
                                            Au-delà des aides collectives, MaPrimeRénov&apos; Parcours Accompagné offre des primes massives
                                            pour les ménages aux revenus modestes. Vérifiez votre éligibilité.
                                        </p>
                                    </div>

                                    {/* The Full Detail Subsidy Table */}
                                    <SubsidyTable inputs={result.input} />
                                </section>






                                {/* Actions */}
                                <div className="flex flex-wrap gap-4 mt-12 justify-center items-center pt-4">
                                    <button
                                        onClick={handleReset}
                                        className="btn-secondary flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                                    >
                                        ← Nouvelle simulation
                                    </button>

                                    {/* Cloud Save Button */}
                                    <button
                                        onClick={handleSaveToCloud}
                                        disabled={isSaving}
                                        className="relative px-6 py-3 rounded-lg text-sm font-semibold
                                                 bg-primary/10 text-primary hover:bg-primary/20 
                                                 border border-primary/20 hover:border-primary/30
                                                 disabled:opacity-50 disabled:cursor-not-allowed
                                                 transition-all duration-200 shadow-lg shadow-primary/10
                                                 flex items-center gap-2 hover:scale-105"
                                    >
                                        {isSaving ? (
                                            <>
                                                <span className="animate-spin">⏳</span>
                                                <span>Sauvegarde...</span>
                                            </>
                                        ) : saveSuccess ? (
                                            <>
                                                <span>✅</span>
                                                <span>Sauvegardé !</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>💾</span>
                                                <span>Sauvegarder</span>
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={handleSave}
                                        className="btn-secondary flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                                    >
                                        💾 Exporter (.valo)
                                    </button>
                                    <DownloadPdfButton result={result} />
                                    <DownloadConvocationButton result={result} />
                                    <PptxButtonWrapper result={result} />
                                </div>

                                {/* Legal Footer */}
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
        </div>
    );
}
