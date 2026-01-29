"use client";

import Link from 'next/link';
import { useBrandStore } from "@/stores/useBrandStore";
import { ShareButton } from "@/components/ui/ShareButton";
import { ProjectionModeToggle } from "@/components/ui/ProjectionModeToggle";
import { motion } from "framer-motion";

interface HeaderProps {
    onOpenBranding: () => void;
    onSave: () => void;
    onLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
    hasResult: boolean;
    fileInputRef: React.RefObject<HTMLInputElement>;
}

export function Header({ onOpenBranding, onSave, onLoad, hasResult, fileInputRef }: HeaderProps) {
    const brand = useBrandStore((state) => state.brand);

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed top-0 left-0 right-0 z-50 print:hidden"
        >
            {/* Glassmorphism Layer */}
            <div className="absolute inset-0 bg-app/60 backdrop-blur-xl border-b border-white/[0.06]" />

            {/* Subtle Gradient Line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo Section - Premium Style */}
                    <Link href="/" className="group flex items-center gap-3">
                        {brand.logoUrl ? (
                            <div className="relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={brand.logoUrl}
                                    alt="Logo Agence"
                                    className="h-9 w-auto object-contain rounded-lg ring-1 ring-white/10 group-hover:ring-primary/30 transition-all duration-300"
                                />
                                <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/5 group-hover:ring-primary/20 transition-all" />
                            </div>
                        ) : (
                            <div className="relative">
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative w-9 h-9 bg-gradient-to-br from-surface to-surface-hover rounded-lg flex items-center justify-center ring-1 ring-white/10 group-hover:ring-primary/40 transition-all duration-300 shadow-lg shadow-black/20">
                                    <span className="text-primary font-bold text-lg tracking-tight">
                                        {brand.agencyName.charAt(0)}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col">
                            <span className="text-[15px] font-semibold text-main tracking-tight group-hover:text-primary transition-colors duration-200">
                                {brand.agencyName}
                            </span>
                            <span className="text-[11px] text-muted tracking-wide uppercase font-medium">
                                Diagnostic Patrimonial
                            </span>
                        </div>
                    </Link>

                    {/* Center - Trust Badge (Hidden on mobile) */}
                    <div className="hidden lg:flex items-center">
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.06] hover:border-primary/20 transition-colors duration-300">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success/60 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500"></span>
                            </span>
                            <span className="text-xs text-muted font-medium tracking-wide">
                                Calcul sécurisé
                            </span>
                            <span className="text-[10px] text-subtle px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                                2026
                            </span>
                        </div>
                    </div>

                    {/* Right Actions - Premium Buttons */}
                    <div className="flex items-center gap-1 sm:gap-2">

                        {/* Settings - Icon Only */}
                        <button
                            onClick={onOpenBranding}
                            className="p-2.5 rounded-lg text-muted hover:text-main hover:bg-white/[0.04] transition-all duration-200 border border-transparent hover:border-white/[0.08]"
                            title="Personnalisation"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.077-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.048 4.025a3 3 0 01-4.293 0l3.388-1.62m5.048 4.025a15.998 15.998 0 003.388-1.62m-5.048 4.025a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.077-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62M12 12a3 3 0 11-6 0 3 3 0 016 0zm0 0v.008" />
                            </svg>
                        </button>

                        {/* Divider */}
                        <div className="hidden sm:block w-px h-6 bg-white/[0.08] mx-1" />

                        {/* Save/Load - Desktop Only */}
                        <div className="hidden sm:flex items-center gap-1">
                            <button
                                onClick={onSave}
                                disabled={!hasResult}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-muted hover:text-main hover:bg-white/[0.04] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-200 border border-transparent hover:border-white/[0.08]"
                                title="Sauvegarder"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="hidden md:inline">Exporter</span>
                            </button>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-muted hover:text-main hover:bg-white/[0.04] transition-all duration-200 border border-transparent hover:border-white/[0.08]"
                                title="Importer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <span className="hidden md:inline">Importer</span>
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".valo,.json"
                                onChange={onLoad}
                                className="hidden"
                            />
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block w-px h-6 bg-white/[0.08] mx-1" />

                        {/* Share & Projection */}
                        <div className="flex items-center gap-1">
                            <ShareButton />
                            <ProjectionModeToggle />
                        </div>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
