const CACHE_NAME = 'jvs-map-v3';
const TILES_CACHE_NAME = 'jvs-map-tiles-v1';

// Statické assety pro offline použití
const urlsToCache = [
    './index.html',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css',
    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css',
    'https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css',
    'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js',
    'https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js',
    'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js',
    'https://unpkg.com/leaflet.heat/dist/leaflet-heat.js'
    // Firebase se načítá dynamicky a není nutné ho cachovat
];

// Omezíme cachování mapových dlaždic (cache-only s fallbackem)
// Vzhledem k tomu, že Leaflet používá různé poskytovatele, cachujeme jen OSM jako základ.
const TILE_URL_PATTERN = 'tile.openstreetmap.org';

// Instalace a cachování statických souborů
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Předběžné cachování statických assetů.');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
            .catch(err => console.error('Service Worker: Chyba při cachování:', err))
    );
});

// Aktivace a čištění starých cache
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME, TILES_CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Mažu starou cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Strategie: Cache, pak síť (Cache falling back to network)
self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    // 1. Speciální zacházení pro mapové dlaždice (Cache-First)
    if (requestUrl.host.includes(TILE_URL_PATTERN) || requestUrl.host.includes('arcgisonline.com')) {
        event.respondWith(
            caches.open(TILES_CACHE_NAME).then(cache => {
                return cache.match(event.request).then(response => {
                    // Vracíme z cache, pokud je k dispozici
                    if (response) {
                        return response;
                    }
                    
                    // Jinak jdeme na síť a cachujeme pro budoucí použití
                    return fetch(event.request).then(networkResponse => {
                        // Nekachujeme, pokud je odpověď špatná
                        if (networkResponse.status === 200) {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    }).catch(error => {
                        console.log('Service Worker: Chyba při získávání dlaždice ze sítě:', error);
                    });
                });
            })
        );
        return;
    }
    
    // 2. Pro ostatní statické assety a index.html (Cache First)
    if (urlsToCache.some(url => event.request.url.includes(url) || event.request.mode === 'navigate')) {
         event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request);
            })
        );
        return;
    }
    
    // 3. Pro dynamické požadavky (Firestore, OpenMeteo, OSRM) - Network First
    // Zajišťuje, že se získají nejnovější data, pokud je síť dostupná
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});

