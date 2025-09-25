/**
 * Layer Service - Canvas layer management and composition service
 *
 * Provides comprehensive layer operations including creation,
 * ordering, visibility management, and performance optimization.
 */

import Konva from 'konva'
import type {
  LayerId,
  LayerConfig,
  LayerState,
  LayerInstance,
  LayerManagerState,
  CreateLayerData,
  UpdateLayerData,
  LayerType,
  LayerBatchUpdate,
  LayerPerformance
} from '../types'
import type { Point, Rectangle } from '@/types/geometry'
import type { MapObject } from '@/types/map'

export class LayerService {
  private static instance: LayerService | null = null
  private layerManagers = new Map<string, LayerManager>()

  private constructor() {}

  static getInstance(): LayerService {
    if (!LayerService.instance) {
      LayerService.instance = new LayerService()
    }
    return LayerService.instance
  }

  /**
   * Create a layer manager for a canvas
   */
  createLayerManager(canvasId: string, stage: Konva.Stage): LayerManager {
    const manager = new LayerManager(canvasId, stage)
    this.layerManagers.set(canvasId, manager)
    return manager
  }

  /**
   * Get layer manager for a canvas
   */
  getLayerManager(canvasId: string): LayerManager | null {
    return this.layerManagers.get(canvasId) || null
  }

  /**
   * Destroy layer manager
   */
  destroyLayerManager(canvasId: string): boolean {
    const manager = this.layerManagers.get(canvasId)
    if (!manager) return false

    manager.destroy()
    this.layerManagers.delete(canvasId)
    return true
  }

  /**
   * Get all layer managers
   */
  getAllLayerManagers(): LayerManager[] {
    return Array.from(this.layerManagers.values())
  }
}

/**
 * Layer Manager
 * Manages layers for a specific canvas
 */
export class LayerManager {
  private canvasId: string
  private stage: Konva.Stage
  private layers = new Map<LayerId, LayerInstance>()
  private renderOrder: LayerId[] = []
  private activeLayer: LayerId | null = null
  private visibleLayers = new Set<LayerId>()
  private lockedLayers = new Set<LayerId>()

  constructor(canvasId: string, stage: Konva.Stage) {
    this.canvasId = canvasId
    this.stage = stage
    this.createDefaultLayers()
  }

  /**
   * Create default layers (background, grid, objects, ui, overlay)
   */
  private createDefaultLayers(): void {
    const defaultLayers: Array<{ type: LayerType; zIndex: number }> = [
      { type: 'background', zIndex: 0 },
      { type: 'grid', zIndex: 10 },
      { type: 'objects', zIndex: 20 },
      { type: 'ui', zIndex: 30 },
      { type: 'overlay', zIndex: 40 }
    ]

    defaultLayers.forEach(({ type, zIndex }) => {
      this.createLayer({
        name: type,
        type,
        zIndex,
        visible: true,
        interactive: type === 'objects' || type === 'ui'
      })
    })

    // Set objects layer as active by default
    const objectsLayer = Array.from(this.layers.values()).find(
      layer => layer.config.name === 'objects'
    )
    if (objectsLayer) {
      this.activeLayer = objectsLayer.config.id
    }
  }

  /**
   * Create a new layer
   */
  createLayer(data: CreateLayerData): LayerInstance {
    const id = `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as LayerId

    const config: LayerConfig = {
      id,
      name: data.name,
      zIndex: data.zIndex || 0,
      visible: data.visible ?? true,
      opacity: data.opacity || 1,
      blendMode: data.blendMode || 'normal',
      cacheable: data.cacheable ?? true,
      interactive: data.interactive ?? false,
      clipBounds: data.clipBounds || null
    }

    const konvaLayer = new Konva.Layer({
      visible: config.visible,
      opacity: config.opacity,
      listening: config.interactive
    })

    const state: LayerState = {
      objects: [],
      bounds: { x: 0, y: 0, width: 0, height: 0 },
      isDirty: false,
      lastUpdate: Date.now(),
      renderCount: 0,
      cacheStatus: 'none'
    }

    const layer: LayerInstance = {
      config,
      state,
      konvaLayer,
      renderBounds: { x: 0, y: 0, width: 0, height: 0 },
      clipPath: null
    }

    // Add to stage at correct z-index
    this.stage.add(konvaLayer)
    this.updateLayerOrder()

    this.layers.set(id, layer)
    this.renderOrder.push(id)
    this.renderOrder.sort((a, b) => {
      const layerA = this.layers.get(a)
      const layerB = this.layers.get(b)
      return (layerA?.config.zIndex || 0) - (layerB?.config.zIndex || 0)
    })

    if (config.visible) {
      this.visibleLayers.add(id)
    }

    return layer
  }

  /**
   * Get layer by ID
   */
  getLayer(id: LayerId): LayerInstance | null {
    return this.layers.get(id) || null
  }

  /**
   * Get layer by name
   */
  getLayerByName(name: string): LayerInstance | null {
    for (const layer of this.layers.values()) {
      if (layer.config.name === name) {
        return layer
      }
    }
    return null
  }

  /**
   * Get layer by type
   */
  getLayersByType(type: LayerType): LayerInstance[] {
    return Array.from(this.layers.values()).filter(
      layer => layer.config.name === type
    )
  }

  /**
   * Update layer configuration
   */
  updateLayer(id: LayerId, data: UpdateLayerData): boolean {
    const layer = this.getLayer(id)
    if (!layer) return false

    // Update config
    if (data.name !== undefined) layer.config.name = data.name
    if (data.zIndex !== undefined) {
      layer.config.zIndex = data.zIndex
      this.updateLayerOrder()
    }
    if (data.visible !== undefined) {
      layer.config.visible = data.visible
      layer.konvaLayer.visible(data.visible)
      if (data.visible) {
        this.visibleLayers.add(id)
      } else {
        this.visibleLayers.delete(id)
      }
    }
    if (data.opacity !== undefined) {
      layer.config.opacity = data.opacity
      layer.konvaLayer.opacity(data.opacity)
    }
    if (data.blendMode !== undefined) {
      layer.config.blendMode = data.blendMode
      // Apply blend mode if supported
    }
    if (data.interactive !== undefined) {
      layer.config.interactive = data.interactive
      layer.konvaLayer.listening(data.interactive)
    }
    if (data.clipBounds !== undefined) {
      layer.config.clipBounds = data.clipBounds
      this.updateLayerClipping(layer)
    }

    layer.state.isDirty = true
    layer.state.lastUpdate = Date.now()

    return true
  }

  /**
   * Delete layer
   */
  deleteLayer(id: LayerId): boolean {
    const layer = this.getLayer(id)
    if (!layer) return false

    // Remove from stage
    layer.konvaLayer.destroy()

    // Remove from collections
    this.layers.delete(id)
    this.renderOrder = this.renderOrder.filter(layerId => layerId !== id)
    this.visibleLayers.delete(id)
    this.lockedLayers.delete(id)

    if (this.activeLayer === id) {
      this.activeLayer = this.renderOrder[0] || null
    }

    return true
  }

  /**
   * Set active layer
   */
  setActiveLayer(id: LayerId): boolean {
    if (!this.layers.has(id)) return false
    this.activeLayer = id
    return true
  }

  /**
   * Get active layer
   */
  getActiveLayer(): LayerInstance | null {
    return this.activeLayer ? this.getLayer(this.activeLayer) : null
  }

  /**
   * Add object to layer
   */
  addObjectToLayer(layerId: LayerId, object: MapObject, konvaNode: Konva.Node): boolean {
    const layer = this.getLayer(layerId)
    if (!layer) return false

    // Add Konva node to layer
    layer.konvaLayer.add(konvaNode)

    // Update layer state
    const layerObject = {
      id: object.id,
      object,
      bounds: this.calculateObjectBounds(konvaNode),
      visible: true,
      zIndex: object.layer || 0,
      lastUpdate: Date.now()
    }

    layer.state.objects = [...layer.state.objects, layerObject]
    layer.state.isDirty = true
    layer.state.lastUpdate = Date.now()

    this.updateLayerBounds(layer)
    return true
  }

  /**
   * Remove object from layer
   */
  removeObjectFromLayer(layerId: LayerId, objectId: string): boolean {
    const layer = this.getLayer(layerId)
    if (!layer) return false

    // Remove from Konva layer
    const node = layer.konvaLayer.findOne(`#${objectId}`)
    if (node) {
      node.destroy()
    }

    // Update layer state
    layer.state.objects = layer.state.objects.filter(obj => obj.id !== objectId)
    layer.state.isDirty = true
    layer.state.lastUpdate = Date.now()

    this.updateLayerBounds(layer)
    return true
  }

  /**
   * Move object between layers
   */
  moveObjectToLayer(fromLayerId: LayerId, toLayerId: LayerId, objectId: string): boolean {
    const fromLayer = this.getLayer(fromLayerId)
    const toLayer = this.getLayer(toLayerId)
    if (!fromLayer || !toLayer) return false

    // Find object
    const objectData = fromLayer.state.objects.find(obj => obj.id === objectId)
    const konvaNode = fromLayer.konvaLayer.findOne(`#${objectId}`)
    if (!objectData || !konvaNode) return false

    // Remove from source layer
    konvaNode.remove()
    fromLayer.state.objects = fromLayer.state.objects.filter(obj => obj.id !== objectId)

    // Add to target layer
    toLayer.konvaLayer.add(konvaNode)
    toLayer.state.objects = [...toLayer.state.objects, objectData]

    // Update both layers
    fromLayer.state.isDirty = true
    fromLayer.state.lastUpdate = Date.now()
    toLayer.state.isDirty = true
    toLayer.state.lastUpdate = Date.now()

    this.updateLayerBounds(fromLayer)
    this.updateLayerBounds(toLayer)

    return true
  }

  /**
   * Update layer rendering order
   */
  private updateLayerOrder(): void {
    this.renderOrder.sort((a, b) => {
      const layerA = this.layers.get(a)
      const layerB = this.layers.get(b)
      return (layerA?.config.zIndex || 0) - (layerB?.config.zIndex || 0)
    })

    // Update Konva stage order
    this.renderOrder.forEach((layerId, index) => {
      const layer = this.layers.get(layerId)
      if (layer) {
        layer.konvaLayer.zIndex(index)
      }
    })
  }

  /**
   * Update layer clipping
   */
  private updateLayerClipping(layer: LayerInstance): void {
    if (layer.config.clipBounds) {
      const { x, y, width, height } = layer.config.clipBounds
      layer.konvaLayer.clip({
        x,
        y,
        width,
        height
      })
    } else {
      layer.konvaLayer.clip(null)
    }
  }

  /**
   * Calculate bounds for an object
   */
  private calculateObjectBounds(node: Konva.Node): Rectangle {
    const rect = node.getClientRect()
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    }
  }

  /**
   * Update layer bounds based on contained objects
   */
  private updateLayerBounds(layer: LayerInstance): void {
    if (layer.state.objects.length === 0) {
      layer.state.bounds = { x: 0, y: 0, width: 0, height: 0 }
      return
    }

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    layer.state.objects.forEach(obj => {
      const bounds = obj.bounds
      minX = Math.min(minX, bounds.x)
      minY = Math.min(minY, bounds.y)
      maxX = Math.max(maxX, bounds.x + bounds.width)
      maxY = Math.max(maxY, bounds.y + bounds.height)
    })

    layer.state.bounds = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }

  /**
   * Get layer manager state
   */
  getState(): LayerManagerState {
    return {
      layers: new Map(this.layers),
      renderOrder: [...this.renderOrder],
      activeLayer: this.activeLayer,
      visibleLayers: new Set(this.visibleLayers),
      lockedLayers: new Set(this.lockedLayers)
    }
  }

  /**
   * Lock/unlock layer
   */
  setLayerLocked(id: LayerId, locked: boolean): boolean {
    if (!this.layers.has(id)) return false

    if (locked) {
      this.lockedLayers.add(id)
    } else {
      this.lockedLayers.delete(id)
    }

    const layer = this.layers.get(id)
    if (layer) {
      layer.konvaLayer.listening(!locked && layer.config.interactive)
    }

    return true
  }

  /**
   * Check if layer is locked
   */
  isLayerLocked(id: LayerId): boolean {
    return this.lockedLayers.has(id)
  }

  /**
   * Get all visible layers
   */
  getVisibleLayers(): LayerInstance[] {
    return Array.from(this.visibleLayers)
      .map(id => this.layers.get(id))
      .filter(Boolean) as LayerInstance[]
  }

  /**
   * Destroy layer manager
   */
  destroy(): void {
    this.layers.forEach(layer => {
      layer.konvaLayer.destroy()
    })
    this.layers.clear()
    this.renderOrder = []
    this.visibleLayers.clear()
    this.lockedLayers.clear()
    this.activeLayer = null
  }
}