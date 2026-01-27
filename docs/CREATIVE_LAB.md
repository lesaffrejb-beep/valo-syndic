# 🧪 CREATIVE LAB — Idées Expérimentales

> Idées géniales mais risquées. Ne pas coder sans validation.

---

## 💡 Idée 1: Particle System sur Score d'Urgence

**L'idée**: Particules dorées qui émanent du cercle d'urgence quand le score dépasse 80, simulant une "alerte patrimoine".

**Pourquoi ça tue**:
- Impact visuel immédiat
- Renforce le sentiment d'urgence
- Différenciation vs Excel

**Risque technique**:
- Performance sur mobiles anciens
- Complexité Canvas/WebGL
- Accessibilité (motion-reduce)

**Status**: 🟡 En attente de validation

---

## 💡 Idée 2: Graphique 3D Isométrique pour Timeline

**L'idée**: Remplacer la timeline verticale par une vue 3D isométrique montrant les échéances comme des "marches" à gravir.

**Pourquoi ça tue**:
- Métaphore visuelle puissante ("monter" vers la conformité)
- Look premium différenciant
- Print-friendly (rendu statique possible)

**Risque technique**:
- Three.js = bundle size
- SSR compatibility
- Accessibilité lecteurs d'écran

**Status**: 🔴 Risque élevé — V2

---

## 💡 Idée 3: Sound Design Minimal

**L'idée**: Léger "click" métallique sur les boutons, "whoosh" subtil sur les transitions de cartes.

**Pourquoi ça tue**:
- Expérience tactile augmentée
- Premium feel (comme Mac Startup Sound)
- Différenciant absolu

**Risque technique**:
- Autoplay policies navigateurs
- Préférences utilisateur (mute by default)
- Fichiers audio = latence

**Status**: 🟡 Opt-in uniquement — V2

---

## 💡 Idée 4: Mode "Projection AG"

**L'idée**: Bouton qui bascule l'interface en mode "présentation" avec:
- Typo agrandie 150%
- Contraste renforcé
- Animations plus lentes
- QR code toujours visible

**Pourquoi ça tue**:
- Cas d'usage réel des syndics
- Différenciation produit
- Accessibility bonus

**Risque technique**:
- CSS media queries ou state global
- Test cross-device complexe

**Status**: 🟢 Faible risque — Priorité V1.5

---

## 💡 Idée 5: Export PowerPoint Auto-Généré

**L'idée**: En plus du PDF, générer un .pptx avec les slides pré-formatées pour AG.

**Pourquoi ça tue**:
- Killer feature pour syndics
- Différenciation absolue
- Valeur perçue élevée

**Risque technique**:
- Librairie pptxgenjs à intégrer
- Styling PPTX limité
- Maintenance long-terme

**Status**: 🟡 Feature request populaire — Backlog

---

## 📋 Prochaines Étapes

1. Valider les idées 🟢 avec l'équipe
2. Prototyper Idée 4 (Mode Projection)
3. Benchmarker la perf Canvas pour Idée 1
