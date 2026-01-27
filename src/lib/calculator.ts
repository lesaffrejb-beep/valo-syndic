/**
 * VALO-SYNDIC — Moteur de Calcul
 * ==============================
 * Fonctions pures de calcul basées sur les constantes 2026.
 * Aucun état, aucun effet de bord.
 */

import {
    DPE_PROHIBITION_DATES,
    DPE_STATUS_LABELS,
    DPE_NUMERIC_VALUE,
    MPR_COPRO,
    ECO_PTZ_COPRO,
    TECHNICAL_PARAMS,
    type DPELetter,
} from "./constants";

import {
    type ComplianceStatus,
    type FinancingPlan,
    type InactionCost,
    type DiagnosticInput,
    type DiagnosticResult,
    estimateEnergyGain,
} from "./schemas";

// =============================================================================
// 1. STATUT DE CONFORMITÉ (Loi Climat)
// =============================================================================

/**
 * Calcule le statut de conformité réglementaire d'un bien selon son DPE.
 *
 * @param dpeLetter - Classe DPE actuelle (A-G)
 * @param referenceDate - Date de référence pour le calcul (défaut: aujourd'hui)
 * @returns Statut de conformité détaillé
 */
export function calculateComplianceStatus(
    dpeLetter: DPELetter,
    referenceDate: Date = new Date()
): ComplianceStatus {
    const prohibitionDate = DPE_PROHIBITION_DATES[dpeLetter];
    const statusInfo = DPE_STATUS_LABELS[dpeLetter];

    // Pas d'interdiction prévue
    if (prohibitionDate === null) {
        return {
            isProhibited: false,
            prohibitionDate: null,
            daysUntilProhibition: null,
            statusLabel: statusInfo.label,
            statusColor: statusInfo.color,
            urgencyLevel: "low",
        };
    }

    const now = referenceDate.getTime();
    const prohibition = prohibitionDate.getTime();
    const diffMs = prohibition - now;
    const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // Déjà interdit
    if (daysUntil <= 0) {
        return {
            isProhibited: true,
            prohibitionDate,
            daysUntilProhibition: 0,
            statusLabel: "INTERDIT",
            statusColor: "danger",
            urgencyLevel: "critical",
        };
    }

    // Interdit dans moins de 2 ans
    if (daysUntil <= 730) {
        return {
            isProhibited: false,
            prohibitionDate,
            daysUntilProhibition: daysUntil,
            statusLabel: statusInfo.label,
            statusColor: "danger",
            urgencyLevel: "high",
        };
    }

    // Interdit dans plus de 2 ans
    return {
        isProhibited: false,
        prohibitionDate,
        daysUntilProhibition: daysUntil,
        statusLabel: statusInfo.label,
        statusColor: "warning",
        urgencyLevel: "medium",
    };
}

// =============================================================================
// 2. SIMULATION DE FINANCEMENT
// =============================================================================

/**
 * Calcule le plan de financement complet pour des travaux de rénovation.
 *
 * @param costHT - Coût total des travaux HT (€)
 * @param nbLots - Nombre de lots dans la copropriété
 * @param currentDPE - Classe DPE actuelle
 * @param targetDPE - Classe DPE cible
 * @returns Plan de financement détaillé
 */
export function simulateFinancing(
    costHT: number,
    nbLots: number,
    currentDPE: DPELetter,
    targetDPE: DPELetter
): FinancingPlan {
    // Coût par lot
    const costPerUnit = costHT / nbLots;

    // Gain énergétique estimé
    const energyGainPercent = estimateEnergyGain(currentDPE, targetDPE);

    // --- MaPrimeRénov' Copropriété ---

    // Vérification éligibilité (gain ≥ 35%)
    let mprRate = 0;
    let exitPassoireBonus = 0;

    if (energyGainPercent >= MPR_COPRO.minEnergyGain) {
        // Taux selon le niveau de gain
        mprRate =
            energyGainPercent >= MPR_COPRO.performanceThreshold
                ? MPR_COPRO.rates.performance
                : MPR_COPRO.rates.standard;

        // Bonus sortie passoire (F/G → D ou mieux)
        const isExitPassoire =
            (currentDPE === "F" || currentDPE === "G") &&
            DPE_NUMERIC_VALUE[targetDPE] >= DPE_NUMERIC_VALUE["D"];

        if (isExitPassoire) {
            exitPassoireBonus = MPR_COPRO.exitPassoireBonus;
        }
    }

    // Assiette éligible (plafonnée)
    const eligibleCeiling = nbLots * MPR_COPRO.ceilingPerUnit;
    const eligibleBase = Math.min(costHT, eligibleCeiling);

    // Montant MPR
    const mprAmount = eligibleBase * (mprRate + exitPassoireBonus);

    // --- Éco-PTZ Copropriété ---

    // Plafond Éco-PTZ
    const ecoPtzCeiling = nbLots * ECO_PTZ_COPRO.ceilingPerUnit;

    // Montant empruntable (reste après MPR, plafonné)
    const remainingAfterMPR = costHT - mprAmount;
    const ecoPtzAmount = Math.min(remainingAfterMPR, ecoPtzCeiling);

    // Reste à charge final
    const remainingCost = costHT - mprAmount - ecoPtzAmount;

    // Mensualité Éco-PTZ (taux 0%, donc simple division)
    const monthlyPayments = ECO_PTZ_COPRO.maxDurationYears * 12;
    const monthlyPayment = ecoPtzAmount / monthlyPayments;

    return {
        totalCostHT: costHT,
        costPerUnit,
        energyGainPercent,
        mprAmount,
        mprRate: mprRate + exitPassoireBonus,
        exitPassoireBonus,
        ecoPtzAmount,
        remainingCost: Math.max(0, remainingCost),
        monthlyPayment,
        remainingCostPerUnit: Math.max(0, remainingCost) / nbLots,
    };
}

// =============================================================================
// 3. COÛT DE L'INACTION
// =============================================================================

/**
 * Calcule le coût de l'inaction sur 3 ans.
 *
 * @param currentCost - Coût actuel des travaux (€)
 * @param averagePricePerSqm - Prix moyen au m² (optionnel)
 * @param averageUnitSurface - Surface moyenne d'un lot en m² (optionnel)
 * @param nbLots - Nombre de lots
 * @param currentDPE - DPE actuel pour évaluer la perte de valeur
 * @returns Coût de l'inaction détaillé
 */
export function calculateInactionCost(
    currentCost: number,
    nbLots: number,
    currentDPE: DPELetter,
    averagePricePerSqm?: number,
    averageUnitSurface?: number
): InactionCost {
    const inflationRate = TECHNICAL_PARAMS.constructionInflationRate;

    // Coût projeté à +3 ans avec inflation composée
    const projectedCost3Years = currentCost * Math.pow(1 + inflationRate, 3);
    const inflationCost = projectedCost3Years - currentCost;

    // Perte de valeur vénale (si données disponibles)
    let valueDepreciation = 0;

    if (averagePricePerSqm && averageUnitSurface) {
        // Seuls les DPE F et G subissent une décote significative
        if (currentDPE === "F" || currentDPE === "G") {
            const totalSurface = averageUnitSurface * nbLots;
            const currentValue = averagePricePerSqm * totalSurface;
            // Décote estimée : inverse de la valeur verte (−12%)
            valueDepreciation = currentValue * TECHNICAL_PARAMS.greenValueAppreciation;
        }
    }

    return {
        currentCost,
        projectedCost3Years,
        valueDepreciation,
        totalInactionCost: inflationCost + valueDepreciation,
    };
}

// =============================================================================
// 4. DIAGNOSTIC COMPLET
// =============================================================================

/**
 * Génère un diagnostic complet à partir des entrées utilisateur.
 *
 * @param input - Données d'entrée validées
 * @returns Résultat complet du diagnostic
 */
export function generateDiagnostic(input: DiagnosticInput): DiagnosticResult {
    const compliance = calculateComplianceStatus(input.currentDPE);

    const financing = simulateFinancing(
        input.estimatedCostHT,
        input.numberOfUnits,
        input.currentDPE,
        input.targetDPE
    );

    const inactionCost = calculateInactionCost(
        input.estimatedCostHT,
        input.numberOfUnits,
        input.currentDPE,
        input.averagePricePerSqm,
        input.averageUnitSurface
    );

    return {
        input,
        compliance,
        financing,
        inactionCost,
        generatedAt: new Date(),
    };
}

// =============================================================================
// 5. UTILITAIRES DE FORMATAGE
// =============================================================================

/**
 * Formate un montant en euros avec séparateur de milliers.
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Formate un pourcentage.
 */
export function formatPercent(value: number): string {
    return new Intl.NumberFormat("fr-FR", {
        style: "percent",
        maximumFractionDigits: 0,
    }).format(value);
}

/**
 * Formate une date en français.
 */
export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(date);
}
