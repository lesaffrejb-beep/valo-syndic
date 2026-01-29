# VALO-SYNDIC — Récapitulatif PowerPoint AG

> **Présentation optimisée pour l'Assemblée Générale**
> 
> Version: 1.0 — Janvier 2026

---

## ✅ CE QUI A ÉTÉ CRÉÉ

### 1. Architecture complète PPTX

| Fichier | Description |
|---------|-------------|
| `src/lib/pptx-generator.ts` | Moteur de génération PowerPoint (600+ lignes) |
| `src/components/pdf/PptxButtonContent.tsx` | Composant bouton avec preview |
| `src/components/pdf/DownloadPptxButton.tsx` | Wrapper avec chargement dynamique |
| `docs/PPTX_AG_STRATEGY.md` | Guide stratégique complet |

### 2. Les 10 Slides de la Présentation

```
┌────────────────────────────────────────────────────────────┐
│                    DÉROULÉ AG — 15 MINUTES                 │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ SLIDE 1  [00:00-01:00]  L'AVENIR DE NOTRE IMMEUBLE        │
│          → Accroche émotionnelle                           │
│                                                            │
│ SLIDE 2  [01:00-02:00]  NOTRE IMMEUBLE AUJOURD'HUI        │
│          → DPE F en énorme, problèmes listés               │
│                                                            │
│ SLIDE 3  [02:00-03:30]  LE TEMPS NOUS EST COMPTE          │
│          → Compte à rebours 2028, urgence légale           │
│                                                            │
│ SLIDE 4  [03:30-05:00]  NOTRE PROJET DE RÉNOVATION        │
│          → Travaux proposés, objectif DPE C                │
│                                                            │
│ SLIDE 5  [05:00-07:00]  VOTRE MENSUALITÉ ★                │
│          → Chiffre clé + camembert financement             │
│                                                            │
│ SLIDE 6  [07:00-08:30]  CE QUE VOUS GAGNEZ                │
│          → -40% chauffage, +12% valeur                     │
│                                                            │
│ SLIDE 7  [08:30-10:00]  SI ON ATTEND 3 ANS...             │
│          → Coût de l'inaction (perte financière)           │
│                                                            │
│ SLIDE 8  [10:00-11:30]  QUEL QUE SOIT VOTRE PROFIL...     │
│          → 4 profils avec mensualités adaptées             │
│                                                            │
│ SLIDE 9  [11:30-13:00]  VOUS ÊTES ACCOMPAGNÉS             │
│          → Engagements qualité, RGE, garanties             │
│                                                            │
│ SLIDE 10 [13:00-15:00]  VOTEZ POUR L'AVENIR               │
│          → Citation + CTA final                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🎨 SPÉCIFICITÉS DE DESIGN

### Palette AG (optimisée projection)

```
┌────────────────────────────────────────┐
│  FOND              #1E3A5F (bleu navy) │
│  TEXTE             #FFFFFF (blanc)     │
│  ACCENT/OR         #D4AF37 (gold)      │
│  SUCCÈS/VERT       #22C55E (vert)      │
│  ALERTE/ROUGE      #EF4444 (rouge)     │
│  INFO/BLEU         #3B82F6 (bleu)      │
└────────────────────────────────────────┘
```

**Pourquoi fond foncé ?**
- Meilleur contraste en salle éclairée
- Moins de fatigue visuelle
- Aspect premium et sérieux
- Couleurs qui ressortent mieux

### Typographie

| Élément | Police | Taille | Usage |
|---------|--------|--------|-------|
| Titres | Arial | 44pt | En-têtes de slides |
| Chiffres clés | Arial | 72-100pt | Mensualité, pourcentages |
| Sous-titres | Arial | 32pt | Explications |
| Corps | Arial | 24pt | Listes, détails |
| Notes | Arial | 18pt | Informations secondaires |

---

## 🎯 DIFFÉRENCES CLÉS PDF vs PPTX

| Aspect | PDF (lecture) | PPTX (projection) |
|--------|--------------|-------------------|
| **Public** | Individuel, chez soi | Collectif, en salle |
| **Moment** | Préparation | Jour J, avant vote |
| **Durée** | Auto-déterminée | 15 minutes max |
| **Densité** | Haute (tous les chiffres) | Faible (chiffres clés) |
| **Format** | A4 portrait | 16:9 paysage |
| **Fond** | Blanc | Bleu navy foncé |
| **Police** | Helvetica | Arial (système) |
| **Objectif** | Informer en profondeur | Convaincre rapidement |

---

## 📊 FONCTIONNALITÉS

### Génération dynamique

```typescript
// Générer une présentation complète
const blob = await generateAGPresentation(result, brand);

// Générer uniquement le slide financement (démo rapide)
const blob = await generateFinancingSlideOnly(result, brand);

// Obtenir les métadonnées (sans générer)
const metadata = getPresentationMetadata(result);
// → { slideCount: 10, estimatedDuration: '15 minutes', keyFigures: [...] }
```

### Adaptation automatique

Le PPTX s'adapte automatiquement selon :
- **Taille du projet** (petit/moyen/grand/très grand)
- **DPE actuel** (F, G = urgence / D, C = anticipation)
- **Montant des aides** (personnalisation du camembert)
- **Marque blanche** (couleurs, logo, nom d'agence)

---

## 👥 INTÉGRATION DES PROFILS

Les 10 profils du PDF sont adaptés pour le format présentation :

| Slide | Profils mis en avant | Message |
|-------|---------------------|---------|
| 5 | Tous | Mensualité moyenne adaptable |
| 8 | 4 archétypes | "Une solution pour chacun" |
| 9 | Tous | Accompagnement personnalisé |

---

## 🔧 CONTRAINTES TECHNIQUES GÉRÉES

| Problème | Solution |
|----------|----------|
| pptxgenjs incompatible SSR | Chargement dynamique `ssr: false` |
| Taille du bundle | Import dynamique, chargement à la demande |
| Fonts | Arial (toujours disponible) |
| Charts | Type 'doughnut' natif pptxgenjs |
| Couleurs | Hex codes sans # (pptxgenjs format) |

---

## 📈 MÉTRIQUES DE SUCCÈS ATTENDUES

| Métrique | Cible | Mesure |
|----------|-------|--------|
| Taux de vote POUR | >66% | Résultat AG |
| Attention maintenue | Pas de mouvements | Observation |
| Questions pertinentes | >50% sur le comment | Analyse Q/R |
| Utilisation PPTX | >50% des syndics | Analytics |

---

## 🚀 UTILISATION

### Dans l'interface

```tsx
import { DownloadPptxButton } from '@/components/pdf/DownloadPptxButton';

// Dans le composant
<DownloadPptxButton result={diagnosticResult} />
```

### Features du bouton

- **Hover preview** : Affiche les métadonnées (slides, durée, chiffres clés)
- **Génération asynchrone** : Spinner pendant la création
- **Téléchargement auto** : Nom de fichier daté
- **Gestion d'erreur** : Message utilisateur si échec

---

## 📁 FICHIERS DE DOCUMENTATION

| Fichier | Contenu |
|---------|---------|
| `docs/PPTX_AG_STRATEGY.md` | Guide stratégique complet (scénario, timing, storytelling) |
| `docs/PPTX_SUMMARY.md` | Ce fichier — récapitulatif technique |

---

## ✅ CHECKLIST PRÉ-AG

- [ ] PPTX testé sur le projecteur de la salle
- [ ] Backup sur clé USB + cloud
- [ ] Ordinateur portable chargé
- [ ] Câble HDMI de rechange
- [ ] Impression des slides en A4 (backup)
- [ ] Répétition complète (15 min max)

---

## 🎬 SCÉNARIO TYPE D'UTILISATION

```
J-15 : Syndic génère le PPTX depuis l'interface VALO-SYNDIC
     ↓
J-7  : Présentation répétée avec le conseil syndical
     ↓
J-1  : Test technique sur le projecteur de la salle
     ↓
JOUR J
  ├── 14h00 : Accueil des copropriétaires
  ├── 14h30 : Début AG, quorum
  ├── 14h45 : Présentation PowerPoint (15 min)
  ├── 15h00 : Questions / Réponses
  ├── 15h20 : Mise aux voix
  └── 15h30 : Résultat : 68% POUR ✓
```

---

## 💡 CONSEILS DE PRÉSENTATION

### Le présentateur doit :

1. **Ne pas lire les slides** → Elles sont visuelles
2. **Raconter une histoire** → Problème → Solution → Action
3. **Maintenir le rythme** → 15 minutes max, pas plus
4. **Adapter au public** → Observer les réactions
5. **Terminer par l'émotion** → Slide 10, appel au vote

### Timing des slides :

- Slides 1-4 : Poser le problème (5 min)
- Slides 5-7 : Montrer la solution (5 min) ★
- Slides 8-10 : Rassurer et conclure (5 min)

---

## 🔮 ÉVOLUTIONS FUTURES SUGGÉRÉES

1. **Mode présentateur** : Notes sous chaque slide
2. **Télécommande** : Navigation depuis mobile
3. **Timer intégré** : Alertes si dépassement
4. **Version Q&A** : Slides supplémentaires pour questions fréquentes
5. **Multilingue** : Version anglaise pour investisseurs étrangers

---

## 📊 BUILD VALIDÉE

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (5/5)
✓ Finalizing page optimization
```

---

**Document produit le 29 janvier 2026 — VALO-SYNDIC**
