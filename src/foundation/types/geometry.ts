/**
 * Foundation geometric types used throughout the application
 * These types define the basic spatial primitives for the MapMaker
 */

export type Point = {
  readonly x: number
  readonly y: number
}

export type Size = {
  readonly width: number
  readonly height: number
}

export type Rectangle = Point & Size

export type Circle = Point & {
  readonly radius: number
}

export type Line = {
  readonly start: Point
  readonly end: Point
}

export type Vector2D = Point

export type BoundingBox = Rectangle

export type Polygon = {
  readonly points: readonly Point[]
}

export type Transform = {
  readonly x: number
  readonly y: number
  readonly rotation: number
  readonly scaleX: number
  readonly scaleY: number
}

// Common geometric operations as types
export type GeometricOperation =
  | { type: 'translate'; delta: Vector2D }
  | { type: 'rotate'; angle: number; origin?: Point }
  | { type: 'scale'; factor: number | { x: number; y: number }; origin?: Point }