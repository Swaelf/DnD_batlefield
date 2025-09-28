/**
 * Event Bus Hook - React integration for the event system
 * Provides a clean React API for subscribing to and emitting domain events
 */

import { useEffect, useCallback, useRef } from 'react'
import { eventBus } from './EventBus'
import type { EventHandler, CleanupFunction } from '@/foundation/types'
import type { DomainEvent, EventType, EventPayload } from './DomainEvents'

export type UseEventBusOptions = {
  /**
   * Whether to automatically clean up subscriptions on unmount
   * @default true
   */
  autoCleanup?: boolean
}

export type UseEventBusReturn = {
  /**
   * Subscribe to an event
   */
  on: <T extends EventType>(event: T, handler: EventHandler<EventPayload<T>>) => CleanupFunction

  /**
   * Subscribe to an event that will only fire once
   */
  once: <T extends EventType>(event: T, handler: EventHandler<EventPayload<T>>) => CleanupFunction

  /**
   * Emit an event
   */
  emit: <T extends EventType>(event: T, payload?: EventPayload<T>) => void

  /**
   * Emit a domain event with proper typing
   */
  emitEvent: (event: DomainEvent) => void

  /**
   * Remove all subscriptions managed by this hook
   */
  cleanup: () => void

  /**
   * Check if an event has any handlers
   */
  hasHandlers: (event: string) => boolean

  /**
   * Get number of handlers for an event
   */
  getHandlerCount: (event: string) => number
}

export const useEventBus = (options: UseEventBusOptions = {}): UseEventBusReturn => {
  const { autoCleanup = true } = options
  const subscriptionsRef = useRef<Set<CleanupFunction>>(new Set())

  const addSubscription = useCallback((cleanup: CleanupFunction) => {
    subscriptionsRef.current.add(cleanup)
    return cleanup
  }, [])

  const on = useCallback(<T extends EventType>(
    event: T,
    handler: EventHandler<EventPayload<T>>
  ): CleanupFunction => {
    const subscription = eventBus.on(event, handler)

    const cleanup = () => {
      subscription.unsubscribe()
      subscriptionsRef.current.delete(cleanup)
    }

    return addSubscription(cleanup)
  }, [addSubscription])

  const once = useCallback(<T extends EventType>(
    event: T,
    handler: EventHandler<EventPayload<T>>
  ): CleanupFunction => {
    const subscription = eventBus.once(event, handler)

    const cleanup = () => {
      subscription.unsubscribe()
      subscriptionsRef.current.delete(cleanup)
    }

    return addSubscription(cleanup)
  }, [addSubscription])

  const emit = useCallback(<T extends EventType>(
    event: T,
    payload?: EventPayload<T>
  ): void => {
    eventBus.emit(event, payload)
  }, [])

  const emitEvent = useCallback((event: DomainEvent): void => {
    eventBus.emit(event.type, event.payload)
  }, [])

  const cleanup = useCallback((): void => {
    for (const cleanupFn of subscriptionsRef.current) {
      cleanupFn()
    }
    subscriptionsRef.current.clear()
  }, [])

  const hasHandlers = useCallback((event: string): boolean => {
    return eventBus.hasHandlers(event)
  }, [])

  const getHandlerCount = useCallback((event: string): number => {
    return eventBus.getHandlerCount(event)
  }, [])

  // Auto cleanup on unmount if enabled
  useEffect(() => {
    if (autoCleanup) {
      return cleanup
    }
    return undefined
  }, [autoCleanup, cleanup])

  return {
    on,
    once,
    emit,
    emitEvent,
    cleanup,
    hasHandlers,
    getHandlerCount
  }
}

/**
 * Hook for subscribing to a specific event type with automatic cleanup
 */
export const useEventSubscription = <T extends EventType>(
  event: T,
  handler: EventHandler<EventPayload<T>>,
  deps: React.DependencyList = []
): void => {
  const { on } = useEventBus()

  useEffect(() => {
    const cleanup = on(event, handler)
    return cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, ...deps])
}

/**
 * Hook for emitting events with a stable reference
 */
export const useEventEmitter = (): {
  emit: <T extends EventType>(event: T, payload?: EventPayload<T>) => void
  emitEvent: (event: DomainEvent) => void
} => {
  const { emit, emitEvent } = useEventBus()
  return { emit, emitEvent }
}