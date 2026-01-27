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
                // 1. BASES (Le "Canvas")
                app: '#0B0C0E',           // Le fond de page (Anthracite profond Finary)
                surface: '#161719',       // Les cartes (Léger détachement)
                'surface-hover': '#1F2125', // Interaction

                // 2. BRAND (L'Identité)
                primary: '#D4B679',       // Champagne Mat (L'Or Finary)
                'primary-foreground': '#000000',    // Texte sur bouton primary

                // 3. TEXT (Hiérarchie)
                main: '#FFFFFF',          // Titres & Valeurs
                muted: '#9CA3AF',         // Labels & Légendes (Gris froid)
                subtle: '#4B5563',        // Bordures discrètes ou placeholder

                // 4. BORDERS (Structure)
                boundary: 'rgba(255, 255, 255, 0.04)', // Ligne quasi invisible
                'boundary-active': 'rgba(255, 255, 255, 0.1)',

                // Legacy / Compat
                background: '#0B0C0E',
                foreground: '#FFFFFF',
                success: '#10B981',
                warning: '#F59E0B',
                danger: '#EF4444',
            },
            borderRadius: {
                'card': '24px',
                'input': '16px',
                'xl': '16px',
                '2xl': '24px',
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
