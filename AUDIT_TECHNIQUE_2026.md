# AUDIT TECHNIQUE EXHAUSTIF — VALO-SYNDIC
**Date de l'audit :** 30 Janvier 2026
**Auditeur :** Jules, Architecte Logiciel Senior
**Version analysée :** HEAD (`main`)

---

## 1. ARCHITECTURE & SCALABILITÉ
**Note : 8/10**

### Synthèse
L'architecture repose sur **Next.js 16 (App Router)** couplé à des **Server Actions**, ce qui est l'état de l'art en 2026. Cette approche "Server-First" réduit la complexité côté client et sécurise la logique métier. La séparation `ui` (composants) / `lib` (logique pure) est présente mais perméable.

### Problèmes Critiques
*   Aucun problème critique d'architecture bloquant.

### Problèmes Majeurs
*   **Couplage Fort UI/Métier :** Le composant `TantiemeCalculator.tsx` contient une logique métier complexe (calculs financiers, répartition) directement dans un `useMemo`. Cela rend cette logique impossible à tester unitairement sans monter le composant React et lie la logique à l'affichage.
*   **Gestion d'État Hybride :** Utilisation conjointe de `zustand` (global), URL params (implicite) et state local React. Risque de désynchronisation entre l'URL et le store Zustand si non rigoureusement géré.

### Quick Wins
*   Extraire le hook `useTantiemeCalculation` ou une fonction pure `calculateIndividualShare(...)` dans `src/lib/calculator.ts`.

### Refactoring Long Terme
*   Implémenter une couche "Service" explicite pour les Server Actions (ex: `src/services/ClimateService.ts`) pour découpler l'appel API (Controller) de la logique métier.

---

## 2. CODE MORT & DETTE TECHNIQUE
**Note : 7/10**

### Synthèse
La base de code est relativement propre et récente, mais montre des signes de prototypage rapide ("MVP") qui n'ont pas été nettoyés.

### Problèmes Critiques
*   Aucun problème critique.

### Problèmes Majeurs
*   **Duplication de Code :** Logique de formatage des devises répétée dans `src/lib/calculator.ts` et parfois formattée "à la main" dans certains composants.
*   **Structure de Tests Confuse :** Présence de `src/__tests__` (Jest) ET `tests/` (Playwright) à la racine. Convention non unifiée.

### Quick Wins
*   Supprimer les imports inutilisés dans `src/components/pdf/DownloadPptxButton.tsx` et nettoyer les commentaires TODO obsolètes.
*   Unifier l'emplacement des tests (tout dans `tests/` ou `src/__tests__`).

### Refactoring Long Terme
*   Refondre `TantiemeCalculator.tsx` pour sortir la logique complexe et réduire la complexité cyclomatique.

---

## 3. SÉCURITÉ (OWASP TOP 10)
**Note : 5/10 (⚠️ CRITIQUE)**

### Synthèse
La sécurité est traitée mais comporte des failles de configuration majeures qui exposent l'application à des attaques XSS et d'injection.

### Problèmes Critiques
*   **CSP Permissive (XSS) :** `middleware.ts` autorise `'unsafe-inline'` et `'unsafe-eval'` pour `script-src`. C'est une porte ouverte aux failles XSS.
*   **Fuite de Clés Potentielle :** `src/lib/supabaseClient.ts` utilise un fallback par défaut si les clés manquent, risquant un fonctionnement dégradé silencieux en prod.

### Problèmes Majeurs
*   **Validation d'Entrées :** Les Server Actions (ex: `getClimateData.ts`) manquent de validation stricte (Zod) sur les paramètres entrants.
*   **Exposition Clé Publique :** Clé Supabase exposée (normal, mais exige des RLS parfaits côté DB).

### Quick Wins
*   Supprimer `'unsafe-eval'` du CSP.
*   Ajouter un check bloquant au démarrage (`throw Error`) si les variables d'environnement Supabase sont manquantes.

### Refactoring Long Terme
*   Mettre en place une authentification robuste (NextAuth ou Supabase Auth complet) si des données sensibles sont stockées.

---

## 4. PERFORMANCE FRONT-END
**Note : 7/10**

### Synthèse
L'utilisation de Next.js optimise beaucoup de choses par défaut, mais les librairies lourdes de génération de documents pèsent sur le bundle.

### Problèmes Critiques
*   Aucun problème critique bloquant, mais performance dégradée sur mobile.

### Problèmes Majeurs
*   **Bundle Size :** `pptxgenjs` et `@react-pdf/renderer` (> 1MB) sont importés de manière statique dans certains composants client (`DownloadPptxButton`).

### Quick Wins
*   Passer les imports de `pptxgenjs` en dynamique (`await import(...)`) au moment du clic sur le bouton de téléchargement.

### Refactoring Long Terme
*   Optimiser le chargement des polices et des images (formats AVIF/WebP) si ce n'est pas déjà géré par Next/Image partout.

---

## 5. PERFORMANCE BACK-END
**Note : 8/10**

### Synthèse
Le backend est léger et performant grâce au caching efficace.

### Problèmes Critiques
*   Aucun.

### Problèmes Majeurs
*   **Génération PDF Serveur :** `src/app/actions/documents.ts` effectue des rendus PDF lourds qui peuvent saturer le CPU des Serverless Functions à forte charge.

### Quick Wins
*   Aucun quick win évident, l'architecture actuelle est cohérente pour un trafic modéré.

### Refactoring Long Terme
*   Déplacer la génération PDF dans un Worker dédié ou une Queue asynchrone pour éviter le timeout des Server Actions.

---

## 6. QUALITÉ DU CODE
**Note : 6/10**

### Synthèse
Code TypeScript strict, ce qui est excellent, mais la couverture de tests est insuffisante.

### Problèmes Critiques
*   **Absence de Tests Métier :** Les fonctions critiques de `calculator.ts` (conformité, financement) ne sont pas couvertes par des tests unitaires exhaustifs.

### Problèmes Majeurs
*   Utilisation de `any` dans `supabaseClient.ts` et les tests.

### Quick Wins
*   Ajouter 3-4 tests unitaires Jest pour `calculateComplianceStatus` couvrant les dates limites (2025, 2028, 2034).

### Refactoring Long Terme
*   Atteindre 80% de couverture sur `src/lib/`.

---

## 7. DEVOPS & PRODUCTION-READINESS
**Note : 7/10**

### Synthèse
L'essentiel est là (CI, Docker), mais manque de rigueur pour une vraie prod.

### Problèmes Critiques
*   Aucun.

### Problèmes Majeurs
*   Absence de Healthcheck endpoint explicite.
*   Gestion des environnements (Staging vs Prod) non explicitée dans le repo.

### Quick Wins
*   Ajouter une route API `/api/health` qui renvoie `{status: 'ok'}`.

### Refactoring Long Terme
*   Mettre en place un pipeline CD complet avec promotion d'environnement.

---

## 8. TECHNOLOGIES & STACK
**Note : 9/10**

### Synthèse
Stack moderne, cohérente et pérenne. Pas de technologie obsolète ("Legacy") détectée.

### Problèmes Critiques
*   Aucun.

### Problèmes Majeurs
*   **Standardisation PDF :** Utilisation concurrente de `pptxgenjs` (pour PPT) et `@react-pdf` (pour PDF). Cela fait deux moteurs de rendu à maintenir.

### Quick Wins
*   Mettre à jour les dépendances mineures (`npm update`).

### Refactoring Long Terme
*   Standardiser la génération de documents (si possible, tout générer depuis une source unique ou via un service externe).

---

## 9. DOCUMENTATION
**Note : 9/10**

### Synthèse
Excellente documentation, claire et structurée.

### Problèmes Critiques
*   Aucun.

### Problèmes Majeurs
*   Manque de JSDoc sur certaines fonctions complexes de `TantiemeCalculator`.

### Quick Wins
*   Ajouter des commentaires explicatifs sur les calculs complexes dans les composants UI.

### Refactoring Long Terme
*   Générer une documentation API automatique si l'API publique s'étoffe.

---

## VERDICT FINAL

**Note Globale : 68/100**
**Statut :** 🟡 **CORRECTIF NÉCESSAIRE**

### Estimation
**3 à 5 jours de développement** sont nécessaires pour rendre le projet techniquement "Production-Ready".

### Les 3 "Deal-Breakers" (à corriger avant toute démo investisseur)
1.  **Sécurité CSP :** Retirer `unsafe-eval` et `unsafe-inline` (risque XSS majeur).
2.  **Tests Métier :** Couvrir `calculator.ts` à 100%. Une erreur de calcul sur un plan de financement à 500k€ est inacceptable.
3.  **Performance Bundle :** Corriger l'import statique de `pptxgenjs` côté client pour ne pas ralentir le chargement initial sur mobile.

---
*Fin du rapport d'audit.*
