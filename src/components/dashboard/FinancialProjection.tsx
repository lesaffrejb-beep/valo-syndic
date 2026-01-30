/**
 * FinancialProjection — Projection Financière
 * ============================================
 * Affiche les économies et le ROI post-travaux
 */

"use client";

import { motion } from "framer-motion";

interface DPEData {
    numero_dpe: string;
    etiquette_dpe: string;
    etiquette_ges: string;
    conso_kwh_m2_an: number;
    annee_construction: number;
    surface_habitable: number;
    date_etablissement: string;
    cout_total_ttc?: number;
}

interface FinancialProjectionProps {
    dpeData: DPEData;
    className?: string;
}

export function FinancialProjection({ dpeData, className = "" }: FinancialProjectionProps) {
    // Calculs simplifiés
    const annualSavings = Math.round((dpeData.conso_kwh_m2_an * dpeData.surface_habitable * 0.18) * 0.35); // 35% de gain
    const monthlySavings = Math.round(annualSavings / 12);
    const paybackYears = dpeData.cout_total_ttc ? Math.round(dpeData.cout_total_ttc / annualSavings) : 15;

    return (
        <motion.div
            className={`card-bento p-6 ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="mb-6">
                <h3 className="text-xl font-bold text-main mb-2">
                    💰 Votre Projection Financière
                </h3>
                <p className="text-sm text-muted">
                    Économies estimées après travaux
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Économies mensuelles */}
                <div className="p-4 bg-success-900/10 rounded-xl border border-success-500/20">
                    <p className="text-xs font-semibold text-success-400 uppercase tracking-wider mb-1">
                        Par mois
                    </p>
                    <p className="text-3xl font-black text-success-300">
                        {monthlySavings} €
                    </p>
                </div>

                {/* Économies annuelles */}
                <div className="p-4 bg-primary-900/10 rounded-xl border border-primary-500/20">
                    <p className="text-xs font-semibold text-primary-400 uppercase tracking-wider mb-1">
                        Par an
                    </p>
                    <p className="text-3xl font-black text-primary-300">
                        {annualSavings} €
                    </p>
                </div>

                {/* ROI */}
                <div className="col-span-2 p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                        Retour sur investissement
                    </p>
                    <p className="text-2xl font-black text-main">
                        {paybackYears} ans
                    </p>
                    <p className="text-xs text-muted mt-1">
                        Amortissement complet de votre investissement
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-xs text-muted text-center">
                    Calcul basé sur votre consommation actuelle de {dpeData.conso_kwh_m2_an} kWh/m²/an
                </p>
            </div>
        </motion.div>
    );
}
