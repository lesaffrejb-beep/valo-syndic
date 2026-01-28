"use client";

import { type DiagnosticResult } from "@/lib/schemas";
import { motion } from "framer-motion";

interface DownloadPptxButtonProps {
    result: DiagnosticResult;
}

export function DownloadPptxButton({ result }: DownloadPptxButtonProps) {
    const generatePptx = async () => {

        // Dynamic import to avoid SSR/Build issues with node modules
        const pptxgen = (await import("pptxgenjs")).default;
        // 1. Init Presentation
        const pres = new pptxgen();
        pres.layout = "LAYOUT_16x9";

        // MATTE LUXURY THEME COLORS
        const C_BG = "0B0C0E";        // Anthracite Profond
        const C_CARD = "161719";      // Gris Bento
        const C_BORDER = "333333";    // Bordures subtiles
        const C_TEXT = "FFFFFF";      // Titres Blancs
        const C_MUTED = "A1A1AA";     // Sous-titres Gris
        const C_GOLD = "D4B679";      // Accents OR
        const C_SUCCESS = "10B981";   // Vert Succès
        const C_DANGER = "EF4444";    // Rouge Perte

        // Define clean theme
        pres.defineSlideMaster({
            title: "MASTER_SLIDE",
            background: { color: C_BG },
            objects: [
                // Top Bar Gold
                { rect: { x: 0, y: 0, w: "100%", h: 0.1, fill: { color: C_GOLD } } },
                // Logo Area
                { text: { text: "VALO-SYNDIC", options: { x: 0.5, y: 0.25, fontSize: 12, color: C_TEXT, bold: true, fontFace: "Helvetica Neue" } } },
                // Title Area
                { text: { text: "DIAGNOSTIC PATRIMONIAL 2026", options: { x: 2.5, y: 0.25, fontSize: 10, color: C_MUTED, fontFace: "Helvetica Neue" } } },
                // Date
                { text: { text: new Date().toLocaleDateString("fr-FR"), options: { x: 12, y: 0.25, fontSize: 10, color: C_MUTED, align: "right", fontFace: "Helvetica Neue" } } },
            ],
        });

        // --- SLIDE 1: Cover ---
        const slide1 = pres.addSlide({ masterName: "MASTER_SLIDE" });

        // Background Hero Card
        slide1.addShape(pres.ShapeType.roundRect, {
            x: 1, y: 1.5, w: 11.33, h: 4.5,
            fill: { color: C_CARD },
            line: { color: C_BORDER, width: 1 }
        });

        slide1.addText("AUDIT DE VALORISATION\n& SCÉNARIO DE FINANCEMENT", {
            x: 1.5, y: 2.2, w: 10, h: 1.5,
            fontSize: 36, fontFace: "Helvetica Neue", color: C_GOLD, bold: true, align: "left"
        });

        slide1.addText(result.input.address || "Copropriété", {
            x: 1.5, y: 3.8, w: 10, h: 1,
            fontSize: 18, color: C_TEXT, bold: true, fontFace: "Helvetica Neue"
        });

        slide1.addText(`${result.input.numberOfUnits} lots • ${result.input.city || "75000 Paris"}`, {
            x: 1.5, y: 4.4, w: 10, h: 0.5,
            fontSize: 14, color: C_MUTED, fontFace: "Helvetica Neue"
        });

        // --- SLIDE 2: Bilan Énergétique ---
        const slide2 = pres.addSlide({ masterName: "MASTER_SLIDE" });
        slide2.addText("Situation Actuelle & Cible", { x: 0.5, y: 0.5, fontSize: 20, color: C_TEXT, bold: true, fontFace: "Helvetica Neue" });

        // Left Card: DPE
        slide2.addShape(pres.ShapeType.roundRect, { x: 0.5, y: 1.2, w: 5.5, h: 5, fill: { color: C_CARD }, line: { color: C_BORDER } });
        slide2.addText("DPE ACTUEL", { x: 0.8, y: 1.6, fontSize: 12, color: C_MUTED, bold: true });
        slide2.addText(result.input.currentDPE, { x: 0.8, y: 2.5, fontSize: 80, color: C_DANGER, bold: true, align: "center" });
        slide2.addText("ETIQUETTE ÉNERGIE", { x: 0.8, y: 4.5, fontSize: 10, color: C_MUTED, align: "center" });

        // Right Card: Project
        slide2.addShape(pres.ShapeType.roundRect, { x: 6.5, y: 1.2, w: 6.33, h: 5, fill: { color: C_CARD }, line: { color: C_BORDER } });
        slide2.addText("OBJECTIF APRÈS TRAVAUX", { x: 6.8, y: 1.6, fontSize: 12, color: C_MUTED, bold: true });

        slide2.addText(`CIBLE : DPE ${result.input.targetDPE}`, { x: 6.8, y: 2.5, fontSize: 24, color: C_SUCCESS, bold: true });
        slide2.addText(`Budget Estimé : ${Math.round(result.financing.totalCostHT / 1000)} k€ HT`, { x: 6.8, y: 3.2, fontSize: 18, color: C_TEXT });

        slide2.addText("GAIN ÉNERGÉTIQUE", { x: 6.8, y: 4.2, fontSize: 10, color: C_MUTED });
        slide2.addText(`${Math.round(result.financing.energyGainPercent * 100)}%`, { x: 6.8, y: 4.6, fontSize: 32, color: C_GOLD, bold: true });


        // --- SLIDE 3: Financement ---
        const slide3 = pres.addSlide({ masterName: "MASTER_SLIDE" });
        slide3.addText("Plan de Financement Simplifié", { x: 0.5, y: 0.5, fontSize: 20, color: C_TEXT, bold: true, fontFace: "Helvetica Neue" });

        // Table background
        slide3.addShape(pres.ShapeType.roundRect, { x: 0.5, y: 1.2, w: 12.33, h: 5.2, fill: { color: C_CARD }, line: { color: C_BORDER } });

        const rows = [
            [
                { text: "POSTE DE DÉPENSE / RECETTE", options: { fill: C_BG, color: C_MUTED, bold: true, fontSize: 10 } },
                { text: "GLOBAL COPRO", options: { fill: C_BG, color: C_MUTED, bold: true, align: "right", fontSize: 10 } },
                { text: "MOYENNE / LOT", options: { fill: C_BG, color: C_MUTED, bold: true, align: "right", fontSize: 10 } }
            ],
            ["Coût Total Travaux", { text: `${result.financing.totalCostHT.toLocaleString()} €`, options: { color: C_TEXT } }, { text: `${result.financing.costPerUnit.toLocaleString()} €`, options: { color: C_TEXT } }],
            ["MaPrimeRénov' Copropriété", { text: `-${result.financing.mprAmount.toLocaleString()} €`, options: { color: C_SUCCESS } }, { text: `-${(result.financing.mprAmount / result.input.numberOfUnits).toLocaleString(undefined, { maximumFractionDigits: 0 })} €`, options: { color: C_SUCCESS } }],
            ["Éco-PTZ (Avance Trésorerie)", { text: `${result.financing.ecoPtzAmount.toLocaleString()} €`, options: { color: C_GOLD } }, { text: `${(result.financing.ecoPtzAmount / result.input.numberOfUnits).toLocaleString(undefined, { maximumFractionDigits: 0 })} €`, options: { color: C_GOLD } }],
            [
                { text: "APPORT PERSONNEL NÉCESSAIRE", options: { bold: true, color: C_TEXT } },
                { text: `${result.financing.remainingCost.toLocaleString()} €`, options: { bold: true, color: C_TEXT, align: "right" } },
                { text: `${result.financing.remainingCostPerUnit.toLocaleString()} €`, options: { bold: true, color: C_TEXT, align: "right" } }
            ],
        ];

        slide3.addTable(rows as any[], {
            x: 1, y: 1.8, w: 11.33,
            color: C_TEXT,
            border: { color: C_BORDER, pt: 1 },
            fill: { color: C_BG },
            align: "left",
            fontFace: "Helvetica Neue",
            fontSize: 12
        });

        slide3.addShape(pres.ShapeType.line, { x: 1, y: 5.2, w: 11.33, h: 0, line: { color: C_BORDER, width: 1, dashType: "dash" } });
        slide3.addText("*Estimations à titre indicatif. Ne vaut pas offre de prêt.", { x: 1, y: 5.5, fontSize: 9, color: C_MUTED, italic: true });

        // 5. Generate
        await pres.writeFile({ fileName: `Audit_ValoSyndic_${new Date().toISOString().split('T')[0]}.pptx` });
    };

    return (
        <motion.button
            onClick={generatePptx}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg relative"
        >
            <span>📊</span>
            <span className="font-medium">PowerPoint</span>
            <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-warning-500 text-white text-[10px] font-bold rounded-full">
                Bêta
            </span>
        </motion.button>
    );
}

