/**
 * Geometric utility functions for spatial calculations
 * Pure functions for working with points, rectangles, and other shapes
 */

import type { Point, Rectangle, Circle, Line, Vector2D, BoundingBox, Polygon } from '../types'

// Point utilities
export const createPoint = (x: number, y: number): Point => ({ x, y })

export const addPoints = (a: Point, b: Point): Point => ({
  x: a.x + b.x,
  y: a.y + b.y
})

export const subtractPoints = (a: Point, b: Point): Point => ({
  x: a.x - b.x,
  y: a.y - b.y
})

export const scalePoint = (point: Point, scale: number): Point => ({
  x: point.x * scale,
  y: point.y * scale
})

export const distanceBetweenPoints = (a: Point, b: Point): number => {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return Math.sqrt(dx * dx + dy * dy)
}

export const angleBetweenPoints = (from: Point, to: Point): number => {
  return Math.atan2(to.y - from.y, to.x - from.x)
}

export const rotatePoint = (point: Point, angle: number, origin: Point = { x: 0, y: 0 }): Point => {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const dx = point.x - origin.x
  const dy = point.y - origin.y

  return {
    x: origin.x + dx * cos - dy * sin,
    y: origin.y + dx * sin + dy * cos
  }
}

// Rectangle utilities
export const createRectangle = (x: number, y: number, width: number, height: number): Rectangle => ({
  x,
  y,
  width,
  height
})

export const getRectangleCenter = (rect: Rectangle): Point => ({
  x: rect.x + rect.width / 2,
  y: rect.y + rect.height / 2
})

export const isPointInRectangle = (point: Point, rect: Rectangle): boolean => {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  )
}

export const doRectanglesOverlap = (a: Rectangle, b: Rectangle): boolean => {
  return !(
    a.x > b.x + b.width ||
    b.x > a.x + a.width ||
    a.y > b.y + b.height ||
    b.y > a.y + a.height
  )
}

export const getRectangleIntersection = (a: Rectangle, b: Rectangle): Rectangle | null => {
  const left = Math.max(a.x, b.x)
  const top = Math.max(a.y, b.y)
  const right = Math.min(a.x + a.width, b.x + b.width)
  const bottom = Math.min(a.y + a.height, b.y + b.height)

  if (left >= right || top >= bottom) {
    return null
  }

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top
  }
}

// Circle utilities
export const createCircle = (x: number, y: number, radius: number): Circle => ({
  x,
  y,
  radius
})

export const isPointInCircle = (point: Point, circle: Circle): boolean => {
  const distance = distanceBetweenPoints(point, circle)
  return distance <= circle.radius
}

export const doCirclesOverlap = (a: Circle, b: Circle): boolean => {
  const distance = distanceBetweenPoints(a, b)
  return distance <= a.radius + b.radius
}

// Line utilities
export const createLine = (start: Point, end: Point): Line => ({ start, end })

export const getLineLength = (line: Line): number => {
  return distanceBetweenPoints(line.start, line.end)
}

export const getPointOnLine = (line: Line, t: number): Point => {
  return {
    x: line.start.x + (line.end.x - line.start.x) * t,
    y: line.start.y + (line.end.y - line.start.y) * t
  }
}

export const getLineIntersection = (line1: Line, line2: Line): Point | null => {
  const x1 = line1.start.x
  const y1 = line1.start.y
  const x2 = line1.end.x
  const y2 = line1.end.y
  const x3 = line2.start.x
  const y3 = line2.start.y
  const x4 = line2.end.x
  const y4 = line2.end.y

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
  if (Math.abs(denom) < 1e-10) {
    return null // Lines are parallel
  }

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1)
    }
  }

  return null
}

// Bounding box utilities
export const getBoundingBox = (points: readonly Point[]): BoundingBox => {
  if (points.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }

  let minX = points[0].x
  let minY = points[0].y
  let maxX = points[0].x
  let maxY = points[0].y

  for (const point of points) {
    minX = Math.min(minX, point.x)
    minY = Math.min(minY, point.y)
    maxX = Math.max(maxX, point.x)
    maxY = Math.max(maxY, point.y)
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  }
}

// Vector utilities
export const normalizeVector = (vector: Vector2D): Vector2D => {
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y)
  if (length === 0) return { x: 0, y: 0 }
  return { x: vector.x / length, y: vector.y / length }
}

export const dotProduct = (a: Vector2D, b: Vector2D): number => {
  return a.x * b.x + a.y * b.y
}

export const crossProduct = (a: Vector2D, b: Vector2D): number => {
  return a.x * b.y - a.y * b.x
}

// Polygon utilities
export const isPointInPolygon = (point: Point, polygon: Polygon): boolean => {
  let inside = false
  const { points } = polygon

  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i].x
    const yi = points[i].y
    const xj = points[j].x
    const yj = points[j].y

    if (((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }

  return inside
}

// Utility constants
export const ORIGIN: Point = { x: 0, y: 0 }
export const UNIT_X: Vector2D = { x: 1, y: 0 }
export const UNIT_Y: Vector2D = { x: 0, y: 1 }