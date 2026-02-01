/**
 * VALO-SYNDIC — Homepage "Obsidian Cockpit" (High-End Tactile Version)
 * ====================================================================
 * Design Rules:
 * - Depth: shadow-inner-light + shadow-glass
 * - Texture: bg-noise + bg-glass-gradient
 * - Logic: "Stealth Wealth"
 */

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import type { SavedSimulation } from '@/lib/schemas';
import { MprSuspensionAlert } from '@/components/business/MprSuspensionAlert';
import { MarketLiquidityAlert } from '@/components/business/MarketLiquidityAlert';
import { ClimateRiskCard } from '@/components/business/ClimateRiskCard';
import { TransparentReceipt } from '@/components/business/TransparentReceipt';
import { ValuationCard } from '@/components/business/ValuationCard';
import { InactionCostCard } from '@/components/business/InactionCostCard';
import { TantiemeCalculator } from '@/components/business/TantiemeCalculator';
import { RisksCard } from '@/components/business/RisksCard';
import { isMprCoproSuspended, getLocalPassoiresShare } from '@/lib/market-data';

// --- MOCK DATA FOR UI DEVELOPMENT & DEMO ---
const MOCK_FINANCING = {
    totalCostHT: 450000,
    totalCostTTC: 420000,
    worksCostHT: 400000,
    syndicFees: 12000,
    doFees: 8000,
    contingencyFees: 12000,
    costPerUnit: 22000,
    energyGainPercent: 0.45,
    mprAmount: 120000,
    amoAmount: 3000,
    ceeAmount: 8000,
    localAidAmount: 5000,
    mprRate: 0.30,
    exitPassoireBonus: 0.10,
    ecoPtzAmount: 180000,
    remainingCost: 30000,
    remainingCostPerUnit: 1500,
    monthlyPayment: 250
};

const MOCK_VALUATION = {
    currentValue: 350000,
    projectedValue: 410000,
    greenValueGain: 60000,
    greenValueGainPercent: 0.15,
    marketTrendApplied: -0.01,
    netROI: 30000,
    salesCount: 12,
    pricePerSqm: 3200,
    priceSource: "Etalab DVF"
};

const MOCK_INACTION = {
    currentCost: 30000,
    projectedCost3Years: 38000,
    valueDepreciation: 15000,
    totalInactionCost: 23000
};

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [projects, setProjects] = useState<SavedSimulation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<SavedSimulation | null>(null);

    // --- LOGIC ---
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchProjects = async () => {
            try {
                const { data, error: fetchError } = await supabase
                    .from('simulations')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                if (fetchError) throw fetchError;
                setProjects(data || []);
                if (data && data.length > 0) {
                    setSelectedProject(data[0]);
                }
            } catch (err) {
                console.error('Failed to fetch projects:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, [user]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-obsidian flex items-center justify-center">
                <div className="text-gold/50 animate-pulse font-mono tracking-[0.2em] text-xs uppercase flex items-center gap-2">
                    <span className="w-2 h-2 bg-gold rounded-full animate-bounce" />
                    Chargement du Cockpit...
                </div>
            </div>
        );
    }

    // fallback to mock data if no project/user (DEMO MODE)
    const financingData = selectedProject?.json_data?.financing || MOCK_FINANCING;
    const valuationData = selectedProject?.json_data?.result?.valuation || MOCK_VALUATION;
    const inactionData = selectedProject?.json_data?.result?.inaction || MOCK_INACTION;
    const inputsData = selectedProject?.json_data?.input;

    // --- OBSIDIAN CARD CLASS (High-End Tactile) ---
    const CARD_CLASS = "bg-charcoal bg-glass-gradient shadow-glass border border-white/5 rounded-2xl shadow-inner-light backdrop-blur-md relative overflow-hidden group transition-all duration-300 hover:shadow-inner-depth hover:border-white/10";

    // --- RENDER ---
    return (
        <div className="min-h-screen bg-obsidian text-white font-sans pb-40 bg-noise selection:bg-gold/30 selection:text-white">

            <div className="max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8 space-y-8">

                {/* HEADER: En mode Demo, on affiche un petit header pour rassurer */}
                <header className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-charcoal to-obsidian border border-white/10 shadow-inner-light flex items-center justify-center">
                            <span className="text-gold font-bold text-xs">V</span>
                        </div>
                        <h1 className="text-sm font-mono text-white/60 tracking-widest uppercase">
                            Cockpit <span className="text-white">Valo-Syndic</span>
                        </h1>
                    </div>
                </header>

                {/* ZONE A: ALERTES (Contextual) */}
                <div className="space-y-4">
                    <MprSuspensionAlert isSuspended={isMprCoproSuspended()} />
                    <MarketLiquidityAlert shareOfSales={getLocalPassoiresShare()} />
                </div>

                {/* THE BENTO GRID (Zones B, C, D) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto">

                    {/* ZONE B: CONTEXTE (Left - 25% - 3 cols) */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                        {/* Risk Radar */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`${CARD_CLASS} aspect-square flex flex-col justify-between`}
                        >
                            <div className="absolute inset-0 bg-glass-shine opacity-0 group-hover:opacity-10 pointer-events-none" />

                            <div className="relative z-10 p-6">
                                <h3 className="font-mono text-[10px] uppercase tracking-widest text-gold mb-1">Analyse Terrain</h3>
                                <p className="text-xs text-white/50">Risques Naturels</p>
                            </div>

                            <div className="flex-1 flex items-center justify-center p-4">
                                <div className="scale-75 origin-center opacity-80 group-hover:opacity-100 group-hover:scale-95 transition-all duration-500">
                                    <RisksCard />
                                </div>
                            </div>
                        </motion.div>

                        {/* Climate Timeline */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className={`${CARD_CLASS} flex-1 flex flex-col justify-center min-h-[300px]`}
                        >
                            <div className="absolute inset-0 bg-glass-shine opacity-0 group-hover:opacity-10 pointer-events-none" />
                            <div className="relative z-10 h-full p-1">
                                <ClimateRiskCard />
                            </div>
                        </motion.div>
                    </div>

                    {/* ZONE C: PREUVE (Center - 50% - 6 cols) */}
                    <div className="lg:col-span-6 flex flex-col h-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className={`${CARD_CLASS} flex-1 flex flex-col`}
                            style={{
                                boxShadow: "0 20px 50px -20px rgba(0,0,0,0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)"
                            }}
                        >
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                            <div className="p-2 h-full">
                                <TransparentReceipt
                                    financing={financingData}
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* ZONE D: PROJECTION (Right - 25% - 3 cols) */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                        {/* Valuation (Gain - Gold Glow) */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className={`${CARD_CLASS} flex-1 min-h-[400px] hover:shadow-neon-gold border-gold/10 hover:border-gold/30`}
                        >
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold/10 blur-[100px] group-hover:bg-gold/20 transition-colors duration-700" />
                            <ValuationCard
                                valuation={valuationData}
                                financing={financingData}
                            />
                        </motion.div>

                        {/* Inaction Cost (Fear - Red Subtle Glow) */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className={`${CARD_CLASS} h-auto min-h-[250px] hover:border-danger/30 hover:shadow-[0_0_30px_-10px_rgba(239,68,68,0.2)]`}
                        >
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-danger/5 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <InactionCostCard
                                inactionCost={inactionData}
                            />
                        </motion.div>
                    </div>

                </div>

            </div>

            {/* ZONE E: SPACESHIP CONTROL BAR (Sticky Bottom) */}
            <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex justify-center pb-8 perspective-[1000px]">
                <motion.div
                    initial={{ y: 100, opacity: 0, rotateX: 20 }}
                    animate={{ y: 0, opacity: 1, rotateX: 0 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 100, damping: 20 }}
                    className="pointer-events-auto w-[96%] max-w-[1280px] bg-[#09090B]/90 backdrop-blur-xl border border-white/10 shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.1)] rounded-2xl px-8 py-5 flex flex-col md:flex-row items-center gap-8 justify-between group"
                >
                    {/* Glow Line Top */}
                    <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-50" />

                    {/* LEFT: Profile (Personas) */}
                    <div className="hidden md:flex items-center gap-4 min-w-[200px]">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">Persona</span>
                        <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300">
                            {['#3B82F6', '#EAB308', '#8B5CF6'].map((color, i) => (
                                <button
                                    key={color}
                                    className="w-8 h-8 rounded-full border border-white/10 shadow-inner-light transition-all hover:scale-125 hover:z-20 hover:shadow-neon-gold"
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* CENTER: Calculator (The Engine) */}
                    <div className="flex-1 w-full max-w-3xl border-x border-white/5 px-8">
                        <TantiemeCalculator
                            financing={financingData}
                            simulationInputs={inputsData}
                        />
                    </div>

                    {/* RIGHT: Export Actions */}
                    <div className="flex items-center gap-3 min-w-[200px] justify-end">
                        <button className="h-10 px-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-mono text-white/60 tracking-wide transition-all active:scale-95 flex items-center gap-2">
                            <span className="text-gold">⚡</span> Objections
                        </button>

                        <div className="h-8 w-[1px] bg-white/10 mx-2" />

                        <button className="h-10 px-5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 shadow-inner-light text-sm font-medium text-white transition-all active:scale-95">
                            PDF
                        </button>

                        <button className="h-10 px-6 rounded-lg bg-gold text-obsidian border border-gold/50 shadow-[0_0_20px_-5px_rgba(212,175,55,0.4)] hover:shadow-neon-gold hover:brightness-110 text-sm font-bold tracking-wide transition-all active:scale-95">
                            EXPORT
                        </button>
                    </div>

                </motion.div>
            </div>

        </div>
    );
}
