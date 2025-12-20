/**
 * js/pwa-controller.js
 * Logika pro registraci a správu Service Workera (PWA).
 */

import { showToast } from './app.js';

/**
 * Registruje Service Workera pro zajištění offline funkčnosti.
 */
export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registrován úspěšně:', registration.scope);
                    showToast('🌍 Aplikace je připravena pro offline režim.');
                })
                .catch(err => {
                    console.error('Registrace Service Workera selhala:', err);
                });
        });

        // Logika pro automatickou aktualizaci, pokud je dostupná nová verze
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            showToast('🔄 Nová verze aplikace dostupná! Aktualizujte pro změny.');
        });
    } else {
        console.warn('Váš prohlížeč nepodporuje Service Worker. Offline režim nebude fungovat.');
    }
}
