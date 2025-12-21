// js/map-controller.js

import { showToast, showOfflineWarning } from './app.js';
import { addArealToRoute } from './ui-controller.js'; // Potřebujeme pro navěšení na budoucí tlačítko v detailu

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
    
    // Základní dlaždice mapy (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // --- NOVÁ ČÁST: Správa Offline dlaždic (UX v terénu) ---
    map.on('tileerror', function() {
        showOfflineWarning(); // Zobrazí trvalé varování
    });
    // --- Konec NOVÉ ČÁSTI ---

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

    // Inicializace cluster group pro lepší výkon
    const markerClusterGroup = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 40 // Zmenšen pro lepší zobrazení detailů v malém měřítku
    });

    areals.forEach(areal => {
        // Používáme RTK GPS souřadnice pro maximální přesnost
        const marker = L.marker([areal.gps_rtk.lat, areal.gps_rtk.lng], { icon: defaultIcon });

        // Dříve zde bylo marker.bindPopup().
        // Nyní voláme vlastní funkci pro zobrazení detailního panelu.
        marker.on('click', function(e) {
            // Zavolání nové funkce, která zobrazí detailní panel na straně
            displayArealDetail(areal);
        });

        markerClusterGroup.addLayer(marker);
        markers.push(marker);
    });

    mapInstance.addLayer(markerClusterGroup);
}

/**
 * Zobrazí detailní panel areálu po kliknutí na marker.
 * Tuto funkci nyní implementujeme jako další krok!
 * @param {Object} areal - Data areálu.
 */
export function displayArealDetail(areal) {
    // 1. Získat kontejner detailního panelu z DOM.
    const detailPanel = document.getElementById('areal-detail-panel');

    // 2. Vyplnit jej daty
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
            <button class="btn btn-p" id="add-to-route-btn">
                <i class="fas fa-route"></i> Přidat do trasy
            </button>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${areal.gps_rtk.lat},${areal.gps_rtk.lng}" target="_blank" class="btn btn-success">
                <i class="fas fa-location-arrow"></i> Navigovat (Mapy)
            </a>
        </div>
        
        <button class="btn btn-s btn-close-detail" id="close-detail-btn">Zavřít</button>
    `;

    // 3. Zobrazit panel
    detailPanel.classList.add('visible');

    // 4. Navěsit posluchače na tlačítka
    document.getElementById('add-to-route-btn').addEventListener('click', () => {
        addArealToRoute(areal);
    });
    document.getElementById('close-detail-btn').addEventListener('click', () => {
        detailPanel.classList.remove('visible');
    });

    // Ujistit se, že se mapa nevycentruje, ale je zvýrazněn detail.
    map.flyTo([areal.gps_rtk.lat, areal.gps_rtk.lng], map.getZoom(), { duration: 0.5 });
}


/**
 * Filtruje areály a překreslí markery.
 * ... (funkce filterAreals zůstává stejná) ...
 */
export function filterAreals(mapInstance, allAreals, filters) {
    // ... (zůstává stejné) ...
    // Příklad implementace pro zkrácení:
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
 * ... (funkce recenterMap zůstává stejná) ...
 */
export function recenterMap(mapInstance, areals) {
    if (areals && areals.length > 0) {
        // Centrování na všechny markery
        const latlngs = areals.map(a => [a.gps_rtk.lat, a.gps_rtk.lng]);
        const bounds = L.latLngBounds(latlngs);
        mapInstance.flyToBounds(bounds, { padding: [50, 50] });
    } else {
        // Centrování na defaultní pohled
        mapInstance.flyTo([49.7, 15.5], 8, { duration: 1.0 });
    }
}
