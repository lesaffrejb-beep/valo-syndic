import { supabaseAdmin } from '../src/lib/supabase/admin'; // Ajuste le chemin
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync'; // npm install csv-parse

async function seedRNIC() {
    console.log("🚀 Démarrage de l'import RNIC 49...");

    // 1. Charger le CSV (Assure-toi d'avoir téléchargé le RNIC 49 ou filtré)
    // Si tu n'as pas encore le fichier, utilise le script Python précédent pour le générer
    const csvPath = path.join(process.cwd(), 'data', 'rnic_49.csv');

    if (!fs.existsSync(csvPath)) {
        console.error("❌ Fichier CSV introuvable :", csvPath);
        return;
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8');

    // 2. Parser le CSV
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        delimiter: ',' // ou ';' selon ton export
    });

    console.log(`📊 ${records.length} lignes trouvées. Traitement...`);

    // 3. Mapper et Insérer par lots (Batching)
    const BATCH_SIZE = 500;

    for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE).map((row: any) => ({
            rnic_id: row.numero_d_immatriculation,
            name: row.nom_d_usage_de_la_copropriete,
            address: row.adresse_de_reference,
            postal_code: row.code_postal_adresse_de_reference,
            city: row.commune_adresse_de_reference,
            city_code: row.code_officiel_commune,
            number_of_units: parseInt(row.nombre_total_de_lots || '0'),
            syndic_name: row.raison_sociale_du_representant_legal,
            // Ajoute ici les mappings nécessaires
        }));

        // Deduplicate batch based on unique constraint (address, postal_code)
        // Keep the last occurrence
        const uniqueBatch = Array.from(
            new Map(batch.map((item: any) => [`${item.address}|${item.postal_code}`, item])).values()
        );

        const { error } = await supabaseAdmin
            .from('coproperty_data')
            .upsert(uniqueBatch, { onConflict: 'address, postal_code' });

        if (error) {
            console.error(`❌ Erreur batch ${i}:`, error.message);
        } else {
            console.log(`✅ Batch ${i} - ${Math.min(i + BATCH_SIZE, records.length)} inséré.`);
        }
    }

    console.log("🏁 Import terminé.");
}

seedRNIC();
