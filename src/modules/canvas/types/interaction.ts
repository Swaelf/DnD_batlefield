/**
 * Interaction Types - Canvas interaction and event handling types
 *
 * Types for managing user interactions, event handling, and
 * gesture recognition in the atomic Canvas system.
 */

import type { Point, Rectangle } from '@/types/geometry'
import type { CanvasEventData, CanvasEventModifiers } from './canvas'

/**
 * Interaction State
 * Current state of canvas interactions
 */
export interface InteractionState {
  readonly isInteracting: boolean
  readonly activeInteraction: InteractionType | null
  readonly startPosition: Point | null
  readonly currentPosition: Point | null
  readonly lastPosition: Point | null
  readonly modifiers: CanvasEventModifiers
  readonly timestamp: number
}

/**
 * Interaction Handler
 * Handler for canvas interaction events
 */
export interface InteractionHandler {
  readonly type: InteractionType
  readonly priority: number
  readonly handleEvent: (event: InteractionEvent) => InteractionResult
  readonly canHandle: (event: InteractionEvent) => boolean
  readonly isEnabled: boolean
}

/**
 * Interaction Event
 * Event data for canvas interactions
 */
export interface InteractionEvent {
  readonly type: InteractionEventType
  readonly canvasEvent: CanvasEventData
  readonly interaction: InteractionType
  readonly phase: InteractionPhase
  readonly gesture: GestureData | null
  readonly consumed: boolean
}

/**
 * Interaction Result
 * Result of an interaction handler
 */
export interface InteractionResult {
  readonly handled: boolean
  readonly consumeEvent: boolean
  readonly preventDefault: boolean
  readonly stopPropagation: boolean
  readonly data?: any
}

/**
 * Gesture Data
 * Data for gesture recognition
 */
export interface GestureData {
  readonly type: GestureType
  readonly state: GestureState
  readonly startPosition: Point
  readonly currentPosition: Point
  readonly velocity: Point
  readonly acceleration: Point
  readonly duration: number
  readonly distance: number
  readonly angle: number
  readonly scale: number
  readonly rotation: number
}

/**
 * Multi-Touch Data
 * Data for multi-touch interactions
 */
export interface MultiTouchData {
  readonly touches: readonly TouchData[]
  readonly center: Point
  readonly spread: number
  readonly angle: number
  readonly scale: number
  readonly rotation: number
  readonly isMultiTouch: boolean
}

/**
 * Touch Data
 * Individual touch point data
 */
export interface TouchData {
  readonly id: number
  readonly position: Point
  readonly startPosition: Point
  readonly velocity: Point
  readonly force: number
  readonly radiusX: number
  readonly radiusY: number
  readonly rotationAngle: number
  readonly timestamp: number
}

/**
 * Hit Test Result
 * Result of hit testing for interactions
 */
export interface HitTestResult {
  readonly hit: boolean
  readonly objectId: string | null
  readonly position: Point
  readonly distance: number
  readonly layer: string
  readonly metadata?: any
}

/**
 * Selection Data
 * Data for selection interactions
 */
export interface SelectionData {
  readonly type: SelectionType
  readonly objects: readonly string[]
  readonly bounds: Rectangle
  readonly center: Point
  readonly isMultiple: boolean
  readonly modifiers: CanvasEventModifiers
}

/**
 * Drag Data
 * Data for drag interactions
 */
export interface DragData {
  readonly objectId: string
  readonly startPosition: Point
  readonly currentPosition: Point
  readonly delta: Point
  readonly totalDelta: Point
  readonly velocity: Point
  readonly dragBounds: Rectangle | null
  readonly snapData: DragSnapData | null
}

/**
 * Drag Snap Data
 * Snapping information for drag operations
 */
export interface DragSnapData {
  readonly snapType: DragSnapType
  readonly snapTarget: Point
  readonly snapDistance: number
  readonly originalPosition: Point
  readonly snappedPosition: Point
}

/**
 * Hover Data
 * Data for hover interactions
 */
export interface HoverData {
  readonly objectId: string | null
  readonly position: Point
  readonly hoverTime: number
  readonly isHovering: boolean
  readonly metadata?: any
}

// Interaction Type Definitions

export type InteractionType =
  | 'select'
  | 'drag'
  | 'pan'
  | 'zoom'
  | 'rotate'
  | 'hover'
  | 'click'
  | 'doubleclick'
  | 'contextmenu'
  | 'draw'
  | 'measure'

export type InteractionEventType =
  | 'pointerdown'
  | 'pointermove'
  | 'pointerup'
  | 'pointercancel'
  | 'wheel'
  | 'keydown'
  | 'keyup'
  | 'focus'
  | 'blur'

export type InteractionPhase =
  | 'begin'
  | 'update'
  | 'end'
  | 'cancel'

export type GestureType =
  | 'tap'
  | 'double-tap'
  | 'long-press'
  | 'drag'
  | 'swipe'
  | 'pinch'
  | 'rotate'
  | 'pan'

export type GestureState =
  | 'possible'
  | 'began'
  | 'changed'
  | 'ended'
  | 'cancelled'
  | 'failed'

export type SelectionType =
  | 'single'
  | 'multiple'
  | 'rectangle'
  | 'lasso'
  | 'invert'

export type DragSnapType =
  | 'grid'
  | 'object'
  | 'guide'
  | 'edge'
  | 'none'

/**
 * Interaction Configuration
 * Configuration for interaction behavior
 */
export interface InteractionConfig {
  readonly enableSelection: boolean
  readonly enableDrag: boolean
  readonly enablePan: boolean
  readonly enableZoom: boolean
  readonly enableRotation: boolean
  readonly enableMultiTouch: boolean
  readonly enableGestures: boolean
  readonly enableKeyboardShortcuts: boolean
  readonly selectionTolerance: number
  readonly dragTolerance: number
  readonly doubleTapDelay: number
  readonly longPressDelay: number
}

/**
 * Interaction Manager State
 * State for managing canvas interactions
 */
export interface InteractionManagerState {
  readonly handlers: readonly InteractionHandler[]
  readonly activeInteractions: Map<InteractionType, InteractionState>
  readonly gestureRecognizers: readonly GestureRecognizer[]
  readonly config: InteractionConfig
  readonly lastEvent: InteractionEvent | null
}

/**
 * Gesture Recognizer
 * Interface for gesture recognition
 */
export interface GestureRecognizer {
  readonly gestureType: GestureType
  readonly minTouches: number
  readonly maxTouches: number
  readonly recognizeGesture: (events: readonly InteractionEvent[]) => GestureData | null
  readonly reset: () => void
}

/**
 * Type guards for interaction types
 */
export function isInteractionEvent(obj: any): obj is InteractionEvent {
  return obj &&
         typeof obj.type === 'string' &&
         typeof obj.canvasEvent === 'object' &&
         typeof obj.phase === 'string'
}

export function isGestureData(obj: any): obj is GestureData {
  return obj &&
         typeof obj.type === 'string' &&
         typeof obj.state === 'string' &&
         typeof obj.startPosition === 'object'
}

export function isHitTestResult(obj: any): obj is HitTestResult {
  return obj &&
         typeof obj.hit === 'boolean' &&
         typeof obj.position === 'object'
}