/**
 * VALO-SYNDIC — Dashboard "Obsidian Cockpit"
 * ==========================================
 * Design System: Stealth Wealth / Matte Luxury
 * Architecture: Bento Grid + Sticky Control Center
 */

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { simulateDiagnostic } from '@/app/actions/simulate';
import type { SavedSimulation } from '@/lib/schemas';
import type { DiagnosticInput } from '@/lib/schemas';

// --- DESIGN TOKENS (SIMULATION) ---
// Note pour l'intégrateur : Copier ces valeurs dans tailwind.config.ts si validé
const TOKENS = {
    colors: {
        obsidian: '#0B0C0E',           // Fond Page
        surface: '#161719',            // Carte Default
        surfaceHighlight: '#1F2125',   // Carte Hover
        gold: '#D4B679',              // Accents Value
        emerald: '#10B981',           // Accents Gain
        danger: '#EF4444',            // Accents Risk
        main: '#FFFFFF',              // Text Main
        muted: '#9CA3AF',             // Text Muted
        subtle: '#4B5563',            // Text Subtle
        boundary: 'rgba(255, 255, 255, 0.08)',
    },
    effects: {
        glass: 'backdrop-blur-xl bg-white/[0.03] border border-white/[0.08]',
        innerGlow: 'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]',
        goldGlow: 'shadow-[0_0_50px_-12px_rgba(212,175,55,0.15)]',
    }
};

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [projects, setProjects] = useState<SavedSimulation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
            } catch (err) {
                console.error('Failed to fetch projects:', err);
                setError(err instanceof Error ? err.message : 'Erreur de chargement');
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, [user]);

    const handleLoadProject = async (project: SavedSimulation) => {
        try {
            const input = project.json_data.input as DiagnosticInput;
            const response = await simulateDiagnostic(input);
            if (!response.success) {
                alert(`Erreur lors du recalcul: ${response.error}`);
                return;
            }
            sessionStorage.setItem('valo_loaded_simulation', JSON.stringify({
                input,
                result: response.data,
            }));
            router.push('/');
        } catch (err) {
            console.error('Failed to load project:', err);
            alert('Erreur lors du chargement du projet');
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        if (!confirm('Confirmation irréversible : Supprimer ce projet ?')) return;
        try {
            const { error: deleteError } = await supabase
                .from('simulations')
                .delete()
                .eq('id', projectId);
            if (deleteError) throw deleteError;
            setProjects(prev => prev.filter(p => p.id !== projectId));
        } catch (err) {
            console.error('Failed to delete project:', err);
            alert('Erreur lors de la suppression');
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-app flex items-center justify-center">
                <div className="text-primary animate-pulse font-mono tracking-widest text-xs uppercase">
                    Initialisation du Cockpit...
                </div>
            </div>
        );
    }

    if (!user) return null;

    // --- RENDER : OBSIDIAN COCKPIT ---
    return (
        <div className="min-h-screen bg-app text-main selection:bg-primary selection:text-primary-foreground font-sans pb-32">

            {/* GRID LAYOUT */}
            <div className="max-w-[1600px] mx-auto p-6 md:p-8 grid grid-cols-12 gap-6">

                {/* ZONE A: HEADER & KPI (Full Width) */}
                <header className="col-span-12 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 group">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_10px_#10B981]" />
                            <span className="text-muted text-xs font-mono tracking-widest uppercase">
                                Système Connecté
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-main">
                            Command Center
                        </h1>
                        <p className="text-muted mt-2 font-light">
                            {user.email} — <span className="text-primary">Admin</span>
                        </p>
                    </div>

                    {/* STATS WIDGET (Decorative) */}
                    <div className={`
                        px-6 py-4 rounded-2xl
                        backdrop-blur-xl bg-white/[0.03] border border-white/[0.08]
                        shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]
                    `}>
                        <div className="flex gap-8">
                            <div>
                                <div className="text-subtle text-xs uppercase tracking-wider font-bold mb-1">Projets</div>
                                <div className="text-2xl text-main font-mono tabular-nums tracking-wide">
                                    {projects.length.toString().padStart(2, '0')}
                                </div>
                            </div>
                            <div>
                                <div className="text-subtle text-xs uppercase tracking-wider font-bold mb-1">Capacité</div>
                                <div className="text-2xl text-success font-mono tabular-nums tracking-wide">100%</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ERROR DISPLAY */}
                {error && (
                    <div className="col-span-12 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-mono">
                        ERR_SYSTEM: {error}
                    </div>
                )}

                {/* ZONE B: MAIN GRID (Projects) */}
                {projects.length === 0 ? (
                    <div className="col-span-12 py-24 flex flex-col items-center justify-center text-center opacity-50">
                        <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center text-2xl mb-4 border border-white/[0.08]">
                            ∅
                        </div>
                        <h3 className="text-xl font-medium tracking-tight mb-2">Aucune donnée télémétrique</h3>
                        <p className="text-muted max-w-sm mx-auto">
                            Lancez une nouvelle simulation pour peupler le tableau de bord.
                        </p>
                    </div>
                ) : (
                    projects.map((project, idx) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05, duration: 0.4 }}
                            onClick={() => handleLoadProject(project)}
                            className={`
                                col-span-12 md:col-span-6 lg:col-span-4
                                relative group cursor-pointer overflow-hidden
                                rounded-[24px] p-0
                                bg-surface border border-[#2A2B2E]
                                hover:bg-surface-hover hover:border-primary/30
                                transition-all duration-300
                                shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]
                                hover:shadow-[0_0_50px_-12px_rgba(212,175,55,0.15)]
                            `}
                        >
                            {/* Card Content Container */}
                            <div className="p-8 h-full flex flex-col relative z-10">

                                {/* Header */}
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-main mb-2 group-hover:text-primary transition-colors leading-tight">
                                            {project.project_name || 'Copropriété sans nom'}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs font-mono text-muted uppercase tracking-wide">
                                            <span>
                                                {new Date(project.created_at).toLocaleDateString('fr-FR', {
                                                    day: '2-digit', month: '2-digit', year: 'numeric'
                                                })}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-subtle" />
                                            <span>{project.city || 'N/A'}</span>
                                        </div>
                                    </div>

                                    {/* Action Dot */}
                                    <div className="w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_#D4B679]" />
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 gap-y-6 gap-x-4 mt-auto">

                                    {/* Lots */}
                                    <div>
                                        <div className="text-[10px] uppercase text-subtle tracking-wider font-bold mb-1">
                                            Lots
                                        </div>
                                        <div className="text-sm font-mono text-main">
                                            {project.json_data.input.numberOfUnits}
                                        </div>
                                    </div>

                                    {/* DPE Path */}
                                    <div>
                                        <div className="text-[10px] uppercase text-subtle tracking-wider font-bold mb-1">
                                            Transition
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-mono text-main">
                                            <span className="text-danger">{project.json_data.input.currentDPE}</span>
                                            <span className="text-subtle">→</span>
                                            <span className="text-success">{project.json_data.input.targetDPE}</span>
                                        </div>
                                    </div>

                                    {/* Cost (Highlight) */}
                                    <div className="col-span-2 pt-4 border-t border-white/[0.05]">
                                        <div className="flex justify-between items-end">
                                            <div className="text-[10px] uppercase text-subtle tracking-wider font-bold mb-1">
                                                Enveloppe Travaux
                                            </div>
                                            <div className="text-lg font-mono font-medium text-primary tabular-nums tracking-wide">
                                                {new Intl.NumberFormat('fr-FR', {
                                                    style: 'currency',
                                                    currency: 'EUR',
                                                    maximumFractionDigits: 0
                                                }).format(project.json_data.financing?.totalCostHT || 0)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hover Delete Action (Absolute Top Right) */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProject(project.id);
                                }}
                                className="absolute top-6 right-6 p-2 rounded-full 
                                         text-subtle hover:text-danger hover:bg-danger/10
                                         opacity-0 group-hover:opacity-100 transition-all duration-200 z-20"
                                title="Archiver le projet"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                            </button>

                        </motion.div>
                    ))
                )}
            </div>

            {/* ZONE E: STICKY BOTTOM "SPACESHIP" DASHBOARD */}
            <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex justify-center pb-6">
                <div className={`
                    pointer-events-auto
                    backdrop-blur-2xl bg-app/80 
                    border-t border-primary/30
                    shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.8)]
                    rounded-2xl mx-4 px-2 py-2
                    flex items-center gap-2
                    min-w-[320px] md:min-w-[480px] justify-between
                `}>
                    {/* LEFT: Quick Stats */}
                    <div className="hidden md:flex items-center gap-4 px-4 border-r border-white/10 pr-4">
                        <div>
                            <div className="text-[9px] uppercase text-muted tracking-widest">Database</div>
                            <div className="text-xs font-mono text-primary">SYNCED</div>
                        </div>
                        <div>
                            <div className="text-[9px] uppercase text-muted tracking-widest">Version</div>
                            <div className="text-xs font-mono text-main">3.0.1</div>
                        </div>
                    </div>

                    {/* CENTER: Main Action */}
                    <button
                        onClick={() => router.push('/')}
                        className={`
                            group relative overflow-hidden
                            bg-white text-black px-8 py-3 rounded-xl
                            font-bold tracking-tight text-sm
                            hover:bg-primary transition-colors duration-300
                            flex items-center gap-2 mx-auto
                        `}
                    >
                        <span>NOUVELLE SIMULATION</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>

                        {/* Shine Effect */}
                        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
                    </button>

                    {/* RIGHT: User Status */}
                    <div className="flex items-center gap-3 px-4 pl-4 border-l border-white/10">
                        <div className="text-right hidden sm:block">
                            <div className="text-[9px] uppercase text-muted tracking-widest">Connecté</div>
                            <div className="text-xs font-medium text-main max-w-[100px] truncate">{user.email}</div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}
