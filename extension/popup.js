/**
 * VALO-SYNDIC Extension — Popup Script
 * =====================================
 * Orchestrates scanning and data extraction from ERP pages.
 */

// DOM Elements
const scanBtn = document.getElementById('scanBtn');
const statusEl = document.getElementById('status');
const resultsEl = document.getElementById('results');
const lotsPreviewEl = document.getElementById('lotsPreview');
const exportBtn = document.getElementById('exportBtn');
const sendBtn = document.getElementById('sendBtn');

// State
let extractedLots = [];

// Status helpers
function setStatus(type, text, icon) {
    statusEl.className = `status ${type}`;
    statusEl.innerHTML = `
    <span class="status-icon">${icon}</span>
    <span class="status-text">${text}</span>
  `;
}

// Render lots preview
function renderLots(lots) {
    if (lots.length === 0) {
        lotsPreviewEl.innerHTML = '<p style="color: var(--text-muted); font-size: 12px;">Aucun lot détecté</p>';
        return;
    }

    lotsPreviewEl.innerHTML = lots.slice(0, 10).map(lot => `
    <div class="lot-item">
      <span class="lot-id">Lot ${lot.lotId || lot.id || '?'}</span>
      <span class="lot-tantiemes">${lot.tantiemes || '?'}/1000</span>
    </div>
  `).join('');

    if (lots.length > 10) {
        lotsPreviewEl.innerHTML += `
      <div class="lot-item" style="justify-content: center; color: var(--text-muted);">
        ... et ${lots.length - 10} autres lots
      </div>
    `;
    }
}

// Scan current tab
async function scanPage() {
    setStatus('idle', 'Analyse en cours...', '⏳');
    scanBtn.disabled = true;

    try {
        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab?.id) {
            throw new Error('Impossible d\'accéder à l\'onglet actif');
        }

        // Execute content script and get results
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: extractLotsFromPage,
        });

        const lots = results[0]?.result || [];
        extractedLots = lots;

        if (lots.length > 0) {
            setStatus('success', `${lots.length} lots détectés !`, '✅');
            resultsEl.classList.remove('hidden');
            renderLots(lots);
        } else {
            setStatus('error', 'Aucun lot trouvé sur cette page', '❌');
            resultsEl.classList.add('hidden');
        }

    } catch (error) {
        console.error('Scan error:', error);
        setStatus('error', `Erreur: ${error.message}`, '⚠️');
    } finally {
        scanBtn.disabled = false;
    }
}

// Copy JSON to clipboard
function exportJSON() {
    const json = JSON.stringify({
        source: 'valo-syndic-extension',
        version: '1.0.0',
        extractedAt: new Date().toISOString(),
        lots: extractedLots,
    }, null, 2);

    navigator.clipboard.writeText(json).then(() => {
        const originalText = exportBtn.innerHTML;
        exportBtn.innerHTML = '✓ Copié !';
        setTimeout(() => {
            exportBtn.innerHTML = originalText;
        }, 2000);
    });
}

// Send to VALO-SYNDIC app
async function sendToValo() {
    try {
        // Find VALO-SYNDIC tab
        const tabs = await chrome.tabs.query({});
        const valoTab = tabs.find(t =>
            t.url?.includes('localhost:3000') ||
            t.url?.includes('valo-syndic') ||
            t.url?.includes('vercel.app')
        );

        if (!valoTab) {
            // Open VALO-SYNDIC in new tab with data in URL
            const encodedData = encodeURIComponent(JSON.stringify(extractedLots));
            chrome.tabs.create({
                url: `http://localhost:3000?import=${encodedData}`
            });
            return;
        }

        // Send message to existing tab
        await chrome.tabs.sendMessage(valoTab.id, {
            type: 'VALO_IMPORT',
            lots: extractedLots,
        });

        // Switch to that tab
        chrome.tabs.update(valoTab.id, { active: true });

        setStatus('success', 'Données envoyées !', '🚀');

    } catch (error) {
        console.error('Send error:', error);
        // Fallback: copy to clipboard
        exportJSON();
        setStatus('error', 'Copié dans le presse-papier (fallback)', '📋');
    }
}

// Content script function (injected into page)
function extractLotsFromPage() {
    const lots = [];

    // Strategy 1: Look for tables with lot data
    const tables = document.querySelectorAll('table');

    for (const table of tables) {
        const headers = Array.from(table.querySelectorAll('th, thead td')).map(th =>
            th.textContent?.toLowerCase().trim() || ''
        );

        // Check if this looks like a lots table
        const hasLotColumn = headers.some(h =>
            h.includes('lot') || h.includes('numéro') || h.includes('n°')
        );
        const hasTantiemesColumn = headers.some(h =>
            h.includes('tantième') || h.includes('quote') || h.includes('millième')
        );

        if (hasLotColumn || hasTantiemesColumn) {
            // Find column indices
            const lotIndex = headers.findIndex(h =>
                h.includes('lot') || h.includes('numéro') || h.includes('n°')
            );
            const tantiemesIndex = headers.findIndex(h =>
                h.includes('tantième') || h.includes('quote') || h.includes('millième')
            );
            const surfaceIndex = headers.findIndex(h =>
                h.includes('surface') || h.includes('m²') || h.includes('m2')
            );
            const typeIndex = headers.findIndex(h =>
                h.includes('type') || h.includes('nature') || h.includes('désignation')
            );

            // Extract rows
            const rows = table.querySelectorAll('tbody tr, tr:not(:first-child)');

            for (const row of rows) {
                const cells = Array.from(row.querySelectorAll('td'));
                if (cells.length < 2) continue;

                const lot = {
                    lotId: lotIndex >= 0 ? cells[lotIndex]?.textContent?.trim() : null,
                    tantiemes: tantiemesIndex >= 0 ? parseInt(cells[tantiemesIndex]?.textContent?.replace(/\D/g, '') || '0', 10) : null,
                    surface: surfaceIndex >= 0 ? parseFloat(cells[surfaceIndex]?.textContent?.replace(/[^\d.,]/g, '').replace(',', '.') || '0') : null,
                    type: typeIndex >= 0 ? cells[typeIndex]?.textContent?.trim() : null,
                };

                // Only add if we have at least an ID or tantiemes
                if (lot.lotId || lot.tantiemes) {
                    lots.push(lot);
                }
            }
        }
    }

    // Strategy 2: Look for specific ERP patterns (ICS, Thetrawin, Powimo)
    // This can be expanded based on real ERP DOM structures

    // ICS pattern: div.lot-card or similar
    const icsLots = document.querySelectorAll('[class*="lot"], [data-lot]');
    for (const el of icsLots) {
        const text = el.textContent || '';
        const lotMatch = text.match(/lot\s*[:\s]*(\d+)/i);
        const tantiemesMatch = text.match(/(\d+)\s*\/?\s*1000/i);

        if (lotMatch || tantiemesMatch) {
            lots.push({
                lotId: lotMatch?.[1] || null,
                tantiemes: tantiemesMatch ? parseInt(tantiemesMatch[1], 10) : null,
                source: 'pattern-match',
            });
        }
    }

    // Deduplicate by lotId
    const seen = new Set();
    const uniqueLots = lots.filter(lot => {
        const key = lot.lotId || JSON.stringify(lot);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    return uniqueLots;
}

// Event listeners
scanBtn.addEventListener('click', scanPage);
exportBtn.addEventListener('click', exportJSON);
sendBtn.addEventListener('click', sendToValo);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setStatus('idle', 'Cliquez sur "Scanner" pour analyser la page', '🔍');
});
