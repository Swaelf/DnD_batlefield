/**
 * Logger utility - Conditional logging based on environment
 *
 * In production: Only errors and warnings
 * In development: Full logging with categories
 */

type LogCategory = 'sync' | 'animation' | 'store' | 'canvas' | 'general'

const isDevelopment = import.meta.env.DEV

// Enable/disable specific categories in development
const enabledCategories: Set<LogCategory> = new Set([
  // Uncomment to enable specific categories:
  // 'sync',
  // 'animation',
  // 'store',
  // 'canvas',
  // 'general',
])

class Logger {
  private formatMessage(category: LogCategory, message: string, ...args: any[]): [string, ...any[]] {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
    return [`[${timestamp}] [${category.toUpperCase()}] ${message}`, ...args]
  }

  debug(category: LogCategory, message: string, ...args: any[]): void {
    if (!isDevelopment || !enabledCategories.has(category)) return
    console.log(...this.formatMessage(category, message, ...args))
  }

  info(category: LogCategory, message: string, ...args: any[]): void {
    if (!isDevelopment || !enabledCategories.has(category)) return
    console.info(...this.formatMessage(category, message, ...args))
  }

  warn(category: LogCategory, message: string, ...args: any[]): void {
    console.warn(...this.formatMessage(category, message, ...args))
  }

  error(category: LogCategory, message: string, ...args: any[]): void {
    console.error(...this.formatMessage(category, message, ...args))
  }

  // Legacy console methods for backward compatibility
  log(message: string, ...args: any[]): void {
    if (!isDevelopment) return
    console.log(message, ...args)
  }
}

export const logger = new Logger()

// Helper to enable categories dynamically (for debugging)
export function enableLogCategory(category: LogCategory): void {
  enabledCategories.add(category)
}

export function disableLogCategory(category: LogCategory): void {
  enabledCategories.delete(category)
}

export function enableAllLogs(): void {
  enabledCategories.add('sync')
  enabledCategories.add('animation')
  enabledCategories.add('store')
  enabledCategories.add('canvas')
  enabledCategories.add('general')
}

export function disableAllLogs(): void {
  enabledCategories.clear()
}

// Expose to window for debugging in browser console
if (typeof window !== 'undefined') {
  (window as any).__logger = {
    enable: enableLogCategory,
    disable: disableLogCategory,
    enableAll: enableAllLogs,
    disableAll: disableAllLogs,
  }
}
