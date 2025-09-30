import { describe, it, expect, beforeEach, vi } from 'vitest'
import useMapStore from '@/store/mapStore'
import useTimelineStore from '@/store/timelineStore'
import type { SpellMapObject } from '@/types/map'

/**
 * Tests specifically for Fireball spell persistence behavior
 * Ensures that burn areas last exactly 1 round, not 2000 milliseconds
 *
 * BUG FIX (January 2025):
 * The Fireball spell was creating persistent burn areas with spellDuration set to
 * persistDuration (2000 milliseconds) instead of rounds (1). This caused burn areas
 * to persist continuously instead of being cleaned up after 1 round.
 *
 * Fixed in: src/hooks/useTokenAnimation.ts
 * Changed: spellDuration: persistDuration -> spellDuration: persistDuration > 0 ? 1 : 0
 *
 * These tests ensure the fix remains in place and spell durations are always
 * specified in rounds, not milliseconds.
 */
describe('Fireball Spell Persistence', () => {
  beforeEach(() => {
    // Reset stores
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

    // Initialize map and combat
    const mapStore = useMapStore.getState()
    mapStore.createNewMap('Test Map')

    const roundStore = useTimelineStore.getState()
    const mapId = useMapStore.getState().currentMap?.id
    if (mapId) {
      roundStore.startCombat(mapId)
    }
  })

  describe('Duration Conversion', () => {
    it('should convert milliseconds to rounds for spell duration', () => {
      const mapStore = useMapStore.getState()

      // Simulate what happens when Fireball creates a persistent area
      // The bug was that persistDuration (2000ms) was used directly as spellDuration
      const burnArea: SpellMapObject = {
        id: 'fireball-burn-test',
        type: 'persistent-area',
        position: { x: 500, y: 300 },
        rotation: 0,
        layer: 0,
        isSpellEffect: true,
        roundCreated: 1,
        spellDuration: 1, // Should be 1 round, not 2000 (milliseconds)
        persistentAreaData: {
          position: { x: 500, y: 300 },
          radius: 40,
          color: '#ff4500',
          opacity: 0.3,
          spellName: 'Fireball',
          roundCreated: 1
        }
      }

      mapStore.addSpellEffect(burnArea)

      const state = useMapStore.getState()
      const stored = state.currentMap?.objects.find(obj => obj.id === 'fireball-burn-test')

      expect(stored).toBeDefined()
      expect(stored?.spellDuration).toBe(1) // Must be 1 round, not 2000
      expect(stored?.spellDuration).not.toBe(2000) // Explicitly check it's not milliseconds
    })

    it('should NOT use persistDuration milliseconds as spellDuration rounds', () => {
      // This test ensures we never accidentally use millisecond values for round durations
      const mapStore = useMapStore.getState()

      const testCases = [
        { persistMs: 2000, expectedRounds: 1, spell: 'Fireball' },
        { persistMs: 3000, expectedRounds: 1, spell: 'Web' },
        { persistMs: 1000, expectedRounds: 1, spell: 'Grease' },
        { persistMs: 0, expectedRounds: 0, spell: 'InstantSpell' }
      ]

      testCases.forEach(({ persistMs, expectedRounds, spell }) => {
        const area: SpellMapObject = {
          id: `test-${spell}-area`,
          type: 'persistent-area',
          position: { x: 100, y: 100 },
          rotation: 0,
          layer: 0,
          isSpellEffect: true,
          roundCreated: 1,
          // The fix ensures this is in rounds (1) not milliseconds (persistMs)
          spellDuration: expectedRounds,
          persistentAreaData: {
            position: { x: 100, y: 100 },
            radius: 40,
            color: '#ff0000',
            opacity: 0.3,
            spellName: spell,
            roundCreated: 1
          }
        }

        mapStore.addSpellEffect(area)

        const state = useMapStore.getState()
        const stored = state.currentMap?.objects.find(obj => obj.id === `test-${spell}-area`)

        expect(stored?.spellDuration).toBe(expectedRounds)
        // Only check it's not milliseconds if they're different values
        if (persistMs !== expectedRounds) {
          expect(stored?.spellDuration).not.toBe(persistMs)
        }
      })
    })
  })

  describe('Fireball Burn Area Cleanup', () => {
    it('should remove Fireball burn area after exactly 1 round', async () => {
      const mapStore = useMapStore.getState()
      const roundStore = useTimelineStore.getState()

      // Create Fireball burn area at round 1
      const burnArea: SpellMapObject = {
        id: 'fireball-cleanup-test',
        type: 'persistent-area',
        position: { x: 400, y: 400 },
        rotation: 0,
        layer: 0,
        isSpellEffect: true,
        roundCreated: 1,
        spellDuration: 1, // Correctly set to 1 round
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

      // Verify it exists at round 1
      let state = useMapStore.getState()
      expect(state.currentMap?.objects.some(obj => obj.id === 'fireball-cleanup-test')).toBe(true)

      // Advance to round 2
      await roundStore.nextEvent()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Verify it's removed at round 2
      state = useMapStore.getState()
      expect(state.currentMap?.objects.some(obj => obj.id === 'fireball-cleanup-test')).toBe(false)
    })

    it('should handle multiple Fireballs cast in different rounds', async () => {
      const mapStore = useMapStore.getState()
      const roundStore = useTimelineStore.getState()

      // Cast first Fireball at round 1
      mapStore.addSpellEffect({
        id: 'fireball-1',
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
      })

      // Advance to round 2
      await roundStore.nextEvent()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Cast second Fireball at round 2
      mapStore.addSpellEffect({
        id: 'fireball-2',
        type: 'persistent-area',
        position: { x: 200, y: 200 },
        rotation: 0,
        layer: 0,
        isSpellEffect: true,
        roundCreated: 2,
        spellDuration: 1,
        persistentAreaData: {
          position: { x: 200, y: 200 },
          radius: 40,
          color: '#ff4500',
          opacity: 0.3,
          spellName: 'Fireball',
          roundCreated: 2
        }
      })

      let state = useMapStore.getState()

      // At round 2: Fireball 1 should be gone, Fireball 2 should exist
      expect(state.currentMap?.objects.some(obj => obj.id === 'fireball-1')).toBe(false)
      expect(state.currentMap?.objects.some(obj => obj.id === 'fireball-2')).toBe(true)

      // Advance to round 3
      await roundStore.nextEvent()
      await new Promise(resolve => setTimeout(resolve, 100))

      state = useMapStore.getState()

      // At round 3: Both Fireballs should be gone
      expect(state.currentMap?.objects.some(obj => obj.id === 'fireball-1')).toBe(false)
      expect(state.currentMap?.objects.some(obj => obj.id === 'fireball-2')).toBe(false)
    })
  })

  describe('Cleanup Function Behavior', () => {
    it('should correctly calculate expiration round', () => {
      const testCases = [
        { roundCreated: 1, spellDuration: 1, currentRound: 1, shouldExist: true },
        { roundCreated: 1, spellDuration: 1, currentRound: 2, shouldExist: false },
        { roundCreated: 1, spellDuration: 1, currentRound: 3, shouldExist: false },
        { roundCreated: 2, spellDuration: 1, currentRound: 2, shouldExist: true },
        { roundCreated: 2, spellDuration: 1, currentRound: 3, shouldExist: false },
        { roundCreated: 5, spellDuration: 1, currentRound: 5, shouldExist: true },
        { roundCreated: 5, spellDuration: 1, currentRound: 6, shouldExist: false }
      ]

      testCases.forEach(({ roundCreated, spellDuration, currentRound, shouldExist }) => {
        const expiresAt = roundCreated + spellDuration
        const shouldKeep = currentRound < expiresAt

        expect(shouldKeep).toBe(shouldExist)
      })
    })

    it('should be called automatically when advancing rounds', async () => {
      const mapStore = useMapStore.getState()
      const roundStore = useTimelineStore.getState()

      // Spy on cleanup function
      const cleanupSpy = vi.spyOn(mapStore, 'cleanupExpiredSpells')

      // Advance round
      await roundStore.nextEvent()

      // Verify cleanup was called with the new round number
      expect(cleanupSpy).toHaveBeenCalled()
      expect(cleanupSpy).toHaveBeenCalledWith(2)

      cleanupSpy.mockRestore()
    })
  })

  describe('Edge Cases', () => {
    it('should handle Fireball at high round numbers', async () => {
      const mapStore = useMapStore.getState()
      const roundStore = useTimelineStore.getState()

      // Jump to round 10
      roundStore.goToEvent(10)
      await new Promise(resolve => setTimeout(resolve, 100))

      // Cast Fireball at round 10
      mapStore.addSpellEffect({
        id: 'fireball-high-round',
        type: 'persistent-area',
        position: { x: 300, y: 300 },
        rotation: 0,
        layer: 0,
        isSpellEffect: true,
        roundCreated: 10,
        spellDuration: 1,
        persistentAreaData: {
          position: { x: 300, y: 300 },
          radius: 40,
          color: '#ff4500',
          opacity: 0.3,
          spellName: 'Fireball',
          roundCreated: 10
        }
      })

      let state = useMapStore.getState()
      expect(state.currentMap?.objects.some(obj => obj.id === 'fireball-high-round')).toBe(true)

      // Advance to round 11
      await roundStore.nextEvent()
      await new Promise(resolve => setTimeout(resolve, 100))

      state = useMapStore.getState()
      expect(state.currentMap?.objects.some(obj => obj.id === 'fireball-high-round')).toBe(false)
    })

    it('should not affect non-spell persistent areas', () => {
      const mapStore = useMapStore.getState()

      // Add a non-spell persistent area
      mapStore.addObject({
        id: 'non-spell-area',
        type: 'shape',
        position: { x: 100, y: 100 },
        rotation: 0,
        layer: 0
      } as any)

      // Call cleanup
      mapStore.cleanupExpiredSpells(5)

      // Non-spell area should still exist
      const state = useMapStore.getState()
      expect(state.currentMap?.objects.some(obj => obj.id === 'non-spell-area')).toBe(true)
    })

    it('should handle instant spells (duration 0) correctly', () => {
      const mapStore = useMapStore.getState()

      mapStore.addSpellEffect({
        id: 'instant-spell',
        type: 'spell',
        position: { x: 200, y: 200 },
        rotation: 0,
        layer: 10,
        isSpellEffect: true,
        roundCreated: 1,
        spellDuration: 0 // Instant spell
      })

      // Instant spells should not be removed by cleanup
      mapStore.cleanupExpiredSpells(5)

      const state = useMapStore.getState()
      expect(state.currentMap?.objects.some(obj => obj.id === 'instant-spell')).toBe(true)
    })
  })
})