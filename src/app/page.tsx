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
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Activity, ShieldAlert, X, FileText, Download } from 'lucide-react';
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
import { ObjectionHandler } from '@/components/business/ObjectionHandler';
import { MagicalAddressInput } from '@/components/ui/MagicalAddressInput';
import { isMprCoproSuspended, getLocalPassoiresShare } from '@/lib/market-data';

// --- MOCK DATA CONSTANTS ---
const MOCK_FINANCING = {
    worksCostHT: 400000,
    totalCostHT: 420000,
    totalCostTTC: 450000,
    syndicFees: 12000,
    doFees: 8000,
    contingencyFees: 12000,
    costPerUnit: 22000,
    energyGainPercent: 0.45,
    mprAmount: 135000,
    amoAmount: 3000,
    localAidAmount: 5000,
    mprRate: 0.30,
    exitPassoireBonus: 0.10,
    ecoPtzAmount: 200000,
    ceeAmount: 22000,
    remainingCost: 85000,
    monthlyPayment: 89,
    remainingCostPerUnit: 4250,
};

const MOCK_VALUATION = {
    currentValue: 280000,
    projectedValue: 325000,
    valueGain: 45000,
    greenValueGain: 45000,
    greenValueGainPercent: 0.16,
    netROI: 45000 - 85000, // Just a placeholder logic
    pricePerSqm: 3200,
    roiYears: 7,
    salesCount: 12,
    priceSource: "Etalab DVF",
};

const MOCK_INACTION = {
    currentCost: 12000,
    projectedCost3Years: 38000,
    valueDepreciation: 15000,
    totalInactionCost: 38000 + 15000,
};

const MOCK_INPUTS = {
    workAmountHT: 400000,
    amoAmountHT: 12000,
    nbLots: 10,
    energyGain: 0.45,
    initialDPE: 'F',
    targetDPE: 'C',
    isFragile: false,
    ceePerLot: 2000,
    localAidPerLot: 500,
} as const;

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [projects, setProjects] = useState<SavedSimulation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<SavedSimulation | null>(null);
    const [showObjections, setShowObjections] = useState(false);

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

    // Make inputs interactive
    const [inputsData, setInputsData] = useState(selectedProject?.json_data?.input || MOCK_INPUTS);

    // Update inputs if project changes
    useEffect(() => {
        if (selectedProject?.json_data?.input) {
            setInputsData(selectedProject.json_data.input);
        }
    }, [selectedProject]);

    // --- OBSIDIAN CARD CLASS (High-End Tactile) ---
    const CARD_CLASS = "bg-charcoal bg-glass-gradient shadow-glass border border-white/5 rounded-2xl shadow-inner-light backdrop-blur-md relative overflow-hidden group transition-all duration-300 hover:shadow-inner-depth hover:border-white/10";

    // --- RENDER ---
    return (
        <div className="min-h-screen bg-obsidian text-white font-sans pb-48 bg-noise selection:bg-gold/30 selection:text-white relative">

            <div className="max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8 space-y-8 relative z-10">

                {/* HEADER: Magical Entry Point */}
                <header className="flex flex-col items-center gap-8 py-12">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-charcoal to-obsidian border border-white/10 shadow-inner-light flex items-center justify-center">
                            <Zap className="w-5 h-5 text-gold" />
                        </div>
                        <h1 className="text-lg font-mono text-white/60 tracking-[0.3em] uppercase">
                            Cockpit <span className="text-white">Valo-Syndic</span>
                        </h1>
                    </div>

                    <MagicalAddressInput
                        onStartSimulation={(data) => {
                            console.log("Starting simulation with:", data);
                            // 1. Update Inputs State
                            setInputsData((prev: any) => ({
                                ...prev,
                                nbLots: data.numberOfUnits,
                                initialDPE: data.currentDPE,
                                // Approximate heating logic or other fields if needed
                            }));

                            // 2. Scroll to Cockpit
                            const cockpit = document.getElementById('cockpit-start');
                            if (cockpit) {
                                cockpit.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                    />
                </header>

                {/* ANCHOR FOR SCROLL */}
                <div id="cockpit-start" className="w-full h-px opacity-0" />

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
                                <div className="flex items-center gap-2">
                                    <Activity className="w-3 h-3 text-white/50" />
                                    <p className="text-xs text-white/50">Risques Naturels</p>
                                </div>
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

                    {/* ZONE C: ENGINE (Center - 50% - 6 cols) */}
                    <div className="lg:col-span-6 flex flex-col gap-6 h-full">
                        {/* Calculator (The Engine) - Prominent Placement */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className={`${CARD_CLASS} flex-1 border-gold/10 hover:border-gold/30 shadow-neon-gold/5`}
                            style={{
                                boxShadow: "0 20px 50px -20px rgba(0,0,0,0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)"
                            }}
                        >
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
                            <div className="absolute -inset-1 bg-gold/5 blur-3xl opacity-20 pointer-events-none" />

                            <TantiemeCalculator
                                financing={financingData}
                                simulationInputs={inputsData}
                                className="h-full"
                            />
                        </motion.div>
                    </div>

                    {/* ZONE D: PROJECTION (Right - 25% - 3 cols) */}
                    <div className="lg:col-span-3 flex flex-col gap-6">

                        {/* Receipt / Cost Structure */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className={`${CARD_CLASS} h-auto min-h-[300px] hover:shadow-inner-depth overflow-y-auto`}
                        >
                            <div className="p-2 h-full">
                                <TransparentReceipt
                                    financing={financingData}
                                />
                            </div>
                        </motion.div>

                        {/* Valuation (Gain) */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className={`${CARD_CLASS} flex-1 min-h-[350px] hover:shadow-neon-gold border-gold/10 hover:border-gold/30`}
                        >
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold/10 blur-[100px] group-hover:bg-gold/20 transition-colors duration-700" />
                            <ValuationCard
                                valuation={valuationData}
                                financing={financingData}
                            />
                        </motion.div>

                        {/* Inaction Cost */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className={`${CARD_CLASS} h-auto min-h-[200px] hover:border-danger/30 hover:shadow-[0_0_30px_-10px_rgba(239,68,68,0.2)]`}
                        >
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-danger/5 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <InactionCostCard
                                inactionCost={inactionData}
                            />
                        </motion.div>
                    </div>

                </div>

            </div>

            {/* MODAL: OBJECTIONS HANDLER */}
            <AnimatePresence mode="wait">
                {showObjections && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[90] flex justify-end"
                        key="modal-container"
                    >
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowObjections(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            key="backdrop"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="relative h-full w-full max-w-md bg-obsidian border-l border-white/10 shadow-2xl overflow-y-auto z-[100]"
                            key="drawer"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-2">
                                        <ShieldAlert className="w-5 h-5 text-gold" />
                                        <h2 className="text-xl font-bold text-gold">Avocat du Diable</h2>
                                    </div>
                                    <button onClick={() => setShowObjections(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/50 hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <ObjectionHandler />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ZONE E: SPACESHIP CONTROL BAR (Sticky Bottom) - REDUCED & SLEEK */}
            <div className="fixed bottom-0 left-0 right-0 z-[80] pointer-events-none flex justify-center pb-6 perspective-[1000px]">
                <motion.div
                    initial={{ y: 100, opacity: 0, rotateX: 20 }}
                    animate={{ y: 0, opacity: 1, rotateX: 0 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 100, damping: 20 }}
                    className="pointer-events-auto w-auto min-w-[600px] bg-[#09090B]/90 backdrop-blur-xl border border-white/10 shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.1)] rounded-full px-8 py-3 flex items-center gap-8 justify-between group"
                >
                    {/* Glow Line Top */}
                    <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-50" />

                    {/* LEFT: Branding/Status */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gold animate-pulse shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                            <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">Cockpit Live</span>
                        </div>
                    </div>

                    {/* CENTER: SUMMARY METRIC (Ex: Effort Epargne) */}
                    <div className="flex items-center gap-4 border-x border-white/10 px-8">
                        <span className="text-white/40 text-xs uppercase tracking-wider">Effort Net</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-white">83</span>
                            <span className="text-xs text-gold">€/mois</span>
                        </div>
                    </div>

                    {/* RIGHT: Export Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowObjections(!showObjections)}
                            className={`h-9 px-4 rounded-full border hover:bg-white/10 text-xs font-mono tracking-wide transition-all active:scale-95 flex items-center gap-2 ${showObjections ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-white/5 border-white/10 text-white/60'}`}
                        >
                            <ShieldAlert className="w-3 h-3" />
                            <span>Objections</span>
                        </button>

                        <button className="h-9 px-6 rounded-full bg-gold text-obsidian border border-gold/50 shadow-[0_0_20px_-5px_rgba(212,175,55,0.4)] hover:shadow-neon-gold hover:brightness-110 text-xs font-bold tracking-wide transition-all active:scale-95 flex items-center gap-2">
                            <Download className="w-3 h-3" />
                            EXPORT
                        </button>
                    </div>

                </motion.div>
            </div>

        </div>
    );
}
