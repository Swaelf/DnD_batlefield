import { describe, it, expect, beforeEach } from 'vitest'
import useMapStore from '@/store/mapStore'
import useRoundStore from '@/store/roundStore'
import type { SpellMapObject } from '@/types'

describe('Isolated Fireball Test', () => {
  beforeEach(() => {
    // Reset stores completely - use getState and setState properly
    const mapStore = useMapStore.getState()
    const roundStore = useRoundStore.getState()

    // Clear map store
    useMapStore.setState({
      currentMap: null,
      selectedObjects: [],
      mapVersion: 0
    })

    // Create new map which will properly initialize
    mapStore.createNewMap('Test Map')

    // Clear round store
    useRoundStore.setState({
      timeline: null,
      currentRound: 1,
      isInCombat: false,
      animationSpeed: 1
    })

    // Start combat properly which will create timeline
    const currentMapId = mapStore.currentMap?.id
    if (currentMapId) {
      roundStore.startCombat(currentMapId)
    }
  })

  it('should add persistent area and remove after 1 round', async () => {
    const mapStore = useMapStore.getState()
    const roundStore = useRoundStore.getState()

    console.log('Initial round:', roundStore.currentRound)
    console.log('Initial objects:', mapStore.currentMap?.objects.length)

    // Create a simple persistent area
    const burnArea: SpellMapObject = {
      id: 'test-burn',
      type: 'persistent-area',
      position: { x: 100, y: 100 },
      rotation: 0,
      layer: 0,
      isSpellEffect: true,
      roundCreated: 1,
      spellDuration: 1,
      persistentAreaData: {
        position: { x: 100, y: 100 },
        radius: 40,
        color: '#ff4500',
        opacity: 0.3,
        spellName: 'Fireball',
        roundCreated: 1
      }
    }

    // Add using the store action to properly update state
    mapStore.addObject(burnArea)

    // Get fresh state after adding
    const afterAddState = useMapStore.getState()
    console.log('After adding, objects:', afterAddState.currentMap?.objects.length)
    const addedObject = afterAddState.currentMap?.objects.find(obj => obj.id === 'test-burn')
    console.log('Object exists:', !!addedObject)
    if (addedObject) {
      console.log('Added object properties:', {
        id: addedObject.id,
        isSpellEffect: addedObject.isSpellEffect,
        roundCreated: addedObject.roundCreated,
        spellDuration: addedObject.spellDuration
      })
    }

    // Test cleanup at round 1 (should keep)
    mapStore.cleanupExpiredSpells(1)
    // Get fresh state after cleanup
    const afterCleanup1 = useMapStore.getState()
    const existsAtRound1 = afterCleanup1.currentMap?.objects.some(obj => obj.id === 'test-burn')
    console.log('After cleanup at round 1:', existsAtRound1)
    expect(existsAtRound1).toBe(true)

    // Test cleanup at round 2 (should remove)
    mapStore.cleanupExpiredSpells(2)
    // Get fresh state after cleanup
    const afterCleanup2 = useMapStore.getState()
    const existsAtRound2 = afterCleanup2.currentMap?.objects.some(obj => obj.id === 'test-burn')
    console.log('After cleanup at round 2:', existsAtRound2)
    expect(existsAtRound2).toBe(false)
  })

  it('should handle addSpellEffect correctly', () => {
    // Get fresh state reference
    const mapStore = useMapStore.getState()
    const initialObjectCount = mapStore.currentMap?.objects.length || 0

    const burnArea: SpellMapObject = {
      id: 'test-add-spell',
      type: 'persistent-area',
      position: { x: 200, y: 200 },
      rotation: 0,
      layer: 0,
      isSpellEffect: true,
      roundCreated: 1,
      spellDuration: 2,
      persistentAreaData: {
        position: { x: 200, y: 200 },
        radius: 40,
        color: '#ff4500',
        opacity: 0.3,
        spellName: 'Fireball',
        roundCreated: 1
      }
    }

    console.log('Before addSpellEffect, objects:', initialObjectCount)

    mapStore.addSpellEffect(burnArea)

    // Get fresh state after the update
    const updatedState = useMapStore.getState()
    console.log('After addSpellEffect, objects:', updatedState.currentMap?.objects.length)

    const stored = updatedState.currentMap?.objects.find(obj => obj.id === 'test-add-spell')
    console.log('Stored object:', stored)

    expect(stored).toBeDefined()
    expect(stored?.isSpellEffect).toBe(true)
    expect(stored?.roundCreated).toBe(1)
    expect(stored?.spellDuration).toBe(2)
  })

  it('should call cleanup when advancing rounds', async () => {
    // Get fresh references
    const roundStore = useRoundStore.getState()
    const mapStore = useMapStore.getState()

    // Add a test spell effect using the store action
    mapStore.addSpellEffect({
      id: 'test-cleanup-call',
      type: 'persistent-area' as const,
      position: { x: 300, y: 300 },
      rotation: 0,
      layer: 0,
      isSpellEffect: true,
      roundCreated: 1,
      spellDuration: 1,
      persistentAreaData: {
        position: { x: 300, y: 300 },
        radius: 40,
        color: '#ff4500',
        opacity: 0.3,
        spellName: 'Test',
        roundCreated: 1
      }
    })

    // Check initial state
    const initialRound = useRoundStore.getState().currentRound
    const initialObjects = useMapStore.getState().currentMap?.objects.length
    console.log('Before nextRound, current round:', initialRound)
    console.log('Objects before:', initialObjects)

    // Advance round - it's async so we need to await it
    await roundStore.nextRound()
    // Give time for state to update
    await new Promise(resolve => setTimeout(resolve, 100))

    // Get fresh state after the async operation
    const updatedRoundStore = useRoundStore.getState()
    const updatedMapStore = useMapStore.getState()

    console.log('After nextRound, current round:', updatedRoundStore.currentRound)
    console.log('Objects after:', updatedMapStore.currentMap?.objects.length)

    const stillExists = updatedMapStore.currentMap?.objects.some(obj => obj.id === 'test-cleanup-call')
    console.log('Object still exists:', stillExists)

    // At round 2, the object created at round 1 with duration 1 should be gone
    expect(stillExists).toBe(false)
  })
})