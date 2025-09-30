import { describe, it, expect } from 'vitest'
import {
  snapToGrid,
  getGridCell,
  gridCellToPosition,
  getGridCellCenter,
  getGridDistance,
  getGridCellsInArea,
  isWithinGrid,
  clampToGrid
} from '../grid'
import type { Position } from '@/types'

describe('Grid Placement and Snapping Tests', () => {
  describe('snapToGrid', () => {
    it('should snap position to nearest grid point with default grid size', () => {
      const position: Position = { x: 127, y: 83 }
      const gridSize = 50

      const snapped = snapToGrid(position, gridSize, true)

      expect(snapped).toEqual({ x: 150, y: 100 })
    })

    it('should snap position to nearest grid point with custom grid size', () => {
      const position: Position = { x: 35, y: 72 }
      const gridSize = 25

      const snapped = snapToGrid(position, gridSize, true)

      expect(snapped).toEqual({ x: 25, y: 75 })
    })

    it('should return original position when snapping is disabled', () => {
      const position: Position = { x: 127, y: 83 }
      const gridSize = 50

      const result = snapToGrid(position, gridSize, false)

      expect(result).toEqual({ x: 127, y: 83 })
    })

    it('should handle zero coordinates correctly', () => {
      const position: Position = { x: 0, y: 0 }
      const gridSize = 50

      const snapped = snapToGrid(position, gridSize, true)

      expect(snapped).toEqual({ x: 0, y: 0 })
    })

    it('should handle negative coordinates correctly', () => {
      const position: Position = { x: -37, y: -83 }
      const gridSize = 50

      const snapped = snapToGrid(position, gridSize, true)

      expect(snapped).toEqual({ x: -50, y: -100 })
    })

    it('should snap to closest grid point for positions exactly between grid lines', () => {
      const position: Position = { x: 25, y: 75 } // Exactly between 0,50 and 50,100
      const gridSize = 50

      const snapped = snapToGrid(position, gridSize, true)

      // Should round to nearest (0 or 50, 50 or 100)
      expect(snapped.x).toBeCloseTo(0)
      expect(snapped.y).toBeCloseTo(50)
    })

    it('should handle invalid grid size by using fallback', () => {
      const position: Position = { x: 127, y: 83 }

      // Test various invalid grid sizes
      const invalidSizes = [0, -10, NaN, Infinity]

      invalidSizes.forEach(invalidSize => {
        const snapped = snapToGrid(position, invalidSize, true)
        // Should use fallback grid size of 50
        expect(snapped).toEqual({ x: 150, y: 100 })
      })
    })

    it('should handle invalid position coordinates by using safe values', () => {
      const gridSize = 50

      const invalidPositions = [
        { x: NaN, y: 100 },
        { x: 100, y: NaN },
        { x: Infinity, y: 100 },
        { x: 100, y: -Infinity }
      ]

      invalidPositions.forEach(pos => {
        const snapped = snapToGrid(pos, gridSize, true)
        expect(Number.isFinite(snapped.x)).toBe(true)
        expect(Number.isFinite(snapped.y)).toBe(true)
      })
    })

    it('should work with small grid sizes', () => {
      const position: Position = { x: 7, y: 13 }
      const gridSize = 5

      const snapped = snapToGrid(position, gridSize, true)

      expect(snapped).toEqual({ x: 5, y: 15 })
    })

    it('should work with large grid sizes', () => {
      const position: Position = { x: 580, y: 720 }
      const gridSize = 200

      const snapped = snapToGrid(position, gridSize, true)

      expect(snapped).toEqual({ x: 600, y: 800 })
    })
  })

  describe('getGridCell', () => {
    it('should calculate correct grid cell for positive coordinates', () => {
      const position: Position = { x: 175, y: 125 }
      const gridSize = 50

      const cell = getGridCell(position, gridSize)

      expect(cell).toEqual({ x: 3, y: 2 })
    })

    it('should calculate correct grid cell for zero coordinates', () => {
      const position: Position = { x: 0, y: 0 }
      const gridSize = 50

      const cell = getGridCell(position, gridSize)

      expect(cell).toEqual({ x: 0, y: 0 })
    })

    it('should calculate correct grid cell for negative coordinates', () => {
      const position: Position = { x: -75, y: -125 }
      const gridSize = 50

      const cell = getGridCell(position, gridSize)

      expect(cell).toEqual({ x: -2, y: -3 })
    })

    it('should handle positions exactly on grid lines', () => {
      const position: Position = { x: 100, y: 150 }
      const gridSize = 50

      const cell = getGridCell(position, gridSize)

      expect(cell).toEqual({ x: 2, y: 3 })
    })

    it('should work with different grid sizes', () => {
      const position: Position = { x: 75, y: 125 }

      expect(getGridCell(position, 25)).toEqual({ x: 3, y: 5 })
      expect(getGridCell(position, 100)).toEqual({ x: 0, y: 1 })
    })
  })

  describe('gridCellToPosition', () => {
    it('should convert grid cell to world position', () => {
      const cell: Position = { x: 3, y: 2 }
      const gridSize = 50

      const position = gridCellToPosition(cell, gridSize)

      expect(position).toEqual({ x: 150, y: 100 })
    })

    it('should handle zero cell coordinates', () => {
      const cell: Position = { x: 0, y: 0 }
      const gridSize = 50

      const position = gridCellToPosition(cell, gridSize)

      expect(position).toEqual({ x: 0, y: 0 })
    })

    it('should handle negative cell coordinates', () => {
      const cell: Position = { x: -2, y: -1 }
      const gridSize = 50

      const position = gridCellToPosition(cell, gridSize)

      expect(position).toEqual({ x: -100, y: -50 })
    })
  })

  describe('getGridCellCenter', () => {
    it('should calculate center position of grid cell', () => {
      const cell: Position = { x: 2, y: 1 }
      const gridSize = 50

      const center = getGridCellCenter(cell, gridSize)

      expect(center).toEqual({ x: 125, y: 75 })
    })

    it('should handle zero cell', () => {
      const cell: Position = { x: 0, y: 0 }
      const gridSize = 50

      const center = getGridCellCenter(cell, gridSize)

      expect(center).toEqual({ x: 25, y: 25 })
    })

    it('should work with different grid sizes', () => {
      const cell: Position = { x: 1, y: 1 }

      expect(getGridCellCenter(cell, 25)).toEqual({ x: 37.5, y: 37.5 })
      expect(getGridCellCenter(cell, 100)).toEqual({ x: 150, y: 150 })
    })
  })

  describe('getGridDistance', () => {
    it('should calculate distance in grid units', () => {
      const from: Position = { x: 0, y: 0 }
      const to: Position = { x: 150, y: 100 }
      const gridSize = 50

      const distance = getGridDistance(from, to, gridSize)

      // Distance should be sqrt((3*50)^2 + (2*50)^2) / 50 = sqrt(9 + 4) = sqrt(13)
      expect(distance).toBeCloseTo(Math.sqrt(13))
    })

    it('should calculate distance for same position', () => {
      const position: Position = { x: 100, y: 200 }
      const gridSize = 50

      const distance = getGridDistance(position, position, gridSize)

      expect(distance).toBe(0)
    })

    it('should calculate distance for adjacent grid cells', () => {
      const from: Position = { x: 50, y: 50 }
      const to: Position = { x: 100, y: 50 }
      const gridSize = 50

      const distance = getGridDistance(from, to, gridSize)

      expect(distance).toBe(1)
    })

    it('should calculate diagonal distance correctly', () => {
      const from: Position = { x: 0, y: 0 }
      const to: Position = { x: 50, y: 50 }
      const gridSize = 50

      const distance = getGridDistance(from, to, gridSize)

      expect(distance).toBeCloseTo(Math.sqrt(2))
    })
  })

  describe('getGridCellsInArea', () => {
    it('should get all grid cells in rectangular area', () => {
      const topLeft: Position = { x: 25, y: 25 }
      const bottomRight: Position = { x: 125, y: 75 }
      const gridSize = 50

      const cells = getGridCellsInArea(topLeft, bottomRight, gridSize)

      // Should include cells (0,0), (1,0), (2,0), (0,1), (1,1), (2,1)
      expect(cells).toHaveLength(6)
      expect(cells).toContainEqual({ x: 0, y: 0 })
      expect(cells).toContainEqual({ x: 1, y: 0 })
      expect(cells).toContainEqual({ x: 2, y: 0 })
      expect(cells).toContainEqual({ x: 0, y: 1 })
      expect(cells).toContainEqual({ x: 1, y: 1 })
      expect(cells).toContainEqual({ x: 2, y: 1 })
    })

    it('should handle single cell area', () => {
      const topLeft: Position = { x: 75, y: 125 }
      const bottomRight: Position = { x: 75, y: 125 }
      const gridSize = 50

      const cells = getGridCellsInArea(topLeft, bottomRight, gridSize)

      expect(cells).toHaveLength(1)
      expect(cells[0]).toEqual({ x: 1, y: 2 })
    })

    it('should handle areas spanning negative coordinates', () => {
      const topLeft: Position = { x: -25, y: -25 }
      const bottomRight: Position = { x: 25, y: 25 }
      const gridSize = 50

      const cells = getGridCellsInArea(topLeft, bottomRight, gridSize)

      expect(cells).toContainEqual({ x: -1, y: -1 })
      expect(cells).toContainEqual({ x: 0, y: -1 })
      expect(cells).toContainEqual({ x: -1, y: 0 })
      expect(cells).toContainEqual({ x: 0, y: 0 })
    })
  })

  describe('isWithinGrid', () => {
    it('should return true for position within grid boundaries', () => {
      const position: Position = { x: 500, y: 300 }
      const mapWidth = 1920
      const mapHeight = 1080

      const isWithin = isWithinGrid(position, mapWidth, mapHeight)

      expect(isWithin).toBe(true)
    })

    it('should return true for position exactly on boundaries', () => {
      const mapWidth = 1920
      const mapHeight = 1080

      expect(isWithinGrid({ x: 0, y: 0 }, mapWidth, mapHeight)).toBe(true)
      expect(isWithinGrid({ x: mapWidth, y: mapHeight }, mapWidth, mapHeight)).toBe(true)
      expect(isWithinGrid({ x: 0, y: mapHeight }, mapWidth, mapHeight)).toBe(true)
      expect(isWithinGrid({ x: mapWidth, y: 0 }, mapWidth, mapHeight)).toBe(true)
    })

    it('should return false for position outside grid boundaries', () => {
      const mapWidth = 1920
      const mapHeight = 1080

      expect(isWithinGrid({ x: -10, y: 500 }, mapWidth, mapHeight)).toBe(false)
      expect(isWithinGrid({ x: 500, y: -10 }, mapWidth, mapHeight)).toBe(false)
      expect(isWithinGrid({ x: 2000, y: 500 }, mapWidth, mapHeight)).toBe(false)
      expect(isWithinGrid({ x: 500, y: 1200 }, mapWidth, mapHeight)).toBe(false)
    })
  })

  describe('clampToGrid', () => {
    it('should clamp position to grid boundaries', () => {
      const mapWidth = 1920
      const mapHeight = 1080

      const outsidePositions = [
        { input: { x: -100, y: 500 }, expected: { x: 0, y: 500 } },
        { input: { x: 500, y: -50 }, expected: { x: 500, y: 0 } },
        { input: { x: 2000, y: 500 }, expected: { x: 1920, y: 500 } },
        { input: { x: 500, y: 1200 }, expected: { x: 500, y: 1080 } },
        { input: { x: -50, y: -25 }, expected: { x: 0, y: 0 } },
        { input: { x: 2100, y: 1300 }, expected: { x: 1920, y: 1080 } }
      ]

      outsidePositions.forEach(({ input, expected }) => {
        const clamped = clampToGrid(input, mapWidth, mapHeight)
        expect(clamped).toEqual(expected)
      })
    })

    it('should not modify position already within boundaries', () => {
      const position: Position = { x: 960, y: 540 }
      const mapWidth = 1920
      const mapHeight = 1080

      const clamped = clampToGrid(position, mapWidth, mapHeight)

      expect(clamped).toEqual(position)
    })

    it('should handle edge cases at exact boundaries', () => {
      const mapWidth = 1920
      const mapHeight = 1080

      const boundaryPositions = [
        { x: 0, y: 0 },
        { x: 1920, y: 1080 },
        { x: 0, y: 1080 },
        { x: 1920, y: 0 }
      ]

      boundaryPositions.forEach(position => {
        const clamped = clampToGrid(position, mapWidth, mapHeight)
        expect(clamped).toEqual(position)
      })
    })
  })

  describe('Grid Integration Tests', () => {
    it('should handle complete placement workflow with grid snapping', () => {
      const originalPosition: Position = { x: 127, y: 183 }
      const gridSize = 50

      // 1. Snap to grid
      const snappedPosition = snapToGrid(originalPosition, gridSize, true)
      expect(snappedPosition).toEqual({ x: 150, y: 200 })

      // 2. Get grid cell
      const gridCell = getGridCell(snappedPosition, gridSize)
      expect(gridCell).toEqual({ x: 3, y: 4 })

      // 3. Get cell center
      const cellCenter = getGridCellCenter(gridCell, gridSize)
      expect(cellCenter).toEqual({ x: 175, y: 225 })

      // 4. Verify position is within bounds
      const isWithin = isWithinGrid(snappedPosition, 1920, 1080)
      expect(isWithin).toBe(true)
    })

    it('should handle token placement with different D&D sizes on grid', () => {
      const gridSize = 50

      // D&D creature sizes in grid squares
      const sizeMultipliers = {
        tiny: 0.5,
        small: 1,
        medium: 1,
        large: 2,
        huge: 3,
        gargantuan: 4
      }

      Object.entries(sizeMultipliers).forEach(([_size, multiplier]) => {
        const position: Position = { x: 127, y: 83 }
        const snapped = snapToGrid(position, gridSize, true)

        // Calculate token radius based on size
        const tokenRadius = (gridSize * multiplier) / 2

        // Token should be properly sized for its grid cell
        expect(tokenRadius).toBeGreaterThan(0)
        expect(snapped.x % gridSize).toBe(0) // Should be exactly on grid line
        expect(snapped.y % gridSize).toBe(0) // Should be exactly on grid line
      })
    })

    it('should handle area-of-effect spell placement on grid', () => {
      const spellCenter: Position = { x: 237, y: 418 }
      const spellRadius = 75 // 1.5 grid squares
      const gridSize = 50

      // Snap spell center to grid
      const snappedCenter = snapToGrid(spellCenter, gridSize, true)
      expect(snappedCenter).toEqual({ x: 250, y: 400 })

      // Calculate affected grid cells
      const topLeft: Position = {
        x: snappedCenter.x - spellRadius,
        y: snappedCenter.y - spellRadius
      }
      const bottomRight: Position = {
        x: snappedCenter.x + spellRadius,
        y: snappedCenter.y + spellRadius
      }

      const affectedCells = getGridCellsInArea(topLeft, bottomRight, gridSize)

      // Should affect multiple grid cells around the center
      expect(affectedCells.length).toBeGreaterThan(1)

      // Center cell should be included
      const centerCell = getGridCell(snappedCenter, gridSize)
      expect(affectedCells).toContainEqual(centerCell)
    })
  })
})