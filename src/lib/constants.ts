/**
 * VALO-SYNDIC — Constantes Métier Janvier 2026
 * ============================================
 * Source unique de vérité pour toutes les données réglementaires et financières.
 * ⚠️ NE PAS MODIFIER sans validation juridique.
 */

// =============================================================================
// 1. CALENDRIER LOI CLIMAT — Interdiction de Location
// =============================================================================

export const DPE_PROHIBITION_DATES = {
    G: new Date("2025-01-01"), // INTERDIT depuis 01/01/2025
    F: new Date("2028-01-01"), // Interdit au 01/01/2028
    E: new Date("2034-01-01"), // Interdit au 01/01/2034
    D: null, // Pas d'interdiction prévue
    C: null,
    B: null,
    A: null,
} as const;

export type DPELetter = keyof typeof DPE_PROHIBITION_DATES;

export const DPE_STATUS_LABELS = {
    G: { label: "INTERDIT", color: "danger", emoji: "🔴" },
    F: { label: "Interdit 2028", color: "warning", emoji: "🟡" },
    E: { label: "Interdit 2034", color: "warning", emoji: "🟢" },
    D: { label: "Conforme", color: "success", emoji: "✅" },
    C: { label: "Conforme", color: "success", emoji: "✅" },
    B: { label: "Performant", color: "success", emoji: "✅" },
    A: { label: "Excellent", color: "success", emoji: "✅" },
} as const;

// =============================================================================
// 2. MAPRIMERÉNOV' COPROPRIÉTÉ — Barème 2026
// =============================================================================

export const MPR_COPRO = {
    /** Condition minimale : gain énergétique ≥ 35% */
    minEnergyGain: 0.35,

    /** Taux d'aide selon le gain énergétique */
    rates: {
        standard: 0.30, // Gain 35-50% → 30%
        performance: 0.45, // Gain > 50% → 45%
    },

    /** Seuil de gain pour taux performance */
    performanceThreshold: 0.50,

    /** Plafond de l'assiette éligible par logement (€ HT) */
    ceilingPerUnit: 25_000,

    /** Bonus "Sortie Passoire" : passage F/G → D ou mieux */
    exitPassoireBonus: 0.10,
} as const;

// =============================================================================
// 3. ÉCO-PTZ COPROPRIÉTÉ — Conditions 2026
// =============================================================================

export const ECO_PTZ_COPRO = {
    /** Taux d'intérêt (0% = prêt sans intérêts) */
    rate: 0,

    /** Durée maximale en années (rénovation globale) */
    maxDurationYears: 20,

    /** Plafond par logement (€) */
    ceilingPerUnit: 50_000,
} as const;

// =============================================================================
// 4. PARAMÈTRES TECHNIQUES
// =============================================================================

export const TECHNICAL_PARAMS = {
    /** Coefficient de conversion énergie primaire électricité (DPE 2026) */
    electricityConversionCoeff: 1.9,

    /** Inflation annuelle travaux BTP (Indice BT01) */
    constructionInflationRate: 0.045,

    /** Valeur Verte : appréciation moyenne passage F → C en zone tendue */
    greenValueAppreciation: 0.12,

    /** Date de référence pour les calculs */
    referenceDate: new Date("2026-01-27"),
} as const;

// =============================================================================
// 5. CONSTANTES LÉGALES & COMPLIANCE
// =============================================================================

export const LEGAL = {
    /** Disclaimer obligatoire sur tous les livrables */
    disclaimer:
        "Simulation indicative. Ne remplace pas un audit réglementaire OPQIBI 1905.",

    /** Mention source données DVF */
    dvfDisclaimer: "Données millésimées 2024 (Retard publication : 2 ans).",

    /** Version du document */
    version: "1.0.0",

    /** Date de mise à jour des constantes */
    lastUpdate: new Date("2026-01-27"),
} as const;

// =============================================================================
// 6. ORDRES DES DPE (pour calculs de progression)
// =============================================================================

export const DPE_ORDER: DPELetter[] = ["G", "F", "E", "D", "C", "B", "A"];

export const DPE_NUMERIC_VALUE: Record<DPELetter, number> = {
    G: 1,
    F: 2,
    E: 3,
    D: 4,
    C: 5,
    B: 6,
    A: 7,
};
