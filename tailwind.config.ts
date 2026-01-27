import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // ================================================
                // PALETTE "PRIVATE EQUITY" — Statutaire & Prestige
                // ================================================

                // Primary: Midnight Blue (Autorité, Droit, Confiance)
                primary: {
                    50: "#f8fafc",
                    100: "#f1f5f9",
                    200: "#e2e8f0",
                    300: "#cbd5e1",
                    400: "#94a3b8",
                    500: "#64748b",
                    600: "#475569",
                    700: "#334155",
                    800: "#1e293b",
                    900: "#0f172a",
                    950: "#020617",
                },

                // Accent: Champagne Gold (Valeur, Patrimoine)
                accent: {
                    50: "#fefce8",
                    100: "#fef9c3",
                    200: "#fef08a",
                    300: "#fde047",
                    400: "#d4a853", // Champagne
                    500: "#b8860b", // Dark Goldenrod
                    600: "#9a7209",
                    700: "#7c5c07",
                    800: "#5e4506",
                    900: "#3f2e04",
                },

                // Danger: Keep warm but sophisticated
                danger: {
                    50: "#fef2f2",
                    100: "#fee2e2",
                    200: "#fecaca",
                    300: "#fca5a5",
                    500: "#b91c1c", // Plus sombre, moins criard
                    600: "#991b1b",
                    700: "#7f1d1d",
                    800: "#5c1515",
                },

                // Warning: Bronze / Ambre chaud
                warning: {
                    50: "#fffbeb",
                    100: "#fef3c7",
                    200: "#fde68a",
                    500: "#b45309",
                    600: "#92400e",
                    700: "#78350f",
                },

                // Success: Forest Green (Vert Anglais, élégant)
                success: {
                    50: "#f0fdf4",
                    100: "#dcfce7",
                    200: "#bbf7d0",
                    300: "#86efac",
                    500: "#166534", // Forest Green
                    600: "#14532d", // Plus sombre
                    700: "#0f3d22",
                    800: "#0a2818",
                },

                // Background: Off-White / Alabaster
                background: {
                    DEFAULT: "#f9fafb",
                    paper: "#ffffff",
                    muted: "#f1f5f9",
                },
            },
            fontFamily: {
                // Serif pour titres (Prestige, Contrat, Officiel)
                serif: ["Playfair Display", "Georgia", "serif"],
                // Sans-serif pour corps (Lisibilité)
                sans: ["Inter", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            boxShadow: {
                // Ombres "Glass & Steel" — douces et élégantes
                'premium': '0 4px 6px -1px rgba(15, 23, 42, 0.04), 0 2px 4px -1px rgba(15, 23, 42, 0.03)',
                'premium-lg': '0 10px 15px -3px rgba(15, 23, 42, 0.05), 0 4px 6px -2px rgba(15, 23, 42, 0.03)',
                'premium-xl': '0 20px 25px -5px rgba(15, 23, 42, 0.05), 0 10px 10px -5px rgba(15, 23, 42, 0.02)',
                'gold': '0 4px 14px 0 rgba(180, 134, 11, 0.15)',
            },
            borderRadius: {
                // Arrondis modérés (pas trop startup)
                'premium': '0.625rem', // 10px
            },
        },
    },
    plugins: [],
};

export default config;
