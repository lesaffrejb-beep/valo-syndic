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

        // Colors
        const C_BG = "0B0C0E";
        const C_CARD = "161719";
        const C_TEXT = "FFFFFF";
        const C_MUTED = "9CA3AF";
        const C_GOLD = "D4B679";
        const C_ACCENT = "B89B4A";

        // Define clean theme
        pres.defineSlideMaster({
            title: "MASTER_SLIDE",
            background: { color: C_BG },
            objects: [
                { rect: { x: 0, y: 0, w: "100%", h: 0.15, fill: { color: C_GOLD } } }, // Gold top bar
                { text: { text: "VALO-SYNDIC", options: { x: 0.5, y: 0.3, fontSize: 12, color: C_BG, bold: true } } },
                {
                    text: { text: "Diagnostic Patrimonial", options: { x: 2, y: 0.3, fontSize: 10, color: C_BG } }
                },
                {
                    text: { text: new Date().toLocaleDateString("fr-FR"), options: { x: 12, y: 0.3, fontSize: 10, color: C_BG, align: "right" } },
                }],
        });

        // --- SLIDE 1: Cover ---
        const slide1 = pres.addSlide({ masterName: "MASTER_SLIDE" });

        // Hero Card
        slide1.addShape(pres.ShapeType.roundRect, { x: 1, y: 1.5, w: 11.33, h: 4.5, fill: { color: C_CARD }, line: { color: "333333", width: 1 } });

        slide1.addText("AUDIT ÉNERGÉTIQUE\n& FINANCIER", {
            x: 1.5, y: 2.2, w: 10, h: 2,
            fontSize: 48, fontFace: "Arial", color: C_GOLD, bold: true
        });

        slide1.addText(`${result.input.address || "Votre Copropriété"}\n${result.input.numberOfUnits} lots • Date : ${new Date().toLocaleDateString("fr-FR")}`, {
            x: 1.5, y: 4.2, w: 10, h: 1.5,
            fontSize: 20, color: C_MUTED
        });

        // --- SLIDE 2: Bilan Énergétique ---
        const slide2 = pres.addSlide({ masterName: "MASTER_SLIDE" });
        slide2.addText("Situation Actuelle & Cible", { x: 0.5, y: 0.8, fontSize: 24, color: C_TEXT, bold: true });

        // Left Card: DPE
        slide2.addShape(pres.ShapeType.roundRect, { x: 0.5, y: 1.5, w: 5, h: 5, fill: { color: C_CARD }, line: { color: "333333" } });
        slide2.addText("DPE ACTUEL", { x: 0.8, y: 2, fontSize: 14, color: C_MUTED, bold: true });
        slide2.addText(result.input.currentDPE, { x: 0.8, y: 3, fontSize: 60, color: C_GOLD, bold: true });
        slide2.addText(`${result.input.currentDPE} kWh/m²/an`, { x: 0.8, y: 4.2, fontSize: 14, color: C_TEXT });

        // Right Card: Project
        slide2.addShape(pres.ShapeType.roundRect, { x: 6, y: 1.5, w: 6.8, h: 5, fill: { color: C_CARD }, line: { color: "333333" } });
        slide2.addText("OBJECTIF TRAVAUX", { x: 6.3, y: 2, fontSize: 14, color: C_MUTED, bold: true });

        slide2.addText(`Passage en DPE ${result.input.targetDPE}`, { x: 6.3, y: 2.8, fontSize: 28, color: "10B981", bold: true });
        slide2.addText(`Estimation Travaux: ${result.financing.totalCostHT.toLocaleString()} € HT`, { x: 6.3, y: 3.5, fontSize: 18, color: C_TEXT });

        const urgencyScore = result.compliance.isProhibited ? 100 : 50;
        slide2.addText(`Urgence: ${urgencyScore}%`, { x: 6.3, y: 4.5, fontSize: 14, color: (urgencyScore > 70 ? "EF4444" : "F59E0B") });


        // --- SLIDE 3: Financement ---
        const slide3 = pres.addSlide({ masterName: "MASTER_SLIDE" });
        slide3.addText("Plan de Financement Simplifié", { x: 0.5, y: 0.8, fontSize: 24, color: C_TEXT, bold: true });

        // Table Card
        slide3.addShape(pres.ShapeType.roundRect, { x: 0.5, y: 1.5, w: 12.33, h: 5, fill: { color: C_CARD }, line: { color: "333333" } });

        const rows = [
            [
                { text: "POSTE DE DÉPENSE / RECETTE", options: { fill: C_ACCENT, color: "000000", bold: true } },
                { text: "MONTANT GLOBAL", options: { fill: C_ACCENT, color: "000000", bold: true, align: "right" } },
                { text: "PAR LOT (Moy.)", options: { fill: C_ACCENT, color: "000000", bold: true, align: "right" } }
            ],
            ["Coût Total Travaux", `${result.financing.totalCostHT.toLocaleString()} €`, `${result.financing.costPerUnit.toLocaleString()} €`],
            ["MaPrimeRénov' Copropriété", `-${result.financing.mprAmount.toLocaleString()} €`, `-${(result.financing.mprAmount / result.input.numberOfUnits).toLocaleString(undefined, { maximumFractionDigits: 0 })} €`],
            ["Éco-PTZ (Avance Trésorerie)", `${result.financing.ecoPtzAmount.toLocaleString()} €`, `${(result.financing.ecoPtzAmount / result.input.numberOfUnits).toLocaleString(undefined, { maximumFractionDigits: 0 })} €`],
            [{ text: "RESTE À CHARGE RÉEL", options: { bold: true, color: C_GOLD } }, { text: `${result.financing.remainingCost.toLocaleString()} €`, options: { bold: true, color: C_GOLD, align: "right" } }, { text: `${result.financing.remainingCostPerUnit.toLocaleString()} €`, options: { bold: true, color: C_GOLD, align: "right" } }],
        ];

        slide3.addTable(rows as any[], {
            x: 1, y: 2, w: 11.33,
            color: C_TEXT,
            border: { color: "333333", pt: 1 },
            fill: { color: C_CARD },
            align: "left",
            margin: 10
        });

        slide3.addText("*Estimations à titre indicatif, ne valant pas offre de prêt.", { x: 1, y: 6.6, fontSize: 10, color: C_MUTED });

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
