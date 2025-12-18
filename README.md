# Jihočeský Vodárenský Management (JVS PWA)

Offline-first mobilní webová aplikace pro správu a údržbu vodohospodářských areálů (VDJ, ÚV, ČS, vrty).  
Navrženo pro **terénní techniky JVS** — plně funkční **i bez připojení**, s možností instalace jako nativní aplikace (PWA).

## 🚀 Funkce
- ✅ Mapa Leaflet s clusteringem, heatmapou a kreslením
- ✅ Online/Offline režim (Service Worker + cache tiles)
- ✅ Filtry podle okresu, kategorie, názvu
- ✅ Dynamické souhrny výměr a oplocení
- ✅ OSRM routing po silnicích (drag & drop)
- ✅ Geolokace + seřazení podle vzdálenosti
- ✅ Přidávání, úpravy, mazání areálů
- ✅ Synchronizace s Firebase (stav údržby)
- ✅ Push notifikace a geofencing
- ✅ AI generování protokolů (Gemini API – volitelné)

## 📦 Instalace a spuštění
1. Naklonuj repozitář:
   ```bash
   git clone https://github.com/Dominik-88/jvs-pwa.git
   cd jvs-pwa