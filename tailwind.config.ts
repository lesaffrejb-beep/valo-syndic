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
                app: '#09090B',           // Obsidian Deep Black
                'app-darker': '#000000',  // Pure Black for Inputs
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
                muted: '#A1A1AA',         // Zinc-400 (Gris froid tech)
                subtle: '#52525B',        // Zinc-600

                // 4. BORDERS (Structure)
                boundary: 'rgba(255, 255, 255, 0.08)', // Ligne plus visible pour séparation bento
                'boundary-active': 'rgba(255, 255, 255, 0.15)',

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
                background: '#09090B',
                foreground: '#FFFFFF',
            },
            borderRadius: {
                'card': '16px', // Rounded-xl standard
                'input': '12px',
                'xl': '16px',
                '2xl': '24px',
                '3xl': '32px',
            },
            spacing: {
                'section': '48px',
                'card-pad': '24px', // Padding interne des cartes
            },
            fontFamily: {
                sans: ["Inter", "Geist Sans", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            boxShadow: {
                'glow': '0 0 20px rgba(212, 182, 121, 0.15)',
                'glow-active': '0 0 40px rgba(212, 182, 121, 0.25)',
                'obsidian': '0 4px 40px -10px rgba(0, 0, 0, 0.5)', // Deep shadow
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            },
        },
    },
    plugins: [],
};

export default config;
