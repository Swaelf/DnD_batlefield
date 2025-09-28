// Service Worker Registration and Management
// PWA functionality for MapMaker

interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void
  onUpdate?: (registration: ServiceWorkerRegistration) => void
  onError?: (error: Error) => void
}

interface CacheStatus {
  caches: Record<string, { entries: number; urls: string[] }>
  totalSize: number
  totalEntries: number
}

class ServiceWorkerManager {
  private swRegistration: ServiceWorkerRegistration | null = null
  private config: ServiceWorkerConfig
  private isOnline = navigator.onLine

  constructor(config: ServiceWorkerConfig = {}) {
    this.config = config
    this.setupOnlineListeners()
  }

  // Register service worker
  async register(swUrl: string = '/sw.js'): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[SW] Service Workers not supported')
      return null
    }

    try {
      const registration = await navigator.serviceWorker.register(swUrl, {
        scope: '/'
      })

      this.swRegistration = registration

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing

        if (installingWorker) {
          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New version available
                console.log('[SW] New version available')
                this.config.onUpdate?.(registration)
              } else {
                // First time install
                console.log('[SW] Service Worker installed')
                this.config.onSuccess?.(registration)
              }
            }
          })
        }
      })

      // Handle controller changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[SW] Service Worker controller changed')
        window.location.reload()
      })

      console.log('[SW] Service Worker registered successfully')
      return registration

    } catch (error) {
      console.error('[SW] Service Worker registration failed:', error)
      this.config.onError?.(error as Error)
      return null
    }
  }

  // Unregister service worker
  async unregister(): Promise<boolean> {
    if (!this.swRegistration) {
      return false
    }

    try {
      const result = await this.swRegistration.unregister()
      console.log('[SW] Service Worker unregistered:', result)
      return result
    } catch (error) {
      console.error('[SW] Service Worker unregistration failed:', error)
      return false
    }
  }

  // Update service worker
  async update(): Promise<void> {
    if (!this.swRegistration) {
      return
    }

    try {
      await this.swRegistration.update()
      console.log('[SW] Service Worker update check initiated')
    } catch (error) {
      console.error('[SW] Service Worker update failed:', error)
    }
  }

  // Skip waiting for new service worker
  skipWaiting(): void {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
    }
  }

  // Cache management
  async cacheMapData(mapData: any): Promise<void> {
    if (!navigator.serviceWorker.controller) return

    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_MAP_DATA',
      payload: mapData
    })
  }

  async clearCache(): Promise<void> {
    if (!navigator.serviceWorker.controller) return

    navigator.serviceWorker.controller.postMessage({
      type: 'CLEAR_CACHE'
    })
  }

  async getCacheStatus(): Promise<CacheStatus | null> {
    if (!navigator.serviceWorker.controller) return null

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel()

      messageChannel.port1.onmessage = (event) => {
        resolve(event.data)
      }

      navigator.serviceWorker.controller!.postMessage(
        { type: 'GET_CACHE_STATUS' },
        [messageChannel.port2]
      )
    })
  }

  // Background sync
  async registerBackgroundSync(tag: string): Promise<void> {
    if (!this.swRegistration || !('sync' in this.swRegistration)) {
      console.warn('[SW] Background sync not supported')
      return
    }

    try {
      await (this.swRegistration.sync as any).register(tag)
      console.log(`[SW] Background sync registered: ${tag}`)
    } catch (error) {
      console.error(`[SW] Background sync registration failed: ${tag}`, error)
    }
  }

  // Push notifications
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('[SW] Notifications not supported')
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    const permission = await Notification.requestPermission()
    console.log(`[SW] Notification permission: ${permission}`)
    return permission
  }

  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.swRegistration) return null

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          // Replace with your VAPID public key
          'BIsDCw7Z2Xjz_5oOzZbUFcv8z7X2aJ8Jx_1QqZ8oOzZbUFcv8z7X2aJ8Jx_1QqZ8oOzZbUFcv8z7X2aJ8Jx_1QqZ8o'
        )
      })

      console.log('[SW] Push subscription created')
      return subscription

    } catch (error) {
      console.error('[SW] Push subscription failed:', error)
      return null
    }
  }

  // Offline handling
  private setupOnlineListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true
      console.log('[SW] Back online')
      this.handleOnline()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      console.log('[SW] Gone offline')
      this.handleOffline()
    })
  }

  private handleOnline(): void {
    // Sync pending changes when back online
    this.registerBackgroundSync('sync-map-changes')
    this.registerBackgroundSync('sync-collaboration-messages')

    // Show online indicator
    this.showNotification('Back Online', 'Your changes will now sync automatically')
  }

  private handleOffline(): void {
    // Show offline indicator
    this.showNotification('Offline Mode', 'Your changes will sync when connection is restored')
  }

  private showNotification(title: string, body: string): void {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon-192.png',
        tag: 'connection-status'
      })
    }
  }

  // Utility functions
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    return Uint8Array.from(rawData, char => char.charCodeAt(0))
  }

  // Install prompt handling
  private deferredPrompt: any = null

  setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.deferredPrompt = e
      console.log('[SW] Install prompt available')
    })

    window.addEventListener('appinstalled', () => {
      console.log('[SW] App installed')
      this.deferredPrompt = null
    })
  }

  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false
    }

    this.deferredPrompt.prompt()
    const { outcome } = await this.deferredPrompt.userChoice

    console.log(`[SW] Install prompt outcome: ${outcome}`)
    this.deferredPrompt = null

    return outcome === 'accepted'
  }

  isInstallable(): boolean {
    return !!this.deferredPrompt
  }

  // Get service worker status
  getStatus(): {
    isSupported: boolean
    isRegistered: boolean
    isControlling: boolean
    isOnline: boolean
    registration: ServiceWorkerRegistration | null
  } {
    return {
      isSupported: 'serviceWorker' in navigator,
      isRegistered: !!this.swRegistration,
      isControlling: !!navigator.serviceWorker.controller,
      isOnline: this.isOnline,
      registration: this.swRegistration
    }
  }
}

// Create singleton instance
const swManager = new ServiceWorkerManager()

// Auto-register service worker in production
if (process.env.NODE_ENV === 'production') {
  swManager.register().then((registration) => {
    if (registration) {
      console.log('[SW] MapMaker is now available offline!')
    }
  })
}

// Setup install prompt
swManager.setupInstallPrompt()

export default swManager
export { ServiceWorkerManager }
export type { ServiceWorkerConfig, CacheStatus }