# 🎓 Audit du Code & Corrections

Bonjour,

J'ai passé en revue le codebase de `VALO-SYNDIC`. Si l'application tourne, la qualité du code laisse à désirer sur plusieurs aspects fondamentaux. En tant que lead dev, je ne validerais pas cette PR en l'état.

Voici mes retours, classés par gravité.

---

## 💀 I. Code Mort & Pratiques Dangereuses

### 1. Mocks en Production (`src/lib/calculator.ts`)
Vous avez laissé de la logique de **génération de données fictives** directement dans votre cœur de métier.
C'est inacceptable. `batchProcessBuildings` contient :
```typescript
const lat = ANGERS_CENTER.lat + (Math.random() - 0.5) * 0.05;
```
Si un jour vous branchez de vraies données, cette fonction corrompra vos résultats avec de l'aléatoire.
👉 **Correction attendue** : Déplacez cette logique dans un fichier `src/lib/mocks.ts` ou supprimez-la si elle ne sert qu'au développement.

### 2. Fonctionnalité Gadget & Fuite de Performance (`src/hooks/useSoundEffects.ts`)
Vous avez implémenté un hook de bruitages (`useSoundEffects`) pour une application métier (Syndic).
Non seulement c'est discutable (bloatware), mais l'implémentation est **catastrophique** :
- Vous créez un `new AudioContext()` à **chaque appel** de `playSound`.
- C'est lourd et le navigateur va finir par bloquer ou ralentir l'app.
👉 **Correction attendue** : Supprimez cette fonctionnalité "gadget" ou implémentez un singleton audio correct.

---

## ♻️ II. Répétitions (DRY - Don't Repeat Yourself)

### 1. Animations Framer Motion Dupliquées
Je retrouve les mêmes définitions d'animation copiées-collées dans :
- `src/components/FinancingCard.tsx`
- `src/components/InactionCostCard.tsx`
- `src/components/ui/AnimatedCard.tsx`

Le bloc suivant est répété partout :
```typescript
transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
```
Si on veut changer la vitesse globale, il faut modifier 15 fichiers.
👉 **Correction attendue** : Créez `src/lib/animations.ts` et exportez vos constantes (`FADE_IN_VARIANTS`, `DEFAULT_EASE`).

---

## 📐 III. Imprécisions & Architecture

### 1. Organisation des Dossiers Chaotique
Vous avez créé un dossier `src/components/business/`, ce qui est une bonne idée.
Pourtant, je retrouve des composants purement métier **à la racine** de `src/components/` :
- `FinancingCard.tsx`
- `InactionCostCard.tsx`
- `LegalWarning.tsx`

Rangez votre code. Si c'est du métier, ça va dans `business`. Si c'est générique, dans `ui`.

### 2. "Magic Numbers" Métier (`src/lib/calculator.ts`)
Dans `calculateValuation`, je vois :
```typescript
const BASE_PRICE_PER_SQM = 3500;
```
Ce montant est codé en dur au milieu de la logique. Impossible de le configurer sans recompilier.
👉 **Correction attendue** : Déplacez cela dans `src/lib/constants.ts` ou passez-le en paramètre (venant d'une config utilisateur).

### 3. Schizophrénie du State Management
Vous utilisez deux méthodes concurrentes pour gérer l'état global :
1. **Context API + localStorage manuel** pour `BrandContext.tsx`.
2. **Zustand + Persist** pour `useSoundEffects.ts` et `useProjectionMode.ts`.

Pourquoi faire compliqué ? `BrandContext` réimplémente mal ce que Zustand fait nativement (persistance, performance).
👉 **Correction attendue** : Migrez `BrandContext` vers un store Zustand `useBrandStore`.

---

## Conclusion
Le projet a du potentiel mais manque de rigueur. Corrigez ces points avant d'ajouter de nouvelles fonctionnalités.

*Votre Professeur Dévoué.*
