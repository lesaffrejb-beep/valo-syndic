"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface BrandSettings {
    agencyName: string;
    logoUrl: string | null;
    primaryColor: string;
    contactEmail: string;
    contactPhone: string;
}

interface BrandContextType {
    brand: BrandSettings;
    updateBrand: (settings: Partial<BrandSettings>) => void;
    resetBrand: () => void;
}

const DEFAULT_BRAND: BrandSettings = {
    agencyName: "VALO-SYNDIC",
    logoUrl: null,
    primaryColor: "#0f172a", // slate-900 default
    contactEmail: "contact@valo-syndic.fr",
    contactPhone: "01 23 45 67 89",
};

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
    const [brand, setBrand] = useState<BrandSettings>(DEFAULT_BRAND);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("valo_brand_settings");
        if (saved) {
            try {
                setBrand({ ...DEFAULT_BRAND, ...JSON.parse(saved) });
            } catch (e) {
                console.error("Failed to parse brand settings", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("valo_brand_settings", JSON.stringify(brand));

            // Apply primary color variable if customized
            if (brand.primaryColor !== DEFAULT_BRAND.primaryColor) {
                // Note: Implementing full dynamic theme is complex with Tailwind, 
                // for now we just store the value for the Logo/Header usage.
            }
        }
    }, [brand, isLoaded]);

    const updateBrand = (settings: Partial<BrandSettings>) => {
        setBrand((prev) => ({ ...prev, ...settings }));
    };

    const resetBrand = () => {
        setBrand(DEFAULT_BRAND);
        localStorage.removeItem("valo_brand_settings");
    };

    return (
        <BrandContext.Provider value={{ brand, updateBrand, resetBrand }}>
            {children}
        </BrandContext.Provider>
    );
}

export function useBrand() {
    const context = useContext(BrandContext);
    if (context === undefined) {
        throw new Error("useBrand must be used within a BrandProvider");
    }
    return context;
}
