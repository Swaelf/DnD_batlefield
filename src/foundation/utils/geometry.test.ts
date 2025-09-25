/**
 * Geometry utility tests
 * Test all geometric calculations and transformations
 */

import { describe, it, expect } from 'vitest'
import {
  createPoint,
  addPoints,
  subtractPoints,
  distanceBetweenPoints,
  angleBetweenPoints,
  rotatePoint,
  createRectangle,
  getRectangleCenter,
  isPointInRectangle,
  doRectanglesOverlap,
  createCircle,
  isPointInCircle,
  doCirclesOverlap,
  normalizeVector,
  dotProduct,
  crossProduct
} from './geometry'

describe('Geometry Utils', () => {
  describe('Point operations', () => {
    it('creates points correctly', () => {
      const point = createPoint(10, 20)
      expect(point).toEqual({ x: 10, y: 20 })
    })

    it('adds points correctly', () => {
      const a = createPoint(10, 20)
      const b = createPoint(5, 15)
      const result = addPoints(a, b)
      expect(result).toEqual({ x: 15, y: 35 })
    })

    it('subtracts points correctly', () => {
      const a = createPoint(10, 20)
      const b = createPoint(5, 15)
      const result = subtractPoints(a, b)
      expect(result).toEqual({ x: 5, y: 5 })
    })

    it('calculates distance correctly', () => {
      const a = createPoint(0, 0)
      const b = createPoint(3, 4)
      const distance = distanceBetweenPoints(a, b)
      expect(distance).toBe(5) // 3-4-5 triangle
    })

    it('calculates angle correctly', () => {
      const a = createPoint(0, 0)
      const b = createPoint(1, 0) // 0 degrees
      const angle = angleBetweenPoints(a, b)
      expect(angle).toBe(0)

      const c = createPoint(0, 1) // 90 degrees
      const angle2 = angleBetweenPoints(a, c)
      expect(angle2).toBeCloseTo(Math.PI / 2)
    })

    it('rotates points correctly', () => {
      const point = createPoint(1, 0)
      const rotated = rotatePoint(point, Math.PI / 2) // 90 degrees
      expect(rotated.x).toBeCloseTo(0, 5)
      expect(rotated.y).toBeCloseTo(1, 5)
    })
  })

  describe('Rectangle operations', () => {
    it('creates rectangles correctly', () => {
      const rect = createRectangle(10, 20, 100, 200)
      expect(rect).toEqual({ x: 10, y: 20, width: 100, height: 200 })
    })

    it('calculates rectangle center', () => {
      const rect = createRectangle(0, 0, 100, 200)
      const center = getRectangleCenter(rect)
      expect(center).toEqual({ x: 50, y: 100 })
    })

    it('detects point in rectangle', () => {
      const rect = createRectangle(0, 0, 100, 100)

      expect(isPointInRectangle({ x: 50, y: 50 }, rect)).toBe(true)
      expect(isPointInRectangle({ x: 0, y: 0 }, rect)).toBe(true) // Edge case
      expect(isPointInRectangle({ x: 100, y: 100 }, rect)).toBe(true) // Edge case
      expect(isPointInRectangle({ x: 150, y: 50 }, rect)).toBe(false)
    })

    it('detects rectangle overlap', () => {
      const rect1 = createRectangle(0, 0, 100, 100)
      const rect2 = createRectangle(50, 50, 100, 100)
      const rect3 = createRectangle(200, 200, 100, 100)

      expect(doRectanglesOverlap(rect1, rect2)).toBe(true)
      expect(doRectanglesOverlap(rect1, rect3)).toBe(false)
    })
  })

  describe('Circle operations', () => {
    it('creates circles correctly', () => {
      const circle = createCircle(10, 20, 50)
      expect(circle).toEqual({ x: 10, y: 20, radius: 50 })
    })

    it('detects point in circle', () => {
      const circle = createCircle(0, 0, 50)

      expect(isPointInCircle({ x: 0, y: 0 }, circle)).toBe(true) // Center
      expect(isPointInCircle({ x: 30, y: 40 }, circle)).toBe(true) // 3-4-5 triangle, distance = 50
      expect(isPointInCircle({ x: 60, y: 0 }, circle)).toBe(false) // Outside
    })

    it('detects circle overlap', () => {
      const circle1 = createCircle(0, 0, 50)
      const circle2 = createCircle(75, 0, 50) // Touching
      const circle3 = createCircle(150, 0, 50) // Not touching

      expect(doCirclesOverlap(circle1, circle2)).toBe(true)
      expect(doCirclesOverlap(circle1, circle3)).toBe(false)
    })
  })

  describe('Vector operations', () => {
    it('normalizes vectors correctly', () => {
      const vector = { x: 3, y: 4 }
      const normalized = normalizeVector(vector)
      expect(normalized.x).toBeCloseTo(0.6)
      expect(normalized.y).toBeCloseTo(0.8)
    })

    it('calculates dot product', () => {
      const a = { x: 2, y: 3 }
      const b = { x: 4, y: 5 }
      const dot = dotProduct(a, b)
      expect(dot).toBe(23) // 2*4 + 3*5 = 8 + 15 = 23
    })

    it('calculates cross product', () => {
      const a = { x: 2, y: 3 }
      const b = { x: 4, y: 5 }
      const cross = crossProduct(a, b)
      expect(cross).toBe(-2) // 2*5 - 3*4 = 10 - 12 = -2
    })
  })
})