"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useViewModeStore } from "@/stores/useViewModeStore";
import { cn } from "@/lib/utils";
import { Building2, User } from "lucide-react";

export function ViewModeToggle({ className }: { className?: string }) {
    const { viewMode, setViewMode, userTantiemes, setUserTantiemes } = useViewModeStore();
    const [isDragging, setIsDragging] = useState(false);
    const [showValue, setShowValue] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const percentage = (userTantiemes / 1000) * 100;
    const isFullBuilding = userTantiemes >= 995;
    const isIndividual = userTantiemes <= 50;

    // Déterminer le label actif basé sur la valeur
    const effectiveMode = isFullBuilding ? 'immeuble' : 'maPoche';

    const handleContainerClick = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
        const tantiemes = Math.round((pct / 100) * 1000);
        
        setUserTantiemes(Math.max(1, tantiemes));
        if (tantiemes >= 995) {
            setViewMode('immeuble');
        } else {
            setViewMode('maPoche');
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        handleContainerClick(e);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        handleContainerClick(e);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('mousemove', handleMouseMove as any);
        }
        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mousemove', handleMouseMove as any);
        };
    }, [isDragging]);

    // Sync viewMode with value
    useEffect(() => {
        if (isFullBuilding && viewMode !== 'immeuble') {
            setViewMode('immeuble');
        } else if (!isFullBuilding && viewMode === 'immeuble') {
            setViewMode('maPoche');
        }
    }, [userTantiemes, isFullBuilding, viewMode, setViewMode]);

    const setPreset = (value: number) => {
        setUserTantiemes(value);
        if (value >= 995) {
            setViewMode('immeuble');
        } else {
            setViewMode('maPoche');
        }
    };

    return (
        <div 
            className={cn("relative w-full max-w-md mx-auto", className)}
            onMouseEnter={() => setShowValue(true)}
            onMouseLeave={() => setShowValue(false)}
        >
            {/* Container principal - La Barre */}
            <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                className={cn(
                    "relative h-14 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300",
                    isDragging && "scale-[1.02] border-white/20"
                )}
            >
                {/* Barre de progression - La magie visuelle */}
                <motion.div
                    className={cn(
                        "absolute left-0 top-0 bottom-0 transition-colors duration-500",
                        isFullBuilding 
                            ? "bg-gradient-to-r from-white/90 to-white" 
                            : "bg-gradient-to-r from-gold/80 via-gold to-gold/90"
                    )}
                    initial={false}
                    animate={{ width: `${percentage}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />

                {/* Label MA POCHE - Toujours lisible */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10 pointer-events-none">
                    <div className={cn(
                        "px-2 py-1 rounded-lg flex items-center gap-2 transition-colors duration-300",
                        percentage < 35 
                            ? "bg-transparent" 
                            : "bg-black/40 backdrop-blur-sm"
                    )}>
                        <User className={cn(
                            "w-4 h-4 transition-colors duration-300",
                            percentage < 35 ? "text-black" : "text-white"
                        )} />
                        <span className={cn(
                            "text-xs font-bold uppercase tracking-wider transition-colors duration-300",
                            percentage < 35 ? "text-black" : "text-white"
                        )}>
                            Ma Poche
                        </span>
                    </div>
                </div>

                {/* Label IMMEUBLE - Toujours lisible */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10 pointer-events-none">
                    <div className={cn(
                        "px-2 py-1 rounded-lg flex items-center gap-2 transition-colors duration-300",
                        percentage > 85 
                            ? "bg-transparent" 
                            : "bg-black/40 backdrop-blur-sm"
                    )}>
                        <span className={cn(
                            "text-xs font-bold uppercase tracking-wider transition-colors duration-300",
                            percentage > 85 ? "text-black" : "text-white"
                        )}>
                            Immeuble
                        </span>
                        <Building2 className={cn(
                            "w-4 h-4 transition-colors duration-300",
                            percentage > 85 ? "text-black" : "text-white"
                        )} />
                    </div>
                </div>

                {/* Valeur centrale - Affiche le % */}
                <AnimatePresence>
                    {(showValue || isDragging) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 5 }}
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                        >
                            <div className={cn(
                                "px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md",
                                percentage > 40 && percentage < 95 
                                    ? "bg-black/30 text-white" 
                                    : "bg-white/20 text-black"
                            )}>
                                {Math.round(percentage)}%
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Indicateur de drag */}
                <motion.div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] z-20"
                    initial={false}
                    animate={{ left: `${percentage}%` }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    style={{ x: '-50%' }}
                />
            </div>

            {/* Labels sous la barre */}
            <div className="flex justify-between mt-2 px-1">
                <span className="text-[9px] uppercase tracking-widest text-white/30">
                    {userTantiemes}/1000
                </span>
                <span className="text-[9px] uppercase tracking-widest text-white/30">
                    {isFullBuilding ? 'Copropriété entière' : `Lot de ${Math.ceil(percentage * 0.1)} m² env.`}
                </span>
            </div>

            {/* Presets rapides */}
            <div className="flex justify-center gap-2 mt-3">
                {[
                    { val: 50, label: 'Studio' },
                    { val: 100, label: 'T2' },
                    { val: 200, label: 'T3' },
                    { val: 1000, label: 'Tout' },
                ].map(({ val, label }) => (
                    <button
                        key={val}
                        onClick={() => setPreset(val)}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all duration-200 border",
                            userTantiemes === val
                                ? "bg-gold text-black border-gold"
                                : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white/80"
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
}
