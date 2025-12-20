import { JVS_AREALS } from './data.js';
import { initializeMap, renderMarkers, recenterMap, filterAreals } from './map-controller.js';
import { initializeUI, toggleMenu, updateStats, setupRouteActions, setupFilterActions } from './ui-controller.js';
import { registerServiceWorker } from './pwa-controller.js'; 
import { initializeManuAIChat } from './manu-ai-controller.js'; // NOVÝ IMPORT

// --- Utility funkce (Stejné) ---
// ... export function showToast(message) { ... }
export function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'show';
    // Automatické skrytí po 3 sekundách
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}


// --- Logika Akordeonu (Stejné) ---
function setupAccordions() {
    const triggers = document.querySelectorAll('.acc-trigger');
    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const sectionId = trigger.dataset.accordion;
            const section = document.getElementById(sectionId);
            
            // Zavřít všechny ostatní sekce
            document.querySelectorAll('.acc-section').forEach(s => {
                // Přidáno manu-ai-section pro zavření ostatních
                if (s.id !== sectionId && s.classList.contains('active')) {
                    s.classList.remove('active');
                }
            });
            
            // Přepnout aktivní sekci
            section.classList.toggle('active');

            // Zavřít menu na mobilu, pokud je rozbaleno
            const mainPanel = document.getElementById('main-panel');
            if (window.innerWidth <= 768 && !mainPanel.classList.contains('collapsed')) {
                 mainPanel.classList.add('collapsed');
            }
        });
    });
}


// --- Inicializace aplikace ---

function initApp() {
    // 1. Nastavení PWA
    registerServiceWorker();

    // 2. Inicializace Mapy
    const mapInstance = initializeMap(JVS_AREALS);
    
    // 3. Inicializace UI a ovládacích prvků
    setupAccordions();
    setupRouteActions();
    setupFilterActions(mapInstance, JVS_AREALS); 
    initializeUI(mapInstance, JVS_AREALS);
    
    // ************************************
    // 4. Inicializace Barbieri e-ManuAI (NOVÝ KROK)
    initializeManuAIChat();
    // ************************************

    // 5. Počáteční vykreslení
    renderMarkers(mapInstance, JVS_AREALS);
    updateStats(JVS_AREALS);

    // 6. Navěšení hlavních event listenerů
    document.getElementById('menu-toggle').addEventListener('click', toggleMenu);
    document.getElementById('recenter-map-btn').addEventListener('click', () => recenterMap(mapInstance, JVS_AREALS));
    
    // Původní Puter.js / Claude AI Asistent kód ODSTRANĚN.
    // Dříve zde byl kód pro #ai-assistant-btn, který byl z index.html odstraněn.

    console.log('Aplikace JVS Management System byla úspěšně inicializována.');
}

// Spuštění aplikace po načtení DOM
document.addEventListener('DOMContentLoaded', initApp);
