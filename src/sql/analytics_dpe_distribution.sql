-- ==============================================================================
-- ANALYTICS DPE DISTRIBUTION
-- ==============================================================================
-- Ce fichier contient les vues SQL pour analyser la répartition des DPE
-- Éxécuter ce script dans l'éditeur SQL de Supabase
-- ==============================================================================

-- 1. Vue globale de répartition DPE (A, B, C...)
CREATE OR REPLACE VIEW analytics_dpe_stats AS
SELECT 
  etiquette_dpe as label,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM reference_dpe
WHERE etiquette_dpe IS NOT NULL
GROUP BY etiquette_dpe
ORDER BY etiquette_dpe;

-- 2. Vue globale de répartition GES (A, B, C...)
CREATE OR REPLACE VIEW analytics_ges_stats AS
SELECT 
  etiquette_ges as label,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM reference_dpe
WHERE etiquette_ges IS NOT NULL
GROUP BY etiquette_ges
ORDER BY etiquette_ges;

-- 3. Fonction pour récupérer les stats par ville (Optionnel)
-- Usage: SELECT * FROM get_dpe_stats_by_city('ANGERS');
CREATE OR REPLACE FUNCTION get_dpe_stats_by_city(target_city TEXT)
RETURNS TABLE (
  label VARCHAR,
  total BIGINT,
  percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    etiquette_dpe as label,
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
  FROM reference_dpe
  WHERE ville ILIKE target_city || '%'
  AND etiquette_dpe IS NOT NULL
  GROUP BY etiquette_dpe
  ORDER BY etiquette_dpe;
END;
$$ LANGUAGE plpgsql;
