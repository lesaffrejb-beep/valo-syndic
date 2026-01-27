/**
 * VALO-SYNDIC — Page d'accueil
 * Dashboard de diagnostic flash immobilier.
 * Design "Neo-Bank" Premium 2025/2026
 */

"use client";

import { useState } from "react";
import { DiagnosticForm } from "@/components/DiagnosticForm";
import { ComplianceTimeline } from "@/components/ComplianceTimeline";
import { FinancingCard } from "@/components/FinancingCard";
import { InactionCostCard } from "@/components/InactionCostCard";
import { LegalWarning } from "@/components/LegalWarning";
import { EnergyInflationChart } from "@/components/EnergyInflationChart";
import { DPEGauge } from "@/components/DPEGauge";
import { FinancingBreakdownChart } from "@/components/FinancingBreakdownChart";
import { ArgumentairePanel } from "@/components/ArgumentairePanel";
import { UrgencyScore } from "@/components/UrgencyScore";
import { generateDiagnostic } from "@/lib/calculator";
import { LEGAL } from "@/lib/constants";
import { type DiagnosticInput, type DiagnosticResult } from "@/lib/schemas";

export default function HomePage() {
    const [result, setResult] = useState<DiagnosticResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (data: DiagnosticInput) => {
        setIsLoading(true);

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
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-primary-50/30">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/80 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                                <span className="text-white font-bold text-xl">V</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 tracking-tight">VALO-SYNDIC</h1>
                                <p className="text-xs text-gray-500">Diagnostic Flash Copropriété</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-success-50 rounded-full border border-success-200">
                                <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></span>
                                <span className="text-xs font-medium text-success-700">Calcul 100% local</span>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400">v{LEGAL.version}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                {!result && (
                    <section className="mb-12">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full border border-primary-100 mb-6">
                                <span className="text-sm">🏆</span>
                                <span className="text-sm font-medium text-primary-700">
                                    Outil utilisé par +200 syndics en France
                                </span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                                Votre plan de valorisation
                                <br />
                                <span className="text-gradient">en 60 secondes</span>
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                                Découvrez le potentiel de financement de vos travaux de rénovation
                                énergétique grâce à <span className="font-medium">MaPrimeRénov' Copropriété</span> et <span className="font-medium">l'Éco-PTZ</span>.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 md:p-10">
                            <DiagnosticForm onSubmit={handleSubmit} isLoading={isLoading} />
                        </div>

                        <LegalWarning variant="footer" className="mt-8" />
                    </section>
                )}

                {/* Results Section */}
                {result && (
                    <section id="results" className="space-y-8 animate-fade-in">
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
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">DPE Actuel</p>
                                        <div
                                            className={`dpe-badge dpe-badge-${result.input.currentDPE.toLowerCase()} transform hover:scale-110 transition-transform`}
                                        >
                                            {result.input.currentDPE}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-3xl text-gray-300">→</span>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">DPE Cible</p>
                                        <div
                                            className={`dpe-badge dpe-badge-${result.input.targetDPE.toLowerCase()} transform hover:scale-110 transition-transform ring-2 ring-offset-2 ring-success-500`}
                                        >
                                            {result.input.targetDPE}
                                        </div>
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

                        {/* Argumentaire Panel */}
                        <ArgumentairePanel result={result} />

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <button
                                onClick={handleReset}
                                className="btn-secondary flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                            >
                                ← Nouvelle simulation
                            </button>
                            <button
                                onClick={() => alert("Génération PDF à venir (Phase 3)")}
                                className="btn-primary flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-primary-500/30"
                            >
                                📄 Télécharger le rapport AG
                            </button>
                        </div>

                        {/* Legal Footer */}
                        <LegalWarning variant="banner" />
                    </section>
                )}
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
