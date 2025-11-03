import type { TestScenario } from './TestScenarios'
import type { SpellCategory } from '@/types/timeline'
import { animationToUnifiedAction } from '@/lib/animations/adapters/toUnifiedAction'

/**
 * Test scenarios for spells with persistent post-effects
 *
 * Tests TWO types of persistent spells:
 * 1. EVENT-BASED persistence (durationType: 'events'):
 *    - Fireball (burning ground persists for 1 event)
 *    - Burning Hands (burning ground persists for 1 event)
 *    - Poison Spray (poisonous cloud persists for 1 event)
 *    - Cone of Cold (icy ground persists for 1 event)
 *    - Breath Weapon (elemental energy persists for 1 event)
 *    - Ice Storm (icy rubble persists for 1 event)
 *
 *    EVENT-BASED TEST FLOW (persistDuration=1 means visible at Events 1-2):
 *    - Cast spell and execute Event 1
 *    - Verify post-effect is visible at Event 1 (capture + assertion)
 *    - ASSERT: Post-effect exists in map objects
 *    - Advance to Event 2 (nextEvent)
 *    - Add dummy action to Event 2
 *    - Execute Event 2
 *    - Verify post-effect STILL VISIBLE at Event 2 (capture + assertion)
 *    - ASSERT: Post-effect still exists (persistDuration=1 means visible through Event 2)
 *    - Advance to Event 3 (nextEvent)
 *    - Add dummy action to Event 3
 *    - Execute Event 3 (cleanup triggers)
 *    - Verify post-effect is REMOVED at Event 3 (capture + assertion)
 *    - ASSERT: Post-effect removed from map objects (test FAILS if not removed)
 *
 * 2. ROUND-BASED persistence (durationType: 'rounds'):
 *    - Darkness (lasts for 10 rounds)
 *    - Web (lasts for 10 rounds)
 *
 *    ROUND-BASED TEST FLOW:
 *    - Cast spell in Round 1
 *    - Verify area effect is visible (Round 1)
 *    - ASSERT: Area effect exists in map objects
 *    - Advance to Round 2, verify still visible
 *    - Advance through Rounds 3-10 (area effect remains visible)
 *    - Verify area effect still visible in Round 10 (last round of duration)
 *    - ASSERT: Area effect still exists in Round 10
 *    - Advance to Round 11 (beyond persistDuration)
 *    - Verify area effect is removed
 *    - ASSERT: Area effect removed from map objects (test FAILS if not removed)
 *
 * Each test verifies:
 * - Post-effect/area effect appears after spell animation completes
 * - Effect persists for the correct duration (1 event OR 10 rounds)
 * - Effect is removed correctly at the right time
 * - Visual captures at key moments (visible → still visible → removed)
 */

// Get spells with persistent effects
const getPersistentSpellTemplates = () => {
  const dummyPos = { x: 0, y: 0 }

  // Event-based persistent spells (persistDuration in events)
  const eventBasedSpells = [
    'Fireball',
    'Burning Hands',
    'Poison Spray',
    'Cone of Cold',
    'Breath Weapon',
    'Ice Storm'
  ]

  // Round-based persistent spells (persistDuration in rounds)
  const roundBasedSpells = [
    'Darkness',
    'Web'
  ]

  // Get actual spell actions from AnimationRegistry (no overrides)
  const eventBasedActions = eventBasedSpells.map(name =>
    animationToUnifiedAction(name, dummyPos, dummyPos)
  )

  const roundBasedActions = roundBasedSpells.map(name =>
    animationToUnifiedAction(name, dummyPos, dummyPos)
  )

  return {
    eventBased: eventBasedActions,
    roundBased: roundBasedActions
  }
}

const { eventBased, roundBased } = getPersistentSpellTemplates()

console.log('[TestPersistentSpells] 🎯 Persistent spell configurations from AnimationRegistry:', {
  eventBased: eventBased.map(s => ({
    name: s.name,
    persistDuration: s.animation.persistDuration,
    durationType: s.animation.durationType,
    color: s.animation.color,
    size: s.animation.size
  })),
  roundBased: roundBased.map(s => ({
    name: s.name,
    persistDuration: s.animation.persistDuration,
    durationType: s.animation.durationType,
    color: s.animation.color,
    size: s.animation.size
  }))
})

/**
 * Generate test scenarios for event-based persistent spells
 * Tests that post-effects with persistDuration=1 are visible at Events 1-2 and removed at Event 3
 * Semantics: persistDuration=1 means "visible for creation event + 1 additional event"
 */
export const generateEventBasedPersistentTests = (): TestScenario[] => {
  return eventBased.map((spell, index) => {
    const spellName = spell.name
    const spellId = spell.id

    // Token positions
    const casterPos = { x: 300, y: 300 }
    const targetPos = { x: 500, y: 300 }

    // Generate unique token IDs
    const casterId = `persistent-event-caster-${index}`
    const targetId = `persistent-event-target-${index}`

    return {
      id: `persistent-event-${spellId}`,
      name: `${spellName} - Event-Based Persistence`,
      description: `Tests ${spellName} post-effect visible at Events 1-2 (persistDuration=1), removed at Event 3`,
      category: 'spells',
      steps: [
        // Step 1: Add caster token
        {
          type: 'action',
          action: {
            type: 'addToken',
            params: {
              id: casterId,
              name: `Caster (${spellName})`,
              position: casterPos,
              size: 'medium',
              color: '#3D82AB',
              shape: 'circle'
            }
          },
          description: 'Add caster token'
        },
        // Step 2: Add target token
        {
          type: 'action',
          action: {
            type: 'addToken',
            params: {
              id: targetId,
              name: `Target (${spellName})`,
              position: targetPos,
              size: 'medium',
              color: '#922610',
              shape: 'circle'
            }
          },
          description: 'Add target token'
        },
        // Step 3: Wait for render
        {
          type: 'wait',
          wait: 300,
          description: 'Wait for tokens to render'
        },
        // Step 4: Start combat
        {
          type: 'action',
          action: {
            type: 'startCombat',
            params: {}
          },
          description: 'Start combat'
        },
        // Step 5: Cast spell (Event 1)
        {
          type: 'action',
          action: {
            type: 'custom',
            params: {
              execute: async () => {
                const roundStore = (await import('@/store/timelineStore')).default.getState()

                if (roundStore.timeline) {
                  // Cast spell at target using actual spell properties from UnifiedAction
                  const spellData: any = {
                    type: 'spell',
                    spellName: spell.name,
                    category: spell.category as SpellCategory,
                    fromPosition: casterPos,
                    toPosition: targetPos,
                    color: spell.animation.color,
                    size: spell.animation.size,
                    duration: spell.animation.duration,
                    durationType: 'events'
                  }

                  // Add all animation properties from the spell
                  if (spell.animation.persistDuration) spellData.persistDuration = spell.animation.persistDuration
                  if (spell.animation.persistColor) spellData.persistColor = spell.animation.persistColor
                  if (spell.animation.persistOpacity) spellData.persistOpacity = spell.animation.persistOpacity
                  if (spell.animation.secondaryColor) spellData.secondaryColor = spell.animation.secondaryColor
                  if (spell.animation.speed) spellData.projectileSpeed = spell.animation.speed
                  if (spell.animation.burstSize) spellData.burstRadius = spell.animation.burstSize
                  if (spell.animation.burstDuration) spellData.burstDuration = spell.animation.burstDuration
                  if (spell.animation.burstColor) spellData.burstColor = spell.animation.burstColor
                  if (spell.animation.trailLength) spellData.trailLength = spell.animation.trailLength
                  if (spell.animation.trailFade) spellData.trailFade = spell.animation.trailFade
                  if (spell.animation.curved) spellData.curved = spell.animation.curved
                  if (spell.animation.curveHeight) spellData.curveHeight = spell.animation.curveHeight
                  if (spell.animation.coneAngle) spellData.coneAngle = spell.animation.coneAngle
                  if (spell.animation.opacity) spellData.opacity = spell.animation.opacity
                  if (spell.animation.particles) spellData.particleEffect = spell.animation.particles

                  console.log(`[Persistent Test] 🔍 Casting ${spellName} with spellData:`, {
                    persistDuration: spellData.persistDuration,
                    durationType: spellData.durationType,
                    fromAnimation: {
                      persistDuration: spell.animation.persistDuration,
                      durationType: spell.animation.durationType
                    }
                  })

                  roundStore.addAction(casterId, 'spell', spellData, 1)
                }
              }
            }
          },
          description: `Cast ${spellName} (Event 1)`
        },
        // Step 6: Execute Event 1
        {
          type: 'action',
          action: {
            type: 'custom',
            params: {
              execute: async () => {
                const roundStore = (await import('@/store/timelineStore')).default.getState()
                await roundStore.executeEventActions(1)
              }
            }
          },
          description: 'Execute Event 1 (spell animation + post-effect)'
        },
        // Step 7: Wait for spell animation to complete
        {
          type: 'wait',
          wait: Math.max(2000, spell.animation.duration + 1000),
          description: 'Wait for spell animation to complete'
        },
        // Step 8: Capture with post-effect visible
        {
          type: 'capture',
          capture: { name: `${spellId}-post-effect-visible` },
          description: `Post-effect should be visible at target location`
        },
        // Step 8a: Assert post-effect exists
        {
          type: 'assert',
          assert: {
            type: 'custom',
            params: {
              check: async () => {
                const mapStore = (await import('@/store/mapStore')).default.getState()
                // Check if there are any active spell effects (post-effects can have various duration properties)
                const allSpells = mapStore.currentMap?.objects.filter((obj: any) => obj.type === 'spell') || []
                const postEffects = allSpells.filter((obj: any) =>
                  (obj.spellDuration && obj.spellDuration > 0) ||
                  (obj.persistDuration && obj.persistDuration > 0) ||
                  (obj.duration && obj.duration > 0) ||
                  obj.persistent ||
                  obj.isStatic
                )

                console.log(`[Persistent Test] 🔍 Spell objects after Event 1:`, {
                  total: allSpells.length,
                  withDuration: postEffects.length,
                  details: allSpells.map((obj: any) => ({
                    id: obj.id,
                    spellDuration: obj.spellDuration,
                    persistDuration: obj.persistDuration,
                    duration: obj.duration,
                    persistent: obj.persistent,
                    isStatic: obj.isStatic,
                    durationType: obj.durationType,
                    roundCreated: obj.roundCreated,
                    eventCreated: obj.eventCreated
                  }))
                })
                return postEffects.length > 0
              }
            },
            expected: true
          },
          description: 'Verify post-effect exists in map objects (TEST WILL FAIL if not found)'
        },
        // Step 9: Advance to next event
        {
          type: 'action',
          action: {
            type: 'nextEvent',
            params: {}
          },
          description: 'Advance to Event 2'
        },
        // Step 10: Wait for event transition
        {
          type: 'wait',
          wait: 300,
          description: 'Wait for event transition'
        },
        // Step 11: Add dummy action for Event 2
        {
          type: 'action',
          action: {
            type: 'custom',
            params: {
              execute: async () => {
                const roundStore = (await import('@/store/timelineStore')).default.getState()

                if (roundStore.timeline) {
                  // Add a dummy move action to Event 2
                  roundStore.addAction(casterId, 'move', {
                    type: 'move',
                    fromPosition: casterPos,
                    toPosition: { x: casterPos.x + 50, y: casterPos.y },
                    duration: 500
                  }, 2)
                }
              }
            }
          },
          description: 'Add dummy action for Event 2'
        },
        // Step 12: Execute Event 2 (should remove post-effect)
        {
          type: 'action',
          action: {
            type: 'custom',
            params: {
              execute: async () => {
                const roundStore = (await import('@/store/timelineStore')).default.getState()
                await roundStore.executeEventActions(2)
              }
            }
          },
          description: 'Execute Event 2 (should remove post-effect)'
        },
        // Step 13: Wait for event execution
        {
          type: 'wait',
          wait: 1000,
          description: 'Wait for event execution'
        },
        // Step 13a: Capture post-effect still visible at Event 2
        {
          type: 'capture',
          capture: { name: `${spellId}-post-effect-event2-visible` },
          description: 'Post-effect should still be visible at Event 2'
        },
        // Step 13b: Assert post-effect still exists at Event 2
        {
          type: 'assert',
          assert: {
            type: 'custom',
            params: {
              check: async () => {
                const mapStore = (await import('@/store/mapStore')).default.getState()
                const postEffects = mapStore.currentMap?.objects.filter((obj: any) =>
                  obj.type === 'spell' && (
                    (obj.spellDuration && obj.spellDuration > 0) ||
                    (obj.persistDuration && obj.persistDuration > 0) ||
                    (obj.duration && obj.duration > 0) ||
                    obj.persistent ||
                    obj.isStatic
                  )
                ) || []
                console.log(`[Persistent Test] 🔍 Post-effects at Event 2:`, postEffects.length)
                return postEffects.length > 0
              }
            },
            expected: true
          },
          description: 'Verify post-effect still exists at Event 2 (persistDuration=1 means visible at Events 1-2)'
        },
        // Step 14: Advance to Event 3
        {
          type: 'action',
          action: {
            type: 'nextEvent',
            params: {}
          },
          description: 'Advance to Event 3'
        },
        // Step 15: Wait for event transition
        {
          type: 'wait',
          wait: 300,
          description: 'Wait for event transition to Event 3'
        },
        // Step 16: Add dummy action for Event 3
        {
          type: 'action',
          action: {
            type: 'custom',
            params: {
              execute: async () => {
                const roundStore = (await import('@/store/timelineStore')).default.getState()

                if (roundStore.timeline) {
                  // Add a dummy move action to Event 3
                  roundStore.addAction(casterId, 'move', {
                    type: 'move',
                    fromPosition: { x: casterPos.x + 50, y: casterPos.y },
                    toPosition: { x: casterPos.x + 100, y: casterPos.y },
                    duration: 500
                  }, 3)
                }
              }
            }
          },
          description: 'Add dummy action for Event 3'
        },
        // Step 17: Execute Event 3 (should trigger post-effect removal)
        {
          type: 'action',
          action: {
            type: 'custom',
            params: {
              execute: async () => {
                const roundStore = (await import('@/store/timelineStore')).default.getState()
                await roundStore.executeEventActions(3)
              }
            }
          },
          description: 'Execute Event 3 (cleanup should remove post-effect)'
        },
        // Step 18: Wait for cleanup
        {
          type: 'wait',
          wait: 800,
          description: 'Wait for Event 3 execution and cleanup'
        },
        // Step 19: Capture after post-effect removal
        {
          type: 'capture',
          capture: { name: `${spellId}-post-effect-removed` },
          description: 'Post-effect should be removed at Event 3'
        },
        // Step 19a: Assert post-effect is removed
        {
          type: 'assert',
          assert: {
            type: 'custom',
            params: {
              check: async () => {
                const mapStore = (await import('@/store/mapStore')).default.getState()
                // Check if there are NO active spell effects with any duration properties
                const postEffects = mapStore.currentMap?.objects.filter((obj: any) =>
                  obj.type === 'spell' && (
                    (obj.spellDuration && obj.spellDuration > 0) ||
                    (obj.persistDuration && obj.persistDuration > 0) ||
                    (obj.duration && obj.duration > 0) ||
                    obj.persistent ||
                    obj.isStatic
                  )
                ) || []
                console.log(`[Persistent Test] 🔍 Post-effects after Event 3:`, postEffects.length)
                return postEffects.length === 0
              }
            },
            expected: true
          },
          description: 'Verify post-effect is removed from map objects at Event 3 (TEST WILL FAIL if still present)'
        },
        // Step 20: Pause to observe
        {
          type: 'wait',
          wait: 500,
          description: `Observe ${spellName} post-effect lifecycle complete`
        }
      ]
    }
  })
}

/**
 * Generate test scenarios for round-based persistent spells
 * Tests that area effects persist for specified rounds and are removed after round change
 */
export const generateRoundBasedPersistentTests = (): TestScenario[] => {
  return roundBased.map((spell, index) => {
    const spellName = spell.name
    const spellId = spell.id

    // Token positions
    const casterPos = { x: 300, y: 300 }
    const areaPos = { x: 500, y: 300 }

    // Generate unique token IDs
    const casterId = `persistent-round-caster-${index}`

    return {
      id: `persistent-round-${spellId}`,
      name: `${spellName} - Round-Based Persistence`,
      description: `Tests ${spellName} area effect persists across rounds and is removed after duration`,
      category: 'spells',
      steps: [
        // Step 1: Add caster token
        {
          type: 'action',
          action: {
            type: 'addToken',
            params: {
              id: casterId,
              name: `Caster (${spellName})`,
              position: casterPos,
              size: 'medium',
              color: '#3D82AB',
              shape: 'circle'
            }
          },
          description: 'Add caster token'
        },
        // Step 2: Wait for render
        {
          type: 'wait',
          wait: 300,
          description: 'Wait for token to render'
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
        // Step 4: Cast area spell (Round 1, Event 1)
        {
          type: 'action',
          action: {
            type: 'custom',
            params: {
              execute: async () => {
                const roundStore = (await import('@/store/timelineStore')).default.getState()

                if (roundStore.timeline) {
                  // Cast area spell using actual spell properties from UnifiedAction
                  const spellData: any = {
                    type: 'spell',
                    spellName: spell.name,
                    category: spell.category as SpellCategory,
                    fromPosition: casterPos,
                    toPosition: areaPos,
                    color: spell.animation.color,
                    size: spell.animation.size,
                    duration: spell.animation.duration,
                    durationType: 'rounds'
                  }

                  // Add all animation properties from the spell (use actual values from registry)
                  if (spell.animation.persistDuration) spellData.persistDuration = spell.animation.persistDuration
                  if (spell.animation.persistColor) spellData.persistColor = spell.animation.persistColor
                  if (spell.animation.persistOpacity) spellData.persistOpacity = spell.animation.persistOpacity
                  if (spell.animation.secondaryColor) spellData.secondaryColor = spell.animation.secondaryColor
                  if (spell.animation.opacity) spellData.opacity = spell.animation.opacity
                  if (spell.animation.particles) spellData.particleEffect = spell.animation.particles

                  roundStore.addAction(casterId, 'spell', spellData, 1)
                }
              }
            }
          },
          description: `Cast ${spellName} (Round 1, Event 1)`
        },
        // Step 5: Execute Event 1
        {
          type: 'action',
          action: {
            type: 'custom',
            params: {
              execute: async () => {
                const roundStore = (await import('@/store/timelineStore')).default.getState()
                await roundStore.executeEventActions(1)
              }
            }
          },
          description: 'Execute Event 1 (spell animation + area effect)'
        },
        // Step 6: Wait for spell animation
        {
          type: 'wait',
          wait: Math.max(1500, spell.animation.duration + 500),
          description: 'Wait for spell animation to complete'
        },
        // Step 7: Capture Round 1 with area effect
        {
          type: 'capture',
          capture: { name: `${spellId}-round1-area-visible` },
          description: 'Area effect should be visible in Round 1'
        },
        // Step 7a: Assert area effect exists
        {
          type: 'assert',
          assert: {
            type: 'custom',
            params: {
              check: async () => {
                const mapStore = (await import('@/store/mapStore')).default.getState()
                // Check for active area effects (can have various duration properties)
                const areaEffects = mapStore.currentMap?.objects.filter((obj: any) =>
                  obj.type === 'spell' && (
                    (obj.spellDuration && obj.spellDuration > 0) ||
                    (obj.persistDuration && obj.persistDuration > 0) ||
                    (obj.duration && obj.duration > 0) ||
                    obj.persistent ||
                    obj.isStatic
                  )
                ) || []
                console.log(`[Persistent Test] Area effects in Round 1:`, areaEffects.length)
                return areaEffects.length > 0
              }
            },
            expected: true
          },
          description: 'Verify area effect exists in Round 1 (TEST WILL FAIL if not found)'
        },
        // Step 8: Advance to Round 2
        {
          type: 'action',
          action: {
            type: 'nextRound',
            params: {}
          },
          description: 'Advance to Round 2'
        },
        // Step 9: Wait for round transition
        {
          type: 'wait',
          wait: 500,
          description: 'Wait for round transition'
        },
        // Step 10: Capture Round 2 with area effect still visible
        {
          type: 'capture',
          capture: { name: `${spellId}-round2-area-visible` },
          description: 'Area effect should still be visible in Round 2'
        },
        // Steps 11-19: Advance through Rounds 3-10 (8 more rounds)
        // Area effect should remain visible throughout
        {
          type: 'action',
          action: {
            type: 'custom',
            params: {
              execute: async () => {
                const roundStore = (await import('@/store/timelineStore')).default.getState()

                // Advance through rounds 3-10 (8 rounds)
                for (let i = 3; i <= 10; i++) {
                  roundStore.nextRound()
                  // Small delay between rounds for visual observation
                  await new Promise(resolve => setTimeout(resolve, 200))
                }
              }
            }
          },
          description: 'Advance through Rounds 3-10 (area effect still visible)'
        },
        // Step 20: Wait for round transitions
        {
          type: 'wait',
          wait: 500,
          description: 'Wait for all round transitions to complete'
        },
        // Step 21: Capture Round 10 - area effect should STILL be visible (last round of duration)
        {
          type: 'capture',
          capture: { name: `${spellId}-round10-area-visible` },
          description: 'Area effect should still be visible in Round 10 (last round of duration)'
        },
        // Step 21a: Assert area effect still exists in Round 10
        {
          type: 'assert',
          assert: {
            type: 'custom',
            params: {
              check: async () => {
                const mapStore = (await import('@/store/mapStore')).default.getState()
                const areaEffects = mapStore.currentMap?.objects.filter((obj: any) =>
                  obj.type === 'spell' && (
                    (obj.spellDuration && obj.spellDuration > 0) ||
                    (obj.persistDuration && obj.persistDuration > 0) ||
                    (obj.duration && obj.duration > 0) ||
                    obj.persistent ||
                    obj.isStatic
                  )
                ) || []
                console.log(`[Persistent Test] Area effects in Round 10:`, areaEffects.length)
                return areaEffects.length > 0
              }
            },
            expected: true
          },
          description: 'Verify area effect still exists in Round 10 (TEST WILL FAIL if not found)'
        },
        // Step 22: Advance to Round 11 (beyond persistDuration)
        {
          type: 'action',
          action: {
            type: 'nextRound',
            params: {}
          },
          description: 'Advance to Round 11 (beyond persistDuration of 10 rounds)'
        },
        // Step 23: Wait for round transition and cleanup
        {
          type: 'wait',
          wait: 800,
          description: 'Wait for round transition and effect cleanup'
        },
        // Step 24: Capture Round 11 - area effect should be REMOVED
        {
          type: 'capture',
          capture: { name: `${spellId}-round11-area-removed` },
          description: 'Area effect should be removed after duration expires (Round 11)'
        },
        // Step 24a: Assert area effect is removed in Round 11
        {
          type: 'assert',
          assert: {
            type: 'custom',
            params: {
              check: async () => {
                const mapStore = (await import('@/store/mapStore')).default.getState()
                // Check that NO area effects remain (check all possible duration properties)
                const areaEffects = mapStore.currentMap?.objects.filter((obj: any) =>
                  obj.type === 'spell' && (
                    (obj.spellDuration && obj.spellDuration > 0) ||
                    (obj.persistDuration && obj.persistDuration > 0) ||
                    (obj.duration && obj.duration > 0) ||
                    obj.persistent ||
                    obj.isStatic
                  )
                ) || []
                console.log(`[Persistent Test] Area effects in Round 11:`, areaEffects.length)
                return areaEffects.length === 0
              }
            },
            expected: true
          },
          description: 'Verify area effect is removed in Round 11 (TEST WILL FAIL if still present)'
        },
        // Step 25: Pause to observe final state
        {
          type: 'wait',
          wait: 1000,
          description: `Observe ${spellName} area effect fully removed`
        }
      ]
    }
  })
}

// Export all persistent spell test scenarios
export const persistentSpellTests = [
  ...generateEventBasedPersistentTests(),
  ...generateRoundBasedPersistentTests()
]

// Helper functions
export const getPersistentSpellTestsByType = (type: 'events' | 'rounds'): TestScenario[] => {
  return type === 'events'
    ? generateEventBasedPersistentTests()
    : generateRoundBasedPersistentTests()
}

export const getPersistentSpellTest = (spellId: string): TestScenario | undefined => {
  return persistentSpellTests.find(scenario =>
    scenario.id === `persistent-event-${spellId}` ||
    scenario.id === `persistent-round-${spellId}`
  )
}

// Export counts for test runner info
export const persistentSpellTestCount = persistentSpellTests.length
export const eventBasedTestCount = eventBased.length
export const roundBasedTestCount = roundBased.length
