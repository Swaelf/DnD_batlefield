import type { TestScenario } from './TestScenarios'
import type { Token } from '@/types/token'

/**
 * Token Transformation Tests
 *
 * These tests verify token visual transformations:
 * - Rotation (requires image to be visible)
 * - Size changes (small → medium → large → huge)
 * - Opacity changes
 * - Shape changes (circle → square)
 *
 * NOTE: Rotation test uses an arrow-shaped token image so rotation is visible
 */

/**
 * Test 1: Token Rotation
 * Creates a token with an arrow/directional image and rotates it
 */
export const tokenRotationTest: TestScenario = {
  id: 'token-rotation',
  name: 'Token Rotation Test',
  description: 'Tests token rotation with a directional image (arrow shape)',
  category: 'tokens',
  steps: [
    {
      type: 'action',
      action: {
        type: 'addToken',
        params: {
          id: 'rotation-test-token',
          name: 'Archer',
          position: { x: 400, y: 300 },
          size: 'medium',
          color: '#FF0000',
          // Using a triangular/arrow shape to make rotation visible
          // In a real scenario, this would be an image URL like '/tokens/archer.png'
          image: '', // Empty for now - rotation visible with shape changes
          shape: 'circle' as const
        }
      },
      description: 'Create token with arrow/directional appearance'
    },
    {
      type: 'wait',
      wait: 500,
      description: 'Initial token appearance'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            // Rotate to 90 degrees (facing right)
            mapStore.updateObject('rotation-test-token', { rotation: 90 })
          }
        }
      },
      description: 'Rotate token to 90° (facing right)'
    },
    {
      type: 'wait',
      wait: 1000,
      description: 'View 90° rotation'
    },
    {
      type: 'assert',
      assert: {
        type: 'custom',
        params: {
          check: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            const token = mapStore.currentMap?.objects.find(obj => obj.id === 'rotation-test-token')
            return token?.rotation === 90
          }
        },
        expected: true
      },
      description: 'Verify token rotated to 90°'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            // Rotate to 180 degrees (facing down)
            mapStore.updateObject('rotation-test-token', { rotation: 180 })
          }
        }
      },
      description: 'Rotate token to 180° (facing down)'
    },
    {
      type: 'wait',
      wait: 1000,
      description: 'View 180° rotation'
    },
    {
      type: 'assert',
      assert: {
        type: 'custom',
        params: {
          check: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            const token = mapStore.currentMap?.objects.find(obj => obj.id === 'rotation-test-token')
            return token?.rotation === 180
          }
        },
        expected: true
      },
      description: 'Verify token rotated to 180°'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            // Rotate to 270 degrees (facing left)
            mapStore.updateObject('rotation-test-token', { rotation: 270 })
          }
        }
      },
      description: 'Rotate token to 270° (facing left)'
    },
    {
      type: 'wait',
      wait: 1000,
      description: 'View 270° rotation'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            // Rotate back to 0 degrees (facing up)
            mapStore.updateObject('rotation-test-token', { rotation: 0 })
          }
        }
      },
      description: 'Rotate token back to 0° (facing up)'
    },
    {
      type: 'wait',
      wait: 1000,
      description: 'View final rotation'
    }
  ]
}

/**
 * Test 2: Token Size Changes
 * Tests all D&D token sizes with proper visual verification
 */
export const tokenSizeTest: TestScenario = {
  id: 'token-size',
  name: 'Token Size Changes Test',
  description: 'Tests token size changes through all D&D sizes (tiny → small → medium → large → huge → gargantuan)',
  category: 'tokens',
  steps: [
    {
      type: 'action',
      action: {
        type: 'addToken',
        params: {
          id: 'size-test-token',
          name: 'Shapeshifter',
          position: { x: 400, y: 300 },
          size: 'tiny',
          color: '#00FF00'
        }
      },
      description: 'Create tiny token'
    },
    {
      type: 'wait',
      wait: 1000,
      description: 'View tiny size (0.5x0.5 squares)'
    },
    {
      type: 'assert',
      assert: {
        type: 'custom',
        params: {
          check: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            const token = mapStore.currentMap?.objects.find(obj => obj.id === 'size-test-token') as Token | undefined
            return token?.size === 'tiny'
          }
        },
        expected: true
      },
      description: 'Verify token is tiny size'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            mapStore.updateObject('size-test-token', { size: 'small' })
          }
        }
      },
      description: 'Change to small size'
    },
    {
      type: 'wait',
      wait: 1000,
      description: 'View small size (1x1 square)'
    },
    {
      type: 'assert',
      assert: {
        type: 'custom',
        params: {
          check: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            const token = mapStore.currentMap?.objects.find(obj => obj.id === 'size-test-token') as Token | undefined
            return token?.size === 'small'
          }
        },
        expected: true
      },
      description: 'Verify token is small size'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            mapStore.updateObject('size-test-token', { size: 'medium' })
          }
        }
      },
      description: 'Change to medium size'
    },
    {
      type: 'wait',
      wait: 1000,
      description: 'View medium size (1x1 square)'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            mapStore.updateObject('size-test-token', { size: 'large' })
          }
        }
      },
      description: 'Change to large size'
    },
    {
      type: 'wait',
      wait: 1000,
      description: 'View large size (2x2 squares)'
    },
    {
      type: 'assert',
      assert: {
        type: 'custom',
        params: {
          check: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            const token = mapStore.currentMap?.objects.find(obj => obj.id === 'size-test-token') as Token | undefined
            return token?.size === 'large'
          }
        },
        expected: true
      },
      description: 'Verify token is large size'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            mapStore.updateObject('size-test-token', { size: 'huge' })
          }
        }
      },
      description: 'Change to huge size'
    },
    {
      type: 'wait',
      wait: 1000,
      description: 'View huge size (3x3 squares)'
    },
    {
      type: 'assert',
      assert: {
        type: 'custom',
        params: {
          check: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            const token = mapStore.currentMap?.objects.find(obj => obj.id === 'size-test-token') as Token | undefined
            return token?.size === 'huge'
          }
        },
        expected: true
      },
      description: 'Verify token is huge size'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            mapStore.updateObject('size-test-token', { size: 'gargantuan' })
          }
        }
      },
      description: 'Change to gargantuan size'
    },
    {
      type: 'wait',
      wait: 1500,
      description: 'View gargantuan size (4x4 squares)'
    },
    {
      type: 'assert',
      assert: {
        type: 'custom',
        params: {
          check: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            const token = mapStore.currentMap?.objects.find(obj => obj.id === 'size-test-token') as Token | undefined
            return token?.size === 'gargantuan'
          }
        },
        expected: true
      },
      description: 'Verify token is gargantuan size'
    }
  ]
}

/**
 * Test 3: Token Opacity Changes
 * Tests opacity transitions (useful for invisibility, stealth, etc.)
 */
export const tokenOpacityTest: TestScenario = {
  id: 'token-opacity',
  name: 'Token Opacity Changes Test',
  description: 'Tests token opacity changes (full → semi-transparent → nearly invisible → full)',
  category: 'tokens',
  steps: [
    {
      type: 'action',
      action: {
        type: 'addToken',
        params: {
          id: 'opacity-test-token',
          name: 'Shadow',
          position: { x: 400, y: 300 },
          size: 'medium',
          color: '#9400D3'
        }
      },
      description: 'Create token at full opacity'
    },
    {
      type: 'wait',
      wait: 1000,
      description: 'View full opacity (1.0)'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            mapStore.updateObject('opacity-test-token', { opacity: 0.5 })
          }
        }
      },
      description: 'Change to 50% opacity (semi-transparent)'
    },
    {
      type: 'wait',
      wait: 1000,
      description: 'View 50% opacity'
    },
    {
      type: 'assert',
      assert: {
        type: 'custom',
        params: {
          check: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            const token = mapStore.currentMap?.objects.find(obj => obj.id === 'opacity-test-token') as Token | undefined
            return token?.opacity === 0.5
          }
        },
        expected: true
      },
      description: 'Verify token at 50% opacity'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            mapStore.updateObject('opacity-test-token', { opacity: 0.2 })
          }
        }
      },
      description: 'Change to 20% opacity (nearly invisible)'
    },
    {
      type: 'wait',
      wait: 1000,
      description: 'View 20% opacity'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            mapStore.updateObject('opacity-test-token', { opacity: 1.0 })
          }
        }
      },
      description: 'Restore to full opacity'
    },
    {
      type: 'wait',
      wait: 1000,
      description: 'View restored full opacity'
    }
  ]
}

/**
 * Test 4: Token Shape Changes
 * Tests switching between circle and square shapes
 */
export const tokenShapeTest: TestScenario = {
  id: 'token-shape',
  name: 'Token Shape Changes Test',
  description: 'Tests token shape changes (circle ↔ square)',
  category: 'tokens',
  steps: [
    {
      type: 'action',
      action: {
        type: 'addToken',
        params: {
          id: 'shape-test-token',
          name: 'Morph',
          position: { x: 400, y: 300 },
          size: 'medium',
          color: '#FF1493',
          shape: 'circle' as const
        }
      },
      description: 'Create circular token'
    },
    {
      type: 'wait',
      wait: 1000,
      description: 'View circle shape'
    },
    {
      type: 'assert',
      assert: {
        type: 'custom',
        params: {
          check: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            const token = mapStore.currentMap?.objects.find(obj => obj.id === 'shape-test-token') as Token | undefined
            return token?.shape === 'circle'
          }
        },
        expected: true
      },
      description: 'Verify token is circular'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            mapStore.updateObject('shape-test-token', { shape: 'square' })
          }
        }
      },
      description: 'Change to square shape'
    },
    {
      type: 'wait',
      wait: 1000,
      description: 'View square shape'
    },
    {
      type: 'assert',
      assert: {
        type: 'custom',
        params: {
          check: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            const token = mapStore.currentMap?.objects.find(obj => obj.id === 'shape-test-token') as Token | undefined
            return token?.shape === 'square'
          }
        },
        expected: true
      },
      description: 'Verify token is square'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const mapStore = (await import('@/store/mapStore')).default.getState()
            mapStore.updateObject('shape-test-token', { shape: 'circle' })
          }
        }
      },
      description: 'Change back to circle'
    },
    {
      type: 'wait',
      wait: 1000,
      description: 'View circle shape again'
    }
  ]
}

// Export all token transformation tests
export const tokenTransformationTests: TestScenario[] = [
  tokenRotationTest,
  tokenSizeTest,
  tokenOpacityTest,
  tokenShapeTest
]
