// Bump the version to invalidate all cached entries on the next deploy
const CACHE_NAME = 'eatable-v1';
const OFFLINE_URL = '/index.html';

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
                )
            )
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Only same-origin GETs — Appwrite and Cloudinary traffic passes through
    if (request.method !== 'GET') return;
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    // Navigations: network-first so deploys are picked up immediately;
    // the last good app shell serves as the offline fallback
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(OFFLINE_URL, copy));
                    return response;
                })
                .catch(() =>
                    caches.match(OFFLINE_URL).then((cached) => cached || Response.error())
                )
        );
        return;
    }

    // Static assets: cache-first — Vite bundles are content-hashed, so a
    // cached entry can never go stale under its own URL
    if (url.pathname.startsWith('/assets/')) {
        event.respondWith(
            caches.match(request).then(
                (cached) =>
                    cached ||
                    fetch(request).then((response) => {
                        if (response.ok) {
                            const copy = response.clone();
                            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                        }
                        return response;
                    })
            )
        );
    }
});
