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
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        // Fill in the rest of the matrix
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
                // Add checks to ensure rows exist (though they should based on init loop)
                if (matrix[i] && matrix[i - 1]) {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + cost, // substitution
                        Math.min(
                            matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1 // deletion
                        )
                    );
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
    async searchAPIGouv(query: string, limit = 5): Promise<APIAddressResult[]> {
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

        // Search both sources in parallel
        const [localResults, apiResults] = await Promise.all([
            this.search(query, limit),
            this.searchAPIGouv(query, limit)
        ]);

        // Convert local DPE results to hybrid format
        const localHybrid: HybridSearchResult[] = localResults.map(entry => {
            // Extract postal code and city from address
            const match = entry.adresse.match(/(\d{5})\s*(.+)$/);
            const postalCode = match?.[1] || '49000';
            const city = match?.[2] || entry.adresse.split(' ').pop() || 'Angers';

            return {
                address: entry.adresse,
                postalCode,
                city,
                sourceType: 'local' as const,
                dpeData: entry
            };
        });

        // Convert API results to hybrid format
        const apiHybrid: HybridSearchResult[] = apiResults.map(result => ({
            ...result,
            sourceType: 'api' as const
        }));

        // Combine: local first (priority), then API
        const combined = [...localHybrid, ...apiHybrid];

        return combined.slice(0, limit);
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
}

