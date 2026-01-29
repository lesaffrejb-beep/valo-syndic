const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration : On cible Angers (49000/49100) via l'API
const API_URL = "https://data.ademe.fr/data-fair/api/v1/datasets/dpe-v2-logements-existants/lines?q=Angers&size=2000&select=N_DPE,Etiquette_DPE,Date_réception_DPE,Adresse_(BAN),Code_postal_(BAN),Coordonnée_cartographique_X_(BAN),Coordonnée_cartographique_Y_(BAN)&format=json";
const OUTPUT_DIR = path.join(__dirname, '../../public/data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'dpe-49.json');

// Création du dossier si inexistant
if (!fs.existsSync(OUTPUT_DIR)){
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log("===========================================");
console.log("   IMPORT API ADEME - CIBLE : ANGERS (49)  ");
console.log("===========================================");
console.log(`📡 Connexion à l'API ADEME...`);

https.get(API_URL, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            // L'API renvoie un objet avec une clé "results" ou "lines"
            const results = json.results || json;
            
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
            console.log(`✅ Succès ! ${results.length} DPE récupérés.`);
            console.log(`📁 Fichier sauvegardé : ${OUTPUT_FILE}`);
        } catch (e) {
            console.error("❌ Erreur de parsing JSON:", e.message);
        }
    });

}).on("error", (err) => {
    console.log("❌ Erreur : " + err.message);
});
