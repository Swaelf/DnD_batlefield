/**
 * Token Store - Zustand store with Immer for token state management
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { devtools } from 'zustand/middleware'
import { current } from 'immer'
import type { Point } from '@/types/geometry'
import type {
  Token,
  TokenId,
  TemplateId,
  TokenTemplate,
  CreateTokenData,
  TokenUpdate,
  TokenFilters,
  AnimationHandle
} from '../types'
import { TokenService } from '../services/TokenService'
import { AnimationService } from '../services/AnimationService'
import { ValidationService } from '../services/ValidationService'

// Token store state
export interface TokenState {
  // Core data
  readonly tokens: Map<TokenId, Token>
  readonly selectedTokenIds: Set<TokenId>
  readonly hoveredTokenId: TokenId | null
  readonly draggedTokenId: TokenId | null

  // Templates
  readonly activeTemplate: TokenTemplate | null
  readonly customTemplates: readonly TokenTemplate[]
  readonly templateCategory: string | null

  // Animation tracking
  readonly animatingTokens: Set<TokenId>
  readonly activeAnimations: Map<AnimationHandle, TokenId>

  // UI state
  readonly isLibraryOpen: boolean
  readonly librarySearch: string
  readonly libraryCategory: string | null

  // Filters and sorting
  readonly filters: TokenFilters
  readonly sortBy: 'name' | 'size' | 'category' | 'created'
  readonly sortOrder: 'asc' | 'desc'

  // Batch operations
  readonly clipboard: readonly Token[]
  readonly isDragging: boolean
  readonly dragOffset: Point | null

  // Performance
  readonly visibleTokens: Set<TokenId> // For viewport culling
}

// Token store actions
export interface TokenActions {
  // CRUD operations
  addToken: (token: Token) => void
  createToken: (data: CreateTokenData) => Token
  updateToken: (id: TokenId, updates: TokenUpdate) => void
  deleteToken: (id: TokenId) => void
  deleteTokens: (ids: readonly TokenId[]) => void

  // Selection management
  selectToken: (id: TokenId, extend?: boolean) => void
  selectTokens: (ids: readonly TokenId[]) => void
  selectAll: () => void
  clearSelection: () => void
  toggleTokenSelection: (id: TokenId) => void

  // Hover and drag
  setHoveredToken: (id: TokenId | null) => void
  setDraggedToken: (id: TokenId | null) => void
  setDragOffset: (offset: Point | null) => void

  // Template management
  setActiveTemplate: (template: TokenTemplate | null) => void
  saveCustomTemplate: (template: TokenTemplate) => void
  deleteCustomTemplate: (id: TemplateId) => void
  setTemplateCategory: (category: string | null) => void

  // Animation tracking
  startAnimation: (tokenId: TokenId, handle: AnimationHandle) => void
  endAnimation: (tokenId: TokenId, handle: AnimationHandle) => void
  cancelTokenAnimations: (tokenId: TokenId) => void

  // UI state
  toggleLibrary: () => void
  setLibrarySearch: (search: string) => void
  setLibraryCategory: (category: string | null) => void

  // Filters and sorting
  setFilters: (filters: Partial<TokenFilters>) => void
  setSortBy: (sortBy: TokenState['sortBy']) => void
  setSortOrder: (order: TokenState['sortOrder']) => void

  // Batch operations
  duplicateSelected: (offset?: Point) => void
  alignSelected: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void
  copySelected: () => void
  pasteFromClipboard: (position: Point) => void

  // Movement and positioning
  moveToken: (id: TokenId, position: Point) => void
  moveSelectedTokens: (offset: Point) => void
  snapTokenToGrid: (id: TokenId, gridSize: number) => void

  // Visibility and performance
  updateVisibleTokens: (tokenIds: readonly TokenId[]) => void
  setDragging: (isDragging: boolean) => void

  // Bulk operations
  importTokens: (tokens: readonly Token[]) => void
  exportTokens: (tokenIds?: readonly TokenId[]) => readonly Token[]

  // Validation
  validateToken: (id: TokenId) => void
  validateAllTokens: () => void
}

// Combined store type
export type TokenStore = TokenState & TokenActions

// Services instances
const tokenService = new TokenService()
// const templateService = TemplateService.getInstance() // TODO: Use when needed
const animationService = AnimationService.getInstance()
const validationService = ValidationService.getInstance()

// Create the store
export const useTokenStore = create<TokenStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      tokens: new Map(),
      selectedTokenIds: new Set(),
      hoveredTokenId: null,
      draggedTokenId: null,

      activeTemplate: null,
      customTemplates: [],
      templateCategory: null,

      animatingTokens: new Set(),
      activeAnimations: new Map(),

      isLibraryOpen: false,
      librarySearch: '',
      libraryCategory: null,

      filters: {},
      sortBy: 'name',
      sortOrder: 'asc',

      clipboard: [],
      isDragging: false,
      dragOffset: null,

      visibleTokens: new Set(),

      // CRUD operations
      addToken: (token) =>
        set((state) => {
          state.tokens.set(token.id, {
            ...token,
            conditions: [...(token.conditions || [])]
          })
          state.visibleTokens.add(token.id)
        }),

      createToken: (data) => {
        const token = tokenService.createToken(data)
        get().addToken(token)
        return token
      },

      updateToken: (id, updates) =>
        set((state) => {
          const existing = state.tokens.get(id)
          if (existing) {
            const updated = tokenService.updateToken(existing, updates)
            state.tokens.set(id, {
              ...updated,
              conditions: [...(updated.conditions || [])]
            })
          }
        }),

      deleteToken: (id) =>
        set((state) => {
          state.tokens.delete(id)
          state.selectedTokenIds.delete(id)
          state.animatingTokens.delete(id)
          state.visibleTokens.delete(id)

          // Cancel any animations for this token
          animationService.cancelTokenAnimations(id)

          // Clear references
          if (state.hoveredTokenId === id) {
            state.hoveredTokenId = null
          }
          if (state.draggedTokenId === id) {
            state.draggedTokenId = null
          }

          // Remove from active animations
          for (const [handle, tokenId] of state.activeAnimations) {
            if (tokenId === id) {
              state.activeAnimations.delete(handle)
            }
          }
        }),

      deleteTokens: (ids) =>
        set((state) => {
          for (const id of ids) {
            state.tokens.delete(id)
            state.selectedTokenIds.delete(id)
            state.animatingTokens.delete(id)
            state.visibleTokens.delete(id)
            animationService.cancelTokenAnimations(id)
          }

          // Clear UI state if needed
          if (state.hoveredTokenId && ids.includes(state.hoveredTokenId)) {
            state.hoveredTokenId = null
          }
          if (state.draggedTokenId && ids.includes(state.draggedTokenId)) {
            state.draggedTokenId = null
          }

          // Clean up animations
          for (const [handle, tokenId] of state.activeAnimations) {
            if (ids.includes(tokenId)) {
              state.activeAnimations.delete(handle)
            }
          }
        }),

      // Selection management
      selectToken: (id, extend = false) =>
        set((state) => {
          if (!extend) {
            state.selectedTokenIds.clear()
          }

          if (state.tokens.has(id)) {
            state.selectedTokenIds.add(id)
          }
        }),

      selectTokens: (ids) =>
        set((state) => {
          state.selectedTokenIds.clear()
          for (const id of ids) {
            if (state.tokens.has(id)) {
              state.selectedTokenIds.add(id)
            }
          }
        }),

      selectAll: () =>
        set((state) => {
          state.selectedTokenIds = new Set(state.tokens.keys())
        }),

      clearSelection: () =>
        set((state) => {
          state.selectedTokenIds.clear()
        }),

      toggleTokenSelection: (id) =>
        set((state) => {
          if (state.selectedTokenIds.has(id)) {
            state.selectedTokenIds.delete(id)
          } else {
            state.selectedTokenIds.add(id)
          }
        }),

      // Hover and drag
      setHoveredToken: (id) =>
        set((state) => {
          state.hoveredTokenId = id
        }),

      setDraggedToken: (id) =>
        set((state) => {
          state.draggedTokenId = id
        }),

      setDragOffset: (offset) =>
        set((state) => {
          state.dragOffset = offset
        }),

      // Template management
      setActiveTemplate: (template) =>
        set((state) => {
          Object.assign(state, { activeTemplate: template })
        }),

      saveCustomTemplate: (template) =>
        set((state) => {
          const currentTemplates = current(state.customTemplates)
          const existingIndex = currentTemplates.findIndex(t => t.id === template.id)
          if (existingIndex >= 0) {
            Object.assign(state.customTemplates[existingIndex], template)
          } else {
            state.customTemplates.push(template as any)
          }
        }),

      deleteCustomTemplate: (id) =>
        set((state) => {
          state.customTemplates = state.customTemplates.filter(t => t.id !== id)
          if (state.activeTemplate?.id === id) {
            state.activeTemplate = null
          }
        }),

      setTemplateCategory: (category) =>
        set((state) => {
          state.templateCategory = category
        }),

      // Animation tracking
      startAnimation: (tokenId, handle) =>
        set((state) => {
          state.animatingTokens.add(tokenId)
          state.activeAnimations.set(handle, tokenId)
        }),

      endAnimation: (tokenId, handle) =>
        set((state) => {
          state.activeAnimations.delete(handle)

          // Check if token has other animations
          const hasOtherAnimations = Array.from(state.activeAnimations.values())
            .some(id => id === tokenId)

          if (!hasOtherAnimations) {
            state.animatingTokens.delete(tokenId)
          }
        }),

      cancelTokenAnimations: (tokenId) =>
        set((state) => {
          animationService.cancelTokenAnimations(tokenId)
          state.animatingTokens.delete(tokenId)

          // Remove all animations for this token
          for (const [handle, id] of state.activeAnimations) {
            if (id === tokenId) {
              state.activeAnimations.delete(handle)
            }
          }
        }),

      // UI state
      toggleLibrary: () =>
        set((state) => {
          state.isLibraryOpen = !state.isLibraryOpen
        }),

      setLibrarySearch: (search) =>
        set((state) => {
          state.librarySearch = search
        }),

      setLibraryCategory: (category) =>
        set((state) => {
          state.libraryCategory = category
        }),

      // Filters and sorting
      setFilters: (filters) =>
        set((state) => {
          Object.assign(state.filters, filters)
        }),

      setSortBy: (sortBy) =>
        set((state) => {
          state.sortBy = sortBy
        }),

      setSortOrder: (order) =>
        set((state) => {
          state.sortOrder = order
        }),

      // Batch operations
      duplicateSelected: (offset = { x: 50, y: 50 }) => {
        const state = get()
        const selectedTokens = Array.from(state.selectedTokenIds)
          .map(id => state.tokens.get(id))
          .filter(token => token !== undefined)

        if (selectedTokens.length > 0) {
          const duplicated = tokenService.duplicateTokens(selectedTokens, offset)
          set((state) => {
            state.selectedTokenIds.clear()
            for (const token of duplicated) {
              state.tokens.set(token.id, {
                ...token,
                conditions: [...(token.conditions || [])]
              })
              state.selectedTokenIds.add(token.id)
              state.visibleTokens.add(token.id)
            }
          })
        }
      },

      alignSelected: (alignment) => {
        const state = get()
        const selectedTokens = Array.from(state.selectedTokenIds)
          .map(id => state.tokens.get(id))
          .filter(token => token !== undefined)

        if (selectedTokens.length > 1) {
          const aligned = tokenService.alignTokens(selectedTokens, alignment)
          set((state) => {
            for (const token of aligned) {
              state.tokens.set(token.id, {
                ...token,
                conditions: [...(token.conditions || [])]
              })
            }
          })
        }
      },

      copySelected: () => {
        const state = get()
        const selectedTokens: Token[] = Array.from(state.selectedTokenIds)
          .map(id => state.tokens.get(id))
          .filter((token): token is Token => token !== undefined)

        set((state) => {
          Object.assign(state, { clipboard: selectedTokens })
        })
      },

      pasteFromClipboard: (position) => {
        const state = get()
        if (state.clipboard.length > 0) {
          const duplicated = tokenService.duplicateTokens([...state.clipboard], {
            x: position.x - state.clipboard[0].position.x,
            y: position.y - state.clipboard[0].position.y
          })

          set((state) => {
            state.selectedTokenIds.clear()
            for (const token of duplicated) {
              state.tokens.set(token.id, {
                ...token,
                conditions: [...(token.conditions || [])]
              })
              state.selectedTokenIds.add(token.id)
              state.visibleTokens.add(token.id)
            }
          })
        }
      },

      // Movement and positioning
      moveToken: (id, position) =>
        set((state) => {
          const token = state.tokens.get(id)
          if (token) {
            const updated = tokenService.updateToken(token, { position, lastModified: new Date() })
            state.tokens.set(id, {
              ...updated,
              conditions: [...(updated.conditions || [])]
            })
          }
        }),

      moveSelectedTokens: (offset) =>
        set((state) => {
          for (const id of state.selectedTokenIds) {
            const token = state.tokens.get(id)
            if (token) {
              const newPosition = {
                x: token.position.x + offset.x,
                y: token.position.y + offset.y
              }
              const updated = tokenService.updateToken(token, { position: newPosition, lastModified: new Date() })
              state.tokens.set(id, {
                ...updated,
                conditions: [...(updated.conditions || [])]
              })
            }
          }
        }),

      snapTokenToGrid: (id, gridSize) =>
        set((state) => {
          const token = state.tokens.get(id)
          if (token) {
            const snappedPosition = tokenService.snapToGrid(token.position, gridSize)
            const updated = tokenService.updateToken(token, { position: snappedPosition, lastModified: new Date() })
            state.tokens.set(id, {
              ...updated,
              conditions: [...(updated.conditions || [])]
            })
          }
        }),

      // Visibility and performance
      updateVisibleTokens: (tokenIds) =>
        set((state) => {
          state.visibleTokens = new Set(tokenIds)
        }),

      setDragging: (isDragging) =>
        set((state) => {
          state.isDragging = isDragging
        }),

      // Bulk operations
      importTokens: (tokens) =>
        set((state) => {
          for (const token of tokens) {
            // Validate and add token
            const validation = validationService.validateToken(token)
            if (validation.isValid) {
              state.tokens.set(token.id, {
                ...token,
                conditions: [...(token.conditions || [])]
              })
              state.visibleTokens.add(token.id)
            } else {
              console.warn(`Skipping invalid token: ${token.name}`, validation.errors)
            }
          }
        }),

      exportTokens: (tokenIds) => {
        const state = get()
        const idsToExport = tokenIds ?? Array.from(state.tokens.keys())
        return idsToExport
          .map(id => state.tokens.get(id))
          .filter(token => token !== undefined)
      },

      // Validation
      validateToken: (id) => {
        const token = get().tokens.get(id)
        if (token) {
          const validation = validationService.validateToken(token)
          if (!validation.isValid) {
            console.warn(`Token validation failed: ${token.name}`, validation.errors)
          }
          return validation
        }
        return null
      },

      validateAllTokens: () => {
        const tokens = Array.from(get().tokens.values())
        const summary = validationService.getValidationSummary(tokens)
        console.log('Token validation summary:', summary)
        return summary
      }
    })),
    {
      name: 'token-store',
      partialize: (state: TokenStore) => ({
        tokens: Array.from(state.tokens.entries()),
        customTemplates: state.customTemplates,
        filters: state.filters,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder
      }),
      merge: (persistedState: Partial<TokenStore>, currentState: TokenStore) => ({
        ...currentState,
        ...persistedState,
        // Restore Map from serialized array
        tokens: new Map(persistedState.tokens || []),
        // Reset runtime state
        selectedTokenIds: new Set(),
        hoveredTokenId: null,
        draggedTokenId: null,
        animatingTokens: new Set(),
        activeAnimations: new Map(),
        isLibraryOpen: false,
        isDragging: false,
        dragOffset: null,
        visibleTokens: new Set()
      })
    }
  )
)