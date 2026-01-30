// ============================================================================
// ULTRA-ROBUST DPE IMPORTER — DEPARTMENT 49 (CORRIGÉ 2026)
// ============================================================================

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import cliProgress from 'cli-progress';

// 1. CONFIGURATION
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BATCH_SIZE = 1000;
const BATCH_DELAY_MS = 100;
const MAX_RETRIES = 5; // Augmenté pour la résilience

// NOUVELLE API ADEME 2026 (Dataset stable)
const API_BASE_URL = 'https://data.ademe.fr/data-fair/api/v1/datasets/dpe03existant/lines';
const DEPT_CODE = '49';

// 2. SUPABASE CLIENT
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ ERREUR : Variables .env.local manquantes');
    process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 3. UTILITIES
async function fetchWithRetry(url, retries = MAX_RETRIES) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            if (attempt === retries) throw error;
            const delay = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s...
            console.warn(`⚠️  Erreur API. Nouvelle tentative dans ${delay}ms...`);
            await new Promise(r => setTimeout(r, delay));
        }
    }
}

function parseRow(row) {
    try {
        // Filtrage strict sur le département 49
        const cp = row['code_postal_ban'];
        if (!cp || !String(cp).startsWith(DEPT_CODE)) return null;

        const parseFloatSafe = (val) => val ? parseFloat(String(val).replace(',', '.')) : null;
        const parseIntSafe = (val) => val ? parseInt(val, 10) : null;

        return {
            numero_dpe: row['numero_dpe'],
            code_postal: cp,
            ville: row['nom_commune_ban'],
            annee_construction: parseIntSafe(row['annee_construction']),
            etiquette_dpe: row['etiquette_dpe'],
            etiquette_ges: row['etiquette_ges'],
            conso_kwh_m2_an: parseFloatSafe(row['conso_5_usages_par_m2_ef']),
            surface_habitable: parseFloatSafe(row['surface_habitable_logement']),
            date_etablissement: row['date_etablissement_dpe'],
        };
    } catch (e) { return null; }
}

// 4. MAIN
async function main() {
    console.log('🚀 DÉMARRAGE IMPORT DPE 49...');

    // Init Progress Bar
    const progressBar = new cliProgress.SingleBar({
        format: '� Import |{bar}| {percentage}% | {value}/{total} DPE',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
    });

    // URL Initiale avec filtres API (Optimisation serveur)
    // On demande directement à l'API de filtrer pour nous (q=49)
    let nextUrl = `${API_BASE_URL}?q=49&q_fields=code_postal_ban&size=5000&select=numero_dpe,code_postal_ban,nom_commune_ban,annee_construction,etiquette_dpe,etiquette_ges,conso_5_usages_par_m2_ef,surface_habitable_logement,date_etablissement_dpe`;

    let totalProcessed = 0;

    try {
        while (nextUrl) {
            const data = await fetchWithRetry(nextUrl);

            // Démarrage barre au premier tour
            if (totalProcessed === 0 && data.total) progressBar.start(data.total, 0);

            const rows = data.results || [];
            if (rows.length === 0) break;

            const cleanRows = rows.map(parseRow).filter(r => r && r.numero_dpe);

            // Batch Insert
            if (cleanRows.length > 0) {
                const { error } = await supabase.from('reference_dpe').upsert(cleanRows, {
                    onConflict: 'numero_dpe',
                    ignoreDuplicates: true
                });
                if (error) console.error('Erreur Supabase:', error.message);
            }

            totalProcessed += rows.length;
            progressBar.update(totalProcessed);

            nextUrl = data.next; // Pagination
            await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
        }
    } catch (err) {
        console.error('\n❌ CRASH:', err.message);
    } finally {
        progressBar.stop();
        console.log('\n✅ IMPORT TERMINÉ.');
    }
}

main();
