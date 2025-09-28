/**
 * Canvas Module Hook - Main facade hook for the canvas module
 * Provides a unified API for all canvas functionality with proper lifecycle management
 */

import { useEffect, useRef, useCallback } from 'react'
import type { RefObject } from 'react'
import type Konva from 'konva'
import { useCanvas } from '@/core/canvas'
import { useCanvasEvents, type CanvasEventHandlers } from './useCanvasEvents'
import type { CanvasSettings, CanvasLayer } from '../types/canvas'
import type { ViewportState } from '../types/viewport'
import type { Point } from '@/types/geometry'

const DEFAULT_VIEWPORT: ViewportState = {
  position: { x: 0, y: 0 },
  zoom: 1,
  rotation: 0,
  bounds: { x: 0, y: 0, width: 0, height: 0 },
  worldBounds: { x: 0, y: 0, width: 0, height: 0 },
  isTransitioning: false,
  transitionId: null
}


export type UseCanvasModuleOptions = {
  settings: CanvasSettings
  eventHandlers?: CanvasEventHandlers
  onInitialized?: (stage: Konva.Stage) => void
  onError?: (error: Error) => void
}

export type UseCanvasModuleReturn = {
  // Container ref for the canvas
  containerRef: RefObject<HTMLDivElement | null>

  // Canvas state
  isInitialized: boolean
  viewport: ViewportState

  // Canvas operations
  initialize: () => void
  resize: (width: number, height: number) => void
  setViewport: (viewport: Partial<ViewportState>) => void

  // Coordinate utilities
  screenToCanvas: (point: Point) => Point | null
  canvasToScreen: (point: Point) => Point | null
  snapToGrid: (point: Point) => Point

  // Rendering operations
  addRenderObject: (_object: any) => void
  removeRenderObject: (_id: string) => void
  updateRenderObject: (id: string, updates: any) => void
  renderLayer: (layer: CanvasLayer) => void

  // Layer management
  showLayer: (layer: CanvasLayer) => void
  hideLayer: (layer: CanvasLayer) => void
  clearLayer: (layer: CanvasLayer) => void

  // Export functionality
  exportAsImage: (format?: 'png' | 'jpeg') => string | null

  // Event utilities
  getPointerPosition: () => Point | null
}

export const useCanvasModule = ({
  settings,
  eventHandlers,
  onInitialized,
  onError
}: UseCanvasModuleOptions): UseCanvasModuleReturn => {
  const viewportRef = useRef<ViewportState>(settings.viewport || DEFAULT_VIEWPORT)
  const isInitializedRef = useRef(false)

  // Use core canvas service
  const canvas = useCanvas({
    onInitialized: (stage) => {
      setupCanvas(stage)
      onInitialized?.(stage)
    },
    onError
  })

  // Use canvas events
  const canvasEvents = useCanvasEvents({
    viewport: viewportRef.current || DEFAULT_VIEWPORT,
    handlers: eventHandlers
  })

  // Setup canvas with layers and rendering service
  const setupCanvas = useCallback((stage: Konva.Stage) => {
    // TODO: Define layer configuration when RenderingService is implemented
    // const layerConfigs: LayerConfig[] = [
    //   { name: 'background', zIndex: 0, visible: true, listening: false },
    //   { name: 'grid', zIndex: 1, visible: settings.grid.visible, listening: false },
    //   { name: 'objects', zIndex: 2, visible: true, listening: true },
    //   { name: 'selection', zIndex: 3, visible: true, listening: false },
    //   { name: 'preview', zIndex: 4, visible: true, listening: false },
    //   { name: 'ui', zIndex: 5, visible: true, listening: true }
    // ]

    // Initialize rendering service
    // renderingService.initializeLayers(stage, layerConfigs) // TODO: Implement this method in RenderingService

    // Setup event handlers
    canvasEvents.setupStageEvents(stage)

    isInitializedRef.current = true
  }, [settings.grid.visible, canvasEvents])

  // Initialize canvas
  const initialize = useCallback(() => {
    canvas.initialize({
      width: settings.width,
      height: settings.height
    })
  }, [canvas, settings.width, settings.height])

  // Update viewport
  const setViewport = useCallback((updates: Partial<ViewportState>) => {
    const currentViewport = viewportRef.current || { x: 0, y: 0, zoom: 1 }
    viewportRef.current = { ...currentViewport, ...updates }

    // TODO: Fix canvas.getStage() method access
    // const stage = canvas.getStage?.()
    // if (stage && updates.position) {
    //   stage.position(updates.position)
    // }
    // if (stage && updates.scale) {
    //   stage.scale({ x: updates.scale, y: updates.scale })
    // }
    // if (stage) {
    //   stage.batchDraw()
    // }
  }, [canvas])

  // Resize canvas
  const resize = useCallback((width: number, height: number) => {
    canvas.resize({ width, height })
    const currentViewport = viewportRef.current || { x: 0, y: 0, zoom: 1 }
    viewportRef.current = {
      ...currentViewport,
      bounds: {
        x: currentViewport.bounds?.x || 0,
        y: currentViewport.bounds?.y || 0,
        width,
        height
      }
    }
  }, [canvas])

  // Coordinate transformation utilities
  const screenToCanvas = useCallback((point: Point): Point | null => {
    return canvas.screenToCanvas(point)
  }, [canvas])

  const canvasToScreen = useCallback((point: Point): Point | null => {
    return canvas.canvasToScreen(point)
  }, [canvas])

  const snapToGrid = useCallback((point: Point): Point => {
    // TODO: Implement snapToGrid method in coordinateService
    return point // For now, return point unchanged
  }, [settings.grid])

  // Rendering operations
  const addRenderObject = useCallback((_object: any) => {
    // renderingService.addObject(object) // TODO: Implement this method
    console.warn('addRenderObject not implemented')
  }, [])

  const removeRenderObject = useCallback((_id: string) => {
    // renderingService.removeObject(id)
  }, [])

  const updateRenderObject = useCallback((_id: string, _updates: any) => {
    // renderingService.updateObject(id, updates)
  }, [])

  const renderLayer = useCallback((_layer: CanvasLayer) => {
    // renderingService.renderLayer(layer)
  }, [])

  // Layer management
  const showLayer = useCallback((_layer: CanvasLayer) => {
    // renderingService.setLayerVisible(layer, true)
  }, [])

  const hideLayer = useCallback((_layer: CanvasLayer) => {
    // renderingService.setLayerVisible(layer, false)
  }, [])

  const clearLayer = useCallback((_layer: CanvasLayer) => {
    // renderingService.clearLayer(layer)
  }, [])

  // Export functionality
  const exportAsImage = useCallback((format: 'png' | 'jpeg' = 'png'): string | null => {
    return canvas.toDataURL({ format })
  }, [canvas])

  // Event utilities
  const getPointerPosition = useCallback((): Point | null => {
    return canvasEvents.getPointerPosition()
  }, [canvasEvents])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // TODO: Fix canvas.getStage() method access and implement destroy
      // const stage = canvas.getStage?.()
      // if (stage) {
      //   canvasEvents.cleanupStageEvents(stage)
      // }
      // renderingService.destroy()
      isInitializedRef.current = false
    }
  }, [canvas, canvasEvents])

  return {
    containerRef: canvas.containerRef,
    isInitialized: canvas.isInitialized && isInitializedRef.current,
    viewport: viewportRef.current || DEFAULT_VIEWPORT,

    initialize,
    resize,
    setViewport,

    screenToCanvas,
    canvasToScreen,
    snapToGrid,

    addRenderObject,
    removeRenderObject,
    updateRenderObject,
    renderLayer,

    showLayer,
    hideLayer,
    clearLayer,

    exportAsImage,
    getPointerPosition
  }
}