/**
 * Rendering Service - High-level rendering operations for the canvas module
 * Orchestrates the rendering of different object types and layers
 */

import type Konva from 'konva'
import type { Point, Rectangle } from '@/foundation/types'
import type { RenderContext, CanvasLayer, LayerConfig } from '../types'

export type RenderableObject = {
  id: string
  type: string
  layer: CanvasLayer
  position: Point
  visible: boolean
  render: (context: RenderContext) => Konva.Node | null
}

export class RenderingService {
  private layers: Map<CanvasLayer, Konva.Layer> = new Map()
  private objects: Map<string, RenderableObject> = new Map()

  /**
   * Initialize layers in the correct z-order
   */
  initializeLayers(stage: Konva.Stage, configs: LayerConfig[]): void {
    // Sort by z-index
    const sortedConfigs = [...configs].sort((a, b) => a.zIndex - b.zIndex)

    for (const config of sortedConfigs) {
      const layer = new Konva.Layer({
        name: config.name,
        visible: config.visible,
        listening: config.listening
      })

      layer.zIndex(config.zIndex)
      stage.add(layer)
      this.layers.set(config.name, layer)
    }
  }

  /**
   * Get a layer by name
   */
  getLayer(name: CanvasLayer): Konva.Layer | null {
    return this.layers.get(name) || null
  }

  /**
   * Add an object to be rendered
   */
  addObject(object: RenderableObject): void {
    this.objects.set(object.id, object)
    this.renderObject(object)
  }

  /**
   * Remove an object from rendering
   */
  removeObject(id: string): void {
    const object = this.objects.get(id)
    if (object) {
      const layer = this.layers.get(object.layer)
      if (layer) {
        const node = layer.findOne(`#${id}`)
        if (node) {
          node.destroy()
        }
      }
      this.objects.delete(id)
    }
  }

  /**
   * Update an object's rendering
   */
  updateObject(id: string, updates: Partial<RenderableObject>): void {
    const object = this.objects.get(id)
    if (!object) {
      return
    }

    // Remove old rendering
    this.removeObject(id)

    // Update object
    const updatedObject = { ...object, ...updates }
    this.objects.set(id, updatedObject)

    // Re-render
    this.renderObject(updatedObject)
  }

  /**
   * Render a single object
   */
  private renderObject(object: RenderableObject): void {
    if (!object.visible) {
      return
    }

    const layer = this.layers.get(object.layer)
    if (!layer) {
      console.warn(`Layer ${object.layer} not found for object ${object.id}`)
      return
    }

    const context: RenderContext = {
      stage: layer.getStage()!,
      layer,
      viewport: {
        position: { x: 0, y: 0 },
        scale: 1,
        bounds: { x: 0, y: 0, width: 1920, height: 1080 }
      },
      settings: {
        width: 1920,
        height: 1080,
        background: '#1A1A1A',
        grid: {
          size: 50,
          visible: true,
          snapEnabled: true,
          color: '#333',
          opacity: 0.5,
          type: 'square'
        },
        viewport: {
          position: { x: 0, y: 0 },
          scale: 1,
          bounds: { x: 0, y: 0, width: 1920, height: 1080 }
        }
      }
    }

    const node = object.render(context)
    if (node) {
      node.id(object.id)
      layer.add(node)
    }
  }

  /**
   * Render all objects in a specific layer
   */
  renderLayer(layerName: CanvasLayer): void {
    const layer = this.layers.get(layerName)
    if (!layer) {
      return
    }

    // Clear layer
    layer.destroyChildren()

    // Re-render all objects in this layer
    for (const object of this.objects.values()) {
      if (object.layer === layerName) {
        this.renderObject(object)
      }
    }

    layer.batchDraw()
  }

  /**
   * Render all objects
   */
  renderAll(): void {
    for (const layerName of this.layers.keys()) {
      this.renderLayer(layerName)
    }
  }

  /**
   * Get objects in a specific area
   */
  getObjectsInArea(area: Rectangle): RenderableObject[] {
    return Array.from(this.objects.values()).filter(object => {
      return this.isPointInArea(object.position, area)
    })
  }

  /**
   * Get object at a specific point
   */
  getObjectAtPoint(point: Point): RenderableObject | null {
    // Check from top layer down
    const sortedLayers = Array.from(this.layers.entries())
      .sort((a, b) => b[1].zIndex() - a[1].zIndex())

    for (const [layerName, layer] of sortedLayers) {
      const intersection = layer.getIntersection(point)
      if (intersection) {
        const objectId = intersection.id()
        return this.objects.get(objectId) || null
      }
    }

    return null
  }

  /**
   * Show/hide a layer
   */
  setLayerVisible(layerName: CanvasLayer, visible: boolean): void {
    const layer = this.layers.get(layerName)
    if (layer) {
      layer.visible(visible)
      layer.draw()
    }
  }

  /**
   * Enable/disable layer interaction
   */
  setLayerListening(layerName: CanvasLayer, listening: boolean): void {
    const layer = this.layers.get(layerName)
    if (layer) {
      layer.listening(listening)
    }
  }

  /**
   * Clear all objects from a layer
   */
  clearLayer(layerName: CanvasLayer): void {
    const layer = this.layers.get(layerName)
    if (layer) {
      layer.destroyChildren()
      layer.draw()
    }

    // Remove objects from tracking
    for (const [id, object] of this.objects.entries()) {
      if (object.layer === layerName) {
        this.objects.delete(id)
      }
    }
  }

  /**
   * Get all objects on a layer
   */
  getLayerObjects(layerName: CanvasLayer): RenderableObject[] {
    return Array.from(this.objects.values()).filter(
      object => object.layer === layerName
    )
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    for (const layer of this.layers.values()) {
      layer.destroy()
    }
    this.layers.clear()
    this.objects.clear()
  }

  /**
   * Helper to check if point is in area
   */
  private isPointInArea(point: Point, area: Rectangle): boolean {
    return (
      point.x >= area.x &&
      point.x <= area.x + area.width &&
      point.y >= area.y &&
      point.y <= area.y + area.height
    )
  }
}

// Singleton instance for the canvas module
export const renderingService = new RenderingService()