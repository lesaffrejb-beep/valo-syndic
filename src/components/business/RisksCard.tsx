"use client";

import { useEffect, useState } from "react";
import { riskService, type GeoRisk } from "@/services/riskService";

interface RisksCardProps {
    coordinates?: {
        latitude: number;
        longitude: number;
    } | undefined;
}

/**
 * RISKS CARD - Géorisques
 * Affiche les alertes de risques naturels (Argile, Inondation)
 */
export const RisksCard = ({ coordinates }: RisksCardProps) => {
    const [risks, setRisks] = useState<GeoRisk | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!coordinates) {
            setRisks(null);
            return;
        }

        setLoading(true);
        riskService
            .fetchRisks(coordinates.latitude, coordinates.longitude)
            .then(setRisks)
            .finally(() => setLoading(false));
    }, [coordinates]);

    // Loading state or No Coords (skeleton)
    if (!coordinates || loading) {
        return (
            <div className="card-obsidian h-full min-h-[350px] animate-pulse p-6">
                <div className="h-6 bg-white/10 rounded w-1/3 mb-6" />
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex justify-between items-center">
                            <div className="h-4 bg-white/5 rounded w-1/2" />
                            <div className="h-4 bg-white/5 rounded w-1/4" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Pas de données
    if (!risks) return null;

    const hasInondation = risks.inondation;

    return (
        <div className="card-obsidian h-full min-h-[350px] flex flex-col p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-danger/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="flex items-start justify-between mb-6 relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-main mb-1 flex items-center gap-2">
                        <span>🛡️</span> Vigilance Risques
                    </h3>
                    <p className="text-sm text-muted">
                        Analyse Géorisques Complète
                    </p>
                </div>
                {!hasInondation && (
                    <div className="px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success text-xs font-bold">
                        ZONE SÉCURISÉE
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 relative z-10 customized-scrollbar">
                {/* Inondation */}
                <RiskItem
                    icon="💧"
                    label="Inondation"
                    status={hasInondation ? 'warning' : 'success'}
                    value={hasInondation ? 'Zone Inondable' : 'Non concerné'}
                />

                {/* Argiles */}
                <RiskItem
                    icon="🧱"
                    label="Argiles (Fissures)"
                    status={risks.argile >= 2 ? 'warning' : 'success'}
                    value={risks.argile >= 2 ? (risks.argileLabel || 'Moyen / Fort') : 'Faible'}
                />

                {/* Mouvements de terrain */}
                <RiskItem
                    icon="🏔️"
                    label="Mouvements Terrain"
                    status={risks.mouvementTerrain ? 'warning' : 'success'}
                    value={risks.mouvementTerrain ? 'Zone Identifiée' : 'Non concerné'}
                />

                {/* Radon */}
                <RiskItem
                    icon="☢️"
                    label="Radon"
                    status={risks.radon >= 3 ? 'warning' : 'success'}
                    value={risks.radon >= 3 ? 'Significatif' : 'Faible'}
                />

                {/* Sismicité */}
                <RiskItem
                    icon="📉"
                    label="Sismicité"
                    status={risks.sismicite >= 3 ? 'warning' : 'success'}
                    value={risks.sismicite >= 3 ? 'À surveiller' : 'Faible'}
                />

                {/* Technologique */}
                <RiskItem
                    icon="🏭"
                    label="Risque Industriel"
                    status={risks.technologique ? 'warning' : 'success'}
                    value={risks.technologique ? 'Zone Seveso' : 'Non concerné'}
                />

                {/* Minier */}
                <RiskItem
                    icon="⛏️"
                    label="Risque Minier"
                    status={risks.minier ? 'warning' : 'success'}
                    value={risks.minier ? 'Zone Minière' : 'Non concerné'}
                />

                {/* Feux de forêt */}
                <RiskItem
                    icon="🔥"
                    label="Feux de Forêt"
                    status={risks.feuxForet ? 'warning' : 'success'}
                    value={risks.feuxForet ? 'Exposition' : 'Faible'}
                />
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 text-[10px] text-muted text-center">
                Données officielles Georisques.gouv.fr • Mise à jour 2025
            </div>
        </div>
    );
};

const RiskItem = ({ icon, label, status, value }: { icon: string, label: string, status: 'success' | 'warning', value: string }) => {
    const isWarning = status === 'warning';

    return (
        <div className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isWarning
            ? 'bg-warning/10 border-warning/30 hover:bg-warning/20'
            : 'bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.05]'
            }`}>
            <div className="flex items-center gap-3">
                <span className="text-lg opacity-80">{icon}</span>
                <span className={`font-medium text-sm ${isWarning ? 'text-white' : 'text-muted'}`}>
                    {label}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wide ${isWarning ? 'text-warning' : 'text-success'
                    }`}>
                    {value}
                </span>
                <span className="text-xs">
                    {isWarning ? '⚠️' : '✅'}
                </span>
            </div>
        </div>
    );
};
