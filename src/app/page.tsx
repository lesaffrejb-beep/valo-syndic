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

// [NEW] Data Reveal Features
import { useAddressSearch } from "@/hooks/useAddressSearch";
import { DPEDistributionChart } from "@/components/dashboard/DPEDistributionChart";
import { HeatingSystemAlert } from "@/components/dashboard/HeatingSystemAlert";

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

// Persuasion Components
import { TantiemeCalculator } from "@/components/business/TantiemeCalculator";
// import { BenchmarkChart } from "@/components/business/BenchmarkChart"; // REMOVED
import { MarketBenchmark } from "@/components/business/MarketBenchmark";

import { ValuationCard } from "@/components/business/ValuationCard";
import { InvestorTaxCard } from "@/components/business/InvestorTaxCard";
// import { CostValueBalance } from "@/components/business/CostValueBalance"; // REMOVED

import { StaggerContainer } from "@/components/ui/AnimatedCard";


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

    // --- AJOUT : Gestion de l'état de recherche (Data Reveal) ---
    const { query, setQuery, suggestions: results, isLoading: isSearching, selectAddress: searchAddress } = useAddressSearch();
    const [selectedProperty, setSelectedProperty] = useState<any>(null);
    const [showResults, setShowResults] = useState(false);
    const [manualMode, setManualMode] = useState(true); // [FIX] Mode manuel activé par défaut

    // Fonction quand on clique sur une suggestion
    const handleSelectAddress = async (property: any) => {
        const dpeData = property.dpeData;
        setSelectedProperty(property);
        setQuery(property.label);
        setShowResults(false);

        // [MODIFICATION] Pré-remplissage du formulaire au lieu de simulation auto
        // On construit l'objet pour initialData
        const initialFormState: Partial<DiagnosticInput> & { dpeData?: any } = {
            address: property.label,
            postalCode: property.postcode,
            city: property.city,
            currentDPE: (dpeData?.etiquette_dpe as any) || "F",
            dpeData: dpeData
        };

        // Scroll vers le formulaire pour inviter à compléter
        setTimeout(() => {
            document.getElementById('diagnostic-form-container')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);

        // On passe les données au formulaire via state dédié ou prop (à ajouter dans render)
        // Ici on stocke dans selectedProperty qui servira de source
        setSelectedProperty({
            ...property,
            initialFormState
        });
    };
    // ----------------------------------------------

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
                            <h2 className="text-4xl md:text-5xl font-bold text-main mb-4 tracking-tight">
                                Ne gérez plus des charges.
                                <br />
                                <span className="text-gradient">Pilotez un investissement.</span>
                            </h2>
                            <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
                                Votre diagnostic patrimonial de copropriété en temps réel.
                                Révélez le potentiel financier caché derrière la rénovation énergétique.
                            </p>
                        </div>

                        <div id="diagnostic-form" className="card-bento p-8 md:p-12 mb-12 shadow-none rounded-3xl">


                            {/* --- BLOC RECHERCHE INTELLIGENTE (Remplace DiagnosticForm) --- */}
                            <div className="relative z-50 w-full max-w-2xl mx-auto py-8">
                                <h3 className="text-center text-main font-semibold mb-4">Recherchez votre copropriété</h3>
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        setShowResults(true);
                                        // searchAddress déclenché par le hook via useEffect sur query, 
                                        // mais ici on update juste le query. Le hook gère le debounce.
                                    }}
                                    placeholder="Tapez l'adresse de l'immeuble..."
                                    className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C6A96C] transition-all"
                                />

                                {/* Liste des résultats (Suggestions) */}
                                {showResults && results && results.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto z-[100]">
                                        {results.map((item: any, index: number) => (
                                            <button
                                                key={index}
                                                onClick={() => searchAddress(item).then(() => handleSelectAddress(item))}
                                                className="w-full text-left p-3 hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                                            >
                                                <span className="text-[#C6A96C]">📍</span>
                                                <div className="flex-1">
                                                    <div className="text-white text-sm font-medium">{item.label}</div>
                                                    <div className="text-xs text-gray-500">{item.city}</div>
                                                </div>
                                                {/* Note: item.dpeData n'est dispo qu'après sélection normalement,
                                                    mais ici on utilise les résultats auto-complétion. 
                                                    Le hook useAddressSearch ne retourne dpeData que sur select.
                                                    On adapte : le badge DPE s'affichera une fois sélectionné.
                                                */}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Lien "Saisir manuellement" si pas de sélection */}
                                {!selectedProperty && !manualMode && (
                                    <div className="text-center mt-4 animate-fade-in">
                                        <button
                                            onClick={() => setManualMode(true)}
                                            className="text-sm text-gray-500 hover:text-white underline underline-offset-4 transition-colors"
                                        >
                                            Je ne trouve pas mon adresse / Saisir manuellement
                                        </button>
                                    </div>
                                )}
                            </div>
                            {/* ----------------------------------- */}

                            <div id="diagnostic-form-container" className={`transition-all duration-500 ease-in-out ${(selectedProperty || manualMode) ? 'opacity-100 max-h-[2000px] mt-8' : 'opacity-50 max-h-0 overflow-hidden'}`}>
                                {(selectedProperty || manualMode) && (
                                    <div className="border-t border-white/10 pt-8 animate-fade-in-up">
                                        {selectedProperty ? (
                                            <h4 className="text-center text-muted mb-6">👇 Vérifiez et Validez les données 👇</h4>
                                        ) : (
                                            <div className="flex justify-between items-center mb-6">
                                                <h4 className="text-muted">Saisie Manuelle</h4>
                                                <button onClick={() => setManualMode(false)} className="text-xs text-red-400 hover:text-red-300">Fermer</button>
                                            </div>
                                        )}
                                        <DiagnosticForm
                                            onSubmit={handleSubmit}
                                            isLoading={isLoading}
                                            initialData={selectedProperty?.initialFormState}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Import Button moved to bottom */}
                            <div className="flex justify-center mt-8 pt-8 border-t border-white/5">
                                <div className="flex flex-col items-center gap-2">

                                    <JsonImporter onImport={handleGhostImport} />
                                </div>
                            </div>

                            {/* Fallback si on veut montrer le form vide par défaut ? Non on garde le Reveal Address First */}
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
                                                <p className="text-muted">
                                                    {result.input.address && `${result.input.address}, `}
                                                    {result.input.city} • {result.input.numberOfUnits} lots
                                                </p>
                                            </div>

                                        </div>

                                        <div className="w-full pt-8 border-t border-boundary/50 mt-8">
                                            <DPEGauge currentDPE={result.input.currentDPE} targetDPE={result.input.targetDPE} />
                                            {/* --- MODULE EGO (Visible uniquement si une propriété est sélectionnée ou simulated) --- */}
                                            {selectedProperty && (
                                                <div className="mt-8">
                                                    <DPEDistributionChart
                                                        userDPE={(selectedProperty.dpeData?.etiquette_dpe || result.input.currentDPE)}
                                                    />
                                                </div>
                                            )}
                                            {/* ------------------------------------------------------------------- */}
                                        </div>
                                    </div>

                                    {/* Compliance Timeline - Full Width */}
                                    <div className="w-full">
                                        <ComplianceTimeline
                                            currentDPE={result.input.currentDPE}
                                            className="w-full"
                                        />
                                    </div>
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

                                        {/* 1. HERO CONTENT: SUBSIDY TABLE (Full Width) */}
                                        <div className="md:col-span-12 order-1">
                                            {/* --- MODULE OPPORTUNITÉ (Détecteur de primes) --- */}
                                            {selectedProperty && (
                                                <div className="mb-6">
                                                    <HeatingSystemAlert
                                                        heatingType={selectedProperty.dpeData?.type_energie || 'gaz'}
                                                    />
                                                </div>
                                            )}
                                            {/* ----------------------------------------------- */}
                                            <SubsidyTable inputs={simulationInputs} />
                                        </div>

                                        {/* 2. FINANCING PIE (Left) - Span 6 (Half) */}
                                        <div className="md:col-span-6 card-obsidian min-h-[400px] order-2">
                                            <h3 className="text-xl font-bold text-main mb-6 flex items-center gap-2">
                                                🌍 Financement Global
                                            </h3>
                                            <FinancingBreakdownChart financing={result.financing} />
                                        </div>

                                        {/* 3. GEORISQUES LIST (Right) - Span 6 (Half) - Same Height */}
                                        <div className="md:col-span-6 order-3 h-full min-h-[400px]">
                                            <RisksCard
                                                coordinates={result.input.coordinates}
                                            />
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
                                        <div className="lg:col-span-2">
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
        </div>
    );
}
