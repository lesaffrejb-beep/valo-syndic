-- ============================================================================
-- VALO-SYNDIC — VUE ANALYTIQUE DISTRIBUTION DPE
-- Version: 1.0.0
-- Date: 2026-01-30
-- ============================================================================
-- Cette vue matérialisée calcule la distribution des DPE par ville/code postal
-- Utilisée pour le benchmarking et "Social Proof" dans le dashboard
-- ============================================================================

-- DROP si existe (pour re-création)
DROP MATERIALIZED VIEW IF EXISTS analytics_dpe_distribution CASCADE;

-- Créer la vue matérialisée
CREATE MATERIALIZED VIEW analytics_dpe_distribution AS
SELECT
    -- Groupement géographique
    code_postal,
    ville,

    -- Étiquette DPE
    etiquette_dpe,

    -- Statistiques d'agrégation
    COUNT(*) as nombre_dpe,
    AVG(conso_kwh_m2_an) as conso_moyenne,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY conso_kwh_m2_an) as conso_mediane,
    MIN(conso_kwh_m2_an) as conso_min,
    MAX(conso_kwh_m2_an) as conso_max,

    -- Statistiques surface
    AVG(surface_habitable) as surface_moyenne,

    -- Statistiques année construction
    AVG(annee_construction) as annee_construction_moyenne,

    -- Métadonnées
    MIN(date_etablissement) as dpe_plus_ancien,
    MAX(date_etablissement) as dpe_plus_recent

FROM reference_dpe
WHERE
    etiquette_dpe IS NOT NULL
    AND conso_kwh_m2_an IS NOT NULL
    AND conso_kwh_m2_an > 0
GROUP BY
    code_postal,
    ville,
    etiquette_dpe;

-- ============================================================================
-- INDEX pour performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_analytics_dpe_code_postal
    ON analytics_dpe_distribution(code_postal);

CREATE INDEX IF NOT EXISTS idx_analytics_dpe_ville
    ON analytics_dpe_distribution(ville);

CREATE INDEX IF NOT EXISTS idx_analytics_dpe_etiquette
    ON analytics_dpe_distribution(etiquette_dpe);

CREATE INDEX IF NOT EXISTS idx_analytics_dpe_composite
    ON analytics_dpe_distribution(code_postal, etiquette_dpe);

-- ============================================================================
-- FONCTION DE RAFRAÎCHISSEMENT
-- ============================================================================

-- Fonction pour rafraîchir la vue (à appeler manuellement ou via cron)
CREATE OR REPLACE FUNCTION refresh_analytics_dpe_distribution()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_dpe_distribution;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Les vues matérialisées n'ont pas RLS, mais on peut créer une vue normale par-dessus
-- Pour l'instant, lecture publique directe (données anonymisées)

-- ============================================================================
-- COMMENTAIRES
-- ============================================================================

COMMENT ON MATERIALIZED VIEW analytics_dpe_distribution IS
    'Distribution des DPE par code postal et ville - Vue matérialisée pour benchmarking rapide';
COMMENT ON COLUMN analytics_dpe_distribution.nombre_dpe IS
    'Nombre de DPE enregistrés pour ce code postal + étiquette';
COMMENT ON COLUMN analytics_dpe_distribution.conso_moyenne IS
    'Consommation moyenne (kWh/m²/an) pour cette catégorie';

-- ============================================================================
-- INITIALISATION : Refresh initial
-- ============================================================================

-- Rafraîchir la vue au déploiement
REFRESH MATERIALIZED VIEW analytics_dpe_distribution;
