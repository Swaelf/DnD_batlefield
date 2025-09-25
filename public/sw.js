// MapMaker Service Worker - PWA Support and Offline Functionality
const CACHE_NAME = 'mapmaker-v1.0.0'
const STATIC_CACHE_NAME = `${CACHE_NAME}-static`
const DYNAMIC_CACHE_NAME = `${CACHE_NAME}-dynamic`
const IMAGE_CACHE_NAME = `${CACHE_NAME}-images`

// Static resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add built assets here - will be populated by build process
]

// URLs that should always be fetched from network
const NETWORK_FIRST_URLS = [
  '/api/',
  '/auth/',
  '/collaboration/'
]

// Maximum cache size limits
const MAX_DYNAMIC_CACHE_SIZE = 50
const MAX_IMAGE_CACHE_SIZE = 100

// Utility function to clean up old cache entries
const limitCacheSize = async (cacheName, maxSize) => {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()

  if (keys.length > maxSize) {
    const keysToDelete = keys.slice(0, keys.length - maxSize)
    await Promise.all(keysToDelete.map(key => cache.delete(key)))
  }
}

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...')

  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('[SW] Installation complete')
        self.skipWaiting() // Activate immediately
      })
      .catch(error => {
        console.error('[SW] Installation failed:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...')

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('mapmaker-') && name !== CACHE_NAME)
            .map(name => {
              console.log('[SW] Deleting old cache:', name)
              return caches.delete(name)
            })
        )
      })
      .then(() => {
        console.log('[SW] Activation complete')
        self.clients.claim() // Take control of all pages
      })
      .catch(error => {
        console.error('[SW] Activation failed:', error)
      })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') {
    return
  }

  // Network first for API calls
  if (NETWORK_FIRST_URLS.some(pattern => url.pathname.startsWith(pattern))) {
    event.respondWith(networkFirst(request))
    return
  }

  // Cache first for images
  if (request.destination === 'image') {
    event.respondWith(cacheFirstImages(request))
    return
  }

  // Cache first for static assets
  if (request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'font' ||
      request.destination === 'manifest') {
    event.respondWith(cacheFirst(request))
    return
  }

  // Network first for HTML (with offline fallback)
  if (request.destination === 'document') {
    event.respondWith(networkFirstWithOffline(request))
    return
  }

  // Default: network first with cache fallback
  event.respondWith(networkFirst(request))
})

// Network first strategy
const networkFirst = async (request) => {
  try {
    const response = await fetch(request)

    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, response.clone())
      limitCacheSize(DYNAMIC_CACHE_NAME, MAX_DYNAMIC_CACHE_SIZE)
    }

    return response
  } catch (error) {
    const cachedResponse = await caches.match(request)

    if (cachedResponse) {
      console.log('[SW] Serving from cache (offline):', request.url)
      return cachedResponse
    }

    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match('/offline.html') || new Response('Offline')
    }

    throw error
  }
}

// Network first with offline page fallback
const networkFirstWithOffline = async (request) => {
  try {
    const response = await fetch(request)

    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    const cachedResponse = await caches.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline page
    const offlinePage = await caches.match('/offline.html')
    if (offlinePage) {
      return offlinePage
    }

    // Fallback offline response
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MapMaker - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: system-ui, sans-serif;
              text-align: center;
              padding: 50px;
              background: #1a1a1a;
              color: #f0f0f0;
            }
            .icon { font-size: 48px; margin-bottom: 20px; }
            h1 { color: #C9AD6A; }
            .retry-btn {
              background: #922610;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 4px;
              cursor: pointer;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="icon">🗺️</div>
          <h1>MapMaker</h1>
          <h2>You're offline</h2>
          <p>Please check your internet connection and try again.</p>
          <button class="retry-btn" onclick="location.reload()">Retry</button>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
}

// Cache first strategy
const cacheFirst = async (request) => {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const response = await fetch(request)

    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME)
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    console.error('[SW] Cache first failed for:', request.url, error)
    throw error
  }
}

// Cache first for images with size limiting
const cacheFirstImages = async (request) => {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const response = await fetch(request)

    if (response.ok) {
      const cache = await caches.open(IMAGE_CACHE_NAME)
      cache.put(request, response.clone())
      limitCacheSize(IMAGE_CACHE_NAME, MAX_IMAGE_CACHE_SIZE)
    }

    return response
  } catch (error) {
    console.error('[SW] Image cache failed for:', request.url, error)
    throw error
  }
}

// Message handling for cache management
self.addEventListener('message', event => {
  const { type, payload } = event.data

  switch (type) {
    case 'CACHE_MAP_DATA':
      // Cache map data for offline use
      event.waitUntil(cacheMapData(payload))
      break

    case 'CLEAR_CACHE':
      // Clear all caches
      event.waitUntil(clearAllCaches())
      break

    case 'GET_CACHE_STATUS':
      // Return cache statistics
      event.waitUntil(getCacheStatus().then(status => {
        event.ports[0].postMessage(status)
      }))
      break

    case 'SKIP_WAITING':
      // Force service worker activation
      self.skipWaiting()
      break
  }
})

// Cache map data for offline access
const cacheMapData = async (mapData) => {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME)
    const response = new Response(JSON.stringify(mapData), {
      headers: { 'Content-Type': 'application/json' }
    })

    await cache.put('/offline-map-data', response)
    console.log('[SW] Map data cached for offline use')
  } catch (error) {
    console.error('[SW] Failed to cache map data:', error)
  }
}

// Clear all caches
const clearAllCaches = async () => {
  try {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map(name => caches.delete(name)))
    console.log('[SW] All caches cleared')
  } catch (error) {
    console.error('[SW] Failed to clear caches:', error)
  }
}

// Get cache status and statistics
const getCacheStatus = async () => {
  try {
    const cacheNames = await caches.keys()
    const status = {
      caches: {},
      totalSize: 0,
      totalEntries: 0
    }

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName)
      const keys = await cache.keys()

      status.caches[cacheName] = {
        entries: keys.length,
        urls: keys.map(request => request.url)
      }

      status.totalEntries += keys.length
    }

    return status
  } catch (error) {
    console.error('[SW] Failed to get cache status:', error)
    return { error: error.message }
  }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag)

  switch (event.tag) {
    case 'sync-map-changes':
      event.waitUntil(syncMapChanges())
      break

    case 'sync-collaboration-messages':
      event.waitUntil(syncCollaborationMessages())
      break
  }
})

// Sync map changes when back online
const syncMapChanges = async () => {
  try {
    // Get pending changes from IndexedDB or localStorage
    const pendingChanges = JSON.parse(localStorage.getItem('mapmaker_pending_changes') || '[]')

    if (pendingChanges.length === 0) {
      return
    }

    // Attempt to sync changes
    for (const change of pendingChanges) {
      try {
        await fetch('/api/maps/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(change)
        })

        console.log('[SW] Synced map change:', change.id)
      } catch (error) {
        console.error('[SW] Failed to sync change:', change.id, error)
        throw error // Re-register for retry
      }
    }

    // Clear synced changes
    localStorage.removeItem('mapmaker_pending_changes')
    console.log('[SW] All map changes synced successfully')

  } catch (error) {
    console.error('[SW] Map sync failed:', error)
  }
}

// Sync collaboration messages when back online
const syncCollaborationMessages = async () => {
  try {
    const pendingMessages = JSON.parse(localStorage.getItem('mapmaker_pending_messages') || '[]')

    if (pendingMessages.length === 0) {
      return
    }

    for (const message of pendingMessages) {
      try {
        await fetch('/api/collaboration/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        })
      } catch (error) {
        console.error('[SW] Failed to sync message:', message.id, error)
        throw error
      }
    }

    localStorage.removeItem('mapmaker_pending_messages')
    console.log('[SW] All collaboration messages synced')

  } catch (error) {
    console.error('[SW] Message sync failed:', error)
  }
}

// Push notifications for collaboration
self.addEventListener('push', event => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body || 'New activity in your map session',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: data.tag || 'mapmaker-notification',
    data: data.url ? { url: data.url } : undefined,
    actions: [
      {
        action: 'open',
        title: 'Open MapMaker'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'MapMaker', options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close()

  if (event.action === 'open' || !event.action) {
    const url = event.notification.data?.url || '/'

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clients => {
          // Check if MapMaker is already open
          const existingClient = clients.find(client =>
            client.url.includes('mapmaker') || client.url === url
          )

          if (existingClient) {
            return existingClient.focus()
          } else {
            return self.clients.openWindow(url)
          }
        })
    )
  }
})

console.log('[SW] Service worker loaded successfully')