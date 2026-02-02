"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { riskService, type GeoRisk } from "@/services/riskService";
import { AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Dynamic import for Leaflet map to avoid SSR issues
const RisksMap = dynamic(() => import("./RisksMap"), {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-deep/50 animate-pulse" />
});

interface RisksCardProps {
    coordinates?: {
        latitude: number;
        longitude: number;
    } | undefined;
}

export const RisksCard = ({ coordinates }: RisksCardProps) => {
    const [risks, setRisks] = useState<GeoRisk | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!coordinates) {
            setRisks(riskService.getDefaultRisk());
            return;
        }

        setLoading(true);
        setError(false);

        riskService.fetchRisks(coordinates.latitude, coordinates.longitude)
            .then((data) => {
                if (!data) {
                    setError(true);
                    setRisks(riskService.getDefaultRisk());
                    return;
                }
                setRisks(data);
            })
            .catch((err) => {
                console.error("Risk fetch error:", err);
                setError(true);
                setRisks(riskService.getDefaultRisk());
            })
            .finally(() => setLoading(false));
    }, [coordinates]);

    const safeRisks = risks || riskService.getDefaultRisk();
    const hasInondation = safeRisks.inondation;
    const isDegraded = error || !coordinates || risks === null;

    if (risks === null) {
        return (
            <Card variant="glass" className="h-full flex items-center justify-center p-6">
                <div className="text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-6 h-6 text-warning" />
                    </div>
                    <p className="text-sm text-muted">Données Géorisques indisponibles</p>
                </div>
            </Card>
        );
    }

    if (loading && !risks) {
        return (
            <Card variant="premium" className="h-full min-h-[400px] flex items-center justify-center">
                <div className="z-10 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
                    <p className="text-sm text-muted animate-pulse font-mono tracking-widest uppercase">Scanning...</p>
                </div>
            </Card>
        );
    }

    return (
        <Card variant="premium" className="h-full min-h-[400px] border-white/5 bg-deep/50 overflow-hidden group">
            {/* GLASSMORPHISM BACKGROUND - NO MAP */}
            <div className="absolute inset-0 z-0">
                {/* Abstract gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
                <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/80 to-transparent" />
            </div>

            {/* CONTENT */}
            <div className="relative z-10 p-6 flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-md">
                            <ShieldAlert className="w-5 h-5 text-main" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white tracking-tight">Vigilance Aléas</h3>
                            <p className="text-xs text-muted uppercase tracking-wider">Georisques.gouv.fr</p>
                        </div>
                    </div>

                    <div className={cn("px-3 py-1 rounded-full border backdrop-blur-md shadow-lg flex items-center gap-2",
                        isDegraded ? "bg-white/5 border-white/10 text-white/50" :
                            hasInondation ? "bg-danger/20 border-danger/50 text-danger-200" :
                                "bg-success/20 border-success/30 text-success-200"
                    )}>
                        <div className={cn("w-2 h-2 rounded-full animate-pulse", isDegraded ? "bg-gray-500" : hasInondation ? "bg-danger" : "bg-success")} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                            {isDegraded ? 'Indisponible' : hasInondation ? 'Zone à Risque' : 'Zone Sûre'}
                        </span>
                    </div>
                </div>

                {/* Gauges Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-auto">
                    <RiskGauge label="Inondation" value={safeRisks.inondation ? 100 : 0} isDanger={safeRisks.inondation} />
                    <RiskGauge label="Argiles" value={safeRisks.argile * 33} isDanger={safeRisks.argile >= 2} />
                    <RiskGauge label="Sismicité" value={safeRisks.sismicite * 20} isDanger={safeRisks.sismicite >= 3} />
                    <RiskGauge label="Radon" value={safeRisks.radon * 33} isDanger={safeRisks.radon >= 3} />
                    <RiskGauge label="Industriel" value={safeRisks.technologique ? 80 : 0} isDanger={safeRisks.technologique} />
                </div>
            </div>
        </Card>
    );
};

// Simplified SVG Gauge Component
const RiskGauge = ({ label, value, isDanger }: { label: string, value: number, isDanger: boolean }) => {
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    const color = isDanger ? "text-danger drop-shadow-lg" : "text-success drop-shadow-lg";

    return (
        <div className="flex flex-col items-center p-3 rounded-xl bg-black/40 border border-white/5 backdrop-blur-sm relative overflow-hidden group hover:scale-105 transition-transform duration-300">
            <div className="relative mb-2">
                <svg className="w-14 h-14 transform -rotate-90">
                    <circle className="text-white/5" strokeWidth="3" stroke="currentColor" fill="transparent" r={radius} cx="28" cy="28" />
                    <motion.circle
                        className={color}
                        strokeWidth="3"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius} cx="28" cy="28"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    {isDanger ? <AlertTriangle className="w-4 h-4 text-danger" /> : <ShieldCheck className="w-4 h-4 text-success" />}
                </div>
            </div>
            <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider">{label}</span>
        </div>
    )
}
