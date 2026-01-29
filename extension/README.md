# VALO-SYNDIC Chrome Extension — "Ghost in the Shell"

> 🕵️ **Import automatique des lots depuis les ERP métier**  
> Compatible ICS, Thetrawin, Powimo (et tables HTML génériques)

---

## 🚀 Installation (Mode Développeur)

1. Ouvrir Chrome et aller à `chrome://extensions/`
2. Activer le **Mode développeur** (en haut à droite)
3. Cliquer sur **Charger l'extension non empaquetée**
4. Sélectionner le dossier `/extension/` de ce projet

---

## 📋 Utilisation

1. **Naviguer** vers votre ERP (ICS, Thetrawin, Powimo) sur la page des lots
2. **Cliquer** sur l'icône VALO-SYNDIC dans la barre d'extensions
3. **Scanner** la page pour détecter les lots
4. **Envoyer** les données à VALO-SYNDIC ou copier le JSON

---

## 🔧 Structure de l'Extension

```
extension/
├── manifest.json    # Configuration Manifest V3
├── popup.html       # Interface utilisateur
├── popup.css        # Styles (Dark Mode)
├── popup.js         # Logique d'interaction
├── content.js       # Script injecté dans les pages
├── background.js    # Service Worker
└── icons/           # Icônes de l'extension
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

---

## 📊 Schéma de Données Extrait

```json
{
  "source": "valo-syndic-extension",
  "version": "1.0.0",
  "extractedAt": "2026-01-29T18:00:00.000Z",
  "lots": [
    {
      "lotId": "001",
      "tantiemes": 150,
      "surface": 65.5,
      "type": "Appartement T3"
    }
  ]
}
```

---

## 🔍 Stratégies de Détection

L'extension utilise plusieurs stratégies pour extraire les données :

1. **Tables HTML** — Détecte les colonnes "Lot", "Tantièmes", "Surface", "Type"
2. **Grilles CSS** — Cherche les patterns `.grid`, `.list` avec éléments lot
3. **Patterns textuels** — Regex sur "Lot X", "XXX/1000"

### ERP Supportés

| ERP | Support | Notes |
|-----|---------|-------|
| ICS | ✅ Testé | Tables HTML standard |
| Thetrawin | 🔄 POC | Peut nécessiter ajustements |
| Powimo | 🔄 POC | Peut nécessiter ajustements |
| Autres | ⚠️ Générique | Si table HTML lisible |

---

## 🛠️ Développement

### Recharger après modification

1. Aller à `chrome://extensions/`
2. Cliquer sur la flèche circulaire de l'extension
3. Fermer et rouvrir le popup

### Debug

- Ouvrir les DevTools du popup : Clic droit > Inspecter
- Console du content script : DevTools de la page visitée

---

## 🔒 Permissions

| Permission | Usage |
|------------|-------|
| `activeTab` | Accès à l'onglet actif uniquement |
| `scripting` | Injection du script d'extraction |

> ⚠️ L'extension n'envoie **aucune donnée** vers un serveur externe.  
> Tout reste local (VALO-SYNDIC = client-side only).

---

## 📍 TODO (V2)

- [ ] Détection automatique de l'ERP (ICS vs Thetrawin vs Powimo)
- [ ] Support Gemini Nano / Window.ai pour parsing intelligent
- [ ] Synchronisation bidirectionnelle avec VALO-SYNDIC
- [ ] Mode batch (scanner plusieurs onglets)

---

*Extension V1.0.0 — VALO-SYNDIC V4 "Infiltration"*
