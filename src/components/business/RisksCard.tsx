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
        const doFetch = async () => {
            if (!coordinates) {
                setRisks(riskService.getDefaultRisk());
                return;
            }

            setLoading(true);
            setError(false);

            try {
                const data = await riskService.fetchRisks(coordinates.latitude, coordinates.longitude);
                if (!data) {
                    setError(true);
                    setRisks(riskService.getDefaultRisk());
                    return;
                }
                setRisks(data);
            } catch (err) {
                console.error("Risk fetch error:", err);
                setError(true);
                setRisks(riskService.getDefaultRisk());
            } finally {
                setLoading(false);
            }
        };

        doFetch();
    }, [coordinates]);

    const safeRisks = risks || riskService.getDefaultRisk();
    const hasInondation = safeRisks.inondation;
    const isDegraded = error || !coordinates || risks === null;

    if (risks === null) {
        return (
            <Card variant="glass" className="h-full flex items-center justify-center p-6 group hover:border-white/10 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)]">
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
            <Card variant="premium" className="h-full min-h-[520px] flex items-center justify-center group hover:border-white/10 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)]">
                <div className="z-10 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
                    <p className="text-sm text-muted animate-pulse font-mono tracking-widest uppercase">Scanning...</p>
                </div>
            </Card>
        );
    }

    return (
        <Card variant="premium" className="h-full min-h-[520px] border-white/5 bg-deep/50 overflow-hidden group hover:border-white/10 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)]">
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
                            <h3 className="text-xl font-bold text-white tracking-tight">Vigilance Aléas</h3>
                            <p className="text-xs text-muted uppercase tracking-wider">Georisques.gouv.fr</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={async () => {
                                if (!coordinates) return;
                                setLoading(true);
                                const data = await riskService.fetchRisks(coordinates.latitude, coordinates.longitude);
                                if (!data) {
                                    setError(true);
                                    setRisks(riskService.getDefaultRisk());
                                } else {
                                    setRisks(data);
                                    setError(false);
                                }
                                setLoading(false);
                            }}
                            className="text-xs px-3 py-1 rounded-full bg-white/5 hover:bg-white/8 transition-colors"
                        >
                            Rafraîchir
                        </button>

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
                </div>
                {/* NEW: Vertical list layout for clarity */}
                <div className="flex flex-col gap-3 mb-auto">
                    <RiskListItem label="Inondation" value={safeRisks.inondation ? 100 : 0} isDanger={safeRisks.inondation} />
                    <RiskListItem label="Argiles" value={safeRisks.argile * 33} isDanger={safeRisks.argile >= 2} />
                    <RiskListItem label="Sismicité" value={safeRisks.sismicite * 20} isDanger={safeRisks.sismicite >= 3} />
                    <RiskListItem label="Radon" value={safeRisks.radon * 33} isDanger={safeRisks.radon >= 3} />
                    <RiskListItem label="Industriel" value={safeRisks.technologique ? 80 : 0} isDanger={safeRisks.technologique} />
                </div>
            </div>
        </Card>
    );
};

// Simplified SVG Gauge Component
const RiskListItem = ({ label, value, isDanger }: { label: string, value: number, isDanger: boolean }) => {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isDanger ? 'bg-danger/20 text-danger' : 'bg-success/10 text-success'}`}>
                    {isDanger ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </div>
                <div>
                    <div className="text-sm font-bold text-white">{label}</div>
                    <div className="text-xs text-muted">{isDanger ? 'Niveau élevé' : 'Niveau faible'}</div>
                </div>
            </div>

            <div className="w-32">
                <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                    <motion.div
                        className={`${isDanger ? 'bg-danger' : 'bg-success'}`}
                        style={{ width: `${value}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                </div>
                <div className="text-xs text-right font-bold text-white tabular-nums">{value}%</div>
            </div>
        </div>
    );
}
