/**
 * Token Store Selectors - Memoized selectors for performance optimization
 */

import type { TokenState } from './tokenStore'
import type { Token, TokenId, TokenFilters, TokenSelection } from '../types'
import { TokenService } from '../services/TokenService'

// Initialize service
const tokenService = new TokenService()

/**
 * Memoized selectors for token store
 */
export const tokenSelectors = {
  // Basic token queries
  getToken: (id: TokenId) => (state: TokenState): Token | undefined =>
    state.tokens.get(id),

  getAllTokens: () => (state: TokenState): Token[] =>
    Array.from(state.tokens.values()),

  getTokenCount: () => (state: TokenState): number =>
    state.tokens.size,

  // Selection queries
  getSelectedTokens: () => (state: TokenState): Token[] =>
    Array.from(state.selectedTokenIds)
      .map(id => state.tokens.get(id))
      .filter((token): token is Token => token !== undefined),

  getSelectedTokenIds: () => (state: TokenState): TokenId[] =>
    Array.from(state.selectedTokenIds),

  getSelectionCount: () => (state: TokenState): number =>
    state.selectedTokenIds.size,

  hasSelection: () => (state: TokenState): boolean =>
    state.selectedTokenIds.size > 0,

  isTokenSelected: (id: TokenId) => (state: TokenState): boolean =>
    state.selectedTokenIds.has(id),

  // Token state queries
  getHoveredToken: () => (state: TokenState): Token | null => {
    const id = state.hoveredTokenId
    return id ? state.tokens.get(id) || null : null
  },

  getDraggedToken: () => (state: TokenState): Token | null => {
    const id = state.draggedTokenId
    return id ? state.tokens.get(id) || null : null
  },

  isTokenAnimating: (id: TokenId) => (state: TokenState): boolean =>
    state.animatingTokens.has(id),

  getAnimatingTokens: () => (state: TokenState): Token[] =>
    Array.from(state.animatingTokens)
      .map(id => state.tokens.get(id))
      .filter((token): token is Token => token !== undefined),

  // Filtered queries
  getTokensByCategory: (category: string) => (state: TokenState): Token[] =>
    Array.from(state.tokens.values()).filter(token => token.category === category),

  getTokensBySize: (size: string) => (state: TokenState): Token[] =>
    Array.from(state.tokens.values()).filter(token => token.size === size),

  getVisibleTokens: () => (state: TokenState): Token[] =>
    Array.from(state.visibleTokens)
      .map(id => state.tokens.get(id))
      .filter((token): token is Token => token !== undefined),

  getPlayerTokens: () => (state: TokenState): Token[] =>
    Array.from(state.tokens.values()).filter(token => token.isPlayer),

  getNPCTokens: () => (state: TokenState): Token[] =>
    Array.from(state.tokens.values()).filter(token => !token.isPlayer),

  // Filtered and sorted tokens
  getFilteredTokens: () => (state: TokenState): Token[] => {
    let tokens = Array.from(state.tokens.values())

    // Apply filters
    tokens = tokenService.filterTokens(tokens, state.filters)

    // Apply sorting
    tokens.sort((a, b) => {
      let comparison = 0

      switch (state.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'size': {
          const sizeOrder = ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan']
          comparison = sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size)
          break
        }
        case 'category':
          comparison = a.category.localeCompare(b.category)
          break
        case 'created':
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
          break
      }

      return state.sortOrder === 'desc' ? -comparison : comparison
    })

    return tokens
  },

  // Selection analysis
  getTokenSelection: () => (state: TokenState): TokenSelection => {
    const tokens = Array.from(state.tokens.values())
    const selectedIds = Array.from(state.selectedTokenIds)
    return tokenService.getTokenSelection(tokens, selectedIds)
  },

  // Statistics
  getTokenStats: () => (state: TokenState) => {
    const tokens = Array.from(state.tokens.values())

    const stats = {
      total: tokens.length,
      players: tokens.filter(t => t.isPlayer).length,
      npcs: tokens.filter(t => !t.isPlayer).length,
      bySize: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      animated: state.animatingTokens.size,
      selected: state.selectedTokenIds.size,
      visible: state.visibleTokens.size
    }

    // Count by size
    for (const token of tokens) {
      stats.bySize[token.size] = (stats.bySize[token.size] || 0) + 1
    }

    // Count by category
    for (const token of tokens) {
      stats.byCategory[token.category] = (stats.byCategory[token.category] || 0) + 1
    }

    return stats
  },

  // Template queries
  getActiveTemplate: () => (state: TokenState) => state.activeTemplate,

  getCustomTemplates: () => (state: TokenState) => state.customTemplates,

  getAllTemplates: () => (state: TokenState) => {
    // This would combine built-in templates with custom ones
    // For now, just return custom templates
    return state.customTemplates
  },

  // UI state
  isLibraryOpen: () => (state: TokenState): boolean => state.isLibraryOpen,

  getLibrarySearch: () => (state: TokenState): string => state.librarySearch,

  getLibraryCategory: () => (state: TokenState): string | null => state.libraryCategory,

  isDragging: () => (state: TokenState): boolean => state.isDragging,

  getDragOffset: () => (state: TokenState) => state.dragOffset,

  // Filters and sorting
  getFilters: () => (state: TokenState): TokenFilters => state.filters,

  getSortBy: () => (state: TokenState) => state.sortBy,

  getSortOrder: () => (state: TokenState) => state.sortOrder,

  // Clipboard
  getClipboard: () => (state: TokenState) => state.clipboard,

  hasClipboard: () => (state: TokenState): boolean => state.clipboard.length > 0,

  // Complex queries
  getTokensInBounds: (bounds: { x: number; y: number; width: number; height: number }) =>
    (state: TokenState): Token[] => {
      const tokens = Array.from(state.tokens.values())
      return tokens.filter(token =>
        token.position.x >= bounds.x &&
        token.position.x <= bounds.x + bounds.width &&
        token.position.y >= bounds.y &&
        token.position.y <= bounds.y + bounds.height
      )
    },

  getTokensWithCondition: (condition: string) => (state: TokenState): Token[] =>
    Array.from(state.tokens.values()).filter(token =>
      token.conditions.includes(condition)
    ),

  getTokensWithInitiative: () => (state: TokenState): Token[] =>
    Array.from(state.tokens.values())
      .filter(token => token.initiative !== undefined)
      .sort((a, b) => (b.initiative || 0) - (a.initiative || 0)),

  // Performance helpers
  getTokenIdsByPosition: () => (state: TokenState): Map<string, TokenId[]> => {
    const positionMap = new Map<string, TokenId[]>()

    for (const token of state.tokens.values()) {
      const key = `${Math.round(token.position.x / 50)},${Math.round(token.position.y / 50)}`
      const existing = positionMap.get(key) || []
      existing.push(token.id)
      positionMap.set(key, existing)
    }

    return positionMap
  },

  // Validation helpers
  getInvalidTokens: () => (): Token[] => {
    // This would need validation service integration
    // For now, return empty array
    return []
  },

  getDuplicateNameTokens: () => (state: TokenState): Token[] => {
    const nameMap = new Map<string, Token[]>()
    const tokens = Array.from(state.tokens.values())

    for (const token of tokens) {
      const name = token.name.toLowerCase()
      const existing = nameMap.get(name) || []
      existing.push(token)
      nameMap.set(name, existing)
    }

    return Array.from(nameMap.values())
      .filter(group => group.length > 1)
      .flat()
  }
}

/**
 * Helper function to create a selector hook
 */
export function createTokenSelector<T>(selector: (state: TokenState) => T) {
  return selector
}

/**
 * Common selector combinations for performance
 */
export const commonSelectors = {
  // Get selected token data with full details
  getSelectedTokenDetails: () => (state: TokenState) => {
    const selectedTokens = tokenSelectors.getSelectedTokens()(state)
    const selection = tokenSelectors.getTokenSelection()(state)

    return {
      tokens: selectedTokens,
      selection,
      count: selectedTokens.length,
      hasMultiple: selectedTokens.length > 1
    }
  },

  // Get library state with search results
  getLibraryState: () => (state: TokenState) => {
    return {
      isOpen: state.isLibraryOpen,
      search: state.librarySearch,
      category: state.libraryCategory,
      activeTemplate: state.activeTemplate,
      customTemplates: state.customTemplates
    }
  },

  // Get animation state summary
  getAnimationState: () => (state: TokenState) => {
    return {
      animatingTokens: Array.from(state.animatingTokens),
      animationCount: state.animatingTokens.size,
      activeAnimations: state.activeAnimations.size,
      isAnyAnimating: state.animatingTokens.size > 0
    }
  },

  // Get UI interaction state
  getInteractionState: () => (state: TokenState) => {
    return {
      hoveredTokenId: state.hoveredTokenId,
      draggedTokenId: state.draggedTokenId,
      isDragging: state.isDragging,
      dragOffset: state.dragOffset,
      hasSelection: state.selectedTokenIds.size > 0,
      selectionCount: state.selectedTokenIds.size
    }
  }
}