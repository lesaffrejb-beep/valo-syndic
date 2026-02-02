import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                obsidian: "#050505", // Obsidian absolute - Stealth Wealth
                charcoal: "#0A0B0D", // Surface level 1
                steel: "#12131A", // Surface level 2
                gold: {
                    DEFAULT: "#D4AF37",
                    dark: "#B8941F",
                    glow: "rgba(212, 175, 55, 0.15)",
                },
                electricBlue: {
                    DEFAULT: "#3B82F6",
                    light: "#60A5FA",
                },
                // Maintains existing semantic colors for code compatibility if needed, map to new system where possible
                primary: {
                    DEFAULT: "#D4AF37", // Mapped to Gold
                    glow: "rgba(212, 175, 55, 0.15)",
                },
                app: "#020202", // Pure Obsidian
                surface: "#080808",
                'surface-highlight': "#0D0D0D",
                'surface-hover': "#121212",
                main: "#F5F5F7", // Apple-style white
                muted: "#86868B",
                subtle: "#424245",
                boundary: "rgba(255, 255, 255, 0.06)",
                'boundary-active': "rgba(255, 255, 255, 0.12)",
                danger: {
                    DEFAULT: '#EF4444',
                    glow: 'rgba(239, 68, 68, 0.15)'
                },
                success: {
                    DEFAULT: '#10B981',
                    glow: 'rgba(16, 185, 129, 0.15)'
                },
                warning: {
                    DEFAULT: '#F59E0B',
                    glow: 'rgba(245, 158, 11, 0.15)'
                },
                finance: {
                    DEFAULT: '#D4AF37',
                    glow: 'rgba(212, 175, 55, 0.18)'
                },
                valuation: {
                    DEFAULT: '#10B981',
                    glow: 'rgba(16, 185, 129, 0.18)'
                },
                risks: {
                    DEFAULT: '#EF4444',
                    glow: 'rgba(239, 68, 68, 0.18)'
                }
            },
            backgroundImage: {
                'glass-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                'glass-shine': 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
                'active-gradient': 'linear-gradient(180deg, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0.05) 100%)',
                'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E\")",
            },
            boxShadow: {
                // C'est ICI que se joue le "Tactile"
                'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
                'inner-depth': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
                'neon-gold': '0 0 20px -5px rgba(212, 175, 55, 0.3)',
                'tactile-inner': 'inset 0 1px 1px 0 rgba(255,255,255,0.05), inset 0 2px 4px 0 rgba(0,0,0,0.5)',
                'glow-finance': '0 0 40px -10px rgba(212, 175, 55, 0.2)',
                'glow-risks': '0 0 40px -10px rgba(239, 68, 68, 0.2)',
                'glow-valuation': '0 0 40px -10px rgba(16, 185, 129, 0.2)',
            },
            backdropBlur: {
                'xs': '2px',
            },
            fontFamily: {
                sans: ["Inter", "Geist Sans", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            borderRadius: {
                'card': '16px',
            },
        },
    },
    plugins: [],
};

export default config;
