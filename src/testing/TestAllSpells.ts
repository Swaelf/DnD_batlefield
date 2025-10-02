import type { TestScenario } from './TestScenarios'
import { spellTemplates } from '@/data/unifiedActions/spellTemplates'

/**
 * Dynamically generates test scenarios for ALL spells in spellTemplates.ts
 *
 * Test pattern for each spell:
 * 1. Add token 1 at (200, 200)
 * 2. Add token 2 at (500, 200)
 * 3. Move token 1 to (300, 400)
 * 4. Cast spell from token 2 to token 1 (tracking - follows movement)
 * 5. Cast spell from token 2 to token 1's INITIAL position (static - no tracking)
 * 6. Execute event
 *
 * This test automatically updates when spells are added/removed from spellTemplates.ts
 */

// Map animation types to spell categories for legacy event data
const getSpellCategory = (animationType: string): string => {
  const categoryMap: Record<string, string> = {
    'projectile': 'projectile',
    'projectile_burst': 'projectile-burst',
    'ray': 'beam',
    'beam': 'beam',
    'area': 'area',
    'burst': 'burst',
    'cone': 'cone',
    'line': 'line',
    'touch': 'touch',
    'pillar': 'pillar'
  }
  return categoryMap[animationType] || 'projectile'
}

// Generate a unique test scenario for each spell
export const generateSpellTestScenarios = (): TestScenario[] => {
  return spellTemplates.map((spell, index) => {
    const spellName = spell.name
    const spellId = spell.id
    const animationType = spell.animation.type
    const category = getSpellCategory(animationType)
    const color = spell.animation.color
    const size = spell.animation.size || 15
    const duration = spell.duration || 1000

    // Token positions
    const token1Initial = { x: 200, y: 200 }
    const token2Position = { x: 500, y: 200 }
    const token1Final = { x: 300, y: 400 }

    // Generate unique token IDs
    const token1Id = `spell-test-token1-${index}`
    const token2Id = `spell-test-token2-${index}`

    return {
      id: `spell-movement-tracking-${spellId}`,
      name: `${spellName} + Movement Tracking`,
      description: `Tests ${spellName} (${animationType}) spell origin tracking after token movement`,
      category: 'spells',
      steps: [
        // Step 1: Add token 1
        {
          type: 'action',
          action: {
            type: 'addToken',
            params: {
              id: token1Id,
              name: `Target (${spellName})`,
              position: token1Initial,
              size: 'medium',
              color: '#3D82AB',
              shape: 'circle'
            }
          },
          description: 'Add target token at initial position'
        },
        // Step 2: Add token 2
        {
          type: 'action',
          action: {
            type: 'addToken',
            params: {
              id: token2Id,
              name: `Caster (${spellName})`,
              position: token2Position,
              size: 'medium',
              color: '#10B981',
              shape: 'circle'
            }
          },
          description: 'Add caster token'
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
        // Step 5: Add actions to timeline
        {
          type: 'action',
          action: {
            type: 'custom',
            params: {
              execute: async () => {
                const roundStore = (await import('@/store/timelineStore')).default.getState()

                if (roundStore.timeline) {
                  // 1. Token 1 moves to final position
                  roundStore.addAction(token1Id, 'move', {
                    fromPosition: token1Initial,
                    toPosition: token1Final,
                    duration: 600
                  }, 1)

                  // 2. Token 2 casts spell at Token 1 (tracking)
                  roundStore.addAction(token2Id, 'spell', {
                    tokenId: token2Id,
                    targetTokenId: token1Id, // Tracks moving target
                    spellName: spellName,
                    category: category,
                    fromPosition: token2Position,
                    toPosition: token1Final, // Will track to final position
                    color: color,
                    size: size,
                    duration: duration,
                    ...(category === 'projectile-burst' && { burstRadius: 30 }),
                    ...(category === 'cone' && { coneAngle: 60 })
                  }, 1)

                  // 3. Token 2 casts spell at Token 1's INITIAL position (static)
                  roundStore.addAction(token2Id, 'spell', {
                    tokenId: token2Id,
                    // NO targetTokenId - static position
                    spellName: spellName,
                    category: category,
                    fromPosition: token2Position,
                    toPosition: token1Initial, // Static initial position
                    color: color,
                    size: size,
                    duration: duration,
                    ...(category === 'projectile-burst' && { burstRadius: 30 }),
                    ...(category === 'cone' && { coneAngle: 60 })
                  }, 1)
                }
              }
            }
          },
          description: `Add movement + ${spellName} sequence`
        },
        // Step 6: Capture before execution
        {
          type: 'capture',
          capture: { name: `before-${spellId}` },
          description: 'Capture initial positions'
        },
        // Step 7: Execute all actions
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
          description: 'Execute all actions'
        },
        // Step 8: Wait for animations
        {
          type: 'wait',
          wait: Math.max(3000, duration + 1000), // Wait for spell animation + buffer
          description: 'Wait for all animations to complete'
        },
        // Step 9: Capture after execution
        {
          type: 'capture',
          capture: { name: `after-${spellId}` },
          description: 'Capture final state'
        },
        // Step 10: Assert token 1 moved
        {
          type: 'assert',
          assert: {
            type: 'tokenPosition',
            params: { tokenId: token1Id },
            expected: token1Final
          },
          description: 'Verify target token moved to final position'
        },
        // Step 11: Assert token 2 stayed
        {
          type: 'assert',
          assert: {
            type: 'tokenPosition',
            params: { tokenId: token2Id },
            expected: token2Position
          },
          description: 'Verify caster token stayed in place'
        },
        // Step 12: Pause to observe
        {
          type: 'wait',
          wait: 500,
          description: `Pause to observe ${spellName} effects`
        }
      ]
    }
  })
}

// Export the dynamically generated scenarios
export const allSpellTestScenarios = generateSpellTestScenarios()

// Helper to get scenarios by spell category
export const getSpellTestsByCategory = (category: string): TestScenario[] => {
  return spellTemplates
    .filter(spell => spell.category === category)
    .map((spell, index) => {
      const allScenarios = generateSpellTestScenarios()
      return allScenarios.find(scenario => scenario.id === `spell-movement-tracking-${spell.id}`)!
    })
}

// Helper to get a specific spell test
export const getSpellTest = (spellId: string): TestScenario | undefined => {
  const allScenarios = generateSpellTestScenarios()
  return allScenarios.find(scenario => scenario.id === `spell-movement-tracking-${spellId}`)
}

// Export spell count for test runner info
export const spellTestCount = spellTemplates.length
