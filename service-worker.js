const CACHE_NAME = 'traveldeal-v3';
const urlsToCache = [
    '/', '/index.html', '/css/style.css',
    '/js/i18n.js', '/js/app.js', '/js/hotel-search.js', '/js/location-autocomplete.js',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(names => Promise.all(
            names.map(name => name !== CACHE_NAME ? caches.delete(name) : null)
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.url.includes('workers.dev') ||
        event.request.url.includes('api.stayingapi.com') ||
        event.request.url.includes('nominatim.openstreetmap.org')) {
        return;
    }
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});
