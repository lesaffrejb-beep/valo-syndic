"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePropertyEnrichment } from "@/hooks/usePropertyEnrichment";
import type { AddressFeature } from "@/lib/api";

interface AddressAutocompleteProps {
    /** Valeur initiale */
    defaultValue?: string;
    /** Callback quand une adresse est sélectionnée */
    onSelect?: (data: {
        address: string;
        postalCode: string;
        city: string;
        cityCode?: string;
        coordinates?: { longitude: number; latitude: number };
    }) => void;
    /** Callback quand l'enrichissement est terminé */
    onEnriched?: (property: ReturnType<typeof usePropertyEnrichment>["property"]) => void;
    /** Placeholder */
    placeholder?: string;
    /** Classe CSS additionnelle */
    className?: string;
    /** Désactiver le champ */
    disabled?: boolean;
}

/**
 * Champ d'adresse avec auto-complétion et enrichissement automatique
 *
 * Utilise l'API Adresse (BAN) pour :
 * - Auto-complétion en temps réel
 * - Normalisation de l'adresse
 * - Récupération des coordonnées GPS
 *
 * Puis enrichit avec :
 * - Données cadastrales
 * - Prix immobiliers DVF
 */
export function AddressAutocomplete({
    defaultValue = "",
    onSelect,
    onEnriched,
    placeholder = "Commencez à taper une adresse...",
    className = "",
    disabled = false,
}: AddressAutocompleteProps) {
    const [inputValue, setInputValue] = useState(defaultValue);
    const [isFocused, setIsFocused] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const {
        isLoading,
        isEnriching,
        suggestions,
        searchAddress,
        selectAddress,
        clearSuggestions,
        property,
    } = usePropertyEnrichment();

    // Notifier quand l'enrichissement est terminé
    useEffect(() => {
        if (property && onEnriched) {
            onEnriched(property);
        }
    }, [property, onEnriched]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setSelectedIndex(-1);
        searchAddress(value);
    };

    const handleSelect = (feature: AddressFeature) => {
        const props = feature.properties;

        setInputValue(props.label);
        clearSuggestions();
        setIsFocused(false);

        // Callback immédiat avec les données de base
        if (onSelect) {
            onSelect({
                address: props.label,
                postalCode: props.postcode,
                city: props.city,
                cityCode: props.citycode,
                coordinates: {
                    longitude: feature.geometry.coordinates[0],
                    latitude: feature.geometry.coordinates[1],
                },
            });
        }

        // Lancer l'enrichissement complet en arrière-plan
        selectAddress(feature);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (suggestions.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                    handleSelect(suggestions[selectedIndex].value);
                }
                break;
            case "Escape":
                clearSuggestions();
                setIsFocused(false);
                break;
        }
    };

    const handleBlur = () => {
        // Délai pour permettre le clic sur une suggestion
        setTimeout(() => {
            setIsFocused(false);
            clearSuggestions();
        }, 200);
    };

    const showSuggestions = isFocused && suggestions.length > 0;

    return (
        <div className={`relative ${className}`}>
            {/* Input */}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    role="combobox"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled || isEnriching}
                    className="input-field w-full pr-10"
                    autoComplete="off"
                    aria-autocomplete="list"
                    aria-expanded={showSuggestions}
                    aria-controls="address-suggestions"
                />

                {/* Loading indicator */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isLoading && (
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    )}
                    {isEnriching && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-1"
                        >
                            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                            <span className="text-xs text-success">Enrichissement...</span>
                        </motion.div>
                    )}
                    {!isLoading && !isEnriching && inputValue.length >= 3 && (
                        <svg
                            className="w-4 h-4 text-muted"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    )}
                </div>
            </div>

            {/* Suggestions dropdown */}
            <AnimatePresence>
                {showSuggestions && (
                    <motion.ul
                        ref={listRef}
                        id="address-suggestions"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 w-full mt-1 bg-surface border border-boundary rounded-xl shadow-xl overflow-hidden"
                        role="listbox"
                    >
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={suggestion.label}
                                role="option"
                                aria-selected={index === selectedIndex}
                                className={`px-4 py-3 cursor-pointer transition-colors ${index === selectedIndex
                                        ? "bg-primary/10 text-primary"
                                        : "hover:bg-surface-hover"
                                    }`}
                                onClick={() => handleSelect(suggestion.value)}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-muted mt-0.5">📍</span>
                                    <div>
                                        <p className="text-sm font-medium text-main">
                                            {suggestion.value.properties.name || suggestion.value.properties.housenumber}{" "}
                                            {suggestion.value.properties.street}
                                        </p>
                                        <p className="text-xs text-muted">
                                            {suggestion.value.properties.postcode} {suggestion.value.properties.city}
                                            {suggestion.value.properties.context && (
                                                <span className="text-subtle"> — {suggestion.value.properties.context}</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}

                        {/* Attribution */}
                        <li className="px-4 py-2 bg-surface-hover border-t border-boundary">
                            <p className="text-[10px] text-subtle flex items-center gap-1">
                                <span>Propulsé par</span>
                                <a
                                    href="https://adresse.data.gouv.fr"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    API Adresse (BAN)
                                </a>
                            </p>
                        </li>
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}
