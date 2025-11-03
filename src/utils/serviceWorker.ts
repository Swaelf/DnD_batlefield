// Service Worker Registration and Management
// PWA functionality for MapMaker

// Background Sync API types (experimental browser feature)
interface SyncManager {
  register(tag: string): Promise<void>
  getTags(): Promise<string[]>
}

interface ServiceWorkerRegistrationWithSync extends ServiceWorkerRegistration {
  sync?: SyncManager
}

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
  private eventListeners: Array<{ target: any; event: string; handler: Function }> = []

  constructor(config: ServiceWorkerConfig = {}) {
    this.config = config
    this.setupOnlineListeners()
  }

  // Helper methods for managing event listeners
  private addEventListenerWithCleanup(target: any, event: string, handler: Function): void {
    target.addEventListener(event, handler)
    this.eventListeners.push({ target, event, handler })
  }

  private removeAllEventListeners(): void {
    for (const { target, event, handler } of this.eventListeners) {
      target.removeEventListener(event, handler)
    }
    this.eventListeners = []
  }

  // Register service worker
  async register(swUrl: string = '/sw.js'): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[SW] Service Workers not supported')
      return null
    }

    try {
      // Use the same base path as the service worker URL
      const scope = swUrl.substring(0, swUrl.lastIndexOf('/') + 1) || '/'
      const registration = await navigator.serviceWorker.register(swUrl, {
        scope: scope
      })

      this.swRegistration = registration

      // Handle updates
      const updateHandler = () => {
        const installingWorker = registration.installing

        if (installingWorker) {
          const stateChangeHandler = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New version available
                this.config.onUpdate?.(registration)
              } else {
                // First time install
                this.config.onSuccess?.(registration)
              }
            }
          }
          this.addEventListenerWithCleanup(installingWorker, 'statechange', stateChangeHandler)
        }
      }
      this.addEventListenerWithCleanup(registration, 'updatefound', updateHandler)

      // Handle controller changes
      const controllerChangeHandler = () => {
        window.location.reload()
      }
      this.addEventListenerWithCleanup(navigator.serviceWorker, 'controllerchange', controllerChangeHandler)

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
      this.cleanup()
      return result
    } catch (error) {
      console.error('[SW] Service Worker unregistration failed:', error)
      return false
    }
  }

  // Public cleanup method
  cleanup(): void {
    this.removeAllEventListeners()
    this.swRegistration = null
    this.deferredPrompt = null
  }

  // Update service worker
  async update(): Promise<void> {
    if (!this.swRegistration) {
      return
    }

    try {
      await this.swRegistration.update()
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

  // Advanced Cache management
  async cacheMapData(mapData: any): Promise<void> {
    if (!navigator.serviceWorker.controller) return

    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_MAP_DATA',
      payload: mapData
    })
  }

  async cacheAsset(url: string, data: Blob, strategy: 'immediate' | 'background' = 'background'): Promise<void> {
    if (!navigator.serviceWorker.controller) return

    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_ASSET',
      payload: { url, data, strategy }
    })
  }

  async preloadCriticalAssets(urls: string[]): Promise<void> {
    if (!navigator.serviceWorker.controller) return

    navigator.serviceWorker.controller.postMessage({
      type: 'PRELOAD_ASSETS',
      payload: { urls, priority: 'high' }
    })
  }

  async setCacheStrategy(pattern: string, strategy: 'networkFirst' | 'cacheFirst' | 'staleWhileRevalidate'): Promise<void> {
    if (!navigator.serviceWorker.controller) return

    navigator.serviceWorker.controller.postMessage({
      type: 'SET_CACHE_STRATEGY',
      payload: { pattern, strategy }
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
    const regWithSync = this.swRegistration as ServiceWorkerRegistrationWithSync
    if (!regWithSync || !regWithSync.sync) {
      console.warn('[SW] Background sync not supported')
      return
    }

    try {
      await regWithSync.sync.register(tag)
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
        ) as BufferSource
      })

      return subscription

    } catch (error) {
      console.error('[SW] Push subscription failed:', error)
      return null
    }
  }

  // Offline handling
  private setupOnlineListeners(): void {
    const onlineHandler = () => {
      this.isOnline = true
      this.handleOnline()
    }

    const offlineHandler = () => {
      this.isOnline = false
      this.handleOffline()
    }

    this.addEventListenerWithCleanup(window, 'online', onlineHandler)
    this.addEventListenerWithCleanup(window, 'offline', offlineHandler)
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
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Install prompt handling
  private deferredPrompt: any = null

  setupInstallPrompt(): void {
    const beforeInstallHandler = (e: any) => {
      e.preventDefault()
      this.deferredPrompt = e
    }

    const appInstalledHandler = () => {
      this.deferredPrompt = null
    }

    this.addEventListenerWithCleanup(window, 'beforeinstallprompt', beforeInstallHandler)
    this.addEventListenerWithCleanup(window, 'appinstalled', appInstalledHandler)
  }

  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false
    }

    this.deferredPrompt.prompt()
    const { outcome } = await this.deferredPrompt.userChoice

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

// Setup install prompt
swManager.setupInstallPrompt()

export default swManager
export { ServiceWorkerManager }
export type { ServiceWorkerConfig, CacheStatus }