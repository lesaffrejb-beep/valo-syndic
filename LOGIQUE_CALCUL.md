# Documentation de la Logique de Calcul (VALO-SYNDIC)

Ce document rassemble l'ensemble des constantes, hypothèses et algorithmes utilisés dans le moteur de calcul de l'application VALO-SYNDIC. Il est destiné à être audité par un mathématicien ou un expert métier.

> **Source des données** : Code source de l'application (Dossier `src/lib/`).
> **Date d'extraction** : 27 Janvier 2026 (selon `referenceDate` du code).

---

## 1. Constantes et Paramètres (`src/lib/constants.ts`)

Ces valeurs sont "codées en dur" et servent de base de vérité pour les calculs.

### 1.1 Calendrier d'Interdiction (Loi Climat)
Dates à partir desquelles un logement est considéré comme "indécent" à la location.
*   **G** : Interdit depuis le 01/01/2025
*   **F** : Interdit au 01/01/2028
*   **E** : Interdit au 01/01/2034
*   **D, C, B, A** : Aucune interdiction prévue.

### 1.2 MaPrimeRénov' Copropriété (MPR Copro) - Barème 2026
*   **Condition d'éligibilité** : Gain énergétique minimum de **35%**.
*   **Taux de subvention** :
    *   Gain entre 35% et 50% : **30%** du montant éligible.
    *   Gain ≥ 50% : **45%** du montant éligible.
*   **Plafond d'assiette** : **25 000 € HT** par logement.
    *   *Note : Seuls les lots d'habitation sont comptabilisés pour le plafond global.*
*   **Bonus "Sortie de Passoire"** : **+10%** si le DPE initial est F ou G et le DPE cible est D ou mieux.

### 1.3 Éco-PTZ Copropriété
*   **Taux d'intérêt** : **0%**.
*   **Durée maximale** : **20 ans** (240 mois).
*   **Plafond d'emprunt** : **50 000 €** par logement.

### 1.4 Paramètres Techniques & Économiques
*   **Inflation Travaux (Indice BT01)** : **4.5%** par an.
*   **Coefficient de conversion électricité (DPE)** : **1.9** (Énergie finale -> Énergie primaire).
*   **Appréciation Valeur Verte** (Passage F → C) : **12%**.

### 1.5 Frais Annexes (Honoraires)
Ces frais sont ajoutés au coût des travaux HT pour obtenir le coût total projet.
*   **Honoraires Syndic** : **3%** du coût travaux HT.
*   **Assurance Dommage Ouvrage (DO)** : **2%** du coût travaux HT.
*   **Aléas et Imprévus** : **3%** du coût travaux HT.

---

## 2. Hypothèses et Valeurs par Défaut

Ces valeurs sont utilisées lorsque l'utilisateur ne fournit pas de données spécifiques, ou pour simplifier les estimations.

### 2.1 Estimation Immobilière (`src/lib/calculator.ts`)
*   **Prix de base au m²** : **3 500 €** (Valeur fixe pour Angers/Nantes, à défaut de données temps réel).
*   **Surface moyenne par lot** : **65 m²** (Utilisée si la surface réelle n'est pas renseignée).

### 2.2 Impact du DPE sur la Valeur Vénale
Coefficients d'ajustement appliqués au prix de base (3500 €/m²).
*   **A** : +15%
*   **B** : +10%
*   **C** : +5%
*   **D** : 0% (Référence)
*   **E** : -5%
*   **F** : -10%
*   **G** : -15%

### 2.3 Estimation du Gain Énergétique (`src/lib/schemas.ts`)
Utilisé si une étude thermique réelle n'est pas disponible. Le gain est estimé en fonction du nombre de sauts de classes DPE (ex: E vers C = 2 sauts).
*   **1 saut** : 15% de gain.
*   **2 sauts** : 40% de gain.
*   **3 sauts ou plus** : 55% de gain.
*   *Plafond technique théorique : 70%*.

---

## 3. Algorithmes de Calcul (`src/lib/calculator.ts`)

### 3.1 Coût Total du Projet
$$
\text{Coût Total HT} = \text{Travaux HT} \times (1 + \text{Taux Syndic} + \text{Taux DO} + \text{Taux Aléas})
$$
Avec les taux actuels :
$$
\text{Coût Total HT} = \text{Travaux HT} \times (1 + 0.03 + 0.02 + 0.03) = \text{Travaux HT} \times 1.08
$$

### 3.2 Calcul MaPrimeRénov' (MPR)
1.  **Calcul de l'assiette éligible** :
    $$
    \text{Plafond Global} = (\text{Nombre Lots Totaux} - \text{Lots Commerciaux}) \times 25\,000\,€
    $$
    $$
    \text{Assiette Retenue} = \min(\text{Coût Total HT}, \text{Plafond Global})
    $$
2.  **Détermination du Taux** :
    *   Si Gain < 35% : Taux = 0% (Non éligible).
    *   Si 35% ≤ Gain < 50% : Taux = 30%.
    *   Si Gain ≥ 50% : Taux = 45%.
3.  **Bonus Sortie Passoire** :
    *   Ajouter +10% au taux si (DPE actuel = F ou G) ET (DPE cible ≤ D).
4.  **Montant MPR** :
    $$
    \text{Montant MPR} = \text{Assiette Retenue} \times (\text{Taux Base} + \text{Bonus})
    $$

### 3.3 Calcul Éco-PTZ
L'Éco-PTZ finance le "Reste à Charge" après déduction des subventions, dans la limite d'un plafond.
1.  **Reste à financer** :
    $$
    \text{Reste} = \text{Coût Total HT} - \text{Montant MPR} - \text{Aides Locales}
    $$
2.  **Plafond Éco-PTZ Global** :
    $$
    \text{Plafond Global} = \text{Nombre Lots} \times 50\,000\,€
    $$
3.  **Montant Empruntable** :
    $$
    \text{Montant Éco-PTZ} = \min(\text{Reste}, \text{Plafond Global})
    $$
4.  **Mensualité (pour la copropriété)** :
    $$
    \text{Mensualité} = \frac{\text{Montant Éco-PTZ}}{240 \text{ mois}}
    $$
    *(Taux d'intérêt 0%)*

### 3.4 Coût de l'Inaction (Projection à 3 ans)
1.  **Inflation Travaux** :
    $$
    \text{Coût Projeté} = \text{Coût Actuel} \times (1 + 0.045)^3
    $$
    $$
    \text{Surcoût Inflation} = \text{Coût Projeté} - \text{Coût Actuel}
    $$
2.  **Dépréciation Immobilière (Perte de valeur)** :
    *   Applicable uniquement si DPE actuel est F ou G.
    *   Utilise un paramètre "Green Value Appreciation" (12%) appliqué à la valeur totale du bien.
    *   *Note : La formule dans le code semble utiliser l'inverse de la plus-value verte pour estimer la décote.*
    $$
    \text{Décote} = (\text{Prix m}^2 \times \text{Surface Totale}) \times 0.12
    $$

### 3.5 Valorisation et ROI (Valeur Verte)
1.  **Valeur Actuelle** :
    $$
    \text{Prix m}^2_{\text{Actuel}} = 3500 \times (1 + \text{Impact DPE}_{\text{Actuel}})
    $$
    $$
    \text{Valeur Actuelle} = \text{Surface Totale} \times \text{Prix m}^2_{\text{Actuel}}
    $$
2.  **Valeur Projetée** :
    $$
    \text{Prix m}^2_{\text{Cible}} = 3500 \times (1 + \text{Impact DPE}_{\text{Cible}})
    $$
    $$
    \text{Valeur Projetée} = \text{Surface Totale} \times \text{Prix m}^2_{\text{Cible}}
    $$
3.  **Gain de Valeur Verte** :
    $$
    \text{Gain} = \text{Valeur Projetée} - \text{Valeur Actuelle}
    $$
4.  **ROI Net (Retour sur Investissement)** :
    $$
    \text{ROI} = \text{Gain Valeur Verte} - \text{Reste à Charge Final après toutes aides}
    $$

---

## 4. Règles de Validation (`src/lib/schemas.ts`)

Limites imposées aux entrées utilisateurs pour garantir la cohérence des calculs :
*   **Nombre de lots** : Min 2, Max 500.
*   **Lots commerciaux** : Min 0 (ne peut être négatif).
*   **Coût Travaux HT** : Min 1 000 €, Max 50 000 000 €.
*   **Code Postal** : Doit être composé de 5 chiffres.
