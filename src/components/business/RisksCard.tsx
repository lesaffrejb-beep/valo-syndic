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

                {/* Header Standardized */}
                <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-bold text-main flex items-center gap-2">
                        <span className="text-2xl">🛡️</span>
                        <span>Vigilance Aléas</span>
                    </h3>

                    {/* Global Status Badge */}
                    <div className={`px-3 py-1 rounded-full border backdrop-blur-md shadow-lg ${hasInondation
                            ? 'bg-red-500/20 border-red-500/50 text-red-200'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        }`}>
                        <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            {hasInondation ? 'Zone à Risque' : 'Zone Sécurisée'}
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
                        iconPath="M12 22c4.97 0 9-4.03 9-9 0-4.97-9-13-9-13S3 8.03 3 13c0 4.97 4.03 9 9 9z" // Water Drop
                        isDanger={safeRisks.inondation}
                    />

                    {/* Argile */}
                    <RiskGauge
                        label="Argiles"
                        value={safeRisks.argile * 33}
                        level={safeRisks.argile === 3 ? "Fort" : safeRisks.argile === 2 ? "Moyen" : "Faible"}
                        iconPath="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 5h14v14H5V5zm2 4h10v2H7V9zm0 4h10v2H7v-2z" // Bricks/Layers (Simplified)
                        isDanger={safeRisks.argile >= 2}
                    />

                    {/* Sismicité */}
                    <RiskGauge
                        label="Sismicité"
                        value={safeRisks.sismicite * 20}
                        level={`Zone ${safeRisks.sismicite}`}
                        iconPath="M2 12h2l2-6 4 12 4-12 2 6h2" // Pulse/Wave
                        isDanger={safeRisks.sismicite >= 3}
                    />

                    {/* Radon */}
                    <RiskGauge
                        label="Radon"
                        value={safeRisks.radon * 33}
                        level={`Niv. ${safeRisks.radon}`}
                        iconPath="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" // Warning/Hazard (Simplified)
                        isDanger={safeRisks.radon >= 3}
                    />

                    {/* Industriel */}
                    <RiskGauge
                        label="Industriel"
                        value={safeRisks.technologique ? 80 : 0}
                        level={safeRisks.technologique ? "Seveso" : "N/A"}
                        iconPath="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2V9h-2V7h8v12zm-2-4h-2v2h2v-2zm0-4h-2v2h2V9z" // Factory/Building
                        isDanger={safeRisks.technologique}
                    />

                </div>

                {/* 4. FOOTER / META */}

            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

interface RiskGaugeProps {
    label: string;
    value: number; // 0-100
    level: string;
    iconPath: string; // SVG Path d
    isDanger: boolean;
}

const RiskGauge = ({ label, value, level, iconPath, isDanger }: RiskGaugeProps) => {
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
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] group-hover:opacity-10 transition-opacity">
                <svg className="w-16 h-16 fill-current text-white" viewBox="0 0 24 24">
                    <path d={iconPath} />
                </svg>
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
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                        <path d={iconPath} />
                    </svg>
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
