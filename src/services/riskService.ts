/**
 * VALO-SYNDIC — Service Géorisques
 * =================================
 * Récupération des risques naturels via l'API Open Data du gouvernement
 */

export interface GeoRisk {
    /** Niveau de risque argile (retrait-gonflement) : 0=Nul, 1=Faible, 2=Moyen, 3=Fort */
    argile: number;
    /** Zone inondable identifiée */
    inondation: boolean;
    /** Niveau de radon (si disponible) */
    radon?: number;
    /** Libellé du risque argile */
    argileLabel?: string;
}

export const riskService = {
    /**
     * Récupère les risques naturels pour une position GPS donnée
     * API OPEN DATA : https://georisques.gouv.fr/api/v1/gaspar/risques
     */
    async fetchRisks(latitude: number, longitude: number): Promise<GeoRisk> {
        try {
            const response = await fetch(
                `https://georisques.gouv.fr/api/v1/gaspar/risques?latlon=${latitude},${longitude}`,
                {
                    headers: {
                        'Accept': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                console.warn(`Géorisques API failed: ${response.status}`);
                return this.getDefaultRisk();
            }

            const data = await response.json();

            // Parse argile (Retrait-gonflement des argiles)
            const argileRisk = data.data?.find(
                (risk: any) => risk.libelle_risque_long?.toLowerCase().includes('argile')
            );

            const argileNiveau = argileRisk?.niveau_exposition || 0;

            // Parse inondation
            const inondationRisk = data.data?.find(
                (risk: any) => risk.libelle_risque_long?.toLowerCase().includes('inondation')
            );

            const result: GeoRisk = {
                argile: argileNiveau,
                argileLabel: argileRisk?.niveau_exposition_label || 'Nul',
                inondation: !!inondationRisk,
            };

            return result;
        } catch (error) {
            console.error('Error fetching Géorisques:', error);
            return this.getDefaultRisk();
        }
    },

    /**
     * Retourne un objet de risque par défaut (pas de données)
     */
    getDefaultRisk(): GeoRisk {
        return {
            argile: 0,
            inondation: false,
            argileLabel: 'Données indisponibles',
        };
    },

    /**
     * Détermine si un risque argile est significatif (>= Moyen)
     */
    hasSignificantArgileRisk(risk: GeoRisk): boolean {
        return risk.argile >= 2;
    },

    /**
     * Retourne le niveau d'urgence global
     */
    getUrgencyLevel(risk: GeoRisk): 'high' | 'medium' | 'low' {
        if (risk.inondation && risk.argile >= 2) return 'high';
        if (risk.inondation || risk.argile >= 2) return 'medium';
        return 'low';
    },
};
