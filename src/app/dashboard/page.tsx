/**
 * VALO-SYNDIC — Dashboard "Obsidian Cockpit"
 * ==========================================
 * Design System: Stealth Wealth / Matte Luxury
 * Architecture: Bento Grid + Sticky Control Center
 * 
 * ZONES:
 * A: Alerts (Top)
 * B: Context (Left)
 * C: Proof (Center)
 * D: Projection (Right)
 * E: Action (Bottom Sticky)
 */

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { simulateDiagnostic } from '@/app/actions/simulate';
import type { SavedSimulation } from '@/lib/schemas';
import type { DiagnosticInput } from '@/lib/schemas';
import { MprSuspensionAlert } from '@/components/business/MprSuspensionAlert';
import { MarketLiquidityAlert } from '@/components/business/MarketLiquidityAlert';
import { ClimateRiskCard } from '@/components/business/ClimateRiskCard';
import { TransparentReceipt } from '@/components/business/TransparentReceipt';
import { ValuationCard } from '@/components/business/ValuationCard';
import { InactionCostCard } from '@/components/business/InactionCostCard';
import { TantiemeCalculator } from '@/components/business/TantiemeCalculator';
import { RisksCard } from '@/components/business/RisksCard'; // Replacement for RiskRadar
import { isMprCoproSuspended, getLocalPassoiresShare } from '@/lib/market-data';



// --- MOCK DATA FOR UI DEVELOPMENT ---
// In a real scenario, this would come from the loaded simulation
const MOCK_FINANCING = {
    totalCostHT: 450000,
    mprAmount: 120000,
    amoAmount: 3000,
    ceeAmount: 8000,
    localAidAmount: 5000,
    ecoPtzAmount: 180000,
    subsidies: 120000,
    loans: 300000,
    monthlyPayment: 250,
    remainingCost: 30000,
    netRemaining: 30000
};

const MOCK_VALUATION = {
    currentValue: 350000,
    projectedValue: 410000,
    greenValueGain: 60000,
    greenValueGainPercent: 0.15,
    netROI: 30000,
    salesCount: 12,
    priceSource: "Etalab DVF"
};

const MOCK_INACTION = {
    currentCost: 30000,
    projectedCost3Years: 38000,
    valueDepreciation: 15000,
    totalInactionCost: 23000,
    inflationCost: 8000,
    energyLoss: 4000,
    depreciationLoss: 15000
};


export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [projects, setProjects] = useState<SavedSimulation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<SavedSimulation | null>(null);

    // --- LOGIC (UNCHANGED) ---
    useEffect(() => {
        if (!authLoading && !user) router.push('/');
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!user) return;
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
                    setSelectedProject(data[0]); // Select first by default
                }
            } catch (err) {
                console.error('Failed to fetch projects:', err);
                setError(err instanceof Error ? err.message : 'Erreur de chargement');
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, [user]);

    // Used for selecting a project from a list if we had multiple view modes
    const handleSelectProject = (project: SavedSimulation) => {
        setSelectedProject(project);
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-app flex items-center justify-center">
                <div className="text-primary animate-pulse font-mono tracking-widest text-xs uppercase">
                    Chargement du Cockpit...
                </div>
            </div>
        );
    }

    if (!user) return null;

    // Default empty state wrapper if no project
    if (!selectedProject && projects.length === 0) {
        return (
            <div className="min-h-screen bg-app flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl text-main font-bold mb-4">Aucun projet data activé</h1>
                    <button
                        onClick={() => router.push('/')}
                        className="btn-primary"
                    >
                        + Nouvelle Simulation
                    </button>
                </div>
            </div>
        )
    }

    // --- RENDER : OBSIDIAN COCKPIT (BENTO GRID) ---
    return (
        <div className="min-h-screen bg-app text-main font-sans pb-32">

            <div className="max-w-[1800px] mx-auto p-4 md:p-6 lg:p-8">

                <div className="mb-6 space-y-4">
                    <MprSuspensionAlert isSuspended={isMprCoproSuspended()} />
                    <MarketLiquidityAlert shareOfSales={getLocalPassoiresShare()} />
                </div>

                {/* THE BENTO GRID (Zones B, C, D) */}
                {/* Mobile: Stacked (A -> C -> E) mainly. Here we implement responsive grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[800px]">

                    {/* ZONE B: CONTEXTE (Left - 25% - 3 cols) */}
                    <div className="hidden lg:flex lg:col-span-3 flex-col gap-6 h-full">
                        {/* Risk Radar / Card */}
                        <div className="flex-1 bg-surface border border-boundary rounded-card p-6 overflow-hidden relative">
                            <div className="absolute top-4 left-4 z-10">
                                <h3 className="text-sm font-bold text-subtle uppercase tracking-wider">Risques Géographiques</h3>
                            </div>
                            <div className="h-full flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
                                <RisksCard />
                            </div>
                        </div>

                        {/* Climate Risk Timeline */}
                        <div className="h-auto">
                            <ClimateRiskCard />
                        </div>
                    </div>

                    {/* ZONE C: PREUVE (Center - 50% - 6 cols) */}
                    <div className="col-span-1 lg:col-span-6 h-full flex flex-col">
                        <div className="flex-1 bg-surface border border-boundary rounded-card p-0 overflow-hidden shadow-2xl relative">
                            {/* "STAR" treatment for Receipt */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />
                            <TransparentReceipt
                                financing={selectedProject?.json_data?.financing || MOCK_FINANCING}
                            />
                        </div>
                    </div>

                    {/* ZONE D: PROJECTION (Right - 25% - 3 cols) */}
                    <div className="hidden lg:flex lg:col-span-3 flex-col gap-6 h-full">
                        {/* Valuation (Gain) */}
                        <div className="h-auto">
                            <ValuationCard
                                valuation={selectedProject?.json_data?.result?.valuation || MOCK_VALUATION}
                                financing={selectedProject?.json_data?.financing || MOCK_FINANCING}
                            />
                        </div>

                        {/* Inaction Cost (Fear) */}
                        <div className="flex-1">
                            <InactionCostCard
                                inactionCost={selectedProject?.json_data?.result?.inaction || MOCK_INACTION}
                            />
                        </div>
                    </div>

                </div>

            </div>

            {/* ZONE E: STICKY SPACESHIP BAR (Bottom Fixed) */}
            <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex justify-center pb-6">
                <div className="pointer-events-auto backdrop-blur-2xl bg-app/90 border-t border-primary/30 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.8)] rounded-2xl mx-4 px-6 py-4 flex items-center gap-8 min-w-[320px] md:min-w-[800px] justify-between">

                    {/* LEFT: Profile Selector (Mock) */}
                    <div className="hidden md:flex items-center gap-2">
                        {['#3B82F6', '#EAB308', '#8B5CF6', '#EC4899'].map(color => (
                            <button
                                key={color}
                                className="w-8 h-8 rounded-full border-2 border-transparent hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                title="Changer de profil investisseur"
                            />
                        ))}
                        <span className="text-xs text-muted ml-2">Profil</span>
                    </div>

                    {/* CENTER: Tantieme Slider (The Money Shot) */}
                    <div className="flex-1 max-w-md">
                        <TantiemeCalculator
                            financing={selectedProject?.json_data?.financing || MOCK_FINANCING}
                            simulationInputs={selectedProject?.json_data?.input}
                        />
                    </div>

                    {/* RIGHT: Actions */}
                    <div className="flex items-center gap-3">
                        <button className="btn-ghost flex items-center gap-2 text-xs">
                            🛡️ Objections
                        </button>
                        <button className="btn-secondary text-sm px-4 py-2">
                            PDF
                        </button>
                        <button className="btn-primary text-sm px-4 py-2 bg-white text-black hover:bg-white/90">
                            PPTX
                        </button>
                    </div>

                </div>
            </div>

        </div>
    );
}
