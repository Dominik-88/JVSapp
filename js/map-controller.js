// js/map-controller.js

import { showToast, showOfflineWarning } from './app.js';
import { addArealToRoute, routeList } from './ui-controller.js'; // NOVINKA: Importujeme routeList

// --- GLOBÁLNÍ STAV ---
let map = null;
let markers = [];
let geojsonLayer = null;

// --- LEAFLET IKONY ---
const defaultIcon = L.icon({
    iconUrl: './assets/icons/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Ikona pro areály, které jsou v trase
const routeIcon = L.icon({
    iconUrl: './assets/icons/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// --- FUNKCE PRO SPRÁVU MAPY ---

/**
 * Inicializuje mapu Leaflet a nastaví základní vrstvy.
 * @param {Array<Object>} areals - Data areálů.
 * @returns {L.Map} Instance mapy.
 */
export function initializeMap(areals) {
    if (map) {
        map.remove();
    }
    
    const initialLat = 49.30;
    const initialLng = 14.50;

    map = L.map('map').setView([initialLat, initialLng], 9);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Správa Offline dlaždic
    map.on('tileerror', function() {
        showOfflineWarning(); 
    });

    return map;
}

/**
 * Vykreslí markery pro areály na mapě.
 * @param {L.Map} mapInstance
 * @param {Array<Object>} areals
 */
export function renderMarkers(mapInstance, areals) {
    // Odebrat staré markery a vyčistit pole
    if (markers.length > 0) {
        markers.forEach(m => m.remove());
        markers = [];
    }

    const markerClusterGroup = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 40
    });

    // Vytvoříme rychlou mapu pro kontrolu přítomnosti v trase
    const routeIds = new Set(routeList.map(a => a.id));

    areals.forEach(areal => {
        // NOVÁ LOGIKA: Určení ikony
        const iconToUse = routeIds.has(areal.id) ? routeIcon : defaultIcon;
        
        const marker = L.marker([areal.gps_rtk.lat, areal.gps_rtk.lng], { icon: iconToUse });

        // Zavolání vlastního detailního panelu při kliknutí
        marker.on('click', function(e) {
            displayArealDetail(areal);
        });

        markerClusterGroup.addLayer(marker);
        markers.push(marker);
    });

    mapInstance.addLayer(markerClusterGroup);
}

/**
 * Zobrazí detailní panel areálu po kliknutí na marker.
 * @param {Object} areal - Data areálu.
 */
export function displayArealDetail(areal) {
    const detailPanel = document.getElementById('areal-detail-panel');
    const isArealOnRoute = routeList.some(a => a.id === areal.id);
    
    // Přizpůsobení tlačítka: zobrazení 'Odebrat z trasy', pokud areál již v trase je
    const routeButtonHTML = isArealOnRoute 
        ? `<button class="btn btn-warning" id="add-to-route-btn" disabled><i class="fas fa-check"></i> Již v trase</button>`
        : `<button class="btn btn-p" id="add-to-route-btn"><i class="fas fa-route"></i> Přidat do trasy</button>`;

    detailPanel.innerHTML = `
        <h3>${areal.jmeno}</h3>
        <p class="detail-subtitle">${areal.adresa.ulice}, ${areal.adresa.mesto}</p>
        
        <div class="detail-stats">
            <div class="stat-box">
                <p>Kategorie</p>
                <b>${areal.kategorie}</b>
            </div>
            <div class="stat-box">
                <p>Výměra</p>
                <b>${(areal.plocha_m2 / 1000).toFixed(1)}k m²</b>
            </div>
        </div>

        <h4>Přesné GPS (RTK)</h4>
        <p>Lat: ${areal.gps_rtk.lat.toFixed(6)} | Lng: ${areal.gps_rtk.lng.toFixed(6)}</p>
        
        <h4>Akce</h4>
        <div class="action-buttons">
            ${routeButtonHTML}
            <a href="https://www.google.com/maps/dir/?api=1&destination=${areal.gps_rtk.lat},${areal.gps_rtk.lng}" target="_blank" class="btn btn-success">
                <i class="fas fa-location-arrow"></i> Navigovat (Mapy)
            </a>
        </div>
        
        <button class="btn btn-s btn-close-detail" id="close-detail-btn">Zavřít</button>
    `;

    detailPanel.classList.add('visible');

    // Posluchač pro přidání do trasy (pouze pokud není v trase)
    if (!isArealOnRoute) {
        document.getElementById('add-to-route-btn').addEventListener('click', () => {
            addArealToRoute(areal);
            // Důležité: Po přidání areálu musíme okamžitě aktualizovat markery na mapě
            // aby se změnil na červenou ikonu.
            // Znovu zavoláme applyFilters, abychom vynutili renderMarkers.
            const searchInput = document.getElementById('search-input').value;
            const filterOkres = document.getElementById('filter-okres').value;
            const filterKategorie = document.getElementById('filter-kategorie').value;
            // Předáme aktuální areály a filtry k překreslení
            filterAreals(map, markers.map(m => m.options.arealData), { search: searchInput, okres: filterOkres, kategorie: filterKategorie });
            
            // Znovu zobrazíme detail, aby se aktualizoval stav tlačítka
            displayArealDetail(areal); 
        });
    }

    document.getElementById('close-detail-btn').addEventListener('click', () => {
        detailPanel.classList.remove('visible');
    });

    map.flyTo([areal.gps_rtk.lat, areal.gps_rtk.lng], map.getZoom(), { duration: 0.5 });
}


/**
 * Filtruje areály a překreslí markery.
 * @param {L.Map} mapInstance
 * @param {Array<Object>} allAreals
 * @param {Object} filters
 * @returns {Array<Object>} Filtrovaný seznam areálů.
 */
export function filterAreals(mapInstance, allAreals, filters) {
    const filtered = allAreals.filter(areal => {
        const matchesOkres = filters.okres === 'all' || areal.okres === filters.okres;
        const matchesKategorie = filters.kategorie === 'all' || areal.kategorie === filters.kategorie;
        const matchesSearch = areal.jmeno.toLowerCase().includes(filters.search.toLowerCase()) || 
                              areal.adresa.mesto.toLowerCase().includes(filters.search.toLowerCase());
        return matchesOkres && matchesKategorie && matchesSearch;
    });

    renderMarkers(mapInstance, filtered);
    return filtered;
}

/**
 * Vycentruje mapu na všechny areály nebo na aktuální polohu.
 * @param {L.Map} mapInstance
 * @param {Array<Object>} areals
 */
export function recenterMap(mapInstance, areals) {
    if (areals && areals.length > 0) {
        const latlngs = areals.map(a => [a.gps_rtk.lat, a.gps_rtk.lng]);
        const bounds = L.latLngBounds(latlngs);
        mapInstance.flyToBounds(bounds, { padding: [50, 50] });
    } else {
        mapInstance.flyTo([49.7, 15.5], 8, { duration: 1.0 });
    }
}
