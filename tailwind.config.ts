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
                // PALETTE "FINTECH EDITORIAL" — Obsidian + Gold Alchimique
                // Références : Linear, Finary, Cron, Vercel
                // ================================================

                // Backgrounds (Obsidienne — Plus profond que noir)
                background: {
                    DEFAULT: "#020202", // Obsidian
                    paper: "#020202",
                    muted: "#0a0a0a",
                },

                // Surfaces (Glass Panels)
                surface: {
                    DEFAULT: "rgba(10, 10, 10, 0.8)", // Semi-transparent
                    highlight: "rgba(30, 30, 30, 0.9)", // Hover state
                },

                // Borders (Ultra-subtiles + Lumière)
                borders: {
                    DEFAULT: "rgba(255, 255, 255, 0.05)",
                    highlight: "rgba(255, 255, 255, 0.1)",
                },

                // Primary: Gold Finary/Luxe (Action, Prestige)
                primary: {
                    DEFAULT: "#E0B976", // Base Gold
                    50: "#fbf8f1",
                    100: "#f6eedd",
                    200: "#ebdab9",
                    300: "#dec08f",
                    400: "#d1a360",
                    500: "#E0B976", // Base
                    600: "#b38848",
                    700: "#8f6738",
                    800: "#755233",
                    900: "#61442e",
                    950: "#362417",
                },

                // Text Colors
                text: {
                    main: "#EDEDED", // Blanc cassé (Lecture)
                    muted: "#A1A1AA", // Gris moyen (Secondaire)
                    inverse: "#050505", // Sur fond Gold
                },

                // Accent: Champagne Gold (Aliases for legacy compatibility)
                accent: {
                    400: "#d4a853",
                    500: "#b8860b",
                    600: "#9a7209",
                },

                // Status Colors (Neon / Dark Mode Optimized)
                danger: {
                    DEFAULT: "#FF453A", // Rouge Apple Dark
                    500: "#FF453A",
                    600: "#D73A30",
                },
                warning: {
                    DEFAULT: "#FFD60A", // Jaune Néon
                    500: "#FFD60A",
                    600: "#D6B408",
                },
                success: {
                    DEFAULT: "#32D74B", // Vert Néon
                    500: "#32D74B",
                    600: "#28AC3C",
                },
            },
            fontFamily: {
                // Serif pour titres (Prestige, Contrat, Officiel)
                serif: ["Playfair Display", "Georgia", "serif"],
                // Sans-serif pour corps (Lisibilité)
                sans: ["Inter", "Geist Sans", "system-ui", "sans-serif"], // Added Geist Sans idea
                mono: ["JetBrains Mono", "monospace"],
            },
            boxShadow: {
                // Ombres "Glass & Steel" — très subtiles sur fond noir
                'premium': '0 4px 20px -1px rgba(0, 0, 0, 0.5)',
                'glow': '0 0 15px rgba(224, 185, 118, 0.15)', // Gold Glow
            },
            borderRadius: {
                'xl': '0.75rem', // 12px for cards
                '2xl': '1rem',   // 16px for containers
            },
        },
    },
    plugins: [],
};

export default config;
