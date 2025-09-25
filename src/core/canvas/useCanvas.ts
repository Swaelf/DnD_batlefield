/**
 * Canvas hook - React integration for the Canvas service
 * Provides a clean React API for canvas operations with lifecycle management
 */

import { useEffect, useRef, useCallback } from 'react'
import type { RefObject } from 'react'
import type Konva from 'konva'
import { canvasService, type CanvasConfig, type LayerConfig, type CanvasExportOptions } from './CanvasService'
import type { Point, Size, Rectangle, CleanupFunction } from '@/foundation/types'

export type UseCanvasOptions = {
  onInitialized?: (stage: Konva.Stage) => void
  onError?: (error: Error) => void
}

export type UseCanvasReturn = {
  containerRef: RefObject<HTMLDivElement>
  initialize: (config: Omit<CanvasConfig, 'container'>) => void
  addLayer: (config: LayerConfig) => Konva.Layer | null
  getLayer: (name: string) => Konva.Layer | null
  removeLayer: (name: string) => boolean
  resize: (size: Size) => void
  setScale: (scale: number, origin?: Point) => void
  getScale: () => number
  setPosition: (position: Point) => void
  getPosition: () => Point
  screenToCanvas: (point: Point) => Point | null
  canvasToScreen: (point: Point) => Point | null
  getVisibleArea: () => Rectangle | null
  toDataURL: (options?: CanvasExportOptions) => string | null
  draw: () => void
  isInitialized: boolean
}

export const useCanvas = (options: UseCanvasOptions = {}): UseCanvasReturn => {
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  const initialize = useCallback((config: Omit<CanvasConfig, 'container'>) => {
    if (!containerRef.current) {
      const error = new Error('Container ref not available. Make sure to attach containerRef to a div element.')
      options.onError?.(error)
      return
    }

    if (initializedRef.current) {
      const error = new Error('Canvas already initialized. Call destroy first if you need to reinitialize.')
      options.onError?.(error)
      return
    }

    try {
      canvasService.initialize({
        ...config,
        container: containerRef.current
      })

      const stage = canvasService.getStage()
      if (stage) {
        options.onInitialized?.(stage)
        initializedRef.current = true
      }
    } catch (error) {
      options.onError?.(error as Error)
    }
  }, [options])

  const addLayer = useCallback((config: LayerConfig): Konva.Layer | null => {
    try {
      return canvasService.addLayer(config)
    } catch (error) {
      options.onError?.(error as Error)
      return null
    }
  }, [options])

  const getLayer = useCallback((name: string): Konva.Layer | null => {
    return canvasService.getLayer(name)
  }, [])

  const removeLayer = useCallback((name: string): boolean => {
    return canvasService.removeLayer(name)
  }, [])

  const resize = useCallback((size: Size): void => {
    try {
      canvasService.resize(size)
    } catch (error) {
      options.onError?.(error as Error)
    }
  }, [options])

  const setScale = useCallback((scale: number, origin?: Point): void => {
    try {
      canvasService.setScale(scale, origin)
    } catch (error) {
      options.onError?.(error as Error)
    }
  }, [options])

  const getScale = useCallback((): number => {
    try {
      return canvasService.getScale()
    } catch (error) {
      options.onError?.(error as Error)
      return 1
    }
  }, [options])

  const setPosition = useCallback((position: Point): void => {
    try {
      canvasService.setPosition(position)
    } catch (error) {
      options.onError?.(error as Error)
    }
  }, [options])

  const getPosition = useCallback((): Point => {
    try {
      return canvasService.getPosition()
    } catch (error) {
      options.onError?.(error as Error)
      return { x: 0, y: 0 }
    }
  }, [options])

  const screenToCanvas = useCallback((point: Point): Point | null => {
    try {
      return canvasService.screenToCanvas(point)
    } catch (error) {
      options.onError?.(error as Error)
      return null
    }
  }, [options])

  const canvasToScreen = useCallback((point: Point): Point | null => {
    try {
      return canvasService.canvasToScreen(point)
    } catch (error) {
      options.onError?.(error as Error)
      return null
    }
  }, [options])

  const getVisibleArea = useCallback((): Rectangle | null => {
    try {
      return canvasService.getVisibleArea()
    } catch (error) {
      options.onError?.(error as Error)
      return null
    }
  }, [options])

  const toDataURL = useCallback((exportOptions?: CanvasExportOptions): string | null => {
    try {
      return canvasService.toDataURL(exportOptions)
    } catch (error) {
      options.onError?.(error as Error)
      return null
    }
  }, [options])

  const draw = useCallback((): void => {
    canvasService.draw()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (initializedRef.current) {
        const cleanup = canvasService.destroy()
        cleanup()
        initializedRef.current = false
      }
    }
  }, [])

  return {
    containerRef,
    initialize,
    addLayer,
    getLayer,
    removeLayer,
    resize,
    setScale,
    getScale,
    setPosition,
    getPosition,
    screenToCanvas,
    canvasToScreen,
    getVisibleArea,
    toDataURL,
    draw,
    isInitialized: initializedRef.current
  }
}