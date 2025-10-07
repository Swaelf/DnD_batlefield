/**
 * Projectile Spell Test Scenarios
 *
 * Tests the unified projectile system with Magic Missile and Fireball
 * Flow: Create tokens → Schedule movements → Schedule spells → Execute round → Verify
 */

import type { TestScenario } from './TestScenarios'

export const projectileSpellTests: TestScenario[] = [
  {
    id: 'magic-missile-curved-test',
    name: 'Magic Missile - Curved Projectile',
    description: 'Tests Magic Missile with curved path and burst effect (no persistent post-effect)',
    category: 'spells',
    steps: [
      // Step 1: Create first token (caster)
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'wizard-token',
            name: 'Wizard',
            position: { x: 200, y: 300 },
            size: 'medium',
            color: '#9400D3',
            shape: 'circle'
          }
        },
        description: 'Add wizard token (caster)'
      },
      {
        type: 'wait',
        wait: 200,
        description: 'Wait for wizard to render'
      },

      // Step 2: Create second token (target)
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'goblin-token',
            name: 'Goblin',
            position: { x: 600, y: 300 },
            size: 'small',
            color: '#228B22',
            shape: 'circle'
          }
        },
        description: 'Add goblin token (target)'
      },
      {
        type: 'wait',
        wait: 200,
        description: 'Wait for goblin to render'
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
        description: 'Wait for combat to initialize'
      },

      // Step 4: Schedule wizard movement (4 cells upward)
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('wizard-token', 'move', {
                type: 'move',
                fromPosition: { x: 200, y: 300 },
                toPosition: { x: 200, y: 100 }, // 4 grid cells up (50px per cell)
                duration: 1200,
                easing: 'ease-in-out'
              }, 1)
            }
          }
        },
        description: 'Schedule wizard movement upward (4 cells)'
      },

      // Step 5: Schedule goblin movement (4 cells downward)
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('goblin-token', 'move', {
                type: 'move',
                fromPosition: { x: 600, y: 300 },
                toPosition: { x: 600, y: 500 }, // 4 grid cells down (50px per cell)
                duration: 1200,
                easing: 'ease-in-out'
              }, 1)
            }
          }
        },
        description: 'Schedule goblin movement downward (4 cells)'
      },

      // Step 6: Schedule Magic Missile spell (wizard → goblin target position)
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('wizard-token', 'spell', {
                type: 'spell',
                spellName: 'Magic Missile',
                category: 'projectile',
                fromPosition: { x: 200, y: 100 },
                toPosition: { x: 600, y: 500 },
                color: '#9370DB',
                size: 8,
                duration: 1200,
                curved: true,
                curveHeight: 60,
                projectileSpeed: 400,
                trailLength: 12,
                trailFade: 0.75
              }, 1)
            }
          }
        },
        description: 'Schedule Magic Missile from wizard to goblin'
      },

      // Step 7: Execute round 1 (movements + spell)
      {
        type: 'action',
        action: {
          type: 'nextRound',
          params: {}
        },
        description: 'Execute round 1 - all scheduled actions'
      },
      {
        type: 'wait',
        wait: 3000,
        description: 'Wait for all animations to complete (movement + spell)'
      },

      // Step 8: Verify wizard moved
      {
        type: 'assert',
        assert: {
          type: 'tokenPosition',
          params: { tokenId: 'wizard-token' },
          expected: { x: 200, y: 100 }
        },
        description: 'Verify wizard moved upward'
      },

      // Step 9: Verify goblin moved
      {
        type: 'assert',
        assert: {
          type: 'tokenPosition',
          params: { tokenId: 'goblin-token' },
          expected: { x: 600, y: 500 }
        },
        description: 'Verify goblin moved downward'
      },

      // Step 10: Wait before executing next round
      {
        type: 'wait',
        wait: 500,
        description: 'Wait before next round to ensure spell animation completes'
      },

      // Step 11: Execute next round to ensure cleanup
      {
        type: 'action',
        action: {
          type: 'nextRound',
          params: {}
        },
        description: 'Execute next round for cleanup'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait for cleanup'
      },

      // Step 12: Verify spell cleaned up (Magic Missile has no persistent post-effect)
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
        description: 'Verify Magic Missile cleaned up (no post-effect)'
      }
    ]
  },

  {
    id: 'fireball-straight-test',
    name: 'Fireball - Straight Projectile',
    description: 'Tests Fireball with straight path and burst effect (no persistent post-effect)',
    category: 'spells',
    steps: [
      // Step 1: Create first token (caster)
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'sorcerer-token',
            name: 'Sorcerer',
            position: { x: 300, y: 400 },
            size: 'medium',
            color: '#FF4500',
            shape: 'circle'
          }
        },
        description: 'Add sorcerer token (caster)'
      },
      {
        type: 'wait',
        wait: 200,
        description: 'Wait for sorcerer to render'
      },

      // Step 2: Create second token (target)
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'orc-token',
            name: 'Orc',
            position: { x: 700, y: 400 },
            size: 'medium',
            color: '#8B4513',
            shape: 'circle'
          }
        },
        description: 'Add orc token (target)'
      },
      {
        type: 'wait',
        wait: 200,
        description: 'Wait for orc to render'
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
        description: 'Wait for combat to initialize'
      },

      // Step 4: Schedule sorcerer movement (5 cells to top-left)
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('sorcerer-token', 'move', {
                type: 'move',
                fromPosition: { x: 300, y: 400 },
                toPosition: { x: 100, y: 150 }, // 4 cells left, 5 cells up
                duration: 1400,
                easing: 'ease-in-out'
              }, 1)
            }
          }
        },
        description: 'Schedule sorcerer movement to top-left (5 cells diagonal)'
      },

      // Step 5: Schedule orc movement (5 cells to bottom-right)
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('orc-token', 'move', {
                type: 'move',
                fromPosition: { x: 700, y: 400 },
                toPosition: { x: 900, y: 650 }, // 4 cells right, 5 cells down
                duration: 1400,
                easing: 'ease-in-out'
              }, 1)
            }
          }
        },
        description: 'Schedule orc movement to bottom-right (5 cells diagonal)'
      },

      // Step 6: Schedule Fireball spell (sorcerer → orc target position)
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('sorcerer-token', 'spell', {
                type: 'spell',
                spellName: 'Fireball',
                category: 'projectile-burst',
                fromPosition: { x: 100, y: 150 },
                toPosition: { x: 900, y: 650 },
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
                durationType: 'events'
              }, 1)
            }
          }
        },
        description: 'Schedule Fireball from sorcerer to orc (long distance)'
      },

      // Step 7: Execute round 1 (movements + spell)
      {
        type: 'action',
        action: {
          type: 'nextRound',
          params: {}
        },
        description: 'Execute round 1 - all scheduled actions'
      },
      {
        type: 'wait',
        wait: 3500,
        description: 'Wait for all animations to complete (long movements + spell)'
      },

      // Step 8: Wait before executing next round
      {
        type: 'wait',
        wait: 500,
        description: 'Wait before next round to ensure spell animation completes'
      },

      // Step 9: Execute next round to ensure cleanup
      {
        type: 'action',
        action: {
          type: 'nextRound',
          params: {}
        },
        description: 'Execute next round for cleanup'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait for cleanup'
      },

      // Step 10: Verify spell cleaned up (Fireball has no persistent post-effect)
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
        description: 'Verify Fireball cleaned up (no post-effect)'
      }
    ]
  },

  {
    id: 'bidirectional-spells-test',
    name: 'Bidirectional Spell Exchange',
    description: 'Two mages cast spells at each other simultaneously (no persistent post-effects)',
    category: 'spells',
    steps: [
      // Step 1: Create first token
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'mage-a',
            name: 'Mage A',
            position: { x: 200, y: 300 },
            size: 'medium',
            color: '#4169E1',
            shape: 'circle'
          }
        },
        description: 'Add Mage A'
      },
      {
        type: 'wait',
        wait: 200,
        description: 'Wait'
      },

      // Step 2: Create second token
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'mage-b',
            name: 'Mage B',
            position: { x: 600, y: 300 },
            size: 'medium',
            color: '#DC143C',
            shape: 'circle'
          }
        },
        description: 'Add Mage B'
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

      // Step 4: Schedule Magic Missile (Mage A → Mage B position)
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('mage-a', 'spell', {
                type: 'spell',
                spellName: 'Magic Missile',
                category: 'projectile',
                fromPosition: { x: 200, y: 300 },
                toPosition: { x: 600, y: 300 },
                color: '#9370DB',
                size: 8,
                duration: 1200,
                curved: true,
                curveHeight: 60,
                projectileSpeed: 400,
                trailLength: 12,
                trailFade: 0.75
              }, 1)
            }
          }
        },
        description: 'Schedule Magic Missile from Mage A to Mage B'
      },

      // Step 5: Schedule Fireball (Mage B → Mage A initial position)
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('mage-b', 'spell', {
                type: 'spell',
                spellName: 'Fireball',
                category: 'projectile-burst',
                fromPosition: { x: 600, y: 300 },
                toPosition: { x: 200, y: 300 },
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
                durationType: 'events'
              }, 1)
            }
          }
        },
        description: 'Schedule Fireball from Mage B to Mage A position'
      },

      // Step 6: Execute round 1 (both spells fire simultaneously)
      {
        type: 'action',
        action: {
          type: 'nextRound',
          params: {}
        },
        description: 'Execute round 1 - both spells fire'
      },
      {
        type: 'wait',
        wait: 3000,
        description: 'Wait for both spell animations to complete'
      },

      // Step 7: Wait before executing next round
      {
        type: 'wait',
        wait: 500,
        description: 'Wait before next round to ensure all spell animations complete'
      },

      // Step 8: Execute next round to ensure cleanup
      {
        type: 'action',
        action: {
          type: 'nextRound',
          params: {}
        },
        description: 'Execute next round for cleanup'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait for cleanup'
      },

      // Step 9: Verify all spells cleaned up (no persistent post-effects)
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
        description: 'Verify all spells cleaned up (no post-effects)'
      }
    ]
  },

  {
    id: 'tracking-spell-test',
    name: 'Tracking Spell - Target Follows Movement',
    description: 'Tests spell tracking feature where Magic Missile tracks and follows a moving target',
    category: 'spells',
    steps: [
      // Step 1: Create first token (caster)
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'archer-token',
            name: 'Archer',
            position: { x: 150, y: 300 },
            size: 'medium',
            color: '#8B4513',
            shape: 'circle'
          }
        },
        description: 'Add archer token (caster)'
      },
      {
        type: 'wait',
        wait: 200,
        description: 'Wait for archer to render'
      },

      // Step 2: Create second token (moving target)
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'runner-token',
            name: 'Runner',
            position: { x: 700, y: 300 },
            size: 'medium',
            color: '#DC143C',
            shape: 'circle'
          }
        },
        description: 'Add runner token (moving target)'
      },
      {
        type: 'wait',
        wait: 200,
        description: 'Wait for runner to render'
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
        description: 'Wait for combat to initialize'
      },

      // Step 4: Schedule target movement (5 cells upward-left diagonal)
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('runner-token', 'move', {
                type: 'move',
                fromPosition: { x: 700, y: 300 },
                toPosition: { x: 500, y: 50 }, // 4 cells left, 5 cells up
                duration: 1500,
                easing: 'ease-in-out'
              }, 1)
            }
          }
        },
        description: 'Schedule runner movement upward-left (target will be moving)'
      },

      // Step 5: Schedule non-tracking spell to original position (baseline)
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('archer-token', 'spell', {
                type: 'spell',
                spellName: 'Magic Missile',
                category: 'projectile',
                fromPosition: { x: 150, y: 300 },
                toPosition: { x: 700, y: 300 }, // Target's ORIGINAL position (won't update)
                trackTarget: false,             // NO TRACKING: Static target
                color: '#9370DB',
                size: 8,
                duration: 1200,
                curved: true,
                curveHeight: 60,
                projectileSpeed: 400,
                trailLength: 12,
                trailFade: 0.75
              }, 1)
            }
          }
        },
        description: 'Schedule static spell to original position (baseline - no tracking)'
      },

      // Step 6: Schedule tracking spell (follows target)
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('archer-token', 'spell', {
                type: 'spell',
                spellName: 'Magic Missile',
                category: 'projectile',
                fromPosition: { x: 150, y: 300 },
                toPosition: { x: 700, y: 300 }, // Initial target position (will update)
                targetTokenId: 'runner-token',  // TRACKING: Follow this token
                trackTarget: true,              // TRACKING: Enable target tracking
                color: '#9370DB',
                size: 8,
                duration: 1200,
                curved: true,
                curveHeight: 60,
                projectileSpeed: 400,
                trailLength: 12,
                trailFade: 0.75
              }, 1)
            }
          }
        },
        description: 'Schedule tracking spell (will follow moving target)'
      },

      // Step 7: Execute round 1 (movement + both spells)
      {
        type: 'action',
        action: {
          type: 'nextRound',
          params: {}
        },
        description: 'Execute round 1 - tracking vs non-tracking comparison'
      },
      {
        type: 'wait',
        wait: 3500,
        description: 'Wait for all animations (movement + 2 spells)'
      },

      // Step 8: Verify target moved to final position
      {
        type: 'assert',
        assert: {
          type: 'tokenPosition',
          params: { tokenId: 'runner-token' },
          expected: { x: 500, y: 50 }
        },
        description: 'Verify runner moved to final position (500, 50)'
      },

      // Step 9: Wait before executing next round
      {
        type: 'wait',
        wait: 500,
        description: 'Wait before next round to ensure both spells complete'
      },

      // Step 10: Execute next round to ensure cleanup
      {
        type: 'action',
        action: {
          type: 'nextRound',
          params: {}
        },
        description: 'Execute next round for cleanup'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait for cleanup'
      },

      // Step 11: Verify both spells cleaned up
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
        description: 'Verify both spells cleaned up (no post-effects)'
      }
    ]
  },

  {
    id: 'fireball-post-effect-test',
    name: 'Fireball - Post-Effect Area (Automatic)',
    description: 'Tests Fireball explosion with automatic post-effect (2 events duration)',
    category: 'spells',
    steps: [
      // Step 1: Create caster token
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'wizard-fire',
            name: 'Fire Wizard',
            position: { x: 200, y: 300 },
            size: 'medium',
            color: '#8B0000',
            shape: 'circle'
          }
        },
        description: 'Add fire wizard (caster)'
      },
      {
        type: 'wait',
        wait: 200,
        description: 'Wait'
      },

      // Step 2: Create two target tokens
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'target-1',
            name: 'Target 1',
            position: { x: 650, y: 300 },
            size: 'medium',
            color: '#4B5563',
            shape: 'circle'
          }
        },
        description: 'Add first target'
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
            id: 'target-2',
            name: 'Target 2',
            position: { x: 700, y: 350 },
            size: 'medium',
            color: '#6B7280',
            shape: 'circle'
          }
        },
        description: 'Add second target'
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

      // Step 4: Cast Fireball (projectile-burst with post-effect)
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const timelineStore = (await import('@/store/timelineStore')).default.getState()
              timelineStore.addAction('wizard-fire', 'spell', {
                type: 'spell',
                spellName: 'Fireball',
                category: 'projectile-burst',
                fromPosition: { x: 200, y: 300 },
                toPosition: { x: 675, y: 325 }, // Center between targets
                color: '#FF6B35',
                size: 20,
                duration: 1500,
                projectileSpeed: 500,
                trailLength: 8,
                trailFade: 0.8,
                burstRadius: 210,
                burstColor: '#FF4500',
                burstDuration: 600,
                persistDuration: 2,         // POST-EFFECT: Lasts 2 events
                durationType: 'events',     // POST-EFFECT: Event-based
                persistColor: '#CC2500',
                persistOpacity: 0.4
              }, 1)
            }
          }
        },
        description: 'Cast Fireball (projectile-burst explosion with automatic post-effect)'
      },

      // Step 5: Execute event 1 - fireball explodes and creates post-effect
      {
        type: 'action',
        action: {
          type: 'nextEvent',
          params: {}
        },
        description: 'Execute event 1 - Fireball travels, explodes, creates post-effect'
      },
      {
        type: 'wait',
        wait: 3000,
        description: 'Wait for explosion animation and post-effect'
      },

      // Step 6: Verify burning area present (event 1 - post-effect created)
      {
        type: 'assert',
        assert: {
          type: 'custom',
          params: {
            check: async () => {
              const mapStore = (await import('@/store/mapStore')).default.getState()
              const persistentAreas = mapStore.currentMap?.objects.filter(obj =>
                obj.type === 'persistent-area'
              ) || []
              return persistentAreas.length > 0
            }
          },
          expected: true
        },
        description: 'Verify Fireball post-effect area present'
      },

      // Step 7: Execute event 2 - post-effect persists (event 1/2)
      {
        type: 'action',
        action: {
          type: 'nextEvent',
          params: {}
        },
        description: 'Execute event 2 - post-effect persists (event 1/2)'
      },
      {
        type: 'wait',
        wait: 1000,
        description: 'Wait'
      },

      // Step 8: Verify post-effect still present
      {
        type: 'assert',
        assert: {
          type: 'custom',
          params: {
            check: async () => {
              const mapStore = (await import('@/store/mapStore')).default.getState()
              const persistentAreas = mapStore.currentMap?.objects.filter(obj =>
                obj.type === 'persistent-area'
              ) || []
              return persistentAreas.length > 0
            }
          },
          expected: true
        },
        description: 'Verify post-effect still present (event 1/2)'
      },

      // Step 9: Execute event 3 - post-effect expires (event 2/2 completed)
      {
        type: 'action',
        action: {
          type: 'nextEvent',
          params: {}
        },
        description: 'Execute event 3 - post-effect expires (event 2/2 completed)'
      },
      {
        type: 'wait',
        wait: 1000,
        description: 'Wait for expiration'
      },

      // Step 10: Verify post-effect expired
      {
        type: 'assert',
        assert: {
          type: 'custom',
          params: {
            check: async () => {
              const mapStore = (await import('@/store/mapStore')).default.getState()
              const persistentAreas = mapStore.currentMap?.objects.filter(obj =>
                obj.type === 'persistent-area'
              ) || []
              return persistentAreas.length === 0
            }
          },
          expected: true
        },
        description: 'Verify Fireball post-effect expired after 2 events'
      }
    ]
  }
]
