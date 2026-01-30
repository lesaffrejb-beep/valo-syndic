// Manual Test V2: Subsidy Calculator with CEE + Local Aids
// Run this with: npx tsx src/lib/__tests__/subsidy-calculator-v2-test.ts

import { calculateSubsidies, type SimulationInputs } from '../subsidy-calculator';
import { formatCurrency } from '../calculator';

console.log('='.repeat(80));
console.log('MPR COPRO 2026 V2 — CEE + AIDES LOCALES (Tests Complets)');
console.log('='.repeat(80));
console.log('');

// =============================================================================
// SCÉNARIO 1: Standard SANS CEE/Locales (Référence)
// =============================================================================
console.log('📋 SCÉNARIO 1: Standard SANS CEE/Locales (Référence)');
console.log('-'.repeat(80));

const scenario1: SimulationInputs = {
    workAmountHT: 750_000,
    amoAmountHT: 18_000,
    nbLots: 30,
    energyGain: 0.35, // 35%
    initialDPE: 'E',
    targetDPE: 'D',
    isFragile: false,
    ceePerLot: 0, // Pas de CEE
    localAidPerLot: 0, // Pas d'aides locales
};

const result1 = calculateSubsidies(scenario1);
console.log(`Lots: ${scenario1.nbLots}`);
console.log(`Travaux HT: ${formatCurrency(scenario1.workAmountHT)}`);
console.log('');
console.log(`[BLUE] Taux MPR: ${result1.profiles.Blue.mprRate * 100}%`);
console.log(`[BLUE] Aides Publiques: ${formatCurrency(result1.profiles.Blue.totalPublicSubsidies)} (MPR+AMO+Prime)`);
console.log(`[BLUE] Boost Privé/Local: ${formatCurrency(result1.profiles.Blue.privateLocalBoost)}`);
console.log(`[BLUE] Reste à Charge: ${formatCurrency(result1.profiles.Blue.remainingCost)}`);
console.log(`[BLUE] Mensualité: ${formatCurrency(result1.profiles.Blue.monthlyPayment)}/mois`);
console.log('');

// =============================================================================
// SCÉNARIO 2: AVEC CEE (1 500 €/lot, moyenne Angers)
// =============================================================================
console.log('📋 SCÉNARIO 2: AVEC CEE (1 500 €/lot, moyenne Angers)');
console.log('-'.repeat(80));

const scenario2: SimulationInputs = {
    workAmountHT: 750_000,
    amoAmountHT: 18_000,
    nbLots: 30,
    energyGain: 0.35,
    initialDPE: 'E',
    targetDPE: 'D',
    isFragile: false,
    ceePerLot: 1_500, // CEE moyenne
    localAidPerLot: 0,
};

const result2 = calculateSubsidies(scenario2);
console.log(`Lots: ${scenario2.nbLots}`);
console.log(`CEE par lot: ${formatCurrency(scenario2.ceePerLot!)}`);
console.log('');
console.log(`[YELLOW] Aides Publiques: ${formatCurrency(result2.profiles.Yellow.totalPublicSubsidies)}`);
console.log(`[YELLOW] Boost Privé/Local: ${formatCurrency(result2.profiles.Yellow.privateLocalBoost)} (CEE)`);
console.log(`[YELLOW] Total Aides: ${formatCurrency(result2.profiles.Yellow.totalSubsidies)}`);
console.log(`[YELLOW] Reste à Charge: ${formatCurrency(result2.profiles.Yellow.remainingCost)}`);
console.log(`[YELLOW] Économie vs Scénario 1: -${formatCurrency(result1.profiles.Yellow.remainingCost - result2.profiles.Yellow.remainingCost)}`);
console.log('');

// =============================================================================
// SCÉNARIO 3: AVEC CEE + Aides Locales (Angers Loire Métropole)
// =============================================================================
console.log('📋 SCÉNARIO 3: AVEC CEE + Aides Locales (Cumul Max)');
console.log('-'.repeat(80));

const scenario3: SimulationInputs = {
    workAmountHT: 750_000,
    amoAmountHT: 18_000,
    nbLots: 30,
    energyGain: 0.35,
    initialDPE: 'E',
    targetDPE: 'D',
    isFragile: false,
    ceePerLot: 1_500, // CEE
    localAidPerLot: 1_000, // Angers Loire Métropole
};

const result3 = calculateSubsidies(scenario3);
console.log(`Lots: ${scenario3.nbLots}`);
console.log(`CEE par lot: ${formatCurrency(scenario3.ceePerLot!)}`);
console.log(`Aides Locales par lot: ${formatCurrency(scenario3.localAidPerLot!)}`);
console.log('');
console.log(`[PURPLE] Aides Publiques: ${formatCurrency(result3.profiles.Purple.totalPublicSubsidies)}`);
console.log(`[PURPLE] Boost Privé/Local: ${formatCurrency(result3.profiles.Purple.privateLocalBoost)} (CEE + Locales)`);
console.log(`[PURPLE] Total Aides: ${formatCurrency(result3.profiles.Purple.totalSubsidies)}`);
console.log(`[PURPLE] Reste à Charge: ${formatCurrency(result3.profiles.Purple.remainingCost)}`);
console.log(`[PURPLE] Économie vs Scénario 1: -${formatCurrency(result1.profiles.Purple.remainingCost - result3.profiles.Purple.remainingCost)}`);
console.log('');

// =============================================================================
// SCÉNARIO 4: Performance + Passoire + CEE massif (3 000 €/lot)
// =============================================================================
console.log('📋 SCÉNARIO 4: Performance + Passoire + CEE Massif');
console.log('-'.repeat(80));

const scenario4: SimulationInputs = {
    workAmountHT: 500_000,
    amoAmountHT: 12_000,
    nbLots: 20,
    energyGain: 0.55, // 55% (performance)
    initialDPE: 'G',
    targetDPE: 'C',
    isFragile: false,
    ceePerLot: 3_000, // CEE haute performance
    localAidPerLot: 0,
};

const result4 = calculateSubsidies(scenario4);
console.log(`Lots: ${scenario4.nbLots}`);
console.log(`Gain énergétique: ${scenario4.energyGain * 100}%`);
console.log(`DPE: ${scenario4.initialDPE} → ${scenario4.targetDPE}`);
console.log(`CEE par lot: ${formatCurrency(scenario4.ceePerLot!)}`);
console.log('');
console.log(`[BLUE] Taux MPR: ${result4.profiles.Blue.mprRate * 100}% (45% + 10% Passoire)`);
console.log(`[BLUE] Aides Publiques: ${formatCurrency(result4.profiles.Blue.totalPublicSubsidies)}`);
console.log(`[BLUE] Boost Privé/Local: ${formatCurrency(result4.profiles.Blue.privateLocalBoost)}`);
console.log(`[BLUE] Reste à Charge: ${formatCurrency(result4.profiles.Blue.remainingCost)}`);
console.log(`[BLUE] Mensualité: ${formatCurrency(result4.profiles.Blue.monthlyPayment)}/mois`);
console.log('');

// =============================================================================
// SCÉNARIO 5: ALL-IN (Tous bonus + CEE + Locales)
// =============================================================================
console.log('📋 SCÉNARIO 5: ALL-IN (Tous Bonus + CEE + Locales)');
console.log('-'.repeat(80));

const scenario5: SimulationInputs = {
    workAmountHT: 400_000,
    amoAmountHT: 9_000,
    nbLots: 15,
    energyGain: 0.60, // 60%
    initialDPE: 'F',
    targetDPE: 'B',
    isFragile: true, // Bonus Fragile
    ceePerLot: 2_000,
    localAidPerLot: 1_200,
};

const result5 = calculateSubsidies(scenario5);
console.log(`Lots: ${scenario5.nbLots}`);
console.log(`Gain énergétique: ${scenario5.energyGain * 100}%`);
console.log(`DPE: ${scenario5.initialDPE} → ${scenario5.targetDPE}`);
console.log(`Fragile: OUI`);
console.log(`CEE par lot: ${formatCurrency(scenario5.ceePerLot!)}`);
console.log(`Aides Locales par lot: ${formatCurrency(scenario5.localAidPerLot!)}`);
console.log('');
console.log(`[BLUE] Taux MPR: ${result5.profiles.Blue.mprRate * 100}% (45% + 10% + 20%)`);
console.log(`[BLUE] Aides Publiques: ${formatCurrency(result5.profiles.Blue.totalPublicSubsidies)}`);
console.log(`[BLUE] Boost Privé/Local: ${formatCurrency(result5.profiles.Blue.privateLocalBoost)} (CEE + Locales)`);
console.log(`[BLUE] Total Aides: ${formatCurrency(result5.profiles.Blue.totalSubsidies)}`);
console.log(`[BLUE] Reste à Charge: ${formatCurrency(result5.profiles.Blue.remainingCost)}`);
console.log(`[BLUE] Mensualité: ${formatCurrency(result5.profiles.Blue.monthlyPayment)}/mois`);
console.log('');

// =============================================================================
// RÉCAPITULATIF : Puissance du CEE + Locales
// =============================================================================
console.log('='.repeat(80));
console.log('💡 RÉCAPITULATIF: Impact du Boost Privé/Local');
console.log('='.repeat(80));
console.log('');
console.log(`Scénario 1 (Sans CEE/Locales)  → Reste à Charge Blue: ${formatCurrency(result1.profiles.Blue.remainingCost)}`);
console.log(`Scénario 2 (CEE 1500€)         → Reste à Charge Yellow: ${formatCurrency(result2.profiles.Yellow.remainingCost)}`);
console.log(`Scénario 3 (CEE + Locales)     → Reste à Charge Purple: ${formatCurrency(result3.profiles.Purple.remainingCost)}`);
console.log(`Scénario 5 (ALL-IN)            → Reste à Charge Blue: ${formatCurrency(result5.profiles.Blue.remainingCost)}`);
console.log('');
console.log('✅ Le cumul MPR + CEE + Aides Locales fait VRAIMENT la différence !');
console.log('='.repeat(80));
