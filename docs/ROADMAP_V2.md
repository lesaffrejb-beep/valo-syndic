# ROADMAP V2 — Valo-Syndic

> **Vision :** Transformer Valo-Syndic en l'outil de référence pour les syndics et copropriétaires.
> Comme Apple vend des produits premium avec une confiance absolue, on vend de la **clarté financière**.

---

## 🎯 PRINCIPES DIRECTEURS

### 1. Véracité Radicale
- **Jamais de mensonge.** Les chiffres sont sourcés, datés, vérifiables.
- **Transparence sur l'incertitude.** "Estimation ±15%" vaut mieux que fausse précision.
- **Mise à jour visible.** L'utilisateur voit quand les données ont été rafraîchies.

### 2. Persuasion par la Preuve (Style Apple B2B)
- **Moins de texte, plus d'impact.** Une stat choc > 10 lignes d'explication.
- **Social proof.** Témoignages syndics, études de cas, logos partenaires.
- **Comparaison évidente.** Inaction vs Action = choix évident visuellement.

### 3. Connexion au Réel
- **APIs temps réel.** DVF, INSEE, BDNB, Géorisques.
- **Données locales.** Prix au m² de la rue, pas de la France.
- **Contexte personnel.** "Votre copro" vs "Une copro moyenne".

---

## 📅 PHASES DE DÉVELOPPEMENT

### PHASE 1 : Fondations Data (2-3 semaines)
**Objectif :** Remplacer les données statiques par des données réelles.

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **API DVF Temps Réel** | Appeler l'API Etalab à chaque simulation | P1 |
| **Géocodage Adresse** | Convertir adresse → coordonnées → code INSEE | P1 |
| **Cache Intelligent** | Stocker les résultats DVF 24h pour perf | P2 |
| **Fallback Gracieux** | Si API down → utiliser données locales + warning | P2 |
| **Supabase Live** | Migrer market_data.json vers Supabase | P2 |

**Livrables :**
- Prix au m² réel basé sur l'adresse exacte
- Nombre de ventes affiché ("Basé sur 47 ventes dans votre quartier")
- Tendance locale (pas nationale)

---

### PHASE 2 : UX Premium "Apple Style" (2-3 semaines)
**Objectif :** Interface qui inspire confiance et action immédiate.

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **Hero Section Immersive** | Street View + Stats superposées | P1 |
| **Animations de Révélation** | Les chiffres apparaissent progressivement | P1 |
| **Comparateur Split-Screen** | Avant/Après en slide horizontal | P1 |
| **Timeline Réglementaire** | Frise chronologique des interdictions | P2 |
| **Micro-interactions** | Hover states, transitions fluides | P2 |

**Focus Subvention Sniper (Ghost Metrics & Effet "Sniper")**
| Tâche | Description | Priorité |
|-------|-------------|----------|
| **Badge de victoire** | Afficher "Projet Éligible MPR" + "Taux sécurisé 55%" en haut | P1 |
| **Reste à charge 0€** | Mettre en avant le "0€ à sortir" (autofinancement total) | P1 |
| **Détail MPR** | Scinder le taux: 30% base + 15% perf + 10% bonus passoire | P1 |
| **Inflation vs PTZ** | Comparer coût attente vs PTZ 0% (inflation BT01) | P1 |
| **Gain mensuel réel** | Confronter mensualité PTZ vs économies énergie | P1 |
| **ROI net immédiat** | Valeur verte - coût travaux (après aides) | P1 |
| **Coût du statu quo** | Remplacer le -47k€ par un "coût de l’attente" (€/an) | P1 |
| **Trésorerie en escalier** | Timeline 3 barres + trésorerie cumulée + besoin FR | P2 |
| **Switch Persona** | Vue Syndic (immeuble) vs Vue Copro (ma poche) | P2 |

**Inspirations :**
- Apple.com (produits financiers comme des iPhones)
- Stripe (clarté des pricing pages)
- Linear (animations subtiles)

**Patterns à implémenter :**
```
┌─────────────────────────────────────────────────────────────────┐
│  [Street View de l'immeuble]                                    │
│                                                                 │
│     ┌─────────────────────┐                                     │
│     │  DPE F → DPE C      │  ← Badge flottant                  │
│     │  +17% de valeur     │                                     │
│     └─────────────────────┘                                     │
│                                                                 │
│  "12 rue Lenepveu, Angers"                                     │
│  Copropriété de 24 lots                                        │
└─────────────────────────────────────────────────────────────────┘

       ↓ Scroll reveal animation

┌─────────────────────────────────────────────────────────────────┐
│  LE CHOIX EST SIMPLE                                           │
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │   NE RIEN FAIRE  │ vs │   RÉNOVER       │                  │
│  │                  │    │                  │                  │
│  │   -127 000 €     │    │   +682 000 €    │                  │
│  │   sur 5 ans      │    │   Valeur Verte  │                  │
│  │                  │    │                  │                  │
│  │   Location       │    │   0€ d'apport   │                  │
│  │   INTERDITE      │    │   35€/mois      │                  │
│  └──────────────────┘    └──────────────────┘                  │
│                                                                 │
│  [Télécharger le Rapport PDF]  [Contacter un Expert]           │
└─────────────────────────────────────────────────────────────────┘
```

---

### PHASE 3 : Crédibilité B2B (2 semaines)
**Objectif :** Rassurer les syndics professionnels et les bailleurs.

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **Section "Méthodologie"** | Page dédiée expliquant les calculs | P1 |
| **Logos Partenaires** | FNAIM, Unis, Notaires (si partenariats) | P1 |
| **Études de Cas** | 3 exemples réels anonymisés | P1 |
| **Témoignages Syndics** | Citations avec photos | P2 |
| **Badge Conformité** | "Calculs conformes Guide ANAH 2026" | P2 |
| **API pour Syndics** | Endpoint pour intégration logiciel syndic | P3 |

**Contenu à produire :**
```markdown
# Étude de Cas : Résidence Les Musiciens (Nantes)
- 32 lots, DPE F → C
- Travaux : 480 000 € HT
- Reste à charge moyen : 0 € (Éco-PTZ)
- Durée : 8 mois de travaux
- Résultat : +18% de valeur, 0 impayé post-travaux
```

---

### PHASE 4 : Outils Avancés (3-4 semaines)
**Objectif :** Devenir indispensable pour le processus de décision.

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **Export PDF Premium** | Rapport brandé, prêt pour AG | P1 |
| **Simulateur de Vote AG** | "Avec 55% d'aides, X% des copros votent OUI" | P2 |
| **Comparateur Multi-Scénarios** | DPE C vs D vs B, side-by-side | P2 |
| **Mode Syndic** | Dashboard multi-copropriétés | P2 |
| **Alertes Email** | "Nouvelle loi votée", "Données mises à jour" | P3 |
| **Widget Intégrable** | iframe pour sites syndics | P3 |

**PDF Premium (inspiration Cabinet Notarial) :**
```
┌─────────────────────────────────────────────────────────────────┐
│  VALO-SYNDIC                                                   │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  DIAGNOSTIC PATRIMONIAL                                        │
│  Résidence [Nom] — [Adresse]                                   │
│                                                                 │
│  Généré le 31 janvier 2026                                     │
│  Référence : VS-2026-XXXXX                                     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  SYNTHÈSE EXÉCUTIVE                                            │
│                                                                 │
│  • Situation actuelle : DPE F — Location INTERDITE depuis 2025 │
│  • Cible recommandée : DPE C — Conforme jusqu'en 2050+         │
│  • Investissement : 0€ d'apport (100% financé)                 │
│  • Plus-value estimée : +17% (+682 000€)                       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  [Graphique : Calendrier Réglementaire]                        │
│  [Graphique : Décomposition Financement]                       │
│  [Tableau : Comparatif par Profil de Revenus]                  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  MENTIONS LÉGALES                                              │
│  Simulation indicative. Ne remplace pas un audit OPQIBI 1905.  │
│  Données : DVF Etalab (2024), INSEE BT01 (11/2025),            │
│  Notaires de France (12/2025), Guide Aides ANAH 2026.          │
└─────────────────────────────────────────────────────────────────┘
```

---

### PHASE 5 : Monétisation & Growth (Ongoing)
**Objectif :** Modèle économique viable.

| Modèle | Description | Cible |
|--------|-------------|-------|
| **Freemium** | 3 simulations/mois gratuites, puis abonnement | Particuliers |
| **SaaS Syndic** | 49€/mois illimité + branding PDF | Syndics |
| **Lead Gen** | Vente de contacts qualifiés aux BET | Partenaires |
| **White Label** | API + Widget pour intégrateurs | Éditeurs logiciels |
| **Formation** | Webinaires "Vendre la rénovation" | Syndics |

---

## 🔌 INTÉGRATIONS API À BRANCHER

### Priorité 1 (Essentielles)

| API | Usage | Endpoint | Coût |
|-----|-------|----------|------|
| **DVF Etalab** | Prix au m² réel | `api.dvf.etalab.gouv.fr` | Gratuit |
| **API Adresse** | Géocodage | `api-adresse.data.gouv.fr` | Gratuit |
| **Google Street View** | Photo immeuble | `maps.googleapis.com` | Payant (quota) |

### Priorité 2 (Enrichissement)

| API | Usage | Endpoint | Coût |
|-----|-------|----------|------|
| **BDNB** | Données bâtiment (année, matériaux) | `data.ademe.fr` | Gratuit |
| **Géorisques** | Risques naturels/industriels | `georisques.gouv.fr` | Gratuit |
| **DPE ADEME** | DPE officiels | `data.ademe.fr/dpe` | Gratuit |
| **INSEE BT01** | Inflation BTP | Scraping ou CERBTP | Gratuit/Payant |

### Priorité 3 (Premium)

| API | Usage | Endpoint | Coût |
|-----|-------|----------|------|
| **Pappers** | Données syndic (KBIS, mandataires) | `pappers.fr` | Payant |
| **Registre Copro** | Immatriculation copro | À vérifier | ? |
| **Notaires DVF+** | Prix avec DPE intégré | Partenariat ? | Payant |

---

## 📊 MÉTRIQUES DE SUCCÈS

### Engagement
- **Taux de complétion** : % utilisateurs qui vont jusqu'au PDF
- **Temps sur page** : >3 min = bon engagement
- **Taux de rebond** : <40% sur la page résultat

### Conversion
- **Téléchargements PDF** : Objectif 100/mois
- **Demandes de contact** : Objectif 20/mois
- **Partages sociaux** : Viralité organique

### B2B
- **Syndics inscrits** : Objectif 10 en 3 mois
- **Simulations par syndic** : >5/mois = utilisateur actif
- **NPS** : >50 = excellent

---

## 🛠 STACK TECHNIQUE RECOMMANDÉE

### Actuel
- Next.js 16 + TypeScript
- Tailwind CSS + Framer Motion
- Zustand (state management)
- Zod (validation)

### À Ajouter
```
npm install @supabase/supabase-js   # BDD temps réel
npm install @react-pdf/renderer     # Génération PDF
npm install react-map-gl            # Carte interactive
npm install @tanstack/react-query   # Cache API
npm install posthog-js              # Analytics
```

### Architecture Cible
```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│  Next.js 16 (App Router) + React Server Components            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                               │
│  Next.js Server Actions + tRPC (optionnel)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   SUPABASE      │  │   APIs EXTERNES │  │   CACHE         │
│   - market_data │  │   - DVF         │  │   - React Query │
│   - local_aids  │  │   - Adresse     │  │   - Redis ?     │
│   - users       │  │   - Street View │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 📝 PROCHAINES ACTIONS IMMÉDIATES

### Cette semaine
1. [ ] Intégrer `MprSuspensionAlert` dans le layout principal
2. [ ] Intégrer `MarketLiquidityAlert` dans la page résultat
3. [ ] Intégrer `TransparentReceipt` à côté de `FinancingCard`
4. [ ] Passer les nouveaux props à `CostValueBalance` et `ValuationCard`

### Semaine prochaine
5. [ ] Implémenter l'appel API DVF en temps réel
6. [ ] Ajouter le géocodage d'adresse (API Adresse)
7. [ ] Créer la page "Méthodologie"
8. [ ] Première étude de cas fictive mais réaliste

### Ce mois-ci
9. [ ] Génération PDF avec @react-pdf/renderer
10. [ ] Supabase en production
11. [ ] Premier syndic beta-testeur

---

## 💡 IDÉES PARKÉES (V3+)

- **IA Générative** : Rédiger automatiquement le texte de convocation AG
- **Marketplace Artisans** : Mettre en relation avec des RGE locaux
- **Scoring Copro** : Note sur 100 de la "santé financière" de la copro
- **Comparateur National** : "Votre copro vs les 1000 copros de votre ville"
- **Mode Dark** : Pour les présentations en AG du soir

---

*Document créé le 31/01/2026 — À mettre à jour mensuellement*
