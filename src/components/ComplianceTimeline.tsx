import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { DPE_PROHIBITION_DATES, DPE_STATUS_LABELS, type DPELetter } from "@/lib/constants";
import { formatDate } from "@/lib/calculator";

interface ComplianceTimelineProps {
    currentDPE: DPELetter;
    className?: string;
}

export function ComplianceTimeline({ currentDPE, className = "" }: ComplianceTimelineProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const today = new Date();

    const entries: Array<{
        dpe: DPELetter;
        date: Date;
        isPast: boolean;
        isCurrent: boolean;
    }> = [];

    // Construire les entrées de la timeline - Chronologique (G -> F -> E)
    (["G", "F", "E"] as const).forEach((dpe) => {
        const date = DPE_PROHIBITION_DATES[dpe];
        if (date) {
            entries.push({
                dpe,
                date,
                isPast: date < today,
                isCurrent: dpe === currentDPE,
            });
        }
    });

    return (
        <motion.div
            ref={ref}
            className={`relative w-full ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header Section */}
            <div className="mb-8 flex items-center justify-between">
                <h3 className="text-xl font-bold text-main flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface border border-white/5 text-lg shadow-sm">
                        ⏳
                    </span>
                    <span className="tracking-tight">Calendrier Loi Climat</span>
                </h3>
            </div>

            <div className="relative">
                {/* Connector Line (Desktop: Horizontal, Mobile: Vertical) */}
                {/* Desktop Line */}
                <div className="hidden md:block absolute top-[2.5rem] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />

                {/* Mobile Line */}
                <div className="md:hidden absolute left-[1.65rem] top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent z-0" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative z-10">
                    {entries.map(({ dpe, date, isPast, isCurrent }, index) => {
                        const isCurrentDPE = dpe === currentDPE;

                        // Status Colors
                        const activeColor = isCurrentDPE ? "text-amber-400" : isPast ? "text-red-400" : "text-muted";
                        const activeBorder = isCurrentDPE ? "border-amber-500/50 shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)] bg-amber-500/5" : isPast ? "border-red-500/20 bg-red-500/5" : "border-white/5 bg-surface/40";
                        const dotColor = isCurrentDPE ? "bg-amber-500 border-amber-950" : isPast ? "bg-red-900/50 border-red-500/50" : "bg-surface border-white/10";

                        return (
                            <motion.div
                                key={dpe}
                                className="group relative pl-16 md:pl-0"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{
                                    duration: 0.5,
                                    delay: 0.1 + index * 0.1,
                                    ease: "easeOut"
                                }}
                            >
                                {/* Timeline Dot */}
                                <div className={`absolute left-5 md:left-1/2 md:-translate-x-1/2 top-8 md:top-[2.5rem] md:-translate-y-1/2 w-4 h-4 rounded-full border-[3px] z-20 transition-all duration-500 ${dotColor} ${isCurrentDPE ? 'scale-125' : ''}`}>
                                    {isCurrentDPE && <div className="absolute inset-0 rounded-full animate-ping bg-amber-500/30" />}
                                </div>

                                {/* Content Card */}
                                <div className={`
                                    relative p-6 rounded-2xl border backdrop-blur-md transition-all duration-300 md:mt-16 md:text-center flex flex-col items-start md:items-center h-full
                                    ${activeBorder} hover:border-white/10 hover:bg-surface/60
                                `}>
                                    {/* Date Wrapper */}
                                    <div className="mb-4">
                                        <div className={`
                                            inline-flex items-center gap-2 px-3 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-widest border
                                            ${isCurrentDPE ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : isPast ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-white/5 border-white/5 text-muted'}
                                         `}>
                                            <span>{formatDate(date)}</span>
                                        </div>
                                    </div>

                                    {/* DPE Letter */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className={`text-5xl font-black tracking-tighter ${activeColor}`}>
                                            {dpe}
                                        </span>
                                        {isCurrentDPE && (
                                            <span className="text-[9px] font-extrabold text-black bg-amber-400 px-2 py-0.5 rounded uppercase tracking-widest border border-amber-300 shadow-[0_2px_10px_-3px_rgba(245,158,11,0.5)]">
                                                Actuel
                                            </span>
                                        )}
                                    </div>

                                    {/* Status Text */}
                                    <div className="mt-auto">
                                        {isPast ? (
                                            <div className="flex items-center gap-2 md:justify-center text-red-400/80 text-sm font-medium">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                Interdiction en cours
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs text-muted uppercase tracking-wide font-medium">Interdit dans</span>
                                                <span className={`text-2xl font-mono font-bold ${activeColor}`}>
                                                    {Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30))}
                                                    <span className="text-xs ml-1 font-sans font-normal text-muted/60">MOIS</span>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}

// Ensure default exports don't conflict (standard pattern)

// 2025, 2028, 2034 are the default keys in constants, rendering in that order because of the array literal.
