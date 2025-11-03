import type { TestScenario } from './TestScenarios'
import type { SpellCategory } from '@/types/timeline'
import { AnimationRegistry, type RegisteredAnimationName } from '@/lib/animations'
import { animationToUnifiedAction } from '@/lib/animations/adapters/toUnifiedAction'

/**
 * Dynamically generates test scenarios for spell animations
 *
 * Test pattern for each spell (SAME AS ATTACKS):
 * 1. Add token 1 (target) at (200, 200)
 * 2. Add token 2 (caster) at (500, 200)
 * 3. Move token 1 to (300, 400)
 * 4. Move token 2 to (600, 300)
 * 5. Token 2 casts spell at token 1 (tracking - follows movement)
 * 6. Token 2 casts spell at token 1's INITIAL position (static - no tracking)
 * 7. Execute event
 */

// Map animation types to spell categories for legacy event data
const getSpellCategory = (animationType: string): SpellCategory => {
  const categoryMap: Record<string, SpellCategory> = {
    'projectile': 'projectile',
    'projectile_burst': 'projectile-burst',
    'ray': 'ray',
    'beam': 'ray',
    'area': 'area',
    'burst': 'burst',
    'cone': 'cone',
    'line': 'ray',
    'touch': 'area',
    'pillar': 'area'
  }
  return categoryMap[animationType] || 'projectile'
}

// Get spell templates from animation library
const getSpellTemplates = () => {
  const templates = AnimationRegistry.getAllTemplates()
    .filter(t => ['projectile', 'burst', 'area', 'ray', 'cone'].includes(t.category))

  const dummyPos = { x: 0, y: 0 }
  return templates.map(template =>
    // Template names from registry are guaranteed to be RegisteredAnimationName
    animationToUnifiedAction(template.name as RegisteredAnimationName, dummyPos, dummyPos)
  )
}

// Log spell configurations for debugging
console.log('[TestAllSpells] 🎯 Spell configurations loaded from AnimationRegistry:',
  getSpellTemplates().map(s => ({
    name: s.name,
    category: s.category,
    animationType: s.animation.type,
    color: s.animation.color
  }))
)

// Generate a unique test scenario for each spell
export const generateSpellTestScenarios = (): TestScenario[] => {
  const spellTemplates = getSpellTemplates()

  return spellTemplates.map((spell, index) => {
    const spellName = spell.name
    const spellId = spell.id
    const animationType = spell.animation.type
    const category = getSpellCategory(animationType)

    // Extract ALL animation properties from UnifiedAction
    const anim = spell.animation
    const color = anim.color
    const secondaryColor = anim.secondaryColor
    const size = anim.size || 15
    const duration = anim.duration || 1000

    // Projectile properties
    const projectileSpeed = anim.speed
    const trailLength = anim.trailLength
    const trailFade = anim.trailFade
    const curved = anim.curved
    const curveHeight = anim.curveHeight

    // Burst properties
    const burstRadius = anim.burstSize
    const burstColor = anim.burstColor
    const burstDuration = anim.burstDuration

    // Cone properties
    const coneAngle = anim.coneAngle || 60

    // Area properties
    const opacity = anim.opacity

    // Persistent properties
    const persistDuration = anim.persistDuration || 0
    const persistColor = anim.persistColor
    const persistOpacity = anim.persistOpacity
    const durationType = anim.durationType

    // Effects
    const particles = anim.particles || false

    // Token positions (SAME AS ATTACKS)
    const token1Initial = { x: 200, y: 200 }
    const token2Initial = { x: 500, y: 200 }
    const token1Final = { x: 300, y: 400 }
    const token2Final = { x: 600, y: 300 }

    // Generate unique token IDs
    const token1Id = `spell-test-token1-${index}`
    const token2Id = `spell-test-token2-${index}`

    return {
      id: `spell-movement-tracking-${spellId}`,
      name: `${spellName} + Movement Tracking`,
      description: `Tests ${spellName} (${category}) spell with token movement`,
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
              name: `Caster (${spellName})`,
              position: token2Initial,
              size: 'medium',
              color: '#3D82AB',
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

                  // 3. Token 2 casts spell at Token 1 (tracking - follows movement)
                  roundStore.addAction(token2Id, 'spell', {
                    type: 'spell',
                    spellName: spellName,
                    category: category,
                    fromPosition: token2Final,
                    toPosition: token1Final,
                    targetTokenId: token1Id, // Track moving target
                    trackTarget: true,
                    color: color,
                    secondaryColor: secondaryColor,
                    size: size,
                    duration: duration,
                    // Projectile properties
                    projectileSpeed: projectileSpeed,
                    trailLength: trailLength,
                    trailFade: trailFade,
                    curved: curved,
                    curveHeight: curveHeight,
                    // Burst properties
                    burstRadius: burstRadius,
                    burstColor: burstColor,
                    burstDuration: burstDuration,
                    // Cone properties
                    coneAngle: coneAngle,
                    // Area properties
                    opacity: opacity,
                    // Persistent properties
                    persistDuration: persistDuration,
                    persistColor: persistColor,
                    persistOpacity: persistOpacity,
                    durationType: durationType,
                    // Effects
                    particleEffect: particles
                  }, 1)

                  // 4. Token 2 casts spell at Token 1's INITIAL position (static target)
                  roundStore.addAction(token2Id, 'spell', {
                    type: 'spell',
                    spellName: spellName,
                    category: category,
                    fromPosition: token2Final,
                    toPosition: token1Initial, // Static initial position
                    // NO targetTokenId - static position
                    trackTarget: false,
                    color: color,
                    secondaryColor: secondaryColor,
                    size: size,
                    duration: duration,
                    // Projectile properties
                    projectileSpeed: projectileSpeed,
                    trailLength: trailLength,
                    trailFade: trailFade,
                    curved: curved,
                    curveHeight: curveHeight,
                    // Burst properties
                    burstRadius: burstRadius,
                    burstColor: burstColor,
                    burstDuration: burstDuration,
                    // Cone properties
                    coneAngle: coneAngle,
                    // Area properties
                    opacity: opacity,
                    // Persistent properties
                    persistDuration: persistDuration,
                    persistColor: persistColor,
                    persistOpacity: persistOpacity,
                    durationType: durationType,
                    // Effects
                    particleEffect: particles
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
          wait: Math.max(3000, duration + 1500), // Wait for spell animation + buffer
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
        // Step 11: Assert token 2 moved
        {
          type: 'assert',
          assert: {
            type: 'tokenPosition',
            params: { tokenId: token2Id },
            expected: token2Final
          },
          description: 'Verify caster token moved to final position'
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
  const spellTemplates = getSpellTemplates()
  return spellTemplates
    .filter(spell => spell.category === category)
    .map(spell => {
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
export const spellTestCount = getSpellTemplates().length
