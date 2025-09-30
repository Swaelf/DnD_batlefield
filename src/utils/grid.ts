import type { Position } from '@/types/map'

/**
 * Snap a position to the nearest grid cell center
 */
export const snapToGrid = (position: Position, gridSize: number, enabled: boolean = true): Position => {
  // Validate inputs to prevent NaN
  const safeGridSize = isNaN(gridSize) || !isFinite(gridSize) || gridSize <= 0 ? 50 : gridSize
  const safeX = isNaN(position.x) || !isFinite(position.x) ? 0 : position.x
  const safeY = isNaN(position.y) || !isFinite(position.y) ? 0 : position.y

  if (!enabled) return { x: safeX, y: safeY }

  // Snap to cell center instead of grid intersection
  const halfGrid = safeGridSize / 2
  return {
    x: Math.floor(safeX / safeGridSize) * safeGridSize + halfGrid,
    y: Math.floor(safeY / safeGridSize) * safeGridSize + halfGrid,
  }
}

/**
 * Get the grid cell coordinates for a position
 */
export const getGridCell = (position: Position, gridSize: number): Position => {
  return {
    x: Math.floor(position.x / gridSize),
    y: Math.floor(position.y / gridSize),
  }
}

/**
 * Convert grid cell coordinates to world position (top-left corner of cell)
 */
export const gridCellToPosition = (cell: Position, gridSize: number): Position => {
  return {
    x: cell.x * gridSize,
    y: cell.y * gridSize,
  }
}

/**
 * Get the center position of a grid cell
 */
export const getGridCellCenter = (cell: Position, gridSize: number): Position => {
  return {
    x: cell.x * gridSize + gridSize / 2,
    y: cell.y * gridSize + gridSize / 2,
  }
}

/**
 * Calculate distance between two positions in grid units
 */
export const getGridDistance = (from: Position, to: Position, gridSize: number): number => {
  const dx = Math.abs(to.x - from.x) / gridSize
  const dy = Math.abs(to.y - from.y) / gridSize
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Get all grid cells within a rectangular area
 */
export const getGridCellsInArea = (
  topLeft: Position,
  bottomRight: Position,
  gridSize: number
): Position[] => {
  const cells: Position[] = []

  const startCell = getGridCell(topLeft, gridSize)
  const endCell = getGridCell(bottomRight, gridSize)

  for (let x = startCell.x; x <= endCell.x; x++) {
    for (let y = startCell.y; y <= endCell.y; y++) {
      cells.push({ x, y })
    }
  }

  return cells
}

/**
 * Check if a position is within the grid boundaries
 */
export const isWithinGrid = (
  position: Position,
  mapWidth: number,
  mapHeight: number
): boolean => {
  return (
    position.x >= 0 &&
    position.x <= mapWidth &&
    position.y >= 0 &&
    position.y <= mapHeight
  )
}

/**
 * Clamp a position to grid boundaries
 */
export const clampToGrid = (
  position: Position,
  mapWidth: number,
  mapHeight: number
): Position => {
  return {
    x: Math.max(0, Math.min(mapWidth, position.x)),
    y: Math.max(0, Math.min(mapHeight, position.y)),
  }
}