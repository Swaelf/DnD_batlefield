/**
 * D&D Measurement Utilities
 *
 * Provides D&D 5e compliant distance and area calculations for battle map measurements
 */

import type { Point } from '@/types/geometry'

// D&D 5e Constants
export const DND_GRID_SIZE_FEET = 5 // Each grid square = 5 feet
export const DEFAULT_GRID_SIZE_PIXELS = 50 // Default pixel size per grid square

/**
 * Calculate distance between two points in pixels
 */
export function calculatePixelDistance(point1: Point, point2: Point): number {
  const dx = point2.x - point1.x
  const dy = point2.y - point1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Convert pixels to feet using grid size
 */
export function pixelsToFeet(pixels: number, gridSizePixels = DEFAULT_GRID_SIZE_PIXELS): number {
  const gridSquares = pixels / gridSizePixels
  return gridSquares * DND_GRID_SIZE_FEET
}

/**
 * Convert feet to pixels using grid size
 */
export function feetToPixels(feet: number, gridSizePixels = DEFAULT_GRID_SIZE_PIXELS): number {
  const gridSquares = feet / DND_GRID_SIZE_FEET
  return gridSquares * gridSizePixels
}

/**
 * Calculate D&D distance between two points in feet
 */
export function calculateDnDDistance(point1: Point, point2: Point, gridSizePixels = DEFAULT_GRID_SIZE_PIXELS): number {
  const pixelDistance = calculatePixelDistance(point1, point2)
  return pixelsToFeet(pixelDistance, gridSizePixels)
}

/**
 * Calculate total path distance for multi-point measurement
 */
export function calculatePathDistance(points: Point[], gridSizePixels = DEFAULT_GRID_SIZE_PIXELS): number {
  if (points.length < 2) return 0

  let totalDistance = 0
  for (let i = 1; i < points.length; i++) {
    totalDistance += calculatePixelDistance(points[i - 1], points[i])
  }

  return pixelsToFeet(totalDistance, gridSizePixels)
}

/**
 * Calculate area of a polygon in square feet
 */
export function calculatePolygonArea(points: Point[], gridSizePixels = DEFAULT_GRID_SIZE_PIXELS): number {
  if (points.length < 3) return 0

  // Use the shoelace formula for polygon area
  let area = 0
  const n = points.length

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += points[i].x * points[j].y
    area -= points[j].x * points[i].y
  }

  area = Math.abs(area) / 2

  // Convert to square feet
  const pixelsPerSquareFoot = (gridSizePixels * gridSizePixels) / (DND_GRID_SIZE_FEET * DND_GRID_SIZE_FEET)
  return area / pixelsPerSquareFoot
}

/**
 * Calculate rectangle area in square feet
 */
export function calculateRectangleArea(width: number, height: number, gridSizePixels = DEFAULT_GRID_SIZE_PIXELS): number {
  const widthFeet = pixelsToFeet(width, gridSizePixels)
  const heightFeet = pixelsToFeet(height, gridSizePixels)
  return widthFeet * heightFeet
}

/**
 * Calculate circle area in square feet
 */
export function calculateCircleArea(radius: number, gridSizePixels = DEFAULT_GRID_SIZE_PIXELS): number {
  const radiusFeet = pixelsToFeet(radius, gridSizePixels)
  return Math.PI * radiusFeet * radiusFeet
}

/**
 * Format distance for display with appropriate units
 */
export function formatDistance(feet: number): string {
  if (feet < 5) {
    return `${feet.toFixed(1)} ft`
  } else if (feet < 100) {
    return `${Math.round(feet)} ft`
  } else {
    return `${Math.round(feet / 5) * 5} ft`
  }
}

/**
 * Format area for display with appropriate units
 */
export function formatArea(squareFeet: number): string {
  if (squareFeet < 25) {
    return `${squareFeet.toFixed(1)} sq ft`
  } else if (squareFeet < 1000) {
    return `${Math.round(squareFeet)} sq ft`
  } else {
    return `${Math.round(squareFeet / 25) * 25} sq ft`
  }
}

/**
 * D&D Movement Range Calculations
 */
export const DND_MOVEMENT_SPEEDS = {
  slow: 20,    // Dwarf, Halfling, Gnome
  normal: 30,  // Human, Elf, most races
  fast: 35,    // Aarakocra, Centaur
  flying: 50,  // Aarakocra flight speed
  swimming: 30, // Base swimming speed
  climbing: 15  // Base climbing speed (half normal)
} as const

/**
 * Calculate if a target is within movement range
 */
export function isWithinMovementRange(
  from: Point,
  to: Point,
  movementSpeed: number,
  gridSizePixels = DEFAULT_GRID_SIZE_PIXELS
): boolean {
  const distance = calculateDnDDistance(from, to, gridSizePixels)
  return distance <= movementSpeed
}

/**
 * Calculate movement range circle radius in pixels
 */
export function getMovementRangeRadius(movementSpeed: number, gridSizePixels = DEFAULT_GRID_SIZE_PIXELS): number {
  return feetToPixels(movementSpeed, gridSizePixels)
}