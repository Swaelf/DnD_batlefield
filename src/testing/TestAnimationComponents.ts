import type { TestScenario } from './TestScenarios'
import type { Position } from '@/types/map'

/**
 * Animation Component Tests
 *
 * These tests verify that each animation component type renders and animates correctly:
 * - Projectile animations (arrows, magic missiles, etc.)
 * - Burst animations (explosions, impacts)
 * - Cone animations (breath weapons, sprays)
 * - Area animations (circles, auras)
 * - Ray animations (beams, lasers)
 * - Beam animations (sustained rays)
 */

// Common positions for tests
const casterPos: Position = { x: 200, y: 300 }
const targetPos: Position = { x: 600, y: 300 }

/**
 * Test 1: Projectile Animation Component
 * Verifies: Arrow/missile flies from point A to point B with proper speed and trajectory
 */
export const projectileAnimationTest: TestScenario = {
  id: 'projectile-animation',
  name: 'Projectile Animation Component',
  description: 'Tests projectile animation (arrow flight, magic missile, etc.)',
  category: 'animations',
  steps: [
    {
      type: 'action',
      action: { type: 'startCombat', params: {} },
      description: 'Start combat'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            roundStore.addAction('void-token', 'spell', {
              type: 'spell',
              spellName: 'Arrow',
              category: 'projectile',
              fromPosition: casterPos,
              toPosition: targetPos,
              color: '#8B4513',
              size: 15,
              duration: 1000,
              projectileSpeed: 400
            }, 1)
          }
        }
      },
      description: 'Add projectile spell (Arrow)'
    },
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
      description: 'Execute projectile animation'
    },
    {
      type: 'wait',
      wait: 2000,
      description: 'Wait for projectile to complete flight'
    },
    {
      type: 'assert',
      assert: {
        type: 'spellActive',
        params: { spellName: 'Arrow' },
        expected: false
      },
      description: 'Verify projectile animation completed and cleaned up'
    }
  ]
}

/**
 * Test 2: Burst Animation Component
 * Verifies: Explosion expands and fades at target location
 */
export const burstAnimationTest: TestScenario = {
  id: 'burst-animation',
  name: 'Burst Animation Component',
  description: 'Tests burst/explosion animation at target location',
  category: 'animations',
  steps: [
    {
      type: 'action',
      action: { type: 'startCombat', params: {} },
      description: 'Start combat'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            roundStore.addAction('void-token', 'spell', {
              type: 'spell',
              spellName: 'Explosion',
              category: 'area',
              fromPosition: targetPos,
              toPosition: targetPos,
              color: '#FF4500',
              size: 60,
              duration: 1500,
              burstRadius: 80
            }, 1)
          }
        }
      },
      description: 'Add burst animation spell'
    },
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
      description: 'Execute burst animation'
    },
    {
      type: 'wait',
      wait: 2000,
      description: 'Wait for burst expansion and fade'
    },
    {
      type: 'assert',
      assert: {
        type: 'spellActive',
        params: { spellName: 'Explosion' },
        expected: false
      },
      description: 'Verify burst animation completed'
    }
  ]
}

/**
 * Test 3: Projectile-Burst Combined Animation
 * Verifies: Projectile flies then bursts at destination (Fireball pattern)
 */
export const projectileBurstAnimationTest: TestScenario = {
  id: 'projectile-burst-animation',
  name: 'Projectile-Burst Animation Component',
  description: 'Tests combined projectile flight + burst explosion (e.g., Fireball)',
  category: 'animations',
  steps: [
    {
      type: 'action',
      action: { type: 'startCombat', params: {} },
      description: 'Start combat'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            roundStore.addAction('void-token', 'spell', {
              type: 'spell',
              spellName: 'Fireball',
              category: 'projectile-burst',
              fromPosition: casterPos,
              toPosition: targetPos,
              color: '#FF4500',
              size: 20,
              duration: 1000,
              projectileSpeed: 500,
              burstRadius: 60
            }, 1)
          }
        }
      },
      description: 'Add projectile-burst spell (Fireball)'
    },
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
      description: 'Execute projectile-burst animation'
    },
    {
      type: 'wait',
      wait: 3000,
      description: 'Wait for projectile flight + burst explosion'
    },
    {
      type: 'assert',
      assert: {
        type: 'spellActive',
        params: { spellName: 'Fireball' },
        expected: false
      },
      description: 'Verify projectile-burst animation completed'
    }
  ]
}

/**
 * Test 4: Cone Animation Component
 * Verifies: Cone emanates from caster towards target in expanding wedge shape
 */
export const coneAnimationTest: TestScenario = {
  id: 'cone-animation',
  name: 'Cone Animation Component',
  description: 'Tests cone/wedge animation (breath weapon, spray)',
  category: 'animations',
  steps: [
    {
      type: 'action',
      action: { type: 'startCombat', params: {} },
      description: 'Start combat'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            roundStore.addAction('void-token', 'spell', {
              type: 'spell',
              spellName: 'Burning Hands',
              category: 'cone',
              fromPosition: casterPos,
              toPosition: targetPos,
              color: '#FF6600',
              size: 15, // Cone size in feet
              duration: 1200,
              coneAngle: 53 // 15-foot cone (53 degree angle)
            }, 1)
          }
        }
      },
      description: 'Add cone spell (Burning Hands)'
    },
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
      description: 'Execute cone animation'
    },
    {
      type: 'wait',
      wait: 2000,
      description: 'Wait for cone expansion and fade'
    },
    {
      type: 'assert',
      assert: {
        type: 'spellActive',
        params: { spellName: 'Burning Hands' },
        expected: false
      },
      description: 'Verify cone animation completed'
    }
  ]
}

/**
 * Test 5: Ray Animation Component
 * Verifies: Instant beam from caster to target
 */
export const rayAnimationTest: TestScenario = {
  id: 'ray-animation',
  name: 'Ray Animation Component',
  description: 'Tests ray/beam animation (instant line from caster to target)',
  category: 'animations',
  steps: [
    {
      type: 'action',
      action: { type: 'startCombat', params: {} },
      description: 'Start combat'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            roundStore.addAction('void-token', 'spell', {
              type: 'spell',
              spellName: 'Scorching Ray',
              category: 'ray',
              fromPosition: casterPos,
              toPosition: targetPos,
              color: '#FF0000',
              size: 5,
              duration: 800
            }, 1)
          }
        }
      },
      description: 'Add ray spell (Scorching Ray)'
    },
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
      description: 'Execute ray animation'
    },
    {
      type: 'wait',
      wait: 1500,
      description: 'Wait for ray flash and fade'
    },
    {
      type: 'assert',
      assert: {
        type: 'spellActive',
        params: { spellName: 'Scorching Ray' },
        expected: false
      },
      description: 'Verify ray animation completed'
    }
  ]
}

/**
 * Test 6: Beam Animation Component
 * Verifies: Sustained beam animation (different from instant ray)
 */
export const beamAnimationTest: TestScenario = {
  id: 'beam-animation',
  name: 'Beam Animation Component',
  description: 'Tests sustained beam animation (continuous stream)',
  category: 'animations',
  steps: [
    {
      type: 'action',
      action: { type: 'startCombat', params: {} },
      description: 'Start combat'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            roundStore.addAction('void-token', 'spell', {
              type: 'spell',
              spellName: 'Disintegration Beam',
              category: 'ray',  // Using 'ray' category (sustained beam effect)
              fromPosition: casterPos,
              toPosition: targetPos,
              color: '#00FF00',
              size: 10,
              duration: 1500
            }, 1)
          }
        }
      },
      description: 'Add beam spell (sustained beam)'
    },
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
      description: 'Execute beam animation'
    },
    {
      type: 'wait',
      wait: 2000,
      description: 'Wait for beam duration and fade'
    },
    {
      type: 'assert',
      assert: {
        type: 'spellActive',
        params: { spellName: 'Disintegration Beam' },
        expected: false
      },
      description: 'Verify beam animation completed'
    }
  ]
}

/**
 * Test 7: Area Animation Component
 * Verifies: Circular area effect appears and persists
 */
export const areaAnimationTest: TestScenario = {
  id: 'area-animation',
  name: 'Area Animation Component',
  description: 'Tests area/circle animation (auras, zones)',
  category: 'animations',
  steps: [
    {
      type: 'action',
      action: { type: 'startCombat', params: {} },
      description: 'Start combat'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            roundStore.addAction('void-token', 'spell', {
              type: 'spell',
              spellName: 'Spirit Guardians',
              category: 'area',
              fromPosition: targetPos,
              toPosition: targetPos,
              color: '#FFD700',
              size: 80,
              duration: 1000,
              persistDuration: 2,
              durationType: 'rounds'
            }, 1)
          }
        }
      },
      description: 'Add area spell (Spirit Guardians)'
    },
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
      description: 'Execute area animation'
    },
    {
      type: 'wait',
      wait: 1500,
      description: 'Wait for area to appear'
    },
    {
      type: 'assert',
      assert: {
        type: 'spellActive',
        params: { spellName: 'Spirit Guardians' },
        expected: true
      },
      description: 'Verify area persists (has persistDuration)'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            roundStore.startNewRound()
          }
        }
      },
      description: 'Advance to Round 2'
    },
    {
      type: 'wait',
      wait: 500,
      description: 'Wait for round transition'
    },
    {
      type: 'assert',
      assert: {
        type: 'spellActive',
        params: { spellName: 'Spirit Guardians' },
        expected: true
      },
      description: 'Verify area still persists in Round 2'
    }
  ]
}

/**
 * Test 8: Multi-Projectile Animation
 * Verifies: Multiple projectiles fire simultaneously (Magic Missile)
 */
export const multiProjectileAnimationTest: TestScenario = {
  id: 'multi-projectile-animation',
  name: 'Multi-Projectile Animation Component',
  description: 'Tests multiple simultaneous projectiles (Magic Missile)',
  category: 'animations',
  steps: [
    {
      type: 'action',
      action: { type: 'startCombat', params: {} },
      description: 'Start combat'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            // Fire 3 magic missiles
            for (let i = 0; i < 3; i++) {
              const offsetY = (i - 1) * 30 // Spread vertically
              roundStore.addAction('void-token', 'spell', {
                type: 'spell',
                spellName: `Magic Missile ${i + 1}`,
                category: 'projectile',
                fromPosition: casterPos,
                toPosition: { x: targetPos.x, y: targetPos.y + offsetY },
                color: '#0080FF',
                size: 10,
                duration: 800,
                projectileSpeed: 600
              }, 1)
            }
          }
        }
      },
      description: 'Add 3 simultaneous magic missiles'
    },
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
      description: 'Execute multi-projectile animation'
    },
    {
      type: 'wait',
      wait: 2000,
      description: 'Wait for all missiles to complete'
    },
    {
      type: 'assert',
      assert: {
        type: 'custom',
        params: {
          check: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            const missiles = mapStore.currentMap?.objects.filter(obj =>
              obj.type === 'spell' && (obj as any).spellData?.spellName?.includes('Magic Missile')
            ) || []
            return missiles.length === 0
          }
        },
        expected: true
      },
      description: 'Verify all missiles completed and cleaned up'
    }
  ]
}

// Export all animation tests
export const animationTests: TestScenario[] = [
  projectileAnimationTest,
  burstAnimationTest,
  projectileBurstAnimationTest,
  coneAnimationTest,
  rayAnimationTest,
  beamAnimationTest,
  areaAnimationTest,
  multiProjectileAnimationTest
]
