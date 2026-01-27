# 🏢 VALO-SYNDIC

> **Outil de Diagnostic Flash Immobilier**  
> Générez un plan de valorisation patrimoniale en 60 secondes.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/VOTRE-USERNAME/valo-syndic)

---

## 🎯 Objectif

Aider les gestionnaires de copropriété à :
1. **Visualiser l'urgence** réglementaire (Loi Climat 2025-2034)
2. **Chiffrer le coût** de l'inaction
3. **Proposer un financement** clé-en-main (MaPrimeRénov' + éco-prêt)
4. **Calculer la valeur verte** post-travaux

---

## 📁 Structure du Projet

```
.
├── docs/
│   ├── SPECS.md      # Spécifications techniques complètes
│   └── ROADMAP.md    # Feuille de route stratégique
├── src/              # Code source (à développer)
└── README.md         # Ce fichier
```

---

## 🛠️ Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | Supabase |
| PDF | @react-pdf/renderer |
| Deploy | Vercel |

---

## 🚀 Démarrage Rapide

```bash
# Cloner le repo
git clone https://github.com/VOTRE-USERNAME/valo-syndic.git
cd valo-syndic

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés API

# Lancer en développement
npm run dev
```

---

## 📊 APIs Utilisées

| API | Usage | Coût |
|-----|-------|------|
| [API Adresse](https://api-adresse.data.gouv.fr) | Normalisation adresse | Gratuit |
| [DVF](https://api.cquest.org/dvf) | Valeurs foncières | Gratuit |
| [RNCP](https://www.registre-coproprietes.gouv.fr) | Données copropriété | Gratuit |

---

## 📖 Documentation

- **[SPECS.md](docs/SPECS.md)** — Architecture technique et fonctionnelle
- **[ROADMAP.md](docs/ROADMAP.md)** — Feuille de route du projet

---

## 📄 Licence

MIT — Libre d'utilisation et de modification.

---

*Créé le 27/01/2026*
