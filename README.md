# 🏢 VALO-SYNDIC

> **Outil de Diagnostic Flash Immobilier**  
> Générez un plan de valorisation patrimoniale en 60 secondes.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/lesaffrejb-beep/valo-syndic)

---

## 🎯 Objectif

Aider les gestionnaires de copropriété à **débloquer les votes en AG** grâce à :

1. **Visualiser l'urgence** réglementaire (Loi Climat 2025-2034)
2. **Individualiser l'effort** (Calculateur de tantièmes → XX €/mois)
3. **Proposer un financement** clé-en-main (MaPrimeRénov' + Éco-PTZ 0%)
4. **Contrer les objections** (Module Avocat du Diable)
5. **Générer un PDF premium** pour projection en séance

---

## ✨ Fonctionnalités

| Feature | Description |
|---------|-------------|
| 🧮 **Calculateur Tantièmes** | Convertit "300k€" en "87€/mois pour vous" |
| 📊 **Benchmark Régional** | Compare à la moyenne DPE Angers |
| ⚔️ **Avocat du Diable** | Réponses aux 3 objections classiques |
| 📱 **QR Code Vote** | Engagement en temps réel en AG |
| 📄 **PDF 3 pages** | Synthèse, Financement, Argumentaire |
| 💾 **Sauvegarde JSON** | Export/Import de simulations (.valo) |

---

## 🚀 Démarrage Rapide

```bash
# Cloner le repo
git clone https://github.com/lesaffrejb-beep/valo-syndic.git
cd valo-syndic

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

> 💡 **Le MVP fonctionne sans aucune configuration** — Calcul 100% client-side.

---

## 📁 Structure du Projet

```
.
├── docs/
│   ├── PROJECT_DNA.md    # Vision & Stratégie
│   ├── DATABASE_SETUP.md # Guide Supabase
│   ├── SPECS.md          # Spécifications techniques
│   └── ROADMAP.md        # Feuille de route
├── src/
│   ├── app/              # Pages Next.js
│   ├── components/
│   │   ├── business/     # Tantièmes, Benchmark, Objections
│   │   ├── pdf/          # Templates PDF + QR Code
│   │   └── [...]         # Autres composants
│   └── lib/              # Calculateur, Constantes, Schemas
├── supabase/
│   └── schema.sql        # Schema DB prêt pour V2
└── README.md
```

---

## 🛠️ Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| PDF | @react-pdf/renderer |
| QR Code | qrcode |
| Validation | Zod |
| Database (V2) | Supabase |
| Deploy | Vercel |

---

## ✅ Tests & Qualité

- **Unit Tests** : `npm test` (Jest)
- **E2E Tests** : `npx playwright test` (Playwright)
- **Linting** : `npm run lint`
- **Type Checking** : `npx tsc --noEmit`

## 🔒 Sécurité

- **CSP** : Configuré dans `middleware.ts`
- **Sentry** : Intégration prête (configurer `NEXT_PUBLIC_SENTRY_DSN`)

---

## 📖 Documentation

- **[PROJECT_DNA.md](docs/PROJECT_DNA.md)** — Vision, Genèse, Stratégie d'usage
- **[DATABASE_SETUP.md](docs/DATABASE_SETUP.md)** — Guide configuration Supabase
- **[SPECS.md](docs/SPECS.md)** — Architecture technique
- **[ROADMAP.md](docs/ROADMAP.md)** — Feuille de route

---

## 🔧 Configuration (Optionnel)

Pour activer les fonctionnalités V2+ :

```bash
cp .env.example .env.local
# Éditer .env.local avec vos clés Supabase
```

Voir [DATABASE_SETUP.md](docs/DATABASE_SETUP.md) pour le guide complet.

---

## 📄 Licence

MIT — Libre d'utilisation et de modification.

---

*Créé le 27/01/2026 — Angers, France*  
*Mainteneur : @lesaffrejb-beep*
git pull origin main