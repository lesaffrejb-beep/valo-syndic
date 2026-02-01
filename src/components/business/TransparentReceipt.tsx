"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/calculator";
import { type FinancingPlan } from "@/lib/schemas";

interface TransparentReceiptProps {
    financing: FinancingPlan;
}

export function TransparentReceipt({ financing }: TransparentReceiptProps) {
    // 1. Dépense INITIALE
    const costItems = [
        { label: "Travaux & Honoraires TTC", value: financing.totalCostTTC, type: "cost", highlight: false },
    ];

    // 2. Les AIDES (Déductions)
    const grantItems = [
        { label: "MaPrimeRénov' Copro", value: financing.mprAmount, type: "deduction", highlight: true },
        { label: "Prime CEE (Énergie)", value: financing.ceeAmount, type: "deduction", highlight: false },
        { label: "Aide AMO", value: financing.amoAmount, type: "deduction", highlight: false },
        { label: "Aides Locales", value: financing.localAidAmount, type: "deduction", highlight: false },
    ].filter(item => item.value > 0);

    // 3. Le FINANCEMENT (Éco-PTZ)
    const loanItems = [
        { label: "Éco-PTZ (0% d'intérêts)", value: financing.ecoPtzAmount, type: "loan", highlight: false },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full flex flex-col justify-between p-6 relative"
        >
            {/* Header Ticket */}
            <div className="text-center mb-6">
                <div className="inline-block border-2 border-primary/20 rounded-full p-1 mb-2">
                    <div className="w-12 h-1 bg-primary/20 rounded-full" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight uppercase">Ticket de Caisse</h2>
                <p className="text-xs text-muted font-mono">Détail du Reste à Charge Réel</p>
            </div>

            {/* BODY - La Cascade */}
            <div className="flex-1 space-y-1 font-mono text-sm relative">

                {/* Ligne pointillée verticale de liaison */}
                <div className="absolute left-0 top-2 bottom-2 w-[1px] border-l border-dashed border-white/10 ml-[2px]" />

                {/* 1. COÛT */}
                {costItems.map((item, i) => (
                    <div key={`cost-${i}`} className="flex justify-between items-baseline py-2 group pl-4">
                        <span className="text-zinc-400">{item.label}</span>
                        <span className="text-white font-bold">{formatCurrency(item.value)}</span>
                    </div>
                ))}

                {/* Separator */}
                <div className="border-b border-dashed border-white/10 my-2" />

                {/* 2. DEDUCTIONS (AIDES) */}
                {grantItems.map((item, i) => (
                    <div key={`grant-${i}`} className="flex justify-between items-baseline py-1 group pl-4 relative">
                        <span className="absolute left-[-2px] top-1/2 -translate-y-1/2 text-[10px] text-emerald-500 font-bold">-</span>
                        <span className={item.highlight ? "text-emerald-400 font-bold" : "text-zinc-500 group-hover:text-emerald-400/70 transition-colors"}>
                            {item.label}
                        </span>
                        <span className="text-emerald-500 tabular-nums">- {formatCurrency(item.value)}</span>
                    </div>
                ))}

                {/* Separator Reste à Charge */}
                <div className="border-b-2 border-white/10 my-3" />

                <div className="flex justify-between items-baseline py-2 pl-4">
                    <span className="text-white font-bold uppercase text-xs tracking-wider">Reste à Financer</span>
                    <span className="text-white font-bold text-lg">{formatCurrency(financing.remainingCost)}</span>
                </div>

                {/* 3. LOAN */}
                {financing.remainingCost > 0 && (
                    <div className="pl-4 pt-2">
                        {loanItems.map((item, i) => (
                            <div key={`loan-${i}`} className="flex justify-between items-baseline py-1 text-primary">
                                <span className="flex items-center gap-2">
                                    <span>↳</span>
                                    <span>{item.label}</span>
                                </span>
                                <span>{formatCurrency(item.value)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FOOTER - THE MONEY SHOT (Effort Mensuel) */}
            <div className="mt-6 pt-6 border-t border-dashed border-white/20">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="flex flex-col">
                        <span className="label-technical text-primary mb-1">Effort d&apos;épargne</span>
                        <span className="text-xs text-muted">Mensualité réelle après aides</span>
                    </div>

                    <div className="text-right">
                        <span className="text-3xl font-bold text-white tracking-tighter group-hover:text-primary transition-colors">
                            {financing.monthlyPayment}€
                        </span>
                        <span className="text-sm text-muted font-normal ml-1">/mois</span>
                    </div>
                </div>

                {financing.monthlyPayment < 50 && (
                    <div className="text-center mt-3">
                        <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 uppercase tracking-widest">
                            Moins cher qu&apos;un abonnement internet
                        </span>
                    </div>
                )}
            </div>

            {/* Background Noise Texture Overlay if possible/needed, simpler to keep clean for now */}
        </motion.div>
    );
}
