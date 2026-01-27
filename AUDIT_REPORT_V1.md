# AUDIT REPORT V1 - VALO-SYNDIC

**Date :** 27/01/2026
**Auditeur :** Jules (Senior Lead Tech)
**Version :** 1.0.0

---

### 🔴 1. CRITICAL & SECURITY (Doit être fixé AVANT déploiement)

- [x] **Dépendances :**
    - **Fichier :** `package.json`
    - **Gravité :** 🟡 Mineur
    - **Constat :** Présence de libs lourdes (`@react-pdf/renderer`, `pptxgenjs`, `leaflet`).
    - **Status :** Correctement géré via `next/dynamic` et `transpilePackages`. Pas de conflit de version majeur détecté.

- [ ] **Validation :**
    - **Fichier :** `src/components/DiagnosticForm.tsx`
    - **Gravité :** 🟢 Valide
    - **Constat :** Utilisation correcte de `DiagnosticInputSchema.safeParse(rawData)`. Toutes les entrées du formulaire principal sont validées.
    - **Note :** Attention, validation client-side uniquement (MVP sans backend). Si passage en API route, réutiliser `src/lib/schemas.ts`.

- [ ] **Env Vars :**
    - **Fichier :** Global
    - **Gravité :** 🟢 Valide
    - **Constat :** Aucune clé API (Supabase, etc.) n'est codée en dur ou exposée via `process.env` dans le code client.

- [ ] **Leak :**
    - **Fichier :** Global
    - **Gravité :** 🟢 Valide
    - **Constat :** Aucun `console.log` de données sensibles trouvé dans `src/`.

- [x] **Middleware :**
    - **Fichier :** `middleware.ts` (Manquant)
    - **Gravité :** 🟠 Majeur
    - **Constat :** Absence de fichier `middleware.ts` à la racine ou dans `src/`.
    - **Fix :** Créer le fichier pour sécuriser les headers (X-Frame-Options, etc.) même si pas d'auth pour l'instant.
    ```typescript
    import { NextResponse } from 'next/server';
    import type { NextRequest } from 'next/server';

    export function middleware(request: NextRequest) {
      const response = NextResponse.next();
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      return response;
    }
    ```

### 🟠 2. ARCHITECTURE & CODE QUALITY

- [x] **Structure :**
    - **Fichier :** `src/components/`
    - **Gravité :** 🟡 Mineur
    - **Constat :** Mélange de dossiers (`business`, `ui`) et de fichiers "vrac" (`DiagnosticForm.tsx`, `FinancingBreakdownChart.tsx`).
    - **Fix :** Déplacer `DiagnosticForm.tsx` dans `src/components/business/form/` et `FinancingBreakdownChart.tsx` dans `src/components/business/charts/`.

- [x] **Type Safety :**
    - **Fichier :** `src/hooks/useSoundEffects.ts`, `src/components/business/AngersMap.tsx`, `src/components/FinancingBreakdownChart.tsx`
    - **Gravité :** 🔴 Critique
    - **Constat :** Usage de `any` interdit en strict mode.
        - `useSoundEffects.ts`: `(window as any).webkitAudioContext`
        - `AngersMap.tsx`: `const [L, setL] = useState<any>(null);`
        - `FinancingBreakdownChart.tsx`: `const renderCustomLabel = ({ ... }: any)`
    - **Fix (Exemple Chart):**
    ```typescript
    // src/components/FinancingBreakdownChart.tsx
    interface CustomLabelProps {
      cx: number;
      cy: number;
      midAngle: number;
      innerRadius: number;
      outerRadius: number;
      percent: number;
    }
    const renderCustomLabel = (props: CustomLabelProps) => { ... }
    ```

- [x] **Hardcoding :**
    - **Fichier :** `src/components/pdf/DownloadPptxButton.tsx`
    - **Gravité :** 🟠 Majeur
    - **Constat :** Duplication des couleurs hexadécimales (`const C_BG = "0B0C0E"`) au lieu d'importer depuis `tailwind.config.ts` ou `constants.ts`.
    - **Fix :** Centraliser les couleurs dans `src/lib/theme.ts` et les importer partout.

### 🟡 3. UI/UX & RESPONSIVE

- [x] **Design System :**
    - **Fichier :** `src/components/DiagnosticForm.tsx`
    - **Gravité :** 🟡 Mineur
    - **Constat :** Utilisation de valeur arbitraire `text-[10px]`.
    - **Fix :** Utiliser `text-xs` (généralement 12px) ou définir une classe utilitaire `text-2xs` dans Tailwind si 10px est requis.
    ```tsx
    <p className="text-xs text-muted mt-1">...</p>
    ```

- [x] **Hardcoding UI :**
    - **Fichier :** `src/components/business/AngersMap.tsx`
    - **Gravité :** 🟡 Mineur
    - **Constat :** Couleurs des markers en dur (`#ef4444`, `#f59e0b`) dans `getIcon`.
    - **Fix :** Utiliser les variables CSS ou les tokens du thème via une fonction helper.

### 🟢 4. PERFORMANCE & BEST PRACTICES

- [ ] **Bundle Size :**
    - **Fichier :** `src/components/pdf/DownloadPptxButton.tsx`, `src/components/business/AngersMap.tsx`
    - **Gravité :** 🟢 Optimisé
    - **Constat :** `pptxgenjs` est importé dynamiquement (`await import("pptxgenjs")`). `react-leaflet` est chargé via `next/dynamic` avec `ssr: false`. Excellent.

- [ ] **Images/Fonts :**
    - **Fichier :** `src/app/layout.tsx`
    - **Gravité :** 🟢 Optimisé
    - **Constat :** Utilisation de `next/font/google` pour Inter et Playfair Display.

---

**CONCLUSION :**
La base technique est saine et moderne (Next 14, Zod, Tailwind). L'effort d'optimisation (Dynamic Imports) est notable.
**Priorité absolue :** Supprimer les `any` qui traînent et nettoyer l'architecture des composants avant que la dette technique ne s'installe. Ajouter un `middleware` de sécurité de base.
