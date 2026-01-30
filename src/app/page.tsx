/**
 * VALO-SYNDIC — Page d'accueil "Data Reveal"
 * ===========================================
 * Sprint : Intégration des composants Dashboard avec recherche d'adresse
 * UX Storytelling : Accroche → Choc → Preuve → Espoir
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import type { AddressFeature } from "@/hooks/useAddressSearch";

// Dashboard Components
import {
    GESBadge,
    LegalCountdown,
    FinancialProjection,
    HeatingSystemAlert,
    DPEDistributionChart,
} from "@/components/dashboard";

// Layout Components
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
    const {
        inputValue,
        suggestions,
        isSearching,
        isEnriching,
        selectedResult,
        error,
        handleInputChange,
        selectAddress,
        clearSuggestions,
        reset,
    } = useAddressSearch();

    const [showSuggestions, setShowSuggestions] = useState(true);

    // Handle address selection
    const handleSelectAddress = async (feature: AddressFeature) => {
        await selectAddress(feature);
        setShowSuggestions(false);
        clearSuggestions();
    };

    // Handle reset
    const handleReset = () => {
        reset();
        setShowSuggestions(true);
    };

    // Mock data for demo (à remplacer par les vraies données quand disponibles)
    const mockData = {
        totalCost: 250000,
        totalAids: 112500,
        numberOfUnits: 20,
        heatingType: "gaz" as const,
    };

    return (
        <div className="min-h-screen bg-app">
            <Header
                onOpenBranding={() => {}}
                onSave={() => {}}
                onLoad={() => {}}
                hasResult={false}
                fileInputRef={{ current: null }}
                onOpenAuth={() => {}}
            />

            <main className="container-custom py-24 min-h-screen">
                {/* =================================================================
                 * PHASE 1 : L'ACCROCHE (Search)
                 * "Découvrez la vérité sur votre copropriété"
                 * ================================================================= */}
                {!selectedResult && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-4xl mx-auto"
                    >
                        {/* Hero Title */}
                        <div className="text-center mb-12 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="inline-block px-4 py-2 bg-surface border border-boundary rounded-full"
                            >
                                <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                                    ⚡ Data Reveal
                                </span>
                            </motion.div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-main tracking-tight leading-none">
                                Découvrez la vérité sur
                                <br />
                                <span className="text-gradient">votre copropriété</span>
                            </h1>

                            <p className="text-xl text-muted max-w-2xl mx-auto leading-relaxed">
                                Entrez une adresse pour révéler les données cachées : performance énergétique,
                                urgence légale, et potentiel financier.
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <div className="card-bento p-8 shadow-glow">
                                <div className="relative">
                                    {/* Input */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => {
                                                handleInputChange(e.target.value);
                                                setShowSuggestions(true);
                                            }}
                                            placeholder="12 rue des Lices, Angers..."
                                            className="input text-lg h-16 pr-24"
                                            autoComplete="off"
                                        />

                                        {/* Loading Spinner */}
                                        {(isSearching || isEnriching) && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-3 p-3 bg-danger-50 border border-danger-500/30 rounded-xl text-sm text-danger-500"
                                        >
                                            ⚠️ {error}
                                        </motion.div>
                                    )}

                                    {/* Suggestions Dropdown */}
                                    <AnimatePresence>
                                        {showSuggestions && suggestions.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute left-0 right-0 top-full mt-2 bg-surface border border-boundary rounded-2xl overflow-hidden shadow-2xl z-50"
                                            >
                                                <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
                                                    {suggestions.map((suggestion) => (
                                                        <button
                                                            key={suggestion.properties.id}
                                                            onClick={() => handleSelectAddress(suggestion)}
                                                            className="w-full text-left px-4 py-3 rounded-xl hover:bg-surface-hover transition-all group"
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                                                    <span className="text-primary text-lg">📍</span>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-main font-medium truncate">
                                                                        {suggestion.properties.name}
                                                                    </p>
                                                                    <p className="text-sm text-muted truncate">
                                                                        {suggestion.properties.postcode} {suggestion.properties.city}
                                                                    </p>
                                                                </div>
                                                                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <span className="text-primary">→</span>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Helper Text */}
                                <p className="text-sm text-muted mt-4 text-center">
                                    💡 Tapez au moins 3 caractères pour lancer la recherche
                                </p>
                            </div>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                            {[
                                {
                                    icon: "⚡",
                                    title: "Instantané",
                                    description: "Résultats en temps réel depuis les bases ADEME et Gouv",
                                },
                                {
                                    icon: "🔒",
                                    title: "Sécurisé",
                                    description: "Données publiques, aucune information personnelle collectée",
                                },
                                {
                                    icon: "🎯",
                                    title: "Précis",
                                    description: "Analyse sur-mesure de votre copropriété",
                                },
                            ].map((feature, index) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    className="card-bento p-6 text-center group hover:border-primary/30"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                                        <span className="text-2xl">{feature.icon}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-main mb-2">{feature.title}</h3>
                                    <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* =================================================================
                 * PHASE 2 : LE CHOC + LA PREUVE + L'ESPOIR (Reveal)
                 * Bento Grid avec tous les composants dashboard
                 * ================================================================= */}
                <AnimatePresence>
                    {selectedResult && (
                        <motion.section
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="space-y-12"
                        >
                            {/* Header avec adresse sélectionnée */}
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h2 className="text-4xl font-black text-main mb-2">
                                        {selectedResult.city}
                                    </h2>
                                    <p className="text-lg text-muted">{selectedResult.normalizedAddress}</p>
                                    <p className="text-sm text-subtle mt-1">
                                        Code postal : {selectedResult.postalCode}
                                    </p>
                                </div>
                                <button
                                    onClick={handleReset}
                                    className="btn-secondary"
                                >
                                    ← Nouvelle recherche
                                </button>
                            </div>

                            {/* SI DPE TROUVÉ : Afficher le Dashboard */}
                            {selectedResult.hasDPEData && selectedResult.dpeData ? (
                                <>
                                    {/*
                                     * ==========================================================
                                     * ACTE 1 : LE CHOC (Urgence)
                                     * Zone 1 : LegalCountdown (Large)
                                     * Zone 2 : GESBadge (Carbone oublié)
                                     * ==========================================================
                                     */}
                                    <div className="space-y-6">
                                        <div className="text-center max-w-2xl mx-auto">
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.2 }}
                                                className="inline-block px-4 py-2 bg-danger-900/20 border border-danger-500/30 rounded-full mb-4"
                                            >
                                                <span className="text-sm font-bold text-danger-400 uppercase tracking-wider">
                                                    🚨 Urgence
                                                </span>
                                            </motion.div>
                                            <h3 className="text-3xl md:text-4xl font-black text-main">
                                                L&apos;Horloge Tourne
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                            {/* LegalCountdown : Span 3 colonnes (priorité visuelle) */}
                                            <div className="lg:col-span-3">
                                                <LegalCountdown
                                                    currentDPE={selectedResult.dpeData.etiquette_dpe || "G"}
                                                    className="h-full"
                                                />
                                            </div>

                                            {/* GESBadge : Span 2 colonnes (double peine) */}
                                            <div className="lg:col-span-2">
                                                <GESBadge
                                                    gesLetter={selectedResult.dpeData.etiquette_ges || "G"}
                                                    showDetails={true}
                                                    className="h-full"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/*
                                     * ==========================================================
                                     * ACTE 2 : LA PREUVE (Context)
                                     * Zone 3 : DPEDistributionChart (Benchmark quartier)
                                     * Zone 4 : HeatingSystemAlert (Levier technique)
                                     * ==========================================================
                                     */}
                                    <div className="space-y-6">
                                        <div className="text-center max-w-2xl mx-auto">
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.4 }}
                                                className="inline-block px-4 py-2 bg-warning-900/20 border border-warning-500/30 rounded-full mb-4"
                                            >
                                                <span className="text-sm font-bold text-warning-400 uppercase tracking-wider">
                                                    📊 Benchmark
                                                </span>
                                            </motion.div>
                                            <h3 className="text-3xl md:text-4xl font-black text-main">
                                                Votre Position dans le Quartier
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Distribution Chart */}
                                            <DPEDistributionChart
                                                currentDPE={selectedResult.dpeData.etiquette_dpe || "G"}
                                                postalCode={selectedResult.postalCode}
                                                city={selectedResult.city}
                                            />

                                            {/* Heating Alert */}
                                            <HeatingSystemAlert heatingType={mockData.heatingType} />
                                        </div>
                                    </div>

                                    {/*
                                     * ==========================================================
                                     * ACTE 3 : L'ESPOIR (Solution)
                                     * Zone 5 : FinancialProjection (Effort mensuel acceptable)
                                     * ==========================================================
                                     */}
                                    <div className="space-y-6">
                                        <div className="text-center max-w-2xl mx-auto">
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.6 }}
                                                className="inline-block px-4 py-2 bg-success-900/20 border border-success-500/30 rounded-full mb-4"
                                            >
                                                <span className="text-sm font-bold text-success-400 uppercase tracking-wider">
                                                    💰 Solution
                                                </span>
                                            </motion.div>
                                            <h3 className="text-3xl md:text-4xl font-black text-main mb-4">
                                                Transformer le Problème en Investissement
                                            </h3>
                                            <p className="text-lg text-muted">
                                                Voici l&apos;effort réel mensuel par lot sur 15 ans (Éco-PTZ inclus)
                                            </p>
                                        </div>

                                        <div className="max-w-3xl mx-auto">
                                            <FinancialProjection
                                                totalCost={mockData.totalCost}
                                                totalAids={mockData.totalAids}
                                                numberOfUnits={mockData.numberOfUnits}
                                                showDetails={true}
                                            />
                                        </div>
                                    </div>

                                    {/* Call to Action */}
                                    <div className="card-bento p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 text-center">
                                        <h4 className="text-2xl font-bold text-main mb-4">
                                            Prêt à passer à l&apos;action ?
                                        </h4>
                                        <p className="text-muted mb-6 max-w-2xl mx-auto">
                                            Obtenez un diagnostic complet avec simulation de financement personnalisée
                                            pour votre copropriété.
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                            <button className="btn-primary">
                                                📊 Simulation complète
                                            </button>
                                            <button className="btn-secondary">
                                                📞 Demander un rendez-vous
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* SI AUCUN DPE TROUVÉ : Fallback UI */
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="max-w-2xl mx-auto"
                                >
                                    <div className="card-bento p-12 text-center space-y-6">
                                        <div className="w-20 h-20 rounded-2xl bg-warning-900/20 flex items-center justify-center mx-auto">
                                            <span className="text-4xl">🔍</span>
                                        </div>

                                        <div>
                                            <h3 className="text-2xl font-bold text-main mb-3">
                                                Aucune donnée DPE trouvée
                                            </h3>
                                            <p className="text-lg text-muted mb-6">
                                                Nous n&apos;avons pas trouvé de diagnostic de performance énergétique
                                                pour cette adresse dans notre base de données.
                                            </p>
                                        </div>

                                        <div className="bg-surface-hover rounded-xl p-6 text-left space-y-4">
                                            <p className="text-sm text-muted">
                                                <strong className="text-main">Pourquoi cette adresse n&apos;apparaît pas ?</strong>
                                            </p>
                                            <ul className="text-sm text-muted space-y-2 list-disc list-inside">
                                                <li>Le DPE n&apos;a pas encore été publié dans la base ADEME</li>
                                                <li>L&apos;immeuble est récent (construction après 2021)</li>
                                                <li>Le diagnostic est en cours de réalisation</li>
                                            </ul>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                            <button onClick={handleReset} className="btn-primary">
                                                ← Nouvelle recherche
                                            </button>
                                            <button className="btn-secondary">
                                                📧 Nous signaler cette adresse
                                            </button>
                                        </div>
                                    </div>

                                    {/* Statistiques ville quand même */}
                                    <div className="mt-8">
                                        <div className="text-center mb-6">
                                            <p className="text-sm text-muted">
                                                💡 En attendant, voici les statistiques de votre ville
                                            </p>
                                        </div>
                                        <DPEDistributionChart
                                            currentDPE="D"
                                            postalCode={selectedResult.postalCode}
                                            city={selectedResult.city}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </motion.section>
                    )}
                </AnimatePresence>
            </main>

            <Footer
                onSave={() => {}}
                onLoad={() => {}}
                hasResult={false}
            />
        </div>
    );
}
