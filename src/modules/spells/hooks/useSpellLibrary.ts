/**
 * Spell Library Hook
 *
 * Main facade hook for interacting with the spell library system
 * following the established patterns from Timeline and Actions modules.
 */

import { useMemo } from 'react'
import { useSpellStore } from '../store'
import type {
  UnifiedSpell,
  UnifiedSpellTemplate,
  SpellId,
  SpellSearchCriteria,
  SpellCustomization
} from '../types'

/**
 * Main hook for spell library interactions
 * Provides a comprehensive API for spell management and search
 */
export function useSpellLibrary() {
  // Get store state and actions
  const {
    selection,
    searchResults,
    isSearching,
    schools,
    categories,
    allTags,
    animationConfig,
    renderingOptions,
    previewState,
    isCustomizing,
    customizationData,

    // Actions
    search,
    setSearchQuery,
    setActiveSchool,
    setActiveCategory,
    setLevelFilter,
    setSortBy,
    setSortDirection,
    setViewMode,
    toggleCustomSpells,
    selectSpell,
    getSelectedSpell,
    getSpellById,
    getSpellsBySchool,
    getSpellsByCategory,
    getPopularSpells,
    getTemplateById,
    startCustomization,
    updateCustomization,
    finishCustomization,
    cancelCustomization,
    saveCustomSpell,
    deleteCustomSpell,
    startPreview,
    updatePreviewPosition,
    updatePreviewRotation,
    stopPreview,
    validatePreview,
    updateAnimationConfig,
    updateRenderingOptions,
    refreshLibrary
  } = useSpellStore()

  // Memoized library metadata
  const libraryStats = useMemo(() => {
    const totalSpells = searchResults.length
    const customSpells = searchResults.filter(spell => spell.isCustom).length
    const builtInSpells = totalSpells - customSpells

    return {
      totalSpells,
      customSpells,
      builtInSpells,
      totalSchools: schools.length,
      totalCategories: categories.length,
      totalTags: allTags.length
    }
  }, [searchResults, schools, categories, allTags])

  // Quick search function with immediate query update
  const quickSearch = useMemo(
    () => (query: string) => {
      setSearchQuery(query)
    },
    [setSearchQuery]
  )

  // Advanced search with full criteria
  const advancedSearch = useMemo(
    () => (criteria: SpellSearchCriteria) => {
      search(criteria)
    },
    [search]
  )

  // Get spells by multiple criteria
  const getSpellsBy = useMemo(
    () => ({
      school: getSpellsBySchool,
      category: getSpellsByCategory,
      level: (level: number) => {
        const criteria: SpellSearchCriteria = {
          level: { min: level, max: level }
        }
        return useSpellStore.getState().templateService.searchSpells(criteria)
      },
      type: (type: UnifiedSpell['type']) => {
        const criteria: SpellSearchCriteria = { type }
        return useSpellStore.getState().templateService.searchSpells(criteria)
      }
    }),
    [getSpellsBySchool, getSpellsByCategory]
  )

  // Customization workflow helpers
  const customization = useMemo(
    () => ({
      isActive: isCustomizing,
      data: customizationData,
      start: startCustomization,
      update: updateCustomization,
      finish: finishCustomization,
      cancel: cancelCustomization,
      isValid: customizationData !== null && customizationData.name !== undefined
    }),
    [
      isCustomizing,
      customizationData,
      startCustomization,
      updateCustomization,
      finishCustomization,
      cancelCustomization
    ]
  )

  // Preview workflow helpers
  const preview = useMemo(
    () => ({
      isActive: previewState.isActive,
      template: previewState.template,
      position: previewState.position,
      rotation: previewState.rotation,
      isValid: previewState.isValid,
      affectedArea: previewState.affectedArea,
      potentialTargets: previewState.potentialTargets,
      start: startPreview,
      updatePosition: updatePreviewPosition,
      updateRotation: updatePreviewRotation,
      stop: stopPreview,
      validate: validatePreview
    }),
    [
      previewState,
      startPreview,
      updatePreviewPosition,
      updatePreviewRotation,
      stopPreview,
      validatePreview
    ]
  )

  // Configuration helpers
  const configuration = useMemo(
    () => ({
      animation: animationConfig,
      rendering: renderingOptions,
      updateAnimation: updateAnimationConfig,
      updateRendering: updateRenderingOptions
    }),
    [animationConfig, renderingOptions, updateAnimationConfig, updateRenderingOptions]
  )

  return {
    // State
    selection,
    searchResults,
    isSearching,
    schools,
    categories,
    allTags,
    libraryStats,

    // Search and filtering
    search: advancedSearch,
    quickSearch,
    setSearchQuery,
    setActiveSchool,
    setActiveCategory,
    setLevelFilter,
    setSortBy,
    setSortDirection,
    setViewMode,
    toggleCustomSpells,

    // Spell management
    selectSpell,
    getSelectedSpell,
    getSpellById,
    getSpellsBy,
    getPopularSpells,

    // Template management
    getTemplateById,

    // Customization workflow
    customization,

    // Preview workflow
    preview,

    // Configuration
    configuration,

    // Custom spells
    saveCustomSpell,
    deleteCustomSpell,

    // Utility
    refreshLibrary
  }
}

/**
 * Hook for spell selection management
 * Focused on selection state and related operations
 */
export function useSpellSelection() {
  const {
    selection,
    selectSpell,
    getSelectedSpell,
    getSpellById
  } = useSpellStore()

  const selectedSpell = useMemo(() => getSelectedSpell(), [selection.selectedSpellId])

  return {
    selectedSpell,
    selectedSpellId: selection.selectedSpellId,
    selectSpell,
    getSpellById,
    clearSelection: () => selectSpell(null as any)
  }
}

/**
 * Hook for spell categories and schools
 * Provides organized access to spell taxonomy
 */
export function useSpellTaxonomy() {
  const { schools, categories, allTags, getSpellsBy } = useSpellLibrary()

  const schoolsWithCounts = useMemo(
    () => schools.map(school => ({
      ...school,
      spells: getSpellsBy.school(school.id)
    })),
    [schools, getSpellsBy]
  )

  const categoriesWithCounts = useMemo(
    () => categories.map(category => ({
      ...category,
      spells: getSpellsBy.category(category.id)
    })),
    [categories, getSpellsBy]
  )

  return {
    schools: schoolsWithCounts,
    categories: categoriesWithCounts,
    allTags,
    getSpellsBy
  }
}

/**
 * Hook for spell customization workflow
 * Manages the spell customization process
 */
export function useSpellCustomization() {
  const { customization } = useSpellLibrary()

  const createCustomSpell = useMemo(
    () => (spellId: SpellId, modifications: Partial<SpellCustomization>) => {
      customization.start(spellId)
      customization.update(modifications)
      return customization.finish()
    },
    [customization]
  )

  return {
    ...customization,
    createCustomSpell
  }
}

/**
 * Hook for spell preview functionality
 * Manages spell placement preview
 */
export function useSpellPreview() {
  const { preview } = useSpellLibrary()

  const setPreviewTemplate = useMemo(
    () => (template: UnifiedSpellTemplate) => {
      if (preview.isActive && preview.template?.id === template.id) {
        preview.stop()
      } else {
        preview.start(template)
      }
    },
    [preview]
  )

  return {
    ...preview,
    setPreviewTemplate
  }
}

/**
 * Hook for spell animation configuration
 * Manages animation and rendering settings
 */
export function useSpellConfiguration() {
  const { configuration } = useSpellLibrary()

  const toggleAnimation = useMemo(
    () => (setting: keyof typeof configuration.animation) => {
      const current = configuration.animation[setting]
      if (typeof current === 'boolean') {
        configuration.updateAnimation({ [setting]: !current })
      }
    },
    [configuration]
  )

  const toggleRendering = useMemo(
    () => (setting: keyof typeof configuration.rendering) => {
      const current = configuration.rendering[setting]
      if (typeof current === 'boolean') {
        configuration.updateRendering({ [setting]: !current })
      }
    },
    [configuration]
  )

  return {
    ...configuration,
    toggleAnimation,
    toggleRendering
  }
}