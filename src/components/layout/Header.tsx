"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import { useBrandStore } from "@/stores/useBrandStore";
import { useAuth } from "@/hooks/useAuth";
import { ShareButton } from "@/components/ui/ShareButton";
import { ProjectionModeToggle } from "@/components/ui/ProjectionModeToggle";

interface HeaderProps {
    onOpenBranding: () => void;
    onSave: () => void;
    onLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
    hasResult: boolean;
    fileInputRef: React.RefObject<HTMLInputElement>;
    onOpenAuth?: () => void;
}

export function Header({ onOpenBranding, onSave, onLoad, hasResult, fileInputRef, onOpenAuth }: HeaderProps) {
    const brand = useBrandStore((state) => state.brand);
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleSignOut = async () => {
        try {
            await signOut();
            setShowUserMenu(false);
            router.push('/');
        } catch (error) {
            console.error('Sign out failed:', error);
        }
    };

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 print:hidden"
        >
            {/* Premium Glassmorphism Layer */}
            <div className="absolute inset-0 bg-[#0A0A0A]/80 backdrop-blur-[20px] supports-[backdrop-filter]:bg-[#0A0A0A]/60 border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.1)]" />

            {/* Subtle Gradient Shine */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent opacity-50" />

            <div className="relative max-w-[1400px] mx-auto px-6 md:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Logo Section - Premium Style */}
                    <Link href="/" className="group flex items-center gap-4">
                        {brand.logoUrl ? (
                            <div className="relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={brand.logoUrl}
                                    alt="Logo Agence"
                                    className="h-10 w-auto object-contain rounded-lg ring-1 ring-white/10 group-hover:ring-gold/30 transition-all duration-500"
                                />
                                <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/5 group-hover:ring-gold/20 transition-all duration-500" />
                            </div>
                        ) : (
                            <div className="relative">
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-gold/20 blur-xl rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="relative w-10 h-10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-xl flex items-center justify-center ring-1 ring-white/10 group-hover:ring-gold/40 transition-all duration-500 shadow-lg shadow-black/20">
                                    <span className="text-gold font-bold text-lg tracking-tight font-serif">
                                        {brand.agencyName.charAt(0)}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-0.5">
                            <span className="text-[15px] font-semibold text-white tracking-tight group-hover:text-gold transition-colors duration-300">
                                {brand.agencyName}
                            </span>
                            <span className="text-[10px] text-muted tracking-[0.15em] uppercase font-medium">
                                Diagnostic Patrimonial
                            </span>
                        </div>
                    </Link>



                    {/* Right Actions - Premium Buttons */}
                    <div className="flex items-center gap-2 sm:gap-3">

                        {/* Save/Load - Desktop Only */}
                        <div className="hidden sm:flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06] backdrop-blur-md">
                            <button
                                onClick={onSave}
                                disabled={!hasResult}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-muted hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-300"
                                title="Sauvegarder"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="hidden lg:inline">Exporter</span>
                            </button>

                            <div className="w-px h-4 bg-white/[0.08]" />

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-muted hover:text-white hover:bg-white/[0.06] transition-all duration-300"
                                title="Importer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <span className="hidden lg:inline">Importer</span>
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".valo,.json"
                                onChange={onLoad}
                                className="hidden"
                            />
                        </div>

                        {/* Share & Projection */}
                        <div className="flex items-center gap-1.5 pl-2">
                            <ShareButton />
                            <ProjectionModeToggle />
                        </div>

                        {/* Authentication Separator */}
                        <div className="hidden sm:block w-px h-8 bg-gradient-to-b from-transparent via-white/[0.1] to-transparent mx-1" />

                        {/* Authentication */}
                        {user ? (
                            /* User Menu - Wrapper */
                            <div className="relative group">
                                {/* User Button */}
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-3 pl-1 pr-2 py-1.5 rounded-full hover:bg-white/[0.04] transition-all duration-300 border border-transparent hover:border-white/[0.08]"
                                >
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center border border-gold/20 ring-2 ring-transparent group-hover:ring-gold/10 transition-all">
                                        <span className="text-xs font-bold text-gold font-serif">
                                            {user.email?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="hidden md:flex flex-col items-start">
                                        <span className="text-xs font-medium text-white max-w-[100px] truncate leading-tight">
                                            {user.email?.split('@')[0]}
                                        </span>
                                        <span className="text-[10px] text-muted leading-tight">Connecté</span>
                                    </div>
                                    <svg className="w-3.5 h-3.5 text-muted group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                <AnimatePresence>
                                    {showUserMenu && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setShowUserMenu(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                                transition={{ duration: 0.2, ease: "easeOut" }}
                                                className="absolute right-0 mt-3 w-64 bg-[#0A0A0A]/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] overflow-hidden z-50 ring-1 ring-white/[0.05]"
                                            >
                                                <div className="p-4 border-b border-white/[0.06] bg-white/[0.02]">
                                                    <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1">Compte</p>
                                                    <p className="text-sm text-white font-medium truncate">{user.email}</p>
                                                </div>
                                                <div className="p-2 space-y-0.5">
                                                    <button
                                                        onClick={() => {
                                                            setShowUserMenu(false);
                                                            router.push('/dashboard');
                                                        }}
                                                        className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all duration-200 flex items-center gap-3 group/item"
                                                    >
                                                        <span className="text-lg opacity-60 group-hover/item:opacity-100 transition-opacity">💼</span>
                                                        <span>Mes Projets</span>
                                                    </button>
                                                    <div className="h-px bg-white/[0.04] my-1 mx-2" />
                                                    <button
                                                        onClick={handleSignOut}
                                                        className="w-full px-4 py-2.5 text-left text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 flex items-center gap-3 group/item"
                                                    >
                                                        <span className="text-lg opacity-60 group-hover/item:opacity-100 transition-opacity">🚪</span>
                                                        <span>Se déconnecter</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            /* Login Button */
                            <button
                                onClick={onOpenAuth}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gold text-[#050507] hover:bg-gold-light hover:shadow-[0_0_20px_-5px_rgba(229,192,123,0.4)] hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-black/10"
                            >
                                <span>🔐</span>
                                <span className="hidden sm:inline">Se connecter</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
