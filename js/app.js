// js/app.js (Hlavní spouštěcí modul)

import { initializeMap, renderMarkers, filterAreals, recenterMap } from './map-controller.js';
import { initUI, updateStats, getChatInput, getChatSendBtn, addChatMessage } from './ui-controller.js';

// --- GLOBÁLNÍ KONFIGURACE A PROMĚNNÉ ---
const API_URL = 'data/arealy.json'; // Lokální zdroj dat
let allArealsCache = []; // Zásobník pro všechna původní data

// --- DOM ELEMENTY ---
const searchInput = document.getElementById('search-input');
const filterOkres = document.getElementById('filter-okres');
const filterKategorie = document.getElementById('filter-kategorie');
const applyFiltersBtn = document.getElementById('apply-filters-btn');
const recenterMapBtn = document.getElementById('recenter-map-btn');
const toastElement = document.getElementById('toast');


// --- UTILITY ---

/** Zobrazí dočasné upozornění (Toast). */
export function showToast(message, type = 'success') {
    // Odstranění trvalého varování, pokud bylo zobrazeno
    if (toastElement.classList.contains('permanent-warning')) {
        toastElement.classList.remove('permanent-warning');
        toastElement.textContent = '';
    }

    toastElement.textContent = message;
    toastElement.className = `show ${type}`;
    
    // Schovat po 3 sekundách, pokud se nejedná o trvalé varování
    setTimeout(() => {
        if (!toastElement.classList.contains('permanent-warning')) {
            toastElement.className = toastElement.className.replace('show', '');
        }
    }, 3000);
}

/** Zobrazí trvalé varování o offline mapě. */
export function showOfflineWarning() {
    // Přidání logiky do ui-controller.js
    const toast = document.getElementById('toast');
    toast.textContent = '🗺️ Offline režim. Nové mapové dlaždice nejsou dostupné.';
    toast.className = 'show permanent-warning';
}


// --- DATOVÁ LOGIKA ---

/** Načte data areálů z lokálního JSON souboru. */
async function fetchArealData() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Chyba načítání dat: ${response.statusText}`);
        }
        allArealsCache = await response.json();
        
        // Přidání unikátního ID pro snadnější práci s trasou
        allArealsCache = allArealsCache.map((areal, index) => ({
            ...areal,
            id: areal.cislo_popisne + '_' + areal.gps_rtk.lat.toFixed(4)
        }));

        showToast('Data areálů úspěšně načtena.');
        return allArealsCache;
    } catch (error) {
        console.error("Kritická chyba při načítání dat:", error);
        showToast('Kritická chyba načítání dat. Pracujete v offline režimu bez nových dat.', 'error');
        return [];
    }
}

/**
 * Aplikuje filtry na seznam areálů a aktualizuje mapu a statistiky.
 * @param {L.Map} mapInstance - Instance mapy.
 * @param {Array<Object>} allAreals - Původní seznam areálů.
 * @returns {Array<Object>} Filtrovaný seznam areálů.
 */
function applyFilters(mapInstance, allAreals) {
    const filters = {
        search: searchInput.value.trim(),
        okres: filterOkres.value,
        kategorie: filterKategorie.value
    };

    // 1. Filtrování areálů
    const filteredAreals = filterAreals(mapInstance, allAreals, filters);

    // 2. Aktualizace Statistik (NOVÁ ČÁST)
    updateStats(filteredAreals); 

    // 3. Zpětná vazba pro uživatele
    showToast(`Zobrazeno ${filteredAreals.length} areálů.`, 'info');
    
    return filteredAreals;
}


// --- LOGIKA CHATBOTA (ManuAI) ---

/**
 * Simulační funkce pro odpověď Barbieri e-ManuAI.
 * @param {string} userQuery - Dotaz uživatele.
 */
function handleAiQuery(userQuery) {
    addChatMessage(userQuery, 'user');
    const inputField = getChatInput();
    inputField.value = ''; // Vyčistit pole

    // Simulace zátěže (odpověď přijde po chvíli)
    setTimeout(() => {
        const queryLower = userQuery.toLowerCase();
        let botResponse;

        if (queryLower.includes('olej')) {
            botResponse = "Pro model XROT 95 EVO doporučujeme syntetický olej 5W-30. Pravidelná výměna je po 100 provozních hodinách.";
        } else if (queryLower.includes('chyba')) {
            botResponse = "Pokud se zobrazí chybový kód E04, zkontrolujte nejdříve stav napětí baterie. Pokud je napětí v pořádku, proveďte restart systému.";
        } else if (queryLower.includes('rtk')) {
            botResponse = "RTK GPS slouží k dosažení centimetrové přesnosti. Zkontrolujte, zda je správně připojena RTK anténa a zda máte stabilní spojení s referenční stanicí (zelená kontrolka).";
        } else if (queryLower.includes('trasa') || queryLower.includes('areál')) {
            botResponse = "Jsem určen primárně pro manuál k sekačce XROT. Pro plánování trasy použijte prosím sekci 'Plánovaná trasa' v hlavním menu.";
        } else {
            botResponse = "Omlouvám se, na Váš dotaz nemám v manuálu XROT 95 EVO přímou odpověď. Zeptejte se na klíčové pojmy jako 'olej', 'chyba' nebo 'rtk'.";
        }

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
        // Vycentrujeme mapu na aktuálně filtrované areály
        recenterMap(mapInstance, applyFilters(mapInstance, allAreals));
    });

    // 3. ManuAI Chatbot
    const chatInput = getChatInput();
    const chatSendBtn = getChatSendBtn();

    // Odeslání kliknutím
    chatSendBtn.addEventListener('click', () => {
        const query = chatInput.value.trim();
        if (query.length > 0) {
            handleAiQuery(query);
        }
    });

    // Odeslání stisknutím klávesy Enter
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = chatInput.value.trim();
            if (query.length > 0) {
                handleAiQuery(query);
            }
        }
    });
}

// --- INICIALIZACE A SPUŠTĚNÍ ---

async function init() {
    const allAreals = await fetchArealData();
    if (allAreals.length === 0) {
        // Zde můžeme ještě spustit mapu, i když nemáme markery (kvůli PWA shellu)
        const mapInstance = initializeMap(allAreals);
        initUI();
        return;
    }
    
    // 1. Inicializace Mapy a UI
    const mapInstance = initializeMap(allAreals);
    initUI();
    
    // 2. Počáteční vykreslení a statistiky (přednastaveno na Vše)
    const initialFilters = { search: '', okres: 'all', kategorie: 'all' };
    const initialFiltered = filterAreals(mapInstance, allAreals, initialFilters);
    
    // Důležité: Počáteční aktualizace statistik!
    updateStats(initialFiltered); 

    // 3. Nastavení posluchačů událostí
    setupListeners(mapInstance, allAreals);

    // 4. Vycentrování na všechny areály po načtení
    recenterMap(mapInstance, allAreals);
}

document.addEventListener('DOMContentLoaded', init);
