import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import useMapStore from '@/store/mapStore'
import useTimelineStore from '@/store/timelineStore'
import type { SpellMapObject } from '@/types/map'

describe('Spell Persistence - Fireball Burn Area', () => {
  beforeEach(() => {
    // Reset stores completely
    useMapStore.setState({
      currentMap: null,
      selectedObjects: [],
      mapVersion: 0
    })

    useTimelineStore.setState({
      timeline: null,
      currentEvent: 1,
      isInCombat: false,
      animationSpeed: 1
    })

    // Create a test map
    const mapStore = useMapStore.getState()
    mapStore.createNewMap('Test Map')

    // Start combat with the created map
    const roundStore = useTimelineStore.getState()
    const currentMapId = useMapStore.getState().currentMap?.id
    if (currentMapId && !roundStore.isInCombat) {
      roundStore.startCombat(currentMapId)
    }
  })

  afterEach(() => {
    // Clean up any test objects
    const mapStore = useMapStore.getState()
    const testObjects = mapStore.currentMap?.objects.filter(obj =>
      obj.id.includes('test-') || obj.id.includes('fireball-')
    ) || []
    testObjects.forEach(obj => mapStore.deleteObject(obj.id))
  })

  describe('Fireball Burn Area Duration', () => {
    it('should create a burn area that lasts exactly 1 round', async () => {
      const mapStore = useMapStore.getState()
      const roundStore = useTimelineStore.getState()

      // Start at event 1
      expect(roundStore.currentEvent).toBe(1)

      // Create a Fireball burn area (simulating what happens after projectile burst)
      const burnArea: SpellMapObject = {
        id: 'test-fireball-burn',
        type: 'persistent-area',
        position: { x: 500, y: 300 },
        rotation: 0,
        layer: 0,
        isSpellEffect: true,
        roundCreated: roundStore.currentEvent,
        eventCreated: roundStore.currentEvent,
        durationType: 'events' as const,
        spellDuration: 1, // Should last 1 round
        persistentAreaData: {
          position: { x: 500, y: 300 },
          radius: 40,
          color: '#ff4500',
          opacity: 0.3,
          spellName: 'Fireball',
          roundCreated: roundStore.currentEvent
        }
      }

      // Add the burn area
      mapStore.addSpellEffect(burnArea)

      // Get fresh state after update
      const updatedState = useMapStore.getState()

      // Verify it was added
      const exists = updatedState.currentMap?.objects.some(obj => obj.id === 'test-fireball-burn')
      expect(exists).toBe(true)

      // Verify properties were preserved
      const storedArea = updatedState.currentMap?.objects.find(obj => obj.id === 'test-fireball-burn')
      expect(storedArea?.isSpellEffect).toBe(true)
      expect(storedArea?.roundCreated).toBe(1)
      expect(storedArea?.spellDuration).toBe(1)

      // Advance to round 2
      await roundStore.nextEvent()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Get fresh state after async operation
      const currentRound = useTimelineStore.getState().currentEvent
      expect(currentRound).toBe(2)

      // Burn area should be removed after 1 round
      const finalState = useMapStore.getState()
      const stillExists = finalState.currentMap?.objects.some(obj => obj.id === 'test-fireball-burn')
      expect(stillExists).toBe(false)
    })

    it('should remove burn area at exactly the expiration round', async () => {
      const mapStore = useMapStore.getState()
      const roundStore = useTimelineStore.getState()

      const burnArea: SpellMapObject = {
        id: 'test-burn-expiration',
        type: 'persistent-area',
        position: { x: 400, y: 400 },
        rotation: 0,
        layer: 0,
        isSpellEffect: true,
        roundCreated: 1,
        eventCreated: 1,
        durationType: 'events' as const,
        spellDuration: 1,
        persistentAreaData: {
          position: { x: 400, y: 400 },
          radius: 40,
          color: '#ff4500',
          opacity: 0.3,
          spellName: 'Fireball',
          roundCreated: 1
        }
      }

      mapStore.addSpellEffect(burnArea)

      // At round 1 - should exist
      let state = useMapStore.getState()
      let exists = state.currentMap?.objects.some(obj => obj.id === 'test-burn-expiration')
      expect(exists).toBe(true)

      // At round 2 - should NOT exist (expires at round 1 + 1 = 2)
      await roundStore.nextEvent()
      await new Promise(resolve => setTimeout(resolve, 100))

      state = useMapStore.getState()
      exists = state.currentMap?.objects.some(obj => obj.id === 'test-burn-expiration')
      expect(exists).toBe(false)
    })
  })

  describe('Cleanup Function', () => {
    it('should call cleanupExpiredSpells when advancing rounds', async () => {
      const mapStore = useMapStore.getState()
      const roundStore = useTimelineStore.getState()

      // Spy on the cleanup function
      const cleanupSpy = vi.spyOn(mapStore, 'cleanupExpiredSpells')

      // Advance round
      await roundStore.nextEvent()

      // Verify cleanup was called
      expect(cleanupSpy).toHaveBeenCalled()
      // After nextRound, the current round is 2, so cleanup should be called with 2
      expect(cleanupSpy).toHaveBeenCalledWith(2)

      cleanupSpy.mockRestore()
    })

    it('should correctly identify expired spell effects', () => {
      const mapStore = useMapStore.getState()
      const roundStore = useTimelineStore.getState()

      // Go to round 5 for testing
      roundStore.goToEvent(5)

      // Create test areas with different expiration times
      const testAreas = [
        { id: 'expires-r3', roundCreated: 1, spellDuration: 2 }, // Expires at round 3
        { id: 'expires-r5', roundCreated: 2, spellDuration: 3 }, // Expires at round 5
        { id: 'expires-r7', roundCreated: 3, spellDuration: 4 }, // Expires at round 7
      ]

      testAreas.forEach(test => {
        const area: SpellMapObject = {
          id: test.id,
          type: 'persistent-area',
          position: { x: 100, y: 100 },
          rotation: 0,
          layer: 0,
          isSpellEffect: true,
          roundCreated: test.roundCreated,
          spellDuration: test.spellDuration,
          persistentAreaData: {
            position: { x: 100, y: 100 },
            radius: 30,
            color: '#000',
            opacity: 0.3,
            spellName: test.id,
            roundCreated: test.roundCreated
          }
        }
        mapStore.addSpellEffect(area)
      })

      // Call cleanup at round 5
      mapStore.cleanupExpiredSpells(5, 1)

      // Get fresh state after cleanup
      const stateAfterCleanup = useMapStore.getState()

      // Check which areas remain
      const area1Exists = stateAfterCleanup.currentMap?.objects.some(obj => obj.id === 'expires-r3')
      const area2Exists = stateAfterCleanup.currentMap?.objects.some(obj => obj.id === 'expires-r5')
      const area3Exists = stateAfterCleanup.currentMap?.objects.some(obj => obj.id === 'expires-r7')

      // Area 1: expires at round 3, current is 5 → should be removed
      expect(area1Exists).toBe(false)
      // Area 2: expires at round 5, current is 5 → should be removed
      expect(area2Exists).toBe(false)
      // Area 3: expires at round 7, current is 5 → should still exist
      expect(area3Exists).toBe(true)
    })
  })

  describe('Multiple Spell Persistence', () => {
    it('should handle multiple spells with different durations', async () => {
      const mapStore = useMapStore.getState()
      const roundStore = useTimelineStore.getState()

      // Create spells with different durations
      const spells = [
        { id: 'spell-1r', duration: 1, name: 'Fireball' },
        { id: 'spell-2r', duration: 2, name: 'Web Fragment' },
        { id: 'spell-3r', duration: 3, name: 'Darkness' }
      ]

      spells.forEach(spell => {
        const area: SpellMapObject = {
          id: spell.id,
          type: 'persistent-area',
          position: { x: 200, y: 200 },
          rotation: 0,
          layer: 0,
          isSpellEffect: true,
          roundCreated: 1,
        eventCreated: 1,
        durationType: 'events' as const,
          spellDuration: spell.duration,
          persistentAreaData: {
            position: { x: 200, y: 200 },
            radius: 40,
            color: '#000',
            opacity: 0.3,
            spellName: spell.name,
            roundCreated: 1
          }
        }
        mapStore.addSpellEffect(area)
      })

      // Round 1: All should exist
      let currentState = useMapStore.getState()
      expect(currentState.currentMap?.objects.filter(obj => obj.id.startsWith('spell-')).length).toBe(3)

      // Round 2: 1-round spell should be gone
      await roundStore.nextEvent()
      await new Promise(resolve => setTimeout(resolve, 100))

      currentState = useMapStore.getState()
      expect(currentState.currentMap?.objects.some(obj => obj.id === 'spell-1r')).toBe(false)
      expect(currentState.currentMap?.objects.some(obj => obj.id === 'spell-2r')).toBe(true)
      expect(currentState.currentMap?.objects.some(obj => obj.id === 'spell-3r')).toBe(true)

      // Round 3: 2-round spell should be gone
      await roundStore.nextEvent()
      await new Promise(resolve => setTimeout(resolve, 100))

      currentState = useMapStore.getState()
      expect(currentState.currentMap?.objects.some(obj => obj.id === 'spell-1r')).toBe(false)
      expect(currentState.currentMap?.objects.some(obj => obj.id === 'spell-2r')).toBe(false)
      expect(currentState.currentMap?.objects.some(obj => obj.id === 'spell-3r')).toBe(true)

      // Round 4: 3-round spell should be gone
      await roundStore.nextEvent()
      await new Promise(resolve => setTimeout(resolve, 100))

      currentState = useMapStore.getState()
      expect(currentState.currentMap?.objects.some(obj => obj.id === 'spell-1r')).toBe(false)
      expect(currentState.currentMap?.objects.some(obj => obj.id === 'spell-2r')).toBe(false)
      expect(currentState.currentMap?.objects.some(obj => obj.id === 'spell-3r')).toBe(false)
    })
  })

  describe('Property Preservation', () => {
    it('should preserve all critical properties through addSpellEffect', () => {
      const mapStore = useMapStore.getState()

      const testArea: SpellMapObject = {
        id: 'test-property-preservation',
        type: 'persistent-area',
        position: { x: 300, y: 300 },
        rotation: 0,
        layer: 5,
        isSpellEffect: true,
        roundCreated: 3,
        eventCreated: 1,
        durationType: 'events' as const,
        spellDuration: 2,
        persistentAreaData: {
          position: { x: 300, y: 300 },
          radius: 50,
          color: '#00ff00',
          opacity: 0.6,
          spellName: 'Test Spell',
          roundCreated: 3
        }
      }

      mapStore.addSpellEffect(testArea)

      const stateAfterAdd = useMapStore.getState()
      const stored = stateAfterAdd.currentMap?.objects.find(obj => obj.id === 'test-property-preservation') as SpellMapObject

      // All critical properties should be preserved
      expect(stored).toBeDefined()
      expect(stored?.type).toBe('persistent-area')
      expect(stored?.isSpellEffect).toBe(true)
      expect(stored?.roundCreated).toBe(3)
      expect(stored?.spellDuration).toBe(2)
      expect(stored?.persistentAreaData).toBeDefined()
      expect(stored?.persistentAreaData?.spellName).toBe('Test Spell')
    })
  })

  describe('Edge Cases', () => {
    it('should not remove spell effects with duration 0 (instant spells)', () => {
      const mapStore = useMapStore.getState()

      const instantSpell: SpellMapObject = {
        id: 'test-instant-spell',
        type: 'spell',
        position: { x: 100, y: 100 },
        rotation: 0,
        layer: 10,
        isSpellEffect: true,
        roundCreated: 1,
        eventCreated: 1,
        durationType: 'events' as const,
        spellDuration: 0 // Instant spell
      }

      mapStore.addSpellEffect(instantSpell)

      // Call cleanup - instant spells should not be removed
      mapStore.cleanupExpiredSpells(5, 1)

      const stateAfterCleanup = useMapStore.getState()
      const stillExists = stateAfterCleanup.currentMap?.objects.some(obj => obj.id === 'test-instant-spell')
      expect(stillExists).toBe(true)
    })

    it('should handle round jumps correctly', async () => {
      const mapStore = useMapStore.getState()
      const roundStore = useTimelineStore.getState()

      const burnArea: SpellMapObject = {
        id: 'test-round-jump',
        type: 'persistent-area',
        position: { x: 200, y: 200 },
        rotation: 0,
        layer: 0,
        isSpellEffect: true,
        roundCreated: 1,
        eventCreated: 1,
        durationType: 'events' as const,
        spellDuration: 3, // Expires at round 4
        persistentAreaData: {
          position: { x: 200, y: 200 },
          radius: 40,
          color: '#ff0000',
          opacity: 0.3,
          spellName: 'Test',
          roundCreated: 1
        }
      }

      mapStore.addSpellEffect(burnArea)

      // Jump directly to round 3 (should still exist)
      roundStore.goToEvent(3)
      await new Promise(resolve => setTimeout(resolve, 100))

      let state = useMapStore.getState()
      expect(state.currentMap?.objects.some(obj => obj.id === 'test-round-jump')).toBe(true)

      // Jump to round 4 (should be removed)
      roundStore.goToEvent(4)
      await new Promise(resolve => setTimeout(resolve, 100))

      state = useMapStore.getState()
      expect(state.currentMap?.objects.some(obj => obj.id === 'test-round-jump')).toBe(false)

      // Jump back to round 2 (should not reappear)
      roundStore.goToEvent(2)
      await new Promise(resolve => setTimeout(resolve, 100))

      state = useMapStore.getState()
      expect(state.currentMap?.objects.some(obj => obj.id === 'test-round-jump')).toBe(false)
    })
  })
})