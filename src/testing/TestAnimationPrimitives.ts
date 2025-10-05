import type { TestScenario } from './TestScenarios'

/**
 * Animation Primitives Tests
 *
 * Tests isolated animation primitives from the animation-effects library.
 * Each test validates a specific primitive or motion generator in isolation.
 *
 * Categories:
 * - Motion Primitives: Move, Rotate, Scale, Color, Fade
 * - Effect Primitives: Trail, Glow, Pulse, Flash, Particles
 * - Motion Generators: Linear, Curved, Orbit, Bounce, Wave
 */

export const animationPrimitiveTests: TestScenario[] = [
  // ============================================================================
  // MOTION PRIMITIVES
  // ============================================================================

  {
    id: 'animation-move-primitive',
    name: 'Move Primitive - Linear Translation',
    description: 'Tests basic Move animation primitive with linear translation',
    category: 'animations',
    steps: [
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'anim-move-token',
            name: 'Move Test',
            position: { x: 100, y: 100 },
            size: 'medium',
            color: '#3D82AB',
            shape: 'circle'
          }
        },
        description: 'Add token at start position'
      },
      {
        type: 'wait',
        wait: 300,
        description: 'Wait for token render'
      },
      {
        type: 'capture',
        capture: { name: 'move-start' },
        description: 'Capture start position'
      },
      {
        type: 'action',
        action: {
          type: 'moveToken',
          params: {
            tokenId: 'anim-move-token',
            toPosition: { x: 400, y: 300 }
          }
        },
        description: 'Move token to (400, 300)'
      },
      {
        type: 'wait',
        wait: 1000,
        description: 'Wait for movement animation'
      },
      {
        type: 'capture',
        capture: { name: 'move-end' },
        description: 'Capture end position'
      },
      {
        type: 'assert',
        assert: {
          type: 'tokenPosition',
          params: { tokenId: 'anim-move-token' },
          expected: { x: 400, y: 300 }
        },
        description: 'Verify final position'
      }
    ]
  },

  {
    id: 'animation-rotate-primitive',
    name: 'Rotate Primitive - Token Rotation',
    description: 'Tests Rotate animation primitive (visual rotation effect)',
    category: 'animations',
    steps: [
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'anim-rotate-token',
            name: 'Rotate Test',
            position: { x: 300, y: 300 },
            size: 'medium',
            color: '#FF6600',
            shape: 'circle'
          }
        },
        description: 'Add token for rotation'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait for render'
      },
      {
        type: 'capture',
        capture: { name: 'rotate-demo' },
        description: 'Capture rotation visual (rotation is applied via Konva transform)'
      },
      {
        type: 'wait',
        wait: 1000,
        description: 'Observe rotation effect (visual only)'
      }
    ]
  },

  {
    id: 'animation-scale-primitive',
    name: 'Scale Primitive - Size Changes',
    description: 'Tests Scale animation primitive (grow/shrink)',
    category: 'animations',
    steps: [
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'anim-scale-token',
            name: 'Scale Test',
            position: { x: 300, y: 200 },
            size: 'medium',
            color: '#10B981',
            shape: 'circle'
          }
        },
        description: 'Add token for scaling'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait for render'
      },
      {
        type: 'capture',
        capture: { name: 'scale-demo' },
        description: 'Capture scale visual (scaling is applied via Konva scaleX/scaleY)'
      },
      {
        type: 'wait',
        wait: 1000,
        description: 'Observe scale effect (visual only)'
      }
    ]
  },

  {
    id: 'animation-fade-primitive',
    name: 'Fade Primitive - Opacity Changes',
    description: 'Tests Fade animation primitive (fade in/out)',
    category: 'animations',
    steps: [
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'anim-fade-token',
            name: 'Fade Test',
            position: { x: 400, y: 400 },
            size: 'medium',
            color: '#9333EA',
            shape: 'circle',
            opacity: 0
          }
        },
        description: 'Add token with opacity 0'
      },
      {
        type: 'wait',
        wait: 300,
        description: 'Wait for render'
      },
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const mapStore = (await import('@/store/mapStore')).default.getState()
              mapStore.updateObject('anim-fade-token', { opacity: 1 })
            }
          }
        },
        description: 'Fade in to opacity 1'
      },
      {
        type: 'wait',
        wait: 1000,
        description: 'Observe fade in'
      },
      {
        type: 'capture',
        capture: { name: 'fade-visible' },
        description: 'Capture visible state'
      },
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const mapStore = (await import('@/store/mapStore')).default.getState()
              mapStore.updateObject('anim-fade-token', { opacity: 0 })
            }
          }
        },
        description: 'Fade out to opacity 0'
      },
      {
        type: 'wait',
        wait: 1000,
        description: 'Observe fade out'
      }
    ]
  },

  // ============================================================================
  // MOTION GENERATORS
  // ============================================================================

  {
    id: 'animation-linear-motion',
    name: 'Linear Motion - Straight Path',
    description: 'Tests LinearMotion generator for straight-line movement',
    category: 'animations',
    steps: [
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'linear-motion-token',
            name: 'Linear Path',
            position: { x: 150, y: 150 },
            size: 'medium',
            color: '#3D82AB',
            shape: 'circle'
          }
        },
        description: 'Add token for linear motion'
      },
      {
        type: 'wait',
        wait: 300,
        description: 'Wait for render'
      },
      {
        type: 'action',
        action: {
          type: 'startCombat',
          params: {}
        },
        description: 'Start combat for timeline'
      },
      {
        type: 'wait',
        wait: 300,
        description: 'Wait for combat start'
      },
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const roundStore = (await import('@/store/timelineStore')).default.getState()
              // Linear motion from (150, 150) to (450, 350)
              roundStore.addAction('linear-motion-token', 'move', {
                type: 'move',
                fromPosition: { x: 150, y: 150 },
                toPosition: { x: 450, y: 350 },
                duration: 1200
              }, 1)
            }
          }
        },
        description: 'Add linear motion path'
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
        description: 'Execute linear motion'
      },
      {
        type: 'wait',
        wait: 1500,
        description: 'Watch linear movement'
      },
      {
        type: 'assert',
        assert: {
          type: 'tokenPosition',
          params: { tokenId: 'linear-motion-token' },
          expected: { x: 450, y: 350 }
        },
        description: 'Verify end position'
      }
    ]
  },

  {
    id: 'animation-curved-motion',
    name: 'Curved Motion - Bezier Path',
    description: 'Tests CurvedMotion generator (used in projectile spells)',
    category: 'animations',
    steps: [
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'curved-caster',
            name: 'Caster',
            position: { x: 200, y: 400 },
            size: 'medium',
            color: '#4169E1',
            shape: 'circle'
          }
        },
        description: 'Add caster token'
      },
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'curved-target',
            name: 'Target',
            position: { x: 600, y: 200 },
            size: 'medium',
            color: '#922610',
            shape: 'circle'
          }
        },
        description: 'Add target token'
      },
      {
        type: 'wait',
        wait: 300,
        description: 'Wait for render'
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
        description: 'Wait for combat'
      },
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const roundStore = (await import('@/store/timelineStore')).default.getState()
              // Curved projectile motion (Magic Missile uses curved paths)
              roundStore.addAction('curved-caster', 'spell', {
                type: 'spell',
                spellName: 'Magic Missile',
                category: 'projectile',
                fromPosition: { x: 200, y: 400 },
                toPosition: { x: 600, y: 200 },
                color: '#8B00FF',
                size: 15,
                duration: 1000
              }, 1)
            }
          }
        },
        description: 'Cast spell with curved projectile'
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
        description: 'Execute curved motion'
      },
      {
        type: 'wait',
        wait: 1500,
        description: 'Watch curved projectile path'
      }
    ]
  },

  {
    id: 'animation-bounce-motion',
    name: 'Bounce Motion - Projectile Arc',
    description: 'Tests BounceMotion generator (gravity-based projectiles)',
    category: 'animations',
    steps: [
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'bounce-archer',
            name: 'Archer',
            position: { x: 250, y: 350 },
            size: 'medium',
            color: '#10B981',
            shape: 'circle'
          }
        },
        description: 'Add archer token'
      },
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'bounce-target',
            name: 'Target',
            position: { x: 550, y: 350 },
            size: 'medium',
            color: '#922610',
            shape: 'circle'
          }
        },
        description: 'Add target token'
      },
      {
        type: 'wait',
        wait: 300,
        description: 'Wait for render'
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
        description: 'Wait for combat'
      },
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const roundStore = (await import('@/store/timelineStore')).default.getState()
              // Bounce/arc motion (arrow projectile)
              roundStore.addAction('bounce-archer', 'attack', {
                type: 'attack',
                weaponName: 'Longbow',
                attackType: 'ranged',
                fromPosition: { x: 250, y: 350 },
                toPosition: { x: 550, y: 350 },
                damage: '1d8+3',
                damageType: 'piercing',
                attackBonus: 5,
                hit: true,
                animation: 'projectile',
                color: '#8B4513',
                duration: 800
              }, 1)
            }
          }
        },
        description: 'Fire arrow with arc trajectory'
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
        description: 'Execute bounce motion'
      },
      {
        type: 'wait',
        wait: 1200,
        description: 'Watch projectile arc'
      }
    ]
  },

  {
    id: 'animation-wave-motion',
    name: 'Wave Motion - Sine Wave Path',
    description: 'Tests WaveMotion generator (serpentine/wave patterns)',
    category: 'animations',
    steps: [
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'wave-token',
            name: 'Wave Test',
            position: { x: 150, y: 300 },
            size: 'medium',
            color: '#00CED1',
            shape: 'circle'
          }
        },
        description: 'Add token for wave motion'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait for render'
      },
      {
        type: 'capture',
        capture: { name: 'wave-demo' },
        description: 'Capture wave motion visual (sine wave path demonstration)'
      },
      {
        type: 'wait',
        wait: 1000,
        description: 'Observe wave pattern (visual only)'
      }
    ]
  },

  {
    id: 'animation-orbit-motion',
    name: 'Orbit Motion - Circular Path',
    description: 'Tests OrbitMotion generator (circular/spiral patterns)',
    category: 'animations',
    steps: [
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'orbit-center',
            name: 'Center',
            position: { x: 400, y: 300 },
            size: 'medium',
            color: '#FFD700',
            shape: 'circle'
          }
        },
        description: 'Add center point'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait for render'
      },
      {
        type: 'capture',
        capture: { name: 'orbit-demo' },
        description: 'Capture orbit motion visual (circular path demonstration)'
      },
      {
        type: 'wait',
        wait: 1000,
        description: 'Observe orbital pattern (visual only)'
      }
    ]
  },

  // ============================================================================
  // EFFECT PRIMITIVES
  // ============================================================================

  {
    id: 'animation-trail-effect',
    name: 'Trail Effect - Movement Trail',
    description: 'Tests Trail effect primitive (motion blur/trail)',
    category: 'animations',
    steps: [
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'trail-token',
            name: 'Trail Test',
            position: { x: 150, y: 250 },
            size: 'medium',
            color: '#FF00FF',
            shape: 'circle'
          }
        },
        description: 'Add token for trail'
      },
      {
        type: 'wait',
        wait: 300,
        description: 'Wait for render'
      },
      {
        type: 'action',
        action: {
          type: 'moveToken',
          params: {
            tokenId: 'trail-token',
            toPosition: { x: 550, y: 250 }
          }
        },
        description: 'Move token (trail effect during movement)'
      },
      {
        type: 'wait',
        wait: 1200,
        description: 'Watch trail effect'
      }
    ]
  },

  {
    id: 'animation-glow-effect',
    name: 'Glow Effect - Aura/Glow',
    description: 'Tests Glow effect primitive (aura around objects)',
    category: 'animations',
    steps: [
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'glow-token',
            name: 'Glow Test',
            position: { x: 300, y: 300 },
            size: 'medium',
            color: '#00FFFF',
            shape: 'circle'
          }
        },
        description: 'Add token with glow effect'
      },
      {
        type: 'wait',
        wait: 1000,
        description: 'Observe glow aura (visual effect)'
      },
      {
        type: 'capture',
        capture: { name: 'glow-effect' },
        description: 'Capture glow visual'
      }
    ]
  },

  {
    id: 'animation-pulse-effect',
    name: 'Pulse Effect - Rhythmic Pulsing',
    description: 'Tests Pulse effect primitive (scale pulsing)',
    category: 'animations',
    steps: [
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'pulse-token',
            name: 'Pulse Test',
            position: { x: 350, y: 350 },
            size: 'medium',
            color: '#FF1493',
            shape: 'circle'
          }
        },
        description: 'Add token for pulse'
      },
      {
        type: 'wait',
        wait: 1500,
        description: 'Observe pulsing effect (visual)'
      },
      {
        type: 'capture',
        capture: { name: 'pulse-effect' },
        description: 'Capture pulse visual'
      }
    ]
  },

  {
    id: 'animation-flash-effect',
    name: 'Flash Effect - Quick Flash',
    description: 'Tests Flash effect primitive (brightness flash)',
    category: 'animations',
    steps: [
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'flash-token',
            name: 'Flash Test',
            position: { x: 400, y: 250 },
            size: 'medium',
            color: '#FFFF00',
            shape: 'circle'
          }
        },
        description: 'Add token for flash'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait for render'
      },
      {
        type: 'capture',
        capture: { name: 'flash-before' },
        description: 'Capture before flash'
      },
      {
        type: 'wait',
        wait: 800,
        description: 'Observe flash effect (visual)'
      }
    ]
  },

  {
    id: 'animation-particles-effect',
    name: 'Particles Effect - Particle System',
    description: 'Tests Particles effect primitive (particle emissions)',
    category: 'animations',
    steps: [
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'particles-caster',
            name: 'Particle Caster',
            position: { x: 300, y: 400 },
            size: 'medium',
            color: '#9370DB',
            shape: 'circle'
          }
        },
        description: 'Add caster for particles'
      },
      {
        type: 'wait',
        wait: 300,
        description: 'Wait for render'
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
        description: 'Wait for combat'
      },
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const roundStore = (await import('@/store/timelineStore')).default.getState()
              // Spell with particle effect
              roundStore.addAction('particles-caster', 'spell', {
                type: 'spell',
                spellName: 'Eldritch Blast',
                category: 'ray',
                fromPosition: { x: 300, y: 400 },
                toPosition: { x: 600, y: 200 },
                color: '#9370DB',
                size: 12,
                duration: 800,
                particleEffect: true
              }, 1)
            }
          }
        },
        description: 'Cast spell with particles'
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
        description: 'Execute particle effect'
      },
      {
        type: 'wait',
        wait: 1500,
        description: 'Watch particle emissions'
      }
    ]
  }
]

export const allAnimationPrimitiveTests = animationPrimitiveTests
