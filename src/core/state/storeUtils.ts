/**
 * Store Utilities - Common patterns and helpers for state management
 * Provides reusable patterns for async operations, selections, and store composition
 */

import type { StoreApi } from 'zustand'
import type { AsyncState, Result } from '@/foundation/types'

/**
 * Async operation state helpers
 */
export const asyncStateHelpers = {
  /**
   * Create initial async state
   */
  idle: <T>(): AsyncState<T> => ({ status: 'idle' }),

  /**
   * Create pending async state
   */
  pending: <T>(): AsyncState<T> => ({ status: 'pending' }),

  /**
   * Create fulfilled async state
   */
  fulfilled: <T>(data: T): AsyncState<T> => ({ status: 'fulfilled', data }),

  /**
   * Create rejected async state
   */
  rejected: <T>(error: Error): AsyncState<T> => ({ status: 'rejected', error }),

  /**
   * Type guards for async state
   */
  isIdle: <T>(state: AsyncState<T>): state is { status: 'idle' } =>
    state.status === 'idle',

  isPending: <T>(state: AsyncState<T>): state is { status: 'pending' } =>
    state.status === 'pending',

  isFulfilled: <T>(state: AsyncState<T>): state is { status: 'fulfilled'; data: T } =>
    state.status === 'fulfilled',

  isRejected: <T>(state: AsyncState<T>): state is { status: 'rejected'; error: Error } =>
    state.status === 'rejected'
}

/**
 * Selection state helpers
 */
export const selectionHelpers = {
  /**
   * Toggle item in selection
   */
  toggleSelection: <T>(selection: T[], item: T, isEqual?: (a: T, b: T) => boolean): T[] => {
    const equalityFn = isEqual || ((a, b) => a === b)
    const index = selection.findIndex(selected => equalityFn(selected, item))

    if (index >= 0) {
      return selection.filter((_, i) => i !== index)
    } else {
      return [...selection, item]
    }
  },

  /**
   * Add item to selection
   */
  addToSelection: <T>(selection: T[], item: T, isEqual?: (a: T, b: T) => boolean): T[] => {
    const equalityFn = isEqual || ((a, b) => a === b)
    const exists = selection.some(selected => equalityFn(selected, item))

    if (exists) {
      return selection
    }

    return [...selection, item]
  },

  /**
   * Remove item from selection
   */
  removeFromSelection: <T>(selection: T[], item: T, isEqual?: (a: T, b: T) => boolean): T[] => {
    const equalityFn = isEqual || ((a, b) => a === b)
    return selection.filter(selected => !equalityFn(selected, item))
  },

  /**
   * Clear selection
   */
  clearSelection: <T>(): T[] => [],

  /**
   * Select all items
   */
  selectAll: <T>(items: T[]): T[] => [...items]
}

/**
 * Collection state helpers
 */
export const collectionHelpers = {
  /**
   * Add item to collection
   */
  addItem: <T extends { id: string }>(collection: T[], item: T): T[] => {
    const exists = collection.some(existing => existing.id === item.id)
    if (exists) {
      return collection
    }
    return [...collection, item]
  },

  /**
   * Update item in collection
   */
  updateItem: <T extends { id: string }>(
    collection: T[],
    id: string,
    updates: Partial<T>
  ): T[] => {
    return collection.map(item =>
      item.id === id ? { ...item, ...updates } : item
    )
  },

  /**
   * Remove item from collection
   */
  removeItem: <T extends { id: string }>(collection: T[], id: string): T[] => {
    return collection.filter(item => item.id !== id)
  },

  /**
   * Replace entire collection
   */
  replaceCollection: <T>(newCollection: T[]): T[] => [...newCollection],

  /**
   * Move item in collection
   */
  moveItem: <T>(collection: T[], fromIndex: number, toIndex: number): T[] => {
    const result = [...collection]
    const [removed] = result.splice(fromIndex, 1)
    result.splice(toIndex, 0, removed)
    return result
  },

  /**
   * Find item in collection
   */
  findItem: <T extends { id: string }>(collection: T[], id: string): T | undefined => {
    return collection.find(item => item.id === id)
  },

  /**
   * Find item index in collection
   */
  findItemIndex: <T extends { id: string }>(collection: T[], id: string): number => {
    return collection.findIndex(item => item.id === id)
  }
}

/**
 * Result state helpers
 */
export const resultHelpers = {
  /**
   * Create success result
   */
  success: <T>(data: T): Result<T> => ({ success: true, data }),

  /**
   * Create error result
   */
  error: <T>(error: Error): Result<T> => ({ success: false, error }),

  /**
   * Type guards for results
   */
  isSuccess: <T>(result: Result<T>): result is { success: true; data: T } =>
    result.success,

  isError: <T>(result: Result<T>): result is { success: false; error: Error } =>
    !result.success
}

/**
 * Store debugging helpers
 */
export const debugHelpers = {
  /**
   * Log store state changes
   */
  logStateChanges: <T>(store: StoreApi<T>, storeName: string) => {
    return store.subscribe((state, previousState) => {
      console.group(`🔄 ${storeName} State Change`)
      console.log('Previous:', previousState)
      console.log('Current:', state)
      console.groupEnd()
    })
  },

  /**
   * Log specific property changes
   */
  logPropertyChanges: <T, K extends keyof T>(
    store: StoreApi<T>,
    property: K,
    storeName: string
  ) => {
    return store.subscribe(
      state => state[property],
      (value, previousValue) => {
        console.log(`🎯 ${storeName}.${String(property)}:`, previousValue, '→', value)
      }
    )
  }
}

/**
 * Performance helpers for stores
 */
export const performanceHelpers = {
  /**
   * Debounce store updates
   */
  debounce: <T extends unknown[]>(
    fn: (...args: T) => void,
    delay: number
  ): ((...args: T) => void) => {
    let timeoutId: NodeJS.Timeout

    return (...args: T) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => fn(...args), delay)
    }
  },

  /**
   * Throttle store updates
   */
  throttle: <T extends unknown[]>(
    fn: (...args: T) => void,
    delay: number
  ): ((...args: T) => void) => {
    let lastCall = 0

    return (...args: T) => {
      const now = Date.now()
      if (now - lastCall >= delay) {
        lastCall = now
        fn(...args)
      }
    }
  },

  /**
   * Batch store updates
   */
  batch: <T>(updates: Array<() => void>): void => {
    // Execute all updates in a single frame
    requestAnimationFrame(() => {
      updates.forEach(update => update())
    })
  }
}