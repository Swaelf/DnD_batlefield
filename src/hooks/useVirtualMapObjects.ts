/**
 * useVirtualMapObjects Hook
 * Manages virtualization of large map object collections for performance
 */

import { useMemo, useState, useCallback } from 'react'
import type { MapObject } from '@/types'
import { hasStringProperty, hasNumberProperty } from '@/types'

interface VirtualMapObjectsOptions {
  searchQuery?: string
  selectedCategory?: string
  sortBy?: 'name' | 'type' | 'layer' | 'created'
  sortOrder?: 'asc' | 'desc'
  pageSize?: number
  enableSearch?: boolean
  enableFiltering?: boolean
}

interface VirtualMapObjectsState {
  filteredObjects: MapObject[]
  totalCount: number
  visibleCount: number
  searchResults: MapObject[]
  categories: { [key: string]: number }
  currentPage: number
  hasMore: boolean
}

export function useVirtualMapObjects(
  objects: MapObject[],
  options: VirtualMapObjectsOptions = {}
) {
  const {
    searchQuery = '',
    selectedCategory = 'all',
    sortBy = 'name',
    sortOrder = 'asc',
    pageSize = 100,
    enableSearch = true,
    enableFiltering = true
  } = options

  const [currentPage, setCurrentPage] = useState(0)

  // Filter and search objects
  const filteredObjects = useMemo(() => {
    let result = [...objects]

    // Apply category filter
    if (enableFiltering && selectedCategory !== 'all') {
      result = result.filter(obj => obj.type === selectedCategory)
    }

    // Apply search
    if (enableSearch && searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(obj => {
        const name = hasStringProperty(obj, 'name') ? obj.name.toLowerCase() : ''
        const type = obj.type.toLowerCase()
        const id = obj.id.toLowerCase()

        return name.includes(query) ||
               type.includes(query) ||
               id.includes(query)
      })
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA: any
      let valueB: any

      switch (sortBy) {
        case 'name':
          valueA = hasStringProperty(a, 'name') ? a.name : a.id
          valueB = hasStringProperty(b, 'name') ? b.name : b.id
          break
        case 'type':
          valueA = a.type
          valueB = b.type
          break
        case 'layer':
          valueA = a.layer
          valueB = b.layer
          break
        case 'created':
          valueA = hasNumberProperty(a, 'created') ? a.created : 0
          valueB = hasNumberProperty(b, 'created') ? b.created : 0
          break
        default:
          valueA = a.id
          valueB = b.id
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        const comparison = valueA.localeCompare(valueB)
        return sortOrder === 'asc' ? comparison : -comparison
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [objects, selectedCategory, searchQuery, sortBy, sortOrder, enableFiltering, enableSearch])

  // Calculate categories
  const categories = useMemo(() => {
    const counts: { [key: string]: number } = {}

    objects.forEach(obj => {
      counts[obj.type] = (counts[obj.type] || 0) + 1
    })

    return counts
  }, [objects])

  // Paginate results for virtual scrolling
  const virtualizedObjects = useMemo(() => {
    const startIndex = currentPage * pageSize
    const endIndex = startIndex + pageSize
    return filteredObjects.slice(0, endIndex)
  }, [filteredObjects, currentPage, pageSize])

  // Load more objects (for infinite scrolling)
  const loadMore = useCallback(() => {
    const maxPage = Math.ceil(filteredObjects.length / pageSize) - 1
    if (currentPage < maxPage) {
      setCurrentPage(prev => prev + 1)
    }
  }, [currentPage, filteredObjects.length, pageSize])

  // Reset pagination when filters change
  const resetPagination = useCallback(() => {
    setCurrentPage(0)
  }, [])

  // Get object by ID efficiently
  const getObjectById = useCallback((id: string) => {
    return objects.find(obj => obj.id === id)
  }, [objects])

  // Get objects by type efficiently
  const getObjectsByType = useCallback((type: string) => {
    return objects.filter(obj => obj.type === type)
  }, [objects])

  // Batch operations for performance
  const batchUpdateObjects = useCallback((updates: Array<{ id: string; changes: Partial<MapObject> }>) => {
    // This would be implemented by the parent component
    // Return the update operations for batch processing
    return updates
  }, [])

  const state: VirtualMapObjectsState = {
    filteredObjects,
    totalCount: objects.length,
    visibleCount: virtualizedObjects.length,
    searchResults: searchQuery ? filteredObjects : [],
    categories,
    currentPage,
    hasMore: virtualizedObjects.length < filteredObjects.length
  }

  return {
    // Data
    objects: virtualizedObjects,
    state,

    // Actions
    loadMore,
    resetPagination,
    getObjectById,
    getObjectsByType,
    batchUpdateObjects,

    // Virtual scrolling helpers
    getItemKey: useCallback((obj: MapObject, _index: number) => obj.id, []),

    // Performance metrics
    metrics: {
      totalObjects: objects.length,
      filteredObjects: filteredObjects.length,
      renderedObjects: virtualizedObjects.length,
      memoryEfficiency: Math.round((virtualizedObjects.length / objects.length) * 100)
    }
  }
}

// Hook for object selection in virtual lists
export function useVirtualObjectSelection<T extends { id: string }>(
  objects: T[]
) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number>(-1)

  const selectObject = useCallback((id: string, multiSelect = false) => {
    if (multiSelect) {
      setSelectedIds(prev => {
        const newSet = new Set(prev)
        if (newSet.has(id)) {
          newSet.delete(id)
        } else {
          newSet.add(id)
        }
        return newSet
      })
    } else {
      setSelectedIds(new Set([id]))
    }

    const index = objects.findIndex(obj => obj.id === id)
    setLastSelectedIndex(index)
  }, [objects])

  const selectRange = useCallback((startIndex: number, endIndex: number) => {
    const start = Math.min(startIndex, endIndex)
    const end = Math.max(startIndex, endIndex)

    const rangeIds = objects
      .slice(start, end + 1)
      .map(obj => obj.id)

    setSelectedIds(new Set(rangeIds))
  }, [objects])

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(objects.map(obj => obj.id)))
  }, [objects])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
    setLastSelectedIndex(-1)
  }, [])

  const isSelected = useCallback((id: string) => {
    return selectedIds.has(id)
  }, [selectedIds])

  const getSelectedObjects = useCallback(() => {
    return objects.filter(obj => selectedIds.has(obj.id))
  }, [objects, selectedIds])

  return {
    selectedIds,
    selectedObjects: getSelectedObjects(),
    selectObject,
    selectRange,
    selectAll,
    clearSelection,
    isSelected,
    selectionCount: selectedIds.size,
    lastSelectedIndex
  }
}