# VALO-SYNDIC — BLOCKERS.MD
> Fichier de suivi des blocages techniques ou juridiques rencontrés.
> Format : `[TYPE: JURIDIQUE/TECH] - Description - Recommandation`

---

## 🔴 BLOCAGE CRITIQUE

### [TECH] — Nom de dossier incompatible avec Next.js
- **Description** : Le dossier `OUTIL?` contient le caractère `?` qui est un caractère réservé URL/filesystem.
- **Impact** : Next.js/webpack ne peut pas résoudre correctement les chemins, causant des erreurs `ENOENT` et `Module not found`.
- **Solution** : Renommer le dossier parent en enlevant le `?` :
  ```bash
  mv "/Users/jb/Documents/01_Gestionnaire de copro/OUTIL?" "/Users/jb/Documents/01_Gestionnaire de copro/valo-syndic"
  cd "/Users/jb/Documents/01_Gestionnaire de copro/valo-syndic"
  rm -rf node_modules .next
  npm install
  npm run dev
  ```

---

## 📋 Points de Vigilance (Non-Bloquants)

### [INFO: TECH] — Génération PDF non implémentée
- **Description** : Le bouton "Télécharger le rapport AG" affiche une alerte placeholder.
- **Impact** : Fonctionnalité manquante pour la Phase 3.
- **Recommandation** : Implémenter avec `@react-pdf/renderer` (déjà dans les dépendances).

### [INFO: JURIDIQUE] — Mot "Audit" évité
- **Description** : Conformément aux directives, tous les termes "Audit" ont été remplacés par "Diagnostic Flash" ou "Évaluation Préliminaire".
- **Impact** : Aucun — compliance OK.
- **Recommandation** : Maintenir cette nomenclature dans toutes les futures itérations.

### [INFO: TECH] — API DVF non intégrée
- **Description** : Les données DVF (valeurs foncières) ne sont pas récupérées automatiquement.
- **Impact** : L'utilisateur doit saisir manuellement le prix au m².
- **Recommandation** : Intégrer l'API DVF (gratuite) pour pré-remplir les valeurs.

### [INFO: TECH] — Gain énergétique estimé
- **Description** : Le calcul du gain énergétique est une estimation (15% par saut de classe DPE).
- **Impact** : Les taux MPR calculés sont approximatifs.
- **Recommandation** : Ajouter un champ "Gain énergétique réel" optionnel si l'utilisateur dispose d'un audit thermique.

---

## 🔒 Compliance Checklist

| Règle | Statut |
|-------|--------|
| Zéro mot "Audit" | ✅ OK |
| Disclaimer OPQIBI sur chaque écran | ✅ OK |
| Privacy First (calcul client-side) | ✅ OK |
| Mention DVF millésimée | ✅ OK |
| Sources de données documentées | ✅ OK (page /legal) |

---

*Dernière vérification : 27/01/2026*
