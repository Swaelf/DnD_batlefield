/**
 * Layer Types - Canvas layer management and composition types
 *
 * Types for organizing and managing different rendering layers
 * in the atomic Canvas system for optimal performance.
 */

import type { Point, Rectangle } from '@/types/geometry'
import type { MapObject } from '@/types/map'
import type { LayerId } from './canvas'

/**
 * Layer Configuration
 * Configuration for individual canvas layers
 */
export interface LayerConfig {
  readonly id: LayerId
  readonly name: string
  readonly zIndex: number
  readonly visible: boolean
  readonly opacity: number
  readonly blendMode: LayerBlendMode
  readonly cacheable: boolean
  readonly interactive: boolean
  readonly clipBounds: Rectangle | null
}

/**
 * Layer State
 * Current state of a canvas layer
 */
export interface LayerState {
  readonly objects: readonly LayerObject[]
  readonly bounds: Rectangle
  readonly isDirty: boolean
  readonly lastUpdate: number
  readonly renderCount: number
  readonly cacheStatus: LayerCacheStatus
}

/**
 * Layer Object
 * Object contained within a layer
 */
export interface LayerObject {
  readonly id: string
  readonly object: MapObject
  readonly bounds: Rectangle
  readonly visible: boolean
  readonly zIndex: number
  readonly lastUpdate: number
}

/**
 * Layer Manager State
 * State for managing multiple layers
 */
export interface LayerManagerState {
  readonly layers: Map<LayerId, LayerInstance>
  readonly renderOrder: readonly LayerId[]
  readonly activeLayer: LayerId | null
  readonly visibleLayers: Set<LayerId>
  readonly lockedLayers: Set<LayerId>
}

/**
 * Layer Instance
 * Complete layer instance with config and state
 */
export interface LayerInstance {
  readonly config: LayerConfig
  readonly state: LayerState
  readonly konvaLayer: any // Konva.Layer
  readonly renderBounds: Rectangle
  readonly clipPath: LayerClipPath | null
}

/**
 * Layer Clip Path
 * Clipping configuration for layers
 */
export interface LayerClipPath {
  readonly type: LayerClipType
  readonly bounds: Rectangle
  readonly path?: Point[]
  readonly inverted: boolean
}

/**
 * Layer Render Context
 * Context information for layer rendering
 */
export interface LayerRenderContext {
  readonly viewport: Rectangle
  readonly scale: number
  readonly quality: LayerRenderQuality
  readonly cullObjects: boolean
  readonly enableCaching: boolean
  readonly frameId: number
}

/**
 * Layer Performance Metrics
 * Performance tracking for individual layers
 */
export interface LayerPerformance {
  readonly renderTime: number
  readonly objectCount: number
  readonly visibleObjectCount: number
  readonly cacheHitRatio: number
  readonly memoryUsage: number
  readonly lastFrameTime: number
}

// Layer Type Definitions

export type LayerType =
  | 'background'
  | 'grid'
  | 'objects'
  | 'ui'
  | 'overlay'
  | 'debug'

export type LayerBlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'

export type LayerCacheStatus =
  | 'none'
  | 'pending'
  | 'cached'
  | 'dirty'
  | 'error'

export type LayerClipType =
  | 'rectangle'
  | 'circle'
  | 'polygon'
  | 'path'

export type LayerRenderQuality =
  | 'draft'
  | 'normal'
  | 'high'

/**
 * Layer Creation Data
 * Data required to create a new layer
 */
export interface CreateLayerData {
  readonly name: string
  readonly type: LayerType
  readonly zIndex?: number
  readonly visible?: boolean
  readonly opacity?: number
  readonly blendMode?: LayerBlendMode
  readonly cacheable?: boolean
  readonly interactive?: boolean
  readonly clipBounds?: Rectangle
}

/**
 * Layer Update Data
 * Data for updating layer properties
 */
export interface UpdateLayerData {
  readonly name?: string
  readonly zIndex?: number
  readonly visible?: boolean
  readonly opacity?: number
  readonly blendMode?: LayerBlendMode
  readonly cacheable?: boolean
  readonly interactive?: boolean
  readonly clipBounds?: Rectangle | null
}

/**
 * Layer Object Update
 * Update information for objects in layers
 */
export interface LayerObjectUpdate {
  readonly objectId: string
  readonly bounds?: Rectangle
  readonly visible?: boolean
  readonly zIndex?: number
  readonly transform?: LayerObjectTransform
}

/**
 * Layer Object Transform
 * Transform information for layer objects
 */
export interface LayerObjectTransform {
  readonly position: Point
  readonly scale: Point
  readonly rotation: number
  readonly skew: Point
  readonly origin: Point
}

/**
 * Layer Batch Update
 * Batch update operations for performance
 */
export interface LayerBatchUpdate {
  readonly layerId: LayerId
  readonly operations: readonly LayerBatchOperation[]
  readonly invalidateCache: boolean
  readonly skipRender: boolean
}

/**
 * Layer Batch Operation
 * Individual operation in a batch update
 */
export interface LayerBatchOperation {
  readonly type: LayerOperationType
  readonly objectId: string
  readonly data: any
  readonly priority: number
}

export type LayerOperationType =
  | 'add'
  | 'remove'
  | 'update'
  | 'move'
  | 'transform'

/**
 * Type guards for layer types
 */
export function isLayerConfig(obj: any): obj is LayerConfig {
  return obj &&
         typeof obj.id === 'string' &&
         typeof obj.name === 'string' &&
         typeof obj.zIndex === 'number' &&
         typeof obj.visible === 'boolean'
}

export function isLayerInstance(obj: any): obj is LayerInstance {
  return obj &&
         isLayerConfig(obj.config) &&
         typeof obj.state === 'object' &&
         obj.konvaLayer
}