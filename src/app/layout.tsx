import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "VALO-SYNDIC | Diagnostic Flash Immobilier",
    description:
        "Générez votre plan de valorisation patrimoniale en 60 secondes. Simulation MaPrimeRénov' Copropriété et Éco-PTZ.",
    keywords: [
        "syndic",
        "copropriété",
        "rénovation énergétique",
        "DPE",
        "MaPrimeRénov",
        "financement travaux",
    ],
    authors: [{ name: "VALO-SYNDIC" }],
    robots: "noindex, nofollow", // MVP privé
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr" className={inter.variable}>
            <body className="min-h-screen bg-gray-50">
                {children}
            </body>
        </html>
    );
}
