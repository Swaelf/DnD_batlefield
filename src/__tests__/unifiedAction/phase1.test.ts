import { describe, test, expect, beforeEach } from 'vitest'
import type { UnifiedAction, CircularArea, SquareArea } from '@/types/unifiedAction'
import { useUnifiedActionStore } from '@/store/unifiedActionStore'
import {
  createMockAction,
  createMockToken,
  resetStore
} from './testUtils'

describe('Phase 1: Core Infrastructure', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('UnifiedAction Types', () => {
    test('should create valid UnifiedAction object', () => {
      const action = createMockAction()

      expect(action).toHaveProperty('id')
      expect(action).toHaveProperty('type')
      expect(action).toHaveProperty('category')
      expect(action).toHaveProperty('source')
      expect(action).toHaveProperty('target')
      expect(action).toHaveProperty('animation')
      expect(action).toHaveProperty('effects')
      expect(action).toHaveProperty('metadata')
      expect(action).toHaveProperty('timestamp')
      expect(action).toHaveProperty('duration')
    })

    test('should validate action type constraints', () => {
      const validTypes: UnifiedAction['type'][] = ['spell', 'attack', 'interaction', 'move']

      validTypes.forEach(type => {
        const action = createMockAction({ type })
        expect(action.type).toBe(type)
      })
    })

    test('should handle source as Position or tokenId', () => {
      const positionAction = createMockAction({ source: { x: 10, y: 20 } })
      expect(positionAction.source).toEqual({ x: 10, y: 20 })

      const tokenAction = createMockAction({ source: 'token-123' })
      expect(tokenAction.source).toBe('token-123')
    })

    test('should handle target as Position or array of tokenIds', () => {
      const positionTarget = createMockAction({ target: { x: 50, y: 60 } })
      expect(positionTarget.target).toEqual({ x: 50, y: 60 })

      const tokenTargets = createMockAction({ target: ['token-1', 'token-2', 'token-3'] })
      expect(tokenTargets.target).toEqual(['token-1', 'token-2', 'token-3'])
    })
  })

  describe('UnifiedActionStore', () => {
    test('should initialize with empty state', () => {
      const state = useUnifiedActionStore.getState()

      expect(state.activeActions).toEqual([])
      expect(state.actionHistory).toEqual([])
      expect(state.highlightedTargets).toEqual([])
      expect(state.maxHistorySize).toBe(100)
      expect(state.isExecuting).toBe(false)
    })

    test('should add action to activeActions', () => {
      const store = useUnifiedActionStore.getState()
      const action = createMockAction()

      store.executeAction(action)

      const state = useUnifiedActionStore.getState()
      expect(state.activeActions).toHaveLength(1)
      expect(state.activeActions[0]).toEqual(action)
      expect(state.isExecuting).toBe(true)
    })

    test('should move completed actions to history', () => {
      const store = useUnifiedActionStore.getState()
      const action = createMockAction()

      store.executeAction(action)
      store.completeAction(action.id)

      const state = useUnifiedActionStore.getState()
      expect(state.activeActions).toHaveLength(0)
      expect(state.actionHistory).toHaveLength(1)
      expect(state.actionHistory[0].status).toBe('completed')
      expect(state.isExecuting).toBe(false)
    })

    test('should limit history to maxSize', () => {
      const store = useUnifiedActionStore.getState()

      // First add more actions than we'll allow
      for (let i = 0; i < 10; i++) {
        const action = createMockAction({ id: `action-${i}` })
        store.addToHistory(action)
      }

      // Now set a smaller max size to trigger cleanup
      store.setMaxHistorySize(5)

      const state = useUnifiedActionStore.getState()
      expect(state.actionHistory).toHaveLength(5)
      // Most recent should be first (action-9 was the last one added)
      expect(state.actionHistory[0].id).toBe('action-9')
    })

    test('should clear highlights', () => {
      const store = useUnifiedActionStore.getState()
      store.highlightTargets(['token-1', 'token-2'], 'test-action', '#FF0000')

      let state = useUnifiedActionStore.getState()
      expect(state.highlightedTargets).toHaveLength(2)
      expect(state.highlightedTargets[0].tokenId).toBe('token-1')
      expect(state.highlightedTargets[1].tokenId).toBe('token-2')

      store.clearHighlights()
      state = useUnifiedActionStore.getState()
      expect(state.highlightedTargets).toEqual([])
    })

    test('should identify affected targets', () => {
      const store = useUnifiedActionStore.getState()

      // Create tokens
      const token1 = createMockToken({ x: 50, y: 50 }, { id: 'token-1' })
      const token2 = createMockToken({ x: 150, y: 150 }, { id: 'token-2' })
      const token3 = createMockToken({ x: 200, y: 200 }, { id: 'token-3' })

      // Create action with area effect
      const action = createMockAction({
        effects: {
          affectedTargets: ['token-1'],
          areaOfEffect: {
            type: 'circle',
            center: { x: 100, y: 100 },
            radius: 100
          } as CircularArea,
          highlightColor: '#FF0000'
        }
      })

      const affected = store.getAffectedTargets(action, [token1, token2, token3])

      // token-1 is explicitly affected
      // token-2 is in the circle area
      // token-3 is outside the area
      expect(affected).toContain('token-1')
      expect(affected).toContain('token-2')
      expect(affected).not.toContain('token-3')
    })
  })

  describe('Area Detection', () => {
    test('should detect tokens in circular area', () => {
      const store = useUnifiedActionStore.getState()

      const tokenInside = createMockToken({ x: 90, y: 90 })
      const tokenOutside = createMockToken({ x: 200, y: 200 })

      const area: CircularArea = {
        type: 'circle',
        center: { x: 100, y: 100 },
        radius: 50
      }

      expect(store.isTokenInArea(tokenInside, area)).toBe(true)
      expect(store.isTokenInArea(tokenOutside, area)).toBe(false)
    })

    test('should detect tokens in square area', () => {
      const store = useUnifiedActionStore.getState()

      const tokenInside = createMockToken({ x: 120, y: 120 })
      const tokenOutside = createMockToken({ x: 200, y: 200 })

      const area: SquareArea = {
        type: 'square',
        center: { x: 100, y: 100 },
        size: 60
      }

      expect(store.isTokenInArea(tokenInside, area)).toBe(true)
      expect(store.isTokenInArea(tokenOutside, area)).toBe(false)
    })
  })

  describe('Action Filtering', () => {
    beforeEach(() => {
      const store = useUnifiedActionStore.getState()

      // Add various actions to history
      store.addToHistory(createMockAction({
        id: 'spell-1',
        type: 'spell',
        category: 'projectile',
        metadata: { name: 'Fireball' }
      }))

      store.addToHistory(createMockAction({
        id: 'attack-1',
        type: 'attack',
        category: 'melee',
        metadata: { name: 'Sword Slash' }
      }))

      store.addToHistory(createMockAction({
        id: 'move-1',
        type: 'move',
        category: 'walk',
        metadata: { name: 'Move to Position' }
      }))
    })

    test('should filter by action type', () => {
      const store = useUnifiedActionStore.getState()

      const spellActions = store.filterHistory({ types: ['spell'] })
      expect(spellActions).toHaveLength(1)
      expect(spellActions[0].id).toBe('spell-1')

      const combatActions = store.filterHistory({ types: ['spell', 'attack'] })
      expect(combatActions).toHaveLength(2)
    })

    test('should filter by category', () => {
      const store = useUnifiedActionStore.getState()

      const projectileActions = store.filterHistory({ categories: ['projectile'] })
      expect(projectileActions).toHaveLength(1)
      expect(projectileActions[0].category).toBe('projectile')
    })

    test('should filter by search text', () => {
      const store = useUnifiedActionStore.getState()

      const fireballActions = store.filterHistory({ searchText: 'Fire' })
      expect(fireballActions).toHaveLength(1)
      expect(fireballActions[0].metadata.name).toBe('Fireball')

      const slashActions = store.filterHistory({ searchText: 'slash' })
      expect(slashActions).toHaveLength(1)
      expect(slashActions[0].metadata.name).toBe('Sword Slash')
    })
  })

  describe('Action Lifecycle', () => {
    test('should handle action failure', () => {
      const store = useUnifiedActionStore.getState()
      const action = createMockAction()

      store.executeAction(action)
      store.failAction(action.id, 'Test error')

      const state = useUnifiedActionStore.getState()
      expect(state.activeActions).toHaveLength(0)
      expect(state.actionHistory[0].status).toBe('failed')
      expect(state.actionHistory[0].error).toBe('Test error')
    })

    test('should handle multiple concurrent actions', () => {
      const store = useUnifiedActionStore.getState()

      const action1 = createMockAction({ id: 'action-1' })
      const action2 = createMockAction({ id: 'action-2' })
      const action3 = createMockAction({ id: 'action-3' })

      store.executeAction(action1)
      store.executeAction(action2)
      store.executeAction(action3)

      let state = useUnifiedActionStore.getState()
      expect(state.activeActions).toHaveLength(3)
      expect(state.isExecuting).toBe(true)

      // Complete actions out of order
      store.completeAction(action2.id)
      state = useUnifiedActionStore.getState()
      expect(state.activeActions).toHaveLength(2)
      expect(state.isExecuting).toBe(true)

      store.completeAction(action1.id)
      store.completeAction(action3.id)
      state = useUnifiedActionStore.getState()
      expect(state.activeActions).toHaveLength(0)
      expect(state.isExecuting).toBe(false)
    })
  })
})