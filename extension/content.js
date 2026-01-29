/**
 * VALO-SYNDIC Extension — Content Script
 * =======================================
 * Injected into web pages to enable data extraction.
 * Listens for messages from the popup.
 */

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'EXTRACT_LOTS') {
        const lots = extractLotsFromDOM();
        sendResponse({ lots });
    }
    return true; // Keep channel open for async response
});

// Extract lots from current page DOM
function extractLotsFromDOM() {
    const lots = [];

    // Try multiple extraction strategies

    // Strategy 1: Standard HTML tables
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        const extracted = extractFromTable(table);
        lots.push(...extracted);
    });

    // Strategy 2: Grid layouts (common in modern ERPs)
    const grids = document.querySelectorAll('[class*="grid"], [class*="list"]');
    grids.forEach(grid => {
        const extracted = extractFromGrid(grid);
        lots.push(...extracted);
    });

    // Deduplicate
    const unique = deduplicateLots(lots);

    return unique;
}

function extractFromTable(table) {
    const lots = [];
    const headers = Array.from(table.querySelectorAll('th')).map(th =>
        th.textContent?.toLowerCase().trim() || ''
    );

    // Detect relevant columns
    const colMap = {
        lotId: headers.findIndex(h => /lot|n°|numéro|id/i.test(h)),
        tantiemes: headers.findIndex(h => /tantième|quote|millième|part/i.test(h)),
        surface: headers.findIndex(h => /surface|m²|m2|superficie/i.test(h)),
        type: headers.findIndex(h => /type|nature|désignation|catégorie/i.test(h)),
    };

    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length < 2) return;

        const lot = {
            lotId: colMap.lotId >= 0 ? cells[colMap.lotId]?.textContent?.trim() : null,
            tantiemes: colMap.tantiemes >= 0 ? parseNumber(cells[colMap.tantiemes]?.textContent) : null,
            surface: colMap.surface >= 0 ? parseFloat(cells[colMap.surface]?.textContent?.replace(',', '.')) : null,
            type: colMap.type >= 0 ? cells[colMap.type]?.textContent?.trim() : null,
        };

        if (lot.lotId || lot.tantiemes) {
            lots.push(lot);
        }
    });

    return lots;
}

function extractFromGrid(grid) {
    // Placeholder for grid extraction - can be expanded for specific ERPs
    return [];
}

function parseNumber(str) {
    if (!str) return null;
    const cleaned = str.replace(/[^\d]/g, '');
    return cleaned ? parseInt(cleaned, 10) : null;
}

function deduplicateLots(lots) {
    const seen = new Set();
    return lots.filter(lot => {
        const key = lot.lotId || JSON.stringify(lot);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

// Visual indicator that extension is active
console.log('🏢 VALO-SYNDIC Importer actif sur cette page');
