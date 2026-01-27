# 🧬 PROJECT DNA — VALO-SYNDIC

> *Le manuel de référence pour comprendre, utiliser et faire évoluer l'outil.*

---

## 1. La Vision "Cheval de Troie"

**But :** Infiltrer les copros par la compétence technique pour vendre du syndic.

**Philosophie :**
```
Rigueur Juridique (Loi Climat 2026) + UI Sexy (Fintech/Néo-Banque)
```

**Cible :** Angers (Anjou), copropriétaires bloqués par la peur des montants.

### Le Problème Initial

Les Assemblées Générales de copropriété sont systématiquement bloquées par deux obstacles :

1. **La peur des gros chiffres** : "300 000€ ?! Jamais !" — Réaction viscérale avant toute analyse.
2. **L'outil Excel** : Tableaux complexes, moches, incompréhensibles. Aucun pouvoir de persuasion.

### L'Objectif

> *"Le PDF n'est pas le livrable. Le vote favorable est le livrable."*

---

## 2. Les "Killer Features" (Pourquoi on a codé ça ?)

| Feature | Problème résolu | Impact |
|---------|-----------------|--------|
| 🧮 **Calculateur Tantièmes** | "300k€ c'est trop cher" | Individualiser → "87€/mois pour VOUS" |
| 📊 **Benchmark Régional** | "Notre immeuble n'est pas si mal" | Pression sociale → "Vos voisins font mieux" |
| ⚔️ **Avocat du Diable** | Objections qui tuent le débat | Désarmer AVANT qu'on les pose |
| 📱 **QR Code Vote** | AG passive, gens sur téléphone | Engagement actif + effet "Moderne" |
| 📄 **PDF 3 pages** | Supporter papier pour AG | Crédibilité + traçabilité |

---

## 3. Stack & Maintenance

### Stack Technique 2026

| Couche | Tech | Usage |
|--------|------|-------|
| **Framework** | Next.js 14 (App Router) | SSG + Client Components |
| **Styling** | Tailwind CSS | Design System tokens |
| **Animations** | Framer Motion | UI Premium "Néo-Banque" |
| **Charts** | Recharts | Visualisations interactives |
| **PDF** | @react-pdf/renderer | Export AG |
| **Validation** | Zod | Data integrity |
| **Deploy** | Vercel | Edge-optimized |

### Architecture Données

- **Constantes 2026 :** Hardcodées dans `src/lib/constants.ts`
  - Taux MaPrimeRénov' Copro
  - Plafonds Éco-PTZ
  - Dates Loi Climat
  
- **Upgrade Path :** Prêt pour Supabase (voir `docs/DATABASE_SETUP.md`)

### Principes de Code

1. **Client-side first** : Pas de DB requise pour MVP (zéro latence)
2. **Fonctions pures** : Calculateur sans état ni effets
3. **Tokens Design System** : Aucune valeur hardcodée
4. **Animations fluides** : Framer Motion, courbes Bézier organiques

---

## 4. Guide d'Usage — Maximum Impact

### ❌ Comment NE PAS Utiliser

- Envoyer le PDF par email avant l'AG
- Laisser les gens lire seuls à la maison
- Discuter des chiffres globaux sans individualisation

### ✅ Comment L'Utiliser

1. **Projeter en séance** : L'effet "wow" visuel capte l'attention
2. **Faire scanner le QR Code en direct** : Engagement immédiat
3. **Jouer le calculateur live** : "Entrez VOS tantièmes..."
4. **Utiliser l'Avocat du Diable** : Anticiper les objections

### L'Argumentaire Central

> *"Le coût de l'inaction (inflation BTP + perte valeur verte + interdiction location) est supérieur au coût du crédit Éco-PTZ à 0%."*

C'est un **investissement patrimonial**, pas une dépense.

---

## 5. Roadmap

### ✅ V1.0 — MVP
- Diagnostic Flash fonctionnel
- Calculs réglementaires 2026

### ✅ V1.5 — Weaponized (Actuel)
- 5 Killer Features
- Export PDF + JSON
- Animations Premium (Framer Motion)

### 🔜 V2.0 — Connecté
- Authentification Supabase
- Historique des simulations
- Résultats votes temps réel

### 🔮 V3.0 — Intelligent
- RAG sur documentation Loi Climat
- Intégration DVF (prix immobilier)

---

## 6. Mantras

> *"Ne pas convaincre par la logique, mais par l'émotion... puis valider par les chiffres."*

> *"Excel est mort. Vive le diagnostic premium."*

---

**Dernière mise à jour** : 27 janvier 2026  
**Mainteneur** : @lesaffrejb-beep
