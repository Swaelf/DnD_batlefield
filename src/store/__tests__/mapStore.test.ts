import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useMapStore from '../mapStore'
import type { BattleMap, MapObject, Token } from '@/types'

describe('mapStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useMapStore.setState({
      currentMap: null,
      selectedObjects: [],
      mapVersion: 0
    })
  })

  describe('Map Management', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useMapStore())

      expect(result.current.currentMap).toBeNull()
      expect(result.current.selectedObjects).toEqual([])
      expect(result.current.mapVersion).toBe(0)
    })

    it('should create new map with correct structure', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const map = result.current.currentMap
      expect(map).toBeDefined()
      expect(map?.name).toBe('Test Map')
      expect(map?.width).toBe(1920)
      expect(map?.height).toBe(1080)
      expect(map?.objects).toBeDefined()
      expect(map?.grid).toBeDefined()
      expect(map?.grid.size).toBe(50)
      expect(map?.grid.visible).toBe(true)
      expect(map?.grid.snap).toBe(true)
    })

    it('should create void token when creating new map', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const map = result.current.currentMap
      const voidToken = map?.objects.find(obj => obj.id === 'void-token')

      expect(voidToken).toBeDefined()
      expect(voidToken?.type).toBe('token')
      expect((voidToken as any)?.isVoid).toBe(true)
      expect(voidToken?.visible).toBe(false)
      expect((voidToken as any)?.allowedEvents).toContain('spell')
    })

    it('should create map with default dimensions', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Custom Map')
      })

      const map = result.current.currentMap
      expect(map?.width).toBe(1920)
      expect(map?.height).toBe(1080)
      expect(map?.name).toBe('Custom Map')
    })

    it('should load existing map', () => {
      const { result } = renderHook(() => useMapStore())

      const mockMap: BattleMap = {
        id: 'test-map-id',
        name: 'Loaded Map',
        width: 1000,
        height: 800,
        objects: [
          {
            id: 'test-object',
            type: 'token',
            position: { x: 100, y: 100 },
            rotation: 0,
            layer: 1
          } as Token
        ],
        grid: {
          size: 40,
          type: 'square',
          visible: false,
          snap: false,
          color: '#cccccc'
        }
      }

      act(() => {
        result.current.loadMap(mockMap)
      })

      expect(result.current.currentMap).toEqual(mockMap)
    })
  })

  describe('Object Management', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useMapStore())
      act(() => {
        result.current.createNewMap('Test Map')
      })
    })

    it('should add object to map', () => {
      const { result } = renderHook(() => useMapStore())

      const testObject: MapObject = {
        id: 'test-obj-1',
        type: 'token',
        position: { x: 200, y: 300 },
        rotation: 0,
        layer: 1
      }

      act(() => {
        result.current.addObject(testObject)
      })

      const map = result.current.currentMap
      expect(map?.objects).toContainEqual(testObject)
      expect(map?.objects.length).toBeGreaterThan(1) // void token + new object
    })

    it('should update object properties', () => {
      const { result } = renderHook(() => useMapStore())

      const testObject: MapObject = {
        id: 'test-obj-1',
        type: 'token',
        position: { x: 200, y: 300 },
        rotation: 0,
        layer: 1
      }

      act(() => {
        result.current.addObject(testObject)
      })

      act(() => {
        result.current.updateObject('test-obj-1', {
          position: { x: 400, y: 500 },
          rotation: 45
        })
      })

      const map = result.current.currentMap
      const updatedObject = map?.objects.find(obj => obj.id === 'test-obj-1')

      expect(updatedObject?.position).toEqual({ x: 400, y: 500 })
      expect(updatedObject?.rotation).toBe(45)
    })

    it('should delete object by id', () => {
      const { result } = renderHook(() => useMapStore())

      const testObject: MapObject = {
        id: 'test-obj-1',
        type: 'token',
        position: { x: 200, y: 300 },
        rotation: 0,
        layer: 1
      }

      act(() => {
        result.current.addObject(testObject)
      })

      act(() => {
        result.current.deleteObject('test-obj-1')
      })

      const map = result.current.currentMap
      const deletedObject = map?.objects.find(obj => obj.id === 'test-obj-1')
      expect(deletedObject).toBeUndefined()
    })

    it('should update object position', () => {
      const { result } = renderHook(() => useMapStore())

      const testObject: MapObject = {
        id: 'test-obj-1',
        type: 'token',
        position: { x: 200, y: 300 },
        rotation: 0,
        layer: 1
      }

      act(() => {
        result.current.addObject(testObject)
      })

      act(() => {
        result.current.updateObjectPosition('test-obj-1', { x: 100, y: 150 })
      })

      const map = result.current.currentMap
      const updatedObject = map?.objects.find(obj => obj.id === 'test-obj-1')
      expect(updatedObject?.position).toEqual({ x: 100, y: 150 })
    })
  })

  describe('Selection Management', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useMapStore())
      act(() => {
        result.current.createNewMap('Test Map')
        result.current.addObject({
          id: 'obj-1',
          type: 'token',
          position: { x: 100, y: 100 },
          rotation: 0,
          layer: 1
        })
        result.current.addObject({
          id: 'obj-2',
          type: 'token',
          position: { x: 200, y: 200 },
          rotation: 0,
          layer: 2
        })
      })
    })

    it('should select single object', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.selectObject('obj-1')
      })

      expect(result.current.selectedObjects).toEqual(['obj-1'])
    })

    it('should replace selection when selecting new object', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.selectObject('obj-1')
        result.current.selectObject('obj-2')
      })

      expect(result.current.selectedObjects).toEqual(['obj-2'])
    })

    it('should select multiple objects', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.selectMultiple(['obj-1', 'obj-2'])
      })

      expect(result.current.selectedObjects).toEqual(['obj-1', 'obj-2'])
    })

    it('should handle multiple selections with selectMultiple', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.selectMultiple(['obj-1', 'obj-2'])
      })

      expect(result.current.selectedObjects).toEqual(['obj-1', 'obj-2'])

      // Test that selectObject still replaces selection
      act(() => {
        result.current.selectObject('obj-1')
      })

      expect(result.current.selectedObjects).toEqual(['obj-1'])
    })

    it('should clear selection', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.selectMultiple(['obj-1', 'obj-2'])
        result.current.clearSelection()
      })

      expect(result.current.selectedObjects).toEqual([])
    })

    it('should delete selected objects', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.selectMultiple(['obj-1', 'obj-2'])
        result.current.deleteSelected()
      })

      const map = result.current.currentMap
      const obj1 = map?.objects.find(obj => obj.id === 'obj-1')
      const obj2 = map?.objects.find(obj => obj.id === 'obj-2')

      expect(obj1).toBeUndefined()
      expect(obj2).toBeUndefined()
      expect(result.current.selectedObjects).toEqual([])
    })
  })

  describe('Grid Settings', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useMapStore())
      act(() => {
        result.current.createNewMap('Test Map')
      })
    })

    it('should update grid settings', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.updateGridSettings({
          size: 25,
          visible: false,
          snap: false,
          color: '#ff0000'
        })
      })

      const grid = result.current.currentMap?.grid
      expect(grid?.size).toBe(25)
      expect(grid?.visible).toBe(false)
      expect(grid?.snap).toBe(false)
      expect(grid?.color).toBe('#ff0000')
    })

    it('should toggle grid visibility', () => {
      const { result } = renderHook(() => useMapStore())

      const initialVisibility = result.current.currentMap?.grid.visible

      act(() => {
        result.current.toggleGridVisibility()
      })

      expect(result.current.currentMap?.grid.visible).toBe(!initialVisibility)
    })

    it('should toggle grid snap', () => {
      const { result } = renderHook(() => useMapStore())

      const initialSnap = result.current.currentMap?.grid.snap

      act(() => {
        result.current.toggleGridSnap()
      })

      expect(result.current.currentMap?.grid.snap).toBe(!initialSnap)
    })
  })

  describe('Spell Effects', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useMapStore())
      act(() => {
        result.current.createNewMap('Test Map')
      })
    })

    it('should add spell effect', () => {
      const { result } = renderHook(() => useMapStore())

      const spellEffect = {
        id: 'spell-1',
        type: 'spell' as const,
        position: { x: 300, y: 300 },
        rotation: 0,
        layer: 100,
        isSpellEffect: true,
        roundCreated: 1,
        eventCreated: 1,
        spellDuration: 3,
        durationType: 'rounds' as const
      }

      act(() => {
        result.current.addSpellEffect(spellEffect)
      })

      const map = result.current.currentMap
      const addedSpell = map?.objects.find(obj => obj.id === 'spell-1')
      expect(addedSpell).toBeDefined()
      expect((addedSpell as any)?.isSpellEffect).toBe(true)
    })

    it('should preserve persistent spells during cleanup', () => {
      const { result } = renderHook(() => useMapStore())

      const persistentSpell = {
        id: 'persistent-spell',
        type: 'spell' as const,
        position: { x: 300, y: 300 },
        rotation: 0,
        layer: 100,
        isSpellEffect: true,
        roundCreated: 1,
        eventCreated: 1,
        spellDuration: 3,
        durationType: 'rounds' as const
      }

      act(() => {
        result.current.addSpellEffect(persistentSpell)
      })

      // Clean up at round 2 - spell should persist (created round 1, duration 3)
      act(() => {
        result.current.cleanupExpiredSpells(2)
      })

      const map = result.current.currentMap
      const spell = map?.objects.find(obj => obj.id === 'persistent-spell')
      expect(spell).toBeDefined()

      // Clean up at round 4 - spell should be removed (1 + 3 = 4)
      act(() => {
        result.current.cleanupExpiredSpells(4)
      })

      const mapAfterCleanup = result.current.currentMap
      const expiredSpell = mapAfterCleanup?.objects.find(obj => obj.id === 'persistent-spell')
      expect(expiredSpell).toBeUndefined()
    })

    it('should keep instant spells during cleanup', () => {
      const { result } = renderHook(() => useMapStore())

      const instantSpell = {
        id: 'instant-spell',
        type: 'spell' as const,
        position: { x: 300, y: 300 },
        rotation: 0,
        layer: 100,
        isSpellEffect: true,
        roundCreated: 1,
        eventCreated: 1,
        spellDuration: 0, // Instant spell
        durationType: 'rounds' as const
      }

      act(() => {
        result.current.addSpellEffect(instantSpell)
      })

      act(() => {
        result.current.cleanupExpiredSpells(5)
      })

      const map = result.current.currentMap
      const spell = map?.objects.find(obj => obj.id === 'instant-spell')
      expect(spell).toBeDefined() // Instant spells handled by animation timeout
    })
  })

  describe('Error Handling', () => {
    it('should handle operations on null map gracefully', () => {
      const { result } = renderHook(() => useMapStore())

      // Should not throw errors
      expect(() => {
        act(() => {
          result.current.addObject({
            id: 'test',
            type: 'token',
            position: { x: 0, y: 0 },
            rotation: 0,
            layer: 1
          })
        })
      }).not.toThrow()

      expect(() => {
        act(() => {
          result.current.updateObject('test', { position: { x: 100, y: 100 } })
        })
      }).not.toThrow()

      expect(() => {
        act(() => {
          result.current.deleteObject('test')
        })
      }).not.toThrow()
    })

    it('should handle invalid object updates', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      // Update non-existent object should not crash
      expect(() => {
        act(() => {
          result.current.updateObject('non-existent', { position: { x: 100, y: 100 } })
        })
      }).not.toThrow()
    })
  })

  describe('State Immutability', () => {
    it('should maintain immutability when updating objects', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
        result.current.addObject({
          id: 'test-obj',
          type: 'token',
          position: { x: 100, y: 100 },
          rotation: 0,
          layer: 1
        })
      })

      const originalMap = result.current.currentMap
      const originalObjects = result.current.currentMap?.objects

      act(() => {
        result.current.updateObject('test-obj', { position: { x: 200, y: 200 } })
      })

      const newMap = result.current.currentMap
      const newObjects = result.current.currentMap?.objects

      // References should be different (immutable update)
      expect(newMap).not.toBe(originalMap)
      expect(newObjects).not.toBe(originalObjects)

      // But content should be updated correctly
      const updatedObject = newObjects?.find(obj => obj.id === 'test-obj')
      expect(updatedObject?.position).toEqual({ x: 200, y: 200 })
    })
  })
})