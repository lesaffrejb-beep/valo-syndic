# Corrections des Tests E2E Playwright

**Date :** 30 janvier 2026

## Problèmes identifiés

Les tests E2E échouaient car ils utilisaient des sélecteurs obsolètes ou incorrects :

### 1. `critical-flow.spec.ts`

**Problème :**
- Recherche `text=Votre diagnostic patrimonial` qui n'existe pas sur la page d'accueil
- Ce texte n'apparaît qu'après soumission du formulaire

**Correction :**
- Remplacé par `text=Diagnostic Flash` qui est le titre réel de la page
- Amélioré la vérification des résultats avec des sélecteurs plus robustes

### 2. `documents.spec.ts`

**Problèmes :**
- Tests marqués "(Disabled V2)" mais les boutons ne sont plus disabled
- Mauvais texte pour PowerPoint : "PowerPoint" au lieu de "PowerPoint AG"
- Mauvais sélecteur pour "Projet de Résolution" (accent)
- Les boutons sont lazy-loaded et nécessitent un délai d'attente

**Corrections :**
- Utilisation de regex pour gérer les accents (R[ée]solution)
- Correction du texte PowerPoint : "PowerPoint AG"
- Suppression des assertions `toBeDisabled()` obsolètes
- Ajout de timeouts pour le chargement lazy

## Fichiers modifiés

1. `tests/critical-flow.spec.ts` - Sélecteurs corrigés
2. `tests/documents.spec.ts` - Textes et assertions corrigés

## Résultat

- ✅ Tests unitaires : 90/90 passent
- ✅ Tests E2E : Corrigés pour refléter l'interface réelle

## Notes

Les composants PDF/PPTX/Convocation sont lazy-loaded (chargement dynamique).
Les tests doivent attendre leur apparition avec un timeout suffisant (10s).
