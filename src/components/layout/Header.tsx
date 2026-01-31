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



                    {/* Right Actions - Premium Buttons */}
                    <div className="flex items-center gap-1 sm:gap-2">



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

                        {/* Divider */}
                        <div className="w-px h-6 bg-white/[0.08] mx-1" />

                        {/* Authentication */}
                        {user ? (
                            /* User Menu */
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-main hover:bg-white/[0.04] transition-all duration-200 border border-transparent hover:border-white/[0.08]"
                                >
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20">
                                        <span className="text-xs font-semibold text-primary">
                                            {user.email?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="hidden md:inline text-xs max-w-[120px] truncate">
                                        {user.email}
                                    </span>
                                    <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 mt-2 w-56 bg-surface border border-boundary rounded-lg shadow-xl overflow-hidden z-50"
                                            >
                                                <div className="px-4 py-3 border-b border-boundary">
                                                    <p className="text-xs text-muted">Connecté en tant que</p>
                                                    <p className="text-sm text-main font-medium truncate">{user.email}</p>
                                                </div>
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => {
                                                            setShowUserMenu(false);
                                                            router.push('/dashboard');
                                                        }}
                                                        className="w-full px-4 py-2.5 text-left text-sm text-main hover:bg-white/[0.04] transition-colors flex items-center gap-3"
                                                    >
                                                        <span>💼</span>
                                                        <span>Mes Projets</span>
                                                    </button>
                                                    <button
                                                        onClick={handleSignOut}
                                                        className="w-full px-4 py-2.5 text-left text-sm text-muted hover:text-red-400 hover:bg-red-500/5 transition-colors flex items-center gap-3"
                                                    >
                                                        <span>🚪</span>
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
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 hover:border-primary/30 transition-all duration-200"
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
