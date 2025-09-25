/**
 * Spell Library Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSpellLibrary } from './useSpellLibrary'

// Mock the store
vi.mock('../store', () => ({
  useSpellStore: vi.fn(() => ({
    templateService: {
      getSpellSchools: vi.fn(() => [
        { id: 'evocation', name: 'Evocation', count: 5 },
        { id: 'conjuration', name: 'Conjuration', count: 3 }
      ]),
      getSpellCategories: vi.fn(() => [
        { id: 'combat', name: 'Combat', count: 4 },
        { id: 'utility', name: 'Utility', count: 2 }
      ]),
      getAllTags: vi.fn(() => ['fire', 'area', 'instant']),
      searchSpells: vi.fn(() => []),
      getSpellsBySchool: vi.fn(() => []),
      getSpellsByCategory: vi.fn(() => []),
      getPopularSpells: vi.fn(() => [])
    },
    selection: {
      selectedSpellId: null,
      searchQuery: '',
      activeSchool: 'all',
      activeCategory: 'all',
      levelFilter: { min: 0, max: 9 },
      sortBy: 'name',
      sortDirection: 'asc',
      viewMode: 'grid',
      showCustomSpells: true
    },
    searchResults: [],
    isSearching: false,
    schools: [],
    categories: [],
    allTags: [],
    animationConfig: {
      enableParticles: true,
      enableScreenShake: false,
      enableSoundEffects: true,
      animationQuality: 'medium',
      particleDensity: 1.0,
      shakeDuration: 200,
      fadeInDuration: 500,
      fadeOutDuration: 1000
    },
    renderingOptions: {
      showGrid: true,
      showRange: true,
      showArea: true,
      showDirection: true,
      highlightTargets: true,
      previewMode: false,
      quality: 'medium'
    },
    previewState: {
      isActive: false,
      template: null,
      position: null,
      rotation: 0,
      isValid: false,
      affectedArea: [],
      potentialTargets: []
    },
    isCustomizing: false,
    customizationData: null,
    search: vi.fn(),
    setSearchQuery: vi.fn(),
    setActiveSchool: vi.fn(),
    setActiveCategory: vi.fn(),
    setLevelFilter: vi.fn(),
    setSortBy: vi.fn(),
    setSortDirection: vi.fn(),
    setViewMode: vi.fn(),
    toggleCustomSpells: vi.fn(),
    selectSpell: vi.fn(),
    getSelectedSpell: vi.fn(() => null),
    getSpellById: vi.fn(() => null),
    getSpellsBySchool: vi.fn(() => []),
    getSpellsByCategory: vi.fn(() => []),
    getPopularSpells: vi.fn(() => []),
    getTemplateById: vi.fn(() => null),
    startCustomization: vi.fn(),
    updateCustomization: vi.fn(),
    finishCustomization: vi.fn(),
    cancelCustomization: vi.fn(),
    saveCustomSpell: vi.fn(),
    deleteCustomSpell: vi.fn(),
    startPreview: vi.fn(),
    updatePreviewPosition: vi.fn(),
    updatePreviewRotation: vi.fn(),
    stopPreview: vi.fn(),
    validatePreview: vi.fn(() => false),
    updateAnimationConfig: vi.fn(),
    updateRenderingOptions: vi.fn(),
    refreshLibrary: vi.fn()
  }))
}))

describe('useSpellLibrary Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('provides spell library state', () => {
    const { result } = renderHook(() => useSpellLibrary())

    expect(result.current).toMatchObject({
      selection: expect.objectContaining({
        selectedSpellId: null,
        searchQuery: '',
        activeSchool: 'all',
        activeCategory: 'all'
      }),
      searchResults: [],
      isSearching: false,
      schools: [],
      categories: [],
      allTags: [],
      libraryStats: expect.objectContaining({
        totalSpells: 0,
        customSpells: 0,
        builtInSpells: 0
      })
    })
  })

  it('provides search functionality', () => {
    const { result } = renderHook(() => useSpellLibrary())

    expect(typeof result.current.search).toBe('function')
    expect(typeof result.current.quickSearch).toBe('function')
    expect(typeof result.current.setSearchQuery).toBe('function')
  })

  it('provides school and category actions', () => {
    const { result } = renderHook(() => useSpellLibrary())

    expect(typeof result.current.setActiveSchool).toBe('function')
    expect(typeof result.current.setActiveCategory).toBe('function')
    expect(typeof result.current.setLevelFilter).toBe('function')
    expect(typeof result.current.setSortBy).toBe('function')
    expect(typeof result.current.setSortDirection).toBe('function')
    expect(typeof result.current.setViewMode).toBe('function')
    expect(typeof result.current.toggleCustomSpells).toBe('function')
  })

  it('provides selection management', () => {
    const { result } = renderHook(() => useSpellLibrary())

    expect(typeof result.current.selectSpell).toBe('function')
    expect(typeof result.current.getSelectedSpell).toBe('function')
    expect(typeof result.current.getSpellById).toBe('function')
  })

  it('provides spell retrieval methods', () => {
    const { result } = renderHook(() => useSpellLibrary())

    expect(typeof result.current.getSpellsBy.school).toBe('function')
    expect(typeof result.current.getSpellsBy.category).toBe('function')
    expect(typeof result.current.getSpellsBy.level).toBe('function')
    expect(typeof result.current.getSpellsBy.type).toBe('function')
    expect(typeof result.current.getPopularSpells).toBe('function')
  })

  it('provides customization workflow', () => {
    const { result } = renderHook(() => useSpellLibrary())

    expect(result.current.customization).toMatchObject({
      isActive: false,
      data: null,
      start: expect.any(Function),
      update: expect.any(Function),
      finish: expect.any(Function),
      cancel: expect.any(Function),
      isValid: false
    })
  })

  it('provides preview workflow', () => {
    const { result } = renderHook(() => useSpellLibrary())

    expect(result.current.preview).toMatchObject({
      isActive: false,
      template: null,
      position: null,
      rotation: 0,
      isValid: false,
      start: expect.any(Function),
      updatePosition: expect.any(Function),
      updateRotation: expect.any(Function),
      stop: expect.any(Function),
      validate: expect.any(Function)
    })
  })

  it('provides configuration management', () => {
    const { result } = renderHook(() => useSpellLibrary())

    expect(result.current.configuration).toMatchObject({
      animation: expect.objectContaining({
        enableParticles: true,
        enableScreenShake: false,
        enableSoundEffects: true
      }),
      rendering: expect.objectContaining({
        showGrid: true,
        showRange: true,
        showArea: true
      }),
      updateAnimation: expect.any(Function),
      updateRendering: expect.any(Function)
    })
  })

  it('provides custom spell management', () => {
    const { result } = renderHook(() => useSpellLibrary())

    expect(typeof result.current.saveCustomSpell).toBe('function')
    expect(typeof result.current.deleteCustomSpell).toBe('function')
  })

  it('provides utility methods', () => {
    const { result } = renderHook(() => useSpellLibrary())

    expect(typeof result.current.refreshLibrary).toBe('function')
  })

  it('calls quickSearch when query changes', () => {
    const mockSetSearchQuery = vi.fn()
    vi.mocked(require('../store').useSpellStore).mockReturnValue({
      ...vi.mocked(require('../store').useSpellStore)(),
      setSearchQuery: mockSetSearchQuery
    })

    const { result } = renderHook(() => useSpellLibrary())

    act(() => {
      result.current.quickSearch('fireball')
    })

    expect(mockSetSearchQuery).toHaveBeenCalledWith('fireball')
  })

  it('calculates library stats correctly', () => {
    const mockSearchResults = [
      { id: 'spell1', name: 'Fireball', isCustom: false },
      { id: 'spell2', name: 'Custom Fire', isCustom: true },
      { id: 'spell3', name: 'Lightning Bolt', isCustom: false }
    ]

    vi.mocked(require('../store').useSpellStore).mockReturnValue({
      ...vi.mocked(require('../store').useSpellStore)(),
      searchResults: mockSearchResults,
      schools: [{ id: 'evocation' }, { id: 'conjuration' }],
      categories: [{ id: 'combat' }],
      allTags: ['fire', 'lightning']
    })

    const { result } = renderHook(() => useSpellLibrary())

    expect(result.current.libraryStats).toEqual({
      totalSpells: 3,
      customSpells: 1,
      builtInSpells: 2,
      totalSchools: 2,
      totalCategories: 1,
      totalTags: 2
    })
  })

  it('memoizes library stats', () => {
    const { result, rerender } = renderHook(() => useSpellLibrary())

    const firstStats = result.current.libraryStats

    // Rerender without changing underlying data
    rerender()

    // Should return the same memoized object
    expect(result.current.libraryStats).toBe(firstStats)
  })
})