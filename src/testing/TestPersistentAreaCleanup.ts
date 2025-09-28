import type { TestScenario } from './TestScenarios'
import type { SpellMapObject } from '@/types'
import useMapStore from '@/store/mapStore'
import useRoundStore from '@/store/roundStore'

/**
 * Test scenario to verify persistent area cleanup after spell duration expires
 */
export const persistentAreaCleanupTest: TestScenario = {
  id: 'persistent-area-cleanup-test',
  name: 'Persistent Area Cleanup Test',
  description: 'Verifies that persistent spell areas are removed after their duration expires',
  category: 'spells',
  steps: [
    // Start combat
    {
      type: 'action',
      action: {
        type: 'startCombat',
        params: {}
      },
      description: 'Start combat mode'
    },

    // Log initial state
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: () => {
            const mapStore = useMapStore.getState()
            const roundStore = useRoundStore.getState()
            console.log('=== INITIAL STATE ===')
            console.log('Current Round:', roundStore.currentRound)
            console.log('Map objects:', mapStore.currentMap?.objects.length || 0)
            console.log('Spell effects:', mapStore.currentMap?.objects.filter(obj =>
              obj.type === 'spell' || obj.type === 'persistent-area'
            ))
          }
        }
      },
      description: 'Log initial state'
    },

    // Cast Fireball with 1-round persistence
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: () => {
            const mapStore = useMapStore.getState()
            const roundStore = useRoundStore.getState()

            // Create the spell effect
            const spellObject = {
              id: `spell-fireball-${Date.now()}`,
              type: 'spell' as const,
              position: { x: 200, y: 300 },
              rotation: 0,
              layer: 100,
              isSpellEffect: true,
              spellData: {
                type: 'spell' as const,
                spellName: 'Fireball',
                category: 'projectile-burst' as const,
                fromPosition: { x: 200, y: 300 },
                toPosition: { x: 500, y: 300 },
                color: '#ff4500',
                size: 20,
                duration: 500, // Short duration for testing
                persistDuration: 1, // 1 round
                burstRadius: 40,
                roundCreated: roundStore.currentRound
              },
              roundCreated: roundStore.currentRound,
              spellDuration: 0 // Initial spell object doesn't persist
            }

            mapStore.addSpellEffect(spellObject)
            console.log('Fireball spell added at round', roundStore.currentRound)

            // Simulate the creation of persistent area after animation
            setTimeout(() => {
              const persistentArea = {
                id: `persistent-fireball-${Date.now()}`,
                type: 'persistent-area' as const,
                position: { x: 500, y: 300 },
                rotation: 0,
                layer: 0,
                isSpellEffect: true,
                persistentAreaData: {
                  position: { x: 500, y: 300 },
                  radius: 40,
                  color: '#ff4500',
                  opacity: 0.3,
                  spellName: 'Fireball',
                  roundCreated: roundStore.currentRound
                },
                roundCreated: roundStore.currentRound,
                spellDuration: 1 // Persists for 1 round
              }

              mapStore.addSpellEffect(persistentArea)
              console.log('Fireball persistent area added at round', roundStore.currentRound)
            }, 600)
          }
        }
      },
      description: 'Cast Fireball spell with 1-round persistent area'
    },

    // Wait for persistent area to be created
    {
      type: 'wait',
      wait: 1000,
      description: 'Wait for persistent area creation'
    },

    // Check persistent area exists
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: () => {
            const mapStore = useMapStore.getState()
            const roundStore = useRoundStore.getState()
            const persistentAreas = mapStore.currentMap?.objects.filter(obj =>
              obj.type === 'persistent-area'
            ) || []

            console.log('=== AFTER FIREBALL (Round', roundStore.currentRound, ') ===')
            console.log('Persistent areas:', persistentAreas.length)
            persistentAreas.forEach(area => {
              console.log('  - Area:', {
                id: area.id,
                roundCreated: area.roundCreated,
                spellDuration: area.spellDuration,
              })
            })
          }
        }
      },
      description: 'Check persistent area exists'
    },

    // Verify Fireball persistent area exists
    {
      type: 'assert',
      assert: {
        type: 'custom',
        params: {
          check: () => {
            const mapStore = useMapStore.getState()
            const persistentAreas = mapStore.currentMap?.objects.filter(obj =>
              obj.type === 'persistent-area'
            ) || []
            return persistentAreas.length > 0
          }
        },
        expected: true
      },
      description: 'Verify Fireball persistent area exists'
    },

    // Advance to round 2
    {
      type: 'action',
      action: {
        type: 'nextRound',
        params: {}
      },
      description: 'Advance to round 2'
    },

    {
      type: 'wait',
      wait: 500,
      description: 'Wait for round transition'
    },

    // Check if cleanup was called
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: () => {
            const mapStore = useMapStore.getState()
            const roundStore = useRoundStore.getState()
            const persistentAreas = mapStore.currentMap?.objects.filter(obj =>
              obj.type === 'persistent-area'
            ) || []

            console.log('=== AFTER ROUND 2 (Round', roundStore.currentRound, ') ===')
            console.log('Persistent areas remaining:', persistentAreas.length)
            persistentAreas.forEach(area => {
              const shouldBeRemoved = area.spellDuration !== undefined &&
                                     area.roundCreated !== undefined &&
                                     area.spellDuration > 0 &&
                                     roundStore.currentRound >= (area.roundCreated + area.spellDuration)
              console.log('  - Area:', {
                id: area.id,
                roundCreated: area.roundCreated,
                spellDuration: area.spellDuration,
                currentRound: roundStore.currentRound,
                shouldBeRemoved
              })
            })

            // Manually call cleanup to test the function
            console.log('Manually calling cleanupExpiredSpells...')
            mapStore.cleanupExpiredSpells(roundStore.currentRound)

            const areasAfterCleanup = mapStore.currentMap?.objects.filter(obj =>
              obj.type === 'persistent-area'
            ) || []
            console.log('Areas after manual cleanup:', areasAfterCleanup.length)
          }
        }
      },
      description: 'Check cleanup and manually test'
    },

    // Verify Fireball area is removed
    {
      type: 'assert',
      assert: {
        type: 'custom',
        params: {
          check: () => {
            const mapStore = useMapStore.getState()
            const persistentAreas = mapStore.currentMap?.objects.filter(obj =>
              obj.type === 'persistent-area'
            ) || []
            console.log('Final check - persistent areas:', persistentAreas.length)
            return persistentAreas.length === 0
          }
        },
        expected: true
      },
      description: 'Verify Fireball persistent area is removed after 1 round'
    },

    // Now test with Darkness (3 rounds)
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: () => {
            const mapStore = useMapStore.getState()
            const roundStore = useRoundStore.getState()

            const darknessArea = {
              id: `persistent-darkness-${Date.now()}`,
              type: 'persistent-area' as const,
              position: { x: 400, y: 400 },
              rotation: 0,
              layer: 0,
              isSpellEffect: true,
              persistentAreaData: {
                position: { x: 400, y: 400 },
                radius: 60,
                color: '#000000',
                opacity: 0.8,
                spellName: 'Darkness',
                roundCreated: roundStore.currentRound
              },
              roundCreated: roundStore.currentRound,
              spellDuration: 3 // Persists for 3 rounds
            }

            mapStore.addSpellEffect(darknessArea)
            console.log('Darkness added at round', roundStore.currentRound, 'expires at', roundStore.currentRound + 3)
          }
        }
      },
      description: 'Cast Darkness spell with 3-round duration'
    },

    // Verify Darkness exists
    {
      type: 'assert',
      assert: {
        type: 'custom',
        params: {
          check: () => {
            const mapStore = useMapStore.getState()
            const darknessAreas = mapStore.currentMap?.objects.filter(obj =>
              obj.type === 'persistent-area' &&
              (obj as SpellMapObject).persistentAreaData?.spellName === 'Darkness'
            ) || []
            return darknessAreas.length === 1
          }
        },
        expected: true
      },
      description: 'Verify Darkness area exists'
    },

    // Advance one more round (round 3)
    {
      type: 'action',
      action: {
        type: 'nextRound',
        params: {}
      },
      description: 'Advance to round 3'
    },

    {
      type: 'wait',
      wait: 500,
      description: 'Wait for round transition'
    },

    // Darkness should still exist at round 3
    {
      type: 'assert',
      assert: {
        type: 'custom',
        params: {
          check: () => {
            const mapStore = useMapStore.getState()
            const roundStore = useRoundStore.getState()
            const darknessAreas = mapStore.currentMap?.objects.filter(obj =>
              obj.type === 'persistent-area' &&
              (obj as SpellMapObject).persistentAreaData?.spellName === 'Darkness'
            ) || []
            console.log('Round', roundStore.currentRound, '- Darkness areas:', darknessAreas.length)
            return darknessAreas.length === 1
          }
        },
        expected: true
      },
      description: 'Darkness should still exist at round 3'
    },

    // Advance to round 5 (Darkness expires after round 4)
    {
      type: 'action',
      action: {
        type: 'nextRound',
        params: {}
      },
      description: 'Advance to round 4'
    },

    {
      type: 'wait',
      wait: 500,
      description: 'Wait'
    },

    {
      type: 'action',
      action: {
        type: 'nextRound',
        params: {}
      },
      description: 'Advance to round 5'
    },

    {
      type: 'wait',
      wait: 500,
      description: 'Wait for cleanup'
    },

    // Darkness should be removed at round 5
    {
      type: 'assert',
      assert: {
        type: 'custom',
        params: {
          check: () => {
            const mapStore = useMapStore.getState()
            const roundStore = useRoundStore.getState()
            const darknessAreas = mapStore.currentMap?.objects.filter(obj =>
              obj.type === 'persistent-area' &&
              (obj as SpellMapObject).persistentAreaData?.spellName === 'Darkness'
            ) || []
            console.log('Round', roundStore.currentRound, '- Darkness areas after cleanup:', darknessAreas.length)
            return darknessAreas.length === 0
          }
        },
        expected: true
      },
      description: 'Darkness should be removed at round 5'
    }
  ]
}

// Add to test scenarios
export function addPersistentAreaCleanupTest(scenarios: TestScenario[]): TestScenario[] {
  return [...scenarios, persistentAreaCleanupTest]
}