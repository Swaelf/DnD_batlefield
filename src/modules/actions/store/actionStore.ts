/**
 * Action Store
 * Modern Zustand store for action selection and management
 */

import { produce } from 'immer'
import { createStore } from '@/core/state'
import type {
  UnifiedAction,
  ActionId,
  ActionType,
  ActionCategory,
  ActionSearchCriteria,
  ActionSelectionState,
  ActionSortBy,
  ActionCustomization
} from '../types'
import { ActionLibraryService } from '../services'

/**
 * Action store state
 */
type ActionState = {
  // Services (injected for testability)
  libraryService: ActionLibraryService

  // Selection state
  selection: ActionSelectionState

  // Search and filtering
  searchResults: UnifiedAction[]
  isSearching: boolean

  // Popular/recent actions
  popularActions: UnifiedAction[]
  recentActions: UnifiedAction[]

  // Customization state
  isCustomizing: boolean
  customizationData: ActionCustomization | null
}

/**
 * Action store actions
 */
type ActionActions = {
  // Search and filtering
  search: (criteria: ActionSearchCriteria) => Promise<void>
  setSearchQuery: (query: string) => void
  setActiveCategory: (category: ActionCategory | 'all') => void
  setSortBy: (sortBy: ActionSortBy) => void
  setSortDirection: (direction: 'asc' | 'desc') => void
  setViewMode: (mode: 'grid' | 'list') => void
  toggleCustomActions: () => void

  // Action selection
  selectAction: (actionId: ActionId | null) => void
  getSelectedAction: () => UnifiedAction | null

  // Action management
  getActionsByType: (type: ActionType) => UnifiedAction[]
  getActionsByCategory: (category: ActionCategory) => UnifiedAction[]
  getAllActions: (includeCustom?: boolean) => UnifiedAction[]
  getPopularActions: () => UnifiedAction[]

  // Customization
  startCustomization: (actionId: ActionId) => void
  updateCustomization: (updates: Partial<ActionCustomization>) => void
  finishCustomization: () => UnifiedAction | null
  cancelCustomization: () => void

  // Custom actions
  saveCustomAction: (action: UnifiedAction) => void
  deleteCustomAction: (actionId: ActionId) => void

  // Utility
  refreshLibrary: () => void
}

/**
 * Action store with actions
 */
type ActionStore = ActionState & ActionActions

/**
 * Create action store instance
 */
export const useActionStore = createStore<ActionStore>(
  (set, get) => ({
    // Initial state
    libraryService: new ActionLibraryService(),
    selection: {
      selectedActionId: null,
      searchQuery: '',
      activeCategory: 'all',
      sortBy: 'name',
      sortDirection: 'asc',
      viewMode: 'grid',
      showCustomActions: true
    },
    searchResults: [],
    isSearching: false,
    popularActions: [],
    recentActions: [],
    isCustomizing: false,
    customizationData: null,

    // Search and filtering actions
    search: async (criteria: ActionSearchCriteria) => {
      set(produce((state: ActionState) => {
        state.isSearching = true
      }))

      try {
        const { libraryService } = get()
        const results = libraryService.searchActions({
          ...criteria,
          includeCustom: get().selection.showCustomActions
        })

        // Apply sorting
        const sorted = sortActions(results, get().selection.sortBy, get().selection.sortDirection)

        set(produce((state: ActionState) => {
          state.searchResults = sorted
          state.isSearching = false
        }))
      } catch (error) {
        console.error('Search failed:', error)
        set(produce((state: ActionState) => {
          state.isSearching = false
        }))
      }
    },

    setSearchQuery: (query: string) => {
      set(produce((state: ActionState) => {
        state.selection.searchQuery = query
      }))

      // Trigger search
      const criteria: ActionSearchCriteria = {
        query: query || undefined,
        category: get().selection.activeCategory !== 'all' ? get().selection.activeCategory : undefined
      }
      get().search(criteria)
    },

    setActiveCategory: (category: ActionCategory | 'all') => {
      set(produce((state: ActionState) => {
        state.selection.activeCategory = category
      }))

      // Trigger search
      const criteria: ActionSearchCriteria = {
        query: get().selection.searchQuery || undefined,
        category: category !== 'all' ? category : undefined
      }
      get().search(criteria)
    },

    setSortBy: (sortBy: ActionSortBy) => {
      set(produce((state: ActionState) => {
        state.selection.sortBy = sortBy
      }))

      // Re-sort current results
      const sorted = sortActions(get().searchResults, sortBy, get().selection.sortDirection)
      set(produce((state: ActionState) => {
        state.searchResults = sorted
      }))
    },

    setSortDirection: (direction: 'asc' | 'desc') => {
      set(produce((state: ActionState) => {
        state.selection.sortDirection = direction
      }))

      // Re-sort current results
      const sorted = sortActions(get().searchResults, get().selection.sortBy, direction)
      set(produce((state: ActionState) => {
        state.searchResults = sorted
      }))
    },

    setViewMode: (mode: 'grid' | 'list') => {
      set(produce((state: ActionState) => {
        state.selection.viewMode = mode
      }))
    },

    toggleCustomActions: () => {
      set(produce((state: ActionState) => {
        state.selection.showCustomActions = !state.selection.showCustomActions
      }))

      // Re-run search with updated criteria
      const criteria: ActionSearchCriteria = {
        query: get().selection.searchQuery || undefined,
        category: get().selection.activeCategory !== 'all' ? get().selection.activeCategory : undefined
      }
      get().search(criteria)
    },

    // Selection actions
    selectAction: (actionId: ActionId | null) => {
      set(produce((state: ActionState) => {
        state.selection.selectedActionId = actionId
      }))
    },

    getSelectedAction: () => {
      const { selectedActionId } = get().selection
      if (!selectedActionId) return null

      const { libraryService } = get()
      return libraryService.getActionById(selectedActionId) ||
             get().searchResults.find(action => action.id === selectedActionId) ||
             null
    },

    // Action management
    getActionsByType: (type: ActionType) => {
      const { libraryService } = get()
      return libraryService.getActionsByType(type)
    },

    getActionsByCategory: (category: ActionCategory) => {
      const { libraryService } = get()
      return libraryService.getActionsByCategory(category)
    },

    getAllActions: (includeCustom = true) => {
      const { libraryService } = get()
      return libraryService.getAllActions(includeCustom)
    },

    getPopularActions: () => {
      const { libraryService } = get()
      return libraryService.getPopularActions()
    },

    // Customization actions
    startCustomization: (actionId: ActionId) => {
      const action = get().searchResults.find(a => a.id === actionId)
      if (!action) return

      const customization: ActionCustomization = {
        actionId,
        name: action.name,
        description: action.description
      }

      set(produce((state: ActionState) => {
        state.isCustomizing = true
        state.customizationData = customization
      }))
    },

    updateCustomization: (updates: Partial<ActionCustomization>) => {
      set(produce((state: ActionState) => {
        if (state.customizationData) {
          Object.assign(state.customizationData, updates)
        }
      }))
    },

    finishCustomization: () => {
      const { customizationData, libraryService } = get()
      if (!customizationData) return null

      // Find the original action
      const originalAction = get().searchResults.find(a => a.id === customizationData.actionId)
      if (!originalAction || !originalAction.templateId) return null

      // Create custom action
      const customAction = libraryService.createCustomActionFromTemplate(
        originalAction.templateId,
        {
          name: customizationData.name || originalAction.name,
          description: customizationData.description || originalAction.description,
          // Apply visual and mechanical properties here
        }
      )

      libraryService.saveCustomAction(customAction)

      set(produce((state: ActionState) => {
        state.isCustomizing = false
        state.customizationData = null
      }))

      return customAction
    },

    cancelCustomization: () => {
      set(produce((state: ActionState) => {
        state.isCustomizing = false
        state.customizationData = null
      }))
    },

    // Custom actions
    saveCustomAction: (action: UnifiedAction) => {
      const { libraryService } = get()
      libraryService.saveCustomAction(action)

      // Refresh search if showing custom actions
      if (get().selection.showCustomActions) {
        get().refreshLibrary()
      }
    },

    deleteCustomAction: (actionId: ActionId) => {
      const { libraryService } = get()
      const deleted = libraryService.deleteCustomAction(actionId)

      if (deleted) {
        // Remove from current results if present
        set(produce((state: ActionState) => {
          state.searchResults = state.searchResults.filter(a => a.id !== actionId)
          if (state.selection.selectedActionId === actionId) {
            state.selection.selectedActionId = null
          }
        }))
      }
    },

    // Utility
    refreshLibrary: () => {
      // Re-run current search to refresh results
      const { selection } = get()
      const criteria: ActionSearchCriteria = {
        query: selection.searchQuery || undefined,
        category: selection.activeCategory !== 'all' ? selection.activeCategory : undefined
      }
      get().search(criteria)

      // Refresh popular actions
      const { libraryService } = get()
      const popular = libraryService.getPopularActions()
      set(produce((state: ActionState) => {
        state.popularActions = popular
      }))
    }
  }),
  {
    name: 'action-store',
    persist: {
      partialize: (state) => ({
        selection: {
          ...state.selection,
          selectedActionId: null // Don't persist selection
        }
      })
    }
  }
)

/**
 * Sort actions by criteria
 */
function sortActions(
  actions: UnifiedAction[],
  sortBy: ActionSortBy,
  direction: 'asc' | 'desc'
): UnifiedAction[] {
  return [...actions].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'type':
        comparison = a.type.localeCompare(b.type)
        break
      case 'category':
        comparison = a.category.localeCompare(b.category)
        break
      case 'level':
        // Get level from template data (for spells)
        const aLevel = getActionLevel(a)
        const bLevel = getActionLevel(b)
        comparison = aLevel - bLevel
        break
      case 'recent':
        // Sort by creation date (most recent first)
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        break
      default:
        return 0
    }

    return direction === 'asc' ? comparison : -comparison
  })
}

/**
 * Get action level (for sorting)
 */
function getActionLevel(action: UnifiedAction): number {
  if (action.type === 'spell') {
    const spellData = action.data as any
    return spellData.level || 0
  }
  return 0
}