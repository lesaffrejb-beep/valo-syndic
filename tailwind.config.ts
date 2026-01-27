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
                // 1. BASES (Le "Canvas" — Cockpit Jet Privé)
                app: '#0B0C0E',           // Fond de page (Anthracite profond Finary)
                'app-darker': '#06070A',  // Inputs (Encore plus profond)
                surface: '#161719',       // Cartes (Léger détachement)
                'surface-hover': '#1F2125', // Interaction card
                'surface-highlight': '#1A1B1E', // Pour details/accordion

                // 2. BRAND (L'Identité Champagne Mat)
                primary: {
                    DEFAULT: '#D4B679',     // Champagne Mat (L'Or Finary)
                    50: '#FAF6ED',
                    100: '#F2E9D4',
                    200: '#E8D5B0',
                    400: '#C9A85C',         // Hover state
                    600: '#B89B4A',         // Active state
                    700: '#9A7F3A',
                    800: '#7A642D',
                    900: '#5A4A22',
                    glow: 'rgba(212, 182, 121, 0.15)', // Effet lumineux
                },
                'primary-foreground': '#000000',    // Texte sur bouton primary

                // 3. TEXT (Hiérarchie)
                main: '#FFFFFF',          // Titres & Valeurs
                muted: '#9CA3AF',         // Labels & Légendes (Gris froid)
                subtle: '#4B5563',        // Bordures discrètes ou placeholder

                // 4. BORDERS (Structure)
                boundary: 'rgba(255, 255, 255, 0.08)', // Ligne plus visible pour séparation bento
                'boundary-active': 'rgba(255, 255, 255, 0.1)',

                // 5. SEMANTIC (États — Neon subtil)
                success: {
                    DEFAULT: '#10B981',
                    50: 'rgba(16, 185, 129, 0.05)',
                    100: 'rgba(16, 185, 129, 0.1)',
                    500: '#10B981',
                    600: '#059669',
                },
                warning: {
                    DEFAULT: '#F59E0B',
                    50: 'rgba(245, 158, 11, 0.05)',
                    100: 'rgba(245, 158, 11, 0.1)',
                    500: '#F59E0B',
                    600: '#D97706',
                },
                danger: {
                    DEFAULT: '#EF4444',
                    50: 'rgba(239, 68, 68, 0.05)',
                    100: 'rgba(239, 68, 68, 0.1)',
                    500: '#EF4444',
                    600: '#DC2626',
                },

                // Legacy / Compat
                background: '#0B0C0E',
                foreground: '#FFFFFF',
            },
            borderRadius: {
                'card': '24px',
                'input': '16px',
                'xl': '16px',
                '2xl': '24px',
            },
            spacing: {
                'section': '48px',
                'card-pad': '32px', // Padding interne des cartes (aéré)
            },
            fontFamily: {
                sans: ["Inter", "Geist Sans", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            boxShadow: {
                'glow': '0 0 20px rgba(212, 182, 121, 0.15)',
            },
        },
    },
    plugins: [],
};

export default config;
