/**
 * DiagnosticForm — Formulaire de saisie des données
 * Avec enrichissement automatique via APIs gouvernementales
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type DPELetter } from "@/lib/constants";
import { DiagnosticInputSchema, type DiagnosticInput } from "@/lib/schemas";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import { DataSourceBadge, EnrichedDataCard } from "@/components/ui/DataSourceBadge";
import type { EnrichedProperty, EnrichmentSource } from "@/lib/api";

interface DiagnosticFormProps {
    onSubmit: (data: DiagnosticInput) => void;
    isLoading?: boolean;
}

// Données démo pour "Copro Type Angers"
const DEMO_DATA = {
    address: "15 rue de Rennes",
    postalCode: "49100",
    city: "Angers",
    currentDPE: "G" as DPELetter,
    targetDPE: "C" as DPELetter,
    numberOfUnits: 45,
    estimatedCostHT: 850000,
    averagePricePerSqm: 3200,
    averageUnitSurface: 65,
};

const DPE_OPTIONS: DPELetter[] = ["A", "B", "C", "D", "E", "F", "G"];

export function DiagnosticForm({ onSubmit, isLoading = false }: DiagnosticFormProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const formRef = useRef<HTMLFormElement>(null);

    // State pour la gestion des zones locales (49/44)
    const [localZone, setLocalZone] = useState<string | null>(null);

    // State pour les données enrichies
    const [enrichedProperty, setEnrichedProperty] = useState<Partial<EnrichedProperty> | null>(null);
    const [enrichmentSources, setEnrichmentSources] = useState<EnrichmentSource[]>([]);
    const [isEnriching, setIsEnriching] = useState(false);

    // Détection auto du Code Postal
    const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const cp = e.target.value;
        if (cp.startsWith("49")) {
            setLocalZone("ANGERS");
        } else if (cp.startsWith("44")) {
            setLocalZone("NANTES");
        } else {
            setLocalZone(null);
        }
    };

    // Callback quand une adresse est sélectionnée
    const handleAddressSelect = (data: {
        address: string;
        postalCode: string;
        city: string;
        cityCode?: string;
        coordinates?: { longitude: number; latitude: number };
    }) => {
        if (!formRef.current) return;
        const form = formRef.current;

        // Pré-remplir les champs
        const postalCodeInput = form.elements.namedItem("postalCode") as HTMLInputElement;
        const cityInput = form.elements.namedItem("city") as HTMLInputElement;

        if (postalCodeInput) {
            postalCodeInput.value = data.postalCode;
            // Déclencher la détection de zone
            if (data.postalCode.startsWith("49")) {
                setLocalZone("ANGERS");
            } else if (data.postalCode.startsWith("44")) {
                setLocalZone("NANTES");
            } else {
                setLocalZone(null);
            }
        }
        if (cityInput) {
            cityInput.value = data.city;
        }

        setIsEnriching(true);
    };

    // Callback quand l'enrichissement est terminé
    const handleEnriched = (property: Partial<EnrichedProperty> | null) => {
        setIsEnriching(false);
        if (!property) return;

        setEnrichedProperty(property);
        setEnrichmentSources(property.enrichmentSources || []);

        // Pré-remplir le prix au m² si disponible
        if (property.marketData && formRef.current) {
            const priceInput = formRef.current.elements.namedItem("averagePricePerSqm") as HTMLInputElement;
            if (priceInput && !priceInput.value) {
                priceInput.value = String(property.marketData.averagePricePerSqm);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});

        const formData = new FormData(e.currentTarget);

        const rawData = {
            address: formData.get("address") as string || undefined,
            postalCode: formData.get("postalCode") as string || undefined,
            city: formData.get("city") as string || undefined,
            currentDPE: formData.get("currentDPE") as DPELetter,
            targetDPE: formData.get("targetDPE") as DPELetter,
            numberOfUnits: parseInt(formData.get("numberOfUnits") as string, 10),
            commercialLots: formData.get("commercialLots")
                ? parseInt(formData.get("commercialLots") as string, 10)
                : 0,
            estimatedCostHT: parseFloat(formData.get("estimatedCostHT") as string),
            localAidAmount: formData.get("localAidAmount")
                ? parseFloat(formData.get("localAidAmount") as string)
                : 0,
            alurFund: formData.get("alurFund")
                ? parseFloat(formData.get("alurFund") as string)
                : 0,
            ceeBonus: formData.get("ceeBonus")
                ? parseFloat(formData.get("ceeBonus") as string)
                : 0,
            investorRatio: formData.get("investorRatio")
                ? parseFloat(formData.get("investorRatio") as string)
                : 0,
            averagePricePerSqm: formData.get("averagePricePerSqm")
                ? parseFloat(formData.get("averagePricePerSqm") as string)
                : undefined,
            averageUnitSurface: formData.get("averageUnitSurface")
                ? parseFloat(formData.get("averageUnitSurface") as string)
                : undefined,
        };

        const result = DiagnosticInputSchema.safeParse(rawData);

        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.errors.forEach((err) => {
                const path = err.path.join(".");
                fieldErrors[path] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }

        onSubmit(result.data);
    };

    // Démo Flash : pré-remplit le formulaire avec une copro type
    const loadDemo = () => {
        if (!formRef.current) return;

        const form = formRef.current;
        (form.elements.namedItem("postalCode") as HTMLInputElement).value = DEMO_DATA.postalCode;
        setLocalZone("ANGERS"); // Force update state
        (form.elements.namedItem("city") as HTMLInputElement).value = DEMO_DATA.city;
        (form.elements.namedItem("currentDPE") as HTMLSelectElement).value = DEMO_DATA.currentDPE;
        (form.elements.namedItem("targetDPE") as HTMLSelectElement).value = DEMO_DATA.targetDPE;
        (form.elements.namedItem("numberOfUnits") as HTMLInputElement).value = String(DEMO_DATA.numberOfUnits);
        (form.elements.namedItem("commercialLots") as HTMLInputElement).value = "2"; // 2 lots commerciaux
        (form.elements.namedItem("estimatedCostHT") as HTMLInputElement).value = String(DEMO_DATA.estimatedCostHT);
        (form.elements.namedItem("localAidAmount") as HTMLInputElement).value = "0";
        (form.elements.namedItem("averagePricePerSqm") as HTMLInputElement).value = String(DEMO_DATA.averagePricePerSqm);
        (form.elements.namedItem("averageUnitSurface") as HTMLInputElement).value = String(DEMO_DATA.averageUnitSurface);

        // Reset enrichment for demo
        setEnrichedProperty(null);
        setEnrichmentSources([]);
    };

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {/* Bouton Démo Flash */}
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={loadDemo}
                    className="text-sm text-primary hover:text-primary-400 hover:underline flex items-center gap-1 transition-colors"
                >
                    📋 Charger un exemple
                </button>
            </div>

            {/* Adresse avec auto-complétion */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">
                        Adresse de la copropriété
                        <span className="ml-2 text-xs text-primary">✨ Auto-complétion</span>
                    </label>
                    <AddressAutocomplete
                        placeholder="Commencez à taper une adresse..."
                        onSelect={handleAddressSelect}
                        onEnriched={handleEnriched}
                        className="w-full"
                    />
                    <input type="hidden" name="address" value={enrichedProperty?.address || ""} />
                    <p className="text-[10px] text-muted mt-1">
                        Propulsé par la Base Adresse Nationale (BAN) — Données officielles
                    </p>
                </div>

                {/* Affichage de l'enrichissement en cours */}
                <AnimatePresence>
                    {isEnriching && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-3 px-4 py-3 bg-primary/10 border border-primary/20 rounded-xl"
                        >
                            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <div>
                                <p className="text-sm font-medium text-primary">
                                    Recherche d&apos;informations...
                                </p>
                                <p className="text-xs text-primary/70">
                                    Cadastre, prix immobiliers, données locales
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Affichage des données enrichies */}
                <AnimatePresence>
                    {enrichedProperty && enrichmentSources.length > 0 && !isEnriching && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                        >
                            {/* Badge sources */}
                            <div className="flex items-center justify-between">
                                <DataSourceBadge sources={enrichmentSources} compact />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEnrichedProperty(null);
                                        setEnrichmentSources([]);
                                    }}
                                    className="text-xs text-muted hover:text-main transition-colors"
                                >
                                    Effacer
                                </button>
                            </div>

                            {/* Cartes de données enrichies */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Cadastre */}
                                {enrichedProperty.cadastre && (
                                    <EnrichedDataCard
                                        icon="🗺️"
                                        title="Parcelle"
                                        value={`${enrichedProperty.cadastre.section} ${enrichedProperty.cadastre.numero}`}
                                        source={enrichmentSources.find(s => s.name.includes("Cadastre")) || enrichmentSources[0]}
                                        description={`Surface terrain: ${enrichedProperty.cadastre.surface.toLocaleString("fr-FR")} m²`}
                                    />
                                )}

                                {/* Prix DVF */}
                                {enrichedProperty.marketData && (
                                    <EnrichedDataCard
                                        icon="💰"
                                        title="Prix local"
                                        value={enrichedProperty.marketData.averagePricePerSqm}
                                        unit="€/m²"
                                        source={enrichmentSources.find(s => s.name.includes("DVF")) || enrichmentSources[0]}
                                        description={`${enrichedProperty.marketData.transactionCount} ventes analysées`}
                                    />
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Champs code postal et ville */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">
                            Code postal
                        </label>
                        <input
                            type="text"
                            name="postalCode"
                            placeholder="49100"
                            maxLength={5}
                            className="input"
                            onChange={handlePostalCodeChange}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-muted mb-1">
                            Ville
                        </label>
                        <input
                            type="text"
                            name="city"
                            placeholder="Angers"
                            className="input"
                        />
                    </div>
                </div>
            </div>

            {/* Aides Locales Badge (Conditionnel) */}
            {localZone && (
                <div className="bg-primary-900/10 border border-primary-500/20 rounded-lg p-3 flex items-start gap-3 animate-fade-in">
                    <span className="text-xl">📍</span>
                    <div>
                        <p className="text-sm font-bold text-main">
                            Zone {localZone === "ANGERS" ? "Angers Loire Métropole" : "Nantes Métropole"} détectée
                        </p>
                        <p className="text-xs text-muted mt-1">
                            Pensez à vérifier les aides locales spécifiques (Mieux Chez Moi, etc.).
                        </p>
                    </div>
                </div>
            )}

            {/* DPE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">
                        DPE actuel <span className="text-danger-500">*</span>
                    </label>
                    <select
                        name="currentDPE"
                        required
                        defaultValue="F"
                        className="input appearance-none"
                    >
                        {DPE_OPTIONS.map((dpe) => (
                            <option key={dpe} value={dpe}>
                                Classe {dpe}
                            </option>
                        ))}
                    </select>
                    {errors.currentDPE && (
                        <p className="text-danger-500 text-xs mt-1">{errors.currentDPE}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted mb-1">
                        DPE cible après travaux <span className="text-danger-500">*</span>
                    </label>
                    <select
                        name="targetDPE"
                        required
                        defaultValue="C"
                        className="input appearance-none"
                    >
                        {DPE_OPTIONS.map((dpe) => (
                            <option key={dpe} value={dpe}>
                                Classe {dpe}
                            </option>
                        ))}
                    </select>
                    {errors.targetDPE && (
                        <p className="text-danger-500 text-xs mt-1">{errors.targetDPE}</p>
                    )}
                </div>
            </div>

            {/* Données financières */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">
                        Coût estimé travaux HT (€) <span className="text-danger-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="estimatedCostHT"
                        required
                        min={1000}
                        step={1000}
                        defaultValue={300000}
                        className="input"
                    />
                    {errors.estimatedCostHT && (
                        <p className="text-danger-500 text-xs mt-1">{errors.estimatedCostHT}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted mb-1">
                        Nombre total de lots <span className="text-danger-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="numberOfUnits"
                        required
                        min={2}
                        max={500}
                        defaultValue={20}
                        className="input"
                    />
                    {errors.numberOfUnits && (
                        <p className="text-danger-500 text-xs mt-1">{errors.numberOfUnits}</p>
                    )}
                </div>
            </div>

            {/* Options Avancées (Structure & Aides) */}
            <details className="bg-surface-highlight rounded-lg p-4 border border-boundary group">
                <summary className="text-sm font-medium text-main cursor-pointer hover:text-primary transition-colors flex items-center justify-between">
                    <span>⚙️ Options Techniques & Aides Locales</span>
                    <span className="text-xs text-muted group-open:rotate-180 transition-transform">▼</span>
                </summary>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">
                            Dont lots commerciaux
                        </label>
                        <input
                            type="number"
                            name="commercialLots"
                            min={0}
                            placeholder="0"
                            className="input"
                        />
                        <p className="text-[10px] text-muted mt-1">
                            Exclus des aides MaPrimeRénov&apos;.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">
                            Montant Aides Locales (€)
                        </label>
                        <input
                            type="number"
                            name="localAidAmount"
                            min={0}
                            step={100}
                            placeholder="0"
                            className="input"
                        />
                        <p className="text-[10px] text-muted mt-1">
                            Subventions ville/région (ex: Mieux Chez Moi).
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">
                            💰 Fonds Travaux ALUR (€)
                        </label>
                        <input
                            type="number"
                            name="alurFund"
                            min={0}
                            step={1000}
                            placeholder="0"
                            className="input"
                        />
                        <p className="text-[10px] text-muted mt-1">
                            Trésorerie dormante disponible.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">
                            ⚡ Primes CEE (€)
                        </label>
                        <input
                            type="number"
                            name="ceeBonus"
                            min={0}
                            step={500}
                            placeholder="0"
                            className="input"
                        />
                        <p className="text-[10px] text-muted mt-1">
                            Certificats d&apos;Économie d&apos;Énergie.
                        </p>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-muted mb-2">
                            👔 Part de Bailleurs Investisseurs: <span className="text-primary font-bold" id="investor-ratio-display">0%</span>
                        </label>
                        <input
                            type="range"
                            name="investorRatio"
                            min={0}
                            max={100}
                            step={5}
                            defaultValue={0}
                            className="w-full h-2 bg-boundary rounded-lg appearance-none cursor-pointer accent-primary"
                            onChange={(e) => {
                                const display = document.getElementById("investor-ratio-display");
                                if (display) display.textContent = `${e.target.value}%`;
                            }}
                        />
                        <p className="text-[10px] text-muted mt-1">
                            Si &gt; 40%, affiche l&apos;avantage fiscal (déficit foncier).
                        </p>
                    </div>
                </div>
            </details>

            {/* Données optionnelles pour valeur verte */}
            <details className="bg-surface-highlight rounded-lg p-4 border border-boundary group">
                <summary className="text-sm font-medium text-main cursor-pointer hover:text-primary transition-colors flex items-center justify-between">
                    <span>📊 Données Valorisation (Optionnel)</span>
                    <span className="text-xs text-muted group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">
                            Prix moyen m² quartier (€)
                            {enrichedProperty?.marketData && (
                                <span className="ml-2 text-xs text-success">✓ Auto-rempli via DVF</span>
                            )}
                        </label>
                        <input
                            type="number"
                            name="averagePricePerSqm"
                            min={500}
                            step={100}
                            placeholder="3200"
                            className="input"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">
                            Surface moyenne lot (m²)
                        </label>
                        <input
                            type="number"
                            name="averageUnitSurface"
                            min={10}
                            step={5}
                            placeholder="65"
                            className="input"
                        />
                    </div>
                </div>
            </details>

            {/* Submit */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 bg-primary hover:bg-primary-600 text-gray-900 font-bold rounded-lg shadow-glow hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
                {isLoading ? "Analyse en cours..." : "🚀 Lancer le Diagnostic Flash"}
            </button>

            <p className="text-xs text-muted text-center">
                Calcul local enrichi par des données officielles (BAN, DVF, Cadastre)
            </p>
        </form>
    );
}
