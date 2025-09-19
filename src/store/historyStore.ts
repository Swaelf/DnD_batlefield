import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { BattleMap } from '@/types/map'

const MAX_HISTORY_SIZE = 50

interface HistoryState {
  past: BattleMap[]
  future: BattleMap[]
  canUndo: boolean
  canRedo: boolean
}

interface HistoryStore extends HistoryState {
  // Actions
  pushState: (state: BattleMap) => void
  undo: () => BattleMap | null
  redo: () => BattleMap | null
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

      let newState: BattleMap | null = null

      set((draft) => {
        const previousState = draft.past.pop()
        if (previousState) {
          // Get the current state before undo (should be passed as parameter)
          // For now, we'll return the previous state
          newState = previousState

          // Update flags
          draft.canUndo = draft.past.length > 0
          draft.canRedo = draft.future.length > 0
        }
      })

      return newState
    },

    redo: () => {
      const state = get()
      if (state.future.length === 0) return null

      let newState: BattleMap | null = null

      set((draft) => {
        const nextState = draft.future.pop()
        if (nextState) {
          newState = nextState

          // Update flags
          draft.canUndo = draft.past.length > 0
          draft.canRedo = draft.future.length > 0
        }
      })

      return newState
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