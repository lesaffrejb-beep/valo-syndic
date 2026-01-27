"use client";

import { type DiagnosticResult } from "@/lib/schemas";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { motion } from "framer-motion";

interface DownloadPptxButtonProps {
    result: DiagnosticResult;
}

export function DownloadPptxButton({ result }: DownloadPptxButtonProps) {
    const { playSound } = useSoundEffects();

    const generatePptx = async () => {
        playSound("click");

        // Dynamic import to avoid SSR/Build issues with node modules
        const pptxgen = (await import("pptxgenjs")).default;
        // 1. Init Presentation
        const pres = new pptxgen();
        pres.layout = "LAYOUT_16x9";

        // Define clean theme
        pres.defineSlideMaster({
            title: "MASTER_SLIDE",
            background: { color: "0B0C0E" },
            objects: [
                { rect: { x: 0, y: 0, w: "100%", h: 0.1, fill: { color: "D4B679" } } }, // Gold top bar
                { text: { text: "VALO-SYNDIC", options: { x: 0.5, y: 0.3, fontSize: 10, color: "888888" } } },
                {
                    text: { text: "", options: { x: 12, y: 7.2, fontSize: 10, color: "666666", align: "right" } }, // Page number placeholder if needed
                }],
        });

        // 2. SLIDE 1: Cover
        const slide1 = pres.addSlide({ masterName: "MASTER_SLIDE" });

        slide1.addText("DIAGNOSTIC\nPATRIMONIAL", {
            x: 1, y: 2,
            w: 8, h: 2,
            fontSize: 44,
            fontFace: "Arial",
            color: "D4B679",
            bold: true
        });

        slide1.addText(`${result.input.address || "Votre Copropriété"}\n${result.input.numberOfUnits} lots`, {
            x: 1, y: 4,
            w: 8, h: 1.5,
            fontSize: 24,
            color: "FFFFFF"
        });

        slide1.addText(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, {
            x: 1, y: 6.5,
            fontSize: 12,
            color: "666666"
        });

        // 3. SLIDE 2: Bilan Énergétique
        const slide2 = pres.addSlide({ masterName: "MASTER_SLIDE" });
        slide2.addText("Bilan Énergétique", { x: 0.5, y: 0.8, fontSize: 24, color: "FFFFFF", bold: true });

        // DPE Comparison
        slide2.addText(`DPE Actuel: ${result.input.currentDPE}`, { x: 1, y: 2, fontSize: 18, color: "FFFFFF" });
        slide2.addText(`${result.input.currentDPE} kWh/m²/an`, { x: 1, y: 2.5, fontSize: 14, color: "D4B679" });

        slide2.addText(`DPE Cible: ${result.input.targetDPE}`, { x: 7, y: 2, fontSize: 18, color: "FFFFFF" });
        slide2.addText(`${result.input.targetDPE} kWh/m²/an`, { x: 7, y: 2.5, fontSize: 14, color: "10B981" });

        // Urgency
        const urgencyScore = result.compliance.isProhibited ? 100 : 50; // Simplified logic for demo
        slide2.addText("Score d'Urgence", { x: 1, y: 4, fontSize: 18, color: "FFFFFF" });
        slide2.addShape(pres.ShapeType.rect, { x: 1, y: 4.5, w: 5, h: 0.3, fill: { color: "333333" } });
        slide2.addShape(pres.ShapeType.rect, { x: 1, y: 4.5, w: 5 * (urgencyScore / 100), h: 0.3, fill: { color: urgencyScore > 70 ? "EF4444" : "F59E0B" } });

        // 4. SLIDE 3: Financement
        const slide3 = pres.addSlide({ masterName: "MASTER_SLIDE" });
        slide3.addText("Plan de Financement", { x: 0.5, y: 0.8, fontSize: 24, color: "FFFFFF", bold: true });

        const rows = [
            [{ text: "Poste", options: { fill: "333333", color: "FFFFFF", bold: true } }, { text: "Montant", options: { fill: "333333", color: "FFFFFF", bold: true } }],
            ["Coût Total Travaux", `${result.financing.totalCostHT.toLocaleString()} €`],
            ["MaPrimeRénov' Copro", `-${result.financing.mprAmount.toLocaleString()} €`],
            ["Quote-part Moyenne", `${result.financing.costPerUnit.toLocaleString()} €`],
            ["Reste à charge (moyen)", `${result.financing.remainingCostPerUnit.toLocaleString()} €`],
        ];

        slide3.addTable(rows as any[], {
            x: 1, y: 2, w: 8,
            color: "FFFFFF",
            border: { color: "444444" },
            fill: { color: "0B0C0E" }
        });

        // 5. Generate
        await pres.writeFile({ fileName: `ValoSyndic_${Date.now()}.pptx` });
    };

    return (
        <motion.button
            onClick={generatePptx}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-[#D04423] text-white rounded-lg hover:bg-[#b03a1e] transition-colors shadow-lg"
        >
            <span>📊</span>
            <span className="font-medium">PowerPoint</span>
        </motion.button>
    );
}
