/**
 * sw.js
 * Service Worker pro JVS Management System (Offline-First).
 */

const CACHE_NAME = 'jvs-cache-v1';

// Kritické soubory, které musí být cachovány pro offline chod
const urlsToCache = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/data.js',
    '/js/map-controller.js',
    '/js/ui-controller.js',
    '/js/pwa-controller.js',
    '/manifest.json',
    // Zahrnutí klíčových CDN zdrojů
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
    'https://js.puter.com/v2/', // Puter.js pro Claude AI
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap',
    // Leaflet dlaždice (nutné k zobrazení mapy) - Cachování dlaždic je složitější, 
    // proto cachujeme jen URL šablonu (pokud se stahují dlaždice přes HTTP, budou cachovány automaticky)
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
];

// Instalace: Otevření cache a přidání všech URL k cachování
self.addEventListener('install', (event) => {
    // service worker čeká, dokud se cachování nedokončí
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Předběžné cachování dokončeno.');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('Service Worker: Chyba při cachování:', err);
            })
    );
});

// Aktivace: Odstranění starých cache verzí
self.addEventListener('activate', (event) => {
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
});

// Fetch: Strategie Cache-First
self.addEventListener('fetch', (event) => {
    // Vrací odpověď z cache, pokud je dostupná, jinak se pokusí stáhnout ze sítě
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Vrátit položku z cache, pokud ji najde
                if (response) {
                    return response;
                }
                
                // Jinak provést normální síťový požadavek
                return fetch(event.request)
                    .then(networkResponse => {
                        // Kontrola, zda je odpověď validní
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        
                        // Klonování odpovědi - stream lze číst jen jednou,
                        // ale potřebujeme ho vrátit i uložit do cache.
                        const responseToCache = networkResponse.clone();
                        
                        // Uložení nové položky do cache (asynchronní operace)
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    })
                    // Fallback pro zobrazení, pokud není v cache ani v síti (Offline-First)
                    .catch(() => {
                        // Speciální pravidlo pro Leaflet (mapové dlaždice)
                        if (event.request.url.includes('tile.openstreetmap.org')) {
                            // Vrácení placeholder obrázku nebo prázdné odpovědi,
                            // aby se zabránilo chybě, pokud mapa nemůže získat dlaždice
                            return new Response('', { status: 503, statusText: 'Offline Map Tiles' });
                        }
                    });
            })
    );
});
