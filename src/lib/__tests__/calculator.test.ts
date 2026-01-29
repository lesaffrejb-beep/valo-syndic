/**
 * Tests unitaires — Moteur de calcul VALO-SYNDIC
 * 
 * Ces tests valident les calculs réglementaires critiques :
 * - Taux MaPrimeRénov' Copropriété 2026
 * - Bonus sortie passoire
 * - Plafonds Éco-PTZ
 */

import {
    simulateFinancing,
    calculateComplianceStatus,
    calculateInactionCost,
    estimateDPEByYear,
    formatCurrency,
} from '../calculator';

describe('MaPrimeRénov Copropriété 2026', () => {
    describe('simulateFinancing', () => {
        it('calcule correctement 55% pour sortie passoire F → C (45% base + 10% bonus)', () => {
            const result = simulateFinancing(
                300000, // coût HT
                20,     // nb lots
                'F',    // DPE actuel
                'C',    // DPE cible
                0,      // lots commerciaux
                0,      // aide locale
                0,      // fonds ALUR
                0       // CEE
            );

            // Gain énergétique F→C = 3 classes = 55%
            expect(result.mprRate).toBeCloseTo(0.55, 2);
            expect(result.exitPassoireBonus).toBe(0.10);
        });

        it('calcule correctement 30% pour amélioration standard (35-50% gain)', () => {
            const result = simulateFinancing(
                300000,
                20,
                'E',    // DPE E
                'C',    // DPE C (2 classes = 40% gain)
                0, 0, 0, 0
            );

            // 40% gain = taux standard 30%
            expect(result.mprRate).toBeCloseTo(0.30, 2);
            expect(result.exitPassoireBonus).toBe(0);
        });

        it('calcule correctement 45% pour performance (>50% gain)', () => {
            const result = simulateFinancing(
                300000,
                20,
                'F',    // DPE F
                'A',    // DPE A (5 classes = 55% gain)
                0, 0, 0, 0
            );

            // 55% gain = taux performance 45% + 10% bonus
            expect(result.mprRate).toBeCloseTo(0.55, 2);
        });

        it('exclut les lots commerciaux du calcul MPR', () => {
            const result = simulateFinancing(
                300000,
                20,
                'F',
                'C',
                5,      // 5 lots commerciaux
                0, 0, 0
            );

            // Seuls 15 lots résidentiels éligibles
            const expectedCeiling = 15 * 25000; // 375 000€
            // mprAmount doit être calculé sur cette assiette
            expect(result.mprAmount).toBeGreaterThan(0);
            expect(result.mprAmount).toBeLessThanOrEqual(expectedCeiling * 0.55);
        });

        it('calcule correctement l\'Éco-PTZ plafonné à 50k€ par lot', () => {
            const result = simulateFinancing(
                1000000, // Gros projet
                10,      // 10 lots
                'G',
                'C',
                0, 0, 0, 0
            );

            // Plafond Éco-PTZ = 10 * 50 000 = 500 000€
            expect(result.ecoPtzAmount).toBeLessThanOrEqual(500000);
        });

        it('génère une erreur si nb lots = 0', () => {
            expect(() => {
                simulateFinancing(300000, 0, 'F', 'C');
            }).toThrow('Le nombre de lots doit être supérieur à 0');
        });

        it('génère une erreur si coût = 0', () => {
            expect(() => {
                simulateFinancing(0, 20, 'F', 'C');
            }).toThrow('Le coût HT doit être supérieur à 0');
        });
    });
});

describe('Loi Climat — Statut de conformité', () => {
    describe('calculateComplianceStatus', () => {
        it('DPE G est interdit depuis 2025', () => {
            const result = calculateComplianceStatus('G', new Date('2026-01-01'));
            expect(result.isProhibited).toBe(true);
            expect(result.statusLabel).toBe('INTERDIT');
            expect(result.urgencyLevel).toBe('critical');
        });

        it('DPE F est interdit en 2028', () => {
            const result = calculateComplianceStatus('F', new Date('2026-01-01'));
            expect(result.isProhibited).toBe(false);
            expect(result.prohibitionDate).toEqual(new Date('2028-01-01'));
            expect(result.urgencyLevel).toBe('high');
        });

        it('DPE E est interdit en 2034', () => {
            const result = calculateComplianceStatus('E', new Date('2026-01-01'));
            expect(result.prohibitionDate).toEqual(new Date('2034-01-01'));
        });

        it('DPE D est conforme (pas d\'interdiction)', () => {
            const result = calculateComplianceStatus('D', new Date('2026-01-01'));
            expect(result.isProhibited).toBe(false);
            expect(result.prohibitionDate).toBeNull();
            expect(result.urgencyLevel).toBe('low');
        });

        it('calcule correctement les jours restants', () => {
            const refDate = new Date('2027-01-01'); // 1 an avant interdiction F
            const result = calculateComplianceStatus('F', refDate);
            expect(result.daysUntilProhibition).toBeGreaterThan(360);
            expect(result.daysUntilProhibition).toBeLessThanOrEqual(366);
        });
    });
});

describe('Coût de l\'inaction', () => {
    describe('calculateInactionCost', () => {
        it('calcule l\'inflation BTP sur 3 ans', () => {
            const cost = 300000;
            const result = calculateInactionCost(
                cost,
                20,
                'G',
                3500,   // prix m²
                65      // surface moyenne
            );

            // Inflation 4.5% composée sur 3 ans
            const expectedInflation = cost * (Math.pow(1.045, 3) - 1);
            const actualInflation = result.projectedCost3Years - result.currentCost;
            expect(actualInflation).toBeCloseTo(expectedInflation, 0);
            expect(result.projectedCost3Years).toBeGreaterThan(cost);
        });

        it('calcule la décote pour DPE F/G', () => {
            const result = calculateInactionCost(
                300000,
                20,
                'F',    // DPE F = décote
                3500,
                65
            );

            // Il doit y avoir une perte de valeur
            expect(result.valueDepreciation).toBeGreaterThan(0);
        });

        it('ne calcule pas de décote pour DPE A-D', () => {
            const result = calculateInactionCost(
                300000,
                20,
                'C',    // DPE C = pas de décote
                3500,
                65
            );

            expect(result.valueDepreciation).toBe(0);
        });
    });
});

describe('Utilitaires', () => {
    describe('estimateDPEByYear', () => {
        it('estime correctement les vieux immeubles', () => {
            // const { estimateDPEByYear } = require('../mocks'); <--- REMOVED

            expect(estimateDPEByYear(1900)).toBe('G');
            expect(estimateDPEByYear(1960)).toBe('F');
            expect(estimateDPEByYear(2010)).toBe('C');
            expect(estimateDPEByYear(2022)).toBe('A');
        });
    });

    describe('formatCurrency', () => {
        it('formate correctement les euros', () => {
            expect(formatCurrency(150000)).toMatch(/150\s?000/);
            expect(formatCurrency(150000)).toContain('€');
        });
    });
});

describe('Intégration — Scénario complet', () => {
    it('scénario: Copro F → C, 20 lots, 300k€', () => {
        // 1. Vérification conformité
        const compliance = calculateComplianceStatus('F', new Date('2026-01-01'));
        expect(compliance.urgencyLevel).toBe('high');

        // 2. Simulation financement
        const financing = simulateFinancing(300000, 20, 'F', 'C');

        // Vérifications cohérence
        expect(financing.mprRate).toBeCloseTo(0.55, 2);
        expect(financing.totalCostHT).toBeGreaterThan(300000); // Avec frais
        expect(financing.remainingCost).toBeGreaterThanOrEqual(0);
        expect(financing.monthlyPayment).toBeGreaterThanOrEqual(0);

        // 3. Coût inaction
        // 3. Coût inaction
        const inaction = calculateInactionCost(300000, 20, 'F', 3500, 65);
        const inflationCost = inaction.projectedCost3Years - inaction.currentCost;
        expect(inaction.totalInactionCost).toBeGreaterThan(inflationCost);

        // 4. Le reste à charge doit être inférieur au coût total
        expect(financing.remainingCost).toBeLessThan(financing.totalCostHT);
    });
});
