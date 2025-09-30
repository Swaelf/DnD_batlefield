/**
 * useProgressiveLoading Hook
 * Implements progressive loading for large maps with viewport-based chunking
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { MapObject, Point, Rectangle } from '@/types'

interface ProgressiveLoadingOptions {
  chunkSize: number
  viewportPadding: number
  loadPriority: 'distance' | 'layer' | 'type' | 'size'
  maxConcurrentLoads: number
  preloadDistance: number
  unloadDistance: number
  enableMemoryManagement: boolean
}

interface MapChunk {
  id: string
  bounds: Rectangle
  objects: MapObject[]
  isLoaded: boolean
  isLoading: boolean
  priority: number
  lastAccessed: number
}

interface ProgressiveLoadingState {
  loadedChunks: Map<string, MapChunk>
  visibleObjects: MapObject[]
  totalObjects: number
  loadedObjects: number
  memoryUsage: number
  loadProgress: number
}

const DEFAULT_OPTIONS: ProgressiveLoadingOptions = {
  chunkSize: 512, // 512x512 pixel chunks
  viewportPadding: 256, // Load 256px beyond viewport
  loadPriority: 'distance',
  maxConcurrentLoads: 4,
  preloadDistance: 1024,
  unloadDistance: 2048,
  enableMemoryManagement: true
}

export function useProgressiveLoading(
  allObjects: MapObject[],
  viewport: Rectangle,
  scale: number,
  options: Partial<ProgressiveLoadingOptions> = {}
) {
  const config = { ...DEFAULT_OPTIONS, ...options }
  const [state, setState] = useState<ProgressiveLoadingState>({
    loadedChunks: new Map(),
    visibleObjects: [],
    totalObjects: allObjects.length,
    loadedObjects: 0,
    memoryUsage: 0,
    loadProgress: 0
  })

  const loadingQueue = useRef<Set<string>>(new Set())
  const abortControllers = useRef<Map<string, AbortController>>(new Map())

  // Calculate chunk grid
  const chunkGrid = useMemo(() => {
    if (allObjects.length === 0) return { chunks: new Map(), bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 } }

    // Calculate overall bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    for (const obj of allObjects) {
      const objBounds = {
        left: obj.position.x - (obj.width || 50) / 2,
        right: obj.position.x + (obj.width || 50) / 2,
        top: obj.position.y - (obj.height || 50) / 2,
        bottom: obj.position.y + (obj.height || 50) / 2
      }

      minX = Math.min(minX, objBounds.left)
      minY = Math.min(minY, objBounds.top)
      maxX = Math.max(maxX, objBounds.right)
      maxY = Math.max(maxY, objBounds.bottom)
    }

    // Create chunk grid
    const chunks = new Map<string, MapChunk>()
    const cols = Math.ceil((maxX - minX) / config.chunkSize)
    const rows = Math.ceil((maxY - minY) / config.chunkSize)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const chunkBounds: Rectangle = {
          x: minX + col * config.chunkSize,
          y: minY + row * config.chunkSize,
          width: config.chunkSize,
          height: config.chunkSize
        }

        const chunkId = `${col}-${row}`
        const chunkObjects = allObjects.filter(obj => isObjectInBounds(obj, chunkBounds))

        chunks.set(chunkId, {
          id: chunkId,
          bounds: chunkBounds,
          objects: chunkObjects,
          isLoaded: false,
          isLoading: false,
          priority: 0,
          lastAccessed: 0
        })
      }
    }

    return { chunks, bounds: { minX, minY, maxX, maxY } }
  }, [allObjects, config.chunkSize])

  // Calculate distance between point and rectangle
  const distanceToChunk = useCallback((chunk: MapChunk, point: Point): number => {
    const dx = Math.max(0, Math.max(chunk.bounds.x - point.x, point.x - (chunk.bounds.x + chunk.bounds.width)))
    const dy = Math.max(0, Math.max(chunk.bounds.y - point.y, point.y - (chunk.bounds.y + chunk.bounds.height)))
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  // Calculate chunk priority
  const calculateChunkPriority = useCallback((chunk: MapChunk, viewportCenter: Point): number => {
    const distance = distanceToChunk(chunk, viewportCenter)

    switch (config.loadPriority) {
      case 'distance':
        return Math.max(0, 1000 - distance)
      case 'layer':
        const avgLayer = chunk.objects.reduce((sum, obj) => sum + obj.layer, 0) / chunk.objects.length
        return avgLayer * 100 + (1000 - distance)
      case 'type':
        const typeWeight = chunk.objects.some(obj => obj.type === 'token') ? 200 : 100
        return typeWeight + (1000 - distance)
      case 'size':
        const objectCount = chunk.objects.length
        return objectCount * 10 + (1000 - distance)
      default:
        return 1000 - distance
    }
  }, [config.loadPriority, distanceToChunk])

  // Check if object intersects with bounds
  const isObjectInBounds = useCallback((obj: MapObject, bounds: Rectangle): boolean => {
    const objBounds = {
      left: obj.position.x - (obj.width || 50) / 2,
      right: obj.position.x + (obj.width || 50) / 2,
      top: obj.position.y - (obj.height || 50) / 2,
      bottom: obj.position.y + (obj.height || 50) / 2
    }

    return !(objBounds.right < bounds.x ||
             objBounds.left > bounds.x + bounds.width ||
             objBounds.bottom < bounds.y ||
             objBounds.top > bounds.y + bounds.height)
  }, [])

  // Load chunk with progressive loading
  const loadChunk = useCallback(async (chunkId: string): Promise<void> => {
    const chunk = chunkGrid.chunks.get(chunkId)
    if (!chunk || chunk.isLoaded || chunk.isLoading) return

    // Create abort controller for this load operation
    const abortController = new AbortController()
    abortControllers.current.set(chunkId, abortController)

    // Mark as loading
    chunk.isLoading = true
    chunk.lastAccessed = Date.now()

    try {
      // Simulate progressive loading with delay for heavy objects
      const loadDelay = Math.min(100, chunk.objects.length * 2)
      await new Promise(resolve => setTimeout(resolve, loadDelay))

      // Check if aborted
      if (abortController.signal.aborted) return

      // Mark as loaded
      chunk.isLoaded = true
      chunk.isLoading = false

      // Update state
      setState(prevState => {
        const newLoadedChunks = new Map(prevState.loadedChunks)
        newLoadedChunks.set(chunkId, chunk)

        const newVisibleObjects = Array.from(newLoadedChunks.values())
          .filter(c => c.isLoaded)
          .flatMap(c => c.objects)

        return {
          ...prevState,
          loadedChunks: newLoadedChunks,
          visibleObjects: newVisibleObjects,
          loadedObjects: newVisibleObjects.length,
          loadProgress: (newLoadedChunks.size / chunkGrid.chunks.size) * 100,
          memoryUsage: estimateMemoryUsage(newVisibleObjects)
        }
      })

    } catch (error) {
      if (!abortController.signal.aborted) {
        console.error(`Failed to load chunk ${chunkId}:`, error)
      }
    } finally {
      chunk.isLoading = false
      loadingQueue.current.delete(chunkId)
      abortControllers.current.delete(chunkId)
    }
  }, [chunkGrid.chunks])

  // Unload distant chunks for memory management
  const unloadDistantChunks = useCallback((viewportCenter: Point) => {
    if (!config.enableMemoryManagement) return

    setState(prevState => {
      const newLoadedChunks = new Map(prevState.loadedChunks)
      const chunksToUnload: string[] = []

      for (const [chunkId, chunk] of newLoadedChunks) {
        const distance = distanceToChunk(chunk, viewportCenter)
        const timeSinceAccess = Date.now() - chunk.lastAccessed

        if (distance > config.unloadDistance && timeSinceAccess > 10000) { // 10 seconds
          chunksToUnload.push(chunkId)
        }
      }

      // Unload chunks
      for (const chunkId of chunksToUnload) {
        const chunk = newLoadedChunks.get(chunkId)
        if (chunk) {
          chunk.isLoaded = false
          chunk.objects = [] // Free memory
          newLoadedChunks.delete(chunkId)
        }
      }

      if (chunksToUnload.length > 0) {
        const newVisibleObjects = Array.from(newLoadedChunks.values())
          .filter(c => c.isLoaded)
          .flatMap(c => c.objects)

        return {
          ...prevState,
          loadedChunks: newLoadedChunks,
          visibleObjects: newVisibleObjects,
          loadedObjects: newVisibleObjects.length,
          memoryUsage: estimateMemoryUsage(newVisibleObjects)
        }
      }

      return prevState
    })
  }, [config.enableMemoryManagement, config.unloadDistance, distanceToChunk])

  // Main loading logic
  useEffect(() => {
    const viewportCenter: Point = {
      x: viewport.x + viewport.width / 2,
      y: viewport.y + viewport.height / 2
    }

    // Find chunks that need to be loaded
    const chunksToLoad: Array<{ chunk: MapChunk; priority: number }> = []

    for (const chunk of chunkGrid.chunks.values()) {
      const distance = distanceToChunk(chunk, viewportCenter)

      // Skip if chunk is too far away
      if (distance > config.preloadDistance) continue

      // Skip if already loaded or loading
      if (chunk.isLoaded || chunk.isLoading || loadingQueue.current.has(chunk.id)) continue

      const priority = calculateChunkPriority(chunk, viewportCenter)
      chunksToLoad.push({ chunk, priority })
    }

    // Sort by priority (highest first)
    chunksToLoad.sort((a, b) => b.priority - a.priority)

    // Load top priority chunks up to max concurrent limit
    const availableSlots = config.maxConcurrentLoads - loadingQueue.current.size
    const chunksToLoadNow = chunksToLoad.slice(0, availableSlots)

    for (const { chunk } of chunksToLoadNow) {
      loadingQueue.current.add(chunk.id)
      void loadChunk(chunk.id)
    }

    // Unload distant chunks
    unloadDistantChunks(viewportCenter)

  }, [viewport, scale, chunkGrid.chunks, config, loadChunk, unloadDistantChunks, distanceToChunk, calculateChunkPriority])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel all loading operations
      for (const controller of abortControllers.current.values()) {
        controller.abort()
      }
      abortControllers.current.clear()
      loadingQueue.current.clear()
    }
  }, [])

  // Estimate memory usage
  const estimateMemoryUsage = (objects: MapObject[]): number => {
    // Rough estimate: 1KB per object
    return objects.length * 1024
  }

  // Get visible objects in current viewport
  const getVisibleObjects = useCallback(() => {
    const expandedViewport: Rectangle = {
      x: viewport.x - config.viewportPadding,
      y: viewport.y - config.viewportPadding,
      width: viewport.width + config.viewportPadding * 2,
      height: viewport.height + config.viewportPadding * 2
    }

    return state.visibleObjects.filter(obj => isObjectInBounds(obj, expandedViewport))
  }, [state.visibleObjects, viewport, config.viewportPadding, isObjectInBounds])

  return {
    // Current state
    visibleObjects: getVisibleObjects(),
    state,

    // Actions
    loadChunk,
    unloadDistantChunks,

    // Utilities
    getChunkForPosition: useCallback((position: Point): MapChunk | null => {
      for (const chunk of chunkGrid.chunks.values()) {
        if (position.x >= chunk.bounds.x &&
            position.x <= chunk.bounds.x + chunk.bounds.width &&
            position.y >= chunk.bounds.y &&
            position.y <= chunk.bounds.y + chunk.bounds.height) {
          return chunk
        }
      }
      return null
    }, [chunkGrid.chunks]),

    // Performance metrics
    metrics: {
      totalChunks: chunkGrid.chunks.size,
      loadedChunks: state.loadedChunks.size,
      activeLoads: loadingQueue.current.size,
      memoryUsage: state.memoryUsage,
      loadProgress: state.loadProgress
    }
  }
}