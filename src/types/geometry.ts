// Centralized geometric types for the MapMaker application

export type Point = {
  x: number
  y: number
}

export type Size = {
  width: number
  height: number
}

export type Rectangle = Point & Size

export type Circle = Point & {
  radius: number
}

export type Line = {
  start: Point
  end: Point
}

export type Vector2D = Point

// Utility types for geometric calculations
export type Bounds = {
  top: number
  left: number
  bottom: number
  right: number
}

export type Transform = {
  translation: Point
  rotation: number // in degrees
  scale: Point
}

// Type guards for geometric types
export const isPoint = (obj: unknown): obj is Point => {
  return typeof obj === 'object' && obj !== null &&
         typeof (obj as Point).x === 'number' &&
         typeof (obj as Point).y === 'number'
}

export const isRectangle = (obj: unknown): obj is Rectangle => {
  return isPoint(obj) &&
         typeof (obj as Rectangle).width === 'number' &&
         typeof (obj as Rectangle).height === 'number'
}

export const isCircle = (obj: unknown): obj is Circle => {
  return isPoint(obj) && typeof (obj as Circle).radius === 'number'
}