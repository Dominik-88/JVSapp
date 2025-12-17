/* Simple service worker using Workbox CDN (runtime cache tiles + API responses + app shell) */
/* NOTE: For production, prefer bundling workbox or using a custom sw with precache manifest. */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

if (workbox) {
  console.log('Workbox loaded');

  // Precache important app shell (optionally add more files)
  workbox.precaching.precacheAndRoute([
    {url:'index.html', revision: null},
    {url:'manifest.json', revision: null}
  ]);

  // Cache tile requests (OSM)
  workbox.routing.registerRoute(
    ({url}) => url.origin.includes('tile.openstreetmap.org') || url.origin.includes('tile.openstreetmap.fr'),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'osm-tiles',
      plugins: [ new workbox.expiration.ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30*24*60*60 }) ]
    })
  );

  // Cache Open-Meteo API responses (short TTL)
  workbox.routing.registerRoute(
    ({url}) => url.origin.includes('api.open-meteo.com'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'open-meteo',
      networkTimeoutSeconds: 6,
      plugins: [ new workbox.expiration.ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 10*60 }) ]
    })
  );

  // Default fallback for navigation (SPA)
  workbox.routing.registerRoute(
    ({request}) => request.mode === 'navigate',
    new workbox.strategies.NetworkFirst({
      cacheName: 'pages',
      plugins: [new workbox.expiration.ExpirationPlugin({ maxEntries: 20 })]
    })
  );

} else {
  console.log('Workbox failed to load');
  self.addEventListener('fetch', ()=>{});
}