/**
 * Individual Spell Test Scenarios
 *
 * Comprehensive tests for each D&D spell with full lifecycle:
 * - Token creation and movement
 * - Bidirectional spell casting
 * - Post-effect verification
 * - Status effect tracking
 * - Continuous effect persistence
 */

import { nanoid } from 'nanoid'

import type { TestScenario } from './TestScenarios'
import { moveToNextRound, hasPersistentAreaSpell } from './testHelpers'

export const individualSpellTests: TestScenario[] = [
  {
    id: 'fireball-full-test',
    name: 'Fireball - Full Lifecycle',
    description: 'Complete Fireball test with movements, post-effects, and status effects',
    category: 'spells',
    steps: [
      // Step 1: Create token 1
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'mage-1',
            name: 'Fire Mage',
            position: { x: 300, y: 400 },
            size: 'medium',
            color: '#DC143C',
            shape: 'circle'
          }
        },
        description: 'Create Fire Mage (token 1)'
      },
      {
        type: 'wait',
        wait: 200,
        description: 'Wait'
      },

      // Step 2: Create token 2
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'mage-2',
            name: 'Ice Mage',
            position: { x: 700, y: 400 },
            size: 'medium',
            color: '#4169E1',
            shape: 'circle'
          }
        },
        description: 'Create Ice Mage (token 2)'
      },
      {
        type: 'wait',
        wait: 200,
        description: 'Wait'
      },

      // Step 3: Start combat
      {
        type: 'action',
        action: {
          type: 'startCombat',
          params: {}
        },
        description: 'Start combat'
      },
      {
        type: 'wait',
        wait: 300,
        description: 'Wait for combat'
      },

      // Step 4: Assign movement for token 1 (3 cells up)
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('mage-1', 'move', {
                type: 'move',
                fromPosition: { x: 300, y: 400 },
                toPosition: { x: 300, y: 250 }, // 3 cells up (50px per cell)
                duration: 1000,
                easing: 'ease-in-out'
              }, 1)
            }
          }
        },
        description: 'Assign movement for Fire Mage (3 cells up)'
      },

      // Step 5: Assign movement for token 2 (3 cells down)
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('mage-2', 'move', {
                type: 'move',
                fromPosition: { x: 700, y: 400 },
                toPosition: { x: 700, y: 550 }, // 3 cells down
                duration: 1000,
                easing: 'ease-in-out'
              }, 1)
            }
          }
        },
        description: 'Assign movement for Ice Mage (3 cells down)'
      },

      // Step 6: Assign Fireball from token 1 to token 2
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('mage-1', 'spell', {
                type: 'spell',
                spellName: 'Fireball',
                category: 'projectile-burst',
                fromPosition: { x: 300, y: 250 },
                toPosition: { x: 700, y: 550 },
                targetTokenId: 'mage-2',
                trackTarget: true,
                color: '#FF6B35',
                size: 20,
                duration: 1500,
                projectileSpeed: 500,
                trailLength: 8,
                trailFade: 0.8,
                burstRadius: 210,
                burstColor: '#FF4500',
                burstDuration: 600,
                persistDuration: 2,
                persistColor: '#CC2500',
                persistOpacity: 0.4,
                durationType: 'events',
                statusEffect: {
                  type: 'flaming',
                  duration: 1,
                  intensity: 1
                },
                id: nanoid()
              }, 1)
            }
          }
        },
        description: 'Assign Fireball from Fire Mage to Ice Mage'
      },

      // Step 7: Assign spell from token 2 to token 1 initial position
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('mage-2', 'spell', {
                type: 'spell',
                spellName: 'Fireball',
                category: 'projectile-burst',
                fromPosition: { x: 700, y: 550 },
                toPosition: { x: 300, y: 400 }, // Initial position of token 1
                color: '#FF6B35',
                size: 20,
                duration: 1500,
                projectileSpeed: 500,
                trailLength: 8,
                trailFade: 0.8,
                burstRadius: 210,
                burstColor: '#FF4500',
                burstDuration: 600,
                persistDuration: 2,
                persistColor: '#CC2500',
                persistOpacity: 0.4,
                durationType: 'events',
                statusEffect: {
                  type: 'flaming',
                  duration: 1,
                  intensity: 1
                },
                id: nanoid()
              }, 1)
            }
          }
        },
        description: 'Assign Fireball from Ice Mage to Fire Mage initial position'
      },

      // Step 8: Execute event 1 - token 1 movement
      {
        type: 'action',
        action: {
          type: 'nextEvent',
          params: {}
        },
        description: 'Execute event 1 - Fire Mage moves up'
      },
      {
        type: 'wait',
        wait: 1200,
        description: 'Wait for movement animation'
      },

      // Step 9: Execute event 2 - token 2 movement
      {
        type: 'action',
        action: {
          type: 'nextEvent',
          params: {}
        },
        description: 'Execute event 2 - Ice Mage moves down'
      },
      {
        type: 'wait',
        wait: 1200,
        description: 'Wait for movement animation'
      },

      // Step 10: Execute event 3 - Fireball from token 1 to token 2
      {
        type: 'action',
        action: {
          type: 'nextEvent',
          params: {}
        },
        description: 'Execute event 3 - Fireball cast and explodes, creates post-effect'
      },
      {
        type: 'wait',
        wait: 3000,
        description: 'Wait for explosion animation and persistent area creation (1500ms projectile + 600ms burst + 900ms buffer)'
      },

      // Step 11: Debug - log all objects to see what exists
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const mapStore = (await import('@/store/mapStore')).default.getState()
              const allObjects = mapStore.currentMap?.objects || []
              console.log('[TEST DEBUG] All objects after event 3:', allObjects.map(obj => ({
                id: obj.id,
                type: obj.type,
                isSpellEffect: (obj as any).isSpellEffect,
                persistDuration: (obj as any).spellDuration,
                durationType: (obj as any).durationType
              })))
              const spells = allObjects.filter(obj => obj.type === 'spell')
              console.log('[TEST DEBUG] Spell objects:', spells.length)
              const persistentAreas = allObjects.filter(obj => obj.type === 'persistent-area')
              console.log('[TEST DEBUG] Persistent areas:', persistentAreas.length)
            }
          }
        },
        description: 'Debug - log all objects'
      },

      // Step 12: Check status effects present immediately after Fireball hits
      {
        type: 'assert',
        assert: {
          type: 'custom',
          params: {
            check: async () => {
              const mapStore = (await import('@/store/mapStore')).default.getState()
              const token = mapStore.currentMap?.objects.find(obj => obj.id === 'mage-2')
              return (token as any)?.statusEffects?.some((e: any) => e.type === 'flaming') || false
            }
          },
          expected: true
        },
        description: 'Verify flaming status effect present on Ice Mage'
      },

      // Step 13: Verify post-effect created (event 0/2 - just created)
      {
        type: 'assert',
        assert: {
          type: 'custom',
          params: {
            check: async () => {
              const mapStore = (await import('@/store/mapStore')).default.getState()
              const persistentAreas = mapStore.currentMap?.objects.filter(obj => obj.type === 'persistent-area') || []
              console.log('[TEST] Checking for persistent areas, found:', persistentAreas.length)
              return persistentAreas.length > 0
            }
          },
          expected: true
        },
        description: 'Verify Fireball post-effect created (1 persistent area)'
      },

      // Step 14: Execute event 4 - Fireball from token 2 to token 1
      {
        type: 'action',
        action: {
          type: 'nextEvent',
          params: {}
        },
        description: 'Execute event 4 - Return Fireball cast and explodes (post-effect event 1/2 for first Fireball)'
      },
      {
        type: 'wait',
        wait: 3000,
        description: 'Wait for explosion animation and persistent area creation (1500ms projectile + 600ms burst + 900ms buffer)'
      },

      // Step 15: Verify both post-effects present (event 1/2 for first, event 0/2 for second)
      {
        type: 'assert',
        assert: {
          type: 'custom',
          params: {
            check: async () => {
              const mapStore = (await import('@/store/mapStore')).default.getState()
              const persistentAreas = mapStore.currentMap?.objects.filter(obj => obj.type === 'persistent-area') || []
              return persistentAreas.length === 2
            }
          },
          expected: true
        },
        description: 'Verify both Fireball post-effects present'
      },

      // Step 16: Advance to Round 2 (event counter increments, triggers post-effect cleanup)
      {
        type: 'action',
        action: {
          type: 'nextRound',
          params: {}
        },
        description: 'Execute Round 2 - event counter increments (event 1/2 for both post-effects)'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait for cleanup'
      },

      // Step 17: Verify both post-effects still present (event 1/2)
      {
        type: 'assert',
        assert: {
          type: 'custom',
          params: {
            check: async () => {
              const mapStore = (await import('@/store/mapStore')).default.getState()
              const persistentAreas = mapStore.currentMap?.objects.filter(obj => obj.type === 'persistent-area') || []
              return persistentAreas.length === 2
            }
          },
          expected: true
        },
        description: 'Verify both post-effects still present (event 1/2)'
      },

      // Step 18: Advance to Round 3 (event 2/2 for both post-effects - should expire)
      {
        type: 'action',
        action: {
          type: 'nextRound',
          params: {}
        },
        description: 'Execute Round 3 - post-effects expire after event 2/2'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait for cleanup'
      },

      // Step 19: Verify all post-effects cleaned up
      {
        type: 'assert',
        assert: {
          type: 'custom',
          params: {
            check: async () => {
              const mapStore = (await import('@/store/mapStore')).default.getState()
              const persistentAreas = mapStore.currentMap?.objects.filter(obj => obj.type === 'persistent-area') || []
              return persistentAreas.length === 0
            }
          },
          expected: true
        },
        description: 'Verify all post-effects cleaned up after 2 events'
      },

      // Step 20: Verify status effects also removed (expired after Round 1)
      {
        type: 'assert',
        assert: {
          type: 'custom',
          params: {
            check: async () => {
              const mapStore = (await import('@/store/mapStore')).default.getState()
              const token = mapStore.currentMap?.objects.find(obj => obj.id === 'mage-2')
              return !(token as any)?.statusEffects?.some((e: any) => e.type === 'flaming')
            }
          },
          expected: true
        },
        description: 'Verify status effects removed (expired after Round 1)'
      }
    ]
  },

  {
    id: 'magic-missile-full-test',
    name: 'Magic Missile - Full Lifecycle',
    description: 'Complete Magic Missile test with movements and tracking',
    category: 'spells',
    steps: [
      // Steps 1-3: Token creation and combat start
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'wizard-1',
            name: 'Wizard A',
            position: { x: 300, y: 400 },
            size: 'medium',
            color: '#9370DB',
            shape: 'circle'
          }
        },
        description: 'Create Wizard A (token 1)'
      },
      {
        type: 'wait',
        wait: 200,
        description: 'Wait'
      },
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'wizard-2',
            name: 'Wizard B',
            position: { x: 700, y: 400 },
            size: 'medium',
            color: '#BA55D3',
            shape: 'circle'
          }
        },
        description: 'Create Wizard B (token 2)'
      },
      {
        type: 'wait',
        wait: 200,
        description: 'Wait'
      },
      {
        type: 'action',
        action: {
          type: 'startCombat',
          params: {}
        },
        description: 'Start combat'
      },
      {
        type: 'wait',
        wait: 300,
        description: 'Wait'
      },

      // Steps 4-5: Movements
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('wizard-1', 'move', {
                type: 'move',
                fromPosition: { x: 300, y: 400 },
                toPosition: { x: 300, y: 250 }, // 3 cells up
                duration: 1000,
                easing: 'ease-in-out'
              }, 1)
            }
          }
        },
        description: 'Assign movement for Wizard A (3 cells up)'
      },
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('wizard-2', 'move', {
                type: 'move',
                fromPosition: { x: 700, y: 400 },
                toPosition: { x: 700, y: 550 }, // 3 cells down
                duration: 1000,
                easing: 'ease-in-out'
              }, 1)
            }
          }
        },
        description: 'Assign movement for Wizard B (3 cells down)'
      },

      // Steps 6-7: Spell assignments
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('wizard-1', 'spell', {
                type: 'spell',
                spellName: 'Magic Missile',
                category: 'projectile',
                fromPosition: { x: 300, y: 250 },
                toPosition: { x: 700, y: 550 },
                targetTokenId: 'wizard-2',
                trackTarget: true,
                color: '#9370DB',
                size: 8,
                duration: 1200,
                curved: true,
                curveHeight: 60,
                projectileSpeed: 400,
                trailLength: 12,
                trailFade: 0.75,
                id: nanoid()
              }, 1)
            }
          }
        },
        description: 'Assign Magic Missile from Wizard A to Wizard B'
      },
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('wizard-2', 'spell', {
                type: 'spell',
                spellName: 'Magic Missile',
                category: 'projectile',
                fromPosition: { x: 700, y: 550 },
                toPosition: { x: 300, y: 400 }, // Initial position
                color: '#9370DB',
                size: 8,
                duration: 1200,
                curved: true,
                curveHeight: 60,
                projectileSpeed: 400,
                trailLength: 12,
                trailFade: 0.75,
                id: nanoid()
              }, 1)
            }
          }
        },
        description: 'Assign Magic Missile from Wizard B to Wizard A initial position'
      },

      // Step 8: Execute animations
      {
        type: 'action',
        action: {
          type: 'nextRound',
          params: {}
        },
        description: 'Execute event - all animations play'
      },
      {
        type: 'wait',
        wait: 3000,
        description: 'Wait for animations'
      },

      // Magic Missile has NO post-effects, NO status effects, NO continuous effects

      // Step 9: Execute next event and verify cleanup
      {
        type: 'action',
        action: {
          type: 'nextRound',
          params: {}
        },
        description: 'Execute next event'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait'
      },
      {
        type: 'assert',
        assert: {
          type: 'custom',
          params: {
            check: async () => {
              const mapStore = (await import('@/store/mapStore')).default.getState()
              const spellObjects = mapStore.currentMap?.objects.filter(obj => obj.type === 'spell') || []
              return spellObjects.length === 0
            }
          },
          expected: true
        },
        description: 'Verify all effects cleaned up (Magic Missile is instant)'
      }
    ]
  },

  {
    id: 'dragon-breath-full-test',
    name: 'Breath of the Dragon - Full Lifecycle',
    description: 'Complete Breath of the Dragon test with cone area and fire damage',
    category: 'spells',
    steps: [
      // Token creation and combat
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'dragonborn-1',
            name: 'Dragonborn A',
            position: { x: 300, y: 400 },
            size: 'medium',
            color: '#DC143C',
            shape: 'circle'
          }
        },
        description: 'Create Dragonborn A (token 1)'
      },
      {
        type: 'wait',
        wait: 200,
        description: 'Wait'
      },
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'dragonborn-2',
            name: 'Dragonborn B',
            position: { x: 700, y: 400 },
            size: 'medium',
            color: '#4169E1',
            shape: 'circle'
          }
        },
        description: 'Create Dragonborn B (token 2)'
      },
      {
        type: 'wait',
        wait: 200,
        description: 'Wait'
      },
      {
        type: 'action',
        action: {
          type: 'startCombat',
          params: {}
        },
        description: 'Start combat'
      },
      {
        type: 'wait',
        wait: 300,
        description: 'Wait'
      },

      // Movements
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('dragonborn-1', 'move', {
                type: 'move',
                fromPosition: { x: 300, y: 400 },
                toPosition: { x: 300, y: 250 }, // 3 cells up
                duration: 1000,
                easing: 'ease-in-out'
              }, 1)
            }
          }
        },
        description: 'Assign movement for Dragonborn A (3 cells up)'
      },
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('dragonborn-2', 'move', {
                type: 'move',
                fromPosition: { x: 700, y: 400 },
                toPosition: { x: 700, y: 550 }, // 3 cells down
                duration: 1000,
                easing: 'ease-in-out'
              }, 1)
            }
          }
        },
        description: 'Assign movement for Dragonborn B (3 cells down)'
      },

      // Dragon Breath spells
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('dragonborn-1', 'spell', {
                type: 'spell',
                spellName: 'Breath of the Dragon',
                category: 'cone',
                fromPosition: { x: 300, y: 250 },
                toPosition: { x: 700, y: 550 },
                color: '#ff4500',
                secondaryColor: '#FF6B00',
                size: 30,
                duration: 1200,
                coneAngle: 60,
                particleEffect: true,
                persistDuration: 2,
                persistColor: '#CC2500',
                persistOpacity: 0.4,
                durationType: 'events',
                statusEffect: {
                  type: 'flaming',
                  duration: 1,
                  intensity: 1
                },
                id: nanoid()
              }, 1)
            }
          }
        },
        description: 'Assign Dragon Breath from Dragonborn A to B'
      },
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('dragonborn-2', 'spell', {
                type: 'spell',
                spellName: 'Breath of the Dragon',
                category: 'cone',
                fromPosition: { x: 700, y: 550 },
                toPosition: { x: 300, y: 400 },
                color: '#ff4500',
                secondaryColor: '#FF6B00',
                size: 30,
                duration: 1200,
                coneAngle: 60,
                particleEffect: true,
                persistDuration: 2,
                persistColor: '#CC2500',
                persistOpacity: 0.4,
                durationType: 'events',
                statusEffect: {
                  type: 'flaming',
                  duration: 1,
                  intensity: 1
                },
                id: nanoid()
              }, 1)
            }
          }
        },
        description: 'Assign Dragon Breath from Dragonborn B to A initial position'
      },

      // Execute animations
      {
        type: 'action',
        action: {
          type: 'nextRound',
          params: {}
        },
        description: 'Execute event - breath attacks fire'
      },
      {
        type: 'wait',
        wait: 3000,
        description: 'Wait for animations'
      },

      // Dragon Breath has NO post-effects (instant cone)

      // Execute next event
      {
        type: 'action',
        action: {
          type: 'nextRound',
          params: {}
        },
        description: 'Execute next event'
      },
      {
        type: 'wait',
        wait: 1000,
        description: 'Wait'
      },

      // Verify cleanup
      {
        type: 'assert',
        assert: {
          type: 'custom',
          params: {
            check: async () => {
              const mapStore = (await import('@/store/mapStore')).default.getState()
              const spellObjects = mapStore.currentMap?.objects.filter(obj => obj.type === 'spell') || []
              return spellObjects.length === 0
            }
          },
          expected: true
        },
        description: 'Verify no post-effects'
      },

      // Check status effects present
      {
        type: 'assert',
        assert: {
          type: 'custom',
          params: {
            check: async () => {
              const mapStore = (await import('@/store/mapStore')).default.getState()
              const token = mapStore.currentMap?.objects.find(obj => obj.id === 'dragonborn-2')
              return (token as any)?.statusEffects?.some((e: any) => e.type === 'flaming') || false
            }
          },
          expected: true
        },
        description: 'Verify flaming status effect on Dragonborn B'
      },

      // End round
      {
        type: 'action',
        action: {
          type: 'nextRound',
          params: {}
        },
        description: 'End round - status effects expire'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait'
      },

      // Verify status effects removed
      {
        type: 'assert',
        assert: {
          type: 'custom',
          params: {
            check: async () => {
              const mapStore = (await import('@/store/mapStore')).default.getState()
              const token = mapStore.currentMap?.objects.find(obj => obj.id === 'dragonborn-2')
              const effects = (token as any)?.statusEffects || []
              return effects.length === 0
            }
          },
          expected: true
        },
        description: 'Verify status effects removed'
      }
    ]
  },

  {
    id: 'ray-of-frost-full-test',
    name: 'Ray of Frost - Full Lifecycle',
    description: 'Complete Ray of Frost test with instant ray and chilled effect',
    category: 'spells',
    steps: [
      // Token creation
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'sorcerer-1',
            name: 'Sorcerer A',
            position: { x: 300, y: 400 },
            size: 'medium',
            color: '#00CED1',
            shape: 'circle'
          }
        },
        description: 'Create Sorcerer A (token 1)'
      },
      {
        type: 'wait',
        wait: 200,
        description: 'Wait'
      },
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'sorcerer-2',
            name: 'Sorcerer B',
            position: { x: 700, y: 400 },
            size: 'medium',
            color: '#FF6347',
            shape: 'circle'
          }
        },
        description: 'Create Sorcerer B (token 2)'
      },
      {
        type: 'wait',
        wait: 200,
        description: 'Wait'
      },
      {
        type: 'action',
        action: {
          type: 'startCombat',
          params: {}
        },
        description: 'Start combat'
      },
      {
        type: 'wait',
        wait: 300,
        description: 'Wait'
      },

      // Movements
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('sorcerer-1', 'move', {
                type: 'move',
                fromPosition: { x: 300, y: 400 },
                toPosition: { x: 300, y: 250 }, // 3 cells up
                duration: 1000,
                easing: 'ease-in-out'
              }, 1)
            }
          }
        },
        description: 'Assign movement for Sorcerer A (3 cells up)'
      },
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('sorcerer-2', 'move', {
                type: 'move',
                fromPosition: { x: 700, y: 400 },
                toPosition: { x: 700, y: 550 }, // 3 cells down
                duration: 1000,
                easing: 'ease-in-out'
              }, 1)
            }
          }
        },
        description: 'Assign movement for Sorcerer B (3 cells down)'
      },

      // Ray of Frost spells
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('sorcerer-1', 'spell', {
                type: 'spell',
                spellName: 'Ray of Frost',
                category: 'ray',
                fromPosition: { x: 300, y: 250 },
                toPosition: { x: 700, y: 550 },
                targetTokenId: 'sorcerer-2',
                trackTarget: true,
                color: '#B0E0E6',
                size: 8,
                duration: 600,
                projectileSpeed: 800,
                statusEffect: {
                  type: 'chilled',
                  duration: 1,
                  intensity: 1
                },
                id: nanoid()
              }, 1)
            }
          }
        },
        description: 'Assign Ray of Frost from Sorcerer A to B'
      },
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('sorcerer-2', 'spell', {
                type: 'spell',
                spellName: 'Ray of Frost',
                category: 'ray',
                fromPosition: { x: 700, y: 550 },
                toPosition: { x: 300, y: 400 },
                color: '#B0E0E6',
                size: 8,
                duration: 600,
                projectileSpeed: 800,
                statusEffect: {
                  type: 'chilled',
                  duration: 1,
                  intensity: 1
                },
                id: nanoid()
              }, 1)
            }
          }
        },
        description: 'Assign Ray of Frost from Sorcerer B to A initial position'
      },

      // Execute
      {
        type: 'action',
        action: {
          type: 'nextRound',
          params: {}
        },
        description: 'Execute event - instant rays'
      },
      {
        type: 'wait',
        wait: 2000,
        description: 'Wait for ray animations'
      },

      // Ray has NO post-effects

      // Next event
      {
        type: 'action',
        action: {
          type: 'nextRound',
          params: {}
        },
        description: 'Execute next event'
      },
      {
        type: 'wait',
        wait: 1000,
        description: 'Wait'
      },

      // Verify cleanup
      {
        type: 'assert',
        assert: {
          type: 'custom',
          params: {
            check: async () => {
              const mapStore = (await import('@/store/mapStore')).default.getState()
              const spellObjects = mapStore.currentMap?.objects.filter(obj => obj.type === 'spell') || []
              return spellObjects.length === 0
            }
          },
          expected: true
        },
        description: 'Verify no post-effects'
      },

      // Check status effects
      {
        type: 'assert',
        assert: {
          type: 'custom',
          params: {
            check: async () => {
              const mapStore = (await import('@/store/mapStore')).default.getState()
              const token = mapStore.currentMap?.objects.find(obj => obj.id === 'sorcerer-2')
              return (token as any)?.statusEffects?.some((e: any) => e.type === 'chilled') || false
            }
          },
          expected: true
        },
        description: 'Verify chilled status effect'
      },

      // End round
      {
        type: 'action',
        action: {
          type: 'nextRound',
          params: {}
        },
        description: 'End round - chilled expires'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait'
      },

      // Verify removed
      {
        type: 'assert',
        assert: {
          type: 'custom',
          params: {
            check: async () => {
              const mapStore = (await import('@/store/mapStore')).default.getState()
              const token = mapStore.currentMap?.objects.find(obj => obj.id === 'sorcerer-2')
              const effects = (token as any)?.statusEffects || []
              return effects.length === 0
            }
          },
          expected: true
        },
        description: 'Verify status effects removed'
      }
    ]
  },

  {
    id: 'bless-full-test',
    name: 'Bless - Full Lifecycle',
    description: 'Complete Bless test with continuous blessed effect for multiple rounds',
    category: 'spells',
    steps: [
      // Token creation
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'cleric-1',
            name: 'Cleric A',
            position: { x: 300, y: 400 },
            size: 'medium',
            color: '#FFD700',
            shape: 'circle'
          }
        },
        description: 'Create Cleric A (token 1)'
      },
      {
        type: 'wait',
        wait: 200,
        description: 'Wait'
      },
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'cleric-2',
            name: 'Cleric B',
            position: { x: 700, y: 400 },
            size: 'medium',
            color: '#FFA500',
            shape: 'circle'
          }
        },
        description: 'Create Cleric B (token 2)'
      },
      {
        type: 'wait',
        wait: 200,
        description: 'Wait'
      },
      {
        type: 'action',
        action: {
          type: 'startCombat',
          params: {}
        },
        description: 'Start combat'
      },
      {
        type: 'wait',
        wait: 300,
        description: 'Wait'
      },

      // Movements
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('cleric-1', 'move', {
                type: 'move',
                fromPosition: { x: 300, y: 400 },
                toPosition: { x: 300, y: 250 }, // 3 cells up
                duration: 1000,
                easing: 'ease-in-out'
              }, 1)
            }
          }
        },
        description: 'Assign movement for Cleric A (3 cells up)'
      },
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('cleric-2', 'move', {
                type: 'move',
                fromPosition: { x: 700, y: 400 },
                toPosition: { x: 700, y: 550 }, // 3 cells down
                duration: 1000,
                easing: 'ease-in-out'
              }, 1)
            }
          }
        },
        description: 'Assign movement for Cleric B (3 cells down)'
      },

      // Bless spells (continuous area effect - 10 rounds)
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('cleric-1', 'spell', {
                type: 'spell',
                spellName: 'Bless',
                category: 'burst',
                fromPosition: { x: 300, y: 250 },
                toPosition: { x: 700, y: 550 },
                targetTokenId: 'cleric-2',
                color: '#FFFFE0',
                size: 30,
                duration: 800,
                burstRadius: 30,
                burstDuration: 800,
                burstColor: '#FFFFE0',
                opacity: 0.6,
                persistDuration: 0,
                statusEffect: {
                  type: 'blessed',
                  duration: 10,
                  intensity: 1
                },
                id: nanoid()
              }, 1)
            }
          }
        },
        description: 'Assign Bless from Cleric A to B (10 rounds continuous)'
      },
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('cleric-2', 'spell', {
                type: 'spell',
                spellName: 'Bless',
                category: 'burst',
                fromPosition: { x: 700, y: 550 },
                toPosition: { x: 300, y: 400 },
                color: '#FFFFE0',
                size: 30,
                duration: 800,
                burstRadius: 30,
                burstDuration: 800,
                burstColor: '#FFFFE0',
                opacity: 0.6,
                persistDuration: 0,
                statusEffect: {
                  type: 'blessed',
                  duration: 10,
                  intensity: 1
                },
                id: nanoid()
              }, 1)
            }
          }
        },
        description: 'Assign Bless from Cleric B to A initial position (10 rounds)'
      },

      // Execute
      {
        type: 'action',
        action: {
          type: 'nextRound',
          params: {}
        },
        description: 'Execute event - Bless appears'
      },
      {
        type: 'wait',
        wait: 2500,
        description: 'Wait for Bless areas'
      },

      // Verify continuous effects present
      {
        type: 'assert',
        assert: {
          type: 'custom',
          params: {
            check: async () => {
              const mapStore = (await import('@/store/mapStore')).default.getState()
              const spellObjects = mapStore.currentMap?.objects.filter(obj => obj.type === 'spell') || []
              return spellObjects.length > 0
            }
          },
          expected: true
        },
        description: 'Verify Bless areas present (continuous)'
      },

      // Check status effects
      {
        type: 'assert',
        assert: {
          type: 'custom',
          params: {
            check: async () => {
              const mapStore = (await import('@/store/mapStore')).default.getState()
              const token = mapStore.currentMap?.objects.find(obj => obj.id === 'cleric-2')
              return (token as any)?.statusEffects?.some((e: any) => e.type === 'blessed') || false
            }
          },
          expected: true
        },
        description: 'Verify blessed status effect'
      },

      // End round 1 - continuous effects and status effects persist
      {
        type: 'action',
        action: {
          type: 'nextRound',
          params: {}
        },
        description: 'End round 1'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait'
      },

      // Verify continuous effects still present
      {
        type: 'assert',
        assert: {
          type: 'custom',
          params: {
            check: async () => {
              const mapStore = (await import('@/store/mapStore')).default.getState()
              const spellObjects = mapStore.currentMap?.objects.filter(obj => obj.type === 'spell') || []
              return spellObjects.length > 0
            }
          },
          expected: true
        },
        description: 'Verify Bless areas still present (round 1 of 10)'
      },

      // End 10 more rounds to expire
      ...Array.from({ length: 10 }, (_, i) => [
        {
          type: 'action' as const,
          action: {
            type: 'nextRound' as const,
            params: {}
          },
          description: `End round ${i + 2}`
        },
        {
          type: 'wait' as const,
          wait: 500,
          description: 'Wait'
        }
      ]).flat(),

      // Verify continuous effects removed after 10 rounds
      {
        type: 'assert',
        assert: {
          type: 'custom',
          params: {
            check: async () => {
              const mapStore = (await import('@/store/mapStore')).default.getState()
              const spellObjects = mapStore.currentMap?.objects.filter(obj => obj.type === 'spell') || []
              return spellObjects.length === 0
            }
          },
          expected: true
        },
        description: 'Verify Bless areas removed after 10 rounds'
      }
    ]
  },

  {
    id: 'poison-spray-full-test',
    name: 'Poison Spray - Full Lifecycle',
    description: 'Complete Poison Spray test with poisoned status effect',
    category: 'spells',
    steps: [
      // Token creation
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'druid-1',
            name: 'Druid A',
            position: { x: 300, y: 400 },
            size: 'medium',
            color: '#32CD32',
            shape: 'circle'
          }
        },
        description: 'Create Druid A (token 1)'
      },
      {
        type: 'wait',
        wait: 200,
        description: 'Wait'
      },
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'druid-2',
            name: 'Druid B',
            position: { x: 700, y: 400 },
            size: 'medium',
            color: '#228B22',
            shape: 'circle'
          }
        },
        description: 'Create Druid B (token 2)'
      },
      {
        type: 'wait',
        wait: 200,
        description: 'Wait'
      },
      {
        type: 'action',
        action: {
          type: 'startCombat',
          params: {}
        },
        description: 'Start combat'
      },
      {
        type: 'wait',
        wait: 300,
        description: 'Wait'
      },

      // Movements
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('druid-1', 'move', {
                type: 'move',
                fromPosition: { x: 300, y: 400 },
                toPosition: { x: 300, y: 250 }, // 3 cells up
                duration: 1000,
                easing: 'ease-in-out'
              }, 1)
            }
          }
        },
        description: 'Assign movement for Druid A (3 cells up)'
      },
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('druid-2', 'move', {
                type: 'move',
                fromPosition: { x: 700, y: 400 },
                toPosition: { x: 700, y: 550 }, // 3 cells down
                duration: 1000,
                easing: 'ease-in-out'
              }, 1)
            }
          }
        },
        description: 'Assign movement for Druid B (3 cells down)'
      },

      // Poison Spray
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('druid-1', 'spell', {
                type: 'spell',
                spellName: 'Poison Spray',
                category: 'cone',
                fromPosition: { x: 300, y: 250 },
                toPosition: { x: 700, y: 550 },
                color: '#00FF00',
                secondaryColor: '#32CD32',
                size: 40,
                duration: 700,
                coneAngle: 45,
                particleEffect: true,
                persistDuration: 2,
                persistColor: '#228B22',
                persistOpacity: 0.4,
                durationType: 'events',
                statusEffect: {
                  type: 'poisoned',
                  duration: 1,
                  intensity: 1
                },
                id: nanoid()
              }, 1)
            }
          }
        },
        description: 'Assign Poison Spray from Druid A to B'
      },
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('druid-2', 'spell', {
                type: 'spell',
                spellName: 'Poison Spray',
                category: 'cone',
                fromPosition: { x: 700, y: 550 },
                toPosition: { x: 300, y: 400 },
                color: '#00FF00',
                secondaryColor: '#32CD32',
                size: 40,
                duration: 700,
                coneAngle: 45,
                particleEffect: true,
                persistDuration: 2,
                persistColor: '#228B22',
                persistOpacity: 0.4,
                durationType: 'events',
                statusEffect: {
                  type: 'poisoned',
                  duration: 1,
                  intensity: 1
                },
                id: nanoid()
              }, 1)
            }
          }
        },
        description: 'Assign Poison Spray from Druid B to A initial position'
      },

      // Execute
      {
        type: 'action',
        action: {
          type: 'nextRound',
          params: {}
        },
        description: 'Execute event - poison clouds'
      },
      {
        type: 'wait',
        wait: 3000,
        description: 'Wait for animations'
      },

      // No post-effects

      // Next event
      {
        type: 'action',
        action: {
          type: 'nextRound',
          params: {}
        },
        description: 'Execute next event'
      },
      {
        type: 'wait',
        wait: 1000,
        description: 'Wait'
      },

      // Verify cleanup
      {
        type: 'assert',
        assert: {
          type: 'custom',
          params: {
            check: async () => {
              const mapStore = (await import('@/store/mapStore')).default.getState()
              const spellObjects = mapStore.currentMap?.objects.filter(obj => obj.type === 'spell') || []
              return spellObjects.length === 0
            }
          },
          expected: true
        },
        description: 'Verify no post-effects'
      },

      // Check status effects
      {
        type: 'assert',
        assert: {
          type: 'custom',
          params: {
            check: async () => {
              const mapStore = (await import('@/store/mapStore')).default.getState()
              const token = mapStore.currentMap?.objects.find(obj => obj.id === 'druid-2')
              return (token as any)?.statusEffects?.some((e: any) => e.type === 'poisoned') || false
            }
          },
          expected: true
        },
        description: 'Verify poisoned status effect'
      },

      // End round
      {
        type: 'action',
        action: {
          type: 'nextRound',
          params: {}
        },
        description: 'End round - poisoned expires'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait'
      },

      // Verify removed
      {
        type: 'assert',
        assert: {
          type: 'custom',
          params: {
            check: async () => {
              const mapStore = (await import('@/store/mapStore')).default.getState()
              const token = mapStore.currentMap?.objects.find(obj => obj.id === 'druid-2')
              const effects = (token as any)?.statusEffects || []
              return effects.length === 0
            }
          },
          expected: true
        },
        description: 'Verify status effects removed'
      }
    ]
  },

  // ============================================================================
  // DARKNESS - Continuous Area Effect Test (10 rounds)
  // ============================================================================
  {
    id: 'darkness-continuous-test',
    name: 'Darkness - Continuous Area Effect',
    description: 'Tests Darkness spell: area effect created, persists for 10 rounds, then removed',
    category: 'spells',
    steps: [
      // Create caster
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'darkness-caster',
            name: 'Shadow Mage',
            position: { x: 400, y: 400 },
            size: 'medium',
            color: '#1A1A1A',
            shape: 'circle'
          }
        },
        description: 'Create shadow mage'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait before combat'
      },

      // Start combat
      {
        type: 'action',
        action: {
          type: 'startCombat',
          params: {}
        },
        description: 'Start combat'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait'
      },

      // Cast Darkness (area spell with 10 round duration)
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('darkness-caster', 'spell', {
                type: 'spell',
                spellName: 'Darkness',
                category: 'area',
                fromPosition: { x: 400, y: 400 },
                toPosition: { x: 400, y: 400 },
                color: '#3D3D2E',
                secondaryColor: '#4A4A20',
                size: 60,
                duration: 800,
                particleEffect: false,
                persistDuration: 10,
                durationType: 'rounds',
                persistColor: '#3D3D2E',
                persistOpacity: 0.7,
                id: nanoid()
              }, 1)
            }
          }
        },
        description: 'Cast Darkness spell (10 round duration)'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait'
      },

      // Execute Round 1 - Darkness appears
      {
        type: 'action',
        action: {
          type: 'nextRound',
          params: {}
        },
        description: 'Execute Round 1 - Darkness area appears'
      },
      {
        type: 'wait',
        wait: 2000,
        description: 'Wait for darkness animation to complete and persistent area to be created'
      },

      // Verify darkness effect exists on map after Round 1
      {
        type: 'assert',
        assert: {
          type: 'custom',
          params: {
            check: async () => {
              return await hasPersistentAreaSpell('Darkness')
            }
          },
          expected: true
        },
        description: 'Verify Darkness area effect created on map (Round 1)'
      },

      // Execute Rounds 2-10 (darkness persists through these rounds)
      ...Array.from({ length: 9 }, (_, i) => [
        {
          type: 'action' as const,
          action: {
            type: 'nextRound' as const,
            params: {}
          },
          description: `Execute Round ${i + 2} - Darkness persists`
        },
        {
          type: 'wait' as const,
          wait: 300,
          description: 'Wait'
        }
      ]).flat(),

      // Verify darkness still exists after Round 10
      {
        type: 'assert',
        assert: {
          type: 'custom',
          params: {
            check: async () => {
              return await hasPersistentAreaSpell('Darkness')
            }
          },
          expected: true
        },
        description: 'Verify Darkness still exists at end of Round 10'
      },

      // Execute Round 11 - duration expires, darkness should be removed
      {
        type: 'action',
        action: {
          type: 'nextRound',
          params: {}
        },
        description: 'Execute Round 11 - Darkness duration (10 rounds) expires'
      },
      {
        type: 'wait',
        wait: 1000,
        description: 'Wait for cleanup'
      },

      // Verify darkness removed after 10 rounds
      {
        type: 'assert',
        assert: {
          type: 'custom',
          params: {
            check: async () => {
              return !(await hasPersistentAreaSpell('Darkness'))
            }
          },
          expected: true
        },
        description: 'Verify Darkness removed after 10 rounds expired (Round 11)'
      }
    ]
  },

  // ============================================================================
  // MAGIC MISSILE TRAJECTORY VERIFICATION - 4 missiles from token 1 to token 2
  // ============================================================================
  {
    id: 'magic-missile-single-target-test',
    name: 'Magic Missile - 4 Missiles Same Source to Same Target',
    description: 'Visual test of trajectory variations: 4 magic missiles from token 1 to token 2 to verify curve diversity with same source/target',
    category: 'spells',
    steps: [
      // Create caster token
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'multi-caster',
            name: 'Multi Caster',
            position: { x: 200, y: 400 },
            size: 'medium',
            color: '#9370DB',
            shape: 'circle'
          }
        },
        description: 'Create caster token'
      },
      {
        type: 'wait',
        wait: 200,
        description: 'Wait'
      },

      // Create target token
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'multi-target',
            name: 'Target',
            position: { x: 800, y: 400 },
            size: 'medium',
            color: '#FF0000',
            shape: 'circle'
          }
        },
        description: 'Create target token'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait before combat'
      },

      // Start combat
      {
        type: 'action',
        action: {
          type: 'startCombat',
          params: {}
        },
        description: 'Start combat'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait'
      },

      // Assign 4 magic missiles from same caster to same target
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()

              // Magic Missile 1 (ID auto-generated like UnifiedEventEditor does)
              timelineStore.addAction('multi-caster', 'spell', {
                type: 'spell',
                spellName: 'Magic Missile',
                category: 'projectile',
                fromPosition: { x: 200, y: 400 },
                toPosition: { x: 800, y: 400 },
                targetTokenId: 'multi-target',
                trackTarget: true,
                curved: true,
                curveHeight: 60,
                color: '#9370DB',
                size: 8,
                duration: 1200,
                projectileSpeed: 400,
                trailLength: 12,
                trailFade: 0.75,
                id: nanoid()
              }, 1)

              // Magic Missile 2 (ID auto-generated like UnifiedEventEditor does)
              timelineStore.addAction('multi-caster', 'spell', {
                type: 'spell',
                spellName: 'Magic Missile',
                category: 'projectile',
                fromPosition: { x: 200, y: 400 },
                toPosition: { x: 800, y: 400 },
                targetTokenId: 'multi-target',
                trackTarget: true,
                curved: true,
                curveHeight: 60,
                color: '#9370DB',
                size: 8,
                duration: 1200,
                projectileSpeed: 400,
                trailLength: 12,
                trailFade: 0.75,
                id: nanoid()
              }, 1)

              // Magic Missile 3 (ID auto-generated like UnifiedEventEditor does)
              timelineStore.addAction('multi-caster', 'spell', {
                type: 'spell',
                spellName: 'Magic Missile',
                category: 'projectile',
                fromPosition: { x: 200, y: 400 },
                toPosition: { x: 800, y: 400 },
                targetTokenId: 'multi-target',
                trackTarget: true,
                curved: true,
                curveHeight: 60,
                color: '#9370DB',
                size: 8,
                duration: 1200,
                projectileSpeed: 400,
                trailLength: 12,
                trailFade: 0.75,
                id: nanoid()
              }, 1)

              // Magic Missile 4 (ID auto-generated like UnifiedEventEditor does)
              timelineStore.addAction('multi-caster', 'spell', {
                type: 'spell',
                spellName: 'Magic Missile',
                category: 'projectile',
                fromPosition: { x: 200, y: 400 },
                toPosition: { x: 800, y: 400 },
                targetTokenId: 'multi-target',
                trackTarget: true,
                curved: true,
                curveHeight: 60,
                color: '#9370DB',
                size: 8,
                duration: 1200,
                projectileSpeed: 400,
                trailLength: 12,
                trailFade: 0.75,
                id: nanoid()
              }, 1)
            }
          }
        },
        description: 'Assign 4 Magic Missiles from same caster to same target with different IDs'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait'
      },

      // Execute round to see all 4 trajectories simultaneously
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              await moveToNextRound()
            }
          }
        },
        description: 'Execute round with all 4 missiles simultaneously - observe trajectory diversity'
      },
      {
        type: 'wait',
        wait: 2000,
        description: 'Wait to observe all trajectories'
      },

      {
        type: 'capture',
        capture: { name: 'four-missiles-same-path' },
        description: 'Capture 4 different trajectories on same path'
      }
    ]
  }
]
