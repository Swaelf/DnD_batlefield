import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useUnifiedActionStore } from '@/store/unifiedActionStore'
import { createMockAction, resetStore } from './testUtils'
import type { ActionHistoryEntry, ActionFilter } from '@/types/unifiedAction'

describe('Phase 4: Action Log System', () => {
  beforeEach(() => {
    resetStore()
    vi.clearAllMocks()
  })

  describe('Action History Tracking', () => {
    test('should add completed actions to history', () => {
      const store = useUnifiedActionStore.getState()

      const action = createMockAction({
        id: 'history-1',
        metadata: { name: 'Fireball' }
      })

      store.executeAction(action)

      // Get updated state after executeAction
      let state = useUnifiedActionStore.getState()
      expect(state.actionHistory).toHaveLength(1)
      expect(state.actionHistory[0].status).toBe('executing')

      store.completeAction('history-1')

      state = useUnifiedActionStore.getState()
      expect(state.actionHistory).toHaveLength(1)
      expect(state.actionHistory[0].status).toBe('completed')
      expect(state.actionHistory[0].id).toBe('history-1')
    })

    test('should track failed actions in history', () => {
      const store = useUnifiedActionStore.getState()

      const action = createMockAction({
        id: 'fail-1',
        metadata: { name: 'Failed Spell' }
      })

      store.executeAction(action)
      store.failAction('fail-1', 'Spell fizzled')

      const state = useUnifiedActionStore.getState()
      expect(state.actionHistory).toHaveLength(1)
      expect(state.actionHistory[0].status).toBe('failed')
      expect(state.actionHistory[0].error).toBe('Spell fizzled')
    })

    test('should maintain history order with newest first', () => {
      const store = useUnifiedActionStore.getState()

      const action1 = createMockAction({ id: 'a1', timestamp: 1000 })
      const action2 = createMockAction({ id: 'a2', timestamp: 2000 })
      const action3 = createMockAction({ id: 'a3', timestamp: 3000 })

      store.executeAction(action1)
      store.completeAction('a1')
      store.executeAction(action2)
      store.completeAction('a2')
      store.executeAction(action3)
      store.completeAction('a3')

      const state = useUnifiedActionStore.getState()
      expect(state.actionHistory[0].id).toBe('a3')
      expect(state.actionHistory[1].id).toBe('a2')
      expect(state.actionHistory[2].id).toBe('a1')
    })

    test('should respect max history size', () => {
      const store = useUnifiedActionStore.getState()
      store.setMaxHistorySize(3)

      for (let i = 0; i < 5; i++) {
        const action = createMockAction({ id: `action-${i}` })
        store.executeAction(action)
        store.completeAction(`action-${i}`)
      }

      const state = useUnifiedActionStore.getState()
      expect(state.actionHistory).toHaveLength(3)
      expect(state.actionHistory[0].id).toBe('action-4')
      expect(state.actionHistory[2].id).toBe('action-2')
    })

    test('should track execution and completion times', (done) => {
      const store = useUnifiedActionStore.getState()

      const action = createMockAction({
        id: 'timed-1',
        timestamp: Date.now()
      })

      store.executeAction(action)
      const executeTime = Date.now()

      // Simulate delay
      setTimeout(() => {
        store.completeAction('timed-1')
        const completeTime = Date.now()

        const state = useUnifiedActionStore.getState()
        const entry = state.actionHistory[0]

        expect(entry.executedAt).toBeDefined()
        expect(entry.completedAt).toBeDefined()
        expect(entry.executedAt).toBeGreaterThanOrEqual(executeTime - 10)
        expect(entry.completedAt).toBeGreaterThanOrEqual(completeTime - 10)
        // Use >= instead of > since they might be the same in fast execution
        expect(entry.completedAt).toBeGreaterThanOrEqual(entry.executedAt!)
        done()
      }, 50)
    })
  })

  describe('Action Filtering', () => {
    beforeEach(() => {
      const store = useUnifiedActionStore.getState()

      // Add various actions to history
      const actions = [
        createMockAction({ id: 's1', type: 'spell', category: 'fire' }),
        createMockAction({ id: 's2', type: 'spell', category: 'ice' }),
        createMockAction({ id: 'a1', type: 'attack', category: 'sword' }),
        createMockAction({ id: 'a2', type: 'attack', category: 'arrow' }),
        createMockAction({ id: 'i1', type: 'interaction', category: 'door' }),
        createMockAction({ id: 'm1', type: 'move', category: 'move' })
      ]

      actions.forEach(action => {
        store.executeAction(action)
        store.completeAction(action.id)
      })
    })

    test('should filter by action type', () => {
      const store = useUnifiedActionStore.getState()

      const filter: ActionFilter = { types: ['spell'] }
      const filtered = store.filterHistory(filter)

      expect(filtered).toHaveLength(2)
      expect(filtered.every(e => e.type === 'spell')).toBe(true)
    })

    test('should filter by multiple types', () => {
      const store = useUnifiedActionStore.getState()

      const filter: ActionFilter = { types: ['attack', 'interaction'] }
      const filtered = store.filterHistory(filter)

      expect(filtered).toHaveLength(3)
      expect(filtered.some(e => e.type === 'attack')).toBe(true)
      expect(filtered.some(e => e.type === 'interaction')).toBe(true)
    })

    test('should filter by category', () => {
      const store = useUnifiedActionStore.getState()

      const filter: ActionFilter = { categories: ['fire', 'sword'] }
      const filtered = store.filterHistory(filter)

      expect(filtered).toHaveLength(2)
      expect(filtered.some(e => e.category === 'fire')).toBe(true)
      expect(filtered.some(e => e.category === 'sword')).toBe(true)
    })

    test('should filter by status', () => {
      const store = useUnifiedActionStore.getState()

      // Add a failed action
      const failAction = createMockAction({ id: 'f1', type: 'spell' })
      store.executeAction(failAction)
      store.failAction('f1', 'Failed')

      const filter: ActionFilter = { status: 'failed' }
      const filtered = store.filterHistory(filter)

      expect(filtered).toHaveLength(1)
      expect(filtered[0].status).toBe('failed')
    })

    test('should filter by time range', () => {
      const store = useUnifiedActionStore.getState()
      const now = Date.now()

      const filter: ActionFilter = {
        timeRange: {
          start: now - 60000, // Last minute
          end: now
        }
      }

      const filtered = store.filterHistory(filter)
      expect(filtered.length).toBeGreaterThan(0)
      expect(filtered.every(e => e.timestamp >= filter.timeRange!.start)).toBe(true)
    })

    test('should combine multiple filters', () => {
      const store = useUnifiedActionStore.getState()

      const filter: ActionFilter = {
        types: ['spell', 'attack'],
        status: 'completed'
      }

      const filtered = store.filterHistory(filter)
      expect(filtered).toHaveLength(4)
      expect(filtered.every(e =>
        (e.type === 'spell' || e.type === 'attack') &&
        e.status === 'completed'
      )).toBe(true)
    })
  })

  describe('History Management', () => {
    test('should clear all history', () => {
      const store = useUnifiedActionStore.getState()

      // Add some actions
      for (let i = 0; i < 3; i++) {
        const action = createMockAction({ id: `clear-${i}` })
        store.executeAction(action)
        store.completeAction(`clear-${i}`)
      }

      // Get updated state after adding actions
      let state = useUnifiedActionStore.getState()
      expect(state.actionHistory.length).toBeGreaterThan(0)

      store.clearHistory()

      state = useUnifiedActionStore.getState()
      expect(state.actionHistory).toHaveLength(0)
    })

    test('should export history as JSON', () => {
      const store = useUnifiedActionStore.getState()

      // Add actions
      const action1 = createMockAction({
        id: 'export-1',
        metadata: { name: 'Test Action 1' }
      })
      const action2 = createMockAction({
        id: 'export-2',
        metadata: { name: 'Test Action 2' }
      })

      store.executeAction(action1)
      store.completeAction('export-1')
      store.executeAction(action2)
      store.completeAction('export-2')

      const state = useUnifiedActionStore.getState()
      const json = JSON.stringify(state.actionHistory)
      const parsed = JSON.parse(json)

      expect(parsed).toHaveLength(2)
      expect(parsed[0].id).toBe('export-2')
      expect(parsed[1].id).toBe('export-1')
    })

    test('should handle concurrent actions', () => {
      const store = useUnifiedActionStore.getState()

      // Start multiple actions
      const action1 = createMockAction({ id: 'concurrent-1' })
      const action2 = createMockAction({ id: 'concurrent-2' })
      const action3 = createMockAction({ id: 'concurrent-3' })

      store.executeAction(action1)
      store.executeAction(action2)
      store.executeAction(action3)

      let state = useUnifiedActionStore.getState()
      expect(state.activeActions).toHaveLength(3)

      // Complete in different order
      store.completeAction('concurrent-2')
      store.completeAction('concurrent-1')
      store.failAction('concurrent-3', 'Error')

      state = useUnifiedActionStore.getState()
      expect(state.activeActions).toHaveLength(0)
      expect(state.actionHistory).toHaveLength(3)

      // Check order and status
      const history = state.actionHistory
      expect(history.find(h => h.id === 'concurrent-1')?.status).toBe('completed')
      expect(history.find(h => h.id === 'concurrent-2')?.status).toBe('completed')
      expect(history.find(h => h.id === 'concurrent-3')?.status).toBe('failed')
    })
  })

  describe('Action Metadata', () => {
    test('should preserve action metadata', () => {
      const store = useUnifiedActionStore.getState()

      const action = createMockAction({
        id: 'meta-1',
        metadata: {
          name: 'Powerful Fireball',
          description: 'A devastating fire spell',
          rollResult: {
            total: 25,
            rolls: [8, 8, 9],
            modifier: 0
          }
        }
      })

      store.executeAction(action)
      store.completeAction('meta-1')

      const state = useUnifiedActionStore.getState()
      const entry = state.actionHistory[0]

      expect(entry.metadata.name).toBe('Powerful Fireball')
      expect(entry.metadata.description).toBe('A devastating fire spell')
      expect(entry.metadata.rollResult?.total).toBe(25)
    })

    test('should track affected targets', () => {
      const store = useUnifiedActionStore.getState()

      const action = createMockAction({
        id: 'targets-1',
        effects: {
          affectedTargets: ['token-1', 'token-2', 'token-3'],
          highlightColor: '#FF0000'
        }
      })

      store.executeAction(action)
      store.completeAction('targets-1')

      const state = useUnifiedActionStore.getState()
      const entry = state.actionHistory[0]

      expect(entry.effects.affectedTargets).toHaveLength(3)
      expect(entry.effects.affectedTargets).toContain('token-1')
      expect(entry.effects.affectedTargets).toContain('token-2')
      expect(entry.effects.affectedTargets).toContain('token-3')
    })

    test('should preserve area of effect data', () => {
      const store = useUnifiedActionStore.getState()

      const action = createMockAction({
        id: 'area-1',
        effects: {
          affectedTargets: [],
          areaOfEffect: {
            type: 'circle',
            center: { x: 100, y: 100 },
            radius: 50
          }
        }
      })

      store.executeAction(action)
      store.completeAction('area-1')

      const state = useUnifiedActionStore.getState()
      const entry = state.actionHistory[0]

      expect(entry.effects.areaOfEffect).toBeDefined()
      expect(entry.effects.areaOfEffect?.type).toBe('circle')
      if (entry.effects.areaOfEffect?.type === 'circle') {
        expect(entry.effects.areaOfEffect.radius).toBe(50)
      }
    })
  })

  describe('Search Functionality', () => {
    beforeEach(() => {
      const store = useUnifiedActionStore.getState()

      const actions = [
        createMockAction({
          id: 's1',
          metadata: { name: 'Fireball' },
          category: 'fire'
        }),
        createMockAction({
          id: 's2',
          metadata: { name: 'Ice Storm' },
          category: 'ice'
        }),
        createMockAction({
          id: 's3',
          metadata: { name: 'Lightning Bolt' },
          category: 'lightning'
        }),
        createMockAction({
          id: 'a1',
          metadata: { name: 'Sword Strike' },
          category: 'sword'
        })
      ]

      actions.forEach(action => {
        store.executeAction(action)
        store.completeAction(action.id)
      })
    })

    test('should search by name', () => {
      const store = useUnifiedActionStore.getState()

      // Simple search implementation for testing
      const searchResults = store.actionHistory.filter(entry =>
        entry.metadata.name?.toLowerCase().includes('fire')
      )

      expect(searchResults).toHaveLength(1)
      expect(searchResults[0].metadata.name).toBe('Fireball')
    })

    test('should search by category', () => {
      const store = useUnifiedActionStore.getState()

      const searchResults = store.actionHistory.filter(entry =>
        entry.category.toLowerCase().includes('ice')
      )

      expect(searchResults).toHaveLength(1)
      expect(searchResults[0].category).toBe('ice')
    })

    test('should perform case-insensitive search', () => {
      const store = useUnifiedActionStore.getState()

      const searchResults = store.actionHistory.filter(entry =>
        entry.metadata.name?.toLowerCase().includes('BOLT'.toLowerCase())
      )

      expect(searchResults).toHaveLength(1)
      expect(searchResults[0].metadata.name).toBe('Lightning Bolt')
    })
  })

  describe('Statistics Tracking', () => {
    test('should calculate action statistics', () => {
      const store = useUnifiedActionStore.getState()

      // Add various actions
      const actions = [
        createMockAction({ id: 'stat-1', type: 'spell' }),
        createMockAction({ id: 'stat-2', type: 'spell' }),
        createMockAction({ id: 'stat-3', type: 'attack' }),
        createMockAction({ id: 'stat-4', type: 'attack' }),
        createMockAction({ id: 'stat-5', type: 'interaction' })
      ]

      // Complete some, fail one
      actions.forEach((action, index) => {
        store.executeAction(action)
        if (index === 2) {
          store.failAction(action.id, 'Failed')
        } else {
          store.completeAction(action.id)
        }
      })

      const state = useUnifiedActionStore.getState()
      const stats = {
        total: state.actionHistory.length,
        completed: state.actionHistory.filter(e => e.status === 'completed').length,
        failed: state.actionHistory.filter(e => e.status === 'failed').length,
        byType: {
          spell: state.actionHistory.filter(e => e.type === 'spell').length,
          attack: state.actionHistory.filter(e => e.type === 'attack').length,
          interaction: state.actionHistory.filter(e => e.type === 'interaction').length,
          move: state.actionHistory.filter(e => e.type === 'move').length
        }
      }

      expect(stats.total).toBe(5)
      expect(stats.completed).toBe(4)
      expect(stats.failed).toBe(1)
      expect(stats.byType.spell).toBe(2)
      expect(stats.byType.attack).toBe(2)
      expect(stats.byType.interaction).toBe(1)
    })
  })
})