/**
 * VALO-SYNDIC — Page d'accueil
 * Dashboard de diagnostic flash immobilier.
 * Design "Neo-Bank" Premium 2025/2026
 */

"use client";

import { useState, useRef } from "react";
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from "framer-motion";

// Structural Components
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
import { ArgumentairePanel } from "@/components/ArgumentairePanel";
import { UrgencyScore } from "@/components/UrgencyScore";

// Persuasion Components
import { TantiemeCalculator } from "@/components/business/TantiemeCalculator";
import { BenchmarkChart } from "@/components/business/BenchmarkChart";
import { ObjectionHandler } from "@/components/business/ObjectionHandler";
import { ValuationCard } from "@/components/business/ValuationCard";
import { InvestorTaxCard } from "@/components/business/InvestorTaxCard";
import { VoteQR } from "@/components/pdf/VoteQR";
import { StaggerContainer } from "@/components/ui/AnimatedCard";

// God View
import { MassAudit } from "@/components/business/MassAudit";

// Core Logic
import { generateDiagnostic } from "@/lib/calculator";
import { type DiagnosticInput, type DiagnosticResult, DiagnosticInputSchema } from "@/lib/schemas";
import { BrandingModal } from "@/components/BrandingModal";

// Lazy Loaded Components (Heavy Buttons)
const DownloadPdfButton = dynamic(
    () => import('@/components/pdf/DownloadPdfButton').then(mod => mod.DownloadPdfButton),
    { ssr: false, loading: () => <BtnLoading /> }
);

const DownloadConvocationButton = dynamic(
    () => import('@/components/pdf/DownloadConvocationButton').then(mod => mod.DownloadConvocationButton),
    { ssr: false, loading: () => <BtnLoading /> }
);

const DownloadPptxButton = dynamic(
    () => import('@/components/pdf/DownloadPptxButton').then(mod => mod.DownloadPptxButton),
    { ssr: false, loading: () => <BtnLoading /> }
);

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

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (data: DiagnosticInput) => {
        // Mode démo caché
        if (data.address?.toLowerCase().includes("demo")) {
            // ... (demo logic could be here if needed)
        }

        setIsLoading(true);
        setCurrentInput(data);

        setTimeout(() => {
            const diagnostic = generateDiagnostic(data);
            setResult(diagnostic);
            setIsLoading(false);
            document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
        }, 800);
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
        reader.onload = (e: ProgressEvent<FileReader>) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                const validatedInput = DiagnosticInputSchema.parse(data.input);
                setCurrentInput(validatedInput);
                const diagnostic = generateDiagnostic(validatedInput);
                setResult(diagnostic);
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

    return (
        <div className="min-h-screen bg-app">
            <BrandingModal isOpen={showBrandingModal} onClose={() => setShowBrandingModal(false)} />

            <Header
                onOpenBranding={() => setShowBrandingModal(true)}
                onSave={handleSave}
                onLoad={handleLoad}
                hasResult={!!result}
                fileInputRef={fileInputRef}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
                                onClick={() => setActiveTab("mass")}
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

                        <div className="card-bento p-8 md:p-12 mb-12 shadow-none rounded-3xl">
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
                                        </div>

                                        {/* New Horizontal Timeline */}
                                        <div className="w-full pt-4 border-t border-boundary/50">
                                            <DPEGauge currentDPE={result.input.currentDPE} targetDPE={result.input.targetDPE} />
                                        </div>
                                    </div>
                                </div>

                                {/* Score & Urgency Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                                    <UrgencyScore
                                        compliance={result.compliance}
                                        currentDPE={result.input.currentDPE}
                                    />
                                    {/* Legal Calendar - Moved here to fill space */}
                                    <ComplianceTimeline currentDPE={result.input.currentDPE} />
                                </div>

                                {/* Financing Plan - Full Width */}
                                <div className="w-full">
                                    <FinancingCard
                                        financing={result.financing}
                                        numberOfUnits={result.input.numberOfUnits}
                                    />
                                </div>

                                {/* Tools Row: Tantièmes + Benchmark */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                                    <TantiemeCalculator financing={result.financing} />
                                    <BenchmarkChart currentDPE={result.input.currentDPE} city={result.input.city} />
                                </div>

                                {/* Charts Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                                    <EnergyInflationChart currentCost={result.input.estimatedCostHT} />
                                    <FinancingBreakdownChart financing={result.financing} />
                                </div>

                                {/* Inaction Cost - Full Width */}
                                <InactionCostCard inactionCost={result.inactionCost} />

                                {/* 🆕 Valuation Card */}
                                <ValuationCard valuation={result.valuation} />

                                {/* Avantage Fiscal si > 40% bailleurs */}
                                {((result.input.investorRatio ?? 0) > 40) && (
                                    <InvestorTaxCard
                                        investorRatio={result.input.investorRatio}
                                        remainingCostPerUnit={result.financing.remainingCostPerUnit}
                                    />
                                )}

                                {/* 🆕 Avocat du Diable */}
                                <ObjectionHandler />

                                {/* Argumentaire Panel */}
                                <ArgumentairePanel result={result} />

                                {/* 🆕 QR Code Vote en séance */}
                                <div className="card-bento">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-main mb-2">📱 Vote en Séance</h3>
                                            <p className="text-muted text-sm">
                                                Projetez ce QR Code lors de l&apos;AG pour recueillir l&apos;avis consultatif des copropriétaires en temps réel.
                                            </p>
                                            <p className="text-xs text-subtle mt-2">
                                                💡 Astuce : Ne pas envoyer par mail, projeter en séance pour maximiser l&apos;impact.
                                            </p>
                                        </div>
                                        <div className="scale-75 md:scale-100 origin-center">
                                            <VoteQR simulationId={`SIM_${Date.now()}`} size={120} />
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-4 mt-12 justify-center items-center pt-4">
                                    <button
                                        onClick={handleReset}
                                        className="btn-secondary flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                                    >
                                        ← Nouvelle simulation
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="btn-secondary flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                                    >
                                        💾 Sauvegarder (.valo)
                                    </button>
                                    <DownloadPdfButton result={result} />
                                    <DownloadConvocationButton result={result} />
                                    <DownloadPptxButton result={result} />
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
