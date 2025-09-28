/**
 * Tool Types - Canvas tool integration and interaction types
 *
 * Types for integrating drawing tools, selection tools, and other
 * interactive tools with the atomic Canvas system.
 */

import type { Point, Rectangle } from '@/types/geometry'
import type { CanvasEventData } from './canvas'

/**
 * Tool Configuration
 * Configuration for canvas tools
 */
export interface ToolConfig {
  readonly id: string
  readonly name: string
  readonly type: ToolType
  readonly cursor: ToolCursor
  readonly settings: Partial<ToolSettings>
  readonly keyboardShortcuts: readonly string[]
  readonly enabled: boolean
}

/**
 * Tool State
 * Current state of a canvas tool
 */
export interface ToolState {
  readonly isActive: boolean
  readonly isUsing: boolean
  readonly startPosition: Point | null
  readonly currentPosition: Point | null
  readonly dragData: ToolDragData | null
  readonly selectionBounds: Rectangle | null
  readonly previewData: ToolPreviewData | null
}

/**
 * Tool Settings
 * Configurable settings for tools
 */
export interface ToolSettings {
  readonly strokeWidth: number
  readonly strokeColor: string
  readonly fillColor: string
  readonly opacity: number
  readonly blendMode: string
  readonly snapToGrid: boolean
  readonly constrainProportions: boolean
  readonly showPreview: boolean
}

/**
 * Tool Drag Data
 * Data for tool drag operations
 */
export interface ToolDragData {
  readonly startPosition: Point
  readonly currentPosition: Point
  readonly delta: Point
  readonly distance: number
  readonly angle: number
  readonly duration: number
  readonly velocity: Point
}

/**
 * Tool Preview Data
 * Data for tool preview rendering
 */
export interface ToolPreviewData {
  readonly type: ToolPreviewType
  readonly geometry: ToolGeometry
  readonly style: ToolStyle
  readonly opacity: number
  readonly animated: boolean
}

/**
 * Tool Geometry
 * Geometric data for tool operations
 */
export interface ToolGeometry {
  readonly type: ToolGeometryType
  readonly points: readonly Point[]
  readonly bounds: Rectangle
  readonly center: Point
  readonly radius?: number
  readonly angle?: number
}

/**
 * Tool Style
 * Styling information for tool rendering
 */
export interface ToolStyle {
  readonly stroke: string
  readonly strokeWidth: number
  readonly fill: string
  readonly opacity: number
  readonly dashArray: readonly number[]
  readonly lineCap: ToolLineCap
  readonly lineJoin: ToolLineJoin
}

/**
 * Tool Event Data
 * Event data specific to tool interactions
 */
export interface ToolEventData extends CanvasEventData {
  readonly tool: ToolConfig
  readonly state: ToolState
  readonly action: ToolAction
  readonly gesture: ToolGesture | null
}

/**
 * Tool Gesture
 * Gesture information for tool interactions
 */
export interface ToolGesture {
  readonly type: ToolGestureType
  readonly startPosition: Point
  readonly endPosition: Point
  readonly points: readonly Point[]
  readonly duration: number
  readonly velocity: Point
  readonly acceleration: Point
}

/**
 * Tool Result
 * Result of a tool operation
 */
export interface ToolResult {
  readonly success: boolean
  readonly objectId?: string
  readonly objects?: readonly any[]
  readonly bounds?: Rectangle
  readonly error?: string
  readonly metadata?: Record<string, any>
}

/**
 * Tool Cursor
 * Cursor configuration for tools
 */
export interface ToolCursor {
  readonly type: ToolCursorType
  readonly size: number
  readonly hotspot: Point
  readonly color: string
  readonly customIcon?: string
}

// Tool Type Definitions

export type ToolType =
  | 'select'
  | 'move'
  | 'draw'
  | 'erase'
  | 'text'
  | 'shape'
  | 'measure'
  | 'pan'
  | 'zoom'
  | 'eyedropper'

export type ToolAction =
  | 'start'
  | 'move'
  | 'end'
  | 'cancel'
  | 'complete'

export type ToolGestureType =
  | 'click'
  | 'drag'
  | 'swipe'
  | 'pinch'
  | 'rotate'
  | 'tap'
  | 'long-press'

export type ToolPreviewType =
  | 'cursor'
  | 'outline'
  | 'fill'
  | 'ghost'
  | 'guide'

export type ToolGeometryType =
  | 'point'
  | 'line'
  | 'rectangle'
  | 'circle'
  | 'polygon'
  | 'path'
  | 'text'

export type ToolCursorType =
  | 'default'
  | 'crosshair'
  | 'brush'
  | 'draw'
  | 'eraser'
  | 'text'
  | 'move'
  | 'resize'
  | 'zoom-in'
  | 'zoom-out'
  | 'custom'

export type ToolLineCap =
  | 'butt'
  | 'round'
  | 'square'

export type ToolLineJoin =
  | 'miter'
  | 'round'
  | 'bevel'

/**
 * Tool Handler Interface
 * Interface for tool event handlers
 */
export interface ToolHandler {
  readonly onStart: (event: ToolEventData) => ToolResult
  readonly onMove: (event: ToolEventData) => ToolResult
  readonly onEnd: (event: ToolEventData) => ToolResult
  readonly onCancel: (event: ToolEventData) => ToolResult
  readonly onKeyDown?: (event: KeyboardEvent) => boolean
  readonly onKeyUp?: (event: KeyboardEvent) => boolean
}

/**
 * Tool Registry Entry
 * Entry in the tool registry
 */
export interface ToolRegistryEntry {
  readonly config: ToolConfig
  readonly handler: ToolHandler
  readonly isRegistered: boolean
  readonly registrationTime: number
}

/**
 * Type guards for tool types
 */
export function isToolConfig(obj: any): obj is ToolConfig {
  return obj &&
         typeof obj.id === 'string' &&
         typeof obj.name === 'string' &&
         typeof obj.type === 'string'
}

export function isToolState(obj: any): obj is ToolState {
  return obj &&
         typeof obj.isActive === 'boolean' &&
         typeof obj.isUsing === 'boolean'
}

export function isToolEventData(obj: any): obj is ToolEventData {
  return obj &&
         typeof obj.tool === 'object' &&
         typeof obj.state === 'object' &&
         typeof obj.action === 'string'
}