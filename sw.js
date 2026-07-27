// Jewellery Product Builder Pro — offline service worker
// NETWORK-FIRST for the app shell: always try to fetch the latest version
// first. Only fall back to the cached copy if the network request fails
// (i.e. genuinely offline). This is the opposite of "cache-first" — it means
// updates show up immediately on next reload instead of needing a cache
// version bump + manual browser cache clear every time.
const CACHE_NAME = 'jewellery-pro-v30';
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
        fetch(event.request).then(function(response) {
            if (response && response.status === 200 && response.type === 'basic') {
                var copy = response.clone();
                caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, copy); });
            }
            return response;
        }).catch(function() {
            // Offline (or network error) — fall back to whatever we have cached.
            return caches.match(event.request);
        })
    );
});
