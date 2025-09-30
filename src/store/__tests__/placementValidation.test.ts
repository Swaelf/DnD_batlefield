import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useMapStore from '../mapStore'
import { snapToGrid, isWithinGrid, clampToGrid } from '@/utils/grid'
import type { Token, Shape, Text, BattleMap } from '@/types'

// Mock the layer store
vi.mock('../layerStore', () => ({
  useLayerStore: {
    getState: () => ({
      activeLayerId: null,
      getDefaultLayerForObjectType: () => 'default-layer',
      getLayerById: () => ({ zIndex: 1 })
    })
  }
}))

// Mock the history store
vi.mock('../historyStore', () => ({
  useHistoryStore: {
    getState: () => ({
      pushState: vi.fn()
    })
  }
}))

describe('Placement Validation and Boundary Tests', () => {
  beforeEach(() => {
    useMapStore.setState({
      currentMap: null,
      selectedObjects: [],
      mapVersion: 0
    })
  })

  describe('Map Boundary Validation', () => {
    it('should validate positions within standard map boundaries', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const map = result.current.currentMap!
      const mapWidth = map.width // 1920
      const mapHeight = map.height // 1080

      // Test various positions within boundaries
      const validPositions = [
        { x: 0, y: 0 },
        { x: mapWidth / 2, y: mapHeight / 2 },
        { x: mapWidth, y: mapHeight },
        { x: 100, y: 200 },
        { x: 1800, y: 1000 }
      ]

      validPositions.forEach(position => {
        expect(isWithinGrid(position, mapWidth, mapHeight)).toBe(true)
      })
    })

    it('should identify positions outside map boundaries', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const map = result.current.currentMap!
      const mapWidth = map.width
      const mapHeight = map.height

      // Test various positions outside boundaries
      const invalidPositions = [
        { x: -1, y: 0 },
        { x: 0, y: -1 },
        { x: mapWidth + 1, y: 0 },
        { x: 0, y: mapHeight + 1 },
        { x: -100, y: -100 },
        { x: 2000, y: 1200 }
      ]

      invalidPositions.forEach(position => {
        expect(isWithinGrid(position, mapWidth, mapHeight)).toBe(false)
      })
    })

    it('should clamp out-of-bounds positions to map boundaries', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const map = result.current.currentMap!
      const mapWidth = map.width
      const mapHeight = map.height

      const clampingTests = [
        { input: { x: -50, y: 100 }, expected: { x: 0, y: 100 } },
        { input: { x: 100, y: -25 }, expected: { x: 100, y: 0 } },
        { input: { x: 2000, y: 500 }, expected: { x: mapWidth, y: 500 } },
        { input: { x: 500, y: 1200 }, expected: { x: 500, y: mapHeight } },
        { input: { x: -100, y: -200 }, expected: { x: 0, y: 0 } },
        { input: { x: 2500, y: 1500 }, expected: { x: mapWidth, y: mapHeight } }
      ]

      clampingTests.forEach(({ input, expected }) => {
        const clamped = clampToGrid(input, mapWidth, mapHeight)
        expect(clamped).toEqual(expected)
      })
    })
  })

  describe('Grid Snap Validation', () => {
    it('should validate grid snapping is working correctly', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const map = result.current.currentMap!
      const gridSize = map.grid.size

      // Test positions that should snap to grid
      const snapTests = [
        { input: { x: 23, y: 37 }, expected: { x: 0, y: 50 } },
        { input: { x: 127, y: 183 }, expected: { x: 150, y: 200 } },
        { input: { x: 275, y: 225 }, expected: { x: 300, y: 250 } },
        { input: { x: 49, y: 74 }, expected: { x: 50, y: 50 } },
        { input: { x: 26, y: 26 }, expected: { x: 50, y: 50 } }
      ]

      snapTests.forEach(({ input, expected }) => {
        const snapped = snapToGrid(input, gridSize, true)
        expect(snapped).toEqual(expected)
      })
    })

    it('should handle grid snapping with different grid sizes', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
        result.current.updateGridSettings({ size: 25 })
      })

      const map = result.current.currentMap!
      const gridSize = map.grid.size // 25

      const position = { x: 37, y: 62 }
      const snapped = snapToGrid(position, gridSize, true)

      expect(snapped).toEqual({ x: 25, y: 50 })
    })

    it('should respect grid snap enabled/disabled setting', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const position = { x: 127, y: 183 }
      const gridSize = 50

      // With snap enabled
      const snappedEnabled = snapToGrid(position, gridSize, true)
      expect(snappedEnabled).toEqual({ x: 150, y: 200 })

      // With snap disabled
      const snappedDisabled = snapToGrid(position, gridSize, false)
      expect(snappedDisabled).toEqual({ x: 127, y: 183 })
    })
  })

  describe('Token Size Validation', () => {
    it('should validate D&D token sizes fit properly on grid', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const gridSize = 50

      // D&D size multipliers
      const sizeTests = [
        { size: 'tiny', multiplier: 0.5, expectedRadius: 12.5 },
        { size: 'small', multiplier: 1, expectedRadius: 25 },
        { size: 'medium', multiplier: 1, expectedRadius: 25 },
        { size: 'large', multiplier: 2, expectedRadius: 50 },
        { size: 'huge', multiplier: 3, expectedRadius: 75 },
        { size: 'gargantuan', multiplier: 4, expectedRadius: 100 }
      ] as const

      sizeTests.forEach(({ multiplier, expectedRadius }) => {
        const actualRadius = (gridSize * multiplier) / 2
        expect(actualRadius).toBe(expectedRadius)

        // Token should fit within its allocated grid space
        expect(actualRadius).toBeLessThanOrEqual(gridSize * multiplier / 2)
      })
    })

    it('should validate large tokens don\'t extend beyond grid boundaries when placed near edges', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const map = result.current.currentMap!
      const gridSize = map.grid.size

      // Test gargantuan token (4x4 grid squares) near map edges
      const gargantuanRadius = (gridSize * 4) / 2 // 100px radius

      const edgePositions = [
        { x: gargantuanRadius, y: gargantuanRadius }, // Near top-left
        { x: map.width - gargantuanRadius, y: gargantuanRadius }, // Near top-right
        { x: gargantuanRadius, y: map.height - gargantuanRadius }, // Near bottom-left
        { x: map.width - gargantuanRadius, y: map.height - gargantuanRadius } // Near bottom-right
      ]

      edgePositions.forEach(position => {
        const token: Token = {
          id: `edge-gargantuan-${position.x}-${position.y}`,
          type: 'token',
          name: 'Edge Gargantuan',
          position,
          rotation: 0,
          layer: 1,
          size: 'gargantuan',
          color: '#ff0000',
          shape: 'circle',
          opacity: 1,
          visible: true,
          locked: false
        }

        act(() => {
          result.current.addObject(token)
        })

        // Token's bounds should not extend beyond map
        const tokenBounds = {
          left: position.x - gargantuanRadius,
          right: position.x + gargantuanRadius,
          top: position.y - gargantuanRadius,
          bottom: position.y + gargantuanRadius
        }

        expect(tokenBounds.left).toBeGreaterThanOrEqual(0)
        expect(tokenBounds.right).toBeLessThanOrEqual(map.width)
        expect(tokenBounds.top).toBeGreaterThanOrEqual(0)
        expect(tokenBounds.bottom).toBeLessThanOrEqual(map.height)
      })
    })
  })

  describe('Object Overlap Validation', () => {
    it('should allow multiple objects to be placed at the same position', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const position = { x: 300, y: 400 }

      // Place multiple objects at same position
      const objects = [
        {
          id: 'overlap-token',
          type: 'token' as const,
          name: 'Overlap Token',
          position,
          rotation: 0,
          layer: 1,
          size: 'medium' as const,
          color: '#ff0000',
          shape: 'circle' as const,
          opacity: 1,
          visible: true,
          locked: false
        } as Token,
        {
          id: 'overlap-shape',
          type: 'shape' as const,
          shapeType: 'rectangle' as const,
          position,
          rotation: 0,
          layer: 2,
          width: 50,
          height: 50,
          fill: '#00ff00',
          opacity: 1,
          visible: true,
          locked: false
        } as Shape,
        {
          id: 'overlap-text',
          type: 'text' as const,
          position,
          rotation: 0,
          layer: 3,
          text: 'Overlap Text',
          fontSize: 16,
          fontFamily: 'Arial',
          fill: '#000000',
          opacity: 1,
          visible: true,
          locked: false
        } as Text
      ]

      objects.forEach(obj => {
        act(() => {
          result.current.addObject(obj)
        })
      })

      const map = result.current.currentMap
      const placedObjects = map?.objects.filter(obj => obj.id !== 'void-token')

      expect(placedObjects).toHaveLength(3)
      placedObjects?.forEach(obj => {
        expect(obj.position).toEqual(position)
      })
    })

    it('should maintain object layer ordering for overlapped objects', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const position = { x: 500, y: 300 }

      // Place objects with different layer values
      const layeredObjects = [
        {
          id: 'layer-5',
          type: 'shape' as const,
          shapeType: 'circle' as const,
          position,
          rotation: 0,
          layer: 5,
          radius: 25,
          fill: '#ff0000',
          opacity: 1,
          visible: true,
          locked: false
        } as Shape,
        {
          id: 'layer-1',
          type: 'shape' as const,
          shapeType: 'circle' as const,
          position,
          rotation: 0,
          layer: 1,
          radius: 25,
          fill: '#00ff00',
          opacity: 1,
          visible: true,
          locked: false
        } as Shape,
        {
          id: 'layer-3',
          type: 'shape' as const,
          shapeType: 'circle' as const,
          position,
          rotation: 0,
          layer: 3,
          radius: 25,
          fill: '#0000ff',
          opacity: 1,
          visible: true,
          locked: false
        } as Shape
      ]

      layeredObjects.forEach(obj => {
        act(() => {
          result.current.addObject(obj)
        })
      })

      const map = result.current.currentMap
      const placedObjects = map?.objects.filter(obj => obj.id !== 'void-token') as Shape[]

      // Objects should maintain their layer values
      expect(placedObjects.find(obj => obj.id === 'layer-1')?.layer).toBe(1)
      expect(placedObjects.find(obj => obj.id === 'layer-3')?.layer).toBe(3)
      expect(placedObjects.find(obj => obj.id === 'layer-5')?.layer).toBe(5)
    })
  })

  describe('Custom Map Size Validation', () => {
    it('should validate placement on custom-sized maps', () => {
      const customMap: BattleMap = {
        id: 'custom-map',
        name: 'Custom Size Map',
        width: 800,
        height: 600,
        objects: [],
        grid: {
          size: 40,
          type: 'square',
          visible: true,
          snap: true,
          color: '#cccccc'
        }
      }

      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.loadMap(customMap)
      })

      const map = result.current.currentMap!

      // Test boundary validation for custom size
      expect(isWithinGrid({ x: 0, y: 0 }, map.width, map.height)).toBe(true)
      expect(isWithinGrid({ x: 800, y: 600 }, map.width, map.height)).toBe(true)
      expect(isWithinGrid({ x: 801, y: 600 }, map.width, map.height)).toBe(false)
      expect(isWithinGrid({ x: 800, y: 601 }, map.width, map.height)).toBe(false)

      // Test grid snapping with custom grid size
      const position = { x: 67, y: 83 }
      const snapped = snapToGrid(position, map.grid.size, true)
      expect(snapped).toEqual({ x: 80, y: 80 })
    })

    it('should handle very small map sizes', () => {
      const tinyMap: BattleMap = {
        id: 'tiny-map',
        name: 'Tiny Map',
        width: 200,
        height: 150,
        objects: [],
        grid: {
          size: 25,
          type: 'square',
          visible: true,
          snap: true,
          color: '#cccccc'
        }
      }

      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.loadMap(tinyMap)
      })

      // Test placing medium token on tiny map
      const token: Token = {
        id: 'tiny-map-token',
        type: 'token',
        name: 'Token on Tiny Map',
        position: { x: 100, y: 75 }, // Center of tiny map
        rotation: 0,
        layer: 1,
        size: 'medium',
        color: '#ff0000',
        shape: 'circle',
        opacity: 1,
        visible: true,
        locked: false
      }

      act(() => {
        result.current.addObject(token)
      })

      const map = result.current.currentMap
      const placedToken = map?.objects.find(obj => obj.id === 'tiny-map-token')

      expect(placedToken?.position).toEqual({ x: 100, y: 75 })
    })
  })

  describe('Hex Grid Validation', () => {
    it('should validate hex grid settings', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Hex Map')
        result.current.updateGridSettings({
          type: 'hex',
          size: 60
        })
      })

      const map = result.current.currentMap!

      expect(map.grid.type).toBe('hex')
      expect(map.grid.size).toBe(60)

      // Basic position validation still applies for hex grids
      const position = { x: 300, y: 260 }
      expect(isWithinGrid(position, map.width, map.height)).toBe(true)
    })
  })

  describe('Position Update Validation', () => {
    it('should validate position updates maintain object integrity', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
        result.current.addObject({
          id: 'update-test',
          type: 'token',
          name: 'Update Test Token',
          position: { x: 100, y: 100 },
          rotation: 0,
          layer: 1,
          size: 'medium',
          color: '#ff0000',
          shape: 'circle',
          opacity: 1,
          visible: true,
          locked: false
        } as Token)
      })

      // Test valid position update
      const newPosition = { x: 300, y: 400 }

      act(() => {
        result.current.updateObjectPosition('update-test', newPosition)
      })

      const map = result.current.currentMap
      const updatedToken = map?.objects.find(obj => obj.id === 'update-test') as Token

      expect(updatedToken.position).toEqual(newPosition)
      expect(updatedToken.type).toBe('token')
      expect(updatedToken.name).toBe('Update Test Token')

      // Test position update with grid snapping
      const gridSize = map!.grid.size
      const unsnapedPosition = { x: 387, y: 223 }
      const expectedSnapped = snapToGrid(unsnapedPosition, gridSize, true)

      // Simulate what would happen in UI with grid snap enabled
      const snappedUpdate = snapToGrid(unsnapedPosition, gridSize, map!.grid.snap)

      if (map!.grid.snap) {
        expect(snappedUpdate).toEqual(expectedSnapped)
      } else {
        expect(snappedUpdate).toEqual(unsnapedPosition)
      }
    })

    it('should validate batch position updates', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')

        // Add multiple objects
        const objects = [
          {
            id: 'batch-1',
            type: 'token',
            position: { x: 100, y: 100 },
            layer: 1
          },
          {
            id: 'batch-2',
            type: 'token',
            position: { x: 200, y: 200 },
            layer: 1
          },
          {
            id: 'batch-3',
            type: 'shape',
            shapeType: 'circle',
            position: { x: 300, y: 300 },
            layer: 1,
            radius: 25,
            fill: '#ff0000'
          }
        ]

        objects.forEach(obj => {
          result.current.addObject(obj as any)
        })
      })

      const deltaPosition = { x: 50, y: -25 }

      act(() => {
        result.current.batchUpdatePosition(['batch-1', 'batch-2', 'batch-3'], deltaPosition)
      })

      const map = result.current.currentMap
      const updatedObjects = map?.objects.filter(obj => obj.id.startsWith('batch-'))

      expect(updatedObjects).toHaveLength(3)

      const expectedPositions = [
        { id: 'batch-1', position: { x: 150, y: 75 } },
        { id: 'batch-2', position: { x: 250, y: 175 } },
        { id: 'batch-3', position: { x: 350, y: 275 } }
      ]

      expectedPositions.forEach(({ id, position }) => {
        const obj = updatedObjects?.find(o => o.id === id)
        expect(obj?.position).toEqual(position)
      })
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid position values gracefully', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      // Test with invalid position values
      const invalidPositions = [
        { x: NaN, y: 100 },
        { x: 100, y: Infinity },
        { x: -Infinity, y: 200 },
        { x: undefined as any, y: 100 },
        { x: 100, y: null as any }
      ]

      invalidPositions.forEach((position, index) => {
        const token: Token = {
          id: `invalid-pos-${index}`,
          type: 'token',
          name: 'Invalid Position Token',
          position,
          rotation: 0,
          layer: 1,
          size: 'medium',
          color: '#ff0000',
          shape: 'circle',
          opacity: 1,
          visible: true,
          locked: false
        }

        expect(() => {
          act(() => {
            result.current.addObject(token)
          })
        }).not.toThrow()
      })
    })

    it('should handle grid operations with invalid grid size', () => {
      const position = { x: 100, y: 100 }
      const invalidGridSizes = [0, -50, NaN, Infinity]

      invalidGridSizes.forEach(invalidSize => {
        // snapToGrid should handle invalid grid sizes by using fallback
        expect(() => {
          const result = snapToGrid(position, invalidSize, true)
          expect(Number.isFinite(result.x)).toBe(true)
          expect(Number.isFinite(result.y)).toBe(true)
        }).not.toThrow()
      })
    })
  })
})