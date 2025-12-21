// js/app.js (Hlavní spouštěcí modul)

import { initializeMap, renderMarkers, filterAreals, recenterMap } from './map-controller.js';
import { initUI, updateStats, getChatInput, getChatSendBtn, addChatMessage } from './ui-controller.js';

// --- GLOBÁLNÍ KONFIGURACE A PROMĚNNÉ ---
const AREAL_API_URL = 'data/arealy.json'; // Zdroj dat areálů
const MANUAL_API_URL = 'data/manual.json'; // Zdroj dat manuálu
let allArealsCache = []; 
let manualDataCache = []; 

// --- DOM ELEMENTY (Připojení k prvkům z index.html) ---
const searchInput = document.getElementById('search-input');
const filterOkres = document.getElementById('filter-okres');
const filterKategorie = document.getElementById('filter-kategorie');
const applyFiltersBtn = document.getElementById('apply-filters-btn');
const recenterMapBtn = document.getElementById('recenter-map-btn');
const toastElement = document.getElementById('toast');


// --- UTILITY ---

/** Zobrazí dočasné upozornění (Toast). */
export function showToast(message, type = 'success') {
    if (toastElement.classList.contains('permanent-warning')) {
        toastElement.classList.remove('permanent-warning');
        toastElement.textContent = '';
    }

    toastElement.textContent = message;
    toastElement.className = `show ${type}`;
    
    setTimeout(() => {
        if (!toastElement.classList.contains('permanent-warning')) {
            toastElement.className = toastElement.className.replace('show', '');
        }
    }, 3000);
}

/** Zobrazí trvalé varování o offline mapě. */
export function showOfflineWarning() {
    const toast = document.getElementById('toast');
    toast.textContent = '🗺️ Offline režim. Nové mapové dlaždice nejsou dostupné.';
    toast.className = 'show permanent-warning';
}


// --- DATOVÁ LOGIKA ---

/** Načte data areálů. Vrací prázdné pole v případě chyby. */
async function fetchArealData() {
    try {
        const response = await fetch(AREAL_API_URL);
        if (!response.ok) {
            throw new Error(`Chyba načítání dat areálů: ${response.statusText}`);
        }
        allArealsCache = await response.json();
        
        // KRITICKÁ ZMĚNA: ID se nyní generuje z názvu a indexu, ne z 'cislo_popisne'.
        allArealsCache = allArealsCache.map((areal, index) => ({
            ...areal,
            // Vytvoříme unikátní, URL-přátelský ID
            id: areal.jmeno.replace(/\s/g, '_').toLowerCase() + '_' + index
        }));

        showToast(`Data ${allArealsCache.length} areálů úspěšně načtena.`);
        return allArealsCache;
    } catch (error) {
        console.error("Kritická chyba při načítání areálů:", error);
        showToast('Kritická chyba načítání areálů. Pracujete v offline režimu bez nových dat.', 'error');
        allArealsCache = [];
        return [];
    }
}

/** Načte data manuálu pro AI. Interně ošetřuje chyby, aby neshodil Promise.all. */
async function fetchManualData() {
    try {
        const response = await fetch(MANUAL_API_URL);
        if (!response.ok) {
            throw new Error(`Chyba načítání manuálu: ${response.statusText}`);
        }
        manualDataCache = await response.json();
        showToast('Manuál pro XROT 95 EVO načten.', 'info');
    } catch (error) {
        console.error("Chyba při načítání manuálu:", error);
        manualDataCache = []; // Nastavíme prázdné pole
    }
}


/**
 * Aplikuje filtry na seznam areálů a aktualizuje mapu a statistiky.
 */
function applyFilters(mapInstance, allAreals) {
    const filters = {
        search: searchInput.value.trim(),
        okres: filterOkres.value,
        kategorie: filterKategorie.value
    };

    const filteredAreals = filterAreals(mapInstance, allAreals, filters);
    updateStats(filteredAreals); 
    
    return filteredAreals;
}


// --- LOGIKA CHATBOTA (ManuAI) ---

/**
 * Simulační funkce pro odpověď Barbieri e-ManuAI, která prohledává manualDataCache.
 */
function handleAiQuery(userQuery) {
    addChatMessage(userQuery, 'user');
    const inputField = getChatInput();
    inputField.value = '';

    const queryLower = userQuery.toLowerCase().trim();
    let botResponse = "Omlouvám se, na Váš dotaz nemám v manuálu XROT 95 EVO přímou odpověď. Zkuste hledat klíčová slova jako 'olej', 'chyba' nebo 'rtk'.";
    
    // Prohledání dat z manuálu na základě tagů
    const foundEntry = manualDataCache.find(entry => {
        return entry.tags.some(tag => queryLower.includes(tag));
    });

    if (foundEntry) {
        botResponse = `[${foundEntry.keyword.toUpperCase()}]: ${foundEntry.response} (Sekce: ${foundEntry.detail_link})`;
    } else if (queryLower.includes('trasa') || queryLower.includes('areál') || queryLower.includes('mapa')) {
        botResponse = "Jsem určen primárně pro manuál k sekačce XROT. Pro práci s trasami a areály použijte prosím mapu a filtry v hlavním menu.";
    }

    // Simulace zátěže
    setTimeout(() => {
        addChatMessage(botResponse, 'bot');
    }, 800);
}

// --- POSLUCHAČE UDÁLOSTÍ ---

/** Nastaví všechny event listenery. */
function setupListeners(mapInstance, allAreals) {
    
    // 1. Tlačítko pro aplikování filtrů
    applyFiltersBtn.addEventListener('click', () => {
        applyFilters(mapInstance, allAreals);
    });
    
    // 2. Tlačítko pro vycentrování mapy
    recenterMapBtn.addEventListener('click', () => {
        recenterMap(mapInstance, applyFilters(mapInstance, allAreals));
    });

    // 3. ManuAI Chatbot
    const chatInput = getChatInput();
    const chatSendBtn = getChatSendBtn();

    // Odeslání kliknutím a Enterem
    const sendQuery = () => {
        const query = chatInput.value.trim();
        if (query.length > 0) {
            handleAiQuery(query);
        }
    };
    
    chatSendBtn.addEventListener('click', sendQuery);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendQuery();
        }
    });
}

// --- INICIALIZACE A SPUŠTĚNÍ ---

async function init() {
    // KRITICKÁ OPRAVA: Načteme data. Promise.all by neměl selhat, protože fetch funkce obsluhují chyby.
    await Promise.all([
        fetchArealData(),
        fetchManualData() 
    ]);
    
    // Data areálů získáme z globální proměnné po jejich naplnění
    const allAreals = allArealsCache;

    // Inicializujeme UI a mapu bez ohledu na to, zda data areálů selhala
    const mapInstance = initializeMap(allAreals);

    // Callback pro ui-controller.js: Vynutí překreslení mapy
    const updateMapMarkers = () => {
        applyFilters(mapInstance, allAreals);
    };
    initUI(updateMapMarkers); 

    if (allAreals.length === 0) {
        // Zobrazíme upozornění, ale UI a mapa je funkční
        showToast('Mapa byla inicializována, ale chybí data areálů.', 'error');
        return; 
    }
    
    // 2. Počáteční vykreslení a statistiky
    const initialFilters = { search: '', okres: 'all', kategorie: 'all' };
    const initialFiltered = filterAreals(mapInstance, allAreals, initialFilters);
    updateStats(initialFiltered); 

    // 3. Nastavení posluchačů událostí
    setupListeners(mapInstance, allAreals);

    // 4. Vycentrování na všechny areály po načtení
    recenterMap(mapInstance, allAreals);
}

document.addEventListener('DOMContentLoaded', init);


// --- REGISTRACE SERVICE WORKERU PRO PWA ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('Service Worker registrován úspěšně:', registration);
            })
            .catch(error => {
                console.error('Registrace Service Workeru selhala:', error);
            });
    });
}
