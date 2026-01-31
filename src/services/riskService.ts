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

    /** Nouveaux champs pour affichage "Full Data" */
    mouvementTerrain: boolean;
    technologique: boolean;
    minier: boolean;
    feuxForet: boolean;
}

export const riskService = {
    /**
     * Récupère les risques naturels pour une position GPS donnée
     * API OPEN DATA : https://georisques.gouv.fr/api/v1/gaspar/risques
     */
    async fetchRisks(latitude: number, longitude: number): Promise<GeoRisk> {
        try {
            const response = await fetch(
                `https://georisques.gouv.fr/api/v1/gaspar/risques?lat=${latitude}&long=${longitude}`,
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

            // Helper to find risk by keyword within the raw data
            const checkRisk = (keyword: string) => data.data?.some(
                (risk: { libelle_risque_long?: string }) =>
                    risk.libelle_risque_long?.toLowerCase().includes(keyword)
            );

            // Detailed parsing
            const argileData = data.data?.find((r: any) => r.libelle_risque_long?.toLowerCase().includes('argile'));
            const sismiciteData = data.data?.find((r: any) => r.libelle_risque_long?.toLowerCase().includes('sismi'));
            const radonData = data.data?.find((r: any) => r.libelle_risque_long?.toLowerCase().includes('radon'));

            const result: GeoRisk = {
                // Argiles
                argile: argileData?.num_risque || (argileData?.niveau_exposition === 'Moyen' ? 2 : argileData?.niveau_exposition === 'Fort' ? 3 : 1),
                argileLabel: argileData?.niveau_exposition_label || (argileData ? 'Identifié' : 'Non concerné'),

                // Inondation (tous types : débordement, submersion, remontée nappe)
                inondation: checkRisk('inondation') || checkRisk('submersion'),

                // Sismicité
                sismicite: sismiciteData?.num_risque || 1,

                // Radon
                radon: radonData?.num_risque || 1,

                // Autres risques pour boucher les trous et faire "Data Dense"
                mouvementTerrain: checkRisk('mouvement de terrain') || checkRisk('cavité'),
                technologique: checkRisk('industriel') || checkRisk('technologique') || checkRisk('usine'),
                minier: checkRisk('minier'),
                feuxForet: checkRisk('eu de forêt'), // "Feu de forêt"
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
            radon: 1,
            sismicite: 1,
            mouvementTerrain: false,
            technologique: false,
            minier: false,
            feuxForet: false,
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
        if (risk.technologique) score += 2;

        if (score >= 2) return 'high';
        if (score >= 1) return 'medium';
        return 'low';
    },
};
