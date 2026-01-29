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
    /** Niveau de radon : 1=Faible, 2=Moyen, 3=Elevé */
    radon: number;
    /** Niveau de sismicité : 1=Très faible, 2=Faible, 3=Modérée, 4=Moyenne, 5=Forte */
    sismicite: number;
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

            // Helper to find risk by keyword
            const findRisk = (keyword: string) => data.data?.find(
                (risk: any) => risk.libelle_risque_long?.toLowerCase().includes(keyword)
            );

            // Parse argile
            const argileRisk = findRisk('argile');
            // Parse inondation
            const inondationRisk = findRisk('inondation');
            // Parse radon
            const radonRisk = findRisk('radon');
            // Parse sismicite
            const sismiciteRisk = findRisk('sismi');

            const result: GeoRisk = {
                argile: argileRisk?.num_risque || 0, // Utiliser num_risque ou mapper niveau_exposition si dispo
                argileLabel: argileRisk?.niveau_exposition_label || 'Non concerné',
                inondation: !!inondationRisk, // Présence = risque
                radon: radonRisk?.num_risque || 1, // Default to 1 (Faible)
                sismicite: sismiciteRisk?.num_risque || 1, // Default to 1 (Très faible)
            };

            // Fallback mapping if num_risque is missing but fields exist (API structure varies)
            if (argileRisk && !result.argile) {
                // Map text labels if needed, or default logic
                if (argileRisk.niveau_exposition === 'Moyen') result.argile = 2;
                if (argileRisk.niveau_exposition === 'Fort') result.argile = 3;
            }

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
            radon: 1,
            sismicite: 1,
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
        let score = 0;
        if (risk.inondation) score += 2;
        if (risk.argile >= 2) score += 2;
        if (risk.radon >= 3) score += 1;
        if (risk.sismicite >= 3) score += 1;

        if (score >= 2) return 'high';
        if (score >= 1) return 'medium';
        return 'low';
    },
};
