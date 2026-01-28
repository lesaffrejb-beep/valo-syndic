import { useBrand } from "@/context/BrandContext";
import { ShareButton } from "@/components/ui/ShareButton";
import { ProjectionModeToggle } from "@/components/ui/ProjectionModeToggle";

interface HeaderProps {
    onOpenBranding: () => void;
    onSave: () => void;
    onLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
    hasResult: boolean;
    fileInputRef: React.RefObject<HTMLInputElement>;
}

export function Header({ onOpenBranding, onSave, onLoad, hasResult, fileInputRef }: HeaderProps) {
    const { brand } = useBrand();

    return (
        <header className="glass sticky top-0 z-50 print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        {brand.logoUrl ? (
                            <img src={brand.logoUrl} alt="Logo Agence" className="h-11 object-contain rounded-lg" />
                        ) : (
                            <div className="w-11 h-11 bg-gradient-to-br from-primary-700 to-primary-900 rounded-lg flex items-center justify-center shadow-glow">
                                <span className="text-primary-foreground font-sans font-bold text-xl">
                                    {brand.agencyName.charAt(0)}
                                </span>
                            </div>
                        )}
                        <div>
                            <h1 className="text-xl font-bold text-main tracking-tight">{brand.agencyName}</h1>
                            <p className="text-xs text-muted">Diagnostic Patrimonial</p>
                        </div>
                    </a>
                    <div className="flex items-center gap-3">
                        {/* Settings Button */}
                        <button
                            onClick={onOpenBranding}
                            className="btn-ghost p-2"
                            title="Personnalisation"
                        >
                            ⚙️
                        </button>

                        {/* Boutons Sauvegarder/Charger */}
                        <div className="hidden sm:flex items-center gap-2">
                            <button
                                onClick={onSave}
                                disabled={!hasResult}
                                className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Sauvegarder la simulation"
                            >
                                💾 Sauvegarder
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="btn-ghost"
                                title="Charger une simulation"
                            >
                                📂 Charger
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".valo,.json"
                                onChange={onLoad}
                                className="hidden"
                            />
                        </div>

                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-success-100 rounded-lg border border-success/30">
                            <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></span>
                            <span className="text-xs font-medium text-success-500">Calcul 100% local</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <ShareButton />
                            <ProjectionModeToggle />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
