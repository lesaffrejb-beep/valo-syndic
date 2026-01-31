// src/lib/market-data.ts
import { supabase } from './supabaseClient';
import localData from '@/data/market_data.json';

// --- TYPES ---
export interface BT01Data {
    currentValue: number;
    annualChangePercent: number;
    referenceMonth: string;
    source: string;
}

export interface MarketTrendData {
    national: number;
    idf: number;
    province: number;
    comment: string;
}

export interface PassoiresData {
    shareOfSales: number;
    trendVs2023: number;
    source: string;
}

export interface RegulationData {
    isLdF2026Voted: boolean;
    isMprCoproSuspended: boolean;
    suspensionDate: string;
    comment: string;
}

export interface MarketData {
    bt01: BT01Data;
    marketTrend: MarketTrendData;
    passoires: PassoiresData;
    regulation: RegulationData;
}

// --- FONCTION ASYNCHRONE (Récupération données dynamiques) ---
export async function fetchMarketData(): Promise<MarketData> {
    try {
        const { data, error } = await supabase
            .from('market_data')
            .select('key, value');

        if (error) throw error;
        if (!data || data.length === 0) throw new Error('Empty data');

        // Mapping des données (avec le JSON local comme base par sécurité)
        const result: MarketData = { ...localData } as any;

        data.forEach((row: any) => {
            if (row.key === 'bt01') result.bt01 = row.value;
            if (row.key === 'market_trend') result.marketTrend = row.value;
            if (row.key === 'passoires') result.passoires = row.value;
            if (row.key === 'regulation') result.regulation = row.value;
        });

        return result;

    } catch (e) {
        console.warn('⚠️ Supabase unreachable, using local fallback.');
        return localData as unknown as MarketData;
    }
}

// --- HELPERS SYNCHRONES (Pour affichage immédiat) ---
export const getLocalBT01Trend = () => localData.bt01.annualChangePercent;
export const getLocalPassoiresShare = () => localData.passoires.shareOfSales;
export const getLocalRegulationStatus = () => localData.regulation;
