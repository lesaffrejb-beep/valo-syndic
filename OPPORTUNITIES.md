# 💡 OPPORTUNITIES.md — Analyse CTO

Voici mon analyse en tant que Lead Dev / CTO sur ce projet.

---

## 🔴 Failles & Risques Identifiés

### 1. Risque Juridique : Précision des Calculs

**Problème** : Le gain énergétique est estimé à 15% par saut de classe DPE. C'est une approximation.

**Impact** : Si un syndic se base sur ces chiffres pour voter des travaux et que l'estimation était trop optimiste, il pourrait y avoir contestation.

**Recommandation** :
- Ajouter un champ optionnel "Gain énergétique réel (%)" si l'utilisateur dispose d'un audit thermique
- Renforcer le disclaimer : "Estimation indicative basée sur des moyennes nationales"

### 2. Risque Juridique : Terme "Diagnostic"

**Problème** : Même en évitant "Audit", le terme "Diagnostic Flash" pourrait être contesté par des diagnostiqueurs certifiés.

**Recommandation** : Envisager "Évaluation Rapide" ou "Simulation Personnalisée" pour éviter toute confusion.

### 3. Risque Technique : Données Obsolètes

**Problème** : Les taux MPR et seuils sont codés en dur dans `constants.ts`. Si les règles changent (fréquent dans ce domaine), l'outil devient inexact.

**Recommandation** : 
- Implémenter la V2 avec Supabase rapidement
- Ajouter une date de péremption visible : "Données valides jusqu'au 31/12/2026"

---

## 💡 Idées Métier — Ce Qui Manque Pour Signer

### 1. 🔑 Simulateur "Reste à Charge par Tantième"

**Concept** : Permettre à chaque copropriétaire de voir SA quote-part personnalisée.

**Input additionnels** :
- Nombre de tantièmes du lot
- Total des tantièmes de la copro

**Output** :
- "Votre quote-part : 127/10000 → Reste à charge : 1 850€"

**Impact Commercial** : Le syndic pourra envoyer un mail personnalisé à chaque copropriétaire avec SON montant. Effet "wow" garanti.

### 2. 📱 QR Code sur le PDF

**Concept** : Générer un QR Code unique dans le PDF qui renvoie vers une page de vote en ligne.

**Usage AG** :
1. Le syndic projette le rapport
2. Les copropriétaires scannent le QR
3. Vote en temps réel (pour/contre/abstention)
4. Résultat affiché instantanément

**Stack suggérée** : QR via `qrcode` npm + page Next.js `/vote/[id]`

### 3. 📊 Benchmark Régional

**Concept** : Comparer le bien aux moyennes régionales.

"Votre copropriété est 23% plus énergivore que la moyenne des biens de votre département."

**Source** : Données ADEME / DPE ouvertes

### 4. 🎯 Mode "Avocat du Diable"

**Concept** : Anticiper les objections classiques en AG et fournir des contre-arguments.

Exemple :
- **Objection** : "C'est trop cher"
- **Contre-argument** : "Le coût de l'inaction sur 3 ans dépasse le reste à charge"

### 5. 📈 Historique des Simulations

**Concept** : Permettre de sauvegarder et comparer plusieurs scénarios.

"Scénario A : Travaux complets 300k€ → DPE C"
"Scénario B : Travaux partiels 150k€ → DPE D"

---

## 🍎 Low Hanging Fruits (Déjà Codés)

| Fonctionnalité | Status | Impact |
|----------------|--------|--------|
| Score d'Urgence animé | ✅ Codé | Anxiété = Action |
| Courbe de la Peur inflation | ✅ Codé | Visualisation = Compréhension |
| Argumentaire AG pré-calibré | ✅ Codé | Gain de temps syndic |
| Jauges DPE animées | ✅ Codé | Effet premium |

---

## 🚀 Quick Wins Non Codés (< 2h de dev)

### 1. Export JSON des résultats
Permettre de re-importer une simulation. Simple `JSON.stringify()` + download.

### 2. Dark Mode
Toggle dark/light. Déjà préparé avec les classes Tailwind.

### 3. Print CSS optimisé
`@media print { ... }` pour imprimer directement depuis le navigateur.

### 4. PWA basique
`manifest.json` + service worker = installable sur mobile.

---

## 🤔 Questions Stratégiques Pour Vous

1. **Monétisation** : Freemium (3 simulations gratuites) ou abonnement mensuel ?

2. **Marque Blanche** : Les syndics voudraient-ils leur propre logo sur le PDF ?

3. **Certification** : Faut-il viser une labellisation (ex: French Tech) pour la crédibilité ?

4. **Partenariats** : Intérêt à s'associer avec des opérateurs MPR (SOLIHA, etc.) ?

---

## 📊 Métriques Suggérées à Tracker

| Métrique | Pourquoi |
|----------|----------|
| Nombre de simulations | Volume d'usage |
| Taux de téléchargement PDF | Conversion |
| DPE moyen en entrée | Profil utilisateurs |
| Coût moyen simulé | Taille des projets |

---

*Document généré par Claude — CTO Mode — 27/01/2026*
