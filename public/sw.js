// Simple service worker for caching shell assets
const CACHE_NAME = 'expense-tracker-v4';
const SHELL_ASSETS = [
  '/',
  '/add',
  '/history',
  '/reports',
  '/settings'
];

// Install event - cache shell assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching shell assets');
        return cache.addAll(SHELL_ASSETS.map(url => new Request(url, { credentials: 'same-origin' })));
      })
      .catch((error) => {
        console.log('Service Worker: Cache failed', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  // Skip ALL Next.js static files in development (they change frequently)
  if (event.request.url.includes('/_next/static/')) return;
  
  // Skip webpack hot-update files in development
  if (event.request.url.includes('webpack.hot-update')) return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache', event.request.url);
          return cachedResponse;
        }

        console.log('Service Worker: Fetching from network', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's a stream
            const responseToCache = response.clone();

            // Cache the response for shell assets only
            if (SHELL_ASSETS.some(asset => event.request.url.includes(asset))) {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          })
          .catch(() => {
            // If both cache and network fail, show offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});

// Handle background sync for offline expense submissions (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'expense-sync') {
    console.log('Service Worker: Background sync for expenses');
    // Future: sync pending expenses when back online
  }
});

// Handle push notifications (future enhancement)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    console.log('Service Worker: Push notification received', data);
    // Future: show budget alerts or reminders
  }
});