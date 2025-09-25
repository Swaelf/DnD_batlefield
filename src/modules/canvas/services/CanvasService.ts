/**
 * Canvas Service - Core canvas management and rendering service
 *
 * Provides comprehensive canvas operations including rendering,
 * viewport management, and performance optimization.
 */

import Konva from 'konva'
import type {
  CanvasId,
  CanvasConfig,
  CanvasState,
  CanvasEventData,
  CanvasPerformance,
  CreateCanvasData,
  UpdateCanvasData
} from '../types'
import type { Point, Rectangle } from '@/types/geometry'

export class CanvasService {
  private static instance: CanvasService | null = null
  private canvases = new Map<CanvasId, CanvasInstance>()
  private performanceMetrics = new Map<CanvasId, CanvasPerformanceTracker>()

  private constructor() {}

  static getInstance(): CanvasService {
    if (!CanvasService.instance) {
      CanvasService.instance = new CanvasService()
    }
    return CanvasService.instance
  }

  /**
   * Create a new canvas instance
   */
  createCanvas(data: CreateCanvasData): CanvasInstance {
    const id = `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as CanvasId

    const config: CanvasConfig = {
      width: data.width,
      height: data.height,
      backgroundColor: data.backgroundColor || '#1a1a1a',
      pixelRatio: data.pixelRatio || window.devicePixelRatio || 1,
      enableHighDPI: data.enableHighDPI ?? true,
      enableHitDetection: true,
      enableCaching: true,
      maxCacheSize: 50 * 1024 * 1024, // 50MB
      renderOnDemand: true
    }

    const stage = new Konva.Stage({
      container: data.container || document.body,
      width: config.width,
      height: config.height,
      pixelRatio: config.pixelRatio
    })

    const state: CanvasState = {
      viewport: {
        bounds: {
          minX: 0,
          minY: 0,
          maxX: config.width,
          maxY: config.height
        },
        visibleArea: {
          x: 0,
          y: 0,
          width: config.width,
          height: config.height
        },
        scale: 1,
        offset: { x: 0, y: 0 },
        rotation: 0
      },
      zoom: 1,
      pan: { x: 0, y: 0 },
      isDragging: false,
      isZooming: false,
      isSelecting: false,
      selectionBounds: null,
      cursor: {
        type: 'default',
        position: { x: 0, y: 0 },
        isVisible: true
      },
      performance: {
        fps: 60,
        frameTime: 16.67,
        objectCount: 0,
        visibleObjectCount: 0,
        cacheHitRatio: 0,
        memoryUsage: 0,
        lastRenderTime: 0
      }
    }

    const canvas: CanvasInstance = {
      id,
      config,
      state,
      stage,
      layers: new Map(),
      bounds: {
        x: 0,
        y: 0,
        width: config.width,
        height: config.height
      },
      isDestroyed: false,
      createdAt: Date.now()
    }

    this.canvases.set(id, canvas)
    this.performanceMetrics.set(id, new CanvasPerformanceTracker(id))

    return canvas
  }

  /**
   * Get canvas instance by ID
   */
  getCanvas(id: CanvasId): CanvasInstance | null {
    return this.canvases.get(id) || null
  }

  /**
   * Update canvas configuration
   */
  updateCanvas(id: CanvasId, data: UpdateCanvasData): boolean {
    const canvas = this.getCanvas(id)
    if (!canvas) return false

    if (data.config) {
      Object.assign(canvas.config, data.config)

      // Apply stage updates
      if (data.config.width !== undefined || data.config.height !== undefined) {
        canvas.stage.size({
          width: canvas.config.width,
          height: canvas.config.height
        })
      }
    }

    if (data.viewport) {
      Object.assign(canvas.state.viewport, data.viewport)
    }

    if (data.cursor) {
      Object.assign(canvas.state.cursor, data.cursor)
    }

    if (data.performance) {
      Object.assign(canvas.state.performance, data.performance)
    }

    return true
  }

  /**
   * Destroy canvas instance
   */
  destroyCanvas(id: CanvasId): boolean {
    const canvas = this.getCanvas(id)
    if (!canvas) return false

    // Clean up Konva stage
    canvas.stage.destroy()
    canvas.isDestroyed = true

    // Remove from maps
    this.canvases.delete(id)
    this.performanceMetrics.delete(id)

    return true
  }

  /**
   * Render canvas
   */
  render(id: CanvasId, force = false): boolean {
    const canvas = this.getCanvas(id)
    if (!canvas || canvas.isDestroyed) return false

    const tracker = this.performanceMetrics.get(id)
    if (tracker) {
      tracker.startFrame()
    }

    try {
      canvas.stage.batchDraw()

      if (tracker) {
        tracker.endFrame()
        canvas.state.performance = tracker.getMetrics()
      }

      return true
    } catch (error) {
      console.error('Canvas render error:', error)
      return false
    }
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  screenToWorld(id: CanvasId, screenPoint: Point): Point | null {
    const canvas = this.getCanvas(id)
    if (!canvas) return null

    const stage = canvas.stage
    const transform = stage.getAbsoluteTransform().copy().invert()

    return transform.point(screenPoint)
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  worldToScreen(id: CanvasId, worldPoint: Point): Point | null {
    const canvas = this.getCanvas(id)
    if (!canvas) return null

    const stage = canvas.stage
    const transform = stage.getAbsoluteTransform()

    return transform.point(worldPoint)
  }

  /**
   * Get visible bounds in world coordinates
   */
  getVisibleBounds(id: CanvasId): Rectangle | null {
    const canvas = this.getCanvas(id)
    if (!canvas) return null

    const stage = canvas.stage
    const scale = stage.scaleX()
    const pos = stage.position()

    return {
      x: -pos.x / scale,
      y: -pos.y / scale,
      width: canvas.config.width / scale,
      height: canvas.config.height / scale
    }
  }

  /**
   * Set viewport to fit bounds
   */
  fitToBounds(id: CanvasId, bounds: Rectangle, padding = 50): boolean {
    const canvas = this.getCanvas(id)
    if (!canvas) return false

    const stage = canvas.stage
    const stageWidth = canvas.config.width
    const stageHeight = canvas.config.height

    // Calculate scale to fit bounds with padding
    const scaleX = (stageWidth - padding * 2) / bounds.width
    const scaleY = (stageHeight - padding * 2) / bounds.height
    const scale = Math.min(scaleX, scaleY, 1) // Don't zoom in beyond 100%

    // Calculate position to center bounds
    const x = (stageWidth - bounds.width * scale) / 2 - bounds.x * scale
    const y = (stageHeight - bounds.height * scale) / 2 - bounds.y * scale

    stage.scale({ x: scale, y: scale })
    stage.position({ x, y })

    // Update state
    canvas.state.zoom = scale
    canvas.state.pan = { x, y }
    canvas.state.viewport.scale = scale
    canvas.state.viewport.offset = { x, y }

    this.render(id)
    return true
  }

  /**
   * Export canvas to image
   */
  exportToImage(
    id: CanvasId,
    format: 'png' | 'jpeg' = 'png',
    quality = 1,
    bounds?: Rectangle
  ): string | null {
    const canvas = this.getCanvas(id)
    if (!canvas) return null

    try {
      let dataURL: string

      if (bounds) {
        // Export specific bounds
        dataURL = canvas.stage.toDataURL({
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          mimeType: `image/${format}`,
          quality
        })
      } else {
        // Export entire stage
        dataURL = canvas.stage.toDataURL({
          mimeType: `image/${format}`,
          quality
        })
      }

      return dataURL
    } catch (error) {
      console.error('Export error:', error)
      return null
    }
  }

  /**
   * Get performance metrics
   */
  getPerformance(id: CanvasId): CanvasPerformance | null {
    const tracker = this.performanceMetrics.get(id)
    return tracker ? tracker.getMetrics() : null
  }

  /**
   * Clear all cached data for a canvas
   */
  clearCache(id: CanvasId): boolean {
    const canvas = this.getCanvas(id)
    if (!canvas) return false

    canvas.stage.clearCache()
    return true
  }

  /**
   * Get all canvas instances
   */
  getAllCanvases(): CanvasInstance[] {
    return Array.from(this.canvases.values())
  }
}

/**
 * Canvas Instance
 * Complete canvas instance with all associated data
 */
interface CanvasInstance {
  readonly id: CanvasId
  readonly config: CanvasConfig
  readonly state: CanvasState
  readonly stage: Konva.Stage
  readonly layers: Map<string, Konva.Layer>
  readonly bounds: Rectangle
  readonly isDestroyed: boolean
  readonly createdAt: number
}

/**
 * Canvas Performance Tracker
 * Tracks performance metrics for canvas rendering
 */
class CanvasPerformanceTracker {
  private canvasId: CanvasId
  private frameStartTime = 0
  private frameCount = 0
  private lastSecond = 0
  private fps = 60
  private frameTime = 16.67
  private objectCount = 0
  private visibleObjectCount = 0
  private memoryUsage = 0

  constructor(canvasId: CanvasId) {
    this.canvasId = canvasId
  }

  startFrame(): void {
    this.frameStartTime = performance.now()
  }

  endFrame(): void {
    const now = performance.now()
    this.frameTime = now - this.frameStartTime
    this.frameCount++

    // Update FPS every second
    if (now - this.lastSecond >= 1000) {
      this.fps = this.frameCount
      this.frameCount = 0
      this.lastSecond = now
    }

    // Update memory usage estimate
    this.memoryUsage = this.estimateMemoryUsage()
  }

  setObjectCounts(total: number, visible: number): void {
    this.objectCount = total
    this.visibleObjectCount = visible
  }

  private estimateMemoryUsage(): number {
    // Rough estimate based on object count and canvas size
    return (this.objectCount * 1024) + (this.visibleObjectCount * 2048)
  }

  getMetrics(): CanvasPerformance {
    return {
      fps: this.fps,
      frameTime: this.frameTime,
      objectCount: this.objectCount,
      visibleObjectCount: this.visibleObjectCount,
      cacheHitRatio: 0.85, // Placeholder
      memoryUsage: this.memoryUsage,
      lastRenderTime: performance.now()
    }
  }
}