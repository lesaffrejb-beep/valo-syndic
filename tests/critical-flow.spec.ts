import { test, expect } from '@playwright/test';

test('Critical Flow: Load Demo and Submit', async ({ page }) => {
    await page.goto('/');

    // 1. Verify Home Page (Exact title match or regex)
    await expect(page).toHaveTitle(/VALO-SYNDIC/);
    await expect(page.locator('text=Votre diagnostic patrimonial')).toBeVisible();

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
    // The app scrolls to #results
    await expect(page.locator('#results')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Évaluation Préliminaire')).toBeVisible();

    // 5. Verify Key Components Loaded
    await expect(page.locator('text=Diagnostic Flash')).toBeVisible();
});
