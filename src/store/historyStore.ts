import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { BattleMap } from '@/types/map'

const MAX_HISTORY_SIZE = 50

type HistoryState = {
  past: BattleMap[]
  future: BattleMap[]
  canUndo: boolean
  canRedo: boolean
}

type HistoryStore = HistoryState & {
  // Actions
  pushState: (state: BattleMap) => void
  undo: () => BattleMap | null
  redo: () => BattleMap | null
  undoWithCurrentState: (currentState: BattleMap) => BattleMap | null
  redoWithCurrentState: (currentState: BattleMap) => BattleMap | null
  clear: () => void
  getHistoryInfo: () => { undoCount: number; redoCount: number }
}

export const useHistoryStore = create<HistoryStore>()(
  immer((set, get) => ({
    past: [],
    future: [],
    canUndo: false,
    canRedo: false,

    pushState: (state) => set((draft) => {
      // Deep clone the state to avoid reference issues
      const stateCopy = JSON.parse(JSON.stringify(state))

      // Add to past
      draft.past.push(stateCopy)

      // Limit history size
      if (draft.past.length > MAX_HISTORY_SIZE) {
        draft.past.shift()
      }

      // Clear future when new state is pushed
      draft.future = []

      // Update flags
      draft.canUndo = draft.past.length > 0
      draft.canRedo = false
    }),

    undo: () => {
      const state = get()
      if (state.past.length === 0) return null

      let previousState: BattleMap | null = null

      set((draft) => {
        previousState = draft.past.pop() || null

        // Note: We need the current state to be pushed to future
        // This will be handled by the calling code

        // Update flags
        draft.canUndo = draft.past.length > 0
        draft.canRedo = true // We can redo after undo
      })

      return previousState
    },

    redo: () => {
      const state = get()
      if (state.future.length === 0) return null

      let nextState: BattleMap | null = null

      set((draft) => {
        nextState = draft.future.pop() || null

        // Update flags
        draft.canUndo = true // We can undo after redo
        draft.canRedo = draft.future.length > 0
      })

      return nextState
    },

    undoWithCurrentState: (currentState: BattleMap) => {
      const state = get()
      if (state.past.length === 0) return null

      let previousState: BattleMap | null = null

      set((draft) => {
        previousState = draft.past.pop() || null

        if (previousState) {
          // Push current state to future for redo
          const currentStateCopy = JSON.parse(JSON.stringify(currentState))
          draft.future.push(currentStateCopy)
        }

        // Update flags
        draft.canUndo = draft.past.length > 0
        draft.canRedo = true // We can redo after undo
      })

      return previousState
    },

    redoWithCurrentState: (currentState: BattleMap) => {
      const state = get()
      if (state.future.length === 0) return null

      let nextState: BattleMap | null = null

      set((draft) => {
        nextState = draft.future.pop() || null

        if (nextState) {
          // Push current state to past for undo
          const currentStateCopy = JSON.parse(JSON.stringify(currentState))
          draft.past.push(currentStateCopy)
        }

        // Update flags
        draft.canUndo = true // We can undo after redo
        draft.canRedo = draft.future.length > 0
      })

      return nextState
    },

    clear: () => set((draft) => {
      draft.past = []
      draft.future = []
      draft.canUndo = false
      draft.canRedo = false
    }),

    getHistoryInfo: () => {
      const state = get()
      return {
        undoCount: state.past.length,
        redoCount: state.future.length
      }
    }
  }))
)

// Middleware to track map changes
// Note: This middleware uses 'any' types as is common in Zustand middleware patterns
// for maximum flexibility across different store types
export const createHistoryMiddleware = () => {
  return (set: any, get: any, api: any) => {
    const originalSet = set

    return {
      ...api,
      set: (fn: any, ...args: any[]) => {
        const prevMap = get().currentMap

        originalSet((state: any) => {
          fn(state)

          // After state change, check if map changed
          const newMap = state.currentMap

          if (newMap && prevMap && JSON.stringify(newMap) !== JSON.stringify(prevMap)) {
            // Map changed, push to history
            const historyStore = useHistoryStore.getState()
            historyStore.pushState(prevMap)
          }
        }, ...args)
      }
    }
  }
}