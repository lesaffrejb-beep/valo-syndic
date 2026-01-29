/**
 * VALO-SYNDIC Extension — Background Service Worker
 * ===================================================
 * Handles cross-tab communication and persistent logic.
 */

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PING') {
        sendResponse({ status: 'ok', version: '1.0.0' });
    }
    return true;
});

// Handle extension install/update
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('VALO-SYNDIC Extension installed');
    } else if (details.reason === 'update') {
        console.log('VALO-SYNDIC Extension updated to', chrome.runtime.getManifest().version);
    }
});

// Keep service worker alive (optional, for development)
// chrome.alarms.create('keepAlive', { periodInMinutes: 0.5 });
// chrome.alarms.onAlarm.addListener(() => {});
