/**
 * Service API DVF (Demandes de Valeurs Foncières)
 * Documentation: https://api.dvf.etalab.gouv.fr
 *
 * API GRATUITE - Pas de clé requise
 * Données des 5 dernières années de transactions immobilières
 */

import type {
    DVFMutation,
    APIResult,
    EnrichmentSource,
    APIError,
} from "./types";

const API_BASE = "https://api.dvf.etalab.gouv.fr";

interface DVFSearchOptions {
    codeCommune?: string;      // Code INSEE de la commune
    codePostal?: string;       // Code postal
    lat?: number;              // Latitude pour recherche géographique
    lon?: number;              // Longitude pour recherche géographique
    distanceMax?: number;      // Rayon de recherche en mètres (défaut: 500)
    anneeMutationMin?: number; // Année minimum des transactions
    anneeMutationMax?: number; // Année maximum des transactions
    typeLocal?: "Maison" | "Appartement" | "Local industriel. commercial ou assimilé";
    surfaceMin?: number;       // Surface minimum
    surfaceMax?: number;       // Surface maximum
}

interface DVFStats {
    averagePricePerSqm: number;
    medianPricePerSqm: number;
    transactionCount: number;
    priceRange: { min: number; max: number };
    byDPE?: Record<string, { avgPrice: number; count: number }>;
    lastTransactionDate: string;
    periodCovered: { from: string; to: string };
}

/**
 * Recherche les transactions DVF autour d'une position
 */
export async function searchDVFByLocation(
    lat: number,
    lon: number,
    options?: Partial<DVFSearchOptions>
): Promise<APIResult<DVFMutation[]>> {
    try {
        const params = new URLSearchParams({
            lat: String(lat),
            lon: String(lon),
            dist: String(options?.distanceMax ?? 500),
        });

        // Filtres optionnels
        if (options?.typeLocal) {
            params.append("type_local", options.typeLocal);
        }

        const response = await fetch(`${API_BASE}/mutations?${params}`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // L'API renvoie directement un tableau
        const mutations: DVFMutation[] = Array.isArray(data) ? data : [];

        const source: EnrichmentSource = {
            name: "DVF (Valeurs Foncières)",
            url: "https://app.dvf.etalab.gouv.fr",
            fetchedAt: new Date(),
            status: mutations.length > 0 ? "success" : "partial",
            dataPoints: mutations.length > 0
                ? ["prix_vente", "surface", "date_transaction", "type_bien"]
                : [],
        };

        return {
            success: true,
            data: mutations,
            source,
        };
    } catch (error) {
        const apiError: APIError = {
            name: "APIError",
            code: "DVF_SEARCH_FAILED",
            message: error instanceof Error ? error.message : "Erreur inconnue",
            source: "API DVF",
        };

        return {
            success: false,
            error: apiError,
        };
    }
}

/**
 * Recherche les transactions DVF par code commune
 */
export async function searchDVFByCommune(
    codeCommune: string,
    options?: Partial<DVFSearchOptions>
): Promise<APIResult<DVFMutation[]>> {
    try {
        const params = new URLSearchParams({
            code_commune: codeCommune,
        });

        if (options?.typeLocal) {
            params.append("type_local", options.typeLocal);
        }

        const response = await fetch(`${API_BASE}/mutations?${params}`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const mutations: DVFMutation[] = Array.isArray(data) ? data : [];

        const source: EnrichmentSource = {
            name: "DVF (Valeurs Foncières)",
            url: "https://app.dvf.etalab.gouv.fr",
            fetchedAt: new Date(),
            status: mutations.length > 0 ? "success" : "partial",
            dataPoints: mutations.length > 0
                ? ["prix_vente", "surface", "date_transaction", "type_bien"]
                : [],
        };

        return {
            success: true,
            data: mutations,
            source,
        };
    } catch (error) {
        const apiError: APIError = {
            name: "APIError",
            code: "DVF_COMMUNE_SEARCH_FAILED",
            message: error instanceof Error ? error.message : "Erreur inconnue",
            source: "API DVF",
        };

        return {
            success: false,
            error: apiError,
        };
    }
}

/**
 * Calcule les statistiques de prix à partir des transactions DVF
 * Filtre les transactions aberrantes et calcule les moyennes
 */
export function calculateDVFStats(
    mutations: DVFMutation[],
    options?: {
        typeLocal?: "Appartement" | "Maison";
        yearsBack?: number;
    }
): DVFStats | null {
    // Filtrer par type de bien si spécifié
    let filtered = mutations.filter((m) => {
        // Exclure les transactions sans prix ou surface
        if (!m.valeur_fonciere || m.valeur_fonciere <= 0) return false;
        if (!m.surface_reelle_bati || m.surface_reelle_bati <= 0) return false;

        // Filtrer par type
        if (options?.typeLocal && m.type_local !== options.typeLocal) {
            return false;
        }

        // Filtrer les ventes uniquement
        if (!m.nature_mutation.toLowerCase().includes("vente")) {
            return false;
        }

        // Filtrer par année si spécifié
        if (options?.yearsBack) {
            const mutationYear = new Date(m.date_mutation).getFullYear();
            const currentYear = new Date().getFullYear();
            if (currentYear - mutationYear > options.yearsBack) {
                return false;
            }
        }

        return true;
    });

    if (filtered.length === 0) {
        return null;
    }

    // Calculer le prix au m²
    const pricesPerSqm = filtered.map((m) => m.valeur_fonciere / m.surface_reelle_bati!);

    // Éliminer les outliers (Q1 - 1.5*IQR, Q3 + 1.5*IQR)
    const sorted = [...pricesPerSqm].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const cleanedPrices = pricesPerSqm.filter(
        (p) => p >= lowerBound && p <= upperBound
    );

    if (cleanedPrices.length === 0) {
        return null;
    }

    // Calculs statistiques
    const average = cleanedPrices.reduce((a, b) => a + b, 0) / cleanedPrices.length;
    const sortedClean = [...cleanedPrices].sort((a, b) => a - b);
    const median = sortedClean[Math.floor(sortedClean.length / 2)];
    const min = Math.min(...cleanedPrices);
    const max = Math.max(...cleanedPrices);

    // Dates
    const dates = filtered.map((m) => m.date_mutation).sort();
    const lastTransaction = dates[dates.length - 1];
    const firstTransaction = dates[0];

    return {
        averagePricePerSqm: Math.round(average),
        medianPricePerSqm: Math.round(median),
        transactionCount: filtered.length,
        priceRange: {
            min: Math.round(min),
            max: Math.round(max),
        },
        lastTransactionDate: lastTransaction,
        periodCovered: {
            from: firstTransaction,
            to: lastTransaction,
        },
    };
}

/**
 * Estime l'année de construction à partir des transactions DVF
 * Les transactions récentes sur des biens anciens donnent souvent l'année de construction
 * dans les champs lot ou surface
 */
export function estimateConstructionYearFromDVF(
    mutations: DVFMutation[]
): { year: number; confidence: "high" | "medium" | "low" } | null {
    // DVF ne contient pas directement l'année de construction
    // On peut essayer de déduire des patterns mais c'est approximatif
    // Pour une vraie implémentation, il faudrait croiser avec BDNB

    // Pour l'instant, on retourne null et on documentera le besoin de BDNB
    return null;
}

/**
 * Formatte les statistiques DVF pour l'affichage
 */
export function formatDVFStats(stats: DVFStats): string {
    const formatPrice = (n: number) => n.toLocaleString("fr-FR") + " €/m²";

    return `Prix moyen: ${formatPrice(stats.averagePricePerSqm)} (${stats.transactionCount} ventes analysées, ${stats.periodCovered.from.slice(0, 4)}-${stats.periodCovered.to.slice(0, 4)})`;
}
