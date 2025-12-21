// js/ui-controller.js

import { showToast } from './app.js';

// --- UTILITY PRO LOCAL STORAGE ---
const LS_ROUTE_KEY = 'jvsRoute'; // Klíč pro uložení trasy

/** Načte seznam trasy z Local Storage, nebo vrátí prázdné pole. */
function getRouteFromStorage() {
    try {
        const stored = localStorage.getItem(LS_ROUTE_KEY);
        const data = stored ? JSON.parse(stored) : [];
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error("Chyba při načítání trasy z Local Storage:", e);
        return [];
    }
}

/** Uloží aktuální seznam trasy do Local Storage. */
function saveRouteToStorage() {
    try {
        localStorage.setItem(LS_ROUTE_KEY, JSON.stringify(routeList));
    } catch (e) {
        console.error("Chyba při ukládání trasy do Local Storage:", e);
    }
}

// --- GLOBÁLNÍ STAV ---
export let routeList = getRouteFromStorage();
let mapUpdateCallback = () => {}; // Callback pro aktualizaci mapy z app.js

// --- DOM ELEMENTY ---
const routeListElement = document.getElementById('route-list');
const routeBadge = document.getElementById('route-badge');
const clearRouteBtn = document.getElementById('clear-route-btn');
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('main-panel');
const menuIcon = document.getElementById('menu-icon');
const aiToggleBtn = document.getElementById('ai-toggle-btn'); // NOVÝ PRVEK
const aiChatPanel = document.getElementById('ai-chat-panel'); // NOVÝ PRVEK
const closeAiChatBtn = document.getElementById('close-ai-chat-btn'); // NOVÝ PRVEK


const statCountElement = document.getElementById('stat-count');
const statAreaElement = document.getElementById('stat-area');

// --- FUNKCE PRO STATISTIKY ---

/**
 * Aktualizuje statistické údaje na základě filtrovaného seznamu areálů.
 */
export function updateStats(areals) {
    const count = areals.length;
    statCountElement.textContent = count;

    const totalAreaM2 = areals.reduce((sum, areal) => sum + areal.plocha_m2, 0);
    
    let formattedArea;
    if (totalAreaM2 >= 1000) {
        // Převod na kilometry čtvereční, zaokrouhleno na 1 desetinné místo
        formattedArea = (totalAreaM2 / 1000).toFixed(1) + 'k';
    } else {
        formattedArea = totalAreaM2.toFixed(0);
    }
    
    statAreaElement.textContent = formattedArea;
}

// --- FUNKCE PRO SPRÁVU TRASY ---

/** Aktualizuje odznáček trasy. */
function updateRouteBadge() {
    routeBadge.textContent = routeList.length;
}

/** Renderuje seznam trasy v UI. */
function renderRouteList() {
    routeListElement.innerHTML = routeList.map(areal => `
        <div class="route-item" data-id="${areal.id}">
            <b>${areal.jmeno}</b>
            <small>${areal.okres} / ${areal.kategorie}</small>
            <button class="btn btn-icon btn-remove" data-id="${areal.id}">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    updateRouteBadge();
    
    // Přidání posluchačů pro odstranění z trasy
    document.querySelectorAll('.route-item .btn-remove').forEach(button => {
        button.addEventListener('click', (e) => {
            const idToRemove = e.currentTarget.dataset.id;
            removeArealFromRoute(idToRemove);
        });
    });
}

/** Přidá areál do seznamu trasy. */
export function addArealToRoute(areal) {
    if (routeList.find(a => a.id === areal.id)) {
        showToast(`Areál ${areal.jmeno} již je v trase.`, 'info');
        return;
    }
    routeList.push(areal);
    renderRouteList();
    saveRouteToStorage(); 
    showToast(`Areál ${areal.jmeno} přidán do trasy.`);
    mapUpdateCallback(); // Aktualizujeme mapu
}

/** Odebere areál ze seznamu trasy. */
export function removeArealFromRoute(id) {
    const index = routeList.findIndex(a => a.id === id);
    if (index !== -1) {
        const removed = routeList.splice(index, 1)[0];
        renderRouteList();
        saveRouteToStorage(); 
        showToast(`Areál ${removed.jmeno} odstraněn z trasy.`);
        mapUpdateCallback(); // Aktualizujeme mapu
    }
}

/** Vyčistí celou trasu. */
export function clearRoute() {
    routeList = [];
    renderRouteList();
    saveRouteToStorage(); 
    showToast('Trasa byla vyčištěna.', 'warning');
    mapUpdateCallback(); // Aktualizujeme mapu
}

// --- FUNKCE PRO MANUÁL A AI ---

export function getChatInput() { return document.getElementById('chat-input'); }
export function getChatSendBtn() { return document.getElementById('chat-send-btn'); }

/**
 * Přidá zprávu do chatovacího okna.
 */
export function addChatMessage(text, sender) {
    const chatBody = document.getElementById('chat-body');
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${sender}`;
    msgDiv.textContent = text;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight; // Scroll dolů
}

// --- INICIALIZACE ---

/** Inicializuje UI prvky a posluchače událostí. */
export function initUI(onRouteChanged) { 
    if (onRouteChanged) {
        mapUpdateCallback = onRouteChanged; // Uložíme callback z app.js
    }
    
    // 1. Načtení trasy a vykreslení při startu 
    renderRouteList(); 
    
    // 2. Posluchače pro tlačítka trasy
    clearRouteBtn.addEventListener('click', clearRoute);

    // 3. Posluchač pro menu toggle (Sidebar)
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        menuIcon.classList.toggle('fa-bars');
        menuIcon.classList.toggle('fa-times');
    });

    // 4. Posluchač pro akordeony
    document.querySelectorAll('.acc-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            const section = e.currentTarget.closest('.acc-section');
            // Toggle třídy 'active' pro zobrazení/skrytí acc-body
            section.classList.toggle('active');
        });
    });

    // 5. Posluchače pro plovoucí AI chat (NOVÉ)
    aiToggleBtn.addEventListener('click', () => {
        aiChatPanel.classList.toggle('visible');
    });

    closeAiChatBtn.addEventListener('click', () => {
        aiChatPanel.classList.remove('visible');
    });
}
