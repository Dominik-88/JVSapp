import { showToast } from './app.js';
import { JVS_AREALS } from './data.js';
import { filterAreals, getMarkerById } from './map-controller.js';

// Globální stav pro plánovanou trasu (uchovává ID areálů)
let routeList = []; 

// --- DOM Reference ---
const routeListEl = document.getElementById('route-list');
const routeBadgeEl = document.getElementById('route-badge');
const statCountEl = document.getElementById('stat-count');
const statAreaEl = document.getElementById('stat-area');
const mainPanel = document.getElementById('main-panel');
const menuIconEl = document.getElementById('menu-icon');


// --- 1. Menu a UI Logika ---

/**
 * Přepne stav zobrazení postranního panelu (collapsed/expanded).
 */
export function toggleMenu() {
    const isCollapsed = mainPanel.classList.toggle('collapsed');
    
    // Změna ikony (fa-bars <-> fa-times/fa-chevron-right)
    if (window.innerWidth <= 768) {
        // Mobil: dolů/nahoru (fa-chevron-up/fa-bars)
        menuIconEl.classList.remove(isCollapsed ? 'fa-times' : 'fa-bars');
        menuIconEl.classList.add(isCollapsed ? 'fa-bars' : 'fa-times'); 
    } else {
        // Desktop: vlevo/vpravo
        menuIconEl.classList.remove(isCollapsed ? 'fa-bars' : 'fa-chevron-right');
        menuIconEl.classList.add(isCollapsed ? 'fa-chevron-right' : 'fa-bars');
    }
}

/**
 * Aktualizuje statistiky na postranním panelu.
 * @param {Array<Object>} areals - Filtrovaná pole areálů.
 */
export function updateStats(areals) {
    const totalCount = areals.length;
    // Součet výměr v m²
    const totalAreaM2 = areals.reduce((sum, areal) => sum + (areal.vymra_m2 || 0), 0);

    statCountEl.textContent = totalCount;
    // Formátování: zaokrouhleno na tisíce s 'k'
    statAreaEl.textContent = `${(totalAreaM2 / 1000).toFixed(0)}k`;
}


// --- 2. Akce pro Filtraci ---

/**
 * Nastaví event listenery pro tlačítka filtrování.
 * @param {L.Map} mapInstance - Instance mapy pro volání filtrace.
 * @param {Array<Object>} allAreals - Všechna data areálů.
 */
export function setupFilterActions(mapInstance, allAreals) {
    const searchInput = document.getElementById('search-input');
    const filterOkres = document.getElementById('filter-okres');
    const filterKategorie = document.getElementById('filter-kategorie');
    const applyBtn = document.getElementById('apply-filters-btn');

    const applyFilter = () => {
        const search = searchInput.value;
        const okres = filterOkres.value;
        const kategorie = filterKategorie.value;
        
        // Volání hlavní filtrace z map-controller
        filterAreals(mapInstance, allAreals, search, okres, kategorie);
    };

    applyBtn.addEventListener('click', applyFilter);
    // Povolit filtraci i po stisknutí Enter v inputu
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyFilter();
        }
    });
}


// --- 3. Správa Trasy ---

/**
 * Přidá areál do seznamu trasy a aktualizuje UI.
 * @param {string} arealId - ID areálu k přidání.
 */
export function addArealToRoute(arealId) {
    if (routeList.includes(arealId)) {
        showToast(`⚠️ Areál je již v trase.`);
        return;
    }
    
    // Najdi celý objekt areálu
    const areal = JVS_AREALS.find(a => a.id === arealId);
    if (!areal) return;

    routeList.push(arealId);
    
    // Aktualizace zobrazení trasy
    updateRouteUI();
    
    // Vizuální zpětná vazba
    const marker = getMarkerById(arealId);
    if (marker) {
        // Změna barvy/stylu markery na mapě pro zvýraznění
        // Zde jen simulace: marker.getElement().classList.add('in-route');
    }

    showToast(`✅ ${areal.name} přidán do trasy.`);
}

/**
 * Odebere areál ze seznamu trasy a aktualizuje UI.
 * @param {string} arealId - ID areálu k odebrání.
 */
function removeArealFromRoute(arealId) {
    const index = routeList.indexOf(arealId);
    if (index > -1) {
        routeList.splice(index, 1);
        
        // Vizuální zpětná vazba
        const areal = JVS_AREALS.find(a => a.id === arealId);
        showToast(`➖ ${areal.name} odebrán z trasy.`);
        
        // Aktualizace zobrazení trasy
        updateRouteUI();
    }
}

/**
 * Překreslí HTML seznam trasy.
 */
function updateRouteUI() {
    routeListEl.innerHTML = '';
    
    if (routeList.length === 0) {
        routeListEl.innerHTML = '<p class="stats-footer-note">Trasa je prázdná. Přidejte areály z mapy.</p>';
        routeBadgeEl.textContent = 0;
        routeBadgeEl.style.display = 'none';
        return;
    }

    routeList.forEach(arealId => {
        const areal = JVS_AREALS.find(a => a.id === arealId);
        if (areal) {
            const item = document.createElement('div');
            item.className = 'route-item';
            item.innerHTML = `
                <span class="route-item-name">${areal.name}</span>
                <button class="route-item-remove" data-remove-id="${arealId}">
                    <i class="fas fa-times-circle"></i>
                </button>
            `;
            routeListEl.appendChild(item);
        }
    });

    // Navěšení event listenerů pro odebrání
    routeListEl.querySelectorAll('.route-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            removeArealFromRoute(e.currentTarget.dataset.removeId);
        });
    });

    routeBadgeEl.textContent = routeList.length;
    routeBadgeEl.style.display = 'inline-block';
}


/**
 * Nastaví hlavní akce pro správu trasy (Vyčistit, Exportovat).
 */
export function setupRouteActions() {
    document.getElementById('clear-route-btn').addEventListener('click', () => {
        routeList = [];
        updateRouteUI();
        showToast('Trasa byla vyčištěna.');
    });

    document.getElementById('export-route-btn').addEventListener('click', (e) => {
        e.preventDefault();
        
        if (routeList.length === 0) {
            showToast('Nelze exportovat prázdnou trasu.');
            return;
        }

        const routeNames = routeList.map(id => JVS_AREALS.find(a => a.id === id)?.name || 'Neznámý areál');
        const routeText = `Trasa (${routeList.length} bodů): ${routeNames.join(' -> ')}`;
        
        // Vytvoření zjednodušeného URL pro navigaci (simulace)
        const firstAreal = JVS_AREALS.find(a => a.id === routeList[0]);
        const navUrl = `https://www.google.com/maps/dir/${firstAreal.gps.join(',')}/...`;

        showToast(`🔗 Odkaz na trasu byl zkopírován do schránky (simulace).`);
        console.log("EXPORT TRASY:", routeText);
        // e.currentTarget.href = navUrl; // Povolit stažení/přesměrování
    });

    // Počáteční vykreslení prázdné trasy
    updateRouteUI();
}
