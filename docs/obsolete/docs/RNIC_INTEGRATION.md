# RNIC - Intégration du Registre National des Copropriétés

## 🎯 Objectif

Récupérer automatiquement les données des copropriétés (nombre de lots, syndic, etc.) à partir d'une adresse pour éviter la saisie manuelle.

## 📊 Contexte: Pourquoi c'est complexe ?

Le RNIC (Registre National des Copropriétés) est géré par la DGCCRF. Les données existent mais **ne sont pas facilement accessibles** :

### Problèmes identifiés

1. **Pas d'API ouverte** : Le RNIC n'a pas d'API REST publique et gratuite
2. **Données volumineuses** : Le CSV complet fait plusieurs centaines de Mo
3. **Pas de géocodage** : Les adresses ne sont pas toujours normalisées
4. **Mise à jour** : Les données sont mises à jour annuellement

### Source de données

- **Data.gouv.fr** : [Registre National des Copropriétés](https://www.data.gouv.fr/fr/datasets/registre-national-des-coproprietes/)
- **Format** : CSV (annuel)
- **Licence** : Ouverte (Etalab)

## 🔧 Solution implémentée

### Architecture hybride

```
┌─────────────────────────────────────────────────────────────┐
│                    RECHERCHE RNIC                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. SUPABASE (Prioritaire)                                  │
│     └── Table coproperty_data                               │
│     └── Recherche fuzzy sur l'adresse                       │
│     └── Données importées du CSV RNIC                       │
│                                                             │
│  2. API SIRENE (Fallback)                                   │
│     └── Recherche des syndics par code NAF                  │
│     └── Suggère le syndic si pas de données RNIC            │
│                                                             │
│  3. SAISIE MANUELLE (Fallback final)                        │
│     └── Conservé pour garantir l'UX                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Score de Connectivité: 0 → 0.5

- **Avant** : 0% (saisie manuelle obligatoire)
- **Après** : 50% (Supabase + suggestion syndics)
- **Pour passer à 100%** : Importer le CSV RNIC dans Supabase

## 🚀 Mise en place

### Étape 1: Créer la table (déjà fait)

```bash
# La migration SQL est créée:
supabase/migrations/003_coproperty_data.sql
```

### Étape 2: Importer les données RNIC

#### Option A: Import complet (recommandé pour production)

1. Télécharger le CSV depuis [data.gouv.fr](https://www.data.gouv.fr/fr/datasets/registre-national-des-coproprietes/)
2. Nettoyer et importer dans Supabase :

```python
# Script Python d'import (à créer dans scripts/import_rnic.py)
import pandas as pd
from supabase import create_client

# Configuration
supabase_url = "https://xxxxx.supabase.co"
supabase_key = "your-service-role-key"  # Nécessite la clé service_role
supabase = create_client(supabase_url, supabase_key)

# Lire le CSV RNIC
df = pd.read_csv('rnic.csv', sep=';')

# Mapper les colonnes
# ... (voir documentation RNIC pour le mapping exact)

# Insérer par batch
batch_size = 1000
for i in range(0, len(df), batch_size):
    batch = df.iloc[i:i+batch_size].to_dict('records')
    supabase.table('coproperty_data').insert(batch).execute()
```

#### Option B: Import par département (pour test)

```python
# Filtrer sur un département (ex: 49 - Maine-et-Loire)
df_filtered = df[df['code_postal'].str.startswith('49')]
```

#### Option C: Saisie manuelle progressive

Pour les copropriétés importantes, saisir manuellement dans Supabase :

```sql
INSERT INTO coproperty_data (
    address, postal_code, city, city_code,
    name, number_of_units, syndic_name, is_verified
) VALUES (
    '25 Rue des Lices', '49100', 'Angers', '49007',
    'Résidence Les Lices', 45, 'Citya Immobilier', true
);
```

### Étape 3: Activer l'extension pg_trgm (pour recherche fuzzy)

```sql
-- Nécessaire pour la recherche par similarité
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### Étape 4: Vérifier l'intégration

```typescript
import { useRNIC } from "@/hooks/useRNIC";

function MyComponent() {
  const { enrich, coproperty, isLoading } = useRNIC();
  
  useEffect(() => {
    enrich("25 Rue des Lices, Angers", { cityCode: "49007" });
  }, []);
  
  if (coproperty) {
    console.log(`Lots: ${coproperty.numberOfUnits}`);
    console.log(`Syndic: ${coproperty.syndicName}`);
  }
}
```

## 📈 Prochaines améliorations

### Court terme (Semaine 3)

1. **Importer le CSV du département 49** (Maine-et-Loire)
   - ~20 000 copropriétés
   - Permettra de couvrir la zone cible initiale

2. **Script d'import automatique**
   - Créer un script Python réutilisable
   - Documenter le processus

### Moyen terme

1. **API Entreprise**
   - Faire une demande d'habilitation
   - Permettrait d'enrichir avec les données SIRET des syndics

2. **Géocodage automatique**
   - Utiliser l'API Adresse pour géocoder les adresses RNIC
   - Permettrait la recherche par proximité

3. **Synchronisation annuelle**
   - Script pour mettre à jour les données chaque année
   - Détection des nouvelles copropriétés

## 🔗 API alternatives explorées

### API Entreprise
- **Status** : Nécessite habilitation
- **Avantage** : Données officielles SIRET
- **Inconvénient** : Processus d'habilitation long

### API Sirene (INSEE)
- **Status** : Clé API gratuite
- **Avantage** : Recherche des syndics par NAF
- **Inconvénient** : Ne donne pas les données de copropriété

### API BAN (Base Adresse Nationale)
- **Status** : Déjà intégrée
- **Avantage** : Normalisation des adresses
- **Inconvénient** : Ne donne pas les données de copropriété

## 📊 Métriques de succès

| Métrique | Avant | Objectif | Comment mesurer |
|----------|-------|----------|-----------------|
| Taux de remplissage auto | 0% | 70% | % de recherches avec résultat |
| Temps de saisie | 5 min | 30 sec | Temps moyen par copropriété |
| Précision | - | 90% | % de données vérifiées correctes |

## 🛠️ Maintenance

### Rituel mensuel

1. Vérifier si une nouvelle version du RNIC est disponible
2. Mettre à jour les données si nécessaire
3. Vérifier les erreurs de logs

### Rituel annuel

1. Télécharger la nouvelle version du CSV RNIC
2. Lancer le script d'import
3. Vérifier la qualité des données

## 📚 Ressources

- [Documentation RNIC - DGCCRF](https://www.economie.gouv.fr/dgccrf/registre-national-coproprietes)
- [Fichier sur data.gouv.fr](https://www.data.gouv.fr/fr/datasets/registre-national-des-coproprietes/)
- [Format des données RNIC](https://www.data.gouv.fr/fr/datasets/r/xxxx/document-descriptif.pdf)
