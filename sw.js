// Service Worker for SkiesAbove Plane Tracker

const CACHE_NAME = 'skiesabove-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Sync any pending data when connection is restored
  console.log('Background sync triggered');
}

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New plane activity detected!',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDQvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiByeD0iMjQiIGZpbGw9IiMwMDdBRkYiLz4KPHBhdGggZD0iTTQ4IDI0QzM0Ljc0IDI0IDI0IDM0Ljc0IDI0IDQ4czEwLjc0IDI0IDI0IDI0IDI0LTEwLjc0IDI0LTI0UzYxLjI2IDI0IDQ4IDI0em0wIDQwYy04LjgzIDAtMTYtNy4xNy0xNi0xNnM3LjE3LTE2IDE2LTE2IDE2IDcuMTcgMTYgMTYtNy4xNyAxNi0xNiAxNnoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik00OCAzMmMtOC44MyAwLTE2IDcuMTctMTYgMTZzNy4xNyAxNiAxNiAxNiAxNi03LjE3IDE2LTE2LTcuMTctMTYtMTYtMTZ6TTQwIDQ4YzAtNC40MiAzLjU4LTggOC04czggMy41OCA4IDgtMy41OCA4LTggOC04LTMuNTgtOC04eiIgZmlsbD0iIzAwN0FGRiIvPgo8cGF0aCBkPSJNMjIgNjRjMCA0LjQyIDMuNTggOCA4IDhzOC0zLjU4IDgtOC0zLjU4LTgtOC04LTgtMy41OC04LTh6IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNjIgNjRjMCA0LjQyLTMuNTggOC04IDhzLTgtMy41OC04LTggMy41OC04IDgtOCA4IDMuNTggOCA4eiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==',
    badge: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDQvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzAwN0FGRiIvPgo8cGF0aCBkPSJNMTYgOEMxMS41OCA4IDggMTEuNTggOCAxNnMzLjU4IDggOCA4IDgtMy41OCA4LTgtMy41OC04LTgtOHptMCAxMmMtMi4yMSAwLTQtMS43OS00LTRzMS43OS00IDQtNCA0IDEuNzkgNCA0LTEuNzkgNC00IDR6IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Planes',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDQvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4eiIgZmlsbD0iIzAwN0FGRiIvPgo8cGF0aCBkPSJNMTIgNmMtMy4zMSAwLTYgMi42OS02IDZzMi42OSA2IDYgNiA2LTIuNjkgNi02LTIuNjktNi02LTZ6IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K'
      },
      {
        action: 'close',
        title: 'Close',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDQvc3ZnIj4KPHBhdGggZD0iTTE5IDYuNDFMMTcuNTkgNSAxMiAxMC41OSA2LjQxIDUgNSA2LjQxIDEwLjU5IDEyIDUgMTcuNTkgNi40MSAxOSAxMiAxMy40MSAxNy41OSAxOSAxOSAxNy41OSAxMy40MSAxMnoiIGZpbGw9IiNGRjNCMzAiLz4KPC9zdmc+Cg=='
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('SkiesAbove', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('./index.html')
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 