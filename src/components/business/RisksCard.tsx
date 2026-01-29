"use client";

import { useEffect, useState } from "react";
import { riskService, type GeoRisk } from "@/services/riskService";

interface RisksCardProps {
    coordinates?: {
        latitude: number;
        longitude: number;
    };
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

    // Pas de coordonnées = pas d'affichage
    if (!coordinates) {
        return null;
    }

    // Loading state
    if (loading) {
        return (
            <div className="card-bento animate-pulse">
                <div className="h-6 bg-surface-elevated rounded w-1/3 mb-4" />
                <div className="h-4 bg-surface-elevated rounded w-2/3" />
            </div>
        );
    }

    // Pas de données
    if (!risks) {
        return null;
    }

    const hasArgile = riskService.hasSignificantArgileRisk(risks);
    const hasInondation = risks.inondation;
    const urgency = riskService.getUrgencyLevel(risks);
    const hasRisks = hasArgile || hasInondation;

    return (
        <div className="card-bento h-full">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-text mb-1 flex items-center gap-2">
                        <span>🛡️</span> Vigilance Risques
                    </h3>
                    <p className="text-sm text-muted">
                        Analyse Géorisques
                    </p>
                </div>
            </div>

            <div className="space-y-4">
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
            </div>
        </div>
    );
};

const RiskItem = ({ icon, label, status, value }: { icon: string, label: string, status: 'success' | 'warning', value: string }) => {
    const isWarning = status === 'warning';

    return (
        <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${isWarning
                ? 'bg-warning/5 border-warning/20'
                : 'bg-surface-elevated/50 border-boundary'
            }`}>
            <div className="flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <span className={`font-medium ${isWarning ? 'text-text' : 'text-muted'}`}>
                    {label}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${isWarning ? 'text-warning' : 'text-success'
                    }`}>
                    {value}
                </span>
                <span className="text-sm">
                    {isWarning ? '⚠️' : '✅'}
                </span>
            </div>
        </div>
    );
};
