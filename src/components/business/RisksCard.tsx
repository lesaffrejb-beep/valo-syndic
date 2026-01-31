"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { riskService, type GeoRisk } from "@/services/riskService";
import { motion } from "framer-motion";

// Dynamic import for Leaflet map to avoid SSR issues
const RisksMap = dynamic(() => import("./RisksMap"), {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-[#0B0C0E] animate-pulse" />
});

interface RisksCardProps {
    coordinates?: {
        latitude: number;
        longitude: number;
    } | undefined;
}

/**
 * RISKS CARD - SITUATION ROOM
 * Dashboard de vigilance "Georisques" style Command Center
 */
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

        riskService
            .fetchRisks(coordinates.latitude, coordinates.longitude)
            .then(setRisks)
            .catch((err) => {
                console.error("Risk fetch error:", err);
                setError(true);
                setRisks(riskService.getDefaultRisk());
            })
            .finally(() => setLoading(false));
    }, [coordinates]);

    // Safe fallback keys
    const safeRisks = risks || riskService.getDefaultRisk();
    const hasInondation = safeRisks.inondation;

    // Loading State
    if (loading && !risks) {
        return (
            <div className="card-obsidian h-full min-h-[400px] relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-app" />
                <div className="z-10 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm text-muted animate-pulse font-mono tracking-widest uppercase">
                        Scanning Georisques...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="card-obsidian h-full min-h-[400px] relative overflow-hidden group border-white/5 bg-[#0B0C0E]">

            {/* 1. MAP BACKGROUND (Absolute) */}
            {coordinates ? (
                <RisksMap lat={coordinates.latitude} lng={coordinates.longitude} />
            ) : (
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
            )}

            {/* 2. GLASS OVERLAY (Content Wrapper) */}
            <div className="relative z-10 flex flex-col h-full bg-app/40 backdrop-blur-sm p-6 sm:p-8 hover:backdrop-blur-[2px] transition-all duration-500">

                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="relative flex h-2 w-2">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hasInondation ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${hasInondation ? 'bg-red-500' : 'bg-green-500'}`}></span>
                            </span>
                            <h3 className="text-sm font-bold text-muted uppercase tracking-widest font-mono">
                                Vigilance Georisques
                            </h3>
                        </div>
                        <h2 className="text-2xl font-black text-white glow-text">
                            Analyse Terrain
                        </h2>
                    </div>

                    {/* Global Status Badge */}
                    <div className={`px-4 py-1.5 rounded-full border backdrop-blur-md shadow-lg ${hasInondation
                            ? 'bg-red-500/20 border-red-500/50 text-red-200'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        }`}>
                        <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            {hasInondation ? '⚠️ Zone à Risque' : '🛡️ Zone Sécurisée'}
                        </span>
                    </div>
                </div>

                {/* 3. GAUGES GRID */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-auto">

                    {/* Inondation (Major) */}
                    <RiskGauge
                        label="Inondation"
                        value={safeRisks.inondation ? 100 : 0}
                        level={safeRisks.inondation ? "High" : "Low"}
                        icon="💧"
                        isDanger={safeRisks.inondation}
                    />

                    {/* Argile */}
                    <RiskGauge
                        label="Argiles (RGA)"
                        value={safeRisks.argile * 33} // 1=33%, 2=66%, 3=100%
                        level={safeRisks.argile === 3 ? "Fort" : safeRisks.argile === 2 ? "Moyen" : "Faible"}
                        icon="🧱"
                        isDanger={safeRisks.argile >= 2}
                    />

                    {/* Sismicité */}
                    <RiskGauge
                        label="Sismicité"
                        value={safeRisks.sismicite * 20} // 1 to 5 mapped to 100
                        level={`Zone ${safeRisks.sismicite}`}
                        icon="📉"
                        isDanger={safeRisks.sismicite >= 3}
                    />

                    {/* Radon */}
                    <RiskGauge
                        label="Radon"
                        value={safeRisks.radon * 33}
                        level={`Niv. ${safeRisks.radon}`}
                        icon="☢️"
                        isDanger={safeRisks.radon >= 3}
                    />

                    {/* Industriel */}
                    <RiskGauge
                        label="Industriel"
                        value={safeRisks.technologique ? 80 : 0}
                        level={safeRisks.technologique ? "Seveso" : "N/A"}
                        icon="🏭"
                        isDanger={safeRisks.technologique}
                    />

                </div>

                {/* 4. FOOTER / META */}
                <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] text-muted font-mono uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        API Connected
                    </div>
                    <div>
                        Lat: {coordinates?.latitude.toFixed(4)} | Lon: {coordinates?.longitude.toFixed(4)}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

interface RiskGaugeProps {
    label: string;
    value: number; // 0-100
    level: string;
    icon: string;
    isDanger: boolean;
}

const RiskGauge = ({ label, value, level, icon, isDanger }: RiskGaugeProps) => {
    // Circle math
    const radius = 26;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    const color = isDanger
        ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
        : "text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]";

    return (
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-black/40 border border-white/5 backdrop-blur-md relative overflow-hidden group hover:bg-black/60 transition-colors">
            {/* Icon Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] group-hover:opacity-10 transition-opacity text-5xl grayscale">
                {icon}
            </div>

            <div className="relative mb-2">
                {/* SVG Gauge */}
                <svg className="w-16 h-16 transform -rotate-90">
                    {/* Background Circle */}
                    <circle
                        className="text-white/10"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="32"
                        cy="32"
                    />
                    {/* Value Circle */}
                    <motion.circle
                        className={color}
                        strokeWidth="4"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="32"
                        cy="32"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </svg>

                {/* Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center text-lg">
                    {icon}
                </div>
            </div>

            <div className="text-center z-10">
                <div className={`text-xs font-bold font-mono mb-0.5 ${isDanger ? 'text-red-300' : 'text-emerald-300'}`}>
                    {level}
                </div>
                <div className="text-[10px] text-muted uppercase tracking-wide font-semibold">
                    {label}
                </div>
            </div>
        </div>
    );
}
