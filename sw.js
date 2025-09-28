// Snarkflix Service Worker - Image Caching and Performance
const CACHE_NAME = 'snarkflix-v1';
const urlsToCache = [
    '/',
    '/styles.css',
    '/script.js',
    '/reviews-data.js',
    '/images/site-assets/logo.avif',
    '/images/site-assets/background.avif',
    '/images/site-assets/merlin.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Snarkflix Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Snarkflix Service Worker: Caching static assets');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Snarkflix Service Worker: Installation complete');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Snarkflix Service Worker: Installation failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Snarkflix Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Snarkflix Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Snarkflix Service Worker: Activation complete');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Only handle GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle image requests with cache-first strategy
    if (request.destination === 'image') {
        event.respondWith(
            caches.match(request).then(response => {
                if (response) {
                    console.log('Snarkflix Service Worker: Serving image from cache', url.pathname);
                    return response;
                }
                
                // If not in cache, fetch and cache it
                return fetch(request).then(fetchResponse => {
                    // Only cache successful responses
                    if (fetchResponse.status === 200) {
                        const responseToCache = fetchResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseToCache);
                            console.log('Snarkflix Service Worker: Cached new image', url.pathname);
                        });
                    }
                    return fetchResponse;
                }).catch(error => {
                    console.error('Snarkflix Service Worker: Image fetch failed', url.pathname, error);
                    // Return a fallback image or let the browser handle the error
                    return fetch(request);
                });
            })
        );
        return;
    }
    
    // Handle other static assets with cache-first strategy
    if (urlsToCache.some(cachedUrl => url.pathname === cachedUrl)) {
        event.respondWith(
            caches.match(request).then(response => {
                if (response) {
                    console.log('Snarkflix Service Worker: Serving static asset from cache', url.pathname);
                    return response;
                }
                
                return fetch(request).then(fetchResponse => {
                    if (fetchResponse.status === 200) {
                        const responseToCache = fetchResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseToCache);
                            console.log('Snarkflix Service Worker: Cached new static asset', url.pathname);
                        });
                    }
                    return fetchResponse;
                });
            })
        );
        return;
    }
    
    // For all other requests, use network-first strategy
    event.respondWith(
        fetch(request).catch(() => {
            // If network fails, try to serve from cache
            return caches.match(request);
        })
    );
});

// Handle service worker updates
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Background sync for offline functionality (future enhancement)
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('Snarkflix Service Worker: Background sync triggered');
        // Future: Handle offline data sync
    }
});

// Push notifications (future enhancement)
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        console.log('Snarkflix Service Worker: Push notification received', data);
        // Future: Handle push notifications
    }
});

console.log('Snarkflix Service Worker: Loaded successfully');
