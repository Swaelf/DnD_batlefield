/**
 * Action Library Hook
 * Main hook for action library functionality
 */

import { useMemo, useCallback } from 'react'
import { useActionStore } from '../store'
import type { ActionType, ActionCategory, ActionSearchCriteria } from '../types'

/**
 * Main action library hook
 */
export const useActionLibrary = () => {
  const store = useActionStore((state: any) => state)

  // Memoized library service access
  const categories = useMemo(() => {
    return store.libraryService.getCategories()
  }, [store.libraryService])

  const allTags = useMemo(() => {
    return store.libraryService.getAllTags()
  }, [store.libraryService])

  const popularActions = useMemo(() => {
    return store.getPopularActions()
  }, [store])

  // Search functionality
  const search = useCallback(async (criteria: ActionSearchCriteria) => {
    await store.search(criteria)
  }, [store])

  const quickSearch = useCallback((query: string) => {
    store.setSearchQuery(query)
  }, [store])

  return {
    // State
    selection: store.selection,
    searchResults: store.searchResults,
    isSearching: store.isSearching,
    popularActions,

    // Library info
    categories,
    allTags,

    // Search actions
    search,
    quickSearch,
    setSearchQuery: store.setSearchQuery,
    setActiveCategory: store.setActiveCategory,
    setSortBy: store.setSortBy,
    setSortDirection: store.setSortDirection,
    setViewMode: store.setViewMode,
    toggleCustomActions: store.toggleCustomActions,

    // Selection
    selectAction: store.selectAction,
    getSelectedAction: store.getSelectedAction,

    // Action retrieval
    getActionsByType: store.getActionsByType,
    getActionsByCategory: store.getActionsByCategory,
    getAllActions: store.getAllActions,

    // Customization
    startCustomization: store.startCustomization,
    updateCustomization: store.updateCustomization,
    finishCustomization: store.finishCustomization,
    cancelCustomization: store.cancelCustomization,
    isCustomizing: store.isCustomizing,
    customizationData: store.customizationData,

    // Custom actions
    saveCustomAction: store.saveCustomAction,
    deleteCustomAction: store.deleteCustomAction,

    // Utility
    refreshLibrary: store.refreshLibrary
  }
}

/**
 * Hook for specific action type
 */
export const useActionsByType = (type: ActionType) => {
  const store = useActionStore((state: any) => state)

  const actions = useMemo(() => {
    return store.getActionsByType(type)
  }, [store, type])

  return {
    actions,
    count: actions.length
  }
}

/**
 * Hook for specific action category
 */
export const useActionsByCategory = (category: ActionCategory) => {
  const store = useActionStore((state: any) => state)

  const actions = useMemo(() => {
    return store.getActionsByCategory(category)
  }, [store, category])

  return {
    actions,
    count: actions.length
  }
}

/**
 * Hook for action selection state
 */
export const useActionSelection = () => {
  const store = useActionStore((state: any) => state)

  const selectedAction = useMemo(() => {
    return store.getSelectedAction()
  }, [store.selection.selectedActionId, store])

  return {
    selectedAction,
    selectedActionId: store.selection.selectedActionId,
    selectAction: store.selectAction,
    clearSelection: useCallback(() => store.selectAction(null), [store])
  }
}

/**
 * Hook for action customization
 */
export const useActionCustomization = () => {
  const store = useActionStore((state: any) => state)

  return {
    isCustomizing: store.isCustomizing,
    customizationData: store.customizationData,
    startCustomization: store.startCustomization,
    updateCustomization: store.updateCustomization,
    finishCustomization: store.finishCustomization,
    cancelCustomization: store.cancelCustomization
  }
}