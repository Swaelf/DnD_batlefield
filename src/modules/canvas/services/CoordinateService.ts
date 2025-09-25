/**
 * Coordinate Service - Handles coordinate transformations and calculations
 * Provides clean APIs for converting between screen, canvas, and grid coordinates
 */

import type { Point, Rectangle } from '@/foundation/types'
import type { GridSettings, ViewportState } from '../types'

export class CoordinateService {
  /**
   * Convert screen coordinates to canvas coordinates
   */
  screenToCanvas(screenPoint: Point, viewport: ViewportState): Point {
    return {
      x: (screenPoint.x - viewport.position.x) / viewport.scale,
      y: (screenPoint.y - viewport.position.y) / viewport.scale
    }
  }

  /**
   * Convert canvas coordinates to screen coordinates
   */
  canvasToScreen(canvasPoint: Point, viewport: ViewportState): Point {
    return {
      x: canvasPoint.x * viewport.scale + viewport.position.x,
      y: canvasPoint.y * viewport.scale + viewport.position.y
    }
  }

  /**
   * Snap point to grid
   */
  snapToGrid(point: Point, grid: GridSettings): Point {
    if (!grid.snapEnabled) {
      return point
    }

    if (grid.type === 'square') {
      return this.snapToSquareGrid(point, grid.size)
    } else {
      return this.snapToHexGrid(point, grid.size)
    }
  }

  /**
   * Snap point to square grid
   */
  private snapToSquareGrid(point: Point, gridSize: number): Point {
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize
    }
  }

  /**
   * Snap point to hex grid
   */
  private snapToHexGrid(point: Point, gridSize: number): Point {
    // Hex grid math
    const hexWidth = gridSize
    const hexHeight = gridSize * Math.sqrt(3) / 2

    // Convert to hex coordinates
    const q = (2/3 * point.x) / hexWidth
    const r = (-1/3 * point.x + Math.sqrt(3)/3 * point.y) / hexHeight

    // Round to nearest hex
    const qRound = Math.round(q)
    const rRound = Math.round(r)
    const sRound = Math.round(-q - r)

    const qDiff = Math.abs(qRound - q)
    const rDiff = Math.abs(rRound - r)
    const sDiff = Math.abs(sRound - (-q - r))

    let finalQ = qRound
    let finalR = rRound

    if (qDiff > rDiff && qDiff > sDiff) {
      finalQ = -finalR - sRound
    } else if (rDiff > sDiff) {
      finalR = -finalQ - sRound
    }

    // Convert back to pixel coordinates
    return {
      x: hexWidth * (3/2 * finalQ),
      y: hexHeight * (Math.sqrt(3) * finalR + Math.sqrt(3)/2 * finalQ)
    }
  }

  /**
   * Get grid position for a point
   */
  getGridPosition(point: Point, grid: GridSettings): { col: number; row: number } {
    if (grid.type === 'square') {
      return {
        col: Math.floor(point.x / grid.size),
        row: Math.floor(point.y / grid.size)
      }
    } else {
      // Hex grid position calculation
      const hexWidth = grid.size
      const hexHeight = grid.size * Math.sqrt(3) / 2

      const q = Math.floor((2/3 * point.x) / hexWidth)
      const r = Math.floor((-1/3 * point.x + Math.sqrt(3)/3 * point.y) / hexHeight)

      return { col: q, row: r }
    }
  }

  /**
   * Get point from grid position
   */
  getPointFromGrid(col: number, row: number, grid: GridSettings): Point {
    if (grid.type === 'square') {
      return {
        x: col * grid.size + grid.size / 2,
        y: row * grid.size + grid.size / 2
      }
    } else {
      // Hex grid point calculation
      const hexWidth = grid.size
      const hexHeight = grid.size * Math.sqrt(3) / 2

      return {
        x: hexWidth * (3/2 * col),
        y: hexHeight * (Math.sqrt(3) * row + Math.sqrt(3)/2 * col)
      }
    }
  }

  /**
   * Calculate distance between two points
   */
  distance(point1: Point, point2: Point): number {
    const dx = point2.x - point1.x
    const dy = point2.y - point1.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * Calculate grid distance between two points
   */
  gridDistance(point1: Point, point2: Point, grid: GridSettings): number {
    if (grid.type === 'square') {
      const pos1 = this.getGridPosition(point1, grid)
      const pos2 = this.getGridPosition(point2, grid)
      return Math.abs(pos1.col - pos2.col) + Math.abs(pos1.row - pos2.row)
    } else {
      // Hex grid distance
      const pos1 = this.getGridPosition(point1, grid)
      const pos2 = this.getGridPosition(point2, grid)
      return Math.max(
        Math.abs(pos1.col - pos2.col),
        Math.abs(pos1.row - pos2.row),
        Math.abs((pos1.col + pos1.row) - (pos2.col + pos2.row))
      )
    }
  }

  /**
   * Get visible grid bounds for efficient rendering
   */
  getVisibleGridBounds(viewport: ViewportState, grid: GridSettings): {
    startCol: number
    endCol: number
    startRow: number
    endRow: number
  } {
    const topLeft = this.screenToCanvas({ x: 0, y: 0 }, viewport)
    const bottomRight = this.screenToCanvas(
      { x: viewport.bounds.width, y: viewport.bounds.height },
      viewport
    )

    const startPos = this.getGridPosition(topLeft, grid)
    const endPos = this.getGridPosition(bottomRight, grid)

    return {
      startCol: Math.floor(startPos.col) - 1,
      endCol: Math.ceil(endPos.col) + 1,
      startRow: Math.floor(startPos.row) - 1,
      endRow: Math.ceil(endPos.row) + 1
    }
  }

  /**
   * Check if point is within bounds
   */
  isPointInBounds(point: Point, bounds: Rectangle): boolean {
    return (
      point.x >= bounds.x &&
      point.x <= bounds.x + bounds.width &&
      point.y >= bounds.y &&
      point.y <= bounds.y + bounds.height
    )
  }

  /**
   * Clamp point to bounds
   */
  clampToBounds(point: Point, bounds: Rectangle): Point {
    return {
      x: Math.max(bounds.x, Math.min(bounds.x + bounds.width, point.x)),
      y: Math.max(bounds.y, Math.min(bounds.y + bounds.height, point.y))
    }
  }

  /**
   * Get bounds that contains all points
   */
  getBounds(points: Point[]): Rectangle {
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
}

// Singleton instance for the canvas module
export const coordinateService = new CoordinateService()