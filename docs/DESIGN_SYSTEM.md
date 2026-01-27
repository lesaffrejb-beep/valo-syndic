# DESIGN SYSTEM — Valo-Syndic Awwwards Edition

**Direction Artistique**: Fintech Editorial  
**Niveau**: Awwwards / Dribbble  
**Références**: Linear + Finary + Cron + Vercel

---

## 🌑 1. ATMOSPHÈRE

### Obsidian Background
- **Base**: `#020202` (Plus profond que noir)
- **Surface**: `rgba(10, 10, 10, 0.8)` (Semi-transparent)
- **Surface Highlight**: `rgba(30, 30, 30, 0.9)` (Hover state)

### Noise Overlay
- **Grain texture**: SVG noise applied via `body::before`
- **Opacity**: 3%, `mix-blend-mode: overlay`
- **Purpose**: Éliminer l'aspect "plastique" des fonds unis

### Ambient Glow
- **Applied via**: `body::after`
- **Gradient**: Radial ellipse from `rgba(99, 102, 241, 0.08)` to transparent
- **Purpose**: Lumière zénithale subtile créant profondeur

---

## 🏛 2. MATÉRIAUX — Glass & Steel

### `.glass-panel`
Le composant de base pour tous les conteneurs.

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(24px);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  /* L'Inner Border Light — Signature du design moderne */
  box-shadow: 
    inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
    0 8px 32px 0 rgba(0, 0, 0, 0.36);
}
```

### `.glass-panel-spotlight`
Ajouter un effet de lumière au survol.

```tsx
<div className="glass-panel-spotlight">
  {/* Le spotlight suit le curseur */}
</div>
```

**Important**: L'effet spotlight utilise `::before` avec transition pour créer un glow radial au hover.

---

## ✨ 3. OR ALCHIMIQUE — Typography & Gold

### `.text-gold-premium`
Pour les montants financiers principaux.

```css
.text-gold-premium {
  background-image: linear-gradient(
    to bottom right,
    #F9E2AF,  /* Or clair */
    #C69D59,  /* Or médium */
    #8C6A36   /* Or foncé */
  );
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 20px rgba(198, 157, 89, 0.3); /* Glow */
}
```

**Usage**: Montants principaux, grand total, valeurs "wow".

### `.label-mono`
Labels de data — Style "Terminal de Trading".

```css
.label-mono {
  font-family: 'JetBrains Mono', 'Geist Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.1em; /* tracking-widest */
  font-size: 0.75rem;    /* text-xs */
  color: var(--text-muted);
  font-weight: 500;
}
```

**Usage**: Tous les labels de chiffres, métadonnées, légendes de graphiques.

---

## 📐 4. HIÉRARCHIE TYPOGRAPHIQUE

### Titres (Serif Editorial)
- **Font**: `Playfair Display` (ou Fraunces)
- **H1/H2**: `font-serif font-semibold tracking-tight`
- **Usage**: Titres de sections principales, mise en valeur de mots-clés en _italic_

### Données (Monospace Précision)
- **Font**: `JetBrains Mono` ou `Geist Mono`
- **Classe**: `.label-mono`
- **Usage**: Labels, métadonnées, codes, références légales

### Montants Financiers
- **Classe**: `tabular-nums` (toujours)
- **Accent**: `.text-gold-premium` pour les montants principaux
- **Font-weight**: `font-bold` minimum

---

## 🎨 5. PALETTE COULEURS

### Backgrounds
```ts
background: "#020202"     // Obsidian
surface: "rgba(10,10,10,0.8)"  // Glass semi-transparent
```

### Borders (Ultra-subtiles)
```ts
DEFAULT: "rgba(255,255,255,0.05)"
highlight: "rgba(255,255,255,0.1)"
```

### Accents Neon
```ts
success:  "#10B981"  // Emerald (aides, gains)
warning:  "#FFD60A"  // Yellow (attention)
danger:   "#FF453A"  // Red (urgence, coût)
primary:  "#E0B976"  // Gold (actions, prestige)
```

### DPE Badges (LED Style)
Chaque badge DPE a un `box-shadow` avec glow neon de sa couleur respective.

```css
.dpe-badge-a {
  background: #10B981;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
}
```

---

## 🖱️ 6. INTERACTIONS

### Hover Effects
- **Glass Panels**: Border passe à `primary/20`, background à `white/[0.04]`
- **Spotlight**: Glow radial de 400px apparaît progressivement (0.6s)
- **Lift**: Légère translation Y de `-4px` sur les cartes interactives

### Transitions
```css
transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

### Focus States
- `outline: 2px solid primary`
- `outline-offset: 2px`

---

## 📊 7. DATA VISUALIZATION

### AreaCharts (Recharts)
- **Gradient**: From `#10B981` (emerald) to transparent
- **Stroke**: 2px, luminous
- **Grid**: Ultra-subtile, `stroke-opacity: 0.1`

### DPE Gauge (LED Bar)
- **Segments**: Séparés par 1px black
- **Couleurs**: Saturées, neon style
- **Active segment**: Glow box-shadow

---

## 💡 8. USAGE EXAMPLES

### Financial Amount (Grand Total)
```tsx
<p className="text-4xl font-bold text-gold-premium tabular-nums">
  <AnimatedCurrency value={amount} />
</p>
```

### Label + Data Combo
```tsx
<p className="label-mono mb-2">
  Reste à charge
</p>
<p className="text-3xl font-bold text-text-main tabular-nums">
  42 500 €
</p>
```

### Glass Panel Card
```tsx
<div className="glass-panel-spotlight">
  <h3 className="text-lg font-semibold mb-4">Titre</h3>
  {/* Content */}
</div>
```

---

## ⚠️ 9. RÈGLES STRICTES

### ❌ À NE JAMAIS FAIRE
1. **Couleurs en dur**: Toujours utiliser les tokens Tailwind
2. **Ombres floues sales**: Uniquement inset shadows ou glows propres
3. **Labels en lowercase**: `.label-mono` est toujours uppercase
4. **Gris par défaut**: Utiliser `text-text-muted` au lieu de `text-gray-500`

### ✅ À TOUJOURS FAIRE
1. **Noise texture**: Présent sur toute page via `body::before`
2. **Inset light border**: Sur tous les glass-panels
3. **Tabular nums**: Sur TOUS les montants financiers
4. **Gold premium**: Sur les montants "wow" (total, grand résultat)

---

## 🔧 10. MAINTENANCE

### Pour ajouter un nouveau composant:
1. Utiliser `.glass-panel` ou `.glass-panel-spotlight` comme base
2. Labels en `.label-mono`
3. Montants en `tabular-nums`
4. Ajouter `.text-gold-premium` sur le montant principal
5. Vérifier le contraste (WCAG AA minimum)

### Pour modifier les couleurs:
Ne PAS modifier directement. Proposer un nouveau token dans `tailwind.config.ts` d'abord.

---

**Version**: 1.0 — Fintech Editorial  
**Last Update**: 2026-01-27  
**Maintainer**: Antigravity AI
