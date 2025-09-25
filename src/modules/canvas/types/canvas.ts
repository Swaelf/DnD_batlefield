/**
 * Canvas Types - Core canvas and rendering type definitions
 *
 * Comprehensive types for canvas state, rendering configuration,
 * and performance management in the atomic Canvas system.
 */

import type { Point, Rectangle, Bounds } from '@/types/geometry'

// Branded types for compile-time safety
export type CanvasId = string & { readonly _brand: 'CanvasId' }
export type LayerId = string & { readonly _brand: 'LayerId' }
export type StageId = string & { readonly _brand: 'StageId' }

/**
 * Canvas Configuration
 * Core settings for canvas rendering and behavior
 */
export interface CanvasConfig {
  readonly width: number
  readonly height: number
  readonly backgroundColor: string
  readonly pixelRatio: number
  readonly enableHighDPI: boolean
  readonly enableHitDetection: boolean
  readonly enableCaching: boolean
  readonly maxCacheSize: number
  readonly renderOnDemand: boolean
}

/**
 * Canvas State
 * Current state of the canvas including viewport and selection
 */
export interface CanvasState {
  readonly viewport: CanvasViewport
  readonly zoom: number
  readonly pan: Point
  readonly isDragging: boolean
  readonly isZooming: boolean
  readonly isSelecting: boolean
  readonly selectionBounds: Rectangle | null
  readonly cursor: CanvasCursor
  readonly performance: CanvasPerformance
}

/**
 * Canvas Viewport
 * Viewport information for rendering optimization
 */
export interface CanvasViewport {
  readonly bounds: Bounds
  readonly visibleArea: Rectangle
  readonly scale: number
  readonly offset: Point
  readonly rotation: number
}

/**
 * Canvas Cursor
 * Cursor state and configuration
 */
export interface CanvasCursor {
  readonly type: CanvasCursorType
  readonly position: Point
  readonly isVisible: boolean
  readonly customStyle?: string
}

/**
 * Canvas Performance Metrics
 * Real-time performance tracking for optimization
 */
export interface CanvasPerformance {
  readonly fps: number
  readonly frameTime: number
  readonly objectCount: number
  readonly visibleObjectCount: number
  readonly cacheHitRatio: number
  readonly memoryUsage: number
  readonly lastRenderTime: number
}

// Enums and Union Types
export type CanvasCursorType =
  | 'default'
  | 'crosshair'
  | 'move'
  | 'resize'
  | 'grab'
  | 'grabbing'
  | 'text'
  | 'draw'
  | 'erase'
  | 'zoom-in'
  | 'zoom-out'
  | 'not-allowed'

export type CanvasRenderQuality =
  | 'low'
  | 'medium'
  | 'high'
  | 'ultra'

export type CanvasExportFormat =
  | 'png'
  | 'jpeg'
  | 'webp'
  | 'svg'
  | 'pdf'

/**
 * Canvas Event Data
 * Event information for canvas interactions
 */
export interface CanvasEventData {
  readonly position: Point
  readonly stagePosition: Point
  readonly worldPosition: Point
  readonly target: CanvasEventTarget | null
  readonly modifiers: CanvasEventModifiers
  readonly timestamp: number
}

/**
 * Canvas Event Target
 * Information about the target of a canvas event
 */
export interface CanvasEventTarget {
  readonly id: string
  readonly type: string
  readonly layer: LayerId
  readonly bounds: Rectangle
  readonly zIndex: number
}

/**
 * Canvas Event Modifiers
 * Modifier keys pressed during canvas events
 */
export interface CanvasEventModifiers {
  readonly shift: boolean
  readonly ctrl: boolean
  readonly alt: boolean
  readonly meta: boolean
}