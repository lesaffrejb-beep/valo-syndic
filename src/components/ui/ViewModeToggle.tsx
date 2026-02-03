"use client";

import { motion } from "framer-motion";
import { useViewModeStore, type ViewMode } from "@/stores/useViewModeStore";
import { cn } from "@/lib/utils";
import { Building2, User } from "lucide-react";

export function ViewModeToggle({ className }: { className?: string }) {
    const { viewMode, setViewMode } = useViewModeStore();

    const options: { id: ViewMode; label: string; icon: React.ElementType }[] = [
        { id: 'immeuble', label: 'Immeuble', icon: Building2 },
        { id: 'maPoche', label: 'Ma Poche', icon: User },
    ];

    return (
        <div className={cn("flex flex-col md:flex-row items-center justify-center gap-4", className)}>
            {/* SEGMENTED CONTROL */}
            <div className="inline-flex bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-md relative">
                {options.map((option) => {
                    const isActive = viewMode === option.id;
                    return (
                        <button
                            key={option.id}
                            onClick={() => setViewMode(option.id)}
                            className={cn(
                                "relative z-10 px-6 py-2.5 rounded-full text-sm font-bold transition-colors duration-200 flex items-center gap-2",
                                isActive ? "text-black" : "text-muted hover:text-white"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-toggle-bg"
                                    className="absolute inset-0 bg-white rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    style={{ zIndex: -1 }}
                                />
                            )}
                            <option.icon className="w-4 h-4" />
                            <span className="uppercase tracking-wide text-xs">{option.label}</span>
                        </button>
                    );
                })}
            </div>

        </div>
    );
}
