// Manual Test: Subsidy Calculator Verification
// Run this with: npx tsx src/lib/__tests__/subsidy-calculator-manual-test.ts

import { calculateSubsidies, type SimulationInputs } from '../subsidy-calculator';
import { formatCurrency } from '../calculator';

console.log('='.repeat(80));
console.log('MPR COPRO 2026 — VERIFICATION MANUELLE (5 Scénarios)');
console.log('='.repeat(80));
console.log('');

// =============================================================================
// SCÉNARIO 1: Standard (30% base, pas de bonus)
// =============================================================================
console.log('📋 SCÉNARIO 1: Cas Standard');
console.log('-'.repeat(80));

const scenario1: SimulationInputs = {
    workAmountHT: 750_000,
    amoAmountHT: 18_000, // 30 lots * 600€
    nbLots: 30,
    energyGain: 0.35, // 35% (seuil minimum)
    initialDPE: 'E',
    targetDPE: 'D',
    isFragile: false,
};

const result1 = calculateSubsidies(scenario1);
console.log(`Lots: ${scenario1.nbLots}`);
console.log(`Travaux HT: ${formatCurrency(scenario1.workAmountHT)}`);
console.log(`Gain énergétique: ${scenario1.energyGain * 100}%`);
console.log(`DPE: ${scenario1.initialDPE} → ${scenario1.targetDPE}`);
console.log('');
console.log(`Taux MPR appliqué: ${result1.profiles.Blue.mprRate * 100}% (attendu: 30%)`);
console.log(`MPR Copro (Blue): ${formatCurrency(result1.profiles.Blue.mprCoProAmount)}`);
console.log(`Prime Blue: ${formatCurrency(result1.profiles.Blue.individualPremium)} (attendu: 3 000 €)`);
console.log(`Reste à charge Blue: ${formatCurrency(result1.profiles.Blue.remainingCost)}`);
console.log(`Mensualité Blue: ${formatCurrency(result1.profiles.Blue.monthlyPayment)}/mois`);
console.log('');

// =============================================================================
// SCÉNARIO 2: Performance + Passoire (45% + 10%)
// =============================================================================
console.log('📋 SCÉNARIO 2: Performance + Bonus Passoire');
console.log('-'.repeat(80));

const scenario2: SimulationInputs = {
    workAmountHT: 500_000,
    amoAmountHT: 12_000, // 20 lots * 600€
    nbLots: 20,
    energyGain: 0.55, // 55% (performance)
    initialDPE: 'G',
    targetDPE: 'C',
    isFragile: false,
};

const result2 = calculateSubsidies(scenario2);
console.log(`Lots: ${scenario2.nbLots}`);
console.log(`Travaux HT: ${formatCurrency(scenario2.workAmountHT)}`);
console.log(`Gain énergétique: ${scenario2.energyGain * 100}%`);
console.log(`DPE: ${scenario2.initialDPE} → ${scenario2.targetDPE}`);
console.log('');
console.log(`Taux MPR appliqué: ${result2.profiles.Yellow.mprRate * 100}% (attendu: 55% = 45% + 10%)`);
console.log(`MPR Copro (Yellow): ${formatCurrency(result2.profiles.Yellow.mprCoProAmount)}`);
console.log(`Prime Yellow: ${formatCurrency(result2.profiles.Yellow.individualPremium)} (attendu: 1 500 €)`);
console.log(`Reste à charge Yellow: ${formatCurrency(result2.profiles.Yellow.remainingCost)}`);
console.log('');

// =============================================================================
// SCÉNARIO 3: All Bonuses (45% + 10% + 20%)
// =============================================================================
console.log('📋 SCÉNARIO 3: Tous les Bonus (Performance + Passoire + Fragile)');
console.log('-'.repeat(80));

const scenario3: SimulationInputs = {
    workAmountHT: 400_000,
    amoAmountHT: 9_000, // 15 lots * 600€
    nbLots: 15,
    energyGain: 0.60, // 60%
    initialDPE: 'F',
    targetDPE: 'B',
    isFragile: true,
};

const result3 = calculateSubsidies(scenario3);
console.log(`Lots: ${scenario3.nbLots}`);
console.log(`Travaux HT: ${formatCurrency(scenario3.workAmountHT)}`);
console.log(`Gain énergétique: ${scenario3.energyGain * 100}%`);
console.log(`DPE: ${scenario3.initialDPE} → ${scenario3.targetDPE}`);
console.log(`Fragile: OUI`);
console.log('');
console.log(`Taux MPR appliqué: ${result3.profiles.Purple.mprRate * 100}% (attendu: 75% = 45% + 10% + 20%)`);
console.log(`MPR Copro (Purple): ${formatCurrency(result3.profiles.Purple.mprCoProAmount)}`);
console.log(`Prime Purple: ${formatCurrency(result3.profiles.Purple.individualPremium)} (attendu: 0 €)`);
console.log(`Reste à charge Purple: ${formatCurrency(result3.profiles.Purple.remainingCost)}`);
console.log('');

// =============================================================================
// SCÉNARIO 4: Grande Copro (AMO cap = 600€/lot)
// =============================================================================
console.log('📋 SCÉNARIO 4: Grande Copropriété (Test AMO cap)');
console.log('-'.repeat(80));

const scenario4: SimulationInputs = {
    workAmountHT: 1_200_000,
    amoAmountHT: 30_000, // 50 lots * 600€
    nbLots: 50,
    energyGain: 0.50, // 50% (seuil performance)
    initialDPE: 'E',
    targetDPE: 'C',
    isFragile: false,
};

const result4 = calculateSubsidies(scenario4);
console.log(`Lots: ${scenario4.nbLots} (>20 → plafond AMO = 600€/lot)`);
console.log(`Travaux HT: ${formatCurrency(scenario4.workAmountHT)}`);
console.log(`AMO HT: ${formatCurrency(scenario4.amoAmountHT)}`);
console.log('');
console.log(`Aide AMO/lot: ${formatCurrency(result4.profiles.Pink.amoShareAmount)} (attendu: 300€ = 600€ * 50%)`);
console.log(`Taux MPR: ${result4.profiles.Pink.mprRate * 100}% (attendu: 45%)`);
console.log(`Reste à charge Pink: ${formatCurrency(result4.profiles.Pink.remainingCost)}`);
console.log('');

// =============================================================================
// SCÉNARIO 5: Petite Copro (AMO floor = 3000€ minimum)
// =============================================================================
console.log('📋 SCÉNARIO 5: Petite Copropriété (Test AMO floor)');
console.log('-'.repeat(80));

const scenario5: SimulationInputs = {
    workAmountHT: 100_000,
    amoAmountHT: 3_000, // 5 lots * 600€
    nbLots: 5,
    energyGain: 0.40, // 40%
    initialDPE: 'D',
    targetDPE: 'C',
    isFragile: false,
};

const result5 = calculateSubsidies(scenario5);
console.log(`Lots: ${scenario5.nbLots} (≤20 → plafond AMO = 1000€/lot)`);
console.log(`Travaux HT: ${formatCurrency(scenario5.workAmountHT)}`);
console.log(`AMO HT: ${formatCurrency(scenario5.amoAmountHT)}`);
console.log('');
console.log(`Aide AMO/lot: ${formatCurrency(result5.profiles.Blue.amoShareAmount)} (minimum: 3000€ / 5 = 600€)`);
console.log(`Taux MPR: ${result5.profiles.Blue.mprRate * 100}% (attendu: 30%)`);
console.log(`Reste à charge Blue: ${formatCurrency(result5.profiles.Blue.remainingCost)}`);
console.log('');

console.log('='.repeat(80));
console.log('✅ Vérification terminée');
console.log('='.repeat(80));
