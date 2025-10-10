import type { TestScenario } from './TestScenarios'
import { AnimationRegistry } from '@/lib/animations'
import { animationToUnifiedAction } from '@/lib/animations/adapters/toUnifiedAction'

/**
 * Dynamically generates test scenarios for attack animations
 *
 * Test pattern for each attack type:
 * 1. Add token 1 (target) at (200, 200)
 * 2. Add token 2 (attacker) at (500, 200)
 * 3. Move token 1 to (300, 400)
 * 4. Move token 2 to (600, 300)
 * 5. Token 2 performs attack on token 1 (tracking - follows movement)
 * 6. Token 2 performs attack on token 1's INITIAL position (static - no tracking)
 * 7. Execute event
 */

// Get attack templates from animation library
const getAttackTemplates = () => {
  // Get only attack templates by name
  const attackNames = ['Longsword', 'Rapier', 'Warhammer', 'Longbow', 'Thrown Dagger', 'Sling']
  const templates = AnimationRegistry.getAllTemplates()
    .filter(t => attackNames.includes(t.name))

  const dummyPos = { x: 0, y: 0 }
  return templates.map(template => {
    const action = animationToUnifiedAction(template.name, dummyPos, dummyPos)

    // Determine if ranged or melee based on category (weaponType)
    // Ranged categories: arrow, bolt, thrown, sling
    // Melee categories: sword, axe, mace, dagger, spear, etc.
    const rangedCategories = ['arrow', 'bolt', 'thrown', 'sling']
    const isRanged = rangedCategories.includes(action.category)

    return {
      id: action.id,
      name: action.name,
      weaponName: action.name,
      attackType: (isRanged ? 'ranged' : 'melee') as 'melee' | 'ranged',
      damageType: action.damageType || 'slashing',
      damage: action.damage || '1d8',
      animation: action.animation.type,
      color: action.animation.color,
      duration: action.animation.duration,
      range: action.range || 5,
      // Store category for debugging
      category: action.category
    }
  })
}

// Attack configurations from animation library
const attackConfigs = getAttackTemplates()

// Log attack configurations for debugging
console.log('[TestAllAttacks] 🎯 Attack configurations loaded from AnimationRegistry:',
  attackConfigs.map(a => ({
    name: a.name,
    category: a.category,
    attackType: a.attackType,
    animation: a.animation,
    color: a.color
  }))
)

// Generate a unique test scenario for each attack type
export const generateAttackTestScenarios = (): TestScenario[] => {
  return attackConfigs.map((attack, index) => {
    const attackName = attack.name
    const attackId = attack.id

    // Token positions
    const token1Initial = { x: 200, y: 200 }
    const token2Initial = { x: 500, y: 200 }
    const token1Final = { x: 300, y: 400 }
    const token2Final = { x: 600, y: 300 }

    // Generate unique token IDs
    const token1Id = `attack-test-token1-${index}`
    const token2Id = `attack-test-token2-${index}`

    return {
      id: `attack-movement-tracking-${attackId}`,
      name: `${attackName} + Movement Tracking`,
      description: `Tests ${attackName} (${attack.attackType}) attack with token movement`,
      category: 'attacks',
      steps: [
        // Step 1: Add token 1
        {
          type: 'action',
          action: {
            type: 'addToken',
            params: {
              id: token1Id,
              name: `Target (${attackName})`,
              position: token1Initial,
              size: 'medium',
              color: '#922610',
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
              name: `Attacker (${attackName})`,
              position: token2Initial,
              size: 'medium',
              color: '#3D82AB',
              shape: 'circle'
            }
          },
          description: 'Add attacker token'
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
                    type: 'move',
                    fromPosition: token1Initial,
                    toPosition: token1Final,
                    duration: 600
                  }, 1)

                  // 2. Token 2 moves to final position
                  roundStore.addAction(token2Id, 'move', {
                    type: 'move',
                    fromPosition: token2Initial,
                    toPosition: token2Final,
                    duration: 600
                  }, 1)

                  // 3. Token 2 attacks Token 1 (from final positions - tracking)
                  roundStore.addAction(token2Id, 'attack', {
                    type: 'attack',
                    weaponName: attack.weaponName,
                    attackType: attack.attackType,
                    fromPosition: token2Final,
                    toPosition: token1Final,
                    damage: attack.damage,
                    damageType: attack.damageType,
                    attackBonus: 5,
                    range: attack.range,
                    duration: attack.duration,
                    animation: attack.animation,
                    color: attack.color,
                    isCritical: false,
                    targetTokenId: token1Id // Track moving target
                  }, 1)

                  // 4. Token 2 attacks Token 1's INITIAL position (static target)
                  roundStore.addAction(token2Id, 'attack', {
                    type: 'attack',
                    weaponName: attack.weaponName,
                    attackType: attack.attackType,
                    fromPosition: token2Final,
                    toPosition: token1Initial, // Static initial position
                    damage: attack.damage,
                    damageType: attack.damageType,
                    attackBonus: 5,
                    range: attack.range,
                    duration: attack.duration,
                    animation: attack.animation,
                    color: attack.color,
                    isCritical: false
                    // NO targetTokenId - static position
                  }, 1)
                }
              }
            }
          },
          description: `Add movement + ${attackName} sequence`
        },
        // Step 6: Capture before execution
        {
          type: 'capture',
          capture: { name: `before-${attackId}` },
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
          wait: Math.max(3000, attack.duration + 1500), // Wait for attack animation + buffer
          description: 'Wait for all animations to complete'
        },
        // Step 9: Capture after execution
        {
          type: 'capture',
          capture: { name: `after-${attackId}` },
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
        // Step 11: Assert token 2 moved
        {
          type: 'assert',
          assert: {
            type: 'tokenPosition',
            params: { tokenId: token2Id },
            expected: token2Final
          },
          description: 'Verify attacker token moved to final position'
        },
        // Step 12: Pause to observe
        {
          type: 'wait',
          wait: 500,
          description: `Pause to observe ${attackName} effects`
        }
      ]
    }
  })
}

// Export the dynamically generated scenarios
export const allAttackTestScenarios = generateAttackTestScenarios()

// Helper to get scenarios by attack type
export const getAttackTestsByType = (attackType: 'melee' | 'ranged'): TestScenario[] => {
  return attackConfigs
    .filter(attack => attack.attackType === attackType)
    .map(attack => {
      const allScenarios = generateAttackTestScenarios()
      return allScenarios.find(scenario => scenario.id === `attack-movement-tracking-${attack.id}`)!
    })
}

// Helper to get scenarios by damage type
export const getAttackTestsByDamageType = (damageType: string): TestScenario[] => {
  return attackConfigs
    .filter(attack => attack.damageType === damageType)
    .map(attack => {
      const allScenarios = generateAttackTestScenarios()
      return allScenarios.find(scenario => scenario.id === `attack-movement-tracking-${attack.id}`)!
    })
}

// Helper to get a specific attack test
export const getAttackTest = (attackId: string): TestScenario | undefined => {
  const allScenarios = generateAttackTestScenarios()
  return allScenarios.find(scenario => scenario.id === `attack-movement-tracking-${attackId}`)
}

// Export attack count for test runner info
export const attackTestCount = attackConfigs.length
