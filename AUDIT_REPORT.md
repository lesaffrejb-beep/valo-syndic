# AUDIT TECHNIQUE : VALO-SYNDIC

**Date :** 27/01/2026
**Auditeur :** Jules (Senior Architect)
**Version audité :** HEAD

---

## 1. ARCHITECTURE & SCALABILITÉ

**Synthèse :**
L'architecture est un monolithe Next.js (App Router) "Thick Client". La logique métier est pure et bien découplée (`src/lib/calculator.ts`), ce qui est le point fort du projet. Cependant, l'approche "tout dans le navigateur" pour la génération PDF/PPTX va rapidement poser des problèmes de performance sur les terminaux mobiles.

**Note : 7/10**

- **Problèmes critiques :** Aucun pour l'instant.
- **Problèmes majeurs :**
    - La génération de PDF/PPTX côté client (`pptxgenjs`, `@react-pdf`) est CPU-intensive. À 1000 utilisateurs simultanés, le serveur tient (car statique), mais le navigateur client va ramer/crasher, surtout sur mobile.
- **Quick wins :**
    - Déplacer la logique lourde (PDF/PPTX) dans des Server Actions ou des Edge Functions si les besoins augmentent.

## 2. CODE MORT & DETTE TECHNIQUE

**Synthèse :**
Le code est globalement propre mais souffre de "God Files" massifs pour la génération de documents. Quelques `any` traînent malgré la config stricte.

- **Duplication de code :**
    - `src/components/pdf/PDFDocument.tsx` (844 lignes) et `src/components/pdf/PDFDocumentEnhanced.tsx` (856 lignes) semblent être des quasi-doublons. **Refactoring Urgent.**
- **Complexité cyclomatique :**
    - `src/lib/pptx-generator.ts` (797 lignes) : Logique impérative complexe, difficile à tester et maintenir.
- **Types laxistes (`any`) détectés :**
    - `src/components/pdf/ConvocationDocument.tsx` : `brand?: any`
    - `src/services/dpeService.ts` : `feature: any` (API response non typée = danger)
    - `src/lib/api/index.ts` : `searchOptions: any`

## 3. SÉCURITÉ (OWASP TOP 10)

**Synthèse :**
Sécurité acceptable pour un MVP sans base de données critique, mais des failles de configuration existent.

**Gravité : MOYENNE**

- **Input Validation :** EXCELLENT. Usage de `Zod` (`src/lib/schemas.ts`) pour valider les entrées utilisateurs et l'import de fichiers JSON.
- **CSP (Content Security Policy) :** Présent dans `middleware.ts` mais permissif (`unsafe-eval`, `unsafe-inline`). Nécessaire pour Next.js mais à durcir.
- **Dépendances :** Pas de vulnérabilités critiques visibles, mais audit `npm audit` recommandé avant prod.
- **Absence de CI/CD :** Pas de pipeline de sécurité automatique (SAST/DAST) = Risque d'introduire des failles sans s'en rendre compte.

## 4. PERFORMANCE FRONT-END

**Synthèse :**
Bon usage du `dynamic import` pour les librairies lourdes, mais le bundle initial reste à surveiller.

- **Bundle Size :**
    - Les composants lourds (`@react-pdf`, `pptxgenjs`) sont correctement lazy-loadés dans `page.tsx` (`dynamic(() => import...)`). C'est une excellente pratique qui sauve le TTI (Time To Interactive).
- **Core Web Vitals :**
    - Le LCP risque d'être impacté par les cartes (Maps/Leaflet) si elles ne sont pas bien gérées.
- **Recommandations :**
    - Vérifier que `leaflet` est aussi chargé dynamiquement (SSR: false), car il casse souvent le build serveur et alourdit le bundle initial.

## 5. PERFORMANCE BACK-END & DATABASE

**Synthèse :**
N/A (Architecture Client-Side). Le backend (Next.js API routes) sert de proxy léger.
Aucun risque de N+1 pour l'instant car pas d'ORM complexe.

## 6. QUALITÉ DU CODE

**Synthèse :**
Paradoxale. TypeScript est configuré en mode ultra-strict (EXCELLENT), mais les tests sont quasi-inexistants.

**Note : D (Dû à l'absence de tests)**

- **TypeScript :** `strict: true`, `noUncheckedIndexedAccess: true`. C'est le top standard 2025.
- **Tests :**
    - **CATASTROPHIQUE.** Un seul fichier de test (`src/lib/__tests__/calculator.test.ts`).
    - Couverture estimée < 5%. Aucune assurance de non-régression sur l'UI ou les exports PDF.
- **Linting :** Configuration standard Next.js présente.

## 7. DEVOPS & PRODUCTION-READINESS

**Synthèse :**
Le néant. Projet "hobbyiste" en l'état. Inexploitable professionnellement sans pipeline.

**Checklist Manquante :**
- [ ] **CI/CD :** Aucun workflow GitHub Actions (build, test, lint).
- [ ] **Docker :** Pas de `Dockerfile`. Déploiement dépendant de Vercel (vendor lock-in léger).
- [ ] **Monitoring :** Pas de Sentry ou LogRocket configuré.
- [ ] **Staging :** Pas d'environnement de recette mentionné.

## 8. TECHNOLOGIES & STACK

**Synthèse :**
Stack moderne et pertinente (Next.js 14, Tailwind, Zustand, Zod). Pas d'héritage obsolète.

- **Points d'attention :**
    - `pptxgenjs` et `@react-pdf/renderer` sont des librairies lourdes et parfois instables. À surveiller.

## 9. DOCUMENTATION & MAINTENABILITÉ

**Synthèse :**
Plutôt bonne pour un projet de cette taille. README clair, architecture documentée dans `docs/`.

- **Onboarding :** ~2h pour comprendre le projet.
- **Note : 8/10**

---

# VERDICT FINAL

- **Note globale :** 60/100
- **Verdict :** 🟡 CORRECTIF NÉCESSAIRE

Le cœur du réacteur (calculateur) est sain, mais l'enrobage industriel manque cruellement. Vous avez un excellent POC (Proof of Concept), mais pas encore un produit maintenable en équipe.

**Estimation :** 5 jours de dev Full-Stack Senior pour :
1.  Mettre en place la CI/CD et Docker (1j)
2.  Écrire des tests E2E (Playwright) sur les parcours critiques (2j)
3.  Refactoriser les "God Files" PDF (1j)
4.  Durcir les types `any` et la gestion d'erreurs (1j)

**DEAL-BREAKERS (Les 3 points qui tueraient la prod) :**
1.  **Absence totale de CI/CD et Tests E2E :** Vous allez casser la génération PDF en prod à la moindre mise à jour de dépendance sans vous en rendre compte.
2.  **Duplication PDF :** Maintenir deux fichiers de 800 lignes (`PDFDocument` vs `Enhanced`) est une bombe à retardement pour la cohérence des documents générés.
3.  **Client-Side Heavy Processing :** Si vos utilisateurs sont sur des tablettes bas de gamme (typiquement des gestionnaires en déplacement), l'appli va crasher lors de la génération PDF.
