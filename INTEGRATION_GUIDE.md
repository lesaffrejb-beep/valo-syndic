# GUIDE D'INTÉGRATION - DATA REVEAL MODULE

Ce module ré-implémente les fonctionnalités de recherche d'adresse et d'affichage des données DPE de manière isolée et sécurisée.

## 📁 FICHIERS CRÉÉS

### 1. Backend & Logic (Priorité)
*   `src/sql/analytics_dpe_distribution.sql` : Vues SQL pour les statistiques (à exécuter dans Supabase).
*   `src/hooks/useAddressSearch.ts` : Hook React pour la recherche hybride (API Gouv + Supabase).

### 2. Composants Dashboard (Isolés)
*   `src/components/dashboard/GESBadge.tsx` : Badge stylisé pour l'étiquette GES.
*   `src/components/dashboard/LegalCountdown.tsx` : Compte à rebours avant interdiction de location (Loi Climat).
*   `src/components/dashboard/FinancialProjection.tsx` : Projection des coûts énergétiques sur 10 ans.

---

## 🚀 INSTRUCTIONS D'INSTALLATION

### Étape 1 : Base de Données
Ouvrez votre tableau de bord Supabase -> SQL Editor.
Copiez et exécutez le contenu de `src/sql/analytics_dpe_distribution.sql`.
Cela créera les vues nécessaires pour les analyses futures.

### Étape 2 : Intégration du Hook de Recherche
Utilisez le hook `useAddressSearch` dans votre composant de recherche (ex: une barre de recherche isolée).

```typescript
import { useAddressSearch } from '@/hooks/useAddressSearch';

export function MonMoteurRecherche() {
  const { query, setQuery, results, isLoading } = useAddressSearch();

  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
        placeholder="Rechercher une adresse..." 
      />
      
      {isLoading && <div>Chargement...</div>}
      
      <ul>
        {results.map(result => (
          <li key={result.id}>
            {result.address} 
            {result.source === 'dpe_db' && <span className="badge">DPE DISPONIBLE</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Étape 3 : Affichage des Données DPE
Une fois un résultat sélectionné (vérifiez `result.dpe`), vous pouvez afficher les composants du dashboard.

```typescript
import { GESBadge } from '@/components/dashboard/GESBadge';
import { LegalCountdown } from '@/components/dashboard/LegalCountdown';
import { FinancialProjection } from '@/components/dashboard/FinancialProjection';

// ... dans votre render
{selectedResult.dpe && (
  <>
    <GESBadge gesLetter={selectedResult.dpe.etiquette_ges} />
    <LegalCountdown dpeLetter={selectedResult.dpe.etiquette_dpe} />
    <FinancialProjection dpeData={selectedResult.dpe} />
  </>
)}
```

## ⚠️ SÉCURITÉ & ISOLATION
Aucun fichier existant (`page.tsx`, `Navbar.tsx`, CSS global) n'a été modifié.
Ce module est "add-only". Vous pouvez l'importer et l'utiliser sans risque de casser l'existant.
