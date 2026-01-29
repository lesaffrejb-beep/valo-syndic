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
        <div className="card-bento">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-text mb-1">
                        Vigilance Risques Naturels
                    </h3>
                    <p className="text-sm text-muted">
                        Source : Géorisques (Open Data)
                    </p>
                </div>
                {urgency === 'high' && (
                    <span className="text-2xl" title="Risque élevé">⚠️</span>
                )}
            </div>

            <div className="space-y-3">
                {/* Risque Argile */}
                {hasArgile ? (
                    <div className="flex items-start gap-3 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                        <span className="text-2xl flex-shrink-0">🧱</span>
                        <div className="flex-1">
                            <p className="font-medium text-warning">
                                Risque Fissures (Argile)
                            </p>
                            <p className="text-sm text-muted mt-1">
                                Zone de retrait-gonflement des argiles : <strong>{risks.argileLabel}</strong>
                            </p>
                            <p className="text-xs text-muted mt-2">
                                💡 Surveiller les fissures structurelles, étude géotechnique recommandée.
                            </p>
                        </div>
                    </div>
                ) : null}

                {/* Risque Inondation */}
                {hasInondation ? (
                    <div className="flex items-start gap-3 p-3 bg-info/10 border border-info/30 rounded-lg">
                        <span className="text-2xl flex-shrink-0">💧</span>
                        <div className="flex-1">
                            <p className="font-medium text-info">
                                Zone Inondable
                            </p>
                            <p className="text-sm text-muted mt-1">
                                Le bâtiment est situé dans une zone à risque d&apos;inondation.
                            </p>
                            <p className="text-xs text-muted mt-2">
                                💡 Vérifier les dispositifs de protection et l&apos;assurance catastrophe naturelle.
                            </p>
                        </div>
                    </div>
                ) : null}

                {/* Aucun risque */}
                {!hasRisks && (
                    <div className="flex items-start gap-3 p-3 bg-success/10 border border-success/30 rounded-lg">
                        <span className="text-2xl flex-shrink-0">✅</span>
                        <div className="flex-1">
                            <p className="font-medium text-success">
                                Aucun risque majeur identifié
                            </p>
                            <p className="text-sm text-muted mt-1">
                                Aucun risque naturel significatif détecté pour cette adresse.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
