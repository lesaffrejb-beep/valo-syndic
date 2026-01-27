# 📋 NEXT_STEPS.md — Actions Humaines Requises

Ce fichier liste tout ce que **vous** devez faire pour finaliser le déploiement de VALO-SYNDIC.

---

## ✅ Ce Qui Est Prêt (Codé)

| Module | Status | Description |
|--------|--------|-------------|
| Moteur de calcul | ✅ DONE | `calculator.ts` — MPR, Éco-PTZ, Inaction Cost |
| Architecture modulaire | ✅ DONE | `services/regulationService.ts` — Pattern Provider |
| Placeholder AI | ✅ DONE | `lib/ai/index.ts` — Interfaces prêtes pour V2 |
| Composants Premium | ✅ DONE | Charts, Gauges, Urgency Score, Argumentaire |
| UI Neo-Bank | ✅ DONE | Design Revolut/Qonto style |

---

## ⚙️ Configuration Requise

### 1. Variables d'Environnement (Optionnel pour MVP)

Créez un fichier `.env.local` à la racine du projet :

```bash
# Optionnel — pour future intégration DVF
NEXT_PUBLIC_DVF_API_KEY=votre_cle_api

# Optionnel — pour analytics (ex: Vercel Analytics)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=votre_id
```

> **Note MVP** : Aucune variable n'est obligatoire pour le MVP. L'app fonctionne 100% client-side.

---

## 🚀 Déploiement

### Option A : Vercel (Recommandé)

```bash
# 1. Installer Vercel CLI (si pas déjà fait)
npm install -g vercel

# 2. Depuis le dossier valo-syndic
cd "/Users/jb/Documents/01_Gestionnaire de copro/valo-syndic"

# 3. Déployer
vercel

# 4. Pour la production
vercel --prod
```

### Option B : Build Statique

```bash
# 1. Build
npm run build

# 2. Le dossier .next contient les fichiers statiques
# Uploadez sur n'importe quel hébergeur (Netlify, AWS S3, etc.)
```

---

## 📄 Génération PDF (Phase 3 — À Implémenter)

Le bouton "Télécharger le rapport AG" affiche actuellement une alerte placeholder.

**Pour activer :**

1. La dépendance `@react-pdf/renderer` est déjà installée
2. Créer `src/components/PDFReport.tsx` avec le template du rapport
3. Appeler `pdf(<PDFReport />).toBlob()` puis déclencher le téléchargement

*Exemple de structure attendue :*

```tsx
// src/components/PDFReport.tsx
import { Document, Page, Text, View } from '@react-pdf/renderer';

export function PDFReport({ result }: { result: DiagnosticResult }) {
  return (
    <Document>
      <Page>
        {/* Header avec logo */}
        {/* Données DPE */}
        {/* Plan de financement */}
        {/* Argumentaire AG */}
        {/* Footer légal */}
      </Page>
    </Document>
  );
}
```

---

## 🔌 Intégrations Futures

### API DVF (Valeurs Foncières)

- **Endpoint** : `https://api.cquest.org/dvf`
- **Gratuit** : Oui, données publiques
- **Usage** : Pré-remplir le prix au m² automatiquement

### Supabase (Base de données)

Pour dynamiser les constantes réglementaires :

1. Créer une table `regulations` dans Supabase
2. Implémenter `SupabaseRegulationProvider` dans `services/regulationService.ts`
3. Remplacer le provider par défaut

### Module AI (RAG pour PV d'AG)

Les interfaces sont prêtes dans `lib/ai/index.ts` :

1. Intégrer OpenAI / Claude API
2. Implémenter `analyzeDocument()` avec OCR + LLM
3. Extraire automatiquement les votes et montants des PV

---

## 🧪 Tests Recommandés

```bash
# Lancer le linter
npm run lint

# Build de vérification
npm run build

# Serveur de développement
npm run dev
```

---

## 📁 Fichiers Codés "En Dur" (À Connecter Plus Tard)

| Fichier | Ce qui est en dur | Action V2 |
|---------|-------------------|-----------|
| `constants.ts` | Taux MPR, seuils DPE | → Supabase |
| `ArgumentairePanel.tsx` | Arguments pré-écrits | → AI générative |
| `schemas.ts` | Estimation gain 15%/classe | → Calcul plus fin |

---

## 🎯 Checklist Pré-Déploiement

- [ ] Tester sur mobile (responsive)
- [ ] Vérifier les textes légaux avec un juriste
- [ ] Ajouter Google Analytics / Vercel Analytics
- [ ] Créer un favicon personnalisé
- [ ] Tester le build production (`npm run build`)

---

*Généré automatiquement par VALO-SYNDIC CLI — 27/01/2026*
