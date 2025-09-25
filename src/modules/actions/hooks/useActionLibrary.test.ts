/**
 * Action Library Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useActionLibrary } from './useActionLibrary'

// Mock the store
vi.mock('../store', () => ({
  useActionStore: vi.fn(() => ({
    libraryService: {
      getCategories: vi.fn(() => [
        { id: 'combat', name: 'Combat', count: 5 },
        { id: 'utility', name: 'Utility', count: 3 }
      ]),
      getAllTags: vi.fn(() => ['fire', 'melee', 'spell']),
      searchActions: vi.fn(() => []),
      getActionsByType: vi.fn(() => []),
      getActionsByCategory: vi.fn(() => []),
      getAllActions: vi.fn(() => [])
    },
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
    search: vi.fn(),
    setSearchQuery: vi.fn(),
    setActiveCategory: vi.fn(),
    setSortBy: vi.fn(),
    setSortDirection: vi.fn(),
    setViewMode: vi.fn(),
    toggleCustomActions: vi.fn(),
    selectAction: vi.fn(),
    getSelectedAction: vi.fn(() => null),
    getPopularActions: vi.fn(() => []),
    startCustomization: vi.fn(),
    updateCustomization: vi.fn(),
    finishCustomization: vi.fn(),
    cancelCustomization: vi.fn(),
    isCustomizing: false,
    customizationData: null,
    saveCustomAction: vi.fn(),
    deleteCustomAction: vi.fn(),
    refreshLibrary: vi.fn()
  }))
}))

describe('useActionLibrary Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('provides action library state', () => {
    const { result } = renderHook(() => useActionLibrary())

    expect(result.current).toMatchObject({
      selection: expect.objectContaining({
        selectedActionId: null,
        searchQuery: '',
        activeCategory: 'all'
      }),
      searchResults: [],
      isSearching: false,
      categories: expect.arrayContaining([
        expect.objectContaining({
          id: 'combat',
          name: 'Combat',
          count: 5
        })
      ]),
      allTags: ['fire', 'melee', 'spell']
    })
  })

  it('provides search functionality', () => {
    const { result } = renderHook(() => useActionLibrary())

    expect(typeof result.current.search).toBe('function')
    expect(typeof result.current.quickSearch).toBe('function')
    expect(typeof result.current.setSearchQuery).toBe('function')
  })

  it('provides category and filter actions', () => {
    const { result } = renderHook(() => useActionLibrary())

    expect(typeof result.current.setActiveCategory).toBe('function')
    expect(typeof result.current.setSortBy).toBe('function')
    expect(typeof result.current.setSortDirection).toBe('function')
    expect(typeof result.current.setViewMode).toBe('function')
    expect(typeof result.current.toggleCustomActions).toBe('function')
  })

  it('provides selection management', () => {
    const { result } = renderHook(() => useActionLibrary())

    expect(typeof result.current.selectAction).toBe('function')
    expect(typeof result.current.getSelectedAction).toBe('function')
  })

  it('provides action retrieval methods', () => {
    const { result } = renderHook(() => useActionLibrary())

    expect(typeof result.current.getActionsByType).toBe('function')
    expect(typeof result.current.getActionsByCategory).toBe('function')
    expect(typeof result.current.getAllActions).toBe('function')
  })

  it('provides customization functionality', () => {
    const { result } = renderHook(() => useActionLibrary())

    expect(typeof result.current.startCustomization).toBe('function')
    expect(typeof result.current.updateCustomization).toBe('function')
    expect(typeof result.current.finishCustomization).toBe('function')
    expect(typeof result.current.cancelCustomization).toBe('function')
    expect(result.current.isCustomizing).toBe(false)
    expect(result.current.customizationData).toBeNull()
  })

  it('provides custom action management', () => {
    const { result } = renderHook(() => useActionLibrary())

    expect(typeof result.current.saveCustomAction).toBe('function')
    expect(typeof result.current.deleteCustomAction).toBe('function')
  })

  it('provides utility methods', () => {
    const { result } = renderHook(() => useActionLibrary())

    expect(typeof result.current.refreshLibrary).toBe('function')
  })

  it('calls quickSearch when query changes', () => {
    const mockSetSearchQuery = vi.fn()
    vi.mocked(require('../store').useActionStore).mockReturnValue({
      ...vi.mocked(require('../store').useActionStore)(),
      setSearchQuery: mockSetSearchQuery
    })

    const { result } = renderHook(() => useActionLibrary())

    act(() => {
      result.current.quickSearch('fireball')
    })

    expect(mockSetSearchQuery).toHaveBeenCalledWith('fireball')
  })

  it('memoizes library service data', () => {
    const { result, rerender } = renderHook(() => useActionLibrary())

    const firstCategories = result.current.categories
    const firstTags = result.current.allTags

    // Rerender without changing underlying data
    rerender()

    // Should return the same memoized objects
    expect(result.current.categories).toBe(firstCategories)
    expect(result.current.allTags).toBe(firstTags)
  })
})