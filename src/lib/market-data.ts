/**
 * VALO-SYNDIC — Données Marché Dynamiques
 * ========================================
 * Charge les données marché depuis market_data.json
 * Ces données doivent être actualisées mensuellement.
 *
 * @see /src/data/market_data.json
 */

import marketDataJson from "@/data/market_data.json";

// =============================================================================
// TYPES
// =============================================================================

export interface MarketTrendData {
    threeMonths: number;
    oneYear: number;
    interpretation: string;
}

export interface RegulationStatus {
    isLdF2026Voted: boolean;
    isMprCoproSuspended: boolean;
    suspensionStartDate: string;
    loiSpeciale: string;
}

export interface MarketData {
    bt01: {
        currentValue: number;
        previousYearValue: number;
        annualChangePercent: number;
        referenceMonth: string;
    };
    marketTrend: {
        national: MarketTrendData;
        idf: MarketTrendData;
        province: MarketTrendData;
    };
    passoires: {
        shareOfSales2024: number;
        shareOfSales2023: number;
        shareOfSales2021: number;
        trend: string;
    };
    greenValue: {
        fToC_avgGain: number;
        fToD_avgGain: number;
        gToC_avgGain: number;
        gToD_avgGain: number;
        source: string;
    };
    regulation: RegulationStatus;
    defaultPrices: Record<string, number>;
}

// =============================================================================
// DATA LOADER
// =============================================================================

/**
 * Charge les données marché depuis le JSON
 * En production, ceci pourrait être remplacé par un appel Supabase
 */
export function getMarketData(): MarketData {
    return marketDataJson as unknown as MarketData;
}

/**
 * Retourne le taux d'inflation BTP réel (basé sur BT01)
 * Remplace le 4.5% hardcodé obsolète
 */
export function getRealInflationRate(): number {
    const data = getMarketData();
    // Convertir le pourcentage en décimal (1.37% → 0.0137)
    // Mais on garde une marge de sécurité de +0.5% pour être conservateur
    const realRate = data.bt01.annualChangePercent / 100;
    const safetyMargin = 0.005; // +0.5%
    return realRate + safetyMargin;
}

/**
 * Retourne la tendance du marché pour une zone donnée
 */
export function getMarketTrend(zone: 'national' | 'idf' | 'province' = 'national'): MarketTrendData {
    const data = getMarketData();
    return data.marketTrend[zone];
}

/**
 * Vérifie si MPR Copro est actuellement suspendue
 */
export function isMprCoproSuspended(): boolean {
    const data = getMarketData();
    return data.regulation.isMprCoproSuspended && !data.regulation.isLdF2026Voted;
}

/**
 * Retourne le statut réglementaire actuel
 */
export function getRegulationStatus(): RegulationStatus {
    const data = getMarketData();
    return data.regulation;
}

/**
 * Retourne la part des passoires thermiques dans les ventes
 */
export function getPassoiresShare(): number {
    const data = getMarketData();
    return data.passoires.shareOfSales2024;
}

/**
 * Retourne le gain de valeur verte moyen pour une transition DPE
 */
export function getGreenValueGain(fromDPE: string, toDPE: string): number {
    const data = getMarketData();

    // Mappings connus
    if (fromDPE === 'F' && toDPE === 'C') return data.greenValue.fToC_avgGain;
    if (fromDPE === 'F' && toDPE === 'D') return data.greenValue.fToD_avgGain;
    if (fromDPE === 'G' && toDPE === 'C') return data.greenValue.gToC_avgGain;
    if (fromDPE === 'G' && toDPE === 'D') return data.greenValue.gToD_avgGain;

    // Fallback: estimation linéaire
    const dpeValues: Record<string, number> = { G: 1, F: 2, E: 3, D: 4, C: 5, B: 6, A: 7 };
    const fromVal = dpeValues[fromDPE] || 4;
    const toVal = dpeValues[toDPE] || 4;
    const steps = toVal - fromVal;

    // Environ 5% par classe gagnée
    return Math.max(0, steps * 0.05);
}

/**
 * Retourne le prix par défaut pour une ville (fallback si pas de DVF)
 */
export function getDefaultPricePerSqm(city: string): number {
    const data = getMarketData();
    const normalizedCity = city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Chercher correspondance
    for (const [key, value] of Object.entries(data.defaultPrices)) {
        if (key.startsWith('_')) continue; // Skip comments
        if (normalizedCity.includes(key.toLowerCase())) {
            return value;
        }
    }

    // Fallback national
    return data.defaultPrices.national || 3000;
}

/**
 * Retourne la date de dernière mise à jour des données
 */
export function getDataLastUpdate(): string {
    return (marketDataJson as { _meta?: { lastUpdate?: string } })._meta?.lastUpdate || "Inconnue";
}
