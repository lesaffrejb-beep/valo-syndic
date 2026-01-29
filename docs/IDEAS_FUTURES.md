# VALO-SYNDIC — Idees Creatives & Roadmap V2+

> "Rendre l'outil tellement indispensable que le syndic ne peut plus s'en passer"

---

## Philosophie : L'Assistant qui Met en Valeur

Le piege a eviter : **remplacer le professionnel**.
L'objectif : **amplifier son expertise** et lui faire gagner du temps sur les taches ingrates.

**Le bon positionnement :**
- "L'outil fait le travail de recherche fastidieux"
- "Le professionnel apporte l'analyse et le conseil"
- "Le copropriétaire voit un syndic moderne et efficace"

---

## 1. OSINT & Enrichissement Automatique

### 1.1 Donnees Cadastrales (API Cadastre)

**Source :** `https://api.gouv.fr/les-api/api-carto-cadastre`

**Ce qu'on peut recuperer automatiquement :**
- Parcelle cadastrale
- Surface du terrain
- Nombre de batiments sur la parcelle
- Annee de construction approximative (via croisement DVF)

**Implementation :**
```
Utilisateur entre : "12 rue de la Paix, 49000 Angers"
     |
     v
[API Adresse] → Coordonnees GPS
     |
     v
[API Cadastre] → Parcelle + Surface terrain
     |
     v
Affichage : "Parcelle AB-123 • 850m² • Construit ~1965"
```

**Impact UX :** Le syndic n'a plus a chercher les infos cadastrales manuellement.

---

### 1.2 Annee de Construction (DVF + BDNB)

**Sources :**
- DVF (Demandes de Valeurs Foncieres) : `https://api.gouv.fr/les-api/api-dvf`
- BDNB (Base de Donnees Nationale des Batiments) : `https://www.data.gouv.fr/fr/datasets/base-de-donnees-nationale-des-batiments/`

**Ce qu'on peut deduire :**
- Annee de construction
- Type de batiment (collectif, individuel)
- Nombre d'etages
- Periode de construction → Isolation typique

**Exemple d'enrichissement :**
```
Batiment construit en 1972
     |
     v
"Construction annees 70 : isolation typiquement insuffisante,
simple vitrage probable, chauffage collectif fioul/gaz.
Potentiel de gain energetique : ELEVE"
```

**Impact metier :** L'outil anticipe les problematiques avant meme l'audit.

---

### 1.3 Prix Immobiliers en Temps Reel (DVF)

**Deja prevu en V2** mais voici le detail :

**Requete type :**
```
GET https://api.dvf.etalab.gouv.fr/ventes?code_commune=49007&type_local=Appartement
```

**Enrichissement possible :**
- Prix moyen au m² dans la rue
- Evolution sur 5 ans
- Comparaison DPE A-B vs F-G dans le meme quartier

**Affichage :**
```
┌─────────────────────────────────────────┐
│ 📊 Marche immobilier local              │
│                                         │
│ Prix moyen : 3 450 €/m²                 │
│ DPE A-B : +18% vs moyenne               │
│ DPE F-G : -15% vs moyenne               │
│                                         │
│ Ecart de valeur : 33% !                 │
└─────────────────────────────────────────┘
```

---

### 1.4 Diagnostics Existants (API ADEME)

**Source :** `https://data.ademe.fr/datasets/dpe-v2-logements-existants`

**Possibilite folle :** Entrer le numero ADEME du DPE existant et recuperer :
- Consommation energetique exacte (kWh/m²/an)
- Emissions GES
- Date du diagnostic
- Preconisations du diagnostiqueur

**Implementation :**
```
Utilisateur entre : N° DPE "2349E0123456"
     |
     v
[API ADEME] → Classe energetique + Conso + GES + Date
     |
     v
Pre-remplissage automatique du formulaire
```

**Impact :** Zero saisie manuelle, zero erreur de classe DPE.

---

## 2. Intelligence Contextuelle

### 2.1 Detection Automatique du Type de Copropriete

**Basee sur :**
- Nombre de lots → Petite (<10), Moyenne (10-50), Grande (>50)
- Localisation → Zone tendue ou non
- Annee construction → Patrimoine recent/ancien

**Adaptation automatique :**
- Petite copro : Mise en avant Eco-PTZ individuel + collectif
- Grande copro : Focus sur AMO obligatoire + appels d'offres
- Zone tendue : Alerte sur l'interdiction de location

---

### 2.2 Benchmark Hyperlocal

**Idee :** Comparer la copropriete aux autres du meme quartier.

**Sources :**
- BDNB pour les DPE du quartier
- DVF pour les prix de vente

**Affichage :**
```
┌─────────────────────────────────────────┐
│ 🏘️ Votre quartier (500m)               │
│                                         │
│ • 12 copros analysees                   │
│ • DPE moyen : D                         │
│ • Votre copro : F (dans les 20% pires)  │
│                                         │
│ 💡 3 copros voisines ont vote des       │
│    travaux cette annee                  │
└─────────────────────────────────────────┘
```

**Effet psychologique :** Pression sociale + FOMO.

---

### 2.3 Calendrier Intelligent des AG

**Fonctionnalite :**
- Detecter la periode typique des AG (mars-juin)
- Proposer un retroplanning :
  - J-90 : Lancer l'audit energetique
  - J-60 : Recevoir les devis
  - J-30 : Preparer la convocation
  - J-0 : AG avec vote

**Affichage :**
```
📅 Prochaine AG estimee : Mai 2026
   Temps restant : 4 mois

   Retroplanning suggere :
   [ ] Fevrier : Commander audit OPQIBI
   [ ] Mars : Recevoir 3 devis travaux
   [ ] Avril : Envoyer convocation
   [ ] Mai : Presenter et voter
```

---

## 3. Automatisations "Wow"

### 3.1 Generation Automatique de la Resolution AG

**Actuellement :** Le syndic redige a la main.

**Proposition :** Generer une resolution juridiquement correcte.

**Template :**
```
RESOLUTION N°X — TRAVAUX DE RENOVATION ENERGETIQUE

L'Assemblee Generale, apres avoir pris connaissance :
- Du diagnostic de performance energetique (classe {DPE})
- Du calendrier d'interdiction de location (Loi Climat)
- Du plan de financement propose

DECIDE :
1. D'approuver le programme de travaux d'un montant de {MONTANT} € HT
2. De mandater le syndic pour deposer le dossier MaPrimeRenov' Copro
3. De solliciter un Eco-PTZ collectif aupres de {BANQUE}
4. D'appeler les fonds selon l'echeancier joint

Vote : Majorite article 25 / 25-1
```

**Export :** Word/PDF pret a integrer dans la convocation.

---

### 3.2 Simulateur de Vote Pre-AG

**Idee :** Permettre aux copropriétaires de voter "a blanc" avant l'AG.

**Fonctionnement :**
1. QR Code envoye avec la convocation
2. Chaque copro vote : Pour / Contre / Abstention
3. Resultat anonyme visible par le syndic

**Interet :**
- Anticiper les blocages
- Identifier les opposants pour les convaincre en amont
- Effet d'entrainement ("80% ont deja vote Pour")

---

### 3.3 Comparateur de Devis Intelligent

**Probleme :** Les copros recoivent 3 devis incomparables.

**Solution :** Normaliser les devis.

**Affichage :**
```
┌─────────────────────────────────────────────────────────┐
│ 📋 Comparatif des 3 devis                              │
│                                                         │
│              Entreprise A  Entreprise B  Entreprise C   │
│ ITE (facade)   85 000 €     92 000 €     78 000 €      │
│ Menuiseries    45 000 €     38 000 €     52 000 €      │
│ VMC            12 000 €     15 000 €     11 000 €      │
│ ──────────────────────────────────────────────────────  │
│ TOTAL         142 000 €    145 000 €    141 000 €      │
│                                                         │
│ Garantie         10 ans        5 ans       10 ans      │
│ RGE                 ✅           ✅           ✅       │
│ Dispo demarrage    Mars        Juin        Avril       │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Integrations Externes

### 4.1 Connexion Logiciels Syndic

**Marche cible :** Les gros logiciels de gestion (Thetrawin, Crypto, ICS, etc.)

**API bidirectionnelle :**
- Import : Recuperer la liste des copros + tantièmes
- Export : Envoyer le diagnostic + plan de financement

**Benefice :** Zero ressaisie, donnees a jour.

---

### 4.2 Signature Electronique (Docusign/Yousign)

**Use case :** Faire signer le mandat de depot MaPrimeRenov' en 1 clic.

**Flux :**
1. Generer le mandat pre-rempli
2. Envoyer via Yousign aux membres du CS
3. Recevoir notification de signature
4. Archiver le document signe

---

### 4.3 CRM Integre (Simple)

**Fonctionnalite minimale :**
- Liste des copros avec statut (prospect, en cours, vote, travaux)
- Rappels automatiques ("AG de la copro X dans 30 jours")
- Historique des simulations
 
---

## 5. Gamification & Engagement

### 5.1 Score de Maturite Copro

**Idee :** Noter la "readiness" de la copro a voter.

**Criteres :**
- DPE actuel (plus c'est mauvais, plus c'est urgent)
- Tresorerie existante
- Historique des votes (copro qui vote souvent = plus facile)
- Taux de proprietaires occupants vs bailleurs

**Affichage :**
```
🎯 Score de Maturite : 72/100

✅ Urgence reglementaire : ELEVEE
✅ Tresorerie : SUFFISANTE
⚠️ Historique votes : MITIGE
✅ Profil copros : FAVORABLE

Probabilite de vote favorable : ~65%
```

---

### 5.2 Badges & Certifications

**Pour le syndic :**
- "Expert Loi Climat" : 10 copros accompagnees
- "Chasseur de Passoires" : 5 sorties de classe F/G
- "Financeur Pro" : 1M€ d'aides obtenues

**Affichage sur le profil :**
```
🏆 Jean Dupont — Cabinet Tapissier
   Expert Loi Climat • Chasseur de Passoires
   12 copros accompagnees • 2.3M€ d'aides obtenues
```

---

## 6. IA & Automatisation Avancee

### 6.1 RAG sur Documentation Officielle

**Idee :** Chatbot qui repond aux questions juridiques.

**Sources indexees :**
- Textes de loi (Climat & Resilience)
- Guides ANAH/ADEME
- Jurisprudence copropriete

**Exemple :**
```
Utilisateur : "Peut-on voter les travaux a la majorite simple ?"

Bot : "Non, les travaux de renovation energetique necessitent
la majorite de l'article 25. Cependant, si cette majorite n'est
pas atteinte mais que le projet recueille au moins 1/3 des voix,
un second vote a la majorite de l'article 24 peut etre organise
(passerelle 25-1)."
```

---

### 6.2 Analyse des Objections en AG

**Fonctionnalite :** Reconnaissance vocale pendant l'AG pour detecter les objections.

**Workflow :**
1. Micro capte : "C'est trop cher !"
2. IA detecte l'objection "prix"
3. Affiche automatiquement le contre-argument prepare

**Futuriste mais impressionnant en demo.**

---

## 7. Monetisation & Business Model

### 7.1 Freemium

**Gratuit :**
- 3 simulations/mois
- Export PDF basique
- Pas de branding personnalise

**Pro (29€/mois) :**
- Simulations illimitees
- White-label complet
- Export PPTX + Word
- Integrations API

**Enterprise (sur devis) :**
- Multi-utilisateurs
- CRM integre
- Formation
- Support prioritaire

---

### 7.2 Affiliation

**Partenaires potentiels :**
- Entreprises RGE (commission sur mise en relation)
- Banques (Eco-PTZ)
- Assurances (garantie decennale)

---

## 8. Quick Wins (Implementables en 1 Semaine)

| Feature | Effort | Impact |
|---------|--------|--------|
| Auto-completion adresse (API Adresse) | 2h | Eleve |
| Lien direct vers France Renov' local | 1h | Moyen |
| Export CSV des tantièmes | 2h | Moyen |
| Mode impression optimise | 3h | Eleve |
| Raccourcis clavier (Ctrl+S sauvegarde) | 1h | Faible |
| Dark mode toggle (deja la, juste exposer) | 1h | Faible |

---

## Resume : Les 5 Features qui Changent Tout

1. **Auto-remplissage cadastral** → "Il connait deja mon immeuble !"
2. **Benchmark quartier** → "On est les derniers a ne rien faire"
3. **Resolution AG pre-ecrite** → "Je n'ai plus qu'a copier-coller"
4. **Simulateur de vote pre-AG** → "Je sais deja si ca va passer"
5. **Chatbot juridique** → "Il repond a toutes les questions techniques"

---

## Conclusion

L'objectif n'est pas de creer un outil qui remplace le syndic,
mais un **assistant qui le rend indispensable aux yeux des copropriétaires**.

> "Ce syndic a des outils que les autres n'ont pas.
> Il nous fait gagner du temps et de l'argent.
> On ne veut pas en changer."

---

*Document genere le 29/01/2026*
*VALO-SYNDIC — Roadmap V2+*
