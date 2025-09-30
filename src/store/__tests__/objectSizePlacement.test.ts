import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useMapStore from '../mapStore'
import { snapToGrid } from '@/utils/grid'
import type { Token, Shape, Text, TokenSize } from '@/types'

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

describe('Object Size and Type Placement Tests', () => {
  beforeEach(() => {
    useMapStore.setState({
      currentMap: null,
      selectedObjects: [],
      mapVersion: 0
    })
  })

  describe('D&D Token Size Placement', () => {
    const tokenSizes: { size: TokenSize; gridSquares: number; description: string }[] = [
      { size: 'tiny', gridSquares: 0.5, description: 'Small fairy or pixie' },
      { size: 'small', gridSquares: 1, description: 'Halfling or goblin' },
      { size: 'medium', gridSquares: 1, description: 'Human or elf' },
      { size: 'large', gridSquares: 2, description: 'Ogre or owlbear' },
      { size: 'huge', gridSquares: 3, description: 'Hill giant or treant' },
      { size: 'gargantuan', gridSquares: 4, description: 'Ancient dragon or kraken' }
    ]

    it('should place tokens of all D&D sizes correctly', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('D&D Size Test Map')
      })

      const gridSize = 50

      tokenSizes.forEach((sizeInfo, index) => {
        const position = { x: index * 200 + 100, y: 300 }

        const token: Token = {
          id: `token-${sizeInfo.size}`,
          type: 'token',
          name: `${sizeInfo.size.charAt(0).toUpperCase() + sizeInfo.size.slice(1)} Token`,
          position,
          rotation: 0,
          layer: 1,
          size: sizeInfo.size,
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
        const placedToken = map?.objects.find(obj => obj.id === `token-${sizeInfo.size}`) as Token

        expect(placedToken).toBeDefined()
        expect(placedToken.size).toBe(sizeInfo.size)
        expect(placedToken.position).toEqual(position)

        // Calculate expected radius based on D&D size rules
        const expectedRadius = (gridSize * sizeInfo.gridSquares) / 2

        // Verify the token size makes sense for its grid allocation
        expect(expectedRadius).toBeGreaterThan(0)

        if (sizeInfo.size === 'tiny') {
          expect(expectedRadius).toBe(12.5) // 0.5 * 50 / 2
        } else if (sizeInfo.size === 'gargantuan') {
          expect(expectedRadius).toBe(100) // 4 * 50 / 2
        }
      })
    })

    it('should handle token size placement with grid snapping', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Grid Snap Size Test')
      })

      const gridSize = 50

      // Test large token placement with grid snapping
      const unsnappedPosition = { x: 237, y: 183 }
      const snappedPosition = snapToGrid(unsnappedPosition, gridSize, true)

      const largeToken: Token = {
        id: 'large-snap-token',
        type: 'token',
        name: 'Large Snapped Token',
        position: snappedPosition,
        rotation: 0,
        layer: 1,
        size: 'large',
        color: '#00ff00',
        shape: 'square',
        opacity: 1,
        visible: true,
        locked: false
      }

      act(() => {
        result.current.addObject(largeToken)
      })

      const map = result.current.currentMap
      const placedToken = map?.objects.find(obj => obj.id === 'large-snap-token') as Token

      expect(placedToken.position).toEqual({ x: 250, y: 200 })
      expect(placedToken.size).toBe('large')
    })

    it('should place multiple tokens of different sizes without overlap issues', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Multi-Size Test')
      })

      // Place tokens with adequate spacing based on their sizes
      const tokenPlacements = [
        { size: 'tiny' as TokenSize, position: { x: 100, y: 100 } },
        { size: 'small' as TokenSize, position: { x: 200, y: 100 } },
        { size: 'medium' as TokenSize, position: { x: 300, y: 100 } },
        { size: 'large' as TokenSize, position: { x: 450, y: 150 } }, // Offset for 2x2 size
        { size: 'huge' as TokenSize, position: { x: 650, y: 175 } },   // Offset for 3x3 size
        { size: 'gargantuan' as TokenSize, position: { x: 900, y: 200 } } // Offset for 4x4 size
      ]

      tokenPlacements.forEach((placement, index) => {
        const token: Token = {
          id: `multi-size-${index}`,
          type: 'token',
          name: `${placement.size} Multi Token`,
          position: placement.position,
          rotation: 0,
          layer: 1,
          size: placement.size,
          color: `hsl(${index * 60}, 70%, 50%)`,
          shape: 'circle',
          opacity: 1,
          visible: true,
          locked: false
        }

        act(() => {
          result.current.addObject(token)
        })
      })

      const map = result.current.currentMap
      const placedTokens = map?.objects.filter(obj => obj.id.startsWith('multi-size-')) as Token[]

      expect(placedTokens).toHaveLength(6)

      // Verify each token maintained its size and position
      tokenPlacements.forEach((placement, index) => {
        const token = placedTokens.find(t => t.id === `multi-size-${index}`)
        expect(token?.size).toBe(placement.size)
        expect(token?.position).toEqual(placement.position)
      })
    })
  })

  describe('Shape Object Size Placement', () => {
    it('should place rectangular shapes of various sizes', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Rectangle Size Test')
      })

      const rectangleSizes = [
        { width: 50, height: 30, position: { x: 100, y: 100 } },
        { width: 100, height: 75, position: { x: 250, y: 150 } },
        { width: 200, height: 50, position: { x: 450, y: 200 } },
        { width: 75, height: 150, position: { x: 150, y: 350 } },
        { width: 300, height: 200, position: { x: 600, y: 400 } }
      ]

      rectangleSizes.forEach((size, index) => {
        const rectangle: Shape = {
          id: `rect-size-${index}`,
          type: 'shape',
          shapeType: 'rectangle',
          position: size.position,
          rotation: 0,
          layer: 1,
          width: size.width,
          height: size.height,
          fill: `hsl(${index * 72}, 60%, 50%)`,
          fillColor: `hsl(${index * 72}, 60%, 50%)`,
          stroke: '#000000',
          strokeColor: '#000000',
          strokeWidth: 2,
          opacity: 1,
          visible: true,
          locked: false
        }

        act(() => {
          result.current.addObject(rectangle)
        })
      })

      const map = result.current.currentMap
      const placedShapes = map?.objects.filter(obj => obj.id.startsWith('rect-size-')) as Shape[]

      expect(placedShapes).toHaveLength(5)

      rectangleSizes.forEach((size, index) => {
        const shape = placedShapes.find(s => s.id === `rect-size-${index}`)
        expect(shape?.width).toBe(size.width)
        expect(shape?.height).toBe(size.height)
        expect(shape?.position).toEqual(size.position)
      })
    })

    it('should place circular shapes of various radii', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Circle Size Test')
      })

      const circleRadii = [10, 25, 50, 75, 100, 150]

      circleRadii.forEach((radius, index) => {
        const position = { x: 200 + index * 300, y: 300 }

        const circle: Shape = {
          id: `circle-radius-${radius}`,
          type: 'shape',
          shapeType: 'circle',
          position,
          rotation: 0,
          layer: 1,
          radius,
          fill: `hsla(${index * 60}, 70%, 50%, 0.7)`,
          fillColor: `hsla(${index * 60}, 70%, 50%, 0.7)`,
          stroke: '#333333',
          strokeColor: '#333333',
          strokeWidth: 1,
          opacity: 1,
          visible: true,
          locked: false
        }

        act(() => {
          result.current.addObject(circle)
        })
      })

      const map = result.current.currentMap
      const placedCircles = map?.objects.filter(obj => obj.id.startsWith('circle-radius-')) as Shape[]

      expect(placedCircles).toHaveLength(6)

      circleRadii.forEach((radius) => {
        const circle = placedCircles.find(c => c.id === `circle-radius-${radius}`)
        expect(circle?.radius).toBe(radius)
        expect(circle?.shapeType).toBe('circle')
      })
    })

    it('should place polygon shapes with different complexity', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Polygon Test')
      })

      const polygonShapes = [
        {
          id: 'triangle',
          points: [0, -30, -26, 15, 26, 15], // Triangle
          position: { x: 150, y: 200 }
        },
        {
          id: 'square',
          points: [-25, -25, 25, -25, 25, 25, -25, 25], // Square
          position: { x: 350, y: 200 }
        },
        {
          id: 'pentagon',
          points: [0, -30, 28, -9, 18, 24, -18, 24, -28, -9], // Pentagon
          position: { x: 550, y: 200 }
        },
        {
          id: 'star',
          points: [0, -40, 12, -12, 40, -12, 20, 8, 32, 36, 0, 20, -32, 36, -20, 8, -40, -12, -12, -12], // Star
          position: { x: 750, y: 250 }
        }
      ]

      polygonShapes.forEach(polyData => {
        const polygon: Shape = {
          id: `polygon-${polyData.id}`,
          type: 'shape',
          shapeType: 'polygon',
          position: polyData.position,
          rotation: 0,
          layer: 1,
          points: polyData.points,
          fill: '#ff6600',
          fillColor: '#ff6600',
          stroke: '#cc3300',
          strokeColor: '#cc3300',
          strokeWidth: 2,
          opacity: 1,
          visible: true,
          locked: false
        }

        act(() => {
          result.current.addObject(polygon)
        })
      })

      const map = result.current.currentMap
      const placedPolygons = map?.objects.filter(obj => obj.id.startsWith('polygon-')) as Shape[]

      expect(placedPolygons).toHaveLength(4)

      polygonShapes.forEach(polyData => {
        const polygon = placedPolygons.find(p => p.id === `polygon-${polyData.id}`)
        expect(polygon?.points).toEqual(polyData.points)
        expect(polygon?.position).toEqual(polyData.position)
        expect(polygon?.shapeType).toBe('polygon')
      })
    })

    it('should place line shapes with different lengths and styles', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Line Test')
      })

      const lineStyles = [
        {
          id: 'short-line',
          points: [0, 0, 50, 0],
          strokeWidth: 2,
          position: { x: 100, y: 100 }
        },
        {
          id: 'long-line',
          points: [0, 0, 200, 100],
          strokeWidth: 4,
          position: { x: 300, y: 150 }
        },
        {
          id: 'thick-line',
          points: [0, 0, 100, -50],
          strokeWidth: 8,
          position: { x: 600, y: 300 }
        },
        {
          id: 'curved-path',
          points: [0, 0, 50, -25, 100, 0, 150, 25, 200, 0],
          strokeWidth: 3,
          position: { x: 800, y: 400 }
        }
      ]

      lineStyles.forEach(lineData => {
        const line: Shape = {
          id: `line-${lineData.id}`,
          type: 'shape',
          shapeType: 'line',
          position: lineData.position,
          rotation: 0,
          layer: 1,
          points: lineData.points,
          fill: 'transparent',
          fillColor: 'transparent',
          stroke: '#000000',
          strokeColor: '#000000',
          strokeWidth: lineData.strokeWidth,
          opacity: 1,
          visible: true,
          locked: false
        }

        act(() => {
          result.current.addObject(line)
        })
      })

      const map = result.current.currentMap
      const placedLines = map?.objects.filter(obj => obj.id.startsWith('line-')) as Shape[]

      expect(placedLines).toHaveLength(4)

      lineStyles.forEach(lineData => {
        const line = placedLines.find(l => l.id === `line-${lineData.id}`)
        expect(line?.points).toEqual(lineData.points)
        expect(line?.strokeWidth).toBe(lineData.strokeWidth)
        expect(line?.position).toEqual(lineData.position)
      })
    })
  })

  describe('Text Object Size Placement', () => {
    it('should place text objects with different font sizes', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Text Size Test')
      })

      const textSizes = [
        { fontSize: 12, text: 'Small Text', position: { x: 100, y: 100 } },
        { fontSize: 18, text: 'Medium Text', position: { x: 300, y: 150 } },
        { fontSize: 24, text: 'Large Text', position: { x: 500, y: 200 } },
        { fontSize: 36, text: 'Extra Large', position: { x: 750, y: 250 } },
        { fontSize: 48, text: 'Huge Text', position: { x: 1000, y: 300 } }
      ]

      textSizes.forEach((textData, index) => {
        const textObject: Text = {
          id: `text-size-${textData.fontSize}`,
          type: 'text',
          position: textData.position,
          rotation: 0,
          layer: 1,
          text: textData.text,
          fontSize: textData.fontSize,
          fontFamily: 'Arial',
          fill: `hsl(${index * 45}, 70%, 40%)`,
          color: `hsl(${index * 45}, 70%, 40%)`,
          align: 'left',
          opacity: 1,
          visible: true,
          locked: false
        }

        act(() => {
          result.current.addObject(textObject)
        })
      })

      const map = result.current.currentMap
      const placedTexts = map?.objects.filter(obj => obj.id.startsWith('text-size-')) as Text[]

      expect(placedTexts).toHaveLength(5)

      textSizes.forEach(textData => {
        const text = placedTexts.find(t => t.id === `text-size-${textData.fontSize}`)
        expect(text?.fontSize).toBe(textData.fontSize)
        expect(text?.text).toBe(textData.text)
        expect(text?.position).toEqual(textData.position)
      })
    })

    it('should place text with different alignment and positioning', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Text Alignment Test')
      })

      const textAlignments = [
        { align: 'left', verticalAlign: 'top', position: { x: 200, y: 200 } },
        { align: 'center', verticalAlign: 'middle', position: { x: 400, y: 300 } },
        { align: 'right', verticalAlign: 'bottom', position: { x: 600, y: 400 } },
        { align: 'center', verticalAlign: 'top', position: { x: 800, y: 200 } }
      ] as const

      textAlignments.forEach((alignment, index) => {
        const textObject: Text = {
          id: `text-align-${index}`,
          type: 'text',
          position: alignment.position,
          rotation: 0,
          layer: 1,
          text: `${alignment.align} ${alignment.verticalAlign}`,
          fontSize: 20,
          fontFamily: 'Arial',
          fill: '#333333',
          color: '#333333',
          align: alignment.align,
          opacity: 1,
          visible: true,
          locked: false
        }

        act(() => {
          result.current.addObject(textObject)
        })
      })

      const map = result.current.currentMap
      const placedTexts = map?.objects.filter(obj => obj.id.startsWith('text-align-')) as Text[]

      expect(placedTexts).toHaveLength(4)

      textAlignments.forEach((alignment, index) => {
        const text = placedTexts.find(t => t.id === `text-align-${index}`)
        expect(text?.align).toBe(alignment.align)
        expect(text?.position).toEqual(alignment.position)
      })
    })
  })

  describe('Mixed Object Type and Size Placement', () => {
    it('should place a complex scene with various object types and sizes', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Complex Scene Test')
      })

      // Create a complex scene with multiple object types and sizes
      const sceneObjects = [
        // Background large rectangle
        {
          id: 'background',
          type: 'shape' as const,
          shapeType: 'rectangle' as const,
          position: { x: 400, y: 300 },
          width: 600,
          height: 400,
          fill: '#e6f3ff',
          stroke: '#4d94ff',
          strokeWidth: 2,
          layer: 0
        } as Shape,

        // Large creature
        {
          id: 'dragon',
          type: 'token' as const,
          name: 'Ancient Red Dragon',
          position: { x: 600, y: 400 },
          size: 'gargantuan' as TokenSize,
          color: '#cc0000',
          shape: 'circle' as const,
          layer: 2
        } as Token,

        // Medium heroes
        {
          id: 'fighter',
          type: 'token' as const,
          name: 'Human Fighter',
          position: { x: 300, y: 250 },
          size: 'medium' as TokenSize,
          color: '#0066cc',
          shape: 'square' as const,
          layer: 2
        } as Token,

        {
          id: 'wizard',
          type: 'token' as const,
          name: 'Elf Wizard',
          position: { x: 250, y: 300 },
          size: 'medium' as TokenSize,
          color: '#9900cc',
          shape: 'circle' as const,
          layer: 2
        } as Token,

        // Small familiar
        {
          id: 'familiar',
          type: 'token' as const,
          name: 'Owl Familiar',
          position: { x: 200, y: 280 },
          size: 'tiny' as TokenSize,
          color: '#8b4513',
          shape: 'circle' as const,
          layer: 3
        } as Token,

        // Spell effect area
        {
          id: 'fireball-area',
          type: 'shape' as const,
          shapeType: 'circle' as const,
          position: { x: 500, y: 350 },
          radius: 100,
          fill: '#ff4500',
          opacity: 0.6,
          layer: 1
        } as Shape,

        // Room label
        {
          id: 'room-label',
          type: 'text' as const,
          position: { x: 400, y: 150 },
          text: 'Dragon\'s Lair',
          fontSize: 32,
          fontFamily: 'Georgia',
          fill: '#cc0000',
          align: 'center' as const,
          layer: 4
        } as Text,

        // Trap marker
        {
          id: 'trap-marker',
          type: 'shape' as const,
          shapeType: 'polygon' as const,
          position: { x: 350, y: 450 },
          points: [0, -15, 13, 7, -13, 7], // Triangle
          fill: '#ffff00',
          stroke: '#ff0000',
          strokeWidth: 3,
          layer: 3
        } as Shape
      ]

      sceneObjects.forEach(obj => {
        act(() => {
          result.current.addObject({
            ...obj,
            rotation: 0,
            opacity: obj.opacity || 1,
            visible: true,
            locked: false
          } as any)
        })
      })

      const map = result.current.currentMap
      const allObjects = map?.objects.filter(obj => obj.id !== 'void-token')

      expect(allObjects).toHaveLength(8)

      // Verify all objects are placed correctly
      const dragon = allObjects?.find(obj => obj.id === 'dragon') as Token
      expect(dragon?.size).toBe('gargantuan')
      expect(dragon?.position).toEqual({ x: 600, y: 400 })

      const familiar = allObjects?.find(obj => obj.id === 'familiar') as Token
      expect(familiar?.size).toBe('tiny')
      expect(familiar?.position).toEqual({ x: 200, y: 280 })

      const spellArea = allObjects?.find(obj => obj.id === 'fireball-area') as Shape
      expect(spellArea?.radius).toBe(100)
      expect(spellArea?.shapeType).toBe('circle')

      const label = allObjects?.find(obj => obj.id === 'room-label') as Text
      expect(label?.fontSize).toBe(32)
      expect(label?.text).toBe('Dragon\'s Lair')

      // Verify layer ordering
      const layerCounts = allObjects?.reduce((counts, obj) => {
        counts[obj.layer] = (counts[obj.layer] || 0) + 1
        return counts
      }, {} as Record<number, number>)

      expect(layerCounts).toBeDefined()
      expect(Object.keys(layerCounts!).length).toBeGreaterThan(1) // Multiple layers used
    })

    it('should handle size-based positioning with grid constraints', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Grid Constraint Test')
      })

      const gridSize = 50

      // Test placing objects that align with grid based on their sizes
      const gridAlignedObjects = [
        // Tiny token should fit in quarter grid
        {
          id: 'tiny-grid',
          type: 'token' as const,
          size: 'tiny' as TokenSize,
          position: snapToGrid({ x: 87, y: 123 }, gridSize, true)
        },

        // Large token needs 2x2 grid space
        {
          id: 'large-grid',
          type: 'token' as const,
          size: 'large' as TokenSize,
          position: snapToGrid({ x: 237, y: 283 }, gridSize, true)
        },

        // Rectangle that fits exactly in grid cells
        {
          id: 'grid-rect',
          type: 'shape' as const,
          shapeType: 'rectangle' as const,
          width: gridSize * 2, // Exactly 2 grid cells wide
          height: gridSize, // Exactly 1 grid cell tall
          position: snapToGrid({ x: 387, y: 423 }, gridSize, true)
        }
      ]

      gridAlignedObjects.forEach(objData => {
        const fullObject = {
          ...objData,
          name: objData.id,
          rotation: 0,
          layer: 1,
          color: '#ff0000',
          shape: 'circle' as const,
          fill: '#00ff00',
          opacity: 1,
          visible: true,
          locked: false
        }

        act(() => {
          result.current.addObject(fullObject as any)
        })
      })

      const map = result.current.currentMap
      const gridObjects = map?.objects.filter(obj => obj.id.includes('grid'))

      expect(gridObjects).toHaveLength(3)

      // Verify all objects are snapped to grid
      gridObjects?.forEach(obj => {
        expect(obj.position.x % gridSize).toBe(0)
        expect(obj.position.y % gridSize).toBe(0)
      })
    })
  })

  describe('Performance and Stress Testing', () => {
    it('should handle placement of many objects of different sizes efficiently', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Stress Test Map')
      })

      const startTime = performance.now()

      // Place 100 objects of various types and sizes
      const objectCount = 100
      const sizes = ['tiny', 'small', 'medium', 'large', 'huge'] as TokenSize[]

      for (let i = 0; i < objectCount; i++) {
        const size = sizes[i % sizes.length]
        const x = (i % 20) * 100
        const y = Math.floor(i / 20) * 150

        const token: Token = {
          id: `stress-token-${i}`,
          type: 'token',
          name: `Stress Token ${i}`,
          position: { x, y },
          rotation: 0,
          layer: 1,
          size,
          color: `hsl(${i * 3.6}, 70%, 50%)`,
          shape: 'circle',
          opacity: 1,
          visible: true,
          locked: false
        }

        act(() => {
          result.current.addObject(token)
        })
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      const map = result.current.currentMap
      const placedTokens = map?.objects.filter(obj => obj.id.startsWith('stress-token-'))

      expect(placedTokens).toHaveLength(objectCount)
      expect(duration).toBeLessThan(1000) // Should complete within 1 second

      // Verify a few random objects
      const sample1 = placedTokens?.find(t => t.id === 'stress-token-7')
      const sample2 = placedTokens?.find(t => t.id === 'stress-token-42')
      const sample3 = placedTokens?.find(t => t.id === 'stress-token-87')

      expect(sample1).toBeDefined()
      expect(sample2).toBeDefined()
      expect(sample3).toBeDefined()
    })
  })
})