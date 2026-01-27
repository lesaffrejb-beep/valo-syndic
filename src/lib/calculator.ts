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
    type ValuationResult,
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

// =============================================================================
// 2. SIMULATION DE FINANCEMENT
// =============================================================================

/**
 * Calcule le plan de financement complet pour des travaux de rénovation.
 *
 * @param costHT - Coût des travaux HT (€) (Travaux purs)
 * @param nbLots - Nombre total de lots
 * @param currentDPE - Classe DPE actuelle
 * @param targetDPE - Classe DPE cible
 * @param commercialLots - Nombre de lots commerciaux (non éligibles MPR)
 * @param localAidAmount - Montant des aides locales
 * @returns Plan de financement détaillé
 */
export function simulateFinancing(
    costHT: number,
    nbLots: number,
    currentDPE: DPELetter,
    targetDPE: DPELetter,
    commercialLots: number = 0,
    localAidAmount: number = 0
): FinancingPlan {
    // 1. Calcul des Frais Annexes (Coûts Invisibles)
    const { PROJECT_FEES } = require("./constants"); // Import dynamique pour éviter doublons imports

    const syndicFees = costHT * PROJECT_FEES.syndicRate;
    const doFees = costHT * PROJECT_FEES.doRate;
    const contingencyFees = costHT * PROJECT_FEES.contingencyRate;

    // Coût Total Projet = Travaux + Frais
    const totalCostHT = costHT + syndicFees + doFees + contingencyFees;

    // Coût par lot (sur base du total projet)
    const costPerUnit = totalCostHT / nbLots;

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
    // Seuls les lots d'habitation sont éligibles au plafond MPR
    const residentialLots = Math.max(0, nbLots - commercialLots);
    const eligibleCeiling = residentialLots * MPR_COPRO.ceilingPerUnit;

    // L'assiette MPR comprend le montant des travaux HT + MOE (frais syndic approx)
    // Pour simplifier, on prend le Total Cost HT comme base de dépense éligible, plafonnée.
    const eligibleBase = Math.min(totalCostHT, eligibleCeiling);

    // Montant MPR
    const mprAmount = eligibleBase * (mprRate + exitPassoireBonus);

    // --- Éco-PTZ Copropriété ---

    // Plafond Éco-PTZ (sur lots totaux ou résidentiels ? En pratique souvent résidentiels, mais simplifions sur nbLots pour l'instant)
    const ecoPtzCeiling = nbLots * ECO_PTZ_COPRO.ceilingPerUnit;

    // Montant empruntable (reste après MPR + Aides Locales, plafonné)
    const remainingAfterAids = totalCostHT - mprAmount - localAidAmount;
    const ecoPtzAmount = Math.min(remainingAfterAids, ecoPtzCeiling);

    // Reste à charge final
    const remainingCost = totalCostHT - mprAmount - localAidAmount - ecoPtzAmount;

    // Mensualité Éco-PTZ (taux 0%, donc simple division)
    const monthlyPayments = ECO_PTZ_COPRO.maxDurationYears * 12;
    const monthlyPayment = ecoPtzAmount / monthlyPayments;

    return {
        worksCostHT: costHT,
        totalCostHT,
        syndicFees,
        doFees,
        contingencyFees,
        costPerUnit,
        energyGainPercent,
        mprAmount,
        localAidAmount,
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
 * Calcule la valorisation patrimoniale et la Valeur Verte
 */
export function calculateValuation(
    input: DiagnosticInput,
    financing: FinancingPlan
): ValuationResult {
    // 1. Estimation de la surface
    // Si la surface moyenne n'est pas connue, on l'estime à 65m2 par lot
    const averageSurface = input.averageUnitSurface || 65;
    const totalSurface = input.numberOfUnits * averageSurface;

    // 2. Prix de base au m2 (Angers/Nantes - Moyenne conservatrice)
    // Idéalement, ce prix devrait venir d'une API externe ou d'une base de données par ville
    const BASE_PRICE_PER_SQM = 3500;

    // 3. Impact DPE sur la valeur (Décote/Surcote par rapport à D)
    // G: -15%, F: -10%, E: -5%, D: 0%, C: +5%, B: +10%, A: +15%
    const dpeImpact: Record<string, number> = {
        G: -0.15,
        F: -0.10,
        E: -0.05,
        D: 0,
        C: 0.05,
        B: 0.10,
        A: 0.15,
    };

    const currentImpact = dpeImpact[input.currentDPE] || 0;
    const targetImpact = dpeImpact[input.targetDPE] || 0;

    // 4. Calcul des valeurs
    const currentPricePerSqm = BASE_PRICE_PER_SQM * (1 + currentImpact);
    const targetPricePerSqm = BASE_PRICE_PER_SQM * (1 + targetImpact);

    const currentValue = totalSurface * currentPricePerSqm;
    const projectedValue = totalSurface * targetPricePerSqm;

    // 5. Calcul de la Value Verte
    const greenValueGain = projectedValue - currentValue;
    const greenValueGainPercent = (greenValueGain / currentValue);

    // 6. ROI Net
    // Gain de valeur - Coût des travaux (Reste à charge global)
    // Reste à charge global = remainingCost (qui est déjà le total pour la copro après aides)
    const netROI = greenValueGain - financing.remainingCost;

    return {
        currentValue,
        projectedValue,
        greenValueGain,
        greenValueGainPercent,
        netROI,
        pricePerSqm: BASE_PRICE_PER_SQM,
    };
}

/**
 * Génère un diagnostic complet à partir des entrées utilisateur.
 *
 * @param input - Données d'entrée validées
 * @returns Résultat complet du diagnostic
 */
export function generateDiagnostic(input: DiagnosticInput): DiagnosticResult {
    // 1. Calcul conformité
    const compliance = calculateComplianceStatus(input.currentDPE);

    // 2. Simulation financement
    const financing = simulateFinancing(
        input.estimatedCostHT,
        input.numberOfUnits,
        input.currentDPE,
        input.targetDPE,
        input.commercialLots,
        input.localAidAmount
    );

    // 3. Coût de l'inaction (Inflation énergie)
    const inactionCost = calculateInactionCost(
        input.estimatedCostHT,
        input.numberOfUnits,
        input.currentDPE,
        input.averagePricePerSqm,
        input.averageUnitSurface
    );

    // 4. Valorisation (NEW)
    const valuation = calculateValuation(input, financing);

    return {
        input,
        compliance,
        financing,
        inactionCost,
        valuation,
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

// =============================================================================
// 6. GOD VIEW (AUDIT DE PARC)
// =============================================================================

/**
 * Estime le DPE probable d'une copropriété en fonction de son année de construction
 */
export function estimateDPEByYear(year: number): DPELetter {
    if (year < 1948) return "G";
    if (year < 1975) return "F";
    if (year < 1982) return "E";
    if (year < 2000) return "D";
    if (year < 2012) return "C";
    if (year < 2020) return "B";
    return "A";
}

export interface BuildingAuditResult {
    id: string;
    address: string;
    numberOfUnits: number;
    constructionYear: number;
    currentDPE: DPELetter;
    compliance: {
        status: "danger" | "warning" | "success";
        label: string;
        deadline?: string;
    };
    coordinates: [number, number]; // [lat, lng]
}

/**
 * Traitement par lot de plusieurs bâtiments pour le "God View"
 */
export function batchProcessBuildings(buildings: Array<{
    adresse: string;
    lots: number;
    annee: number;
}>): BuildingAuditResult[] {
    // Coordonnées de base pour Angers (pour la simulation)
    const ANGERS_CENTER = { lat: 47.47, lng: -0.55 };

    return buildings.map((b, index) => {
        const dpe = estimateDPEByYear(b.annee);
        const compliance = calculateComplianceStatus(dpe);

        // Simulation de géocodage : on disperse autour du centre d'Angers
        const lat = ANGERS_CENTER.lat + (Math.random() - 0.5) * 0.05;
        const lng = ANGERS_CENTER.lng + (Math.random() - 0.5) * 0.05;

        return {
            id: `build-${index}`,
            address: b.adresse,
            numberOfUnits: b.lots,
            constructionYear: b.annee,
            currentDPE: dpe,
            compliance: {
                status: compliance.statusColor as "danger" | "warning" | "success",
                label: compliance.statusLabel,
                ...(compliance.prohibitionDate ? { deadline: formatDate(compliance.prohibitionDate) } : {})
            },
            coordinates: [lat, lng]
        };
    });
}
