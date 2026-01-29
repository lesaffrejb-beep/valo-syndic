# Scripts d'Import de Données - VALO-SYNDIC

## 🎯 Objectif

Ces scripts téléchargent et filtrent les données publiques françaises (ADEME, BDNB) pour le **département 49 (Maine-et-Loire)** uniquement.

> ⚠️ **IMPORTANT**: Ces scripts tournent sur TA MACHINE, pas sur Vercel.  
> Les fichiers générés sont légers et seront uploadés dans le repo.

---

## 📋 Guide Pas-à-Pas (Débutant)

### Étape 1 : Ouvre ton Terminal

1. Appuie sur `Cmd + Espace` (Spotlight)
2. Tape "Terminal" et appuie sur Entrée
3. Tu vois une fenêtre noire avec du texte

### Étape 2 : Va dans le projet

Copie-colle cette commande (puis Entrée) :

```bash
cd "/Users/jb/Documents/01_Gestionnaire de copro/valo-syndic"
```

### Étape 3 : Lance l'import DPE (ADEME)

```bash
node scripts/data-import/import-ademe-dpe.js
```

Tu verras quelque chose comme :
```
===========================================
   IMPORT DPE ADEME - Maine-et-Loire (49)
===========================================

📥 Téléchargement depuis: https://...
   12.5 Mo téléchargés (45%)
✅ Téléchargement terminé: 28.3 Mo

🔍 Lecture et filtrage du CSV...
   5000 DPE du 49 trouvés...
✅ Filtrage terminé: 12345 DPE

📁 Fichier généré: public/data/dpe-49.json
   Taille: 456 Ko (12345 entrées)
```

### Étape 4 : Lance l'import BDNB

```bash
node scripts/data-import/import-bdnb.js
```

### Étape 5 : Commit et Push

```bash
git add public/data/
git commit -m "data: add DPE + BDNB data for Maine-et-Loire (49)"
git push
```

C'est terminé ! Vercel déploiera automatiquement avec les nouvelles données.

---

## 🔄 Mise à jour des données

Les données publiques sont mises à jour périodiquement :
- **DPE ADEME** : Mensuel
- **BDNB** : Trimestriel

Pour rafraîchir, supprime les fichiers et relance :

```bash
rm public/data/dpe-49.json
rm public/data/bdnb-49.json
node scripts/data-import/import-ademe-dpe.js
node scripts/data-import/import-bdnb.js
```

---

## 📁 Fichiers générés

| Fichier | Source | Contenu |
|---------|--------|---------|
| `public/data/dpe-49.json` | ADEME | DPE logements du 49 |
| `public/data/bdnb-49.json` | CSTB | Bâtiments du 49 (année, matériaux) |

---

## 🛠️ Dépannage

### "Command not found: node"
→ Tu dois installer Node.js : https://nodejs.org/

### Le téléchargement échoue
→ Essaie avec une connexion différente (le wifi d'un café par exemple)
→ Les serveurs publics peuvent être lents, patience !

### Fichier trop gros
→ Normal pour le premier téléchargement (CSV source = 30-100 Mo)
→ Le fichier filtré final fait ~500 Ko max
