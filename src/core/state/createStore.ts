/**
 * Store Creation Utilities - Standardized patterns for Zustand stores
 * Provides consistent store creation with Immer integration and TypeScript support
 */

import { create } from 'zustand'
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
      (fn) => set((state) => fn(state)),
      () => get(),
      api as StoreApi<T>
    )

    const storeState = initialState ? { ...state, ...initialState } : state

    return {
      ...storeState,
      reset: () => {
        const freshState = storeCreator(
          (fn) => set((state) => fn(state)),
          () => get(),
          api as StoreApi<T>
        )
        set(() => ({ ...freshState, ...initialState }))
      },
      getState: () => {
        const currentState = get()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { reset, getState, ...state } = currentState
        return state as T
      }
    } as StoreWithActions<T>
  }

  return create<StoreWithActions<T>>()(
    subscribeWithSelector(immer(stateCreator))
  )
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
  function useStore(): T
  function useStore<R>(selector: (state: T) => R): R
  function useStore<R>(selector?: (state: T) => R) {
    if (selector) {
      return store((state) => selector(state.getState()))
    }
    return store((state) => state.getState())
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
      return store.subscribe(
        (state) => state.getState()[key],
        callback,
        { equalityFn: (a, b) => a === b }
      )
    },

    /**
     * Subscribe to deep property changes
     */
    subscribeDeep: <R>(
      selector: (state: T) => R,
      callback: (value: R, previousValue: R) => void
    ) => {
      return store.subscribe(
        (state) => selector(state.getState()),
        callback
      )
    },

    /**
     * Subscribe to store changes
     */
    subscribeToStore: (callback: (state: T, previousState: T) => void) => {
      return store.subscribe(
        (state) => state.getState(),
        callback
      )
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