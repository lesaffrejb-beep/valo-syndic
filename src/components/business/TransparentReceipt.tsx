/**
 * TransparentReceipt — Ticket de Caisse Transparent
 * ==================================================
 * Affichage vertical ultra-clair de la décomposition financière.
 * Conçu pour la transparence et la confiance.
 *
 * AUDIT 31/01/2026: Composant créé pour clarifier le montage financier
 * - Distingue clairement aides (non remboursables) et prêt (à rembourser)
 * - Affiche la mensualité réelle
 * - Compare avec l'économie d'énergie estimée
 */

"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/calculator";
import { useViewModeStore } from "@/stores/useViewModeStore";
import { type FinancingPlan } from "@/lib/schemas";

interface TransparentReceiptProps {
    /** Plan de financement calculé */
    financing: FinancingPlan;
    /** Économie d'énergie mensuelle estimée (optionnel) */
    monthlyEnergySaving?: number;
    /** Nom de l'aide locale si applicable */
    localAidName?: string;
    /** Affichage compact */
    compact?: boolean;
}

export function TransparentReceipt({
    financing,
    monthlyEnergySaving = 0,
    localAidName = "Aide locale",
    compact = false,
}: TransparentReceiptProps) {
    const { getAdjustedValue, viewMode } = useViewModeStore();
    const isMaPoche = viewMode === 'maPoche';

    // Ajuster les valeurs selon le mode de vue
    const adjust = (value: number) => getAdjustedValue(value);

    // Calculer le "vrai" effort mensuel (prêt - économie énergie)
    const netMonthlyEffort = financing.monthlyPayment - monthlyEnergySaving;

    // Taux de couverture par les aides (hors prêt)
    const totalAidsWithoutLoan = financing.mprAmount + financing.amoAmount + financing.localAidAmount + financing.ceeAmount;
    const totalCostTTC = financing.totalCostHT * 1.055; // Approximation TTC
    const aidsCoveragePercent = totalCostTTC > 0 ? (totalAidsWithoutLoan / totalCostTTC) * 100 : 0;

    const containerClass = compact
        ? "card-bento p-4"
        : "card-bento p-6";

    return (
        <motion.div
            className={containerClass}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-boundary/50">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🧾</span>
                    <h3 className="text-lg font-bold text-main">
                        Détail Financement {isMaPoche && "(Ma Part)"}
                    </h3>
                </div>
                <div className="text-xs text-muted bg-surface-highlight px-2 py-1 rounded">
                    Taux couverture: <span className="font-bold text-success-400">{aidsCoveragePercent.toFixed(0)}%</span>
                </div>
            </div>

            {/* Receipt Body */}
            <div className="font-mono text-sm space-y-1">
                {/* Coût Total */}
                <ReceiptLine
                    label="COÛT TOTAL TRAVAUX (TTC)"
                    value={adjust(totalCostTTC)}
                    isTotal
                />

                <ReceiptDivider />

                {/* Section Aides (Non Remboursables) */}
                <ReceiptSection title="AIDES PUBLIQUES (Non remboursables)" />

                <ReceiptLine
                    label={`  MPR Copro (${Math.round(financing.mprRate * 100)}%)`}
                    value={-adjust(financing.mprAmount)}
                    isNegative
                />
                <ReceiptLine
                    label="  Aide AMO"
                    value={-adjust(financing.amoAmount)}
                    isNegative
                />
                {financing.localAidAmount > 0 && (
                    <ReceiptLine
                        label={`  ${localAidName}`}
                        value={-adjust(financing.localAidAmount)}
                        isNegative
                    />
                )}
                {financing.ceeAmount > 0 && (
                    <ReceiptLine
                        label="  CEE (Certificats Énergie)"
                        value={-adjust(financing.ceeAmount)}
                        isNegative
                    />
                )}

                <ReceiptSubtotal
                    label="Sous-total Aides"
                    value={-adjust(totalAidsWithoutLoan)}
                />

                <ReceiptDivider />

                {/* Reste à Financer */}
                <ReceiptLine
                    label="RESTE À FINANCER"
                    value={adjust(financing.remainingCost + financing.ecoPtzAmount)}
                    isTotal
                />

                <ReceiptDivider />

                {/* Section Financement */}
                <ReceiptSection title="FINANCEMENT" />

                {financing.ecoPtzAmount > 0 && (
                    <ReceiptLine
                        label="  Éco-PTZ (0%, 20 ans)"
                        value={-adjust(financing.ecoPtzAmount)}
                        isNegative
                        hint="Prêt à rembourser"
                    />
                )}

                <ReceiptDivider />

                {/* Apport Personnel */}
                <ReceiptLine
                    label="APPORT PERSONNEL REQUIS"
                    value={adjust(financing.remainingCost)}
                    isTotal
                    highlight={financing.remainingCost === 0 ? "success" : "warning"}
                />

                <ReceiptDivider variant="double" />

                {/* Section Mensualités */}
                {financing.ecoPtzAmount > 0 && (
                    <>
                        <ReceiptSection title="EFFORT MENSUEL" />

                        <ReceiptLine
                            label="  Mensualité Éco-PTZ"
                            value={adjust(financing.monthlyPayment)}
                            suffix="/mois"
                        />

                        {monthlyEnergySaving > 0 && (
                            <>
                                <ReceiptLine
                                    label="  Économie énergie estimée"
                                    value={-adjust(monthlyEnergySaving)}
                                    isNegative
                                    suffix="/mois"
                                />

                                <ReceiptDivider />

                                <ReceiptLine
                                    label="EFFORT NET RÉEL"
                                    value={adjust(netMonthlyEffort)}
                                    suffix="/mois"
                                    isTotal
                                    highlight={netMonthlyEffort <= 0 ? "success" : "neutral"}
                                />
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Footer Notes */}
            <div className="mt-4 pt-3 border-t border-boundary/30 space-y-2">
                {financing.ecoPtzAmount > 0 && (
                    <p className="text-[10px] text-muted leading-relaxed">
                        <span className="text-warning-400 font-semibold">Important :</span> L&apos;Éco-PTZ est un prêt sans intérêts, mais le capital doit être remboursé.
                        Mensualité indicative sur 20 ans.
                    </p>
                )}
                {monthlyEnergySaving > 0 && (
                    <p className="text-[10px] text-muted leading-relaxed">
                        <span className="text-primary font-semibold">Économie énergie :</span> Estimation basée sur le gain de classe DPE. Varie selon usage et tarifs.
                    </p>
                )}
            </div>
        </motion.div>
    );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface ReceiptLineProps {
    label: string;
    value: number;
    isTotal?: boolean;
    isNegative?: boolean;
    suffix?: string;
    hint?: string;
    highlight?: "success" | "warning" | "neutral";
}

function ReceiptLine({
    label,
    value,
    isTotal = false,
    isNegative = false,
    suffix = "",
    hint,
    highlight,
}: ReceiptLineProps) {
    const valueClass = isNegative
        ? "text-success-400"
        : isTotal
            ? highlight === "success"
                ? "text-success-400 font-bold"
                : highlight === "warning"
                    ? "text-warning-400 font-bold"
                    : "text-main font-bold"
            : "text-muted";

    const labelClass = isTotal ? "text-main font-semibold" : "text-muted";

    return (
        <div className="flex justify-between items-baseline py-0.5">
            <div className="flex items-center gap-2">
                <span className={labelClass}>{label}</span>
                {hint && (
                    <span className="text-[9px] text-warning-400/70 bg-warning-900/20 px-1 rounded">
                        {hint}
                    </span>
                )}
            </div>
            <span className={`tabular-nums ${valueClass}`}>
                {isNegative && value < 0 ? "" : value > 0 && !isTotal ? "+" : ""}
                {formatCurrency(Math.abs(value))}{suffix}
            </span>
        </div>
    );
}

function ReceiptDivider({ variant = "single" }: { variant?: "single" | "double" }) {
    return variant === "double" ? (
        <div className="py-1">
            <div className="border-t border-boundary/50"></div>
            <div className="border-t border-boundary/50 mt-0.5"></div>
        </div>
    ) : (
        <div className="border-t border-dashed border-boundary/30 my-1"></div>
    );
}

function ReceiptSection({ title }: { title: string }) {
    return (
        <p className="text-xs font-semibold text-muted uppercase tracking-wider pt-2 pb-1">
            {title}
        </p>
    );
}

function ReceiptSubtotal({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex justify-between items-baseline py-1 border-t border-boundary/20 mt-1">
            <span className="text-muted text-xs italic">{label}</span>
            <span className="tabular-nums text-success-400 font-medium">
                {formatCurrency(value)}
            </span>
        </div>
    );
}
