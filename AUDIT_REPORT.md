# 💀 AUDIT TECHNIQUE EXHAUSTIF — VALO-SYNDIC

**Date :** 27/01/2026
**Auditeur :** Jules (Senior Architect)
**Version :** 0.1.0
**Cible :** Due Diligence / Scalabilité

---

## 1. ARCHITECTURE & SCALABILITÉ

**Note : 6/10**

### Synthèse
L'architecture est un hybride pragmatique mais fragile. Le choix du "Client-Side First" est excellent pour le coût d'infrastructure, mais l'utilisation d'un Client Component monolithique pour la page principale limite la scalabilité performance et l'évolution fonctionnelle (SaaS).

### 🔴 Problèmes Critiques (Blocage Scale)
1.  **Monolithe Client-Side (`src/app/page.tsx`) :** Le "use client" au sommet de la page principale charge toute l'application dans le bundle initial. À 1000 utilisateurs simultanés, le TBT (Total Blocking Time) explosera sur mobile.
2.  **Absence de Backend Réel :** L'hésitation entre "No Backend" et l'utilisation de `supabaseClient.ts` crée une architecture bâtarde où la sécurité des données n'est garantie ni par le client (impossible), ni par le serveur (incomplet).

### 🟡 Problèmes Majeurs
*   **Couplage UI / Logique :** Les composants UI (ex: `DiagnosticForm`) gèrent des états complexes qui devraient être externalisés dans des stores ou des hooks dédiés.
*   **Gestion de l'état (Zustand) :** Bien implémentée, mais sous-utilisée pour le formulaire principal qui repose encore trop sur des `useState` locaux.

### ⚡ Quick Wins
*   Déplacer les composants statiques (Header, Footer, Layout) hors du Client Component racine.
*   Activer `stale-while-revalidate` sur les fetches de données externes (DVF).

### 🏗️ Refactoring Long Terme
*   Migrer la logique `calculator.ts` vers des Server Actions pour sécuriser la propriété intellectuelle et alléger le bundle client.

---

## 2. CODE MORT & DETTE TECHNIQUE

**Note : 5/10**

### Synthèse
Le projet contient trop de traces de développement ("TODO", "FIXME") et de code commenté pour être considéré comme professionnel. La dette technique est volontaire (MVP) mais doit être payée avant toute mise en prod sérieuse.

### 🔴 Problèmes Critiques
1.  **Fonctionnalités "Fantômes" :** Le bouton `DownloadPptxButton.tsx` est désactivé (`TODO: Réactiver...`). Vendre une feature qui ne marche pas est un risque légal.
2.  **QR Code Inutile :** `src/components/pdf/VoteQR.tsx` pointe vers une URL statique inutile en AG.

### 🟡 Problèmes Majeurs
*   **Typage `any` Explicite :**
    *   `src/lib/supabaseClient.ts`: `// Typage minimal (any) comme demandé`.
    *   `src/components/pdf/DownloadPptxButton.tsx`: `] as any[];`.
    *   `src/lib/schemas.ts`: `json_data: z.any()`.
*   **Code Commenté :** Présence de blocs commentés dans `src/app/page.tsx` (bouton "Audit de Parc").

### ⚡ Quick Wins
*   Supprimer les features non fonctionnelles (PPTX, QR Code) de l'UI plutôt que de les laisser buggées.
*   Remplacer les `any` par des types `unknown` ou des interfaces partielles.

### 🏗️ Refactoring Long Terme
*   Mettre en place un outil comme `Knip` pour détecter automatiquement les exports inutilisés dans le CI/CD.

---

## 3. SÉCURITÉ (OWASP)

**Note : 8/10**

### Synthèse
La sécurité est étonnamment robuste pour un MVP, grâce à une configuration stricte par défaut (Next.js + Middleware CSP). L'absence de base de données active limite la surface d'attaque.

### 🔴 Problèmes Critiques
*   Aucun problème critique détecté dans le périmètre actuel (Client-Side).

### 🟡 Problèmes Majeurs
*   **Exposition Logique Métier :** Le code de calcul (`calculator.ts`) est public. Un concurrent peut copier l'intégralité de la propriété intellectuelle en une requête.
*   **Absence de Rate Limiting :** Les API externes (Gouv, GeoRisques) sont appelées directement par le client, exposant les clés API (si utilisées) ou les quotas du domaine.

### ⚡ Quick Wins
*   Ajouter des headers de sécurité manquants : `Strict-Transport-Security` (HSTS).

### 🏗️ Refactoring Long Terme
*   Déplacer les appels API tiers vers un proxy Next.js (Route Handler) pour cacher les clés et implémenter du caching + rate limiting.

---

## 4. PERFORMANCE FRONT-END

**Note : 7/10**

### Synthèse
L'application est fluide par sa légèreté, mais techniquement non optimisée. Le Lazy Loading est présent, mais le rendu React est instable (trop de re-renders).

### 🔴 Problèmes Critiques
*   **Bundle Size Monolithique :** L'ensemble du JS est chargé au démarrage.
*   **Re-renders en cascade :** La saisie dans le formulaire provoque le re-rendu de toute la page `HomePage`.

### 🟡 Problèmes Majeurs
*   **Images :** Pas d'utilisation de `next/image` détectée pour les assets complexes (cartes, logos).
*   **Google Maps :** Chargé via script externe sans stratégie de chargement différé optimisée.

### ⚡ Quick Wins
*   Utiliser `memo()` sur les composants lourds (`FinancingCard`, `ValuationCard`) pour éviter les re-renders inutiles lors de la frappe.

### 🏗️ Refactoring Long Terme
*   Implémenter une architecture "Island Architecture" ou ségréguer les étapes du formulaire dans des routes distinctes `/simulate/step-1`, `/simulate/step-2`.

---

## 5. PERFORMANCE BACK-END & DATABASE

**Note : N/A (Non Applicable)**

### Synthèse
Le projet n'utilise pas de backend actif pour le cœur de métier.

### 🔴 Problèmes Critiques
*   Aucun (Pas de DB).

### 🟡 Problèmes Majeurs
*   **Risque Supabase :** Si la feature de sauvegarde est activée massivement, l'absence d'index sur la colonne `json_data` (qui stocke tout) rendra les recherches impossibles.

### ⚡ Quick Wins
*   Aucun.

### 🏗️ Refactoring Long Terme
*   Modéliser une vraie base de données relationnelle (PostgreSQL) pour sortir du modèle "JSON Dump" actuel.

---

## 6. QUALITÉ DU CODE

**Note : 4/10**

### Synthèse
Le code est propre visuellement mais fragile structurellement. Les tests sont une façade : ils existent mais ne valident pas la complexité métier réelle.

### 🔴 Problèmes Critiques
*   **Tests E2E superficiels :** `tests/critical-flow.spec.ts` vérifie seulement que "ça ne crash pas", pas que "le calcul est juste".
*   **Manque de Types de Retour :** Beaucoup de fonctions dans les composants n'ont pas de type de retour explicite.

### 🟡 Problèmes Majeurs
*   **Nommage Variable :** Mélange Français/Anglais (`nbLots` vs `numberOfUnits`, `simuler` vs `simulate`).
*   **Fonctions Longues :** `simulateFinancing` dans `calculator.ts` dépasse 100 lignes et fait trop de choses (calculs, règles métier, formatage).

### ⚡ Quick Wins
*   Renommer uniformément les variables en Anglais (standard).
*   Ajouter `eslint-plugin-sonarjs` pour détecter la complexité cognitive.

### 🏗️ Refactoring Long Terme
*   Découper `simulateFinancing` en sous-fonctions atomiques (`calculateMPR`, `calculateEcoPTZ`, `calculateInaction`).

---

## 7. DEVOPS & PRODUCTION-READINESS

**Note : 6/10**

### Synthèse
Les bases sont là (Docker, CI), mais l'observabilité est nulle. En cas de bug en production, vous serez aveugle.

### 🔴 Problèmes Critiques
*   **Absence de Logging Structuré :** Aucune trace des erreurs JS client ne remonte vers un backend de logs (sauf Sentry si configuré, mais pas vérifié).

### 🟡 Problèmes Majeurs
*   **Pas de Staging :** Le pipeline CI semble déployer directement ou tester, mais sans environnement de recette dédié défini dans le repo.

### ⚡ Quick Wins
*   Configurer Sentry pour capturer les erreurs React Boundary.
*   Ajouter un fichier `HEALTHCHECK` dans le Dockerfile.

### 🏗️ Refactoring Long Terme
*   Mettre en place un pipeline complet : Build -> Test -> Deploy Staging -> E2E Staging -> Deploy Prod.

---

## 8. TECHNOLOGIES & STACK

**Note : 7/10**

### Synthèse
La stack est moderne (Next.js 16, React 19) et pertinente. Pas de technologies obsolètes (jQuery etc). Le choix de bibliothèques est standard (`zustand`, `zod`).

### 🔴 Problèmes Critiques
*   **Dépendance Critique Instable :** `pptxgenjs` semble poser problème (d'où le TODO). Baser une feature clé sur une lib instable est dangereux.

### 🟡 Problèmes Majeurs
*   **Over-engineering :** Utiliser Supabase juste pour dumper un JSON est excessif. Un simple S3 ou Firebase ferait l'affaire pour moins cher/complexe.

### ⚡ Quick Wins
*   Figer les versions des dépendances (pas de `^`) pour éviter les régressions silencieuses.

### 🏗️ Refactoring Long Terme
*   Remplacer `pptxgenjs` par une solution de génération serveur (ex: API qui renvoie un buffer) pour plus de fiabilité.

---

## 9. DOCUMENTATION & MAINTENABILITÉ

**Note : 3/10**

### Synthèse
Documentation technique quasi inexistante. Le `README.md` est un argumentaire de vente, pas un guide développeur. `PROJECT_DNA.md` explique le "pourquoi" mais pas le "comment".

### 🔴 Problèmes Critiques
*   **Absence de `SPECS.md` :** Référencé mais introuvable. Un nouveau développeur ne peut pas savoir comment le système est censé fonctionner.
*   **Onboarding Difficile :** Aucune explication sur comment lancer les tests, mocker les données ou déployer.

### 🟡 Problèmes Majeurs
*   **Pas d'ADR (Architecture Decision Records) :** Pourquoi avoir choisi le calcul Client-Side ? Pourquoi Supabase ? Rien n'est écrit.

### ⚡ Quick Wins
*   Rédiger un `CONTRIBUTING.md` avec les commandes de base.
*   Documenter les formules mathématiques complexes dans le code (JSDoc).

### 🏗️ Refactoring Long Terme
*   Générer une documentation automatique (TypeDoc) à partir du code TypeScript.

---

## ⚖️ VERDICT FINAL

**NOTE GLOBALE : 58/100**

### 🟢/🟡/🔴 VERDICT : 🟡 CORRECTIF NÉCESSAIRE
Le projet est un **POC (Proof of Concept) avancé**. Il démontre la valeur mais s'effondrera sous la charge de la maintenance et de l'évolution. Il n'est pas "investor-ready" techniquement.

### 💣 Deal-Breakers (Les 3 tueurs)
1.  **Fonctionnalités "Fake" :** Les TODOs dans les exports PDF/PPTX/QR sont inacceptables pour un produit fini.
2.  **Sécurité IP :** Tout le code métier est visible et copiable (Client-Side).
3.  **Qualité Tests :** Les tests ne protègent pas contre les erreurs de calcul financier (risque légal).

### 📅 Estimation : 15 Jours de Dév (Senior)
Pour rendre le projet professionnel et scalable.
