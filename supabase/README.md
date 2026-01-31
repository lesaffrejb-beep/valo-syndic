# Supabase Integration — Valo-Syndic

## Vue d'ensemble

Ce dossier contient les scripts SQL pour intégrer Supabase comme backend de données dynamiques pour Valo-Syndic.

**Objectif :** Remplacer les données statiques (`/src/data/market_data.json`) par des données temps réel mises à jour via Supabase.

## Structure

```
supabase/
├── migrations/
│   └── 001_market_data_tables.sql    # Création des tables
├── scripts/
│   └── update_market_data.sql        # Script de mise à jour mensuelle
└── README.md                          # Ce fichier
```

## Tables créées

| Table | Description |
|-------|-------------|
| `market_data` | Données marché (BT01, tendances, passoires) |
| `regulation_status` | Statut réglementaire (MPR active/suspendue) |
| `local_aids` | Aides locales par collectivité |
| `price_references` | Prix de référence par ville (fallback DVF) |
| `audit_log` | Log des modifications |

## Installation

### 1. Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL et la clé anonyme (anon key)

### 2. Exécuter la migration

1. Dans Supabase Dashboard → SQL Editor
2. Coller le contenu de `migrations/001_market_data_tables.sql`
3. Exécuter

### 3. Configurer l'environnement

Créer/modifier `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### 4. Installer le client Supabase

```bash
npm install @supabase/supabase-js
```

## Mise à jour des données

### Procédure mensuelle

1. Récupérer les nouvelles données sur les sources officielles :
   - **BT01** : [INSEE Série 001710986](https://www.insee.fr/fr/statistiques/serie/001710986)
   - **Tendances marché** : [Notaires de France](https://www.notaires.fr/fr/immobilier-fiscalite/prix-et-tendances-de-limmobilier)

2. Ouvrir `scripts/update_market_data.sql`
3. Modifier les valeurs indiquées par `<-- METTRE À JOUR`
4. Exécuter dans Supabase SQL Editor

### Automatisation (optionnel)

Pour automatiser les mises à jour, vous pouvez :
- Utiliser les Edge Functions Supabase pour scraper les sources
- Créer un cron job externe qui appelle l'API Supabase
- Utiliser un service comme Pipedream ou Zapier

## Sécurité

- **Lecture** : Publique (via RLS policies)
- **Écriture** : Requiert la clé `service_role` (dashboard uniquement)

## Intégration dans le code

### Exemple de client Supabase

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Exemple de lecture des données

```typescript
// src/lib/market-data-supabase.ts
import { supabase } from './supabase'

export async function getMarketDataFromSupabase() {
  const { data, error } = await supabase
    .from('market_data')
    .select('*')

  if (error) {
    console.error('Error fetching market data:', error)
    // Fallback to static JSON
    return null
  }

  return data
}
```

## Fallback

Si Supabase est indisponible, le système utilise automatiquement les données statiques de `/src/data/market_data.json`.

## TODO

- [ ] Créer Edge Function pour mise à jour automatique BT01
- [ ] Ajouter authentification admin pour le dashboard
- [ ] Créer interface admin pour éditer les données
- [ ] Configurer alertes si données > 30 jours

## Contact

Pour toute question sur l'intégration Supabase, contacter l'équipe technique.
