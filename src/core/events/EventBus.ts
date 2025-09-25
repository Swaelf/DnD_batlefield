/**
 * Event Bus - Decoupled communication system for domain events
 * Enables loose coupling between modules through publish/subscribe pattern
 */

import type { EventHandler, CleanupFunction } from '@/foundation/types'

export type EventSubscription = {
  unsubscribe: CleanupFunction
}

export class EventBus {
  private events: Map<string, Set<EventHandler>> = new Map()

  /**
   * Subscribe to an event
   */
  on<T = unknown>(event: string, handler: EventHandler<T>): EventSubscription {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }

    const handlers = this.events.get(event)!
    handlers.add(handler as EventHandler)

    return {
      unsubscribe: () => this.off(event, handler)
    }
  }

  /**
   * Subscribe to an event that will only fire once
   */
  once<T = unknown>(event: string, handler: EventHandler<T>): EventSubscription {
    const onceHandler: EventHandler<T> = (data: T) => {
      handler(data)
      this.off(event, onceHandler)
    }

    return this.on(event, onceHandler)
  }

  /**
   * Unsubscribe from an event
   */
  off<T = unknown>(event: string, handler: EventHandler<T>): void {
    const handlers = this.events.get(event)
    if (handlers) {
      handlers.delete(handler as EventHandler)

      // Clean up empty event sets
      if (handlers.size === 0) {
        this.events.delete(event)
      }
    }
  }

  /**
   * Emit an event to all subscribers
   */
  emit<T = unknown>(event: string, data?: T): void {
    const handlers = this.events.get(event)
    if (!handlers) {
      return
    }

    // Create a copy to prevent issues if handlers modify the set during iteration
    const handlersCopy = Array.from(handlers)

    for (const handler of handlersCopy) {
      try {
        handler(data)
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error)
      }
    }
  }

  /**
   * Get all registered event names
   */
  getEventNames(): string[] {
    return Array.from(this.events.keys())
  }

  /**
   * Get number of handlers for an event
   */
  getHandlerCount(event: string): number {
    return this.events.get(event)?.size || 0
  }

  /**
   * Check if an event has any handlers
   */
  hasHandlers(event: string): boolean {
    return this.getHandlerCount(event) > 0
  }

  /**
   * Remove all handlers for an event
   */
  removeAllHandlers(event: string): void {
    this.events.delete(event)
  }

  /**
   * Clear all events and handlers
   */
  clear(): void {
    this.events.clear()
  }

  /**
   * Get debug information about current state
   */
  getDebugInfo(): Record<string, number> {
    const info: Record<string, number> = {}
    for (const [event, handlers] of this.events) {
      info[event] = handlers.size
    }
    return info
  }
}

// Singleton instance for the application
export const eventBus = new EventBus()