# ARCHITECTURE UX — DASHBOARD VALO-SYNDIC

> **Version :** 1.0
> **Date :** 31 Janvier 2026
> **Auteur :** Claude Opus (Lead Product Architect)
> **Statut :** Spécification validée — Prêt pour implémentation

---

## CONTEXTE

Ce document définit l'**organisation spatiale (Layout)** du Dashboard principal (`src/app/page.tsx`).
Il s'agit de la **logique d'assemblage**, pas du CSS détaillé.

**Philosophie :** "Obsidian Cockpit" (Bloomberg x Linear) — Stealth Wealth
**Objectif :** Outil de closing, pas site vitrine.

---

## 1. LA GRILLE BENTO (Layout Master)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              ZONE A — ALERTES                               │
│                         (100% largeur, hauteur: auto)                       │
│                    ┌─────────────────────────────────────┐                  │
│                    │  MprSuspensionAlert | MarketLiquidityAlert              │
│                    └─────────────────────────────────────┘                  │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ZONE B                    ZONE C                    ZONE D                │
│   CONTEXTE                  PREUVE                    PROJECTION            │
│   (25%)                     (50%)                     (25%)                 │
│                                                                             │
│  ┌─────────────┐      ┌──────────────────────┐      ┌──────────────────┐   │
│  │ RiskRadar   │      │                      │      │ ValuationCard    │   │
│  │             │      │   TransparentReceipt │      │ (Gain Patrimonial)│  │
│  │ (Hexagone   │      │   ("Ticket de Caisse")│     │                  │   │
│  │  Risques)   │      │                      │      ├──────────────────┤   │
│  ├─────────────┤      │   ⭐ STAR V2         │      │ InactionCostCard │   │
│  │ ClimateRisk │      │                      │      │ (La Peur         │   │
│  │ Card        │      │                      │      │  Rationnelle)    │   │
│  │ (Timeline   │      │                      │      │                  │   │
│  │  Loi Climat)│      │                      │      │                  │   │
│  └─────────────┘      └──────────────────────┘      └──────────────────┘   │
│                                                                             │
├────────────────────────────────────────────────────────────────────────────┤
│                         ZONE E — INTERACTION                                │
│                        (100% largeur, sticky bottom)                        │
│                                                                             │
│  ┌────────────────┐  ┌─────────────────┐  ┌────────────────────────────┐   │
│  │ ProfileSelector │  │ TantiemeCalculator│ │  [PDF]  [PPTX]  [Objections]│ │
│  │ (Bleu/Jaune...)│  │ (Slider personnel)│ │  DownloadButtons + Handler  │ │
│  └────────────────┘  └─────────────────┘  └────────────────────────────┘   │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. LE MAPPING — Widget → Zone (avec Justification Psychologique)

### Zone A — ALERTES CONTEXTUELLES
| Widget | Déclencheur | Justification Stealth Wealth |
|--------|-------------|------------------------------|
| `MprSuspensionAlert` | `regulation.isMprCoproSuspended === true` | Le copropriétaire doit savoir si le dispositif existe AVANT de calculer. Afficher après = perte de confiance. Position haute = impossible à ignorer. |
| `MarketLiquidityAlert` | Toujours (sauf mode expert) | Créer l'urgence sociale — "15% du parc est invendable". Fear of Being Stuck. En haut car contextualise tout. |

### Zone B — CONTEXTE & RISQUES (Gauche, 25%)
| Widget | Position | Justification Stealth Wealth |
|--------|----------|------------------------------|
| `RiskRadar` | Haut de colonne | L'hexagone des risques crée une "carte d'identité" du bâtiment. Visuel radar = scientifique, pas émotionnel. Position gauche = lecture naturelle (Ouest→Est). |
| `ClimateRiskCard` | Bas de colonne | La frise chronologique Loi Climat (2025→2034) est un compte à rebours. Dernière chose vue avant de regarder les chiffres. L'urgence est plantée. |

### Zone C — PREUVE CENTRALE (Centre, 50%)
| Widget | Position | Justification Stealth Wealth |
|--------|----------|------------------------------|
| `TransparentReceipt` | Pleine hauteur, centre | **STAR V2** — Le "Ticket de Caisse" est au CENTRE car c'est la PREUVE DE VÉRITÉ. Comme un reçu bancaire. Vertical = lecture naturelle (Travaux → Aides → Reste). Taille 50% = impossible à contester. C'est le closing document. |

### Zone D — PROJECTION & VALEUR (Droite, 25%)
| Widget | Position | Justification Stealth Wealth |
|--------|----------|------------------------------|
| `ValuationCard` | Haut de colonne | Le "Bouclier Patrimonial" en haut à droite = récompense visuelle. L'œil termine sur le GAIN (+15% valeur verte). Dernière impression = positive. |
| `InactionCostCard` | Bas de colonne | "La Peur Rationnelle" est en dessous du gain — le contraste est violent. Graphique exponentiel = l'inaction COÛTE plus que l'action. |

### Zone E — BARRE D'ACTION (Sticky Bottom)
| Widget | Position | Justification Stealth Wealth |
|--------|----------|------------------------------|
| `ProfileSelector` | Tiers gauche | Les 4 couleurs (Bleu/Jaune/Violet/Rose) sont des "personas fiscaux". Démonstration de PERSONNALISATION = confiance. |
| `TantiemeCalculator` | Tiers centre | **CLOSING ULTIME** — Le slider "Mon lot" montre SA quote-part en temps réel. Interaction = engagement. Jamais caché. |
| `ActionButtons` | Tiers droite | Exports (PDF/PPTX) + Objections. Zone d'action classique. Toujours visible = le gestionnaire n'a jamais à chercher. |

---

## 3. FLUX DE DONNÉES — Props par Zone

```typescript
interface DashboardLayout {
  // ZONE A — Alertes
  alertsZone: {
    MprSuspensionAlert: {
      regulation: RegulationData;
    };
    MarketLiquidityAlert: {
      marketData: MarketTrendData;
    };
  };

  // ZONE B — Contexte
  contextZone: {
    RiskRadar: {
      lat: number;
      lon: number;
    };
    ClimateRiskCard: {
      compliance: ComplianceData;
    };
  };

  // ZONE C — Preuve Centrale
  proofZone: {
    TransparentReceipt: {
      financing: FinancingPlan;
      showBenchmark: boolean;
    };
  };

  // ZONE D — Projection
  projectionZone: {
    ValuationCard: {
      valuation: ValuationResult;
    };
    InactionCostCard: {
      inaction: InactionCost;
      years: number;
    };
  };

  // ZONE E — Actions
  actionZone: {
    ProfileSelector: {
      profiles: FiscalProfile[];
      onProfileChange: (profile: FiscalProfile) => void;
      activeProfile: string;
    };
    TantiemeCalculator: {
      financing: FinancingPlan;
      totalTantiemes: number;
      onTantiemeChange: (value: number) => void;
    };
    ObjectionHandler: {
      scenario: DiagnosticResult;
      onObjectionSelect: (objection: ObjectionKey) => void;
    };
    DownloadPdfButton: {
      result: DiagnosticResult;
      branding: BrandConfig;
    };
    DownloadPptxButton: {
      result: DiagnosticResult;
      slideConfig: PptxSlideConfig;
    };
  };
}
```

### Distribution des Données (page.tsx → composants)

| Zone | Props distribuées |
|------|-------------------|
| A | `regulation`, `marketData` |
| B | `coordinates (lat/lon)`, `compliance` |
| C | `financing` |
| D | `valuation`, `inaction` |
| E | `financing`, `profiles`, `fullResult` |

---

## 4. GARDE-FOUS — Règles d'Or pour l'Intégrateur

### CRITICAL (Blocage si non respecté)

| ID | Règle | Raison | Implémentation |
|----|-------|--------|----------------|
| GF-001 | TantiemeCalculator JAMAIS caché ou scrollable | C'est le "Money Shot" — si le copropriétaire ne voit pas SON chiffre, le closing échoue | Zone E: `position: sticky; bottom: 0; z-index: 50` |
| GF-002 | TransparentReceipt = MINIMUM 50% largeur | C'est la preuve centrale. Trop petit = l'œil le rate | Zone C: `flex: 2; min-width: 50%` |
| GF-003 | MprSuspensionAlert AVANT tout chiffre | Si le dispositif est suspendu et qu'on affiche des aides = mensonge. Code is Law. | Zone A: `order: -1` |
| GF-004 | Bouton "Objections" visible pendant l'AG | En AG, le gestionnaire a 3 secondes pour répondre. Chercher = perdre. | Toujours dans Zone E sticky |

### HIGH

| ID | Règle | Raison | Implémentation |
|----|-------|--------|----------------|
| GF-005 | ValuationCard AU-DESSUS de InactionCostCard | Terminer sur le positif, pas la peur. Gain → Perte | Zone D: `flex-direction: column; ValuationCard: order: 1` |
| GF-006 | Exports (PDF/PPTX) groupés à droite | Zone d'action classique Ouest→Est | Zone E: `grid: 1fr 1fr 1fr; exports = dernier tiers` |
| GF-007 | RiskRadar/ClimateRiskCard optionnels en mode simplifié | Trop d'infos tue l'info pour copropriétaire lambda | Conditionnel sur `viewMode` store |

### STANDARD

| ID | Règle | Raison | Implémentation |
|----|-------|--------|----------------|
| GF-008 | Dark mode UNIQUEMENT | Stealth Wealth = cohérence. Le switch casse l'identité | Hardcode `bg-obsidian (#020202)` |
| GF-009 | Tous les € utilisent AnimatedNumber | L'animation crée l'attention | Wrapper obligatoire |
| GF-010 | Pas de scroll horizontal | Tout visible d'un coup | `overflow-x: hidden` |

### RESPONSIVE

| ID | Règle | Raison | Implémentation |
|----|-------|--------|----------------|
| GF-011 | Mobile: A → C → E (Alerte → Preuve → Action) | B et D sont du contexte. Mobile = essentiel. | Zones B et D: `display: none` sur < 768px |
| GF-012 | Zone E sticky même sur mobile | Le slider = closing. Toujours accessible. | `position: fixed; bottom: 0` |

### ANTI-PATTERNS (Interdit)

- Ne JAMAIS mettre un loader sur TransparentReceipt — afficher instantanément
- Ne JAMAIS afficher "Économies : X€" sans la source (CEE? MPR? Éco-PTZ?)
- Ne JAMAIS utiliser de couleur vive sauf alertes critiques
- Ne JAMAIS cacher le bouton Simuler/Recalculer derrière un menu

---

## 5. ARBRE DE COMPOSITION REACT

```
<DashboardPage>                           // src/app/page.tsx
│
├── <AlertsBar>                           // Zone A — Conditionnelle
│   ├── <MprSuspensionAlert />
│   └── <MarketLiquidityAlert />
│
├── <BentoGrid>                           // CSS Grid Container (25-50-25)
│   │
│   ├── <ContextColumn>                   // Zone B (gauche)
│   │   ├── <RiskRadar />
│   │   └── <ClimateRiskCard />
│   │
│   ├── <ProofColumn>                     // Zone C (centre) — STAR
│   │   └── <TransparentReceipt />
│   │
│   └── <ProjectionColumn>                // Zone D (droite)
│       ├── <ValuationCard />
│       └── <InactionCostCard />
│
└── <ActionBar sticky>                    // Zone E — Toujours visible
    ├── <ProfileSelector />
    ├── <TantiemeCalculator />
    └── <ActionButtons>
        ├── <DownloadPdfButton />
        ├── <DownloadPptxButton />
        └── <ObjectionHandler trigger />
```

---

## CSS GRID — Skeleton

```css
.bento-grid {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;  /* 25% - 50% - 25% */
  grid-template-rows: auto 1fr auto;   /* Alerts - Content - Actions */
  gap: 1rem;
  min-height: 100vh;
  padding: 1rem;
  background: #020202;
}

.zone-a { grid-column: 1 / -1; }        /* Full width */
.zone-b { grid-column: 1; }              /* Left */
.zone-c { grid-column: 2; }              /* Center */
.zone-d { grid-column: 3; }              /* Right */
.zone-e {
  grid-column: 1 / -1;                   /* Full width */
  position: sticky;
  bottom: 0;
}

@media (max-width: 768px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }
  .zone-b, .zone-d { display: none; }
}
```

---

## RÉFÉRENCES

- **LE_CENTRE.md** §1 (Identité Stealth Wealth)
- **LE_CENTRE.md** §5 (UI Bento)
- **LE_CENTRE.md** §10 (Catalogue Widgets)

---

*"L'œil suit le flux: Alerte → Contexte → Preuve → Action"*
