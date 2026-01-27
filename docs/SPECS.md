# 🚀 VALO-SYNDIC — Spécifications Techniques

> **Outil de Diagnostic Flash Immobilier**  
> *"Votre plan de valorisation patrimoniale en 60 secondes."*

---

## 1. Vision Produit

### Promesse
Générer un **PDF One-Pager exécutable** qui :
- Visualise l'urgence réglementaire (Loi Climat)
- Chiffre le coût de l'inaction
- Propose un plan de financement clé-en-main
- Calcule le potentiel d'honoraires pour le cabinet

### Cible Utilisateur
| Persona | Besoin Principal |
|---------|------------------|
| **Gestionnaire Syndic** | Déclencher les travaux en AG |
| **Investisseur** | Anticiper la perte de revenus locatifs |
| **Direction Cabinet** | Identifier le potentiel d'honoraires |

---

## 2. Architecture Fonctionnelle

### 2.1 Les 3 Modules Cœur

#### A. Calendrier Réglementaire Critique 📅
**Concept** : Visualiser l'impasse légale pour créer l'urgence.

| DPE | Interdiction Location | Impact |
|-----|----------------------|--------|
| G | Janvier 2025 | 🔴 Gel des loyers |
| F | Janvier 2028 | 🔴 Interdiction de louer |
| E | Janvier 2034 | 🟠 Interdiction de louer |

**Données** : DPE actuel (saisie ou API ADEME)

**Psychologie** : Activation de l'*Aversion à la Perte* chez l'investisseur.

---

#### B. Calculateur d'Inaction 💸
**Concept** : Chiffrer le coût de la procrastination.

**Formule** :
```
Coût Futur = (Coût Actuel × 1.045^n) + (Perte Locative Annuelle × n)
```
- Hypothèse inflation BTP : **4.5%/an**

**Exemple** :
> Ravalement estimé aujourd'hui : **15 000€/lot**  
> En 2028 : **19 500€** + 36 mois loyers perdus = **23 500€**

---

#### C. Projection Honoraires 🕵️ *(Mode Discret)*
**Concept** : Parler au portefeuille du patron.

**Calcul** :
```
Honoraires = Montant Travaux HT × Taux Gestion (2.5% à 3.5%)
```

**Affichage** : Zone grise en bas de page, police taille 9.

**Message** : *"Potentiel honoraires gestion mission : 15 000 € HT"*

---

### 2.2 Modules Complémentaires (V2+)

| Module | Description | Valeur |
|--------|-------------|--------|
| **Score Maturité** | Indicateur 0-100 pour décision AG | Synthèse visuelle |
| **Comparatif Quartier** | Delta prix rénovés vs passoires (DVF) | FOMO local |
| **Indice Risque Juridique** | Probabilité contentieux locataire | Urgence légale |
| **Toggle Investisseur/Résident** | 2 versions du PDF adaptées | Personnalisation |
| **Simulateur Avant/Après** | Comparaison visuelle DPE | Impact immédiat |
| **QR Code Rapport** | Partage instantané copropriétaires | Viralité |

---

## 3. Stack Technique

### 3.1 Choix Recommandé (LLM-Friendly)

| Couche | Solution | Justification |
|--------|----------|---------------|
| **Framework** | Next.js 14 (App Router) | Vercel natif, bien documenté |
| **Styling** | Tailwind CSS | Rapide, lisible par LLM |
| **Base de données** | Supabase | PostgreSQL + Auth gratuit |
| **PDF Generation** | `@react-pdf/renderer` | Tout en JS, pas de serveur |
| **Déploiement** | Vercel | Free tier généreux |

### 3.2 APIs Gratuites

| Fonction | API | Coût |
|----------|-----|------|
| Normalisation Adresse | [API Adresse](https://api-adresse.data.gouv.fr) | Gratuit |
| Données Immeuble | [Registre National Copropriétés](https://www.registre-coproprietes.gouv.fr) | Gratuit |
| Valeur Vénale | [API DVF](https://api.cquest.org/dvf) | Gratuit |
| Photo Immeuble | Google Street View Static API | Gratuit (quota) |

### 3.3 Structure Repo

```
OUTIL/
├── README.md
├── package.json
├── next.config.js
├── .env.example
├── docs/
│   ├── SPECS.md          ← Ce fichier
│   └── ROADMAP.md        ← Feuille de route carrière
├── src/
│   ├── app/
│   │   ├── page.tsx      ← Landing / Formulaire
│   │   ├── diagnostic/
│   │   │   └── page.tsx  ← Résultat diagnostic
│   │   └── api/
│   │       └── generate-pdf/
│   │           └── route.ts
│   ├── components/
│   │   ├── ui/           ← Composants génériques
│   │   ├── DiagnosticForm.tsx
│   │   ├── ScoreGauge.tsx
│   │   ├── TimelineCalendar.tsx
│   │   └── CostProjection.tsx
│   ├── lib/
│   │   ├── calculations.ts  ← Formules métier
│   │   ├── api-clients.ts   ← Appels APIs externes
│   │   └── pdf-template.tsx ← Template PDF
│   └── types/
│       └── diagnostic.ts
└── public/
    └── logo.svg
```

---

## 4. Prompt Système IA

```markdown
Tu es un ingénieur financier immobilier expert en valorisation patrimoniale.

Calcule le ROI d'une rénovation énergétique pour une copropriété [Année] 
à [Ville] en intégrant :

1. Les subventions MaPrimeRénov' Copropriété (Barème 2025 complet)
2. Un éco-prêt collectif sur 15 ans à taux fixe (4%)
3. La plus-value immédiate "Valeur Verte" (delta DPE : G→C = +8 à 12%)
4. Les économies d'énergie annualisées

Présente le résultat en langage direct, chiffré, anxiogène sur l'inaction 
mais rassurant sur la solution. Pas de jargon technique inutile.
```

---

## 5. Maquette PDF One-Pager

```
┌─────────────────────────────────────────────────────┐
│  VALO-SYNDIC — DIAGNOSTIC FLASH IMMEUBLE            │
│  📍 12 Rue des Lices, Angers | 📅 27/01/2026        │
├─────────────────────────────────────────────────────┤
│           [ PHOTO GOOGLE STREET VIEW ]              │
├─────────────────────────────────────────────────────┤
│  🎯 SCORE PATRIMOINE : DANGER (DPE G)               │
│  Potentiel Cible 2028 : Classe C (Valorisé)         │
├─────────────────────────────────────────────────────┤
│  ⏳ CALENDRIER LOI CLIMAT                           │
│  ━━━━━━●━━━━━━━━━━━●━━━━━━━━━━━●━━━━━━━━━            │
│       2025       2028        2034                   │
│     Gel Loyer   Stop G      Stop E                  │
│  ⚠️ VOS REVENUS LOCATIFS SONT MENACÉS               │
├─────────────────────────────────────────────────────┤
│  💸 COÛT DE L'INACTION (Inflation 4.5%/an)          │
│  ┌─────────────┬─────────────┬─────────────┐        │
│  │ 2026        │ 2029        │ PERTE       │        │
│  │ 150 k€      │ 195 k€      │ 90 k€       │        │
│  └─────────────┴─────────────┴─────────────┘        │
├─────────────────────────────────────────────────────┤
│  🚀 PLAN DE FINANCEMENT                             │
│  • Subventions MaPrimeRénov'    - 45 000 €          │
│  • Prêt Collectif (15 ans)        400 €/mois        │
│  ✅ Reste à charge compensé par économies énergie   │
├─────────────────────────────────────────────────────┤
│  📈 VALEUR VERTE (GAIN IMMÉDIAT)                    │
│  Prix m² actuel : 3 100 € → Post-travaux : 3 650 € │
│  👉 +55 000 € de patrimoine net                     │
├─────────────────────────────────────────────────────┤
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  Opportunité Honoraires Gestion : 18 500 € HT      │
└─────────────────────────────────────────────────────┘
```

---

## 6. MVP — Périmètre Version 1.0

### Inclus ✅
- [ ] Formulaire saisie adresse + DPE actuel
- [ ] Calcul calendrier réglementaire
- [ ] Calcul coût inaction (formule simple)
- [ ] Génération PDF basique
- [ ] Déploiement Vercel

### V2 (Post-recrutement) 🔜
- [ ] Intégration API DVF (comparatif quartier)
- [ ] Mode Investisseur vs Résident
- [ ] Score de maturité travaux
- [ ] Dashboard Supabase (historique diagnostics)

---

*Document créé le 27/01/2026 — Version 1.0*
