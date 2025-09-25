/**
 * Canvas Service - Core abstraction layer for Konva canvas operations
 * Provides a clean API for managing the canvas, layers, and stage lifecycle
 */

import Konva from 'konva'
import type { Point, Size, Rectangle } from '@/foundation/types'
import type { CleanupFunction } from '@/foundation/types'

export type CanvasConfig = {
  width: number
  height: number
  container: HTMLDivElement
}

export type LayerConfig = {
  name: string
  zIndex?: number
  listening?: boolean
  visible?: boolean
}

export type CanvasExportOptions = {
  format: 'png' | 'jpeg'
  quality?: number
  pixelRatio?: number
  mimeType?: string
}

export class CanvasService {
  private stage: Konva.Stage | null = null
  private layers: Map<string, Konva.Layer> = new Map()
  private container: HTMLDivElement | null = null
  private config: CanvasConfig | null = null

  /**
   * Initialize the canvas with a stage and container
   */
  initialize(config: CanvasConfig): void {
    if (this.stage) {
      this.destroy()
    }

    this.config = config
    this.container = config.container

    this.stage = new Konva.Stage({
      container: config.container,
      width: config.width,
      height: config.height
    })

    // Set up stage event delegation
    this.setupStageEvents()
  }

  /**
   * Get the Konva stage instance
   */
  getStage(): Konva.Stage | null {
    return this.stage
  }

  /**
   * Get the canvas container element
   */
  getContainer(): HTMLDivElement | null {
    return this.container
  }

  /**
   * Add a new layer to the stage
   */
  addLayer(config: LayerConfig): Konva.Layer {
    if (!this.stage) {
      throw new Error('Canvas not initialized. Call initialize() first.')
    }

    if (this.layers.has(config.name)) {
      throw new Error(`Layer "${config.name}" already exists`)
    }

    const layer = new Konva.Layer({
      listening: config.listening ?? true,
      visible: config.visible ?? true
    })

    // Set z-index if provided
    if (config.zIndex !== undefined) {
      layer.zIndex(config.zIndex)
    }

    this.stage.add(layer)
    this.layers.set(config.name, layer)

    return layer
  }

  /**
   * Get a layer by name
   */
  getLayer(name: string): Konva.Layer | null {
    return this.layers.get(name) || null
  }

  /**
   * Remove a layer from the stage
   */
  removeLayer(name: string): boolean {
    const layer = this.layers.get(name)
    if (!layer) {
      return false
    }

    layer.destroy()
    this.layers.delete(name)
    return true
  }

  /**
   * Get all layer names
   */
  getLayerNames(): string[] {
    return Array.from(this.layers.keys())
  }

  /**
   * Resize the canvas
   */
  resize(size: Size): void {
    if (!this.stage) {
      throw new Error('Canvas not initialized')
    }

    this.stage.size(size)
    this.stage.batchDraw()

    if (this.config) {
      this.config.width = size.width
      this.config.height = size.height
    }
  }

  /**
   * Get canvas size
   */
  getSize(): Size {
    if (!this.stage) {
      throw new Error('Canvas not initialized')
    }

    return this.stage.size()
  }

  /**
   * Set canvas scale (zoom)
   */
  setScale(scale: number, origin?: Point): void {
    if (!this.stage) {
      throw new Error('Canvas not initialized')
    }

    if (origin) {
      // Scale around a specific point
      const oldScale = this.stage.scaleX()
      const pointer = origin

      const mousePointTo = {
        x: (pointer.x - this.stage.x()) / oldScale,
        y: (pointer.y - this.stage.y()) / oldScale
      }

      this.stage.scale({ x: scale, y: scale })

      const newPos = {
        x: pointer.x - mousePointTo.x * scale,
        y: pointer.y - mousePointTo.y * scale
      }

      this.stage.position(newPos)
    } else {
      this.stage.scale({ x: scale, y: scale })
    }

    this.stage.batchDraw()
  }

  /**
   * Get current scale
   */
  getScale(): number {
    if (!this.stage) {
      throw new Error('Canvas not initialized')
    }

    return this.stage.scaleX()
  }

  /**
   * Set canvas position (pan)
   */
  setPosition(position: Point): void {
    if (!this.stage) {
      throw new Error('Canvas not initialized')
    }

    this.stage.position(position)
    this.stage.batchDraw()
  }

  /**
   * Get current position
   */
  getPosition(): Point {
    if (!this.stage) {
      throw new Error('Canvas not initialized')
    }

    return this.stage.position()
  }

  /**
   * Convert screen coordinates to canvas coordinates
   */
  screenToCanvas(screenPoint: Point): Point {
    if (!this.stage) {
      throw new Error('Canvas not initialized')
    }

    const transform = this.stage.getAbsoluteTransform().copy()
    transform.invert()
    return transform.point(screenPoint)
  }

  /**
   * Convert canvas coordinates to screen coordinates
   */
  canvasToScreen(canvasPoint: Point): Point {
    if (!this.stage) {
      throw new Error('Canvas not initialized')
    }

    const transform = this.stage.getAbsoluteTransform()
    return transform.point(canvasPoint)
  }

  /**
   * Get the visible area in canvas coordinates
   */
  getVisibleArea(): Rectangle {
    if (!this.stage) {
      throw new Error('Canvas not initialized')
    }

    const size = this.stage.size()
    const topLeft = this.screenToCanvas({ x: 0, y: 0 })
    const bottomRight = this.screenToCanvas({ x: size.width, y: size.height })

    return {
      x: topLeft.x,
      y: topLeft.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y
    }
  }

  /**
   * Export canvas to data URL
   */
  toDataURL(options: CanvasExportOptions = { format: 'png' }): string {
    if (!this.stage) {
      throw new Error('Canvas not initialized')
    }

    return this.stage.toDataURL({
      mimeType: options.mimeType || `image/${options.format}`,
      quality: options.quality || 1,
      pixelRatio: options.pixelRatio || 1
    })
  }

  /**
   * Find nodes at a specific point
   */
  getNodesAtPoint(point: Point, shape?: (node: Konva.Node) => boolean): Konva.Node[] {
    if (!this.stage) {
      throw new Error('Canvas not initialized')
    }

    return this.stage.getIntersection(point, shape)
  }

  /**
   * Redraw all layers
   */
  draw(): void {
    if (!this.stage) {
      return
    }

    this.stage.batchDraw()
  }

  /**
   * Set up stage-level event handling
   */
  private setupStageEvents(): void {
    if (!this.stage) {
      return
    }

    // Prevent context menu on right click
    this.stage.on('contextmenu', (e) => {
      e.evt.preventDefault()
    })

    // Handle wheel events for zooming
    this.stage.on('wheel', (e) => {
      e.evt.preventDefault()

      const scaleBy = 1.05
      const stage = e.target.getStage()
      if (!stage) return

      const oldScale = stage.scaleX()
      const pointer = stage.getPointerPosition()
      if (!pointer) return

      const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy

      // Limit zoom range
      const clampedScale = Math.max(0.1, Math.min(5, newScale))
      this.setScale(clampedScale, pointer)
    })
  }

  /**
   * Clean up resources
   */
  destroy(): CleanupFunction {
    return () => {
      if (this.stage) {
        this.stage.destroy()
        this.stage = null
      }

      this.layers.clear()
      this.container = null
      this.config = null
    }
  }
}

// Singleton instance for the application
export const canvasService = new CanvasService()