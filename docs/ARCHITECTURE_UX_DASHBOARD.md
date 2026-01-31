# ARCHITECTURE UX — DASHBOARD VALO-SYNDIC
 
> **Version :** 1.0
> **Date :** 31 Janvier 2026
> **Auteur :** Claude Opus (Lead Product Architect)
> **Statut :** Spécification validée — Prêt pour implémentation
 
---
 
## CONTEXTE
 
Ce document définit l'**organisation spatiale (Layout)** du Dashboard principal (`src/app/page.tsx` ou `src/app/dashboard/page.tsx` selon contexte).
Il s'agit de la **logique d'assemblage**, pas du CSS détaillé.
 
**Philosophie :** "Obsidian Cockpit" (Bloomberg x Linear) — Stealth Wealth
**Objectif :** Outil de closing, pas site vitrine.
 
---
 
## 1. LA GRILLE BENTO (Layout Master)
```text
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

## 2. LE MAPPING — Widget → Zone (avec Justification Psychologique)
```json
{
  "layout": {
    "type": "bento-grid",
    "philosophy": "Stealth Wealth — Bloomberg x Linear",
    "principle": "L'œil suit le flux: Alerte → Contexte → Preuve → Action"
  },
  
  "zones": {
    "A": {
      "name": "ALERTES CONTEXTUELLES",
      "position": "top-full-width",
      "height": "auto (collapse si inactive)",
      "purpose": "Établir le cadre réglementaire AVANT de parler chiffres",
      "widgets": [
        {
          "component": "MprSuspensionAlert",
          "priority": 1,
          "trigger": "regulation.isMprCoproSuspended === true",
          "justification": "PSYCHO: Le copropriétaire doit savoir si le dispositif existe AVANT de calculer. Afficher après = perte de confiance. Position haute = impossible à ignorer, mais ne bloque pas le flux."
        },
        {
          "component": "MarketLiquidityAlert",
          "priority": 2,
          "trigger": "always (sauf mode expert)",
          "justification": "PSYCHO: Créer l'urgence sociale — '15% du parc est invendable'. C'est le 'Fear of Missing Out' inversé : 'Fear of Being Stuck'. En haut car contextualise tout le reste."
        }
      ]
    },
    
    "B": {
      "name": "CONTEXTE & RISQUES",
      "position": "left-column",
      "width": "25%",
      "purpose": "Ancrer la réalité locale AVANT de parler argent",
      "widgets": [
        {
          "component": "RiskRadar",
          "position": "top-of-column",
          "justification": "PSYCHO: L'hexagone des risques (Argile, Inondation, Radon) crée une 'carte d'identité' du bâtiment. Visuel radar = scientifique, pas émotionnel. Position gauche = lecture naturelle (Ouest→Est). Le copropriétaire voit SON immeuble, pas une abstraction."
        },
        {
          "component": "ClimateRiskCard",
          "position": "bottom-of-column",
          "justification": "PSYCHO: La frise chronologique Loi Climat (2025→2034) est un compte à rebours. Position basse gauche = dernière chose vue avant de regarder les chiffres. L'urgence est plantée dans l'esprit."
        }
      ]
    },
    
    "C": {
      "name": "PREUVE CENTRALE",
      "position": "center-column",
      "width": "50%",
      "purpose": "LE CŒUR — La vérité des chiffres, indiscutable",
      "widgets": [
        {
          "component": "TransparentReceipt",
          "position": "full-height-center",
          "priority": "STAR — Plus grand, plus visible",
          "justification": "PSYCHO: Le 'Ticket de Caisse' est au CENTRE car c'est la PREUVE DE VÉRITÉ. Comme un reçu bancaire. Vertical = lecture naturelle haut→bas (Travaux → Aides → Reste). Le gestionnaire pointe l'écran et dit 'Voilà ce que vous payez réellement'. Taille 50% = impossible à contester. C'est le 'closing document'."
        }
      ]
    },
    
    "D": {
      "name": "PROJECTION & VALEUR",
      "position": "right-column",
      "width": "25%",
      "purpose": "Montrer le GAIN, pas le coût — Transformer la dépense en investissement",
      "widgets": [
        {
          "component": "ValuationCard",
          "position": "top-of-column",
          "justification": "PSYCHO: Le 'Bouclier Patrimonial' en haut à droite = récompense visuelle. L'œil termine son parcours sur le GAIN (+15% valeur verte). Position finale = dernière impression. Chiffre vert = positif. C'est l'antidote au chiffre rouge du devis."
        },
        {
          "component": "InactionCostCard",
          "position": "bottom-of-column",
          "justification": "PSYCHO: 'La Peur Rationnelle' est en dessous du gain — le contraste est violent. Si tu ne fais RIEN, tu perds X€. Graphique exponentiel = l'inaction COÛTE plus que l'action. Jamais en premier (trop agressif) mais toujours visible après le gain."
        }
      ]
    },
    
    "E": {
      "name": "BARRE D'ACTION",
      "position": "bottom-full-width",
      "behavior": "sticky (reste visible au scroll)",
      "purpose": "CLOSING — Personnaliser et exporter",
      "widgets": [
        {
          "component": "ProfileSelector",
          "position": "left-third",
          "justification": "PSYCHO: Les 4 couleurs (Bleu/Jaune/Violet/Rose) sont des 'personas fiscaux'. Le gestionnaire clique sur le profil du copropriétaire présent et les chiffres s'adaptent. Démonstration de PERSONNALISATION = confiance."
        },
        {
          "component": "TantiemeCalculator",
          "position": "center-third",
          "justification": "PSYCHO: Le slider 'Mon lot' est l'outil de CLOSING ultime. Le copropriétaire voit SA quote-part en temps réel. Interaction = engagement. Au centre car c'est le 'Money Shot'. Jamais caché."
        },
        {
          "component": "ActionButtons",
          "position": "right-third",
          "children": ["DownloadPdfButton", "DownloadPptxButton", "ObjectionHandler"],
          "justification": "PSYCHO: Les exports sont à droite (zone d'action classique). Le bouton 'Objections' est ici car il est utilisé EN RÉACTION. Toujours visible = le gestionnaire n'a jamais à chercher."
        }
      ]
    }
  }
}
```

## 4. GARDE-FOUS — Règles d'Or pour l'Intégrateur
1. **GF-001 (CRITICAL)**: Le `TantiemeCalculator` ne doit JAMAIS être caché ou scrollable.
2. **GF-002 (CRITICAL)**: Le `TransparentReceipt` doit occuper au MINIMUM 50% de la largeur.
3. **GF-003 (CRITICAL)**: `MprSuspensionAlert` doit être AVANT tout chiffre.
4. **GF-011 (RESPONSIVE)**: Sur mobile, la grille devient: A → C → E (Alerte → Preuve → Action). Zones B et D masquées ou en bas.
