import { describe, test, expect, beforeEach, vi } from 'vitest'
import { useUnifiedActionStore } from '@/store/unifiedActionStore'
import { createMockAction, resetStore } from './testUtils'

// Since animation components use Konva which requires a DOM environment,
// we'll focus on testing the animation logic and lifecycle

describe('Phase 2: Animation Modules', () => {
  beforeEach(() => {
    resetStore()
    vi.clearAllMocks()
  })

  describe('Animation Types', () => {
    test('should handle projectile animation type', () => {
      const action = createMockAction({
        animation: { type: 'projectile', duration: 1000, color: '#FF0000', size: 10 }
      })

      expect(action.animation.type).toBe('projectile')
      expect(action.animation.duration).toBe(1000)
      expect(action.animation.color).toBe('#FF0000')
    })

    test('should handle melee animation types', () => {
      const swingAction = createMockAction({
        animation: { type: 'melee_swing', duration: 600, color: '#FFFFFF' }
      })

      const slashAction = createMockAction({
        animation: { type: 'melee_slash', duration: 600, color: '#FFFFFF' }
      })

      expect(swingAction.animation.type).toBe('melee_swing')
      expect(slashAction.animation.type).toBe('melee_slash')
    })

    test('should handle ray animation type', () => {
      const action = createMockAction({
        animation: { type: 'ray', duration: 500, color: '#00FFFF' }
      })

      expect(action.animation.type).toBe('ray')
      expect(action.animation.duration).toBe(500)
    })

    test('should handle area animation type', () => {
      const action = createMockAction({
        animation: { type: 'area', duration: 1500, color: '#FF6600', size: 100 },
        effects: {
          affectedTargets: [],
          areaOfEffect: {
            type: 'circle',
            center: { x: 0, y: 0 },
            radius: 100
          },
          highlightColor: '#FF6600'
        }
      })

      expect(action.animation.type).toBe('area')
      expect(action.effects.areaOfEffect?.type).toBe('circle')
    })

    test('should handle burst animation type', () => {
      const action = createMockAction({
        animation: { type: 'burst', duration: 800, color: '#FFFF00' }
      })

      expect(action.animation.type).toBe('burst')
    })

    test('should handle interaction animation type', () => {
      const action = createMockAction({
        animation: { type: 'interaction', duration: 1000, color: '#FFD700' },
        category: 'door'
      })

      expect(action.animation.type).toBe('interaction')
      expect(action.category).toBe('door')
    })
  })

  describe('Animation Configuration', () => {
    test('should support easing functions', () => {
      const linearAction = createMockAction({
        animation: {
          type: 'projectile',
          duration: 1000,
          color: '#FF0000',
          easing: 'linear'
        }
      })

      const easeInAction = createMockAction({
        animation: {
          type: 'projectile',
          duration: 1000,
          color: '#FF0000',
          easing: 'easeIn'
        }
      })

      expect(linearAction.animation.easing).toBe('linear')
      expect(easeInAction.animation.easing).toBe('easeIn')
    })

    test('should support custom animation parameters', () => {
      const action = createMockAction({
        animation: {
          type: 'projectile',
          duration: 1000,
          color: '#FF0000',
          customParams: {
            trailLength: 5,
            pulseSpeed: 0.01,
            particleCount: 8
          }
        }
      })

      expect(action.animation.customParams).toBeDefined()
      expect(action.animation.customParams?.trailLength).toBe(5)
    })

    test('should support animation start delay', () => {
      const action = createMockAction({
        animation: {
          type: 'area',
          duration: 1500,
          color: '#FF6600',
          startDelay: 200
        }
      })

      expect(action.animation.startDelay).toBe(200)
    })
  })

  describe('Animation Lifecycle with Store', () => {
    test('should track active animations', () => {
      const store = useUnifiedActionStore.getState()

      const action = createMockAction({
        id: 'anim-1',
        animation: { type: 'projectile', duration: 100, color: '#FF0000' }
      })

      store.executeAction(action)

      const state = useUnifiedActionStore.getState()
      expect(state.activeActions).toHaveLength(1)
      expect(state.activeActions[0].id).toBe('anim-1')
    })

    test('should complete animations', () => {
      const store = useUnifiedActionStore.getState()

      const action = createMockAction({
        id: 'anim-2',
        animation: { type: 'burst', duration: 100, color: '#FFFF00' }
      })

      store.executeAction(action)
      store.completeAction('anim-2')

      const state = useUnifiedActionStore.getState()
      expect(state.activeActions).toHaveLength(0)
      expect(state.actionHistory[0].status).toBe('completed')
    })

    test('should handle multiple simultaneous animations', () => {
      const store = useUnifiedActionStore.getState()

      const actions = [
        createMockAction({ id: 'a1', animation: { type: 'projectile', duration: 100, color: '#FF0000' } }),
        createMockAction({ id: 'a2', animation: { type: 'melee_swing', duration: 100, color: '#FFFFFF' } }),
        createMockAction({ id: 'a3', animation: { type: 'ray', duration: 100, color: '#00FFFF' } })
      ]

      actions.forEach(action => store.executeAction(action))

      const state = useUnifiedActionStore.getState()
      expect(state.activeActions).toHaveLength(3)
      expect(state.isExecuting).toBe(true)

      // Complete them one by one
      store.completeAction('a1')
      expect(useUnifiedActionStore.getState().activeActions).toHaveLength(2)

      store.completeAction('a2')
      expect(useUnifiedActionStore.getState().activeActions).toHaveLength(1)

      store.completeAction('a3')
      const finalState = useUnifiedActionStore.getState()
      expect(finalState.activeActions).toHaveLength(0)
      expect(finalState.isExecuting).toBe(false)
    })

    test('should handle animation failure', () => {
      const store = useUnifiedActionStore.getState()

      const action = createMockAction({
        id: 'fail-1',
        animation: { type: 'area', duration: 100, color: '#FF0000' }
      })

      store.executeAction(action)
      store.failAction('fail-1', 'Animation error')

      const state = useUnifiedActionStore.getState()
      expect(state.activeActions).toHaveLength(0)
      expect(state.actionHistory[0].status).toBe('failed')
      expect(state.actionHistory[0].error).toBe('Animation error')
    })
  })

  describe('Category-Specific Animations', () => {
    test('should support spell categories', () => {
      const fireballAction = createMockAction({
        type: 'spell',
        category: 'fire',
        animation: { type: 'burst', duration: 800, color: '#FF4500' }
      })

      const iceShardAction = createMockAction({
        type: 'spell',
        category: 'ice',
        animation: { type: 'projectile', duration: 600, color: '#00BFFF' }
      })

      expect(fireballAction.category).toBe('fire')
      expect(iceShardAction.category).toBe('ice')
    })

    test('should support attack categories', () => {
      const arrowAction = createMockAction({
        type: 'attack',
        category: 'arrow',
        animation: { type: 'projectile', duration: 500, color: '#8B4513' }
      })

      const swordAction = createMockAction({
        type: 'attack',
        category: 'sword',
        animation: { type: 'melee_slash', duration: 400, color: '#C0C0C0' }
      })

      expect(arrowAction.category).toBe('arrow')
      expect(swordAction.category).toBe('sword')
    })

    test('should support interaction categories', () => {
      const doorAction = createMockAction({
        type: 'interaction',
        category: 'door',
        animation: { type: 'interaction', duration: 1000, color: '#8B4513' }
      })

      const leverAction = createMockAction({
        type: 'interaction',
        category: 'lever',
        animation: { type: 'interaction', duration: 800, color: '#FFD700' }
      })

      const trapAction = createMockAction({
        type: 'interaction',
        category: 'trap',
        animation: { type: 'interaction', duration: 600, color: '#DC143C' }
      })

      expect(doorAction.category).toBe('door')
      expect(leverAction.category).toBe('lever')
      expect(trapAction.category).toBe('trap')
    })
  })

  describe('Area Effect Animations', () => {
    test('should support circular areas', () => {
      const action = createMockAction({
        animation: { type: 'area', duration: 1500, color: '#FF6600' },
        effects: {
          affectedTargets: [],
          areaOfEffect: {
            type: 'circle',
            center: { x: 100, y: 100 },
            radius: 50
          },
          highlightColor: '#FF6600'
        }
      })

      expect(action.effects.areaOfEffect?.type).toBe('circle')
      if (action.effects.areaOfEffect?.type === 'circle') {
        expect(action.effects.areaOfEffect.radius).toBe(50)
      }
    })

    test('should support square areas', () => {
      const action = createMockAction({
        animation: { type: 'area', duration: 1500, color: '#00FF00' },
        effects: {
          affectedTargets: [],
          areaOfEffect: {
            type: 'square',
            center: { x: 50, y: 50 },
            size: 100
          },
          highlightColor: '#00FF00'
        }
      })

      expect(action.effects.areaOfEffect?.type).toBe('square')
      if (action.effects.areaOfEffect?.type === 'square') {
        expect(action.effects.areaOfEffect.size).toBe(100)
      }
    })

    test('should support cone areas', () => {
      const action = createMockAction({
        animation: { type: 'area', duration: 1000, color: '#FFA500' },
        effects: {
          affectedTargets: [],
          areaOfEffect: {
            type: 'cone',
            origin: { x: 0, y: 0 },
            direction: 45,
            angle: 60,
            range: 100
          },
          highlightColor: '#FFA500'
        }
      })

      expect(action.effects.areaOfEffect?.type).toBe('cone')
      if (action.effects.areaOfEffect?.type === 'cone') {
        expect(action.effects.areaOfEffect.angle).toBe(60)
        expect(action.effects.areaOfEffect.range).toBe(100)
      }
    })

    test('should support line areas', () => {
      const action = createMockAction({
        animation: { type: 'ray', duration: 500, color: '#00FFFF' },
        effects: {
          affectedTargets: [],
          areaOfEffect: {
            type: 'line',
            start: { x: 0, y: 0 },
            end: { x: 100, y: 100 },
            width: 10
          },
          highlightColor: '#00FFFF'
        }
      })

      expect(action.effects.areaOfEffect?.type).toBe('line')
      if (action.effects.areaOfEffect?.type === 'line') {
        expect(action.effects.areaOfEffect.width).toBe(10)
      }
    })
  })

  describe('Persistent Effects', () => {
    test('should support persist duration', () => {
      const action = createMockAction({
        animation: { type: 'area', duration: 1000, color: '#800080' },
        effects: {
          affectedTargets: [],
          persistDuration: 5000,
          highlightColor: '#800080'
        }
      })

      expect(action.effects.persistDuration).toBe(5000)
    })

    test('should support highlight duration', () => {
      const action = createMockAction({
        animation: { type: 'burst', duration: 500, color: '#FFD700' },
        effects: {
          affectedTargets: ['token-1', 'token-2'],
          highlightColor: '#FFD700',
          highlightDuration: 2000
        }
      })

      expect(action.effects.highlightDuration).toBe(2000)
      expect(action.effects.affectedTargets).toHaveLength(2)
    })
  })
})