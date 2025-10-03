/**
 * Progressive Object Loader
 *
 * Loads objects in chunks using requestIdleCallback to prevent frame drops
 * and eliminate initial loading spikes.
 */

import type { MapObject } from '@/types/map'

export type ProgressiveLoadOptions = {
  chunkSize?: number
  onProgress?: (loaded: number, total: number) => void
  onComplete?: () => void
}

export class ProgressiveLoader {
  private loadQueue: MapObject[] = []
  private loadedObjects: MapObject[] = []
  private isLoading = false
  private idleCallbackId: number | null = null
  private onUpdateCallback: ((objects: MapObject[]) => void) | null = null

  /**
   * Start progressive loading of objects
   */
  loadObjects(
    objects: MapObject[],
    onUpdate: (objects: MapObject[]) => void,
    options: ProgressiveLoadOptions = {}
  ) {
    const {
      chunkSize = 10,
      onProgress = () => {},
      onComplete = () => {}
    } = options

    // Cancel any existing load operation
    this.cancel()

    // Initialize new load operation
    this.loadQueue = [...objects]
    this.loadedObjects = []
    this.onUpdateCallback = onUpdate
    this.isLoading = true

    // Start with a small initial batch for immediate feedback
    const initialBatch = Math.min(5, this.loadQueue.length)
    if (initialBatch > 0) {
      const initial = this.loadQueue.splice(0, initialBatch)
      this.loadedObjects.push(...initial)
      onUpdate(this.loadedObjects)
      onProgress(this.loadedObjects.length, objects.length)
    }

    // If all objects loaded in initial batch, we're done
    if (this.loadQueue.length === 0) {
      this.isLoading = false
      onComplete()
      return
    }

    // Load remaining objects progressively
    const loadChunk = (deadline: IdleDeadline) => {
      // Load objects while we have idle time (max 10ms to be safe)
      while (
        deadline.timeRemaining() > 1 &&
        this.loadQueue.length > 0 &&
        this.loadedObjects.length < objects.length
      ) {
        const chunk = this.loadQueue.splice(0, chunkSize)
        this.loadedObjects.push(...chunk)

        // Update with new objects
        if (this.onUpdateCallback) {
          this.onUpdateCallback(this.loadedObjects)
        }

        // Report progress
        onProgress(this.loadedObjects.length, objects.length)

        // If this was a large chunk, yield control back
        if (chunk.length >= chunkSize) {
          break
        }
      }

      // Continue loading if more objects remain
      if (this.loadQueue.length > 0) {
        this.idleCallbackId = requestIdleCallback(loadChunk)
      } else {
        this.isLoading = false
        onComplete()
      }
    }

    // Start progressive loading
    this.idleCallbackId = requestIdleCallback(loadChunk)
  }

  /**
   * Update objects immediately (for non-initial loads)
   */
  updateObjects(objects: MapObject[]) {
    // If we're not currently loading, just update immediately
    if (!this.isLoading) {
      this.loadedObjects = objects
      if (this.onUpdateCallback) {
        this.onUpdateCallback(objects)
      }
      return
    }

    // If we're loading, cancel current operation and restart
    this.cancel()
    this.loadedObjects = objects
    if (this.onUpdateCallback) {
      this.onUpdateCallback(objects)
    }
  }

  /**
   * Cancel any ongoing progressive load
   */
  cancel() {
    if (this.idleCallbackId !== null) {
      cancelIdleCallback(this.idleCallbackId)
      this.idleCallbackId = null
    }
    this.isLoading = false
    this.loadQueue = []
  }

  /**
   * Get current loaded objects
   */
  getLoadedObjects(): MapObject[] {
    return this.loadedObjects
  }

  /**
   * Check if currently loading
   */
  isCurrentlyLoading(): boolean {
    return this.isLoading
  }
}

// Singleton instance for global use
export const progressiveLoader = new ProgressiveLoader()

/**
 * Hook for using progressive loader in React components
 */
export function useProgressiveLoader() {
  const [loadingProgress, setLoadingProgress] = useState<{
    loaded: number
    total: number
    isLoading: boolean
  }>({ loaded: 0, total: 0, isLoading: false })

  const loadObjects = useCallback(
    (
      objects: MapObject[],
      onUpdate: (objects: MapObject[]) => void,
      options?: ProgressiveLoadOptions
    ) => {
      setLoadingProgress({ loaded: 0, total: objects.length, isLoading: true })

      progressiveLoader.loadObjects(objects, onUpdate, {
        ...options,
        onProgress: (loaded, total) => {
          setLoadingProgress({ loaded, total, isLoading: true })
          options?.onProgress?.(loaded, total)
        },
        onComplete: () => {
          setLoadingProgress(prev => ({ ...prev, isLoading: false }))
          options?.onComplete?.()
        }
      })
    },
    []
  )

  return {
    loadObjects,
    loadingProgress,
    cancel: () => progressiveLoader.cancel()
  }
}

// Import React hooks only when needed for the hook
import { useState, useCallback } from 'react'