/**
 * Advanced Performance Optimization Utilities
 * Provides runtime performance monitoring and optimization helpers
 */

// Chrome Performance API Memory extension
interface PerformanceMemory {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory
}

// Global window extension for performance utilities
interface WindowWithPerformanceUtils extends Window {
  __PERFORMANCE_UTILS__?: {
    fpsCounter: FPSCounter
    getMemoryUsage: typeof getMemoryUsage
    performanceMark: typeof performanceMark
  }
}

// Intersection Observer for lazy loading optimization
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px', // Start loading 50px before element enters viewport
    threshold: 0.1,
    ...options,
  }

  return new IntersectionObserver(callback, defaultOptions)
}

// Debounced function for performance-critical operations
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function for high-frequency events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Memory usage tracker
export const getMemoryUsage = (): {
  used: number
  total: number
  percentage: number
} => {
  const perfWithMemory = performance as PerformanceWithMemory
  if (perfWithMemory.memory) {
    const memory = perfWithMemory.memory
    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
      percentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100),
    }
  }
  return { used: 0, total: 0, percentage: 0 }
}

// FPS counter
export class FPSCounter {
  private frames: number[] = []
  private lastTime = performance.now()

  measure(): number {
    const now = performance.now()
    const deltaTime = now - this.lastTime
    this.lastTime = now

    // Keep only last 60 frames for rolling average
    this.frames.push(1000 / deltaTime)
    if (this.frames.length > 60) {
      this.frames.shift()
    }

    return Math.round(
      this.frames.reduce((sum, fps) => sum + fps, 0) / this.frames.length
    )
  }

  reset(): void {
    this.frames = []
    this.lastTime = performance.now()
  }
}

// Bundle preloader for critical paths
export const preloadBundles = (paths: string[]): Promise<void[]> => {
  return Promise.all(
    paths.map(
      (path) =>
        new Promise<void>((resolve) => {
          const link = document.createElement('link')
          link.rel = 'prefetch'
          link.href = path
          link.onload = () => resolve()
          link.onerror = () => resolve() // Don't fail on individual bundle errors
          document.head.appendChild(link)
        })
    )
  )
}

// Component render time tracker
export const measureRenderTime = (componentName: string) => {
  const startTime = performance.now()

  return () => {
    const endTime = performance.now()
    const renderTime = endTime - startTime

    if (renderTime > 16) { // Warn if render takes longer than one frame (60fps)
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`)
    }

    return renderTime
  }
}

// Browser capability detection
export const getBrowserCapabilities = () => {
  return {
    webgl: !!window.WebGLRenderingContext,
    webgl2: !!window.WebGL2RenderingContext,
    webWorkers: typeof Worker !== 'undefined',
    serviceWorkers: 'serviceWorker' in navigator,
    intersectionObserver: 'IntersectionObserver' in window,
    requestIdleCallback: 'requestIdleCallback' in window,
    offscreenCanvas: 'OffscreenCanvas' in window,
    sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
  }
}

// Idle time task scheduler
export const scheduleIdleTask = (
  task: () => void,
  options: { timeout?: number } = {}
) => {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(task, options)
  } else {
    // Fallback for browsers without requestIdleCallback
    return setTimeout(task, 0)
  }
}

// Performance marks and measures
export const performanceMark = {
  start: (name: string) => {
    performance.mark(`${name}-start`)
  },
  end: (name: string) => {
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)

    const measure = performance.getEntriesByName(name, 'measure')[0]
    return measure ? measure.duration : 0
  },
  clear: (name: string) => {
    performance.clearMarks(`${name}-start`)
    performance.clearMarks(`${name}-end`)
    performance.clearMeasures(name)
  }
}

// Critical resource hints
export const addResourceHints = () => {
  const head = document.head

  // DNS prefetch for external resources
  const dnsPrefetches = [
    '//fonts.googleapis.com',
    '//cdn.jsdelivr.net',
  ]

  dnsPrefetches.forEach(domain => {
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = domain
    head.appendChild(link)
  })

  // Preconnect to critical origins
  const preconnects = [
    'https://fonts.gstatic.com',
  ]

  preconnects.forEach(origin => {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = origin
    link.crossOrigin = 'anonymous'
    head.appendChild(link)
  })
}

// Chunk loading optimization
export const optimizeChunkLoading = () => {
  // Enable module preloading hints
  if ('modulePreload' in HTMLLinkElement.prototype) {
    document.querySelectorAll('link[rel="modulepreload"]').forEach(link => {
      const href = (link as HTMLLinkElement).href
      if (href && !href.includes('legacy')) {
        // Prefetch modern chunks
        const prefetchLink = document.createElement('link')
        prefetchLink.rel = 'prefetch'
        prefetchLink.href = href
        document.head.appendChild(prefetchLink)
      }
    })
  }
}

// Initialize performance optimizations
export const initializePerformanceOptimizations = () => {
  // Add resource hints
  addResourceHints()

  // Optimize chunk loading
  optimizeChunkLoading()

  // Get browser capabilities for monitoring (not logged to avoid console noise)
  getBrowserCapabilities()

  // Initialize global performance monitoring
  if (typeof window !== 'undefined') {
    const winWithPerf = window as WindowWithPerformanceUtils
    winWithPerf.__PERFORMANCE_UTILS__ = {
      fpsCounter: new FPSCounter(),
      getMemoryUsage,
      performanceMark,
    }
  }
}