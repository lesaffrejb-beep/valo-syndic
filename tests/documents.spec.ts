import { test, expect } from '@playwright/test';

test.describe('Document Generation', () => {

    test.beforeEach(async ({ page }) => {
        // Navigate and submit form to get results
        await page.goto('/');
        await page.locator('button:has-text("📋 Charger un exemple")').click();
        await page.locator('button[type="submit"]').click();
        await expect(page.locator('#results')).toBeVisible({ timeout: 15000 });
    });

    test('PDF Download Button is present', async ({ page }) => {
        // Text: [PDF] Telecharger le Rapport
        // Note: PDFDownloadLink usually renders an anchor tag
        const pdfBtn = page.locator('a, button').filter({ hasText: "Telecharger le Rapport" });
        await expect(pdfBtn).toBeVisible();
        // It might differ in enabled state depending on loading, but usually it's enabled after generation.
        // Since it's client-side generation, it might take a moment to be ready (loading state).
        // The test just checks visibility.
    });

    test('PPTX Download Button is present (Disabled V2)', async ({ page }) => {
        // Text: [PPTX] PowerPoint
        const pptxBtn = page.locator('button').filter({ hasText: "PowerPoint" });
        await expect(pptxBtn).toBeVisible();
        await expect(pptxBtn).toBeDisabled();
    });

    test('Convocation Download Button is present (Disabled V2)', async ({ page }) => {
        // Text: Projet de Résolution
        const convocBtn = page.locator('button').filter({ hasText: "Projet de Résolution" });
        await expect(convocBtn).toBeVisible();
        await expect(convocBtn).toBeDisabled();
    });

});
