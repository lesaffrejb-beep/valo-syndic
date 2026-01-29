/**
 * ViewModeToggle — Switch between "Immeuble" (global) and "Ma Poche" (individual) views
 * Floating toggle with tantièmes input when in "Ma Poche" mode.
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useViewModeStore, type ViewMode } from "@/stores/useViewModeStore";

export function ViewModeToggle() {
    const { viewMode, setViewMode, userTantiemes, setUserTantiemes } = useViewModeStore();

    const modes: { key: ViewMode; icon: string; label: string }[] = [
        { key: 'immeuble', icon: '🏢', label: 'Immeuble' },
        { key: 'maPoche', icon: '👤', label: 'Ma Poche' },
    ];

    return (
        <div className="flex flex-col sm:flex-row items-center gap-3 p-1.5 bg-surface border border-boundary rounded-xl w-fit">
            {/* Mode Toggle */}
            <div className="flex gap-1">
                {modes.map((mode) => (
                    <button
                        key={mode.key}
                        onClick={() => setViewMode(mode.key)}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                            ${viewMode === mode.key
                                ? 'bg-primary-900 text-primary-400 shadow-glow border border-primary-500/30'
                                : 'text-muted hover:text-main hover:bg-surface-highlight'
                            }
                        `}
                    >
                        <span>{mode.icon}</span>
                        <span className="hidden sm:inline">{mode.label}</span>
                    </button>
                ))}
            </div>

            {/* Tantièmes Input (only visible in "Ma Poche" mode) */}
            <AnimatePresence>
                {viewMode === 'maPoche' && (
                    <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 overflow-hidden"
                    >
                        <span className="text-sm text-muted whitespace-nowrap font-medium">Tantièmes:</span>
                        <input
                            type="number"
                            value={userTantiemes}
                            onChange={(e) => setUserTantiemes(Number(e.target.value))}
                            className="w-20 px-3 py-2 text-center text-base font-bold text-primary-400 bg-primary-900/20 border-2 border-primary-500/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface focus:border-primary-500 transition-all"
                            min={1}
                            max={1000}
                        />
                        <span className="text-sm text-muted font-medium">/1000</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
