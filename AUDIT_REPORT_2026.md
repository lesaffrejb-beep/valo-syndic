# AUDIT TECHNIQUE "SANS COMPLAISANCE" — VALO-SYNDIC

> **Date :** 31 Janvier 2026
> **Auditeur :** Architecte Senior Full-Stack
> **Version Auditée :** HEAD (Next.js 16 / React 19)

---

## 1. ARCHITECTURE & SCALABILITÉ
**Note : 8/10**

### Synthèse
L'architecture Next.js App Router est moderne et pertinente pour une SPA "Dashboard". L'usage de `zustand` pour le state global (`useViewModeStore`) et de Server Actions (bien que peu visibles) est aligné avec les standards 2026. Le pattern "Bento Grid" est bien implémenté via CSS Grid.

### Problèmes Critiques
*   Aucun bloquant architectural majeur.

### Problèmes Majeurs
*   **Couplage Fort UI/Logic :** `src/app/page.tsx` est un "God Component" (>300 lignes) qui mélange fetching Supabase, logique d'affichage, et gestion d'état local. Difficile à tester unitairement.

### Quick Wins
*   Extraire la logique de data-fetching de `page.tsx` vers un hook personnalisé `useDashboardData`.

### Refactoring Long Terme
*   Adopter une Clean Architecture stricte : séparer `src/features/dashboard` avec ses propres composants, hooks et services, pour alléger `src/app`.

---

## 2. CODE MORT & DETTE TECHNIQUE
**Note : 6/10**

### Synthèse
Le code est globalement propre mais souffre de traces de développement rapide ("MVP"). Des fichiers de backup et des commentaires de debug polluent la codebase.

### Liste Exhaustive
*   **Code Mort :** `src/app/page_original_backup.tsx` (Fichier de sauvegarde inutile à supprimer).
*   **Dead Logic :** Le test `tests/critical-flow.spec.ts` teste une UI ("Charger un exemple") qui n'existe plus dans `MagicalAddressInput`.
*   **Type Casting :** `setHeatingSystem(sys.id as any)` dans `MagicalAddressInput.tsx`. Violation de la règle "Code is Law".
*   **Console Logs :** Abondance de `console.log` dans `src/lib/__tests__`.

---

## 3. SÉCURITÉ (OWASP)
**Note : 5/10**

### Synthèse
La sécurité est prise en compte (`middleware.ts`, Zod schemas) mais présente des failles de configuration.

### Failles
*   **CRITIQUE :** Absence de CI/CD. Aucun pipeline de sécurité ne tourne automatiquement.
*   **MOYENNE :** CSP Faible dans `middleware.ts`. Usage de `'unsafe-eval'` et `'unsafe-inline'` pour les scripts et styles.
*   **MOYENNE :** Validation Zod `json_data: z.any()` dans `schemas.ts`. Permet l'injection de structures malveillantes en base.

---

## 4. PERFORMANCE
**Note : 7/10**

### Synthèse
Stack performante (Next.js, Tailwind). Le chargement initial est rapide grâce au SSR, mais le bundle JS client pourrait grossir sans code-splitting sur les composants lourds (`framer-motion`, `recharts` dans `page.tsx`).

### Recommandations Chiffrées
*   Lazy-load des composants "sous la ligne de flottaison" (ex: `ObjectionHandler`, `ReceiptLedger`). Gain estimé : -150kb bundle initial.

---

## 5. DEVOPS & PRODUCTION-READINESS
**Note : 2/10 (DEAL-BREAKER)**

### Synthèse
C'est le point noir du projet. L'infrastructure d'automatisation est inexistante ou non commise.

### Problèmes Critiques
1.  **Absence de CI/CD :** Le dossier `.github/workflows` est introuvable. Les tests et le linting ne sont pas forcés avant merge.
2.  **Tests E2E Cassés :** `tests/critical-flow.spec.ts` échouera systématiquement (sélecteurs obsolètes).
3.  **Logs Production :** Usage de `console.error` visible côté client. Manque d'intégration Sentry vérifiée (config présente mais DSN non validé).

---

## VERDICT FINAL

**Note Globale : 56/100**

🔴 **VERDICT : CORRECTIF NÉCESSAIRE**

Le projet a une base technique saine (Next.js 16, Zod, Zustand) et une excellente documentation (`LE_CENTRE.md`). Cependant, **il n'est pas "Production Ready"** en l'état à cause de l'absence totale de filet de sécurité DevOps et de la dette technique sur les tests.

### Estimation
**5 Jours Homme** pour passer en "🟢 PRODUCTION-READY".

### Les 3 Deal-Breakers (À corriger AVANT mise en prod)
1.  **Mettre en place la CI/CD** (GitHub Actions) pour bloquer les régressions.
2.  **Réparer les tests Playwright** pour qu'ils reflètent la réalité du parcours "Adresse Magique".
3.  **Nettoyer le "God Component" `page.tsx`** et supprimer le code mort (`backup.tsx`).
