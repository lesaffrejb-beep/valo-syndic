# AUDIT ARCHITECTURAL EXHAUSTIF - BÊTA 2026
> Date: 31 Janvier 2026
> Statut: COMPLET
> Périmètre: Backend, Data Layer, Component Layer, Logic Layer

Ce document détaille **chaque brique tech** de l'application pour préparer la refonte UI.

---

## 1. DATA LAYER - SOURCES & INFRASTRUCTURE

### 1.1 API Endpoints (Externes & Internes)

#### **1.1.1 API Gouvernementales (Tierces)**
| Nom | Endpoint Base | Méthode | Usage Précis | Fichier Responsable |
| :--- | :--- | :--- | :--- | :--- |
| **API Adresse (BAN)** | `https://api-adresse.data.gouv.fr` | `GET /search/` | Autocomplétion, Normalisation, GPS | `src/hooks/useAddressSearch.ts` |
| **Géorisques** | `https://georisques.gouv.fr` | `GET /api/v1/gaspar/risques` | Risques naturels (Argile, Inondation, Radon, Sismicité) | `src/services/riskService.ts` |
| **API DVF** | `https://api.dvf.etalab.gouv.fr` | (Via wrapper interne) | Valeurs Foncières (Prix m²) | `src/lib/api/dvfService.ts` |
| **API Cadastre** | `https://apicarto.ign.fr` | (Via wrapper interne) | Géométrie parcelles, Surface terrain | `src/lib/api/cadastreService.ts` |

#### **1.1.2 Supabase (Backend as a Service)**
L'application utilise le SDK Supabase JS (`@supabase/supabase-js`) en mode **Client-Side** principalement.
*   **Instance** : `src/lib/supabaseClient.ts`
*   **Tables Exploitées** :
    *   `reference_dpe` (SELECT) : Données techniques validées (DPE, Année, Surface). Clé de recherche : `adresse_ban`.
    *   `market_data` (SELECT) : Constantes de marché (BT01, Taux, Inflation). Clé : `key`.
    *   `simulations` (INSERT/SELECT) : Sauvegarde projet utilisateur (JSONB). RLS activé (User Only).
    *   `market_stats` (INSERT) : Hive Mind (Stats anonymes pour intelligence collective).

#### **1.1.3 Données Locales (Static / Fallbacks)**
| Fichier | Contenu | Usage | Stratégie |
| :--- | :--- | :--- | :--- |
| `/data/dpe-49.json` | Base DPE Maine-et-Loire (Extrait) | Recherche Offline / Latence nulle | Chargement lazy + Cache mémoire |
| `/data/market_benchmarks_49.json` | Prix marché (Lots/m²) | Benchmark UI (`MarketBenchmark`) | Chargé à la demande par `marketBenchmarkService` |
| `src/data/market_data.json` | Constantes nationales | Fallback si Supabase Down | Hardcodé dans le build |

### 1.2 Modèles de Données (TypeScript Interfaces)

Les types sont centralisés dans `src/lib/schemas.ts` (Zod) et `src/lib/api/types.ts`.

#### **Structures Critiques (Domain Objects)**
1.  **`DiagnosticInput`** (L'objet source)
    *   `address`, `postalCode`, `city` (String)
    *   `currentDPE`, `targetDPE` (Enum: 'A'-'G')
    *   `numberOfUnits` (Number: 2-500)
    *   `estimatedCostHT` (Number)
    *   `surface` (Optional Number)
    *   `...` (Voir `schemas.ts` pour la liste complète des champs financiers)

2.  **`DiagnosticResult`** (L'objet calculé)
    *   `compliance`: `{ isProhibited: boolean, deadline: Date, urgency: 'critical'|'high'|'medium' }`
    *   `financing`: `{ worksCostHT, totalCostTTC, mprAmount, amoAmount, remainingCost, monthlyPayment, ... }`
    *   `valuation`: `{ currentValue, projectedValue, greenValueGain, netROI }`
    *   `inactionCost`: `{ totalLoss3Years, inflationCost, valueErosion }`

3.  **`GeoRisk`** (Données Environnement)
    *   `argile` (0-3), `inondation` (bool), `sismicite` (1-5), `radon` (1-3)
    *   `technologique` (bool), `minier` (bool)

4.  **`BenchmarkData`** (Données Marché)
    *   `benchmarks`: `{ pricePerLot: { min, median, max }, pricePerSqm: { ... } }`
    *   `tolerances`: `{ green: 1.1, yellow: 1.3 }` (Seuils d'écart acceptables)

---

## 2. COMPONENT LAYER - COMPOSITION UI

Les composants "Métier" (`src/components/business/`) sont autonomes. Ils ne dépendent pas d'un store global complexe mais reçoivent leurs données via **Props**.

### 2.1 Inventaire Exhaustif des Composants Bento

| Composant | Données Requises (Props) | Rôle & Logique Interne | Visibilité |
| :--- | :--- | :--- | :--- |
| **`FinancingCard`** | `financing: FinancingPlan`, `numberOfUnits` | Affiche le plan, les aides et fetch **lui-même** le benchmark marché ! | **Prod** |
| **`ValuationCard`** | `valuation: ValuationResult` | Affiche la Valeur Verte et le ROI. Logique d'animation "Compteur". | **Prod** |
| **`ClimateRiskCard`** | `compliance: ComplianceStatus` | Timeline Loi Climat. Calcule la position relative de la date actuelle. | **Prod** |
| **`InactionCostCard`** | `inaction: InactionCost` | Comparaison Différée. Simple affichage de données calculées. | **Prod** |
| **`RisksCard`** | `lat`, `lon` (implied by context) | **Fetch asynchrone** (useEffect) des données Géorisques via `riskService`. | **Prod** |
| **`MarketBenchmark`** | `costPerLot` | Jauge de positionnement prix vs marché local. | **Prod** |
| **`TantiemeCalculator`** | `financing` | **State interne complexe** (slider tantièmes, presets). Recalcule la quote-part en direct. | **Prod** |
| **`MassAudit`** | Aucune (Page Like) | **Logique lourde** : Parse CSV, itère sur `calculator`, affiche Map + Stats. | **Admin/Dev** |
| **`AngersMap`** | `results: BuildingAuditResult[]` | Affiche les points sur carte Leaflet/Mapbox (Implémentation SVG ou Canvas). | **Admin/Dev** |
| **`UrgencyScore`** | `compliance`, `risks` | Agrège un score 0-100 basé sur DPE + Risques Naturels. | **Prod** |
| **`TransparentReceipt`** | `financing` | Vue détaillée (Tableau) des coûts pour transparence syndic. | **Prod** |
| **`MprSuspensionAlert`**| `regulation` | Conditionnel : ne s'affiche que si `regulation.isSuspended === true`. | **Prod** |
| **`AddressAutocomplete`**| `onSelect(addr)` | Gère l'input, le debounce et l'appel API Gouv. | **Core** |

### 2.2 Hiérarchie & Pattern
1.  **Page (`page.tsx`)** : Orchestrateur.
    *   Gère le State `diagnosticInput` et `diagnosticResult`.
    *   Utilise les Hooks pour fetcher les données.
    *   Passe le `result` aux composants enfants.
2.  **Layout Bento** : CSS Grid Container.
    *   Les cartes sont des enfants directs.
3.  **Leaf Components** :
    *   `AnimatedCurrency`, `BenchmarkBadge` : UI Pures.

---

## 3. BUSINESS LOGIC LAYER - MOTEURS DE CALCUL

### 3.1 `calculator.ts` (Moteur Principal)
C'est une librairie de **fonctions pures** (déterministes).
*   **`generateDiagnostic(input)`** : Pipeline principal.
    1.  `calculateComplianceStatus(dpe)` -> Sortie : Interdictions & Urgence.
    2.  `simulateFinancing(...)` -> Sortie : Plan financement 2026.
        *   Applique taux TVA (5.5%).
        *   Applique barèmes MPR Copro + Bonus Sortie Passoire.
        *   Applique plafonds Ecop-PTZ et AMO.
    3.  `calculateInactionCost(...)` -> Sortie : Coûts futurs.
        *   Applique inflation BTP (paramétrable dans `constants.ts`).
        *   Applique dérive valeur verte (perte relative).
    4.  `calculateValuation(...)` -> Sortie : Gain Patrimonial.
        *   Utilise prix m² (DVF ou Input User).
        *   Applique décote/surcote DPE (Tableau fixe G=-15% ... A=+15%).

### 3.2 `subsidy-calculator.ts` (Moteur Granulaire)
Utilisé par le `TantiemeCalculator` pour des précisions individuelles.
*   Gère les profils MaPrimeRénov' Individuels (Bleu, Jaune, Violet, Rose).
*   Permet de simuler l'aide exacte pour un copropriétaire précis (vs moyenne globale).

### 3.3 `riskService.ts` (Logique Risque)
*   Normalise les données brutes "Gaspar" (API Gouv) en un score 0-3 simple pour l'UI.
*   Gère les cas de valeurs manquantes (Fallbacks).

### 3.4 Hooks "Middle-Office"
*   **`useAddressSearch`** : Le cerveau de la saisie.
    *   Déclenche recherche API Gouv.
    *   Dès sélection -> Tente de trouver le DPE réel dans Supabase (`reference_dpe`).
    *   Si trouvé -> Hydrate automatiquement le formulaire (Magic Effect).
*   **`useProjectSave`** : Gère la persistance.
    *   Check Auth (Supabase).
    *   Si non auth -> Popup Login.
    *   Si auth -> Insert `simulations` + Insert `market_stats` (Fire & Forget).

---

## 4. ARCHITECTURE & DATA FLOW DETAILED

### 4.1 Diagramme de Flux

```
[USER INPUT] (Adresse)
      │
      ▼
[HOOK: useAddressSearch] 
      │──▶ (1) GET api-adresse.data.gouv.fr (Autocomplete)
      │──▶ (2) SELECT supabase.reference_dpe (Enrichissement)
      ▼
[STATE: diagnosticInput] (Hydraté avec adresse, dpe, surface...)
      │
      │ (User complète : coût travaux, nb lots...)
      ▼
[EVENT: onCalculate / useEffect]
      │
      ▼
[ENGINE: calculator.ts] (Pure Functions)
      │──▶ Reads constants.ts (Taux 2026)
      │──▶ Reads market-data.ts (Indices BT01)
      ▼
[STATE: diagnosticResult]
      │
      ▼
[UI: Dashboard / Bento]
      │──▶ <FinancingCard data={result.financing} />
      │       │──▶ (Async) fetch market_benchmarks.json
      │
      │──▶ <RisksCard lat={...} lon={...} />
      │       │──▶ (Async) fetch georisques.gouv.fr
      │
      │──▶ <ValuationCard data={result.valuation} />
      │
      │──▶ <TantiemeCalculator data={result.financing} /> (Interactive)
```

### 4.2 Points Forts (Architecture)
*   **Découplage Calcul / UI** : Toute la logique financière est hors de React, testable unitairement.
*   **Résilience** : Fallbacks locaux pour presque tout (Market Data, Maps, DPE).
*   **Performance** : Les composants lourds (Maps, Mass Audit) sont chargés dynamiquement ou isolés.

### 4.3 Dettes & Axes d'Amélioration
*   **Double Fetching** : `FinancingCard` refetch des données benchmark. Devrait être passé en props depuis le parent pour éviter le *waterfall*.
*   **Type Safety** : Quelques `any` trainent dans les retours API Gouv (`riskService.ts`, `MassAudit.tsx`). Devraient être typés strictement via Zod.
*   **Scalabilité** : Le fichier JSON `dpe-49.json` ne passera pas à l'échelle nationale. Prévoir bascule Full Supabase ou API Ademe.
