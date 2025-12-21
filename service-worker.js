// service-worker.js

const CACHE_NAME = 'jvs-cache-v1';
// Seznam souborů, které se mají uložit do mezipaměti (App Shell)
const urlsToCache = [
    '/',
    'index.html',
    'manifest.json',
    'css/styles.css',
    'js/app.js',
    'js/map-controller.js',
    'js/ui-controller.js',
    'data/arealy.json', 
    'data/manual.json', 
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js',
    // Lokální obrázky markerů a ikony
    'assets/icons/marker-icon-blue.png',
    'assets/icons/marker-icon-red.png',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
];

// Instalace service workeru a uložení App Shellu
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Otevřena cache a cachování App Shell.');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting(); // Okamžitá aktivace nového SW
});

// Zajištění Cache-First strategie (pro App Shell)
self.addEventListener('fetch', event => {
    // Nechceme cachovat všechny dlaždice mapy, ty necháme procházet sítí
    if (event.request.url.includes('tile.openstreetmap.org')) {
        return; // Necháme standardní síťové dotazy
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - vrátíme uloženou odpověď
                if (response) {
                    return response;
                }
                // Cache miss - provedeme síťový dotaz
                return fetch(event.request);
            })
    );
});

// Vyčištění starých verzí cache
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    console.log('Service Worker: Nová verze aktivována a staré cache vyčištěny.');
});
