// js/map-controller.js

import { showToast, showOfflineWarning } from './app.js';
import { addArealToRoute, routeList } from './ui-controller.js'; 

// --- GLOBÁLNÍ STAV ---
let map = null;
let markers = [];
let markerClusterGroup = null;

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
 */
export function initializeMap(areals) {
    if (map) {
        map.remove();
    }
    
    const initialLat = 49.30;
    const initialLng = 14.50;

    map = L.map('map').setView([initialLat, initialLng], 9);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        // Zvýšený maxZoom pro lepší kvalitu dlaždic na mobilu
        maxZoom: 22, 
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
 */
export function renderMarkers(mapInstance, areals) {
    // Odebrat staré markery
    if (markerClusterGroup) {
        mapInstance.removeLayer(markerClusterGroup);
        markerClusterGroup = null;
        markers = [];
    }

    markerClusterGroup = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 40
    });

    // Vytvoříme rychlou mapu pro kontrolu přítomnosti v trase
    const routeIds = new Set(routeList.map(a => a.id));

    areals.forEach(areal => {
        // Logika: Určení ikony
        const iconToUse = routeIds.has(areal.id) ? routeIcon : defaultIcon;
        
        const marker = L.marker([areal.gps_rtk.lat, areal.gps_rtk.lng], { icon: iconToUse });

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
 */
export function displayArealDetail(areal) {
    const detailPanel = document.getElementById('areal-detail-panel');
    const isArealOnRoute = routeList.some(a => a.id === areal.id);
    
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
            <a href="https://maps.google.com/?q=${areal.gps_rtk.lat},${areal.gps_rtk.lng}" target="_blank" class="btn btn-success">
                <i class="fas fa-location-arrow"></i> Navigovat (Mapy)
            </a>
        </div>
        
        <button class="btn btn-s btn-close-detail" id="close-detail-btn">Zavřít</button>
    `;

    detailPanel.classList.add('visible');

    // Posluchač pro přidání do trasy
    if (!isArealOnRoute) {
        document.getElementById('add-to-route-btn').addEventListener('click', () => {
            addArealToRoute(areal);
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
 * Vycentruje mapu na všechny areály nebo na nouzovou pozici.
 */
export function recenterMap(mapInstance, areals) {
    if (areals && areals.length > 0) {
        const latlngs = areals.map(a => [a.gps_rtk.lat, a.gps_rtk.lng]);
        const bounds = L.latLngBounds(latlngs);
        mapInstance.flyToBounds(bounds, { padding: [50, 50] });
    } else {
        // Nouzová pozice (CZ střed) a nižší zoom
        mapInstance.flyTo([49.7, 15.5], 8, { duration: 1.0 });
        showToast('Nebyly nalezeny žádné areály k vycentrování.', 'warning');
    }
}
