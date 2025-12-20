import { showToast } from './app.js';
// Potřebujeme updateStats z UI Controlleru, abychom po filtraci aktualizovali postranní panel.
import { updateStats, addArealToRoute } from './ui-controller.js'; 

// Globální proměnná pro instanci mapy a registry markerů
let mapInstance = null;
let arealMarkers = {}; 

// --- 1. Konfigurace ikon ---

/**
 * Vytvoří custom DivIcon pro Leaflet marker na základě kategorie areálu.
 * @param {string} kategorie - Kategorie areálu ('I.', 'II.', nebo null).
 */
const getCustomIcon = (kategorie) => {
    // Barvy: Modrá pro I. (primární), Oranžová pro II. (sekundární), Šedá pro N/A.
    const color = kategorie === 'I.' ? '#2563eb' : (kategorie === 'II.' ? '#f97316' : '#9ca3af');
    return L.divIcon({
        className: 'custom-div-icon',
        // HTML struktura: barevný kruh a ikona (Font Awesome: fas fa-water)
        html: `<div style="background-color: ${color};" class="marker-pin"></div><i class="fas fa-water marker-icon"></i>`,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -35]
    });
};

/**
 * Generuje HTML obsah pro pop-up okno markery.
 * @param {Object} areal - Data areálu.
 */
const createPopupContent = (areal) => {
    // Použití Google Maps pro navigaci (vytvoří odkaz s cílovými GPS)
    const navLink = `https://www.google.com/maps/dir/?api=1&destination=${areal.gps[0]},${areal.gps[1]}`;
    const vymraFormatted = (areal.vymra_m2 / 1000).toFixed(1);

    return `
        <div class="popup-content">
            <h4 class="popup-title">${areal.name} (${areal.okres || 'N/A'})</h4>
            <p class="popup-detail">Kategorie: <b>${areal.kategorie || 'N/A'}</b></p>
            <p class="popup-detail">Výměra: <b>${vymraFormatted} tis. m²</b></p>
            <p class="popup-detail">Oplocení: <b>${areal.oploceni_bm} bm</b></p>
            
            <div class="popup-actions">
                <button class="btn btn-p btn-sm" data-action="add-to-route" data-areal-id="${areal.id}">
                    <i class="fas fa-route"></i> Do trasy
                </button>
                <button class="btn btn-success btn-sm" data-action="done" data-areal-id="${areal.id}">
                    <i class="fas fa-check"></i> Hotovo (simulace)
                </button>
            </div>
            <a href="${navLink}" target="_blank" class="btn btn-s btn-sm popup-nav-btn">
                <i class="fas fa-location-arrow"></i> Navigovat
            </a>
        </div>
    `;
};


// --- 2. Inicializace a Vykreslení Mapy ---

/**
 * Inicializuje Leaflet mapu a nastaví základní dlaždice.
 * @param {Array<Object>} areals - Původní pole dat areálů pro nastavení počátečního zobrazení.
 * @returns {L.Map} Instance mapy.
 */
export function initializeMap(areals) {
    if (mapInstance) return mapInstance; 

    // Počáteční zobrazení (nastaveno na 1. areál, pokud existuje)
    const initialCenter = areals.length > 0 ? areals[0].gps : [49.5, 15.0];
    const initialZoom = 8; 

    mapInstance = L.map('map').setView(initialCenter, initialZoom);

    // Přidání dlaždic (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
    }).addTo(mapInstance);

    window.MAP_INSTANCE = mapInstance; 

    // Nastavení event listenerů na pop-up akce
    mapInstance.on('popupopen', (e) => {
        const popup = e.popup.getElement();
        if (popup) {
            // Logika pro přidání k trase - volá funkci z ui-controller
            popup.querySelector('[data-action="add-to-route"]').addEventListener('click', (e) => {
                const arealId = e.currentTarget.dataset.arealId;
                addArealToRoute(arealId);
            });
            
            // Označit jako hotové (simulace)
            popup.querySelector('[data-action="done"]').addEventListener('click', () => {
                 showToast(`✅ Areál označen jako Hotovo (simulace)`);
            });
        }
    });

    return mapInstance;
}

/**
 * Vykreslí markery pro dané areály na mapě.
 * @param {L.Map} map - Instance mapy.
 * @param {Array<Object>} areals - Pole areálů k vykreslení.
 */
export function renderMarkers(map, areals) {
    // Odebereme všechny existující markery
    Object.values(arealMarkers).forEach(marker => {
        map.removeLayer(marker);
    });
    arealMarkers = {}; 

    areals.forEach(areal => {
        if (!areal.gps || areal.gps.length !== 2) {
             console.warn(`Areál ${areal.name} nemá platné GPS souřadnice.`);
             return; 
        }

        const icon = getCustomIcon(areal.kategorie);
        
        const marker = L.marker(areal.gps, { icon: icon, title: areal.name, id: areal.id })
            .bindPopup(createPopupContent(areal))
            .addTo(map);

        arealMarkers[areal.id] = marker;
    });
    
    // Vycentrování na novou sadu markerů, pokud je jich málo
    if (areals.length < 10) {
        recenterMap(map, areals);
    }
}


// --- 3. Funkce pro Manipulaci s Mapou ---

/**
 * Filtruje a aktualizuje zobrazení areálů na mapě.
 * @param {L.Map} map - Instance mapy.
 * @param {Array<Object>} allAreals - Všechna data areálů.
 * @param {string} search - Vyhledávací text.
 * @param {string} okres - Filtr okresu ('all' pro všechny).
 * @param {string} kategorie - Filtr kategorie ('all' pro všechny).
 */
export function filterAreals(map, allAreals, search, okres, kategorie) {
    const normalizedSearch = search.toLowerCase().trim();

    const filteredAreals = allAreals.filter(areal => {
        // Filtrace podle názvu
        const nameMatch = areal.name.toLowerCase().includes(normalizedSearch);
        // Filtrace podle okresu
        const okresMatch = okres === 'all' || areal.okres === okres;
        // Filtrace podle kategorie (ošetření null pro areály bez kategorie)
        const arealKategorie = areal.kategorie || '';
        const kategorieMatch = kategorie === 'all' || arealKategorie === kategorie;

        return nameMatch && okresMatch && kategorieMatch;
    });

    // Aktualizace mapy a statistik
    renderMarkers(map, filteredAreals);
    updateStats(filteredAreals); 
    
    showToast(`Filtry aplikovány. Zobrazeno ${filteredAreals.length} areálů.`);
    return filteredAreals;
}


/**
 * Vycentruje mapu na obalující rámeček (bounds) aktuálně zobrazených areálů.
 * @param {L.Map} map - Instance mapy.
 * @param {Array<Object>} areals - Pole aktuálně zobrazených areálů.
 */
export function recenterMap(map, areals) {
    if (!map) return;
    
    const latLngs = areals
        .filter(a => a.gps && a.gps.length === 2)
        .map(a => L.latLng(a.gps[0], a.gps[1]));

    if (latLngs.length > 0) {
        const bounds = L.latLngBounds(latLngs);
        // Padding: [paddingTop/Bottom, paddingLeft/Right] pro zohlednění postranního panelu
        map.fitBounds(bounds, { padding: [50, 400], maxZoom: 12 });
    }
}

/**
 * Získá marker podle ID areálu.
 * @param {string} id - ID areálu.
 * @returns {L.Marker | null} Marker nebo null.
 */
export function getMarkerById(id) {
    return arealMarkers[id] || null;
}
