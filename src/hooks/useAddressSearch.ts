import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { searchAddress as searchApiGouv } from '@/lib/api/addressService';

export interface DPEData {
    numero_dpe: string;
    etiquette_dpe: string;
    etiquette_ges: string;
    conso_kwh_m2_an: number;
    annee_construction: number;
    surface_habitable: number;
    date_etablissement: string;
    cout_total_ttc?: number;
    type_energie?: string;
    type_batiment?: string;
}

export interface SearchResult {
    id: string;
    source: 'api_gouv' | 'dpe_db';
    address: string;
    city: string;
    postalCode: string;
    score: number;
    coordinates?: {
        lat: number;
        lon: number;
    };
    dpe?: DPEData;
}

interface UseAddressSearchReturn {
    query: string;
    setQuery: (q: string) => void;
    results: SearchResult[];
    isLoading: boolean;
    error: string | null;
    clearResults: () => void;
}

export function useAddressSearch(debounceMs = 300): UseAddressSearchReturn {
    const [query, setQueryInternal] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery || searchQuery.length < 3) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // 1. API GOUV (Standard Address Search)
            // Utilisation du service existant pour la cohérence
            const apiPromise = searchApiGouv(searchQuery).then(res => {
                if (!res.success) return [];
                return res.data.map(feature => ({
                    id: `api_${feature.properties.id || feature.properties.label}`,
                    source: 'api_gouv' as const,
                    address: feature.properties.label,
                    city: feature.properties.city,
                    postalCode: feature.properties.postcode,
                    score: feature.properties.score || 0.5,
                    coordinates: {
                        lon: feature.geometry.coordinates[0],
                        lat: feature.geometry.coordinates[1]
                    }
                }));
            });

            // 2. SUPABASE (DPE Data Reveal)
            // Recherche "Full Text" simplifiée sur l'adresse
            // Note: Pour une perf optimale, activer une colonne tsvector sur 'adresse_ban'
            const supabasePromise = supabase
                .from('reference_dpe')
                .select('*')
                .ilike('adresse_ban', `%${searchQuery}%`) // Recherche large
                .limit(5);

            const [apiResults, supabaseResponse] = await Promise.all([
                apiPromise,
                supabasePromise
            ]);

            const dpeResults: SearchResult[] = (supabaseResponse.data || []).map((row: any) => ({
                id: `dpe_${row.numero_dpe}`,
                source: 'dpe_db' as const,
                address: row.adresse_ban,
                city: row.ville,
                postalCode: row.code_postal,
                score: 1, // DPE exists -> High relevance
                dpe: {
                    numero_dpe: row.numero_dpe,
                    etiquette_dpe: row.etiquette_dpe,
                    etiquette_ges: row.etiquette_ges,
                    conso_kwh_m2_an: row.conso_kwh_m2_an,
                    annee_construction: row.annee_construction,
                    surface_habitable: row.surface_habitable,
                    date_etablissement: row.date_etablissement,
                    cout_total_ttc: row.cout_total_ttc,
                    type_energie: row.type_energie,
                    type_batiment: row.type_batiment
                }
            }));

            // 3. MERGING STRATEGY
            // On veut afficher les DPE en premier s'ils existent

            // Dédoublonnage basique basé sur l'adresse normalisée si besoin
            // Pour l'instant on concatène en mettant les DPE (les plus précieux) d'abord
            const combined = [...dpeResults, ...apiResults];

            // Tri par score (et existence de DPE)
            combined.sort((a, b) => {
                // Bonus for DPE presence
                const scoreA = a.score + (a.source === 'dpe_db' ? 1 : 0);
                const scoreB = b.score + (b.source === 'dpe_db' ? 1 : 0);
                return scoreB - scoreA;
            });

            setResults(combined.slice(0, 10)); // Top 10

        } catch (err) {
            console.error("Search error:", err);
            setError("Erreur lors de la recherche");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const setQuery = useCallback((q: string) => {
        setQueryInternal(q);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (q.length < 3) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true); // Immediate feedback
        timeoutRef.current = setTimeout(() => {
            performSearch(q);
        }, debounceMs);
    }, [debounceMs, performSearch]);

    const clearResults = useCallback(() => {
        setResults([]);
        setQueryInternal('');
        setError(null);
    }, []);

    return {
        query,
        setQuery,
        results,
        isLoading,
        error,
        clearResults
    };
}
