// Jewellery Product Builder Pro — offline service worker
// Cache-first for the app shell so it opens instantly and works offline,
// falling back to network for anything not yet cached.
const CACHE_NAME = 'jewellery-pro-v2';
const APP_SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(APP_SHELL);
        }).then(function() { return self.skipWaiting(); })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(keys.filter(function(k) { return k !== CACHE_NAME; }).map(function(k) { return caches.delete(k); }));
        }).then(function() { return self.clients.claim(); })
    );
});

self.addEventListener('fetch', function(event) {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        caches.match(event.request).then(function(cached) {
            var networkFetch = fetch(event.request).then(function(response) {
                if (response && response.status === 200 && response.type === 'basic') {
                    var copy = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, copy); });
                }
                return response;
            }).catch(function() { return cached; });
            // Serve from cache immediately if we have it, update cache in background.
            return cached || networkFetch;
        })
    );
});
