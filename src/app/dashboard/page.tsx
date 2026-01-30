/**
 * VALO-SYNDIC — Dashboard
 * ========================
 * Protected page for viewing saved projects
 * Design: Obsidian Premium Aesthetics
 */

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { generateDiagnostic } from '@/lib/calculator';
import type { SavedSimulation } from '@/lib/schemas';
import type { DiagnosticInput } from '@/lib/schemas';

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [projects, setProjects] = useState<SavedSimulation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Protect route
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    // Fetch projects
    useEffect(() => {
        if (!user) return;

        const fetchProjects = async () => {
            try {
                const { data, error: fetchError } = await supabase
                    .from('simulations')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (fetchError) {
                    throw fetchError;
                }

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

    const handleLoadProject = (project: SavedSimulation) => {
        try {
            // Navigate to home with state
            const input = project.json_data.input as DiagnosticInput;
            const result = generateDiagnostic(input);

            // Store in session storage for pickup by main page
            sessionStorage.setItem('valo_loaded_simulation', JSON.stringify({
                input,
                result,
            }));

            router.push('/');
        } catch (err) {
            console.error('Failed to load project:', err);
            alert('Erreur lors du chargement du projet');
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        if (!confirm('Supprimer ce projet ? Cette action est irréversible.')) {
            return;
        }

        try {
            const { error: deleteError } = await supabase
                .from('simulations')
                .delete()
                .eq('id', projectId);

            if (deleteError) {
                throw deleteError;
            }

            // Remove from local state
            setProjects(prev => prev.filter(p => p.id !== projectId));
        } catch (err) {
            console.error('Failed to delete project:', err);
            alert('Erreur lors de la suppression');
        }
    };

    // Show loading state
    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-app flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4 animate-pulse">⏳</div>
                    <p className="text-muted">Chargement...</p>
                </div>
            </div>
        );
    }

    // If not authenticated, show nothing (will redirect)
    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-app">
            <header className="border-b border-boundary bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-main">
                                💼 Mes Projets
                            </h1>
                            <p className="text-sm text-muted mt-1">
                                {user.email}
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/')}
                            className="btn-secondary flex items-center gap-2"
                        >
                            ← Retour
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                        <p className="text-sm text-red-400">⚠️ {error}</p>
                    </div>
                )}

                {projects.length === 0 ? (
                    /* Empty State */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card-bento p-12 text-center"
                    >
                        <div className="text-6xl mb-4">📭</div>
                        <h2 className="text-xl font-semibold text-main mb-2">
                            Aucun projet sauvegardé
                        </h2>
                        <p className="text-muted mb-6">
                            Créez votre première simulation pour la sauvegarder ici.
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="btn-secondary"
                        >
                            ⚡ Nouvelle simulation
                        </button>
                    </motion.div>
                ) : (
                    /* Projects Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="card-bento p-6 hover:border-primary/30 transition-all duration-200 cursor-pointer group"
                                onClick={() => handleLoadProject(project)}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-main mb-1 group-hover:text-primary transition-colors">
                                            {project.project_name || 'Projet sans nom'}
                                        </h3>
                                        <p className="text-xs text-muted">
                                            {new Date(project.created_at).toLocaleDateString('fr-FR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteProject(project.id);
                                        }}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center
                                                 text-muted hover:text-red-400 hover:bg-red-500/10
                                                 transition-all duration-200"
                                        title="Supprimer"
                                    >
                                        🗑️
                                    </button>
                                </div>

                                {/* Details */}
                                <div className="space-y-2 mb-4">
                                    {project.city && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-muted">📍</span>
                                            <span className="text-main">
                                                {project.city}
                                                {project.postal_code && ` (${project.postal_code})`}
                                            </span>
                                        </div>
                                    )}
                                    {project.json_data?.input && (
                                        <>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-muted">🏢</span>
                                                <span className="text-main">
                                                    {project.json_data.input.numberOfUnits} lots
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-muted">⚡</span>
                                                <span className="text-main">
                                                    {project.json_data.input.currentDPE} → {project.json_data.input.targetDPE}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Cost */}
                                {project.json_data?.financing && (
                                    <div className="pt-4 border-t border-boundary">
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-xs text-muted">Montant total</span>
                                            <span className="text-lg font-bold text-primary">
                                                {new Intl.NumberFormat('fr-FR', {
                                                    style: 'currency',
                                                    currency: 'EUR',
                                                    maximumFractionDigits: 0,
                                                }).format(project.json_data.financing.totalCostHT)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Action Hint */}
                                <div className="mt-4 pt-4 border-t border-boundary">
                                    <p className="text-xs text-muted text-center group-hover:text-primary transition-colors">
                                        Cliquez pour ouvrir →
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
