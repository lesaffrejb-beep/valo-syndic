'use client';

import { type DiagnosticResult } from '@/lib/schemas';

interface DownloadConvocationButtonProps {
    result: DiagnosticResult;
}

/**
 * BOUTON DÉSACTIVÉ — V2 Feature
 * 
 * Ce bouton sera activé dans la V2 avec :
 * - Génération de projet de résolution personnalisé
 * - Modèles juridiques conformes
 * - Intégration e-signature
 * 
 * TODO: Implémenter la génération de projet de résolution
 * ISSUE: Nécessite validation juridique des modèles
 */
export function DownloadConvocationButton({ result }: DownloadConvocationButtonProps) {
    return (
        <button
            disabled
            title="Disponible en V2 — Bientôt"
            className="btn-secondary opacity-50 cursor-not-allowed flex items-center justify-center gap-2 relative"
        >
            <span>📄</span>
            <span className="hidden sm:inline">Projet de Résolution</span>
            <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-slate-600 text-white text-[10px] font-bold rounded-full">
                V2
            </span>
        </button>
    );
}
