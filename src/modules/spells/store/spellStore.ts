/**
 * Spell Store
 *
 * Zustand store with Immer integration for spell state management
 * following the established patterns from Timeline and Actions modules.
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { devtools } from 'zustand/middleware'
import type {
  UnifiedSpell,
  UnifiedSpellTemplate,
  SpellId,
  SpellTemplateId,
  SpellCategoryId,
  SpellSchoolId,
  SpellSearchCriteria,
  SpellCategory,
  SpellSchool,
  SpellCustomization,
  SpellAnimationConfig,
  SpellRenderingOptions,
  SpellPreviewState
} from '../types'
import { SpellTemplateService } from '../services'

/**
 * Spell selection and search state
 */
type SpellSelectionState = {
  readonly selectedSpellId: SpellId | null
  readonly searchQuery: string
  readonly activeSchool: SpellSchoolId | 'all'
  readonly activeCategory: SpellCategoryId | 'all'
  readonly levelFilter: {
    readonly min: number
    readonly max: number
  }
  readonly sortBy: 'name' | 'level' | 'school' | 'category' | 'popularity'
  readonly sortDirection: 'asc' | 'desc'
  readonly viewMode: 'grid' | 'list'
  readonly showCustomSpells: boolean
}

/**
 * Complete spell store state
 */
type SpellStore = {
  // Services
  readonly templateService: SpellTemplateService

  // Selection and search state
  readonly selection: SpellSelectionState

  // Search results and caching
  readonly searchResults: readonly UnifiedSpell[]
  readonly isSearching: boolean
  readonly lastSearchCriteria: SpellSearchCriteria | null

  // Categories and metadata
  readonly schools: readonly SpellSchool[]
  readonly categories: readonly SpellCategory[]
  readonly allTags: readonly string[]

  // Animation and rendering configuration
  readonly animationConfig: SpellAnimationConfig
  readonly renderingOptions: SpellRenderingOptions

  // Preview state
  readonly previewState: SpellPreviewState

  // Customization workflow
  readonly isCustomizing: boolean
  readonly customizationData: SpellCustomization | null

  // Actions - Search and Selection
  search: (criteria?: SpellSearchCriteria) => void
  setSearchQuery: (query: string) => void
  setActiveSchool: (school: SpellSchoolId | 'all') => void
  setActiveCategory: (category: SpellCategoryId | 'all') => void
  setLevelFilter: (min: number, max: number) => void
  setSortBy: (sortBy: SpellSelectionState['sortBy']) => void
  setSortDirection: (direction: SpellSelectionState['sortDirection']) => void
  setViewMode: (mode: SpellSelectionState['viewMode']) => void
  toggleCustomSpells: () => void

  // Actions - Spell Management
  selectSpell: (spellId: SpellId) => void
  getSelectedSpell: () => UnifiedSpell | null
  getSpellById: (spellId: SpellId) => UnifiedSpell | null
  getSpellsBySchool: (school: SpellSchoolId) => UnifiedSpell[]
  getSpellsByCategory: (category: SpellCategoryId) => UnifiedSpell[]
  getPopularSpells: (limit?: number) => UnifiedSpell[]

  // Actions - Template Management
  getTemplateById: (templateId: SpellTemplateId) => UnifiedSpellTemplate | null

  // Actions - Customization
  startCustomization: (spellId: SpellId) => void
  updateCustomization: (updates: Partial<SpellCustomization>) => void
  finishCustomization: () => UnifiedSpell | null
  cancelCustomization: () => void

  // Actions - Custom Spells
  saveCustomSpell: (spell: UnifiedSpell) => void
  deleteCustomSpell: (spellId: SpellId) => boolean

  // Actions - Preview
  startPreview: (template: UnifiedSpellTemplate) => void
  updatePreviewPosition: (x: number, y: number) => void
  updatePreviewRotation: (rotation: number) => void
  stopPreview: () => void
  validatePreview: () => boolean

  // Actions - Configuration
  updateAnimationConfig: (config: Partial<SpellAnimationConfig>) => void
  updateRenderingOptions: (options: Partial<SpellRenderingOptions>) => void

  // Actions - Utility
  refreshLibrary: () => void
}

/**
 * Default selection state
 */
const defaultSelectionState: SpellSelectionState = {
  selectedSpellId: null,
  searchQuery: '',
  activeSchool: 'all',
  activeCategory: 'all',
  levelFilter: { min: 0, max: 9 },
  sortBy: 'name',
  sortDirection: 'asc',
  viewMode: 'grid',
  showCustomSpells: true
}

/**
 * Default animation configuration
 */
const defaultAnimationConfig: SpellAnimationConfig = {
  enableParticles: true,
  enableScreenShake: false,
  enableSoundEffects: true,
  animationQuality: 'medium',
  particleDensity: 1.0,
  shakeDuration: 200,
  fadeInDuration: 500,
  fadeOutDuration: 1000
}

/**
 * Default rendering options
 */
const defaultRenderingOptions: SpellRenderingOptions = {
  showGrid: true,
  showRange: true,
  showArea: true,
  showDirection: true,
  highlightTargets: true,
  previewMode: false,
  quality: 'medium'
}

/**
 * Default preview state
 */
const defaultPreviewState: SpellPreviewState = {
  isActive: false,
  template: null,
  position: null,
  rotation: 0,
  isValid: false,
  affectedArea: [],
  potentialTargets: []
}

/**
 * Create spell store with Immer and devtools middleware
 */
export const useSpellStore = create<SpellStore>()(
  devtools(
    immer((set, get) => ({
      // Initialize services
      templateService: new SpellTemplateService(),

      // Initialize state
      selection: defaultSelectionState,
      searchResults: [],
      isSearching: false,
      lastSearchCriteria: null,
      schools: [],
      categories: [],
      allTags: [],
      animationConfig: defaultAnimationConfig,
      renderingOptions: defaultRenderingOptions,
      previewState: defaultPreviewState,
      isCustomizing: false,
      customizationData: null,

      // Search and Selection Actions
      search: (criteria = {}) => {
        set((state) => {
          state.isSearching = true
        })

        const { templateService, selection } = get()
        const searchCriteria: SpellSearchCriteria = {
          query: selection.searchQuery || undefined,
          school: selection.activeSchool !== 'all' ? selection.activeSchool : undefined,
          category: selection.activeCategory !== 'all' ? selection.activeCategory : undefined,
          level: {
            min: selection.levelFilter.min,
            max: selection.levelFilter.max
          },
          includeCustom: selection.showCustomSpells,
          sortBy: selection.sortBy,
          sortDirection: selection.sortDirection,
          ...criteria
        }

        const results = templateService.searchSpells(searchCriteria)

        set((state) => {
          Object.assign(state, {
            searchResults: results,
            isSearching: false,
            lastSearchCriteria: searchCriteria
          })
        })
      },

      setSearchQuery: (query) => {
        set((state) => {
          state.selection.searchQuery = query
        })
        // Auto-trigger search with debounced effect
        get().search()
      },

      setActiveSchool: (school) => {
        set((state) => {
          state.selection.activeSchool = school
        })
        get().search()
      },

      setActiveCategory: (category) => {
        set((state) => {
          state.selection.activeCategory = category
        })
        get().search()
      },

      setLevelFilter: (min, max) => {
        set((state) => {
          state.selection.levelFilter = { min, max }
        })
        get().search()
      },

      setSortBy: (sortBy) => {
        set((state) => {
          state.selection.sortBy = sortBy
        })
        get().search()
      },

      setSortDirection: (direction) => {
        set((state) => {
          state.selection.sortDirection = direction
        })
        get().search()
      },

      setViewMode: (mode) => {
        set((state) => {
          state.selection.viewMode = mode
        })
      },

      toggleCustomSpells: () => {
        set((state) => {
          state.selection.showCustomSpells = !state.selection.showCustomSpells
        })
        get().search()
      },

      // Spell Management Actions
      selectSpell: (spellId) => {
        set((state) => {
          state.selection.selectedSpellId = spellId
        })
      },

      getSelectedSpell: () => {
        const { selection, searchResults } = get()
        if (!selection.selectedSpellId) return null
        return searchResults.find(spell => spell.id === selection.selectedSpellId) || null
      },

      getSpellById: (spellId) => {
        const { searchResults } = get()
        return searchResults.find(spell => spell.id === spellId) || null
      },

      getSpellsBySchool: (school) => {
        const { templateService } = get()
        return templateService.getSpellsBySchool(school)
      },

      getSpellsByCategory: (category) => {
        const { templateService } = get()
        return templateService.getSpellsByCategory(category)
      },

      getPopularSpells: (limit = 5) => {
        const { templateService } = get()
        return templateService.getPopularSpells(limit)
      },

      // Template Management Actions
      getTemplateById: (templateId) => {
        const { templateService } = get()
        return templateService.getTemplateById(templateId)
      },

      // Customization Actions
      startCustomization: (spellId) => {
        const spell = get().getSpellById(spellId)
        if (!spell) return

        set((state) => {
          state.isCustomizing = true
          state.customizationData = {
            spellId,
            name: spell.name,
            description: spell.description || '',
            color: spell.color,
            opacity: spell.opacity,
            size: spell.size,
            duration: spell.duration,
            animation: spell.animation,
            tags: [...spell.tags]
          }
        })
      },

      updateCustomization: (updates) => {
        set((state) => {
          if (state.customizationData) {
            Object.assign(state.customizationData, updates)
          }
        })
      },

      finishCustomization: () => {
        const { customizationData, templateService } = get()
        if (!customizationData) return null

        const template = get().getSpellById(customizationData.spellId)
        if (!template) return null

        const customSpell = templateService.createCustomSpellFromTemplate(
          template.templateId,
          customizationData
        )

        set((state) => {
          state.isCustomizing = false
          state.customizationData = null
        })

        return customSpell
      },

      cancelCustomization: () => {
        set((state) => {
          state.isCustomizing = false
          state.customizationData = null
        })
      },

      // Custom Spells Actions
      saveCustomSpell: (_spell) => {
        // Custom spell persistence would be implemented here
        // For now, we'll just refresh the search to show changes
        get().search()
      },

      deleteCustomSpell: (_spellId) => {
        // Custom spell deletion would be implemented here
        get().search()
        return true
      },

      // Preview Actions
      startPreview: (template) => {
        set((state) => {
          state.previewState.isActive = true
          Object.assign(state.previewState, { template })
          state.previewState.position = null
          state.previewState.rotation = 0
          state.previewState.isValid = false
          state.previewState.affectedArea = []
          state.previewState.potentialTargets = []
        })
      },

      updatePreviewPosition: (x, y) => {
        set((state) => {
          state.previewState.position = { x, y }
          state.previewState.isValid = get().validatePreview()
        })
      },

      updatePreviewRotation: (rotation) => {
        set((state) => {
          state.previewState.rotation = rotation
          state.previewState.isValid = get().validatePreview()
        })
      },

      stopPreview: () => {
        set((state) => {
          Object.assign(state, { previewState: defaultPreviewState })
        })
      },

      validatePreview: () => {
        const { previewState } = get()
        // Basic validation - position must be set
        return previewState.position !== null
      },

      // Configuration Actions
      updateAnimationConfig: (config) => {
        set((state) => {
          Object.assign(state.animationConfig, config)
        })
      },

      updateRenderingOptions: (options) => {
        set((state) => {
          Object.assign(state.renderingOptions, options)
        })
      },

      // Utility Actions
      refreshLibrary: () => {
        const { templateService } = get()

        set((state) => {
          state.schools = templateService.getSpellSchools()
          state.categories = templateService.getSpellCategories()
          state.allTags = templateService.getAllTags()
        })

        // Refresh search results
        get().search()
      }
    })),
    {
      name: 'spell-store',
      version: 1
    }
  )
)

// Initialize store with library data
useSpellStore.getState().refreshLibrary()