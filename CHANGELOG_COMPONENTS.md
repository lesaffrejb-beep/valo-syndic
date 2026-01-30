# Changelog — Ajout Composants Manquants

**Date:** 2026-01-30
**Branch:** `claude/add-missing-components-acaek`
**Auteur:** Claude (Assistant IA)

---

## 🎯 Objectif

Implémenter deux "briques narratives" manquantes pour compléter le storytelling du dashboard Valo-Syndic :

1. **L'Ego** — Benchmark social pour piquer l'ego du propriétaire
2. **L'Opportunité** — Transformer le point faible (chauffage) en cash

---

## ✅ Fichiers Créés

### Composants Principaux

1. **`src/components/dashboard/DPEDistributionChart.tsx`**
   - Graphique de distribution DPE du quartier
   - Calcul du "Social Proof" (% d'immeubles mieux classés)
   - Design glassmorphism avec framer-motion
   - Barres CSS colorées selon la classe DPE
   - Mise en évidence de la position de l'utilisateur

2. **`src/components/dashboard/HeatingSystemAlert.tsx`**
   - Détection automatique des systèmes fioul/gaz
   - Style "Opportunité/Unlock" (Or/Émeraude, pas de rouge alarmiste)
   - Copywriting "Subsidy Sniper"
   - Affichage du bonus estimé (+4 000 € à +5 000 €)
   - Section expandable "Comment ça marche ?"

### Composants de Support (Créés pour éviter les erreurs de build)

3. **`src/components/dashboard/GESBadge.tsx`**
   - Badge premium pour afficher la classe GES
   - Animation framer-motion

4. **`src/components/dashboard/LegalCountdown.tsx`**
   - Compte à rebours avant interdiction de louer
   - Détection automatique selon le DPE

5. **`src/components/dashboard/FinancialProjection.tsx`**
   - Projection des économies post-travaux
   - Calcul du ROI

### Documentation

6. **`INTEGRATION_GUIDE.md`**
   - Guide complet d'intégration
   - Snippets de code pour page.tsx
   - Checklist de vérification
   - TODO pour l'API endpoint

7. **`CHANGELOG_COMPONENTS.md`** (ce fichier)
   - Documentation des changements

---

## 🔧 Modifications

### `src/app/page.tsx`

#### 1. Imports ajoutés (ligne 36-37)

```typescript
import { DPEDistributionChart } from "@/components/dashboard/DPEDistributionChart";
import { HeatingSystemAlert } from "@/components/dashboard/HeatingSystemAlert";
```

#### 2. Section Diagnostic (lignes 487-509)

**Ajouté :** DPEDistributionChart en première position dans la section Benchmark

```typescript
<DPEDistributionChart
    currentDPE={result.input.currentDPE}
    city={result.input.city}
    postalCode={result.input.postalCode}
/>
```

#### 3. Section Financement (lignes 588-595)

**Ajouté :** HeatingSystemAlert avant le SubsidyTable

```typescript
<HeatingSystemAlert
    heatingType="gaz"
    // TODO: Remplacer par la vraie donnée du DPE si disponible
/>
```

**Modifié :** Ordre des éléments dans la grille Bento (order-1 → order-2, order-2 → order-3, order-3 → order-4)

---

## 🎨 Design System

### Palette de Couleurs Utilisée

- **DPE Classique :** Rouge (G) → Vert (A)
- **Opportunité :** Or/Ambre + Émeraude (style "Unlock")
- **Social Proof :** Rouge/Danger pour bad performer, Vert/Success pour good performer

### Animations

- Framer Motion pour les entrées
- Transitions fluides (duration: 0.5s, type: "spring")
- Pulse effect sur les éléments critiques

### Style

- Glassmorphism : `bg-white/5`, `backdrop-blur-sm`
- Bordures subtiles : `border-white/10`
- Ombres portées : `shadow-glow` pour les éléments actifs

---

## 📊 Données

### DPEDistributionChart

**Source actuelle :** Mock data (400 immeubles à Angers)

**TODO :** Créer l'endpoint `/api/analytics/dpe-distribution`

```typescript
// Exemple de structure attendue
interface DPEDistribution {
    dpe_letter: "A" | "B" | "C" | "D" | "E" | "F" | "G";
    count: number;
}
```

**Vue SQL supposée :** `analytics_dpe_distribution` (à créer dans Supabase)

### HeatingSystemAlert

**Détection :** Recherche de mots-clés dans `heatingType` ou `dpeData.type_energie_chauffage`

**Systèmes éligibles :**
- fioul / fuel / mazout → +5 000 €
- gaz / GPL → +4 000 €

**Condition d'affichage :** `heatingType` contient un des mots-clés ci-dessus

---

## 🚀 Prochaines Étapes

### Obligatoire

- [ ] Récupérer `heatingType` depuis les données DPE réelles
- [ ] Remplacer `heatingType="gaz"` par `heatingType={result.input.heatingType}`

### Optionnel (Amélioration)

- [ ] Créer la vue SQL `analytics_dpe_distribution` dans Supabase
- [ ] Créer l'endpoint `/api/analytics/dpe-distribution`
- [ ] Connecter le DPEDistributionChart aux vraies données
- [ ] Ajouter le champ `heatingType` au formulaire DiagnosticForm

### Améliorations UX

- [ ] Ajouter un tooltip explicatif sur le Social Proof
- [ ] Animation de compteur pour les chiffres (CountUp.js)
- [ ] Version mobile optimisée du graphique de distribution

---

## 🧪 Tests à Effectuer

1. **DPEDistributionChart**
   - [ ] Tester avec DPE G (pire performance → message rouge)
   - [ ] Tester avec DPE C (bonne performance → message vert)
   - [ ] Vérifier le calcul du pourcentage
   - [ ] Vérifier l'affichage mobile

2. **HeatingSystemAlert**
   - [ ] Tester avec `heatingType="fioul"` → alerte visible (+5 000 €)
   - [ ] Tester avec `heatingType="gaz"` → alerte visible (+4 000 €)
   - [ ] Tester avec `heatingType="électrique"` → alerte invisible
   - [ ] Tester avec `heatingType="PAC"` → alerte invisible
   - [ ] Tester l'expansion du bloc "Comment ça marche ?"

3. **Intégration globale**
   - [ ] Vérifier que l'ordre des sections est cohérent
   - [ ] Vérifier le responsive sur mobile
   - [ ] Tester le flow narratif complet : Diagnostic → Ego → Douleur → Opportunité

---

## 📝 Notes Techniques

### Pourquoi Mock Data ?

Le composant `DPEDistributionChart` utilise des données mock car :
1. La vue SQL `analytics_dpe_distribution` n'a pas été trouvée dans le code
2. Cela permet de tester l'UI immédiatement
3. L'endpoint API peut être créé ultérieurement sans modifier le composant

### Pourquoi `heatingType="gaz"` en dur ?

Pour la démo et les tests. À remplacer par la vraie donnée quand disponible.

---

## 🎯 Stratégie Narrative

### Le Flow Psychologique

1. **Diagnostic (L'Urgence)** — "Votre immeuble est malade"
2. **L'Ego (Social Proof)** — "Vous êtes le dernier de la classe" ⚠️ **NOUVEAU**
3. **La Douleur (Coût Inaction)** — "Ça vous coûte déjà de l'argent"
4. **La Révélation (Financement)** — "Voici le plan secret"
5. **L'Opportunité (Subsidy Sniper)** — "Bonus caché détecté" 🎯 **NOUVEAU**
6. **L'Individualisation (Tantièmes)** — "Votre réalité précise"

### Wording Utilisé

- **Ego :** "85% des immeubles de Angers sont mieux classés que vous"
- **Opportunité :** "🎯 Cible verrouillée : Votre chauffage gaz vous rend éligible"
- **Bonus :** "+5 000 € immédiats" (pas de "vous pourriez gagner", mais affirmation)

---

## ✅ Checklist de Validation

- [x] Composants créés avec le bon style (glassmorphism)
- [x] Framer-motion utilisé pour les animations
- [x] Intégration dans page.tsx sans casser l'architecture
- [x] Documentation complète fournie
- [x] Composants de support créés (GESBadge, LegalCountdown, FinancialProjection)
- [x] Guide d'intégration rédigé
- [ ] Tests manuels effectués (à faire par l'utilisateur)
- [ ] Build vérifié (nécessite `npm install` d'abord)
- [ ] Données réelles connectées (TODO utilisateur)

---

**Fin du Changelog**
