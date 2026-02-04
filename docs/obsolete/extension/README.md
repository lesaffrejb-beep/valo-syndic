# VALO-SYNDIC Ghost — Chrome Extension

> 🕵️ **Import automatique des lots depuis n'importe quel ERP**  
> Extraction intelligente par mots-clés flexibles

---

## 🚀 Installation Rapide

### Étape 1: Générer les icônes (Optionnel mais recommandé)

**Option A — ImageMagick (Mac/Linux):**
```bash
cd extension
brew install imagemagick  # Mac uniquement
./generate-icons.sh
```

**Option B — Node.js:**
```bash
cd extension
npm install canvas
node generate-icons.js
```

**Option C — Utiliser les SVG (Chrome 65+):**
Les icônes SVG sont déjà présentes. Chrome les charge directement.

### Étape 2: Charger l'extension

1. Ouvrir Chrome → `chrome://extensions/`
2. Activer **Mode développeur** (coin haut-droite)
3. Cliquer **Charger l'extension non empaquetée**
4. Sélectionner le dossier `extension/`

---

## 📋 Utilisation

1. **Ouvrir une page ERP** avec un tableau de lots (ICS, Thetrawin, Powimo, ou tableau HTML standard)
2. **Cliquer sur l'icône** VALO-SYNDIC Ghost dans la barre d'extensions
3. **Scanner** → L'extension détecte automatiquement les tableaux
4. **Copier JSON** → Le résultat est copié dans le presse-papier

---

## 🎨 Design System

| Élément | Couleur | Hex |
|---------|---------|-----|
| Fond | Obsidian | `#020202` |
| Accent/Boutons | Or/Gold | `#E0B976` |
| Texte | Gris Clair | `#E5E5E5` |

---

## 🔍 Extraction Intelligente

### Mots-Clés Détectés

L'extension cherche automatiquement les colonnes suivantes (ordre indifférent):

| Champ | Synonymes |
|-------|-----------|
| **Lot** | lot, n°, id, numéro, numero, no |
| **Tantièmes** | tantieme, tantième, qp, /1000, quote, millieme, millième |
| **Surface** | m2, m², surface, sup, superficie |
| **Type** | nature, désignation, designation, type, catégorie, categorie |

### Algorithme

1. Cherche tous les `<table>` visibles sur la page
2. Pour chaque table, identifie les colonnes pertinentes
3. Extrait les données de chaque ligne
4. Déduplique par ID
5. Retourne un JSON propre

---

## 📊 Format JSON de Sortie

```json
{
  "source": "valo-syndic-ghost",
  "version": "1.0.0",
  "extractedAt": "2026-01-29T18:00:00.000Z",
  "url": "https://erp-example.com/lots",
  "lots": [
    {
      "id": "001",
      "tantiemes": 150,
      "surface": 65.5,
      "type": "Appartement T3"
    },
    {
      "id": "002",
      "tantiemes": 85,
      "surface": 42.0,
      "type": "Appartement T2"
    }
  ]
}
```

---

## � Structure des Fichiers

```
extension/
├── manifest.json        # Configuration Manifest V3
├── popup.html           # Interface utilisateur
├── popup.css            # Design System (Obsidian/Gold)
├── popup.js             # Logique principale
├── content.js           # Script injecté (minimal)
├── background.js        # Service Worker (minimal)
├── icons/               # Icônes PNG (générées)
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── generate-icons.sh    # Générateur bash (ImageMagick)
└── generate-icons.js    # Générateur Node.js (Canvas)
```

---

## 🔒 Permissions

| Permission | Usage |
|------------|-------|
| `activeTab` | Accès à l'onglet actif uniquement (pas de tracking) |
| `scripting` | Injection du script d'extraction |

> ⚠️ **Zero Backend** — Aucune donnée n'est envoyée vers un serveur externe.  
> Tout reste 100% local.

---

## 🛠️ Debug

### Console du Popup
- Clic-droit sur l'icône → **Inspecter**
- Ouvre les DevTools du popup

### Console de la Page
- Les DevTools de la page visitée
- Cherchez le message: `🏢 VALO-SYNDIC Ghost actif sur cette page`

---

## ✅ Compatibilité

| ERP | Statut | Notes |
|-----|--------|-------|
| **ICS** | ✅ Testé | Tables HTML standard |
| **Thetrawin** | ✅ Testé | Fonctionne avec les vues "Lots" |
| **Powimo** | 🔄 À tester | Devrait fonctionner (tables HTML) |
| **Autres** | ⚠️ Générique | Si tableau HTML lisible |

---

## 📄 Licence

MIT — Libre d'utilisation et de modification.

---

*Extension V1.0.0 — VALO-SYNDIC V4 "Infiltration"*  
*Design: Obsidian Aesthetics + Gold Accents*
