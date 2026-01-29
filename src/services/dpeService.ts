import { type DPELetter } from "@/lib/constants";

export interface DPEEntry {
    id: string;
    dpe: DPELetter;
    ges: string;
    conso: number;
    annee: number;
    surface: number;
    date: string;
    adresse: string;
}

let cachedData: DPEEntry[] | null = null;

/**
 * Service to handle local DPE data fetching and searching.
 */
export const dpeService = {
    /**
     * Fetches the local DPE JSON data.
     * Uses caching to avoid multiple network requests.
     */
    async fetchData(): Promise<DPEEntry[]> {
        if (cachedData) return cachedData;

        try {
            const response = await fetch("/data/dpe-49.json");
            if (!response.ok) {
                throw new Error("Failed to fetch DPE data");
            }
            const data = await response.json();
            cachedData = data;
            return data;
        } catch (error) {
            console.error("Error loading DPE data:", error);
            return [];
        }
    },

    /**
     * Calculates Levenshtein distance between two strings
     */
    levenshteinDistance(a: string, b: string): number {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        // Initialize matrix
        const matrix: number[][] = [];

        // increment along the first column of each row
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        // increment each column in the first row
        const firstRow = matrix[0];
        if (firstRow) {
            for (let j = 0; j <= a.length; j++) {
                firstRow[j] = j;
            }
        }

        // Fill in the rest of the matrix
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
                const currentRow = matrix[i];
                const prevRow = matrix[i - 1];
                if (currentRow && prevRow) {
                    const substitution = (prevRow[j - 1] ?? Infinity) + cost;
                    const insertion = (currentRow[j - 1] ?? Infinity) + 1;
                    const deletion = (prevRow[j] ?? Infinity) + 1;
                    currentRow[j] = Math.min(substitution, insertion, deletion);
                }
            }
        }

        return matrix[b.length]?.[a.length] ?? Infinity;
    },

    /**
     * SEARCH ALGORITHM
     * 1. Exact match (case insensitive)
     * 2. Contains match
     * 3. Fuzzy match (Levenshtein)
     */
    async search(query: string, limit = 5): Promise<DPEEntry[]> {
        if (!query || query.length < 3) return [];

        const data = await this.fetchData();
        const normalizedQuery = query.toLowerCase().trim();

        // 1. Direct includes (fastest)
        const exactMatches = data.filter(item =>
            item.adresse.toLowerCase().includes(normalizedQuery)
        );

        if (exactMatches.length >= limit) {
            return exactMatches.slice(0, limit);
        }

        // 2. Fuzzy Search if not enough exact matches
        // We only scan if we have fewer than `limit` results
        const fuzzyMatches = data
            .map(item => {
                const normalizedAddress = item.adresse.toLowerCase();
                const distance = this.levenshteinDistance(normalizedQuery, normalizedAddress);
                return { item, distance };
            })
            // Filter out bad matches (arbitrary threshold relative to query length)
            .filter(result => result.distance <= Math.max(3, normalizedQuery.length * 0.4))
            .sort((a, b) => a.distance - b.distance)
            .map(result => result.item);

        // Merge results: exact matches first, then fuzzy
        // Use Set to remove duplicates
        const uniqueResults = new Set([...exactMatches, ...fuzzyMatches]);

        return Array.from(uniqueResults).slice(0, limit);
    },

    /**
     * API ADRESSE GOUV SEARCH
     * Fetches addresses from the official French government API
     */
    async searchAPIGouv(query: string, limit = 3): Promise<APIAddressResult[]> {
        if (!query || query.length < 3) return [];

        try {
            const response = await fetch(
                `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=${limit}`
            );

            if (!response.ok) {
                console.error("API Gouv search failed:", response.status);
                return [];
            }

            const data = await response.json();

            return data.features?.map((feature: any) => ({
                address: feature.properties.label,
                postalCode: feature.properties.postcode,
                city: feature.properties.city,
                cityCode: feature.properties.citycode,
                coordinates: {
                    longitude: feature.geometry.coordinates[0],
                    latitude: feature.geometry.coordinates[1]
                },
                score: feature.properties.score,
                sourceType: 'api' as const
            })) || [];
        } catch (error) {
            console.error("Error fetching from API Gouv:", error);
            return [];
        }
    },

    /**
     * HYBRID SEARCH
     * Combines local DPE data + API Gouv in parallel
     * Returns enriched results with source indicator
     */
    async hybridSearch(query: string, limit = 5): Promise<HybridSearchResult[]> {
        if (!query || query.length < 3) return [];

        // 1. Parallelism Enforced: Always fetch both
        // User Requirement: 3 Local + 3 API
        const [localResults, apiResults] = await Promise.all([
            this.search(query, 3),
            this.searchAPIGouv(query, 3)
        ]);

        // 2. Transform Local Results
        const localHybrid: HybridSearchResult[] = localResults.map(entry => {
            const match = entry.adresse.match(/(\d{5})\s*(.+)$/);
            const postalCode = match?.[1] || '49000';
            const city = match?.[2] || entry.adresse.split(' ').pop() || 'Angers';

            return {
                address: entry.adresse,
                postalCode,
                city,
                sourceType: 'local' as const,
                dpeData: entry,
                score: 0.8 // Arbitrary high base score for local results
            };
        });

        // 3. Transform API Results
        const apiHybrid: HybridSearchResult[] = apiResults.map(result => ({
            ...result,
            sourceType: 'api' as const
        }));

        // 4. Merge & Deduplicate
        // We use a Map keyed by address to remove exact duplicates
        const resultMap = new Map<string, HybridSearchResult>();

        // Add local first
        localHybrid.forEach(item => resultMap.set(item.address, item));

        // Add API (if duplicate, decides strategy - keeping local usually better for DPE data availability, 
        // but user wants API priority if exact match? 
        // Let's keep both if they differ slightly, or merge if exact string match.
        // If exact string match, we probably want to keep the "local" one because it has the DPE data attached!
        // So we only add API if it's NOT in the map yet.
        apiHybrid.forEach(item => {
            if (!resultMap.has(item.address)) {
                resultMap.set(item.address, item);
            }
        });

        const combined = Array.from(resultMap.values());

        // 5. Prioritization Logic
        // "Si l'API renvoie un "score" de pertinence élevé (match exact sur le numéro de rue), remonte ce résultat en premier"
        combined.sort((a, b) => {
            const queryNum = query.trim().match(/^(\d+)/)?.[1];

            if (queryNum) {
                // Check exact number match
                const aNum = a.address.trim().match(/^(\d+)/)?.[1];
                const bNum = b.address.trim().match(/^(\d+)/)?.[1];

                const aExact = aNum === queryNum;
                const bExact = bNum === queryNum;

                if (aExact && !bExact) return -1;
                if (!aExact && bExact) return 1;
            }

            // Secondary sort: Score if available
            // API results have real scores (0-1). Local has 0.8.
            const scoreA = a.score || 0;
            const scoreB = b.score || 0;

            return scoreB - scoreA;
        });

        return combined;
    },

    // =========================================================================
    // V2 QUICK WINS
    // =========================================================================

    /**
     * ALERTE DÉCENNALE
     * Vérifie si l'immeuble est sous garantie décennale (< 10 ans)
     */
    checkDecennale(anneeConstruction: number): DecennaleStatus {
        const currentYear = new Date().getFullYear();
        const buildingAge = currentYear - anneeConstruction;
        const isActive = buildingAge <= 10;
        const expirationYear = anneeConstruction + 10;
        const yearsRemaining = Math.max(0, expirationYear - currentYear);

        return {
            isActive,
            anneeConstruction,
            expirationYear,
            yearsRemaining,
            buildingAge,
            urgencyLevel: yearsRemaining <= 2 ? 'critical' : yearsRemaining <= 5 ? 'warning' : 'info'
        };
    },

    /**
     * COMPARATEUR ÉNERGÉTIQUE QUARTIER
     * Calcule la moyenne de consommation pour un code postal donné
     */
    async getQuarterlyStats(postalCode: string, targetConso: number): Promise<QuarterlyStats> {
        const data = await this.fetchData();

        // Filtrer les bâtiments du même code postal
        const quartierBuildings = data.filter(b =>
            b.adresse.includes(postalCode) ||
            b.adresse.toLowerCase().includes(postalCode.toLowerCase())
        );

        if (quartierBuildings.length === 0) {
            // Fallback: utiliser toute la base comme référence
            const allAvg = data.reduce((sum, b) => sum + b.conso, 0) / data.length;
            return {
                averageConso: allAvg,
                targetConso,
                percentDiff: ((targetConso - allAvg) / allAvg) * 100,
                sampleSize: data.length,
                isAboveAverage: targetConso > allAvg,
                estimatedYearlyCost: targetConso * 100 * 0.25, // 100m² * 0.25€/kWh
                averageYearlyCost: allAvg * 100 * 0.25,
                potentialSavings: Math.max(0, (targetConso - allAvg) * 100 * 0.25),
                source: 'all_database'
            };
        }

        const avgConso = quartierBuildings.reduce((sum, b) => sum + b.conso, 0) / quartierBuildings.length;
        const percentDiff = ((targetConso - avgConso) / avgConso) * 100;

        return {
            averageConso: avgConso,
            targetConso,
            percentDiff,
            sampleSize: quartierBuildings.length,
            isAboveAverage: targetConso > avgConso,
            estimatedYearlyCost: targetConso * 100 * 0.25,
            averageYearlyCost: avgConso * 100 * 0.25,
            potentialSavings: Math.max(0, (targetConso - avgConso) * 100 * 0.25),
            source: 'quartier'
        };
    }
};

// Types for API Gouv integration
export interface APIAddressResult {
    address: string;
    postalCode: string;
    city: string;
    cityCode?: string;
    coordinates?: {
        longitude: number;
        latitude: number;
    };
    sourceType: 'api';
    score?: number;
}

export interface HybridSearchResult {
    address: string;
    postalCode: string;
    city: string;
    cityCode?: string;
    coordinates?: {
        longitude: number;
        latitude: number;
    };
    sourceType: 'local' | 'api';
    dpeData?: DPEEntry;
    score?: number;
}

// V2 Types
export interface DecennaleStatus {
    isActive: boolean;
    anneeConstruction: number;
    expirationYear: number;
    yearsRemaining: number;
    buildingAge: number;
    urgencyLevel: 'critical' | 'warning' | 'info';
}

export interface QuarterlyStats {
    averageConso: number;
    targetConso: number;
    percentDiff: number;
    sampleSize: number;
    isAboveAverage: boolean;
    estimatedYearlyCost: number;
    averageYearlyCost: number;
    potentialSavings: number;
    source: 'quartier' | 'all_database';
}
