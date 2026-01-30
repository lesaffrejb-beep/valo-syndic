import { test, expect } from '@playwright/test';

test('Critical Flow: Load Demo and Submit', async ({ page }) => {
    await page.goto('/');

    // 1. Verify Home Page
    await expect(page).toHaveTitle(/VALO-SYNDIC/);
    
    // Vérifier que le header/titre principal est visible (⚡ Diagnostic Flash)
    await expect(page.locator('text=Diagnostic Flash').first()).toBeVisible();

    // 2. Load Demo Data
    const demoBtn = page.locator('button:has-text("📋 Charger un exemple")');
    await expect(demoBtn).toBeVisible();
    await demoBtn.click();

    // Verify form is filled (spot check)
    const unitsInput = page.locator('input[name="numberOfUnits"]');
    await expect(unitsInput).toHaveValue('45');

    // 3. Submit Form
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // 4. Wait for Results
    // The app scrolls to #results and shows loading state first
    await expect(page.locator('#results')).toBeVisible({ timeout: 15000 });
    
    // Wait for the actual results to appear (not just loading)
    // Check for a key result component like FinancingCard or ValuationCard
    await expect(page.locator('text=Plan de Financement').first()).toBeVisible({ timeout: 15000 });

    // 5. Verify Key Components Loaded
    // Check for Financing & Aides section
    await expect(page.locator('text=Plan de Financement').first()).toBeVisible();
    // Check for Valuation section  
    await expect(page.locator('text=Valorisation').first()).toBeVisible();
});
