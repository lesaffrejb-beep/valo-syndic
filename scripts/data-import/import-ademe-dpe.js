/**
 * Script d'import des DPE ADEME pour le département 49 (Maine-et-Loire)
 *
 * USAGE:
 *   node scripts/data-import/import-ademe-dpe.js
 *
 * Ce script:
 * 1. Télécharge le CSV des DPE Pays de la Loire depuis data.ademe.fr
 * 2. Filtre uniquement le département 49
 * 3. Génère un fichier JSON léger pour l'app
 *
 * ⚠️ À lancer en LOCAL, pas sur Vercel (fichier trop lourd pour serverless)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// === CONFIGURATION ===

// URL du dataset ADEME DPE Logements - Pays de la Loire
// Source: https://data.ademe.fr/datasets/dpe-v2-logements-existants
const ADEME_CSV_URL = 'https://data.ademe.fr/data-fair/api/v1/datasets/dpe-v2-logements-existants/data-files/dpe-v2-logements-existants-52.csv';

// Alternative: fichier régional plus léger
const ADEME_REGIONAL_URL = 'https://files.data.gouv.fr/ademe/dpe-pays-de-la-loire.csv';

// Codes postaux du Maine-et-Loire (49xxx)
const DEPT_CODE = '49';

// Fichier de sortie
const OUTPUT_FILE = path.join(__dirname, '../../public/data/dpe-49.json');

// Colonnes à extraire (pour réduire la taille)
const COLUMNS_TO_KEEP = [
    'n_dpe',                    // Identifiant unique DPE
    'numero_voie',              // Numéro de rue
    'nom_rue',                  // Nom de rue
    'code_postal',              // Code postal
    'nom_commune',              // Ville
    'etiquette_dpe',            // Classe DPE (A-G)
    'etiquette_ges',            // Classe GES (A-G)
    'annee_construction',       // Année de construction
    'surface_habitable',        // Surface en m²
    'type_batiment',            // Maison/Appartement
    'date_etablissement_dpe',   // Date du DPE
    'conso_5_usages_ep',        // Consommation énergie primaire
    'emission_ges_5_usages',    // Émissions GES
];

// === FONCTIONS UTILITAIRES ===

function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        console.log(`📥 Téléchargement depuis: ${url}`);
        console.log('   (Cela peut prendre quelques minutes...)');

        const file = fs.createWriteStream(destPath);
        let downloadedBytes = 0;
        let lastLogTime = 0;

        https.get(url, (response) => {
            // Suivre les redirections
            if (response.statusCode === 301 || response.statusCode === 302) {
                file.close();
                fs.unlinkSync(destPath);
                return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
            }

            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                return;
            }

            const totalBytes = parseInt(response.headers['content-length'], 10);

            response.on('data', (chunk) => {
                downloadedBytes += chunk.length;
                const now = Date.now();
                if (now - lastLogTime > 2000) { // Log every 2s
                    const percent = totalBytes ? Math.round((downloadedBytes / totalBytes) * 100) : '?';
                    const mb = (downloadedBytes / 1024 / 1024).toFixed(1);
                    process.stdout.write(`\r   ${mb} Mo téléchargés (${percent}%)`);
                    lastLogTime = now;
                }
            });

            response.pipe(file);

            file.on('finish', () => {
                file.close();
                const mb = (downloadedBytes / 1024 / 1024).toFixed(1);
                console.log(`\n✅ Téléchargement terminé: ${mb} Mo`);
                resolve(destPath);
            });

        }).on('error', (err) => {
            file.close();
            fs.unlink(destPath, () => { }); // Cleanup
            reject(err);
        });
    });
}

async function parseCSVAndFilter(csvPath, outputPath) {
    return new Promise((resolve, reject) => {
        console.log(`\n🔍 Lecture et filtrage du CSV...`);

        const results = [];
        let headers = [];
        let lineCount = 0;
        let matchCount = 0;

        const fileStream = fs.createReadStream(csvPath, { encoding: 'utf-8' });
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        rl.on('line', (line) => {
            lineCount++;

            // Parse CSV line (basique, ne gère pas les virgules dans les guillemets)
            const values = parseCSVLine(line);

            if (lineCount === 1) {
                // Première ligne = headers
                headers = values.map(h => h.toLowerCase().trim());
                return;
            }

            // Créer un objet avec les headers
            const row = {};
            headers.forEach((header, i) => {
                row[header] = values[i] || '';
            });

            // Filtrer sur le département 49
            const cp = row['code_postal'] || '';
            if (!cp.startsWith(DEPT_CODE)) {
                return;
            }

            // Extraire seulement les colonnes utiles
            const filtered = {};
            COLUMNS_TO_KEEP.forEach(col => {
                const key = col.toLowerCase();
                if (row[key] !== undefined) {
                    filtered[col] = row[key];
                }
            });

            // Normaliser certaines valeurs
            if (filtered.annee_construction) {
                filtered.annee_construction = parseInt(filtered.annee_construction, 10) || null;
            }
            if (filtered.surface_habitable) {
                filtered.surface_habitable = parseFloat(filtered.surface_habitable) || null;
            }
            if (filtered.conso_5_usages_ep) {
                filtered.conso_5_usages_ep = parseFloat(filtered.conso_5_usages_ep) || null;
            }

            results.push(filtered);
            matchCount++;

            // Log progress
            if (matchCount % 1000 === 0) {
                process.stdout.write(`\r   ${matchCount} DPE du 49 trouvés...`);
            }
        });

        rl.on('close', () => {
            console.log(`\n✅ Filtrage terminé: ${matchCount} DPE sur ${lineCount - 1} lignes`);

            // Sauvegarder en JSON
            const output = {
                metadata: {
                    source: 'ADEME - DPE Logements',
                    url: 'https://data.ademe.fr/datasets/dpe-v2-logements-existants',
                    department: '49 - Maine-et-Loire',
                    generatedAt: new Date().toISOString(),
                    count: results.length,
                },
                data: results,
            };

            fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
            const sizeKb = (fs.statSync(outputPath).size / 1024).toFixed(0);
            console.log(`\n📁 Fichier généré: ${outputPath}`);
            console.log(`   Taille: ${sizeKb} Ko (${results.length} entrées)`);

            resolve(results.length);
        });

        rl.on('error', reject);
    });
}

// Parse une ligne CSV (gestion basique des guillemets)
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

// === MAIN ===

async function main() {
    console.log('===========================================');
    console.log('   IMPORT DPE ADEME - Maine-et-Loire (49)');
    console.log('===========================================\n');

    const tempFile = path.join(__dirname, 'temp-dpe.csv');

    try {
        // Vérifier si le fichier existe déjà
        if (fs.existsSync(OUTPUT_FILE)) {
            const stats = fs.statSync(OUTPUT_FILE);
            const ageHours = (Date.now() - stats.mtime.getTime()) / 1000 / 60 / 60;
            if (ageHours < 24) {
                console.log(`⚠️  Le fichier existe déjà (généré il y a ${ageHours.toFixed(1)}h)`);
                console.log('   Pour forcer la régénération, supprime public/data/dpe-49.json');
                return;
            }
        }

        // Télécharger le CSV
        await downloadFile(ADEME_REGIONAL_URL, tempFile).catch(async () => {
            // Fallback sur l'URL alternative
            console.log('⚠️  URL régionale non disponible, essai de l\'URL nationale...');
            await downloadFile(ADEME_CSV_URL, tempFile);
        });

        // Créer le dossier de sortie si nécessaire
        const outputDir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Parser et filtrer
        const count = await parseCSVAndFilter(tempFile, OUTPUT_FILE);

        console.log('\n✅ Import terminé avec succès!\n');
        console.log('Prochaines étapes:');
        console.log('  1. git add public/data/dpe-49.json');
        console.log('  2. git commit -m "data: add ADEME DPE for Maine-et-Loire"');
        console.log('  3. git push');

    } catch (error) {
        console.error('\n❌ Erreur:', error.message);
        process.exit(1);
    } finally {
        // Cleanup temp file
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }
    }
}

main();
