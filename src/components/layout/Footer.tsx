import { LEGAL } from "@/lib/constants";

interface FooterProps {
    onSave?: () => void;
    onLoad?: () => void;
    hasResult?: boolean;
}

export function Footer({ onSave, onLoad, hasResult }: FooterProps) {
    return (
        <footer className="bg-surface border-t border-boundary mt-12 print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Disclaimer juridique */}
                <div className="mb-6 p-4 bg-warning/5 border border-warning/20 rounded-xl">
                    <p className="text-xs text-warning-500 font-medium mb-1">
                        Simulation indicative
                    </p>
                    <p className="text-xs text-muted leading-relaxed">
                        Les montants affichés sont des estimations basées sur les dispositions réglementaires 2026.
                        Ils ne constituent pas un engagement contractuel et sont soumis à l&apos;éligibilité des travaux
                        et des ressources des copropriétaires. Un audit énergétique OPQIBI est requis pour valider
                        les montants définitifs.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-surface-hover rounded-lg flex items-center justify-center">
                            <span className="text-muted font-bold text-sm">V</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-main">VALO-SYNDIC</p>
                            <p className="text-xs text-muted">Outil d&apos;aide à la décision • 2026</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        {/* Mobile save/load buttons */}
                        <div className="flex sm:hidden items-center gap-2">
                            <button
                                onClick={onSave}
                                disabled={!hasResult}
                                className="btn-ghost text-xs disabled:opacity-50"
                            >
                                💾
                            </button>
                            <button
                                onClick={onLoad}
                                className="btn-ghost text-xs"
                            >
                                📂
                            </button>
                        </div>
                        <a
                            href="/legal"
                            className="text-sm text-muted hover:text-main transition-colors"
                        >
                            Mentions légales
                        </a>
                        <span className="text-subtle">|</span>
                        <span className="text-xs text-muted">
                            Données au {LEGAL.lastUpdate.toLocaleDateString("fr-FR")}
                        </span>
                    </div>
                </div>

                {/* Sources officielles */}
                <div className="mt-6 pt-4 border-t border-boundary">
                    <p className="text-xs text-subtle mb-2">Sources réglementaires :</p>
                    <div className="flex flex-wrap gap-4">
                        <a
                            href="https://www.service-public.fr/particuliers/vosdroits/F35083"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted hover:text-primary transition-colors underline underline-offset-2"
                        >
                            MaPrimeRénov&apos; Copropriété
                        </a>
                        <a
                            href="https://www.service-public.fr/particuliers/vosdroits/F19905"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted hover:text-primary transition-colors underline underline-offset-2"
                        >
                            Éco-PTZ
                        </a>
                        <a
                            href="https://www.ecologie.gouv.fr/interdictions-location-passoires-energetiques"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted hover:text-primary transition-colors underline underline-offset-2"
                        >
                            Loi Climat & Résilience
                        </a>
                        <a
                            href="https://france-renov.gouv.fr"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted hover:text-primary transition-colors underline underline-offset-2"
                        >
                            France Rénov&apos;
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
