import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type {
  UnifiedAction,
  ActionHistoryEntry,
  ActionFilter,
  AreaShape,
  CircularArea,
  SquareArea,
  ConeArea,
  LineArea
} from '@/types/unifiedAction'
import type { Point } from '@/types/geometry'
import type { Token } from '@/types'

type HighlightedTarget = {
  tokenId: string
  actionId: string
  color: string
}

type UnifiedActionStore = {
  // State
  activeActions: UnifiedAction[]
  actionHistory: ActionHistoryEntry[]
  highlightedTargets: HighlightedTarget[]
  maxHistorySize: number
  isExecuting: boolean

  // Actions
  executeAction: (action: UnifiedAction) => void
  completeAction: (actionId: string) => void
  failAction: (actionId: string, error: string) => void
  clearHighlights: () => void
  clearHighlight: (actionId: string) => void
  clearAllHighlights: () => void
  highlightTargets: (tokenIds: string[], actionId: string, color?: string, duration?: number) => void
  getAffectedTargets: (action: UnifiedAction, allTokens: Token[]) => string[]
  addToHistory: (action: UnifiedAction) => void
  clearHistory: () => void
  filterHistory: (filter: ActionFilter) => ActionHistoryEntry[]
  removeActiveAction: (actionId: string) => void
  setMaxHistorySize: (size: number) => void

  // Utility methods
  isTokenInArea: (token: Token, area: AreaShape) => boolean
  calculateAreaBounds: (area: AreaShape) => { min: Point, max: Point }
}

export const useUnifiedActionStore = create<UnifiedActionStore>()(
  immer((set, get) => ({
    // Initial state
    activeActions: [],
    actionHistory: [],
    highlightedTargets: [],
    maxHistorySize: 100,
    isExecuting: false,

    // Execute a new action
    executeAction: (action) =>
      set((state) => {
        state.isExecuting = true
        state.activeActions.push(action)

        // Create history entry
        const historyEntry: ActionHistoryEntry = {
          ...action,
          executedAt: Date.now(),
          status: 'executing'
        }

        state.actionHistory.unshift(historyEntry)

        // Limit history size
        if (state.actionHistory.length > state.maxHistorySize) {
          state.actionHistory = state.actionHistory.slice(0, state.maxHistorySize)
        }
      }),

    // Mark action as completed
    completeAction: (actionId) =>
      set((state) => {
        const activeIndex = state.activeActions.findIndex(a => a.id === actionId)
        if (activeIndex !== -1) {
          state.activeActions.splice(activeIndex, 1)
        }

        const historyIndex = state.actionHistory.findIndex(h => h.id === actionId)
        if (historyIndex !== -1) {
          state.actionHistory[historyIndex].status = 'completed'
          state.actionHistory[historyIndex].completedAt = Date.now()
        }

        if (state.activeActions.length === 0) {
          state.isExecuting = false
        }
      }),

    // Mark action as failed
    failAction: (actionId, error) =>
      set((state) => {
        const activeIndex = state.activeActions.findIndex(a => a.id === actionId)
        if (activeIndex !== -1) {
          state.activeActions.splice(activeIndex, 1)
        }

        const historyIndex = state.actionHistory.findIndex(h => h.id === actionId)
        if (historyIndex !== -1) {
          state.actionHistory[historyIndex].status = 'failed'
          state.actionHistory[historyIndex].error = error
          state.actionHistory[historyIndex].completedAt = Date.now()
        }

        if (state.activeActions.length === 0) {
          state.isExecuting = false
        }
      }),

    // Clear all highlights
    clearHighlights: () =>
      set((state) => {
        state.highlightedTargets = []
      }),

    // Clear highlights for specific action
    clearHighlight: (actionId) =>
      set((state) => {
        state.highlightedTargets = state.highlightedTargets.filter(
          h => h.actionId !== actionId
        )
      }),

    // Clear all highlights (alias for clearHighlights)
    clearAllHighlights: () =>
      set((state) => {
        state.highlightedTargets = []
      }),

    // Highlight specific targets
    highlightTargets: (tokenIds, actionId, color = '#FF0000', duration) =>
      set((state) => {
        // Remove any existing highlights for this action
        state.highlightedTargets = state.highlightedTargets.filter(
          h => h.actionId !== actionId
        )

        // Add new highlights
        const newHighlights = tokenIds.map(tokenId => ({
          tokenId,
          actionId,
          color
        }))

        state.highlightedTargets.push(...newHighlights)

        // Auto-clear highlights after duration
        if (duration && duration > 0) {
          setTimeout(() => {
            get().clearHighlight(actionId)
          }, duration)
        }
      }),

    // Get affected targets based on action
    getAffectedTargets: (action, allTokens) => {
      const { target, effects } = action
      const affectedTokenIds: string[] = []

      // Direct target(s)
      if (typeof target === 'string') {
        affectedTokenIds.push(target)
      } else if (Array.isArray(target)) {
        affectedTokenIds.push(...target)
      }

      // Area of effect targets
      if (effects.areaOfEffect) {
        const tokensInArea = allTokens.filter(token =>
          get().isTokenInArea(token, effects.areaOfEffect!)
        )
        affectedTokenIds.push(...tokensInArea.map(t => t.id))
      }

      // Include explicitly defined affected targets
      if (effects.affectedTargets) {
        affectedTokenIds.push(...effects.affectedTargets)
      }

      // Return unique token IDs
      return [...new Set(affectedTokenIds)]
    },

    // Add action to history
    addToHistory: (action) =>
      set((state) => {
        const historyEntry: ActionHistoryEntry = {
          ...action,
          executedAt: Date.now(),
          status: 'completed',
          completedAt: Date.now()
        }

        state.actionHistory.unshift(historyEntry)

        if (state.actionHistory.length > state.maxHistorySize) {
          state.actionHistory = state.actionHistory.slice(0, state.maxHistorySize)
        }
      }),

    // Clear all history
    clearHistory: () =>
      set((state) => {
        state.actionHistory = []
      }),

    // Filter history based on criteria
    filterHistory: (filter) => {
      const history = get().actionHistory

      return history.filter(entry => {
        // Filter by types (array)
        if (filter.types && filter.types.length > 0) {
          if (!filter.types.includes(entry.type)) {
            return false
          }
        }

        // Filter by categories (array)
        if (filter.categories && filter.categories.length > 0) {
          if (!filter.categories.includes(entry.category)) {
            return false
          }
        }

        // Filter by status
        if (filter.status) {
          if (entry.status !== filter.status) {
            return false
          }
        }

        // Filter by source
        if (filter.source) {
          const entrySource = typeof entry.source === 'string' ? entry.source : null
          if (!entrySource || !filter.source.includes(entrySource)) {
            return false
          }
        }

        // Filter by time range
        if (filter.timeRange) {
          const executedAt = entry.executedAt || 0
          if (executedAt < filter.timeRange.start || executedAt > filter.timeRange.end) {
            return false
          }
        }

        // Filter by search text
        if (filter.searchText) {
          const searchLower = filter.searchText.toLowerCase()
          const nameMatch = entry.metadata.name?.toLowerCase().includes(searchLower) || false
          const descMatch = entry.metadata.description?.toLowerCase().includes(searchLower) || false
          if (!nameMatch && !descMatch) {
            return false
          }
        }

        return true
      })
    },

    // Remove active action
    removeActiveAction: (actionId) =>
      set((state) => {
        const index = state.activeActions.findIndex(a => a.id === actionId)
        if (index !== -1) {
          state.activeActions.splice(index, 1)
        }

        if (state.activeActions.length === 0) {
          state.isExecuting = false
        }
      }),

    // Set maximum history size
    setMaxHistorySize: (size) =>
      set((state) => {
        state.maxHistorySize = Math.max(1, Math.min(1000, size))
        // Trim history if it exceeds the new max size
        if (state.actionHistory.length > state.maxHistorySize) {
          state.actionHistory = state.actionHistory.slice(0, state.maxHistorySize)
        }
      }),

    // Check if token is in area
    isTokenInArea: (token, area) => {
      const tokenPos = token.position

      switch (area.type) {
        case 'circle': {
          const circle = area as CircularArea
          const dx = tokenPos.x - circle.center.x
          const dy = tokenPos.y - circle.center.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          return distance <= circle.radius
        }

        case 'square': {
          const square = area as SquareArea
          const halfSize = square.size / 2
          return Math.abs(tokenPos.x - square.center.x) <= halfSize &&
                 Math.abs(tokenPos.y - square.center.y) <= halfSize
        }

        case 'cone': {
          const cone = area as ConeArea
          const dx = tokenPos.x - cone.origin.x
          const dy = tokenPos.y - cone.origin.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance > cone.range) return false

          const angle = Math.atan2(dy, dx) * 180 / Math.PI
          const angleDiff = Math.abs(angle - cone.direction)
          const normalizedDiff = angleDiff > 180 ? 360 - angleDiff : angleDiff

          return normalizedDiff <= cone.angle / 2
        }

        case 'line': {
          const line = area as LineArea
          const { start, end, width } = line

          // Calculate distance from point to line segment
          const A = tokenPos.x - start.x
          const B = tokenPos.y - start.y
          const C = end.x - start.x
          const D = end.y - start.y

          const dot = A * C + B * D
          const lenSq = C * C + D * D
          let param = -1

          if (lenSq !== 0) {
            param = dot / lenSq
          }

          let xx, yy

          if (param < 0) {
            xx = start.x
            yy = start.y
          } else if (param > 1) {
            xx = end.x
            yy = end.y
          } else {
            xx = start.x + param * C
            yy = start.y + param * D
          }

          const dx = tokenPos.x - xx
          const dy = tokenPos.y - yy
          const distance = Math.sqrt(dx * dx + dy * dy)

          return distance <= width / 2
        }

        default:
          return false
      }
    },

    // Calculate area bounds for rendering
    calculateAreaBounds: (area) => {
      switch (area.type) {
        case 'circle': {
          const circle = area as CircularArea
          return {
            min: { x: circle.center.x - circle.radius, y: circle.center.y - circle.radius },
            max: { x: circle.center.x + circle.radius, y: circle.center.y + circle.radius }
          }
        }

        case 'square': {
          const square = area as SquareArea
          const halfSize = square.size / 2
          return {
            min: { x: square.center.x - halfSize, y: square.center.y - halfSize },
            max: { x: square.center.x + halfSize, y: square.center.y + halfSize }
          }
        }

        case 'cone': {
          const cone = area as ConeArea
          // Rough bounds for cone
          return {
            min: { x: cone.origin.x - cone.range, y: cone.origin.y - cone.range },
            max: { x: cone.origin.x + cone.range, y: cone.origin.y + cone.range }
          }
        }

        case 'line': {
          const line = area as LineArea
          const halfWidth = line.width / 2
          return {
            min: {
              x: Math.min(line.start.x, line.end.x) - halfWidth,
              y: Math.min(line.start.y, line.end.y) - halfWidth
            },
            max: {
              x: Math.max(line.start.x, line.end.x) + halfWidth,
              y: Math.max(line.start.y, line.end.y) + halfWidth
            }
          }
        }

        default:
          return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } }
      }
    }
  }))
)