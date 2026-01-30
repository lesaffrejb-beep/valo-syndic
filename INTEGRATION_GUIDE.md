# Guide d'Intégration — Composants Manquants

Ce guide vous explique comment intégrer les deux nouveaux composants dans `src/app/page.tsx`.

## 📦 Composants Créés

1. **DPEDistributionChart.tsx** (L'Ego) - Benchmark social pour piquer l'ego
2. **HeatingSystemAlert.tsx** (L'Opportunité) - Transformer le chauffage en cash

---

## 🔧 Étape 1 : Ajouter les Imports

**Fichier :** `src/app/page.tsx`

**Emplacement :** Ligne 35, après les autres imports de composants dashboard

```typescript
// Narrative Components
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import { GESBadge } from "@/components/dashboard/GESBadge";
import { LegalCountdown } from "@/components/dashboard/LegalCountdown";
import { FinancialProjection } from "@/components/dashboard/FinancialProjection";
// 👇 AJOUTER CES 2 LIGNES
import { DPEDistributionChart } from "@/components/dashboard/DPEDistributionChart";
import { HeatingSystemAlert } from "@/components/dashboard/HeatingSystemAlert";
```

---

## 📍 Étape 2 : Intégrer le Benchmark (L'Ego)

**Section :** ACTE 1 - LE DIAGNOSTIC (L'URGENCE)
**Emplacement :** Ligne 485-497 (remplacer la div "Benchmark & Chrono Grid")

### Code à Remplacer :

```typescript
{/* Benchmark & Chrono Grid */}
<div className="flex flex-col lg:flex-row gap-6 items-stretch">
    <div className="flex-1 h-full">
        {/* Benchmark Card */}
        <BenchmarkChart currentDPE={result.input.currentDPE} className="h-full" />
    </div>
    <div className="flex-1 h-full">
        <ComplianceTimeline
            currentDPE={result.input.currentDPE}
            className="h-full"
        />
    </div>
</div>
```

### Par :

```typescript
{/* Benchmark & Chrono Grid */}
<div className="space-y-6">
    {/* NEW: DPE Distribution Chart — L'EGO */}
    <DPEDistributionChart
        currentDPE={result.input.currentDPE}
        city={result.input.city}
        postalCode={result.input.postalCode}
    />

    {/* Original Benchmark & Timeline */}
    <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        <div className="flex-1 h-full">
            <BenchmarkChart currentDPE={result.input.currentDPE} className="h-full" />
        </div>
        <div className="flex-1 h-full">
            <ComplianceTimeline
                currentDPE={result.input.currentDPE}
                className="h-full"
            />
        </div>
    </div>
</div>
```

---

## 💰 Étape 3 : Intégrer l'Alerte Chauffage (L'Opportunité)

**Section :** ACTE 4 - LA RÉVÉLATION (LE MOTEUR CACHÉ)
**Emplacement :** Ligne 574, JUSTE AVANT le `<SubsidyTable>`

### Code à Ajouter :

Trouvez cette ligne :

```typescript
{/* 1. HERO CONTENT: SUBSIDY TABLE (Full Width) */}
<div className="md:col-span-12 order-1">
    <SubsidyTable inputs={simulationInputs} />
</div>
```

Remplacez par :

```typescript
{/* NEW: Heating System Alert — L'OPPORTUNITÉ */}
<div className="md:col-span-12 order-1 mb-6">
    <HeatingSystemAlert
        heatingType="gaz" // 👈 TODO: Remplacer par la vraie donnée du DPE si disponible
        // Alternative si vous avez les données DPE complètes :
        // dpeData={{
        //     type_energie_chauffage: result.input.heatingType
        // }}
    />
</div>

{/* 1. HERO CONTENT: SUBSIDY TABLE (Full Width) */}
<div className="md:col-span-12 order-2">
    <SubsidyTable inputs={simulationInputs} />
</div>
```

**⚠️ Important :**
- Changez `order-1` en `order-2` pour le SubsidyTable
- Ajoutez la vraie donnée `heatingType` depuis vos données DPE si vous l'avez
- Si vous n'avez pas cette donnée, l'alerte ne s'affichera que pour les tests avec `heatingType="gaz"` ou `"fioul"`

---

## 🎨 Résultat Attendu

### L'Ego (Section Diagnostic)
- Le graphique de distribution apparaît **en premier** dans la section Benchmark
- Affiche le message percutant : "85% des immeubles de Angers sont mieux classés que vous"
- Mise en évidence visuelle de la barre correspondant au DPE de l'utilisateur

### L'Opportunité (Section Financement)
- L'alerte apparaît **juste avant** le tableau des subventions
- Style "Unlock" avec couleurs or/émeraude (pas de rouge alarmiste)
- Affiche "+5 000 € immédiats" pour le chauffage fioul
- Bouton expandable pour voir les détails

---

## 🔍 Détection du Système de Chauffage

Pour que l'alerte fonctionne correctement, vous devez passer le type de chauffage au composant.

### Option A : Depuis le formulaire

Si vous collectez le type de chauffage dans le formulaire, ajoutez-le au schéma :

```typescript
// src/lib/schemas.ts
export const DiagnosticInputSchema = z.object({
    // ... existing fields
    heatingType: z.string().optional(), // "fioul", "gaz", "électrique", "PAC"
});
```

Puis dans page.tsx :

```typescript
<HeatingSystemAlert heatingType={result.input.heatingType} />
```

### Option B : Depuis l'API DPE

Si vous récupérez les données DPE depuis l'API ADEME, passez les données brutes :

```typescript
<HeatingSystemAlert
    dpeData={{
        type_energie_chauffage: dpeData?.type_energie_chauffage
    }}
/>
```

### Option C : Détection automatique (Mock)

Pour tester, utilisez une valeur en dur :

```typescript
<HeatingSystemAlert heatingType="gaz" /> // ou "fioul"
```

---

## 🚀 Prochaines Étapes

1. ✅ Imports ajoutés
2. ✅ DPEDistributionChart intégré dans Section Diagnostic
3. ✅ HeatingSystemAlert intégré dans Section Financement
4. 🔲 Créer l'endpoint API `/api/analytics/dpe-distribution` (voir ci-dessous)
5. 🔲 Ajouter le champ `heatingType` au formulaire ou le récupérer depuis l'API DPE
6. 🔲 Tester l'affichage avec différents DPE

---

## 📊 TODO : Créer l'API Endpoint (Optionnel)

Le composant `DPEDistributionChart` utilise actuellement des **données mock**.

Pour connecter la vraie vue SQL `analytics_dpe_distribution`, créez :

**Fichier :** `src/app/api/analytics/dpe-distribution/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'Angers';
    const postalCode = searchParams.get('postalCode');

    const supabase = createClient();

    // Query analytics_dpe_distribution view
    const { data, error } = await supabase
        .from('analytics_dpe_distribution')
        .select('dpe_letter, count')
        .eq('city', city)
        .order('dpe_letter');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
```

Puis décommentez le fetch dans `DPEDistributionChart.tsx` (ligne 51-60).

---

## ✅ Checklist

- [ ] Imports ajoutés dans page.tsx
- [ ] DPEDistributionChart intégré (Section Diagnostic)
- [ ] HeatingSystemAlert intégré (Section Financement)
- [ ] Type de chauffage détecté (heatingType passé en prop)
- [ ] API endpoint créé (optionnel, pour données réelles)
- [ ] Testé avec DPE F et DPE G
- [ ] Vérifié que l'alerte n'apparaît que pour fioul/gaz

---

**🎯 Objectif Final :**

- L'utilisateur voit son ego piqué dans la section Diagnostic (comparaison sociale)
- Il voit ensuite l'opportunité financière dans la section Financement (transformation du problème en cash)
- Le flow narratif est respecté : Ego → Douleur → Opportunité

**Need help?** Demandez-moi si vous avez des questions sur l'intégration !
