/**
 * VALO-SYNDIC — Page d'accueil
 * Dashboard de diagnostic flash immobilier.
 * Design "Neo-Bank" Premium 2025/2026
 */

"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import { pdf } from "@react-pdf/renderer"; // Removed manual generation

// Composants existants
import { DiagnosticForm } from "@/components/DiagnosticForm";
import { ComplianceTimeline } from "@/components/ComplianceTimeline";
import { FinancingCard } from "@/components/FinancingCard";
import { InactionCostCard } from "@/components/InactionCostCard";
import { LegalWarning } from "@/components/LegalWarning";
import { EnergyInflationChart } from "@/components/EnergyInflationChart";
import { DPEGauge } from "@/components/DPEGauge";
import { FinancingBreakdownChart } from "@/components/FinancingBreakdownChart";
import { ArgumentairePanel } from "@/components/ArgumentairePanel";
import { DownloadPdfButton } from "@/components/pdf/DownloadPdfButton";
import { UrgencyScore } from "@/components/UrgencyScore";

// Nouveaux composants Persuasion
import { TantiemeCalculator } from "@/components/business/TantiemeCalculator";
import { BenchmarkChart } from "@/components/business/BenchmarkChart";
import { ObjectionHandler } from "@/components/business/ObjectionHandler";
import { VoteQR, generateQRDataUrl } from "@/components/pdf/VoteQR";
import { ReportTemplate } from "@/components/pdf/ReportTemplate";
import { AnimatedButton, StaggerContainer, StaggerItem } from "@/components/ui/AnimatedCard";

import { generateDiagnostic } from "@/lib/calculator";
import { LEGAL } from "@/lib/constants";
import { type DiagnosticInput, type DiagnosticResult, DiagnosticInputSchema } from "@/lib/schemas";

export default function HomePage() {
    const [result, setResult] = useState<DiagnosticResult | null>(null);
    const [currentInput, setCurrentInput] = useState<DiagnosticInput | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (data: DiagnosticInput) => {
        setIsLoading(true);
        setCurrentInput(data);

        // Simulation d'un temps de calcul (pour le feedback utilisateur)
        setTimeout(() => {
            const diagnostic = generateDiagnostic(data);
            setResult(diagnostic);
            setIsLoading(false);

            // Scroll vers les résultats
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
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);

                // Validation avec Zod
                const validatedInput = DiagnosticInputSchema.parse(data.input);

                // Régénérer le diagnostic avec les données chargées
                setCurrentInput(validatedInput);
                const diagnostic = generateDiagnostic(validatedInput);
                setResult(diagnostic);

                // Scroll vers les résultats
                setTimeout(() => {
                    document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
                }, 100);
            } catch (err) {
                console.error("Erreur chargement fichier:", err);
                alert("Fichier invalide. Vérifiez le format .valo");
            }
        };
        reader.readAsText(file);

        // Reset input pour permettre de recharger le même fichier
        event.target.value = "";
    };



    return (
        <div className="min-h-screen bg-[#f9fafb]">
            {/* Header — Glass & Steel */}
            <header className="glass sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-gradient-to-br from-primary-800 to-primary-900 rounded-lg flex items-center justify-center shadow-premium">
                                <span className="text-white font-serif font-bold text-xl">V</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight font-serif">VALO-SYNDIC</h1>
                                <p className="text-xs text-slate-500">Diagnostic Patrimonial</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Boutons Sauvegarder/Charger */}
                            <div className="hidden sm:flex items-center gap-2">
                                <button
                                    onClick={handleSave}
                                    disabled={!result}
                                    className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Sauvegarder la simulation"
                                >
                                    💾 Sauvegarder
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-800 hover:bg-slate-100 rounded-lg transition-colors"
                                    title="Charger une simulation"
                                >
                                    📂 Charger
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".valo,.json"
                                    onChange={handleLoad}
                                    className="hidden"
                                />
                            </div>

                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-success-50 rounded-lg border border-success-200">
                                <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></span>
                                <span className="text-xs font-medium text-success-600">Calcul 100% local</span>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400">v{LEGAL.version}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Hero Section */}
                {!result && (
                    <section className="mb-12">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg border border-slate-200 mb-6">
                                <span className="text-sm">🏛️</span>
                                <span className="text-sm font-medium text-slate-700">
                                    Solution utilisée par +200 cabinets de syndic
                                </span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight font-serif">
                                Votre diagnostic patrimonial
                                <br />
                                <span className="text-gradient">en 60 secondes</span>
                            </h2>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                                Analysez le potentiel de financement de vos travaux de rénovation
                                énergétique avec <span className="font-medium text-slate-800">MaPrimeRénov' Copropriété</span> et <span className="font-medium text-slate-800">l'Éco-PTZ</span>.
                            </p>
                        </div>

                        <div className="card-bento p-8 md:p-12 mb-12 shadow-none rounded-3xl">
                            <DiagnosticForm onSubmit={handleSubmit} isLoading={isLoading} />
                        </div>

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
                            <StaggerContainer staggerDelay={0.1}>
                                {/* Summary Header */}
                                <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                                                    Diagnostic Flash
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    Généré le {new Date().toLocaleDateString("fr-FR")}
                                                </span>
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                                📊 Évaluation Préliminaire
                                            </h2>
                                            <p className="text-gray-600">
                                                {result.input.address && `${result.input.address}, `}
                                                {result.input.city || "Votre copropriété"} •{" "}
                                                <span className="font-medium">{result.input.numberOfUnits} lots</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <p className="label-technical mb-1">DPE Actuel</p>
                                                <div className="flex justify-center">
                                                    <DPEGauge score={result.input.currentDPE} />
                                                </div>
                                                <p className="text-sm font-medium mt-2 tabular-nums">{result.input.currentDPE} kWh/m²/an</p>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-3xl text-gray-300">→</span>
                                            </div>
                                            <div className="text-center">
                                                <p className="label-technical mb-1">DPE Cible</p>
                                                <div className="flex justify-center">
                                                    <DPEGauge score={result.input.targetDPE} />
                                                </div>
                                                <p className="text-sm font-medium mt-2 tabular-nums">{result.input.targetDPE} kWh/m²/an</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Score & Gauge Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <UrgencyScore
                                        compliance={result.compliance}
                                        currentDPE={result.input.currentDPE}
                                    />
                                    <DPEGauge
                                        currentDPE={result.input.currentDPE}
                                        targetDPE={result.input.targetDPE}
                                    />
                                </div>

                                {/* 🆕 Calculateur Tantièmes + Benchmark */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <TantiemeCalculator financing={result.financing} />
                                    <BenchmarkChart currentDPE={result.input.currentDPE} city={result.input.city} />
                                </div>

                                {/* Charts Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <EnergyInflationChart currentCost={result.input.estimatedCostHT} />
                                    <FinancingBreakdownChart financing={result.financing} />
                                </div>

                                {/* Financing & Timeline Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <ComplianceTimeline currentDPE={result.input.currentDPE} />
                                    <FinancingCard
                                        financing={result.financing}
                                        numberOfUnits={result.input.numberOfUnits}
                                    />
                                </div>

                                {/* Inaction Cost - Full Width */}
                                <InactionCostCard inactionCost={result.inactionCost} />

                                {/* 🆕 Avocat du Diable */}
                                <ObjectionHandler />

                                {/* Argumentaire Panel */}
                                <ArgumentairePanel result={result} />

                                {/* 🆕 QR Code Vote en séance */}
                                <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">📱 Vote en Séance</h3>
                                            <p className="text-gray-600 text-sm">
                                                Projetez ce QR Code lors de l'AG pour recueillir l'avis consultatif des copropriétaires en temps réel.
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                💡 Astuce : Ne pas envoyer par mail, projeter en séance pour maximiser l'impact.
                                            </p>
                                        </div>
                                        <VoteQR simulationId={`SIM_${Date.now()}`} size={120} />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
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
                                </div>

                                {/* Legal Footer */}
                                <LegalWarning variant="banner" />
                            </StaggerContainer>
                        </motion.section>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-gray-600 font-bold text-sm">V</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">VALO-SYNDIC</p>
                                <p className="text-xs text-gray-500">Outil d'aide à la décision • 2026</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            {/* Mobile save/load buttons */}
                            <div className="flex sm:hidden items-center gap-2">
                                <button
                                    onClick={handleSave}
                                    disabled={!result}
                                    className="px-2 py-1 text-xs text-gray-500 hover:text-primary-600 disabled:opacity-50"
                                >
                                    💾
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-2 py-1 text-xs text-gray-500 hover:text-primary-600"
                                >
                                    📂
                                </button>
                            </div>
                            <a
                                href="/legal"
                                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Mentions légales
                            </a>
                            <span className="text-gray-300">|</span>
                            <span className="text-xs text-gray-400">
                                Données réglementaires au {LEGAL.lastUpdate.toLocaleDateString("fr-FR")}
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
