"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useViewModeStore, type ViewMode } from "@/stores/useViewModeStore";
import { cn } from "@/lib/utils";
import { Building2, User, ChevronDown } from "lucide-react";

export function ViewModeToggle({ className }: { className?: string }) {
    const { viewMode, setViewMode, userTantiemes, setUserTantiemes } = useViewModeStore();
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(userTantiemes.toString());
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTempValue(userTantiemes.toString());
    }, [userTantiemes]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        if (mode === 'maPoche') {
            setTimeout(() => setIsEditing(true), 150);
        } else {
            setIsEditing(false);
        }
    };

    const handleSubmit = () => {
        const val = parseInt(tempValue, 10);
        if (!isNaN(val) && val >= 1 && val <= 1000) {
            setUserTantiemes(val);
        } else {
            setTempValue(userTantiemes.toString());
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSubmit();
        if (e.key === 'Escape') {
            setTempValue(userTantiemes.toString());
            setIsEditing(false);
        }
    };

    const quickAdjust = (delta: number) => {
        const newVal = Math.max(1, Math.min(1000, userTantiemes + delta));
        setUserTantiemes(newVal);
    };

    return (
        <div className={cn("relative", className)}>
            {/* Container principal - Glass pill */}
            <div className="inline-flex items-center bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 shadow-2xl shadow-black/20">
                
                {/* Option Immeuble */}
                <button
                    onClick={() => handleModeChange('immeuble')}
                    className={cn(
                        "relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300",
                        viewMode === 'immeuble' 
                            ? "text-black" 
                            : "text-white/50 hover:text-white/80"
                    )}
                >
                    {viewMode === 'immeuble' && (
                        <motion.div
                            layoutId="active-pill-bg"
                            className="absolute inset-0 bg-white rounded-xl shadow-lg"
                            initial={false}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span className="uppercase tracking-wide text-xs">Immeuble</span>
                    </span>
                </button>

                {/* Option Ma Poche - avec valeur intégrée */}
                <button
                    onClick={() => handleModeChange('maPoche')}
                    className={cn(
                        "relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300",
                        viewMode === 'maPoche' 
                            ? "text-black" 
                            : "text-white/50 hover:text-white/80"
                    )}
                >
                    {viewMode === 'maPoche' && (
                        <motion.div
                            layoutId="active-pill-bg"
                            className="absolute inset-0 bg-white rounded-xl shadow-lg"
                            initial={false}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="uppercase tracking-wide text-xs">Ma Poche</span>
                        
                        {/* Badge valeur tantièmes - visible uniquement en mode maPoche */}
                        <AnimatePresence>
                            {viewMode === 'maPoche' && (
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.8, width: 0 }}
                                    animate={{ opacity: 1, scale: 1, width: "auto" }}
                                    exit={{ opacity: 0, scale: 0.8, width: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="ml-1 inline-flex items-center"
                                >
                                    <span className="bg-black/10 text-black/70 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {Math.round((userTantiemes / 1000) * 100)}%
                                    </span>
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </span>
                </button>
            </div>

            {/* Dropdown édition tantièmes - apparaît sous le toggle */}
            <AnimatePresence>
                {viewMode === 'maPoche' && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50"
                    >
                        <div className="bg-[#0A0A0A]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl min-w-[200px]">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Votre quote-part</span>
                                <span className="text-[10px] text-gold/60">sur 1000</span>
                            </div>
                            
                            {/* Valeur éditable */}
                            <div className="flex items-center gap-3 mb-4">
                                <button 
                                    onClick={() => quickAdjust(-10)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors text-lg"
                                >
                                    −
                                </button>
                                
                                <div className="flex-1 relative">
                                    {isEditing ? (
                                        <input
                                            ref={inputRef}
                                            type="number"
                                            value={tempValue}
                                            onChange={(e) => setTempValue(e.target.value)}
                                            onBlur={handleSubmit}
                                            onKeyDown={handleKeyDown}
                                            className="w-full bg-gold/10 border border-gold/30 rounded-lg px-3 py-2 text-center text-xl font-bold text-gold focus:outline-none focus:ring-2 focus:ring-gold/50"
                                            min={1}
                                            max={1000}
                                        />
                                    ) : (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-center text-xl font-bold text-white transition-colors"
                                        >
                                            {userTantiemes}
                                        </button>
                                    )}
                                </div>
                                
                                <button 
                                    onClick={() => quickAdjust(10)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors text-lg"
                                >
                                    +
                                </button>
                            </div>

                            {/* Slider rapide */}
                            <div className="space-y-2">
                                <input
                                    type="range"
                                    min={1}
                                    max={1000}
                                    value={userTantiemes}
                                    onChange={(e) => setUserTantiemes(Number(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                                />
                                <div className="flex justify-between text-[9px] text-white/30 uppercase tracking-wider">
                                    <span>Studio</span>
                                    <span>T3</span>
                                    <span>Tout</span>
                                </div>
                            </div>

                            {/* Presets rapides */}
                            <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                                {[50, 100, 200, 1000].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => setUserTantiemes(val)}
                                        className={cn(
                                            "flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-colors",
                                            userTantiemes === val 
                                                ? "bg-gold/20 text-gold border border-gold/30" 
                                                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80"
                                        )}
                                    >
                                        {val === 1000 ? 'Tout' : val}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
