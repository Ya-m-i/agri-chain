// Service Worker for advanced caching and offline functionality
const CACHE_VERSION = 'agri-chain-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Assets to cache immediately
const STATIC_ASSETS = [
  '/AGRI-CHAIN/',
  '/AGRI-CHAIN/index.html',
  '/AGRI-CHAIN/manifest.json',
  // Add other critical static assets
];

// API endpoints to cache
const CACHEABLE_API_ROUTES = [
  '/api/farmers',
  '/api/assistance',
  '/api/crop-insurance',
  '/api/claims',
];

// Cache strategies
const CACHE_STRATEGIES = {
  NETWORK_FIRST: 'network-first',
  CACHE_FIRST: 'cache-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
};

// Routes and their cache strategies
const ROUTE_STRATEGIES = {
  // Static assets - cache first
  '/assets/': CACHE_STRATEGIES.CACHE_FIRST,
  '/images/': CACHE_STRATEGIES.CACHE_FIRST,
  '/fonts/': CACHE_STRATEGIES.CACHE_FIRST,
  
  // API routes - stale while revalidate
  '/api/farmers': CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
  '/api/assistance': CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
  '/api/crop-insurance': CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
  
  // Dynamic content - network first
  '/api/claims': CACHE_STRATEGIES.NETWORK_FIRST,
  '/api/assistance/applications': CACHE_STRATEGIES.NETWORK_FIRST,
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('ServiceWorker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('ServiceWorker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with appropriate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome extensions and non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Determine cache strategy
  const strategy = getCacheStrategy(url.pathname);
  
  event.respondWith(
    handleRequest(request, strategy)
      .catch(() => {
        // Fallback for offline scenarios
        if (url.pathname.startsWith('/api/')) {
          // Return cached API data if available
          return caches.match(request);
        } else {
          // Return cached page or offline page
          return caches.match('/') || caches.match('/offline.html');
        }
      })
  );
});

// Determine cache strategy for a given path
function getCacheStrategy(pathname) {
  for (const [route, strategy] of Object.entries(ROUTE_STRATEGIES)) {
    if (pathname.startsWith(route)) {
      return strategy;
    }
  }
  
  // Default strategy
  if (pathname.startsWith('/api/')) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  } else if (pathname.startsWith('/assets/')) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  } else {
    return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
  }
}

// Handle request based on strategy
async function handleRequest(request, strategy) {
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request);
      
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request);
      
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request);
      
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request);
      
    case CACHE_STRATEGIES.CACHE_ONLY:
      return caches.match(request);
      
    default:
      return networkFirst(request);
  }
}

// Cache first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok && networkResponse.status < 400) {
      const cache = await getCache(request);
      // Clone before caching to avoid consumption issues
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('Cache first strategy failed:', error);
    throw error;
  }
}

// Network first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok && networkResponse.status < 400) {
      try {
        const cache = await getCache(request);
        // Clone before caching to avoid consumption issues
        await cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        console.warn('Failed to cache response:', cacheError);
      }
    }
    return networkResponse;
  } catch (error) {
    console.warn('Network request failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  // Start network request in background
  const networkResponsePromise = fetch(request)
    .then(async response => {
      if (response.ok) {
        try {
          const cache = await getCache(request);
          // Clone the response before using it
          await cache.put(request, response.clone());
        } catch (error) {
          console.warn('Cache update failed:', error);
        }
      }
      return response;
    })
    .catch(error => {
      console.warn('Network request failed:', error);
      return null;
    });
  
  // Return cached response immediately if available, otherwise wait for network
  if (cachedResponse) {
    // Update cache in background, don't wait for it
    networkResponsePromise.catch(() => {});
    return cachedResponse;
  }
  
  return networkResponsePromise;
}

// Get appropriate cache for request
function getCache(request) {
  const url = new URL(request.url);
  
  if (url.pathname.startsWith('/api/')) {
    return caches.open(API_CACHE);
  } else if (url.pathname.startsWith('/assets/')) {
    return caches.open(STATIC_CACHE);
  } else {
    return caches.open(DYNAMIC_CACHE);
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      syncOfflineActions()
    );
  }
});

// Sync offline actions when back online
async function syncOfflineActions() {
  try {
    // Get offline actions from IndexedDB
    const offlineActions = await getOfflineActions();
    
    for (const action of offlineActions) {
      try {
        await fetch(action.url, action.options);
        await removeOfflineAction();
        console.log('Synced offline action:', action.id);
      } catch (error) {
        console.error('Failed to sync offline action:', action.id, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// IndexedDB helpers for offline actions
function getOfflineActions() {
  return new Promise((resolve) => {
    // Simple implementation - in real app, use IndexedDB
    resolve([]);
  });
}

function removeOfflineAction() {
  return new Promise((resolve) => {
    // Simple implementation - in real app, use IndexedDB
    resolve();
  });
}

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: 'New update available for AGRI-CHAIN',
    icon: '/FarmLogo.png',
    badge: '/FarmLogo.png',
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('AGRI-CHAIN', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('ServiceWorker loaded successfully');