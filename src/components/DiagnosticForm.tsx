/**
 * DiagnosticForm — Formulaire de saisie des données
 */

"use client";

import { useState, useRef } from "react";
import { type DPELetter } from "@/lib/constants";
import { DiagnosticInputSchema, type DiagnosticInput } from "@/lib/schemas";

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
            estimatedCostHT: parseFloat(formData.get("estimatedCostHT") as string),
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
        (form.elements.namedItem("address") as HTMLInputElement).value = DEMO_DATA.address;
        (form.elements.namedItem("postalCode") as HTMLInputElement).value = DEMO_DATA.postalCode;
        (form.elements.namedItem("city") as HTMLInputElement).value = DEMO_DATA.city;
        (form.elements.namedItem("currentDPE") as HTMLSelectElement).value = DEMO_DATA.currentDPE;
        (form.elements.namedItem("targetDPE") as HTMLSelectElement).value = DEMO_DATA.targetDPE;
        (form.elements.namedItem("numberOfUnits") as HTMLInputElement).value = String(DEMO_DATA.numberOfUnits);
        (form.elements.namedItem("estimatedCostHT") as HTMLInputElement).value = String(DEMO_DATA.estimatedCostHT);
        (form.elements.namedItem("averagePricePerSqm") as HTMLInputElement).value = String(DEMO_DATA.averagePricePerSqm);
        (form.elements.namedItem("averageUnitSurface") as HTMLInputElement).value = String(DEMO_DATA.averageUnitSurface);
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

            {/* Adresse (optionnelle) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-text-muted mb-1">
                        Adresse de la copropriété
                    </label>
                    <input
                        type="text"
                        name="address"
                        placeholder="12 rue des Lices"
                        className="input"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">
                        Code postal
                    </label>
                    <input
                        type="text"
                        name="postalCode"
                        placeholder="49100"
                        maxLength={5}
                        className="input"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-muted mb-1">
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

            {/* DPE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">
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
                    <label className="block text-sm font-medium text-text-muted mb-1">
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
                    <label className="block text-sm font-medium text-text-muted mb-1">
                        Nombre de lots <span className="text-danger-500">*</span>
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

                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">
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
            </div>

            {/* Données optionnelles pour valeur verte */}
            <details className="bg-surface-highlight rounded-lg p-4 border border-borders group">
                <summary className="text-sm font-medium text-text-main cursor-pointer hover:text-primary transition-colors">
                    📊 Données optionnelles (calcul valeur verte)
                </summary>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">
                            Prix moyen m² quartier (€)
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
                        <label className="block text-sm font-medium text-text-muted mb-1">
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

            <p className="text-xs text-text-muted text-center">
                Calcul 100% local — Aucune donnée envoyée à un serveur
            </p>
        </form>
    );
}
