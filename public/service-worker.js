const CACHE_NAME = 'crv-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/offline.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // API requests: Network first, fall back to cache
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, response.clone());
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((response) => {
            return response || new Response('Offline', { status: 503 });
          });
        })
    );
  } else {
    // Static assets: Cache first, fall back to network
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request);
      })
    );
  }
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-crv') {
    event.waitUntil(syncCRV());
  }
});

async function syncCRV() {
  const db = await openDB('crv-db');
  const tx = db.transaction('syncQueue', 'readonly');
  const items = await tx.store.getAll();

  for (const item of items) {
    try {
      const response = await fetch(`/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (response.ok) {
        const tx2 = db.transaction('syncQueue', 'readwrite');
        await tx2.store.delete(item.id);
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  }
}

async function openDB(name) {
  return new Promise((resolve) => {
    const request = indexedDB.open(name, 1);
    request.onsuccess = () => resolve(request.result);
  });
}
