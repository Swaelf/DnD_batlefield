/**
 * Store Creation Utilities - Standardized patterns for Zustand stores
 * Provides consistent store creation with Immer integration and TypeScript support
 */

import { create, useStore as useZustandStore } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { subscribeWithSelector } from 'zustand/middleware'
import type { StateCreator, StoreApi } from 'zustand'

export type StoreActions<T> = {
  reset: () => void
  getState: () => T
}

export type StoreWithActions<T> = T & StoreActions<T>

export type StoreCreator<T> = (
  set: (fn: (state: T) => void) => void,
  get: () => T,
  api: StoreApi<T>
) => T

/**
 * Create a Zustand store with Immer and standard actions
 */
export function createStore<T extends object>(
  storeCreator: StoreCreator<T>,
  initialState?: Partial<T>
): StoreApi<StoreWithActions<T>> {
  const stateCreator: StateCreator<
    StoreWithActions<T>,
    [['zustand/immer', never], ['zustand/subscribeWithSelector', never]],
    [],
    StoreWithActions<T>
  > = (set, get, api) => {
    const state = storeCreator(
      // Cast needed: Immer middleware expects mutable state, but our StoreCreator uses immutable pattern
      (fn) => set((state) => fn(state as T)),
      () => get(),
      api as StoreApi<T>
    )

    const storeState = initialState ? { ...state, ...initialState } : state

    return {
      ...storeState,
      reset: () => {
        const freshState = storeCreator(
          (fn) => set((state) => fn(state as T)),
          () => get(),
          api as StoreApi<T>
        )
        set(() => ({ ...freshState, ...initialState }))
      },
      getState: () => {
        const currentState = get()
         
        const { reset: _reset, getState: _getState, ...state } = currentState
        return state as T
      }
    } as StoreWithActions<T>
  }

  // Type assertion needed: Zustand's middleware composition types don't infer correctly
  // when combining immer + subscribeWithSelector. The runtime behavior is correct.
  // See: https://github.com/pmndrs/zustand/issues/980
  type ComposedMiddleware = typeof subscribeWithSelector extends (s: infer S) => infer R ? R : never

  return create<StoreWithActions<T>>()(
    subscribeWithSelector(immer(stateCreator)) as ComposedMiddleware
  ) as unknown as StoreApi<StoreWithActions<T>>
}

/**
 * Create a selector function for a store
 */
export function createSelector<T, R>(
  store: StoreApi<T>,
  selector: (state: T) => R
): () => R {
  return () => selector(store.getState())
}

/**
 * Create a typed hook for a store
 */
export function createStoreHook<T extends object>(
  store: StoreApi<StoreWithActions<T>>
) {
  // Create two separate implementations to avoid type issues
  function useStoreWithSelector<R>(selector: (state: T) => R): R {
    return useZustandStore(store, (state: StoreWithActions<T>) => selector(state.getState()))
  }

  function useStoreWithoutSelector(): T {
    return useZustandStore(store, (state: StoreWithActions<T>) => state.getState())
  }

  // Return overloaded function
  function useStore(): T
  function useStore<R>(selector: (state: T) => R): R
  function useStore<R>(selector?: (state: T) => R) {
    // Always call hooks in the same order - React rules compliance
    const selectorResult = useStoreWithSelector(selector || ((state) => state as unknown as R))
    const fullState = useStoreWithoutSelector()

    // Return the appropriate result based on whether selector was provided
    return selector ? selectorResult : fullState
  }

  return useStore
}

/**
 * Create subscription helpers for a store
 */
export function createStoreSubscriptions<T extends object>(
  store: StoreApi<StoreWithActions<T>>
) {
  return {
    /**
     * Subscribe to specific property changes
     */
    subscribe: <K extends keyof T>(
      key: K,
      callback: (value: T[K], previousValue: T[K]) => void
    ) => {
      let previousValue = store.getState().getState()[key]
      return store.subscribe((state) => {
        const currentValue = state.getState()[key]
        if (currentValue !== previousValue) {
          callback(currentValue, previousValue)
          previousValue = currentValue
        }
      })
    },

    /**
     * Subscribe to deep property changes
     */
    subscribeDeep: <R>(
      selector: (state: T) => R,
      callback: (value: R, previousValue: R) => void
    ) => {
      let previousValue = selector(store.getState().getState())
      return store.subscribe((state) => {
        const currentValue = selector(state.getState())
        if (currentValue !== previousValue) {
          callback(currentValue, previousValue)
          previousValue = currentValue
        }
      })
    },

    /**
     * Subscribe to store changes
     */
    subscribeToStore: (callback: (state: T, previousState: T) => void) => {
      let previousState = store.getState().getState()
      return store.subscribe((state) => {
        const currentState = state.getState()
        if (currentState !== previousState) {
          callback(currentState, previousState)
          previousState = currentState
        }
      })
    }
  }
}

/**
 * Store configuration options
 */
export type StoreConfig = {
  name?: string
  version?: number
  persist?: boolean
  devtools?: boolean
}

/**
 * Enhanced store creation with configuration
 */
export function createConfiguredStore<T extends object>(
  storeCreator: StoreCreator<T>,
  config: StoreConfig = {},
  initialState?: Partial<T>
) {
  const store = createStore(storeCreator, initialState)

  // Add store name for debugging
  if (config.name) {
    ;(store as unknown as { storeName: string }).storeName = config.name
  }

  return store
}

/**
 * Utility type for extracting state type from store
 */
export type StoreState<T> = T extends StoreApi<StoreWithActions<infer U>> ? U : never

/**
 * Utility type for store actions
 */
export type StoreActionsType<T> = T extends StoreApi<infer U> ?
  U extends StoreWithActions<infer S> ?
    Omit<U, keyof S> : never : never