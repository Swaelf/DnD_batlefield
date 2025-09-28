/**
 * useToken Hook - Main token management hook
 *
 * Provides complete token operations and state management.
 * Integrates with TokenStore for reactive updates.
 */

import { useCallback } from 'react'
import { useTokenStore } from '../store'
import { tokenSelectors } from '../store/selectors'
import type { TokenId, TokenUpdate, Token } from '../types'
import type { Point } from '@/types/geometry'

export interface UseTokenOptions {
  readonly tokenId?: TokenId
}

export interface UseTokenResult {
  // Token data
  readonly token: Token | undefined
  readonly exists: boolean

  // Token operations
  readonly updateToken: (updates: TokenUpdate) => void
  readonly deleteToken: () => void
  readonly moveToken: (position: Point) => void
  readonly duplicateToken: (offset?: Point) => void

  // Selection
  readonly isSelected: boolean
  readonly selectToken: (extend?: boolean) => void
  readonly toggleSelection: () => void

  // State
  readonly isHovered: boolean
  readonly setHovered: (hovered: boolean) => void
  readonly isDragging: boolean
  readonly isAnimating: boolean

  // Validation
  readonly validateToken: () => void
  readonly isValid: boolean
}

export function useToken(options: UseTokenOptions = {}): UseTokenResult {
  const { tokenId } = options

  // Store selectors
  const token = useTokenStore(state =>
    tokenId ? tokenSelectors.getToken(tokenId)(state) : undefined
  )
  const isSelected = useTokenStore(state =>
    tokenId ? tokenSelectors.isTokenSelected(tokenId)(state) : false
  )
  const isHovered = useTokenStore(state => state.hoveredTokenId === tokenId)
  const isDragging = useTokenStore(state => state.draggedTokenId === tokenId)
  const isAnimating = useTokenStore(state =>
    tokenId ? tokenSelectors.isTokenAnimating(tokenId)(state) : false
  )

  // Store actions
  const updateTokenAction = useTokenStore(state => state.updateToken)
  const deleteTokenAction = useTokenStore(state => state.deleteToken)
  const moveTokenAction = useTokenStore(state => state.moveToken)
  const selectTokenAction = useTokenStore(state => state.selectToken)
  const toggleTokenSelectionAction = useTokenStore(state => state.toggleTokenSelection)
  const setHoveredTokenAction = useTokenStore(state => state.setHoveredToken)
  const duplicateSelectedAction = useTokenStore(state => state.duplicateSelected)
  const validateTokenAction = useTokenStore(state => state.validateToken)

  // Token operations
  const updateToken = useCallback((updates: TokenUpdate) => {
    if (tokenId) {
      updateTokenAction(tokenId, updates)
    }
  }, [tokenId, updateTokenAction])

  const deleteToken = useCallback(() => {
    if (tokenId) {
      deleteTokenAction(tokenId)
    }
  }, [tokenId, deleteTokenAction])

  const moveToken = useCallback((position: Point) => {
    if (tokenId) {
      moveTokenAction(tokenId, position)
    }
  }, [tokenId, moveTokenAction])

  const duplicateToken = useCallback((offset?: Point) => {
    if (tokenId && isSelected) {
      duplicateSelectedAction(offset)
    }
  }, [tokenId, isSelected, duplicateSelectedAction])

  // Selection operations
  const selectToken = useCallback((extend = false) => {
    if (tokenId) {
      selectTokenAction(tokenId, extend)
    }
  }, [tokenId, selectTokenAction])

  const toggleSelection = useCallback(() => {
    if (tokenId) {
      toggleTokenSelectionAction(tokenId)
    }
  }, [tokenId, toggleTokenSelectionAction])

  // State operations
  const setHovered = useCallback((hovered: boolean) => {
    setHoveredTokenAction(hovered && tokenId ? tokenId : null)
  }, [tokenId, setHoveredTokenAction])

  // Validation
  const validateToken = useCallback(() => {
    if (tokenId) {
      validateTokenAction(tokenId)
    }
  }, [tokenId, validateTokenAction])

  return {
    // Token data
    token,
    exists: !!token,

    // Token operations
    updateToken,
    deleteToken,
    moveToken,
    duplicateToken,

    // Selection
    isSelected,
    selectToken,
    toggleSelection,

    // State
    isHovered,
    setHovered,
    isDragging,
    isAnimating,

    // Validation
    validateToken,
    isValid: token ? true : false // Would use actual validation in real implementation
  }
}

// Hook for working with multiple tokens
export interface UseTokensResult {
  readonly tokens: Token[]
  readonly selectedTokens: Token[]
  readonly filteredTokens: Token[]
  readonly tokenStats: {
    total: number
    players: number
    npcs: number
    bySize: Record<string, number>
    byCategory: Record<string, number>
    animated: number
    selected: number
    visible: number
  }

  // Batch operations
  readonly selectAll: () => void
  readonly clearSelection: () => void
  readonly deleteSelected: () => void
  readonly duplicateSelected: (offset?: Point) => void
  readonly alignSelected: (alignment: 'top' | 'bottom' | 'center' | 'left' | 'right' | 'middle') => void

  // Search and filtering
  readonly setFilters: (filters: any) => void
  readonly setSortBy: (sortBy: 'name' | 'category' | 'size' | 'created') => void
  readonly setSortOrder: (order: 'asc' | 'desc') => void
}

export function useTokens(): UseTokensResult {
  // Store selectors
  const tokens = useTokenStore(tokenSelectors.getAllTokens())
  const selectedTokens = useTokenStore(tokenSelectors.getSelectedTokens())
  const filteredTokens = useTokenStore(tokenSelectors.getFilteredTokens())
  const tokenStats = useTokenStore(tokenSelectors.getTokenStats())

  // Store actions
  const selectAllAction = useTokenStore(state => state.selectAll)
  const clearSelectionAction = useTokenStore(state => state.clearSelection)
  const deleteTokensAction = useTokenStore(state => state.deleteTokens)
  const duplicateSelectedAction = useTokenStore(state => state.duplicateSelected)
  const alignSelectedAction = useTokenStore(state => state.alignSelected)
  const setFiltersAction = useTokenStore(state => state.setFilters)
  const setSortByAction = useTokenStore(state => state.setSortBy)
  const setSortOrderAction = useTokenStore(state => state.setSortOrder)

  // Batch operations
  const deleteSelected = useCallback(() => {
    const selectedIds = selectedTokens.map(token => token.id)
    if (selectedIds.length > 0) {
      deleteTokensAction(selectedIds)
    }
  }, [selectedTokens, deleteTokensAction])

  return {
    // Data
    tokens,
    selectedTokens,
    filteredTokens,
    tokenStats,

    // Batch operations
    selectAll: selectAllAction,
    clearSelection: clearSelectionAction,
    deleteSelected,
    duplicateSelected: duplicateSelectedAction,
    alignSelected: alignSelectedAction,

    // Search and filtering
    setFilters: setFiltersAction,
    setSortBy: setSortByAction,
    setSortOrder: setSortOrderAction
  }
}