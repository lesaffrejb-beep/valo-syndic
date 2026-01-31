"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/calculator";
import { type FinancingPlan } from "@/lib/schemas";

interface TransparentReceiptProps {
    financing: FinancingPlan;
}

export function TransparentReceipt({ financing }: TransparentReceiptProps) {
    const items = [
        { label: "MaPrimeRénov' Copropriété", value: financing.mprAmount, type: "grant" },
        { label: "Prime AMO (Accompagnement)", value: financing.amoAmount, type: "grant" },
        { label: "Certificats Économie Énergie (CEE)", value: financing.ceeAmount, type: "grant" },
        { label: "Aides Locales (Détectées)", value: financing.localAidAmount, type: "grant" },
        { label: "Éco-Prêt à Taux Zéro (Eco-PTZ)", value: financing.ecoPtzAmount, type: "loan" },
    ].filter(item => item.value > 0);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-zinc-950 border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
        >
            {/* Header aesthetic */}
            <div className="flex justify-between items-center mb-8 border-b border-dashed border-zinc-800 pb-4">
                <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Transaction</span>
                    <span className="text-sm font-bold text-white">RÉCAPITULATIF FINANCIER</span>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Date</span>
                    <span className="text-xs font-mono text-zinc-400 block">{new Date().toLocaleDateString('fr-FR')}</span>
                </div>
            </div>

            {/* Receipt Content */}
            <div className="space-y-4 mb-8">
                {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center group">
                        <span className="text-xs text-zinc-400 font-medium">{item.label}</span>
                        <div className="flex-1 mx-4 border-b border-dashed border-zinc-900 group-hover:border-zinc-800 transition-colors" />
                        <span className="text-sm font-mono text-white tabular-nums">
                            {formatCurrency(item.value)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Total / Reste à charge */}
            <div className="pt-6 border-t-2 border-zinc-900">
                <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Total Aides & Prêts</span>
                        <span className="text-lg font-bold text-white">Impact Immédiat</span>
                    </div>
                    <div className="text-right">
                        <div className="relative">
                            {financing.remainingCost === 0 && (
                                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                            )}
                            <span className={`text-2xl font-mono font-bold tabular-nums relative z-10 ${financing.remainingCost === 0 ? 'text-emerald-400' : 'text-white'}`}>
                                {formatCurrency(financing.mprAmount + financing.amoAmount + financing.ceeAmount + financing.localAidAmount + financing.ecoPtzAmount)}
                            </span>
                        </div>
                    </div>
                </div>

                {financing.remainingCost === 0 && (
                    <div className="mt-4 py-2 px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                        <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                            Reste à charge 0€ détecté
                        </span>
                    </div>
                )}
            </div>

            {/* Footer aesthetics */}
            <div className="mt-8 flex justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                <div className="w-16 h-16 border-4 border-zinc-800 rounded-full flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-zinc-800 rounded-full" />
                </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        </motion.div>
    );
}
