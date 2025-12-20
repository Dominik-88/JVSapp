import { JVS_AREALS } from './data.js';
import { initializeMap, renderMarkers, recenterMap, filterAreals } from './map-controller.js';
import { initializeUI, toggleMenu, updateStats, setupRouteActions, setupFilterActions } from './ui-controller.js';
import { registerServiceWorker } from './pwa-controller.js'; // Přesuneme logiku PWA do samostatného kontroleru

// --- Utility funkce ---

/**
 * Zobrazí toast notifikaci na obrazovce.
 * @param {string} message - Zpráva k zobrazení.
 */
export function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'show';
    // Automatické skrytí po 3 sekundách
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// --- Logika Akordeonu ---

/**
 * Inicializuje akordeon (rozbalování sekcí) v postranním panelu.
 */
function setupAccordions() {
    const triggers = document.querySelectorAll('.acc-trigger');
    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const sectionId = trigger.dataset.accordion;
            const section = document.getElementById(sectionId);
            
            // Zavřít všechny ostatní sekce
            document.querySelectorAll('.acc-section').forEach(s => {
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
    setupFilterActions(mapInstance, JVS_AREALS); // Nastavení filterů a navěšení na mapu
    initializeUI(mapInstance, JVS_AREALS);
    
    // 4. Počáteční vykreslení
    renderMarkers(mapInstance, JVS_AREALS);
    updateStats(JVS_AREALS);

    // 5. Navěšení hlavních event listenerů
    document.getElementById('menu-toggle').addEventListener('click', toggleMenu);
    document.getElementById('recenter-map-btn').addEventListener('click', () => recenterMap(mapInstance, JVS_AREALS));
    
    // Puter.js / Claude AI Asistent
    document.getElementById('ai-assistant-btn').addEventListener('click', () => {
        if (typeof Puter !== 'undefined') {
            Puter.ai({
                prompt: 'Jsi Claude AI Asistent pro údržbáře JVS. Poskytni rychlou pomoc s plánováním, navigací nebo informacemi o areálech (má být jich 41). Tvůj úkol je pomáhat s prací v terénu.',
                model: 'claude-4.5-sonnet', 
                context: `Aktuální areály: ${JVS_AREALS.map(a => a.name).join(', ')}`,
                title: 'Claude AI - JVS Asistent',
                placeholder: 'Zeptej se na cokoliv ohledně areálů...',
                button: 'Zeptej se asistenta'
            });
        } else {
            showToast('❌ AI Asistent není dostupný.');
        }
    });

    console.log('Aplikace JVS Management System byla úspěšně inicializována.');
}

// Spuštění aplikace po načtení DOM
document.addEventListener('DOMContentLoaded', initApp);
