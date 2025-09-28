/**
 * Viewport Types - Canvas viewport and coordinate system types
 *
 * Types for managing viewport transformations, coordinate conversions,
 * and camera controls in the atomic Canvas system.
 */

import type { Point, Rectangle } from '@/types/geometry'

/**
 * Viewport Configuration
 * Configuration for viewport behavior and constraints
 */
export interface ViewportConfig {
  readonly minZoom: number
  readonly maxZoom: number
  readonly zoomStep: number
  readonly enablePanning: boolean
  readonly enableZooming: boolean
  readonly constrainPanning: boolean
  readonly smoothTransitions: boolean
  readonly transitionDuration: number
}

/**
 * Viewport State
 * Current state of the viewport transformation
 */
export interface ViewportState {
  readonly position: Point
  readonly zoom: number
  readonly rotation: number
  readonly bounds: Rectangle
  readonly worldBounds: Rectangle
  readonly isTransitioning: boolean
  readonly transitionId: string | null
}

/**
 * Viewport Transform
 * Complete transformation information
 */
export interface ViewportTransform {
  readonly scale: number
  readonly offset: Point
  readonly rotation: number
  readonly matrix: ViewportMatrix
  readonly inverse: ViewportMatrix
}

/**
 * Viewport Matrix
 * 2D transformation matrix for coordinate conversions
 */
export interface ViewportMatrix {
  readonly a: number // scale x
  readonly b: number // skew y
  readonly c: number // skew x
  readonly d: number // scale y
  readonly e: number // translate x
  readonly f: number // translate y
}

/**
 * Coordinate Conversion Result
 * Result of coordinate system conversion
 */
export interface CoordinateConversion {
  readonly source: Point
  readonly target: Point
  readonly sourceSpace: CoordinateSpace
  readonly targetSpace: CoordinateSpace
  readonly isValid: boolean
}

/**
 * Viewport Bounds
 * Different bound types for viewport calculations
 */
export interface ViewportBounds {
  readonly screen: Rectangle
  readonly world: Rectangle
  readonly content: Rectangle
  readonly visible: Rectangle
  readonly clipped: Rectangle
}

/**
 * Camera Control State
 * State for camera movement and animation
 */
export interface CameraState {
  readonly target: Point
  readonly position: Point
  readonly zoom: number
  readonly rotation: number
  readonly isAnimating: boolean
  readonly animationId: string | null
  readonly easing: CameraEasing
}

/**
 * Camera Animation
 * Animation configuration for smooth camera movements
 */
export interface CameraAnimation {
  readonly id: string
  readonly fromState: CameraKeyframe
  readonly toState: CameraKeyframe
  readonly duration: number
  readonly easing: CameraEasing
  readonly startTime: number
  readonly onComplete?: () => void
}

/**
 * Camera Keyframe
 * Keyframe data for camera animations
 */
export interface CameraKeyframe {
  readonly position: Point
  readonly zoom: number
  readonly rotation: number
  readonly timestamp: number
}

/**
 * Viewport Event Data
 * Event data for viewport changes
 */
export interface ViewportEventData {
  readonly type: ViewportEventType
  readonly position: Point
  readonly zoom: number
  readonly rotation: number
  readonly bounds: Rectangle
  readonly delta: ViewportDelta
  readonly source: ViewportEventSource
}

/**
 * Viewport Delta
 * Change information for viewport updates
 */
export interface ViewportDelta {
  readonly position: Point
  readonly zoom: number
  readonly rotation: number
  readonly time: number
}

/**
 * Pan Gesture Data
 * Data for pan gestures and interactions
 */
export interface PanGestureData {
  readonly startPosition: Point
  readonly currentPosition: Point
  readonly delta: Point
  readonly velocity: Point
  readonly isActive: boolean
  readonly duration: number
}

/**
 * Zoom Gesture Data
 * Data for zoom gestures and interactions
 */
export interface ZoomGestureData {
  readonly center: Point
  readonly startZoom: number
  readonly currentZoom: number
  readonly delta: number
  readonly velocity: number
  readonly isActive: boolean
}

// Viewport Type Definitions

export type CoordinateSpace =
  | 'screen'
  | 'stage'
  | 'world'
  | 'local'

export type ViewportEventType =
  | 'pan'
  | 'zoom'
  | 'rotate'
  | 'resize'
  | 'reset'

export type ViewportEventSource =
  | 'mouse'
  | 'touch'
  | 'keyboard'
  | 'api'
  | 'animation'

export type CameraEasing =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'bounce'
  | 'elastic'

export type ViewportConstraint =
  | 'none'
  | 'bounds'
  | 'content'
  | 'aspect-ratio'

/**
 * Viewport Update Data
 * Data for updating viewport state
 */
export interface UpdateViewportData {
  readonly position?: Point
  readonly zoom?: number
  readonly rotation?: number
  readonly animate?: boolean
  readonly duration?: number
  readonly easing?: CameraEasing
}

/**
 * Viewport Fit Options
 * Options for fitting content to viewport
 */
export interface ViewportFitOptions {
  readonly bounds: Rectangle
  readonly padding: number
  readonly maintainAspectRatio: boolean
  readonly animate: boolean
  readonly duration: number
  readonly easing: CameraEasing
}

/**
 * Type guards for viewport types
 */
export function isViewportState(obj: any): obj is ViewportState {
  return obj &&
         typeof obj.position === 'object' &&
         typeof obj.zoom === 'number' &&
         typeof obj.rotation === 'number' &&
         typeof obj.bounds === 'object'
}

export function isViewportTransform(obj: any): obj is ViewportTransform {
  return obj &&
         typeof obj.scale === 'number' &&
         typeof obj.offset === 'object' &&
         typeof obj.matrix === 'object'
}

/**
 * Utility functions for viewport calculations
 */
export function createViewportMatrix(
  scale: number,
  offset: Point,
  rotation: number = 0
): ViewportMatrix {
  const cos = Math.cos(rotation)
  const sin = Math.sin(rotation)

  return {
    a: scale * cos,
    b: scale * sin,
    c: -scale * sin,
    d: scale * cos,
    e: offset.x,
    f: offset.y
  }
}

export function invertViewportMatrix(matrix: ViewportMatrix): ViewportMatrix {
  const det = matrix.a * matrix.d - matrix.b * matrix.c

  if (Math.abs(det) < 1e-10) {
    // Singular matrix, return identity
    return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }
  }

  const invDet = 1 / det

  return {
    a: matrix.d * invDet,
    b: -matrix.b * invDet,
    c: -matrix.c * invDet,
    d: matrix.a * invDet,
    e: (matrix.c * matrix.f - matrix.d * matrix.e) * invDet,
    f: (matrix.b * matrix.e - matrix.a * matrix.f) * invDet
  }
}