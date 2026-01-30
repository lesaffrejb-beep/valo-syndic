/**
 * ViewModeToggle — Switch between "Immeuble" (global) and "Ma Poche" (individual) views
 * Floating toggle with tantièmes input when in "Ma Poche" mode.
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useViewModeStore, type ViewMode } from "@/stores/useViewModeStore";

import { NumberStepper } from "@/components/ui/NumberStepper";

export function ViewModeToggle() {
    const { viewMode, setViewMode, userTantiemes, setUserTantiemes } = useViewModeStore();

    const modes: { key: ViewMode; icon: string; label: string }[] = [
        { key: 'immeuble', icon: '🏢', label: 'Immeuble' },
        { key: 'maPoche', icon: '👤', label: 'Ma Poche' },
    ];

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-1.5 bg-surface border border-boundary rounded-xl w-fit sm:mx-0 mx-auto">
            {/* Mode Toggle */}
            <div className="flex gap-1 bg-surface-highlight/50 p-0.5 rounded-lg">
                {modes.map((mode) => (
                    <button
                        key={mode.key}
                        onClick={() => setViewMode(mode.key)}
                        className={`
                            px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2
                            ${viewMode === mode.key
                                ? 'bg-primary-900 text-primary-400 shadow-sm border border-primary-500/20'
                                : 'text-muted hover:text-main hover:bg-surface'
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
                        initial={{ opacity: 0, width: 0, scale: 0.9 }}
                        animate={{ opacity: 1, width: 'auto', scale: 1 }}
                        exit={{ opacity: 0, width: 0, scale: 0.9 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="flex items-center gap-2 overflow-hidden"
                    >
                        <span className="text-sm text-muted whitespace-nowrap font-medium pl-1">Tantièmes:</span>
                        <NumberStepper
                            value={userTantiemes}
                            onChange={setUserTantiemes}
                            min={1}
                            max={1000}
                            step={1}
                            suffix="/ 1000"
                            className="h-9 border-primary-500/30 shadow-none"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
