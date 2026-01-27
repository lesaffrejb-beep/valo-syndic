/**
 * VALO-SYNDIC — Schémas de Validation Zod
 * =======================================
 * Validation stricte des entrées utilisateur et des données métier.
 */

import { z } from "zod";
import { DPE_ORDER, type DPELetter } from "./constants";

// =============================================================================
// 1. ENTRÉES UTILISATEUR
// =============================================================================

/** Schéma pour une lettre DPE valide */
export const DPELetterSchema = z.enum(["A", "B", "C", "D", "E", "F", "G"]);

/** Schéma pour les données d'entrée du diagnostic */
export const DiagnosticInputSchema = z.object({
    /** Adresse normalisée (optionnel pour MVP) */
    address: z.string().min(5, "Adresse trop courte").optional(),

    /** Code postal (5 chiffres) */
    postalCode: z
        .string()
        .regex(/^\d{5}$/, "Code postal invalide (5 chiffres)")
        .optional(),

    /** Ville */
    city: z.string().min(2, "Ville trop courte").optional(),

    /** Classe DPE actuelle */
    currentDPE: DPELetterSchema,

    /** Classe DPE cible après travaux */
    targetDPE: DPELetterSchema,

    /** Nombre de lots (logements) dans la copropriété */
    numberOfUnits: z
        .number()
        .int()
        .min(2, "Minimum 2 lots pour une copropriété")
        .max(500, "Maximum 500 lots"),

    /** Coût estimé des travaux HT (€) */
    estimatedCostHT: z
        .number()
        .min(1000, "Coût minimum 1 000 €")
        .max(50_000_000, "Coût maximum 50 M€"),

    /** Prix moyen au m² dans le quartier (optionnel) */
    averagePricePerSqm: z.number().positive().optional(),

    /** Surface moyenne d'un lot (m²) - optionnel */
    averageUnitSurface: z.number().positive().optional(),
});

export type DiagnosticInput = z.infer<typeof DiagnosticInputSchema>;

// =============================================================================
// 2. SORTIES CALCULATEUR
// =============================================================================

/** Statut de conformité réglementaire */
export const ComplianceStatusSchema = z.object({
    isProhibited: z.boolean(),
    prohibitionDate: z.date().nullable(),
    daysUntilProhibition: z.number().nullable(),
    statusLabel: z.string(),
    statusColor: z.enum(["danger", "warning", "success"]),
    urgencyLevel: z.enum(["critical", "high", "medium", "low"]),
});

export type ComplianceStatus = z.infer<typeof ComplianceStatusSchema>;

/** Plan de financement détaillé */
export const FinancingPlanSchema = z.object({
    /** Coût total HT des travaux */
    totalCostHT: z.number(),

    /** Coût par lot */
    costPerUnit: z.number(),

    /** Gain énergétique estimé (%) */
    energyGainPercent: z.number(),

    /** Montant MaPrimeRénov' */
    mprAmount: z.number(),

    /** Taux MPR appliqué */
    mprRate: z.number(),

    /** Bonus sortie passoire applicable */
    exitPassoireBonus: z.number(),

    /** Montant Éco-PTZ disponible */
    ecoPtzAmount: z.number(),

    /** Reste à charge après aides */
    remainingCost: z.number(),

    /** Mensualité Éco-PTZ (sur 20 ans) */
    monthlyPayment: z.number(),

    /** Reste à charge par lot */
    remainingCostPerUnit: z.number(),
});

export type FinancingPlan = z.infer<typeof FinancingPlanSchema>;

/** Coût de l'inaction */
export const InactionCostSchema = z.object({
    /** Coût actuel */
    currentCost: z.number(),

    /** Coût projeté à +3 ans avec inflation */
    projectedCost3Years: z.number(),

    /** Perte de valeur vénale estimée */
    valueDepreciation: z.number(),

    /** Coût total de l'inaction */
    totalInactionCost: z.number(),
});

export type InactionCost = z.infer<typeof InactionCostSchema>;

/** Résultat complet du diagnostic */
export const DiagnosticResultSchema = z.object({
    input: DiagnosticInputSchema,
    compliance: ComplianceStatusSchema,
    financing: FinancingPlanSchema,
    inactionCost: InactionCostSchema,
    generatedAt: z.date(),
});

export type DiagnosticResult = z.infer<typeof DiagnosticResultSchema>;

// =============================================================================
// 3. VALIDATEURS MÉTIER
// =============================================================================

/**
 * Valide que le DPE cible est meilleur que le DPE actuel
 */
export function validateDPEProgression(
    current: DPELetter,
    target: DPELetter
): boolean {
    const currentIndex = DPE_ORDER.indexOf(current);
    const targetIndex = DPE_ORDER.indexOf(target);
    // Index plus élevé = meilleur DPE (G=0, A=6)
    return targetIndex > currentIndex;
}

/**
 * Calcule le gain énergétique estimé entre deux classes DPE
 * Simplification : chaque saut de classe = ~15-20% de gain
 */
export function estimateEnergyGain(
    current: DPELetter,
    target: DPELetter
): number {
    const currentIndex = DPE_ORDER.indexOf(current);
    const targetIndex = DPE_ORDER.indexOf(target);
    const steps = targetIndex - currentIndex;

    if (steps <= 0) return 0;
    if (steps === 1) return 0.15; // 15% pour 1 classe (ex: E->D)
    if (steps === 2) return 0.40; // 40% pour 2 classes (ex: E->C)
    if (steps >= 3) return 0.55;  // 55% pour 3 classes ou + (ex: F->C)

    return Math.min(steps * 0.15, 0.70);
}

// =============================================================================
// 4. SCHÉMA DE SAUVEGARDE (VERSIONNÉ)
// =============================================================================

export const ValoSaveSchema = z.object({
    version: z.literal("1.0"),
    savedAt: z.string().datetime().optional(), // ISO string
    metadata: z.object({
        appName: z.literal("VALO-SYNDIC").optional(),
        createdAt: z.coerce.date().optional(),
    }).optional(),
    input: DiagnosticInputSchema,
    result: DiagnosticResultSchema.optional(), // On peut sauvegarder juste l'input ou le résultat complet
});

export type ValoSaveData = z.infer<typeof ValoSaveSchema>;
