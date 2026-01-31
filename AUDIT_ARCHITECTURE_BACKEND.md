# AUDIT ARCHITECTURE BACKEND & DATA LAYER
> Date: 31 Janvier 2026
> Scope: Backend, Dataflow, Computation Engines

## 1. DATA LAYER - Sources & Schemas

### 1.1 Sources de Données
L'application utilise une architecture hybride combinant données locales (pour la rapidité/offline) et API distantes (pour la fraîcheur et la couverture).

| Source | Type | Endpoint / Méthode | Usage |
| :--- | :--- | :--- | :--- |
| **API Adresse Gouv** | API Externe | `api-adresse.data.gouv.fr/search` | Autocomplétion adresses + Coordonnées GPS. |
| **Supabase** | DB (Postgres) | Table `reference_dpe` | Récupération des données techniques réelles (DPE, Surface, Année). |
| **Supabase** | DB (Postgres) | Table `market_data` | Indicateurs de marché dynamiques (BT01, Taux, Tendance). |
| **DPE Local** | Fichier Static | `/data/dpe-49.json` | Dataset de secours (Maine-et-Loire) avec recherche fuzzy. |
| **Market Local** | Fichier Static | `src/data/market_data.json` | Fallback si Supabase inaccessible (Indicateurs clés). |
| **Supabase** | DB (Postgres) | Table `simulations` | Persistance des projets utilisateurs (JSONB). |

### 1.2 Data Schemas (TypeScript & Zod)
Tous les modèles sont centralisés et validés via **Zod** dans `src/lib/schemas.ts`. C'est la "Single Source of Truth".

#### Modèles Principaux
*   **`DiagnosticInput`** : Données brutes saisies/récupérées (Adresse, DPE Actuel, Surface, Coût Travaux...).
*   **`DiagnosticResult`** : Objet global contenant tout le résultat du calcul.
    *   `compliance`: Statut légal (Interdiction location).
    *   `financing`: Plan de financement complet.
    *   `inactionCost`: Projection des pertes financières.
    *   `valuation`: Valorisation vénale et Valeur Verte.

#### Types de Données Brutes (Raw vs Transformed)
*   **Raw (DPE Entry)** : `numero_dpe`, `conso_kwh_m2_an` (str/num variables).
*   **Transformed (App)** : `DPELetter` (A-G), `DiagnosticInput` (nettoyé et typé).

### 1.3 Services de Fetching
*   **`dpeService` (`src/services/dpeService.ts`)** :
    *   Gère le cache mémoire (`let cachedData`).
    *   Implémente un algorithme de recherche hybride (Distance de Levenshtein + Priorité Exacte).
*   **`useAddressSearch` (`src/hooks/useAddressSearch.ts`)** :
    *   Orchestre les appels API Adresse Gouv.
    *   Enchaîne avec une requête Supabase (`reference_dpe`) pour enrichir la donnée automatiquement.
*   **`market-data` (`src/lib/market-data.ts`)** :
    *   Stratégie "Stale-While-Revalidate" simplifiée : essaie Supabase, fallback sur JSON local.

---

## 2. COMPONENT LAYER - UI Widgets & Cards (Bento)

Les composants "Business" sont situés dans `src/components/business/`. Ils sont conçus comme des "Widgets" autonomes qui consomment des portions du `DiagnosticResult`.

### 2.1 Inventaire des Composants Bento
| Composant | Rôle | Dépendances Data | État |
| :--- | :--- | :--- | :--- |
| **`FinancingCard`** | Affiche le plan de financement, aides (MPR, CEE) et reste à charge. | `FinancingPlan`, `numberOfUnits` | **Prod** |
| **`ValuationCard`** | Révèle la Valeur Verte et le ROI Net. | `ValuationResult` | **Prod** |
| **`ClimateRiskCard`** | Timeline d'interdiction (Loi Climat). | `ComplianceStatus` | **Prod** |
| **`InactionCostCard`** | Compare coût actuel vs futur (Inflation + Perte Valeur). | `InactionCost` | **Prod** |
| **`UrgencyScore`** | Jauge synthétique de l'urgence des travaux. | Score calculé (0-100) | **Prod** |
| **`MprSuspensionAlert`** | Alerte contextuelle si MPR suspendu (Politique). | `RegulationData` | **Prod** |
| **`TransparentReceipt`** | Détail type "Ticket de caisse" des coûts. | `FinancingPlan` | **Prod** |
| **`RiskMap` / `StreetView`** | Contextualisation géographique. | `Coordinates` | **Prod** |
| **`MassAudit`** | Vue "God Mode" pour audit de parc. | `BuildingAuditResult[]` | **Dev/Admin** |

### 2.2 Hiérarchie & Props
*   **Smart Components** (Pages) : Récupèrent la data via les Hooks.
*   **Dumb Components** (Cards) : Reçoivent la data déjà calculée/formatée.
    *   *Pattern* : `Props = { data: SpecificSchema }`. Ex: `FinancingCard` prend `FinancingPlan`.
    *   Pas de fetching de données dans les cartes (sauf `FinancingCard` pour le benchmark via `useEffect` - *Exception à refactoriser pour pureté*).

---

## 3. BUSINESS LOGIC LAYER - Computation Engines

Toute la logique mathématique et réglementaire est isolée dans des **fonctions pures** (`src/lib/calculator.ts`).

### 3.1 Moteur de Calcul (`src/lib/calculator.ts`)
Ce fichier est le coeur du système. Aucune dépendance React.
*   **`generateDiagnostic(input)`** : Fonction maîtresse. Appelle séquentiellement les sous-moteurs.
*   **`simulateFinancing(...)`** :
    *   Applique les taux MPR 2026 (Barèmes Copro).
    *   Gère les plafonds (Celling), les bonus (Sortie Passoire) et les cumuls (Eco-PTZ, CEE).
    *   Calcul complexe des frais annexes (Syndic, DO, Aléas).
*   **`calculateInactionCost(...)`** :
    *   Applique l'inflation BTP composée.
    *   Calcule la "Dérive de Valeur Verte" (Green Value Drift) : perte d'opportunité sur le marché.
*   **`calculateComplianceStatus(...)`** :
    *   Logique temporelle sur les dates butoirs (G: 2025/2028, F: 2028, E: 2034).

### 3.2 Constants & Paramètres (`src/lib/constants.ts`)
*   Configuration centralisée des taux (TVA, Inflation), seuils MPR, et dates clés.
*   Permet une mise à jour facile des paramètres réglementaires sans toucher au code logique.

### 3.3 Transformers & Utils
*   **Validation** : `validateDPEProgression` (Vérifie que Cible > Actuel).
*   **Formatage** : `formatCurrency`, `formatPercent` (Wrappers Intl pour cohérence UI).

---

## 4. ARCHITECTURE & DATA FLOW

### 4.1 Flux de Données (Unidirectional)
```mermaid
graph TD
    User[Utilisateur] -->|Saisie Adresse| Hook[useAddressSearch]
    Hook -->|API EXT| Gouv[API Adresse Gouv]
    Hook -->|DB SELECT| Supabase[Supabase reference_dpe]
    
    User -->|Saisie Formulaire| Form[DiagnosticForm]
    Form -->|Aggregation| Input[DiagnosticInput Object]
    
    Input -->|Process| Engine[Computation Engine (calculator.ts)]
    Engine -->|Use| Constants[Constants 2026]
    Engine -->|Use| Market[Market Data Service]
    
    Engine -->|Output| Result[DiagnosticResult Object]
    
    Result -->|Pass Props| UI[Bento Grid Components]
    UI --> FinancingCard
    UI --> ValuationCard
    UI --> RisksCard
```

### 4.2 Patterns Clés
1.  **Separation of Concerns** :
    *   UI (Components) ne fait AUCUN calcul complexe.
    *   Engine (Lib) ne fait AUCUN rendu UI.
    *   Data (Services) gère l'async et le cache.
2.  **Stateless Computation** :
    *   Le moteur de calcul est déterministe. Pour un même Input, le Result est toujours identique. Facilite les tests unitaires.
3.  **Fallback Strategy** :
    *   Systèmes critiques (Market Data, Address) ont des fallbacks locaux pour garantir la disponibilité même sans réseau/backend.

### 4.3 Points d'Attention (Dette Technique / Risques)
*   **Refactor du Fetching dans `FinancingCard`** : Le composant charge ses propres benchmarks. Devrait être remonté dans le Hook principal ou passé en props pour garder le composant "pur".
*   **Cache Local JSON** : Le fichier `dpe-49.json` est lourd. Stratégie viable pour un département, mais nécessitera une migration full DB pour l'échelle nationale.
