# Guide d'Intégration - Sprint "Data Reveal"

## Vue d'ensemble

Ce sprint améliore le moteur de recherche et révèle les "données dormantes" dans le dashboard via 6 nouveaux composants et 1 hook de recherche avancé.

## 📁 Nouveaux Fichiers Créés

### 1. Hook de Recherche
- **`src/hooks/useAddressSearch.ts`**
  - Recherche d'adresse via API Adresse Gouv
  - Normalisation automatique des adresses
  - Enrichissement avec données DPE depuis Supabase

### 2. Composants Dashboard
- **`src/components/dashboard/GESBadge.tsx`** - Affichage étiquette carbone (GES)
- **`src/components/dashboard/LegalCountdown.tsx`** - Compte à rebours interdiction location
- **`src/components/dashboard/FinancialProjection.tsx`** - Reste à charge mensuel par lot
- **`src/components/dashboard/HeatingSystemAlert.tsx`** - Alerte énergies fossiles + Primes CEE
- **`src/components/dashboard/DPEDistributionChart.tsx`** - Benchmark quartier (Social Proof)

### 3. Vue SQL Supabase
- **`supabase/analytics_dpe_distribution.sql`**
  - Vue matérialisée pour statistiques DPE par code postal
  - Utilisée par DPEDistributionChart

---

## 🔧 Installation & Configuration

### Étape 1 : Déployer la Vue SQL

Exécutez le script SQL sur votre instance Supabase :

```bash
psql -h your-project.supabase.co -U postgres -d postgres -f supabase/analytics_dpe_distribution.sql
```

Ou via le Dashboard Supabase : SQL Editor → Paste & Run

### Étape 2 : Vérifier les Variables d'Environnement

Assurez-vous que `.env.local` contient :

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 💻 Utilisation

### 1. Recherche d'Adresse Améliorée

Remplacez l'ancien système de recherche par le nouveau hook :

```tsx
import { useAddressSearch } from "@/hooks/useAddressSearch";

function SearchComponent() {
  const {
    inputValue,
    suggestions,
    isSearching,
    selectedResult,
    handleInputChange,
    selectAddress,
  } = useAddressSearch();

  return (
    <div>
      <input
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder="Entrez une adresse..."
      />

      {suggestions.map((suggestion) => (
        <div key={suggestion.properties.id} onClick={() => selectAddress(suggestion)}>
          {suggestion.properties.label}
        </div>
      ))}

      {selectedResult && (
        <div>
          <p>Adresse normalisée : {selectedResult.normalizedAddress}</p>
          <p>Code postal : {selectedResult.postalCode}</p>
          {selectedResult.hasDPEData && (
            <p>DPE trouvé : {selectedResult.dpeData?.etiquette_dpe}</p>
          )}
        </div>
      )}
    </div>
  );
}
```

### 2. Afficher les Nouveaux Composants Dashboard

#### A. Badge GES (Le Carbone Oublié)

```tsx
import { GESBadge } from "@/components/dashboard/GESBadge";

<GESBadge
  gesLetter="F"
  showDetails={true}
  className="col-span-1"
/>
```

#### B. Compte à Rebours Légal

```tsx
import { LegalCountdown } from "@/components/dashboard/LegalCountdown";

<LegalCountdown
  currentDPE="G"
  className="col-span-1"
/>
```

#### C. Projection Financière Mensuelle

```tsx
import { FinancialProjection } from "@/components/dashboard/FinancialProjection";

<FinancialProjection
  totalCost={250000}        // Coût total travaux (€)
  totalAids={112500}        // Total aides (€)
  numberOfUnits={20}        // Nombre de lots
  showDetails={true}
  className="col-span-2"
/>
```

#### D. Alerte Système de Chauffage

```tsx
import { HeatingSystemAlert } from "@/components/dashboard/HeatingSystemAlert";

<HeatingSystemAlert
  heatingType="fioul"  // ou "gaz", "electric", "wood", "heat_pump"
  className="col-span-1"
/>
```

#### E. Distribution DPE du Quartier (Social Proof)

```tsx
import { DPEDistributionChart } from "@/components/dashboard/DPEDistributionChart";

<DPEDistributionChart
  currentDPE="F"
  postalCode="49000"
  city="Angers"
  className="col-span-2"
/>
```

### 3. Exemple de Layout Dashboard Complet

```tsx
"use client";

import { GESBadge } from "@/components/dashboard/GESBadge";
import { LegalCountdown } from "@/components/dashboard/LegalCountdown";
import { FinancialProjection } from "@/components/dashboard/FinancialProjection";
import { HeatingSystemAlert } from "@/components/dashboard/HeatingSystemAlert";
import { DPEDistributionChart } from "@/components/dashboard/DPEDistributionChart";

export default function EnhancedDashboard() {
  // Données exemple (à remplacer par vos données réelles)
  const dpeData = {
    currentDPE: "F",
    gesLetter: "F",
    postalCode: "49000",
    city: "Angers",
    heatingType: "gaz",
    totalCost: 250000,
    totalAids: 112500,
    numberOfUnits: 20,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {/* Ligne 1 : Performance Énergétique */}
      <GESBadge
        gesLetter={dpeData.gesLetter}
        className="lg:col-span-1"
      />

      <HeatingSystemAlert
        heatingType={dpeData.heatingType}
        className="lg:col-span-1"
      />

      <LegalCountdown
        currentDPE={dpeData.currentDPE}
        className="lg:col-span-1"
      />

      {/* Ligne 2 : Finances & Benchmark */}
      <FinancialProjection
        totalCost={dpeData.totalCost}
        totalAids={dpeData.totalAids}
        numberOfUnits={dpeData.numberOfUnits}
        className="lg:col-span-2"
      />

      <DPEDistributionChart
        currentDPE={dpeData.currentDPE}
        postalCode={dpeData.postalCode}
        city={dpeData.city}
        className="lg:col-span-3"
      />
    </div>
  );
}
```

---

## 🎯 Mapping des Données

### Depuis `reference_dpe` (Supabase)

| Champ Supabase | Composant | Prop |
|----------------|-----------|------|
| `etiquette_dpe` | `LegalCountdown`, `DPEDistributionChart` | `currentDPE` |
| `etiquette_ges` | `GESBadge` | `gesLetter` |
| `code_postal` | `DPEDistributionChart` | `postalCode` |
| `ville` | `DPEDistributionChart` | `city` |

### Depuis Vos Calculs

| Donnée | Composant | Prop |
|--------|-----------|------|
| Coût total travaux | `FinancialProjection` | `totalCost` |
| Total aides | `FinancialProjection` | `totalAids` |
| Nombre de lots | `FinancialProjection` | `numberOfUnits` |
| Type chauffage | `HeatingSystemAlert` | `heatingType` |

---

## 🔄 Logique de Branchement

### Flow Complet de Recherche

```
1. Utilisateur tape adresse
   ↓
2. useAddressSearch → API Gouv (autocomplete)
   ↓
3. Sélection → Normalisation adresse
   ↓
4. Recherche Supabase reference_dpe (ilike sur ville/code postal)
   ↓
5a. DPE trouvé → Hydrate dashboard avec vraies données
5b. DPE non trouvé → Fallback simulation (statistiques ville)
```

### Coordonnées GPS → Géo-Risques

Les coordonnées GPS sont disponibles dans `selectedResult.coordinates` :

```tsx
const { selectedResult } = useAddressSearch();

if (selectedResult?.coordinates) {
  const { longitude, latitude } = selectedResult.coordinates;

  // Appel API Géo-Risques
  const geoRisksUrl = `https://georisques.gouv.fr/api/v1/gaspar/risques?latlon=${latitude},${longitude}&rayon=1000`;

  // ... votre logique
}
```

---

## 🧪 Tests

### Test 1 : Recherche d'Adresse

```bash
# Ouvrir la page avec le composant de recherche
# Taper "12 rue des Lices Angers"
# Vérifier que l'autocomplete affiche des suggestions API Gouv
# Cliquer sur une suggestion
# Vérifier que selectedResult contient :
# - normalizedAddress
# - postalCode
# - coordinates
# - dpeData (si trouvé dans Supabase)
```

### Test 2 : Affichage Dashboard

```bash
# Créer une page de test avec tous les composants
# Vérifier l'affichage de :
# - Badge GES avec couleur violette
# - Compte à rebours avec jours restants
# - Projection financière avec montant mensuel
# - Alerte chauffage si fioul/gaz
# - Distribution DPE avec graphique en barres
```

---

## 📊 Performance

### Vue Matérialisée

La vue `analytics_dpe_distribution` est **matérialisée** (pré-calculée).

**Rafraîchissement manuel :**

```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_dpe_distribution;
```

**Automatisation (optionnel) :**

Créez un cron job dans Supabase :

```sql
-- Dans pg_cron extension
SELECT cron.schedule(
  'refresh-analytics-dpe',
  '0 3 * * *',  -- Tous les jours à 3h du matin
  'SELECT refresh_analytics_dpe_distribution();'
);
```

---

## 🐛 Troubleshooting

### Erreur : "Table analytics_dpe_distribution does not exist"

→ Exécutez le script SQL `supabase/analytics_dpe_distribution.sql`

### Erreur : "No data returned from DPEDistributionChart"

→ Vérifiez que la table `reference_dpe` contient des données pour le code postal
→ Exécutez `REFRESH MATERIALIZED VIEW analytics_dpe_distribution;`

### Erreur : "API Gouv search failed: 429"

→ Rate limit atteint. Implémentez un cache local ou réduisez la fréquence des requêtes.

---

## 📚 Ressources

- **API Adresse Gouv** : https://adresse.data.gouv.fr/api-doc/adresse
- **API Géo-Risques** : https://georisques.gouv.fr/doc-api
- **Supabase Views** : https://supabase.com/docs/guides/database/views

---

## ✅ Checklist Déploiement

- [ ] SQL : Vue `analytics_dpe_distribution` créée
- [ ] SQL : Première exécution `REFRESH MATERIALIZED VIEW`
- [ ] ENV : Variables `NEXT_PUBLIC_SUPABASE_*` configurées
- [ ] Code : Hook `useAddressSearch` importé
- [ ] Code : Composants dashboard intégrés
- [ ] Test : Recherche adresse fonctionne
- [ ] Test : Données DPE affichées
- [ ] Test : Distribution quartier affiche graphique
- [ ] Prod : Cron job rafraîchissement vue (optionnel)

---

**Date de création** : 2026-01-30
**Auteur** : Claude Code
**Version** : 1.0.0
