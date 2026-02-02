import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                deep: {
                    DEFAULT: "#030304",
                    surface: "#08080A",
                    highlight: "#121214",
                },
                gold: {
                    DEFAULT: "#E5C07B", // More desaturated rich gold
                    light: "#F2D8A7",
                    dark: "#997D3D",
                    glow: "rgba(229, 192, 123, 0.2)",
                    subtle: "rgba(229, 192, 123, 0.08)",
                },
                accent: {
                    blue: "#3B82F6",
                    purple: "#8B5CF6",
                    teal: "#10B981",
                    rose: "#F43F5E",
                },
                // Legacy support (mapped)
                obsidian: "#030304",
                charcoal: "#0A0B0D",
                steel: "#12131A",
                primary: {
                    DEFAULT: "#E5C07B",
                    glow: "rgba(229, 192, 123, 0.2)",
                },
                app: "#000000",
                surface: "#0A0A0A",
                'surface-highlight': "#171717",
                'surface-hover': "#262626",
                main: "#EDEDED",
                muted: "#A1A1AA",
                subtle: "#52525B",
                boundary: "rgba(255, 255, 255, 0.08)",
                'boundary-active': "rgba(255, 255, 255, 0.16)",
                danger: { DEFAULT: '#FF4D4D', glow: 'rgba(255, 77, 77, 0.2)' },
                success: { DEFAULT: '#34D399', glow: 'rgba(52, 211, 153, 0.2)' },
                warning: { DEFAULT: '#FBBF24', glow: 'rgba(251, 191, 36, 0.2)' },
                finance: { DEFAULT: '#E5C07B', glow: 'rgba(229, 192, 123, 0.2)' },
                valuation: { DEFAULT: '#34D399', glow: 'rgba(52, 211, 153, 0.2)' },
                risks: { DEFAULT: '#FF4D4D', glow: 'rgba(255, 77, 77, 0.2)' }
            },
            backgroundImage: {
                'hero-glow': 'radial-gradient(circle at 50% 0%, rgba(229, 192, 123, 0.15), transparent 70%)',
                'section-gradient-1': 'radial-gradient(circle at 80% 20%, rgba(255, 77, 77, 0.08), transparent 50%)', // Risks - Red subtile
                'section-gradient-2': 'radial-gradient(circle at 20% 80%, rgba(52, 211, 153, 0.08), transparent 50%)', // Valuation - Green subtile
                'section-gradient-3': 'radial-gradient(circle at 50% 50%, rgba(229, 192, 123, 0.05), transparent 60%)', // Finance - Gold subtile
                'glass-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                'glass-shine': 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.1) 45%, transparent 60%)',
                'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E\")",
            },
            boxShadow: {
                'tactile': '0 20px 40px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
                'tactile-hover': '0 30px 60px -12px rgba(0, 0, 0, 0.9), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)',
                'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
                'neon-gold': '0 0 20px -5px rgba(229, 192, 123, 0.3)',
                'glow-finance': '0 0 50px -15px rgba(229, 192, 123, 0.2)',
                'glow-risks': '0 0 50px -15px rgba(255, 77, 77, 0.2)',
                'glow-valuation': '0 0 50px -15px rgba(52, 211, 153, 0.2)',
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
