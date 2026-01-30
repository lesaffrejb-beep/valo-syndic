/**
 * useAddressSearch — Hook de recherche d'adresse avec normalisation API Gouv
 * ============================================================================
 * Logique de branchement :
 * 1. L'utilisateur tape une adresse → Autocomplete API Gouv
 * 2. Au clic sur suggestion → Récupère label normalisé, citycode, coordonnées GPS
 * 3. Requête Supabase : Cherche dans reference_dpe avec adresse normalisée (ilike)
 * 4. Si DPE trouvé → Hydrate Dashboard avec vraies données
 * 5. Si DPE non trouvé → Lance simulation basée sur statistiques ville (fallback)
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

// Types pour l'API Adresse Gouv
export interface AddressFeature {
    type: "Feature";
    geometry: {
        type: "Point";
        coordinates: [number, number]; // [longitude, latitude]
    };
    properties: {
        label: string; // Adresse normalisée complète
        score: number; // Score de pertinence (0-1)
        housenumber?: string;
        id: string;
        name: string;
        postcode: string;
        citycode: string;
        city: string;
        context: string;
        type: "housenumber" | "street" | "locality" | "municipality";
        importance: number;
        street?: string;
    };
}

export interface AddressAPIResponse {
    type: "FeatureCollection";
    version: string;
    features: AddressFeature[];
    attribution: string;
    licence: string;
    query: string;
    limit: number;
}

// Types pour les données DPE depuis Supabase
export interface DPEReference {
    id: string;
    numero_dpe: string;
    code_postal: string;
    ville: string | null;
    annee_construction: number | null;
    etiquette_dpe: "A" | "B" | "C" | "D" | "E" | "F" | "G" | null;
    etiquette_ges: "A" | "B" | "C" | "D" | "E" | "F" | "G" | null;
    conso_kwh_m2_an: number | null;
    surface_habitable: number | null;
    date_etablissement: string | null;
}

// Type pour le résultat enrichi
export interface EnrichedAddressResult {
    // Données API Gouv
    address: string;
    normalizedAddress: string;
    postalCode: string;
    city: string;
    cityCode: string;
    coordinates: {
        longitude: number;
        latitude: number;
    };
    // Données DPE (si trouvées)
    dpeData?: DPEReference;
    hasDPEData: boolean;
    // Métadonnées
    searchScore: number;
}

export function useAddressSearch() {
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState<AddressFeature[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isEnriching, setIsEnriching] = useState(false);
    const [selectedResult, setSelectedResult] = useState<EnrichedAddressResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    /**
     * 1. RECHERCHE API GOUV (Autocomplete)
     */
    const searchAddresses = useCallback(async (query: string) => {
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        // Annuler la requête précédente
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        try {
            setIsSearching(true);
            setError(null);

            const response = await fetch(
                `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`,
                { signal: abortControllerRef.current.signal }
            );

            if (!response.ok) {
                throw new Error(`API Gouv error: ${response.status}`);
            }

            const data: AddressAPIResponse = await response.json();
            setSuggestions(data.features || []);
        } catch (err) {
            if (err instanceof Error && err.name === "AbortError") {
                // Requête annulée, pas d'erreur
                return;
            }
            console.error("Address search error:", err);
            setError("Erreur de recherche d'adresse");
            setSuggestions([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    /**
     * 2. RECHERCHE DPE DANS SUPABASE
     * Utilise ilike pour matching tolérant sur ville et code postal
     */
    const searchDPEInDatabase = async (
        cityCode: string,
        postalCode: string,
        city: string
    ): Promise<DPEReference | null> => {
        try {
            // Stratégie 1 : Chercher par code postal (le plus fiable)
            let { data, error: queryError } = await supabase
                .from("reference_dpe")
                .select("*")
                .eq("code_postal", postalCode)
                .limit(1);

            // Stratégie 2 : Si pas de résultat, chercher par ville (ilike pour tolérance)
            if (!data || data.length === 0) {
                const result = await supabase
                    .from("reference_dpe")
                    .select("*")
                    .ilike("ville", `%${city}%`)
                    .limit(1);

                data = result.data;
                queryError = result.error;
            }

            if (queryError) {
                console.error("Supabase DPE search error:", queryError);
                return null;
            }

            return data && data.length > 0 ? data[0] : null;
        } catch (err) {
            console.error("DPE database search error:", err);
            return null;
        }
    };

    /**
     * 3. SÉLECTION D'UNE ADRESSE (avec enrichissement DPE)
     */
    const selectAddress = useCallback(async (feature: AddressFeature) => {
        setIsEnriching(true);
        setError(null);

        try {
            const props = feature.properties;
            const coords = feature.geometry.coordinates;

            // Recherche DPE dans Supabase
            const dpeData = await searchDPEInDatabase(
                props.citycode,
                props.postcode,
                props.city
            );

            const result: EnrichedAddressResult = {
                address: props.label,
                normalizedAddress: props.label,
                postalCode: props.postcode,
                city: props.city,
                cityCode: props.citycode,
                coordinates: {
                    longitude: coords[0],
                    latitude: coords[1],
                },
                ...(dpeData ? { dpeData } : {}),
                hasDPEData: !!dpeData,
                searchScore: props.score,
            };

            setSelectedResult(result);
            setSuggestions([]);

            return result;
        } catch (err) {
            console.error("Address selection error:", err);
            setError("Erreur lors de l'enrichissement de l'adresse");
            return null;
        } finally {
            setIsEnriching(false);
        }
    }, []);

    /**
     * 4. GESTION INPUT avec DEBOUNCE
     */
    const handleInputChange = useCallback(
        (value: string) => {
            setInputValue(value);

            // Clear previous timeout
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }

            // Debounce search (300ms)
            searchTimeoutRef.current = setTimeout(() => {
                searchAddresses(value);
            }, 300);
        },
        [searchAddresses]
    );

    /**
     * 5. CLEAR SUGGESTIONS
     */
    const clearSuggestions = useCallback(() => {
        setSuggestions([]);
    }, []);

    /**
     * 6. RESET
     */
    const reset = useCallback(() => {
        setInputValue("");
        setSuggestions([]);
        setSelectedResult(null);
        setError(null);
    }, []);

    /**
     * Cleanup on unmount
     */
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return {
        // State
        inputValue,
        suggestions,
        isSearching,
        isEnriching,
        selectedResult,
        error,

        // Actions
        handleInputChange,
        selectAddress,
        clearSuggestions,
        reset,
    };
}
