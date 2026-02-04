# 🚀 Import DPE Massif — Département 49

## 📋 Vue d'ensemble

Ce script importe **tous les DPE du département 49 (Maine-et-Loire)** depuis l'API ADEME vers votre base de données Supabase.

**Pourquoi ce script ?**
- ✅ Gestion des erreurs réseau avec retry automatique
- ✅ Nettoyage des données (virgules → points pour les décimaux)
- ✅ Barre de progression en temps réel
- ✅ Batching intelligent pour éviter les timeouts
- ✅ Prêt pour 200k–400k lignes

---

## 🏁 Guide d'utilisation (3 étapes)

### 1️⃣ Préparer la base de données

**Option A : Via Supabase Dashboard (Recommandé)**
1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Cliquez sur "SQL Editor" dans le menu de gauche
4. Copiez-collez le contenu de `supabase/reference_dpe_schema.sql`
5. Cliquez sur "Run"

**Option B : Via psql (Avancé)**
```bash
psql -h [HOST] -U postgres -d postgres -f supabase/reference_dpe_schema.sql
```

### 2️⃣ Installer les dépendances

```bash
npm install dotenv cli-progress
```

> ⚠️ **Déjà fait** si vous avez suivi les instructions du prompt !

### 3️⃣ Lancer l'import

```bash
npm run import:dpe
```

Ou directement :

```bash
node scripts/data-import/import-dpe-49.mjs
```

**Ce que vous allez voir :**

```
╔════════════════════════════════════════════════════════════╗
║   🏗️  VALO-SYNDIC — IMPORT DPE DÉPARTEMENT 49            ║
╚════════════════════════════════════════════════════════════╝

🔌 Test de connexion Supabase...
✅ Connexion établie

📥 Récupération des lignes 0 à 10000...
📊 Total de lignes estimées: 350,000

🚀 Progression |████████████████░░░░░░░░| 65% | ETA: 4m12s | 227,500/350,000 DPE
```

**Durée estimée :** 10–15 minutes pour ~350k lignes

---

## 🔧 Fonctionnalités du script

### 🛡️ Retry Logic (Anti-crash)
- Si l'API ADEME retourne une erreur 504/503, le script **attend et réessaie** (3 fois max)
- Backoff exponentiel : 1s → 2s → 4s

### 🧹 Data Cleaning
- **Virgules → Points** : `123,45` devient `123.45` (float valide)
- **Filtrage strict** : Seuls les codes postaux commençant par "49" sont importés
- **Validation** : Les lignes incomplètes sont ignorées

### 📦 Batching Intelligent
- Insère **1000 lignes par batch** (évite les timeouts Supabase)
- Délai de **100ms entre chaque batch** (rate-limiting friendly)
- Mode `upsert` : Met à jour les DPE existants si le `numero_dpe` est déjà présent

### 📊 Progress Bar
- Affiche le pourcentage, l'ETA, et le nombre de DPE traités
- Basée sur `cli-progress` (même lib que Node.js build tools)

---

## 🧪 Test rapide (avant l'import complet)

Si vous voulez tester avec **seulement 1000 lignes** :

1. Ouvrez `import-dpe-49.mjs`
2. Ligne 6, modifiez :
   ```js
   const pageSize = 1000; // Au lieu de 10000
   ```
3. Ligne 153, ajoutez après `hasMore = results.length === pageSize;` :
   ```js
   if (currentOffset >= 1000) hasMore = false; // Stop après 1000 lignes
   ```

---

## 📊 Données importées

Chaque ligne contient :

| Champ | Type | Description |
|-------|------|-------------|
| `numero_dpe` | Text (Unique) | N° DPE ADEME (identifiant) |
| `code_postal` | Text | Code postal (49xxx) |
| `ville` | Text | Nom de la commune |
| `annee_construction` | Integer | Année de construction |
| `etiquette_dpe` | Text | A, B, C, D, E, F, G |
| `etiquette_ges` | Text | A, B, C, D, E, F, G |
| `conso_kwh_m2_an` | Numeric | kWh/m²/an (5 usages) |
| `surface_habitable` | Numeric | Surface en m² |
| `date_etablissement` | Date | Date du DPE |

---

## 🛠️ Dépannage

### ❌ "Variables d'environnement manquantes"

**Cause :** `.env.local` n'est pas configuré

**Solution :**
1. Vérifiez que `.env.local` existe
2. Contient :
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   ```

### ❌ "Connexion Supabase échouée"

**Cause :** La table `reference_dpe` n'existe pas

**Solution :**
1. Exécutez `supabase/reference_dpe_schema.sql` (voir étape 1)

### ❌ "Fetch failed after 3 attempts"

**Cause :** API ADEME temporairement indisponible

**Solution :**
1. Attendez 5–10 minutes
2. Relancez le script (il reprendra où il s'est arrêté grâce au mode `upsert`)

### ⚠️ Le script est lent

**C'est normal !**
- 350k lignes = 10–15 minutes
- L'API ADEME a une limite de taux
- Le script throttle volontairement (100ms/batch) pour être respectueux

---

## 🔄 Mise à jour des données

Pour rafraîchir les DPE (ADEME met à jour mensuellement) :

```bash
# Supprimez toutes les lignes existantes via Supabase Dashboard
# Ou via SQL :
# DELETE FROM reference_dpe;

# Relancez l'import
node scripts/data-import/import-dpe-49.js
```

Le mode `upsert` mettra à jour automatiquement les DPE existants.

---

## 📈 Statistiques post-import

Une fois terminé, vous pouvez vérifier dans Supabase :

```sql
-- Nombre total de DPE
SELECT COUNT(*) FROM reference_dpe;

-- Répartition par étiquette
SELECT etiquette_dpe, COUNT(*) as count 
FROM reference_dpe 
GROUP BY etiquette_dpe 
ORDER BY etiquette_dpe;

-- DPE par ville (top 10)
SELECT ville, COUNT(*) as count 
FROM reference_dpe 
GROUP BY ville 
ORDER BY count DESC 
LIMIT 10;
```

---

## 🎉 C'est tout !

Le script est **autonome** et **robuste**. Vous pouvez le lancer et aller prendre un café ☕

Des questions ? Vérifiez les logs dans le terminal, ils sont très détaillés.
