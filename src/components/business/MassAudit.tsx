"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { AngersMap } from "./AngersMap";
import { type BuildingAuditResult } from "@/lib/calculator";
import { batchProcessBuildings } from "@/lib/mocks";
import { motion, AnimatePresence } from "framer-motion";

export function MassAudit() {
    const [results, setResults] = useState<BuildingAuditResult[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleProcess(file);
    };

    const handleProcess = (file: File) => {
        setIsProcessing(true);
        setError(null);
        setProgress(0);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const rawData = results.data as any[];

                // Simulation d'attente "WOW EFFECT" (10 secondes demandées)
                let interval = setInterval(() => {
                    setProgress((prev) => {
                        if (prev >= 100) {
                            clearInterval(interval);
                            const processed = batchProcessBuildings(rawData.map(row => ({
                                adresse: row.adresse || row.Address || "Adresse inconnue",
                                lots: parseInt(row.lots || row.Units) || 10,
                                annee: parseInt(row.annee || row.Year) || 1970
                            })));
                            setResults(processed);
                            setIsProcessing(false);
                            return 100;
                        }
                        return prev + 1;
                    });
                }, 100);
            },
            error: (err) => {
                setError("Erreur lors de la lecture du fichier CSV.");
                setIsProcessing(false);
            }
        });
    };

    const downloadTemplate = () => {
        const csvContent = "adresse,lots,annee\n12 Rue de la Paix,24,1968\n45 Boulevard Foch,12,1982\n8 Avenue de Messine,40,2010";
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "modele_audit_parc.csv";
        a.click();
    };

    return (
        <div className="space-y-8">
            <div className="card-bento p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-bold text-main mb-2">Mass Audit &quot;God View&quot;</h2>
                        <p className="text-muted max-w-xl">
                            Analysez l&apos;ensemble de votre parc en 10 secondes. Identifiez les copropriétés en risque de gel locatif (2025-2028).
                        </p>
                    </div>

                    <button
                        onClick={downloadTemplate}
                        className="btn-secondary text-sm"
                    >
                        📥 Télécharger le modèle CSV
                    </button>
                </div>

                <div className="mt-8">
                    {!isProcessing && results.length === 0 && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-boundary rounded-2xl p-12 text-center cursor-pointer hover:border-primary-500/50 hover:bg-primary-500/5 transition-all group"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".csv"
                                className="hidden"
                            />
                            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-boundary group-hover:scale-110 transition-transform">
                                <span className="text-4xl">📊</span>
                            </div>
                            <p className="text-lg font-bold text-main">Glissez votre fichier CSV ici</p>
                            <p className="text-sm text-muted mt-2">Prise en charge jusqu&apos;à 500 copropriétés</p>
                        </div>
                    )}

                    {isProcessing && (
                        <div className="py-12 text-center">
                            <h3 className="text-xl font-bold text-main mb-6 italic font-serif">
                                Audit de parc en cours...
                            </h3>
                            <div className="max-w-md mx-auto h-2 bg-boundary rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-sm text-muted mt-4 font-mono">{progress}% - Analyse des données DPE & Juridiques</p>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        {/* Map View */}
                        <div className="lg:col-span-2">
                            <AngersMap results={results} />
                        </div>

                        {/* Summary View */}
                        <div className="space-y-6">
                            <div className="card-bento p-6">
                                <h3 className="text-lg font-bold text-main mb-4">Synthèse du Parc</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                        <span className="text-sm font-medium text-red-400">🚨 Risque Immédiat (G)</span>
                                        <span className="text-xl font-bold text-red-500">
                                            {results.filter(r => r.currentDPE === 'G').length}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                        <span className="text-sm font-medium text-amber-400">⚠️ Attention (F/E)</span>
                                        <span className="text-xl font-bold text-amber-500">
                                            {results.filter(r => r.currentDPE === 'F' || r.currentDPE === 'E').length}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                        <span className="text-sm font-medium text-emerald-400">✅ Conforme (A-D)</span>
                                        <span className="text-xl font-bold text-emerald-500">
                                            {results.filter(r => ['A', 'B', 'C', 'D'].includes(r.currentDPE)).length}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setResults([])}
                                    className="w-full mt-6 btn-ghost text-xs py-2"
                                >
                                    🔄 Réinitialiser l&apos;audit
                                </button>
                            </div>

                            <div className="card-bento p-6">
                                <h3 className="text-sm font-bold text-muted uppercase mb-4 tracking-wider">Top Priorities</h3>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                                    {results
                                        .filter(r => r.compliance.status === 'danger')
                                        .slice(0, 5)
                                        .map(r => (
                                            <div key={r.id} className="p-3 bg-surface rounded-lg border border-boundary flex items-center justify-between group hover:border-red-500/30 transition-colors">
                                                <div>
                                                    <p className="text-xs font-bold text-main truncate max-w-[150px]">{r.address}</p>
                                                    <p className="text-[10px] text-red-500">Gel locatif : {r.compliance.deadline || 'Immédiat'}</p>
                                                </div>
                                                <span className="text-xs font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded">G</span>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
