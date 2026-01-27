import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/AppProviders";

// Typographie Sans-Serif : Lisibilité corps de texte & chiffres
const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

// Typographie Serif : Titres prestige (Contrat, Officiel)
const playfair = Playfair_Display({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-playfair",
    weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
    title: "VALO-SYNDIC | Diagnostic Patrimonial",
    description:
        "Votre plan de valorisation patrimoniale en 60 secondes. Simulation MaPrimeRénov' Copropriété et Éco-PTZ.",
    keywords: [
        "syndic",
        "copropriété",
        "rénovation énergétique",
        "DPE",
        "MaPrimeRénov",
        "financement travaux",
        "patrimoine immobilier",
    ],
    authors: [{ name: "VALO-SYNDIC" }],
    robots: "noindex, nofollow", // MVP privé
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
            <body className="min-h-screen bg-background font-sans antialiased">
                <AppProviders>
                    {children}
                </AppProviders>
            </body>
        </html>
    );
}
