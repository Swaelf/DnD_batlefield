import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useMapStore from '../mapStore'
import type { MapObject, Shape, Text } from '@/types'

// Mock the layer store
vi.mock('../layerStore', () => ({
  useLayerStore: {
    getState: () => ({
      activeLayerId: 'layer-1',
      getDefaultLayerForObjectType: (type: string) => {
        const layerMap: Record<string, string> = {
          'shape': 'shapes-layer',
          'text': 'text-layer',
          'token': 'tokens-layer'
        }
        return layerMap[type] || 'default-layer'
      },
      getLayerById: (id: string) => ({
        zIndex: id === 'layer-1' ? 5 : 1,
        id,
        name: `Layer ${id}`,
        visible: true
      })
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

describe('Object Placement Tests', () => {
  beforeEach(() => {
    // Reset store state before each test
    useMapStore.setState({
      currentMap: null,
      selectedObjects: [],
      mapVersion: 0
    })
  })

  describe('Shape Object Placement', () => {
    it('should place rectangle shape at specified position', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const rectangle: Shape = {
        id: 'rect-1',
        type: 'shape',
        shapeType: 'rectangle',
        position: { x: 150, y: 200 },
        rotation: 0,
        layer: 2,
        width: 100,
        height: 50,
        fill: '#ff0000',
        fillColor: '#ff0000',
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

      const map = result.current.currentMap
      const placedShape = map?.objects.find(obj => obj.id === 'rect-1') as Shape

      expect(placedShape).toBeDefined()
      expect(placedShape.type).toBe('shape')
      expect(placedShape.shapeType).toBe('rectangle')
      expect(placedShape.position).toEqual({ x: 150, y: 200 })
      expect(placedShape.width).toBe(100)
      expect(placedShape.height).toBe(50)
    })

    it('should place circle shape with correct properties', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const circle: Shape = {
        id: 'circle-1',
        type: 'shape',
        shapeType: 'circle',
        position: { x: 300, y: 250 },
        rotation: 0,
        layer: 3,
        radius: 75,
        fill: '#00ff00',
        fillColor: '#00ff00',
        stroke: '#0000ff',
        strokeColor: '#0000ff',
        strokeWidth: 3,
        opacity: 0.8,
        visible: true,
        locked: false
      }

      act(() => {
        result.current.addObject(circle)
      })

      const map = result.current.currentMap
      const placedShape = map?.objects.find(obj => obj.id === 'circle-1') as Shape

      expect(placedShape.shapeType).toBe('circle')
      expect(placedShape.radius).toBe(75)
      expect(placedShape.fill).toBe('#00ff00')
      expect(placedShape.stroke).toBe('#0000ff')
      expect(placedShape.strokeWidth).toBe(3)
      expect(placedShape.opacity).toBe(0.8)
    })

    it('should place polygon shape with points', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const polygon: Shape = {
        id: 'polygon-1',
        type: 'shape',
        shapeType: 'polygon',
        position: { x: 400, y: 300 },
        rotation: 45,
        layer: 1,
        points: [0, 0, 50, 0, 50, 50, 25, 75, 0, 50],
        fill: '#ffff00',
        fillColor: '#ffff00',
        stroke: '#ff0000',
        strokeColor: '#ff0000',
        strokeWidth: 1,
        opacity: 1,
        visible: true,
        locked: false
      }

      act(() => {
        result.current.addObject(polygon)
      })

      const map = result.current.currentMap
      const placedShape = map?.objects.find(obj => obj.id === 'polygon-1') as Shape

      expect(placedShape.shapeType).toBe('polygon')
      expect(placedShape.points).toEqual([0, 0, 50, 0, 50, 50, 25, 75, 0, 50])
      expect(placedShape.rotation).toBe(45)
    })

    it('should place line shape with start and end points', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const line: Shape = {
        id: 'line-1',
        type: 'shape',
        shapeType: 'line',
        position: { x: 100, y: 100 },
        rotation: 0,
        layer: 2,
        points: [0, 0, 200, 150],
        fill: 'transparent',
        fillColor: 'transparent',
        stroke: '#000000',
        strokeColor: '#000000',
        strokeWidth: 5,
        opacity: 1,
        visible: true,
        locked: false
      }

      act(() => {
        result.current.addObject(line)
      })

      const map = result.current.currentMap
      const placedShape = map?.objects.find(obj => obj.id === 'line-1') as Shape

      expect(placedShape.shapeType).toBe('line')
      expect(placedShape.points).toEqual([0, 0, 200, 150])
      expect(placedShape.strokeWidth).toBe(5)
    })
  })

  describe('Text Object Placement', () => {
    it('should place text object at specified position', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const textObject: Text = {
        id: 'text-1',
        type: 'text',
        position: { x: 250, y: 180 },
        rotation: 0,
        layer: 4,
        text: 'Hello World',
        fontSize: 24,
        fontFamily: 'Arial',
        color: '#333333',
        fill: '#333333',
        align: 'center',
        opacity: 1,
        visible: true,
        locked: false
      }

      act(() => {
        result.current.addObject(textObject)
      })

      const map = result.current.currentMap
      const placedText = map?.objects.find(obj => obj.id === 'text-1') as Text

      expect(placedText).toBeDefined()
      expect(placedText.type).toBe('text')
      expect(placedText.position).toEqual({ x: 250, y: 180 })
      expect(placedText.text).toBe('Hello World')
      expect(placedText.fontSize).toBe(24)
      expect(placedText.fontFamily).toBe('Arial')
      expect(placedText.align).toBe('center')
    })

    it('should handle text with different formatting options', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const formattedText: Text = {
        id: 'formatted-text',
        type: 'text',
        position: { x: 500, y: 400 },
        rotation: 30,
        layer: 5,
        text: 'Rotated Bold Text',
        fontSize: 32,
        fontFamily: 'Georgia',
        color: '#ff6600',
        fill: '#ff6600',
        align: 'left',
        opacity: 0.9,
        visible: true,
        locked: false
      }

      act(() => {
        result.current.addObject(formattedText)
      })

      const map = result.current.currentMap
      const placedText = map?.objects.find(obj => obj.id === 'formatted-text') as Text

      expect(placedText.fill).toBe('#ff6600')
      expect(placedText.rotation).toBe(30)
    })
  })

  describe('Multi-Object Placement', () => {
    it('should place multiple different object types', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const objects: MapObject[] = [
        {
          id: 'mixed-rect',
          type: 'shape',
          shapeType: 'rectangle',
          position: { x: 100, y: 100 },
          rotation: 0,
          layer: 1,
          width: 80,
          height: 60,
          fill: '#ff0000',
          opacity: 1,
          visible: true,
          locked: false
        } as Shape,
        {
          id: 'mixed-text',
          type: 'text',
          position: { x: 300, y: 150 },
          rotation: 0,
          layer: 2,
          text: 'Test Label',
          fontSize: 18,
          fontFamily: 'Arial',
          fill: '#000000',
          opacity: 1,
          visible: true,
          locked: false
        } as Text,
        {
          id: 'mixed-circle',
          type: 'shape',
          shapeType: 'circle',
          position: { x: 500, y: 200 },
          rotation: 0,
          layer: 3,
          radius: 40,
          fill: '#00ff00',
          stroke: '#0000ff',
          strokeWidth: 2,
          opacity: 1,
          visible: true,
          locked: false
        } as Shape
      ]

      objects.forEach(obj => {
        act(() => {
          result.current.addObject(obj)
        })
      })

      const map = result.current.currentMap
      const allObjects = map?.objects.filter(obj => obj.id !== 'void-token')

      expect(allObjects).toHaveLength(3)
      expect(allObjects?.some(obj => obj.type === 'shape')).toBe(true)
      expect(allObjects?.some(obj => obj.type === 'text')).toBe(true)

      const rectangle = allObjects?.find(obj => obj.id === 'mixed-rect') as Shape
      const text = allObjects?.find(obj => obj.id === 'mixed-text') as Text
      const circle = allObjects?.find(obj => obj.id === 'mixed-circle') as Shape

      expect(rectangle.position).toEqual({ x: 100, y: 100 })
      expect(text.position).toEqual({ x: 300, y: 150 })
      expect(circle.position).toEqual({ x: 500, y: 200 })
    })
  })

  describe('Object Layer Assignment', () => {
    it('should assign layer ID based on layer store settings', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const shape: Shape = {
        id: 'layer-test-shape',
        type: 'shape',
        shapeType: 'rectangle',
        position: { x: 100, y: 100 },
        rotation: 0,
        layer: 1,
        width: 50,
        height: 50,
        fill: '#ff0000',
        fillColor: '#ff0000',
        stroke: '#000000',
        strokeColor: '#000000',
        strokeWidth: 1,
        opacity: 1,
        visible: true,
        locked: false
      }

      act(() => {
        result.current.addObject(shape)
      })

      const map = result.current.currentMap
      const placedShape = map?.objects.find(obj => obj.id === 'layer-test-shape') as Shape & { layerId?: string }

      // Should have been assigned the active layer ID
      expect(placedShape.layerId).toBe('layer-1')
      expect(placedShape.layer).toBe(5) // Based on mocked layer zIndex
    })

    it('should preserve existing layer ID if present', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const shapeWithLayer: Shape & { layerId: string } = {
        id: 'existing-layer-shape',
        type: 'shape',
        shapeType: 'circle',
        position: { x: 200, y: 200 },
        rotation: 0,
        layer: 3,
        layerId: 'custom-layer',
        radius: 30,
        fill: '#00ff00',
        fillColor: '#00ff00',
        stroke: '#000000',
        strokeColor: '#000000',
        strokeWidth: 1,
        opacity: 1,
        visible: true,
        locked: false
      }

      act(() => {
        result.current.addObject(shapeWithLayer)
      })

      const map = result.current.currentMap
      const placedShape = map?.objects.find(obj => obj.id === 'existing-layer-shape') as Shape & { layerId?: string }

      // Should preserve the existing layer ID
      expect(placedShape.layerId).toBe('custom-layer')
    })
  })

  describe('Object Position Boundaries', () => {
    it('should place objects at map boundaries', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const mapBounds = result.current.currentMap!

      const boundaryObjects: MapObject[] = [
        {
          id: 'top-left',
          type: 'shape',
          shapeType: 'circle',
          position: { x: 0, y: 0 },
          rotation: 0,
          layer: 1,
          radius: 10,
          fill: '#ff0000',
          opacity: 1,
          visible: true,
          locked: false
        } as Shape,
        {
          id: 'bottom-right',
          type: 'shape',
          shapeType: 'circle',
          position: { x: mapBounds.width, y: mapBounds.height },
          rotation: 0,
          layer: 1,
          radius: 10,
          fill: '#00ff00',
          opacity: 1,
          visible: true,
          locked: false
        } as Shape,
        {
          id: 'center',
          type: 'text',
          position: { x: mapBounds.width / 2, y: mapBounds.height / 2 },
          rotation: 0,
          layer: 1,
          text: 'Center',
          fontSize: 16,
          fontFamily: 'Arial',
          fill: '#000000',
          opacity: 1,
          visible: true,
          locked: false
        } as Text
      ]

      boundaryObjects.forEach(obj => {
        act(() => {
          result.current.addObject(obj)
        })
      })

      const map = result.current.currentMap
      const topLeft = map?.objects.find(obj => obj.id === 'top-left')
      const bottomRight = map?.objects.find(obj => obj.id === 'bottom-right')
      const center = map?.objects.find(obj => obj.id === 'center')

      expect(topLeft?.position).toEqual({ x: 0, y: 0 })
      expect(bottomRight?.position).toEqual({ x: 1920, y: 1080 })
      expect(center?.position).toEqual({ x: 960, y: 540 })
    })

    it('should handle objects placed outside map boundaries', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const outsideShape: Shape = {
        id: 'outside-shape',
        type: 'shape',
        shapeType: 'rectangle',
        position: { x: -100, y: 2000 },
        rotation: 0,
        layer: 1,
        width: 50,
        height: 50,
        fill: '#ff0000',
        fillColor: '#ff0000',
        stroke: '#000000',
        strokeColor: '#000000',
        strokeWidth: 1,
        opacity: 1,
        visible: true,
        locked: false
      }

      act(() => {
        result.current.addObject(outsideShape)
      })

      const map = result.current.currentMap
      const placedShape = map?.objects.find(obj => obj.id === 'outside-shape')

      // Should still be placed at the specified position (no automatic clamping)
      expect(placedShape?.position).toEqual({ x: -100, y: 2000 })
    })
  })

  describe('Object Modification After Placement', () => {
    it('should update object properties after placement', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
        result.current.addObject({
          id: 'update-test',
          type: 'shape',
          shapeType: 'rectangle',
          position: { x: 100, y: 100 },
          rotation: 0,
          layer: 1,
          width: 50,
          height: 50,
          fill: '#ff0000',
          opacity: 1,
          visible: true,
          locked: false
        } as Shape)
      })

      act(() => {
        result.current.updateObject('update-test', {
          position: { x: 200, y: 250 },
          rotation: 45
        } as any)
      })

      const map = result.current.currentMap
      const updatedShape = map?.objects.find(obj => obj.id === 'update-test') as Shape

      expect(updatedShape.position).toEqual({ x: 200, y: 250 })
      expect(updatedShape.fill).toBe('#00ff00')
      expect(updatedShape.width).toBe(75)
      expect(updatedShape.rotation).toBe(45)
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle objects with invalid properties gracefully', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const invalidObject: any = {
        id: 'invalid-obj',
        type: 'shape',
        position: { x: NaN, y: undefined },
        layer: 'invalid-layer-number'
      }

      expect(() => {
        act(() => {
          result.current.addObject(invalidObject)
        })
      }).not.toThrow()

      const map = result.current.currentMap
      const placedObject = map?.objects.find(obj => obj.id === 'invalid-obj')

      expect(placedObject).toBeDefined()
    })

    it('should increment map version when objects are added', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const initialVersion = result.current.mapVersion

      act(() => {
        result.current.addObject({
          id: 'version-test',
          type: 'shape',
          shapeType: 'circle',
          position: { x: 100, y: 100 },
          rotation: 0,
          layer: 1,
          radius: 25,
          fill: '#ff0000',
          opacity: 1,
          visible: true,
          locked: false
        } as Shape)
      })

      // Map version should increment when objects are modified
      expect(result.current.mapVersion).toBeGreaterThan(initialVersion)
    })
  })
})