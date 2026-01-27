# 🗄️ Configuration Supabase — VALO-SYNDIC

Guide pas-à-pas pour déployer la base de données.

## Prérequis

- Un compte [Supabase](https://supabase.com) (gratuit)
- Le fichier `supabase/schema.sql` de ce repo

---

## 1. Créer le Projet Supabase

1. Aller sur [app.supabase.com](https://app.supabase.com)
2. Cliquer **"New Project"**
3. Remplir :
   - **Name** : `valo-syndic`
   - **Database Password** : générer un mot de passe fort (le noter !)
   - **Region** : `eu-west-3` (Paris)
4. Cliquer **"Create new project"**
5. Attendre ~2 minutes la création

---

## 2. Exécuter le Schema SQL

1. Dans le dashboard Supabase, aller dans **SQL Editor** (icône code dans la sidebar)
2. Cliquer **"New query"**
3. Copier-coller le contenu de `supabase/schema.sql`
4. Cliquer **"Run"** (ou `Cmd+Enter`)
5. Vérifier : "Success. No rows returned" = OK

---

## 3. Récupérer les Clés API

1. Aller dans **Settings** → **API**
2. Copier :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon public** : clé commençant par `eyJ...`
   - **service_role** (secret) : garder en sécurité, jamais côté client

---

## 4. Configurer l'Application

1. Créer un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. Redémarrer le serveur de développement :

```bash
npm run dev
```

---

## 5. Vérifier l'Installation

Dans le dashboard Supabase :

1. Aller dans **Table Editor**
2. Vérifier la présence des tables :
   - `simulations`
   - `leads`
   - `votes`

---

## Structure des Tables

| Table | Description |
|-------|-------------|
| `simulations` | Stocke les diagnostics flash (JSON) |
| `leads` | Contacts commerciaux (PDF, QR, etc.) |
| `votes` | Votes anonymes en séance AG |

---

## Sécurité (RLS)

Les politiques Row Level Security sont configurées :

- **Simulations** : lecture publique, écriture authentifiée
- **Leads** : écriture publique, lecture admin uniquement
- **Votes** : écriture publique, lecture agrégée via fonction

---

## Prochaines Étapes

1. **Activer l'authentification** : Settings → Auth → Providers
2. **Configurer les emails** : Settings → Auth → Email Templates
3. **Ajouter des alertes** : Monitoring → Alerts

---

## Troubleshooting

### Erreur "permission denied"
→ Vérifier que RLS est bien activé et les policies créées

### Erreur "relation does not exist"
→ Ré-exécuter le schema SQL
