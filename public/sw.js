const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `book-revelation-${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `book-revelation-${CACHE_VERSION}-runtime`;

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
];

const CACHE_LIMITS = {
  maxEntries: 200,
  maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => 
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Helper: check if URL is same origin
function isSameOrigin(url) {
  return url.origin === location.origin;
}

// Helper: check if request is for static asset
function isStaticAsset(destination) {
  return ['image', 'style', 'script', 'font'].includes(destination);
}

// Cleanup cache if exceeds limits
async function cleanupCache(cacheName) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > CACHE_LIMITS.maxEntries) {
    const entries = await Promise.all(
      keys.map(async (request) => {
        const response = await cache.match(request);
        const date = response?.headers.get('sw-cache-date');
        return { request, date: date ? new Date(date) : new Date(0) };
      })
    );
    
    entries.sort((a, b) => a.date - b.date);
    const toDelete = entries.slice(0, keys.length - CACHE_LIMITS.maxEntries);
    
    await Promise.all(
      toDelete.map(({ request }) => cache.delete(request))
    );
  }
}

// Fetch event - strategy depends on request type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip cross-origin requests (except for images)
  if (!isSameOrigin(url) && request.destination !== 'image') return;

  // Navigation: network first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Static assets: cache first
  if (isStaticAsset(request.destination)) {
    event.respondWith(
      caches.match(request).then(async (cachedResponse) => {
        if (cachedResponse) {
          // Return cached and update in background
          event.waitUntil(
            fetch(request).then(async (networkResponse) => {
              if (networkResponse.ok) {
                const cache = await caches.open(CACHE_NAME);
                const clone = networkResponse.clone();
                const headers = new Headers(networkResponse.headers);
                headers.set('sw-cache-date', new Date().toISOString());
                const newResponse = new Response(await clone.blob(), {
                  status: clone.status,
                  headers,
                });
                await cache.put(request, newResponse);
              }
            }).catch(() => {})
          );
          return cachedResponse;
        }
        
        // Not in cache - fetch and cache
        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            const clone = networkResponse.clone();
            const headers = new Headers(networkResponse.headers);
            headers.set('sw-cache-date', new Date().toISOString());
            const newResponse = new Response(await clone.blob(), {
              status: clone.status,
              headers,
            });
            await cache.put(request, newResponse);
            await cleanupCache(CACHE_NAME);
          }
          return networkResponse;
        } catch {
          // Offline - return placeholder for images
          if (request.destination === 'image') {
            return new Response('', { status: 404 });
          }
          throw new Error('Offline');
        }
      })
    );
    return;
  }

  // API calls and others: stale-while-revalidate
  event.respondWith(
    caches.match(request).then(async (cachedResponse) => {
      const fetchPromise = fetch(request).then(async (networkResponse) => {
        if (networkResponse.ok) {
          const cache = await caches.open(RUNTIME_CACHE);
          const clone = networkResponse.clone();
          const headers = new Headers(networkResponse.headers);
          headers.set('sw-cache-date', new Date().toISOString());
          const newResponse = new Response(await clone.blob(), {
            status: clone.status,
            headers,
          });
          await cache.put(request, newResponse);
          await cleanupCache(RUNTIME_CACHE);
        }
        return networkResponse;
      }).catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});
