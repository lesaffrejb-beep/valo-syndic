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
// 4. PARAMÈTRES TECHNIQUES (TVA, AMO, Inflation)
// =============================================================================

export const TECHNICAL_PARAMS = {
    /** Coefficient de conversion énergie primaire électricité (DPE 2026) */
    electricityConversionCoeff: 1.9,

    /**
     * Inflation annuelle travaux BTP (Indice BT01)
     *
     * AUDIT 31/01/2026 - MISE À JOUR:
     * - Ancienne valeur: 4.5% (pertinente 2021-2022, post-COVID)
     * - Nouvelle valeur: 2.0% (BT01 Nov 2025: +1.37% + marge sécurité 0.5%)
     * - Source: INSEE Série 001710986
     *
     * @see /src/data/market_data.json pour données actualisées
     * @todo Brancher sur API ou Supabase pour mise à jour automatique
     */
    constructionInflationRate: 0.02,

    /** Valeur Verte : appréciation moyenne passage F → C en zone tendue */
    greenValueAppreciation: 0.12,

    /** Date de référence pour les calculs */
    referenceDate: new Date("2026-01-31"),

    /** TVA Rénovation Énergétique (5.5%) */
    TVA_RENOVATION: 0.055,

    /** Écart qui se creuse chaque année (Double Peine) */
    greenValueDrift: 0.015,
} as const;

// =============================================================================
// 4.1. VALEURS DPE (kWh/m²/an - Moyennes 2026)
// =============================================================================

export const DPE_KWH_VALUES: Record<DPELetter, number> = {
    G: 450,
    F: 350,
    E: 280,
    D: 210,
    C: 150,
    B: 90,
    A: 50,
};

// =============================================================================
// 5. AMO (ASSISTANCE À MAÎTRISE D'OUVRAGE)
// Source: https://www.economie.gouv.fr/particuliers/maprimerenov-copropriete
// =============================================================================

export const AMO_PARAMS = {
    /** Coût forfaitaire moyen AMO par lot (€ HT) */
    costPerLot: 600,

    /** 
     * Plafond d'assiette subventionnable par lot (€ HT)
     * - ≤ 20 lots : 1 000€ HT par logement
     * - > 20 lots : 600€ HT par logement
     */
    ceilingPerLotSmall: 1_000,  // ≤ 20 lots
    ceilingPerLotLarge: 600,    // > 20 lots

    /** 
     * Seuil de distinction petite/grande copropriété
     * Les copros de 20 lots ou moins ont un plafond plus élevé
     */
    smallCoproThreshold: 20,

    /** Taux de prise en charge (50%) */
    aidRate: 0.50,

    /** Montant plancher global minimum (3 000€) */
    minTotal: 3_000,
} as const;

// =============================================================================
// 6. FRAIS ANNEXES & HONORAIRES (Coûts Invisibles)
// =============================================================================

export const PROJECT_FEES = {
    /** Honoraires Syndic de copropriété (gestion travaux) */
    syndicRate: 0.03, // 3%

    /** Assurance Dommage Ouvrage (DO) */
    doRate: 0.02, // 2%

    /** Aléas & Imprévus de chantier (augmenté à 5% pour sécurité) */
    contingencyRate: 0.05, // 5% (anciennement 3%)
} as const;

// =============================================================================
// 7. CONSTANTES LÉGALES & COMPLIANCE
// =============================================================================

export const LEGAL = {
    /** Disclaimer obligatoire sur tous les livrables */
    disclaimer:
        "Simulation indicative. Ne remplace pas un audit réglementaire OPQIBI 1905.",

    /** Mention source données DVF */
    dvfDisclaimer: "Données DVF millésimées 2024 (publication décalée de 2 ans).",

    /** Mention tendance marché */
    marketDisclaimer: "Tendances marché: Notaires de France, décembre 2025.",

    /** Date de mise à jour des constantes */
    lastUpdate: new Date("2026-01-31"),

    /**
     * AUDIT 31/01/2026: Statut réglementaire
     * MPR Copro suspendue faute de LdF 2026 - À mettre à jour dès vote
     */
    regulatoryStatus: {
        isMprCoproActive: false,
        statusDate: new Date("2026-01-01"),
        statusReason: "Attente Loi de Finances 2026",
    },
} as const;

// =============================================================================
// 8. ORDRES DES DPE (pour calculs de progression)
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

// =============================================================================
// 9. VALORISATION IMMOBILIÈRE
// =============================================================================

export const VALUATION_PARAMS = {
    /** Prix de base au m² (Angers/Nantes - Moyenne conservatrice) */
    BASE_PRICE_PER_SQM: 3500,
} as const;
