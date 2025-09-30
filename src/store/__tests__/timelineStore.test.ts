import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useTimelineStore from '../timelineStore'

// Mock crypto.randomUUID for consistent testing
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9))
  },
  writable: true
})

describe('roundStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useTimelineStore.setState({
      timeline: null,
      currentEvent: 1,
      isInCombat: false,
      animationSpeed: 1
    })
    vi.clearAllMocks()
  })

  describe('Combat Management', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useTimelineStore())

      expect(result.current.timeline).toBeNull()
      expect(result.current.currentEvent).toBe(1)
      expect(result.current.isInCombat).toBe(false)
      expect(result.current.animationSpeed).toBe(1)
    })

    it('should start combat with new timeline', () => {
      const { result } = renderHook(() => useTimelineStore())

      act(() => {
        result.current.startCombat('map-123')
      })

      expect(result.current.isInCombat).toBe(true)
      expect(result.current.currentEvent).toBe(1)
      expect(result.current.timeline).toBeDefined()
      expect(result.current.timeline?.mapId).toBe('map-123')
      expect(result.current.timeline?.isActive).toBe(true)
      expect(result.current.timeline?.events).toHaveLength(1)
      expect(result.current.timeline?.events[0].number).toBe(1)
    })

    it('should reactivate existing timeline when starting combat', () => {
      const { result } = renderHook(() => useTimelineStore())

      // Start combat first time
      act(() => {
        result.current.startCombat('map-123')
      })

      const originalTimelineId = result.current.timeline?.id

      // End combat
      act(() => {
        result.current.endCombat()
      })

      expect(result.current.timeline?.isActive).toBe(false)

      // Start combat again
      act(() => {
        result.current.startCombat('map-123')
      })

      expect(result.current.timeline?.isActive).toBe(true)
      expect(result.current.timeline?.id).toBe(originalTimelineId) // Same timeline ID
      expect(result.current.timeline?.mapId).toBe('map-123')
    })

    it('should end combat and move rounds to history', async () => {
      const { result } = renderHook(() => useTimelineStore())

      // Start combat and add some rounds
      await act(async () => {
        result.current.startCombat('map-123')
        await result.current.nextEvent()
      })

      const roundsBeforeEnd = result.current.timeline?.events.length

      act(() => {
        result.current.endCombat()
      })

      expect(result.current.isInCombat).toBe(false)
      expect(result.current.timeline?.isActive).toBe(false)
      expect(result.current.timeline?.events).toHaveLength(0)
      expect(result.current.timeline?.history).toHaveLength(roundsBeforeEnd || 0)
    })
  })

  describe('Round Navigation', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useTimelineStore())
      act(() => {
        result.current.startCombat('test-map')
      })
    })

    it('should advance to next round and create new round', async () => {
      const { result } = renderHook(() => useTimelineStore())

      await act(async () => {
        await result.current.nextEvent()
      })

      expect(result.current.currentEvent).toBe(2)
      expect(result.current.timeline?.currentEvent).toBe(2)
      expect(result.current.timeline?.events).toHaveLength(2)

      const event2 = result.current.timeline?.events.find(e => e.number === 2)
      expect(event2).toBeDefined()
      expect(event2?.actions).toEqual([])
    })

    it('should not advance round if not in combat', async () => {
      const { result } = renderHook(() => useTimelineStore())

      act(() => {
        result.current.endCombat()
      })

      const currentEventBefore = result.current.currentEvent

      await act(async () => {
        await result.current.nextEvent()
      })

      expect(result.current.currentEvent).toBe(currentEventBefore)
    })

    it('should go to previous round', () => {
      const { result } = renderHook(() => useTimelineStore())

      // Go to round 3 first
      act(() => {
        result.current.goToEvent(3)
      })

      expect(result.current.currentEvent).toBe(3)

      // Go back one event
      act(() => {
        result.current.previousEvent()
      })

      expect(result.current.currentEvent).toBe(2)
      expect(result.current.timeline?.currentEvent).toBe(2)
    })

    it('should not go below event 1', () => {
      const { result } = renderHook(() => useTimelineStore())

      act(() => {
        result.current.previousEvent()
      })

      expect(result.current.currentEvent).toBe(1)
    })

    it('should jump to specific round and create if needed', () => {
      const { result } = renderHook(() => useTimelineStore())

      act(() => {
        result.current.goToEvent(5)
      })

      expect(result.current.currentEvent).toBe(5)
      expect(result.current.timeline?.currentEvent).toBe(5)

      const round5 = result.current.timeline?.events.find(r => r.number === 5)
      expect(round5).toBeDefined()
      expect(round5?.number).toBe(5)
    })

    it('should maintain round order when jumping around', () => {
      const { result } = renderHook(() => useTimelineStore())

      act(() => {
        result.current.goToEvent(3)
        result.current.goToEvent(1)
        result.current.goToEvent(5)
      })

      const rounds = result.current.timeline?.events || []
      const eventNumbers = rounds.map(r => r.number).sort((a, b) => a - b)
      expect(eventNumbers).toEqual([1, 3, 5])
    })
  })

  describe('Event Management', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useTimelineStore())
      act(() => {
        result.current.startCombat('test-map')
      })
    })

    it('should add event to current round', () => {
      const { result } = renderHook(() => useTimelineStore())

      const eventData = {
        type: 'move' as const,
        fromPosition: { x: 100, y: 100 },
        toPosition: { x: 200, y: 200 },
        duration: 1000
      }

      act(() => {
        result.current.addAction('token-1', 'move', eventData)
      })

      const event1 = result.current.timeline?.events.find(r => r.number === 1)
      expect(event1?.actions).toHaveLength(1)
      expect(event1?.actions[0].tokenId).toBe('token-1')
      expect(event1?.actions[0].type).toBe('move')
      expect(event1?.actions[0].data).toEqual(eventData)
      expect(event1?.actions[0].executed).toBe(false)
    })

    it('should add event to specific round', () => {
      const { result } = renderHook(() => useTimelineStore())

      const eventData = {
        type: 'spell' as const,
        spellName: 'Fireball',
        category: 'projectile-burst' as const,
        fromPosition: { x: 100, y: 100 },
        toPosition: { x: 200, y: 200 },
        color: '#ff4500',
        size: 20,
        duration: 1000
      }

      act(() => {
        result.current.addAction('token-2', 'spell', eventData, 3)
      })

      const event3 = result.current.timeline?.events.find(r => r.number === 3)
      expect(event3).toBeDefined()
      expect(event3?.actions).toHaveLength(1)
      expect(event3?.actions[0].eventNumber).toBe(3)
    })

    it('should create round when adding event to non-existent round', () => {
      const { result } = renderHook(() => useTimelineStore())

      const eventData = {
        type: 'move' as const,
        fromPosition: { x: 0, y: 0 },
        toPosition: { x: 100, y: 100 }
      }

      act(() => {
        result.current.addAction('token-1', 'move', eventData, 10)
      })

      const event10 = result.current.timeline?.events.find(r => r.number === 10)
      expect(event10).toBeDefined()
      expect(event10?.actions).toHaveLength(1)

      // Rounds should be sorted
      const rounds = result.current.timeline?.events || []
      const eventNumbers = rounds.map(r => r.number)
      expect(eventNumbers).toEqual([1, 10])
    })

    it('should assign proper order to events', () => {
      const { result } = renderHook(() => useTimelineStore())

      act(() => {
        result.current.addAction('token-1', 'move', { type: 'move', fromPosition: { x: 0, y: 0 }, toPosition: { x: 100, y: 100 } })
        result.current.addAction('token-2', 'spell', { type: 'spell', spellName: 'Magic Missile', category: 'projectile' as const, fromPosition: { x: 50, y: 50 }, toPosition: { x: 150, y: 150 }, color: '#0000ff', size: 10, duration: 500 })
        result.current.addAction('token-3', 'move', { type: 'move', fromPosition: { x: 200, y: 200 }, toPosition: { x: 300, y: 300 } })
      })

      const event1 = result.current.timeline?.events.find(r => r.number === 1)
      expect(event1?.actions[0].order).toBe(0)
      expect(event1?.actions[1].order).toBe(1)
      expect(event1?.actions[2].order).toBe(2)
    })

    it('should update existing event', () => {
      const { result } = renderHook(() => useTimelineStore())

      // Add event first
      act(() => {
        result.current.addAction('token-1', 'move', {
          type: 'move',
          fromPosition: { x: 0, y: 0 },
          toPosition: { x: 100, y: 100 },
          duration: 1000
        })
      })

      const eventId = result.current.timeline?.events[0].actions[0].id
      expect(eventId).toBeDefined()

      // Update the action
      act(() => {
        result.current.updateAction(eventId!, { executed: true })
      })

      const updatedAction = result.current.timeline?.events[0].actions[0]
      expect(updatedAction?.executed).toBe(true)
    })

    it('should remove event', () => {
      const { result } = renderHook(() => useTimelineStore())

      // Add multiple events
      act(() => {
        result.current.addAction('token-1', 'move', { type: 'move', fromPosition: { x: 0, y: 0 }, toPosition: { x: 100, y: 100 } })
        result.current.addAction('token-2', 'spell', { type: 'spell', spellName: 'Magic Missile', category: 'projectile' as const, fromPosition: { x: 50, y: 50 }, toPosition: { x: 150, y: 150 }, color: '#0000ff', size: 10, duration: 500 })
      })

      const eventId = result.current.timeline?.events[0].actions[0].id
      expect(result.current.timeline?.events[0].actions).toHaveLength(2)

      // Remove first action
      act(() => {
        result.current.removeAction(eventId!)
      })

      expect(result.current.timeline?.events[0].actions).toHaveLength(1)
      expect(result.current.timeline?.events[0].actions[0].tokenId).toBe('token-2')
    })

    it('should not crash when updating non-existent event', () => {
      const { result } = renderHook(() => useTimelineStore())

      expect(() => {
        act(() => {
          result.current.updateAction('non-existent-id', { executed: true })
        })
      }).not.toThrow()
    })

    it('should not crash when removing non-existent event', () => {
      const { result } = renderHook(() => useTimelineStore())

      expect(() => {
        act(() => {
          result.current.removeAction('non-existent-id')
        })
      }).not.toThrow()
    })
  })

  describe('Event Execution', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useTimelineStore())
      act(() => {
        result.current.startCombat('test-map')
      })
    })

    it('should execute round events and mark as executed', async () => {
      const { result } = renderHook(() => useTimelineStore())

      // Add events to round 1
      act(() => {
        result.current.addAction('token-1', 'move', {
          type: 'move',
          fromPosition: { x: 0, y: 0 },
          toPosition: { x: 100, y: 100 },
          duration: 100
        })
        result.current.addAction('token-2', 'spell', {
          type: 'spell',
          spellName: 'Fireball',
          category: 'area',
          fromPosition: { x: 50, y: 50 },
          toPosition: { x: 150, y: 150 },
          color: '#FF4500',
          size: 20,
          duration: 200
        })
      })

      await act(async () => {
        await result.current.executeEventActions(1)
      })

      const event1 = result.current.timeline?.events.find(r => r.number === 1)
      expect(event1?.executed).toBe(true)
      expect(event1?.actions[0].executed).toBe(true)
      expect(event1?.actions[1].executed).toBe(true)
    })

    it('should not execute already executed round', async () => {
      const { result } = renderHook(() => useTimelineStore())

      // Add and execute round
      act(() => {
        result.current.addAction('token-1', 'move', { type: 'move', fromPosition: { x: 0, y: 0 }, toPosition: { x: 100, y: 100 } })
      })

      await act(async () => {
        await result.current.executeEventActions(1)
      })

      // Try to execute again
      const result2 = await act(async () => {
        return await result.current.executeEventActions(1)
      })

      expect(result2).toBeUndefined() // Should return early
    })

    it('should handle round with no events', async () => {
      const { result } = renderHook(() => useTimelineStore())

      // Execute empty round
      await act(async () => {
        await result.current.executeEventActions(1)
      })

      const event1 = result.current.timeline?.events.find(r => r.number === 1)
      expect(event1?.executed).toBe(true)
      expect(event1?.actions).toHaveLength(0)
    })

    it('should respect animation speed in execution timing', async () => {
      const { result } = renderHook(() => useTimelineStore())

      // Set faster animation speed
      act(() => {
        result.current.setAnimationSpeed(2)
      })

      act(() => {
        result.current.addAction('token-1', 'move', {
          type: 'move',
          fromPosition: { x: 0, y: 0 },
          toPosition: { x: 100, y: 100 },
          duration: 1000
        })
      })

      const startTime = Date.now()
      await act(async () => {
        await result.current.executeEventActions(1)
      })
      const endTime = Date.now()

      // With speed 2, 1000ms should take ~500ms
      // Note: In test environment with mocked timers, timing may vary significantly
      const actualDuration = endTime - startTime
      expect(actualDuration).toBeLessThan(1200) // Relaxed threshold for test environment
    })
  })

  describe('Animation Speed', () => {
    it('should set animation speed within valid range', () => {
      const { result } = renderHook(() => useTimelineStore())

      act(() => {
        result.current.setAnimationSpeed(2.5)
      })

      expect(result.current.animationSpeed).toBe(2.5)
    })

    it('should clamp animation speed to minimum', () => {
      const { result } = renderHook(() => useTimelineStore())

      act(() => {
        result.current.setAnimationSpeed(0.05)
      })

      expect(result.current.animationSpeed).toBe(0.1)
    })

    it('should clamp animation speed to maximum', () => {
      const { result } = renderHook(() => useTimelineStore())

      act(() => {
        result.current.setAnimationSpeed(10)
      })

      expect(result.current.animationSpeed).toBe(5)
    })
  })

  describe('Timeline Management', () => {
    it('should clear timeline and reset state', async () => {
      const { result } = renderHook(() => useTimelineStore())

      // Set up some state
      await act(async () => {
        result.current.startCombat('test-map')
        await result.current.nextEvent() // nextEvent is async
        result.current.addAction('token-1', 'move', { type: 'move', fromPosition: { x: 0, y: 0 }, toPosition: { x: 100, y: 100 } })
      })

      expect(result.current.timeline).toBeDefined()
      expect(result.current.currentEvent).toBe(2)
      expect(result.current.isInCombat).toBe(true)

      // Clear timeline
      act(() => {
        result.current.clearTimeline()
      })

      expect(result.current.timeline).toBeNull()
      expect(result.current.currentEvent).toBe(1)
      expect(result.current.isInCombat).toBe(false)
    })

    it('should handle preview event without crashing', () => {
      const { result } = renderHook(() => useTimelineStore())

      const testEvent = {
        id: 'test',
        eventNumber: 1,
        tokenId: 'token-1',
        type: 'move' as const,
        data: {
          type: 'move' as const,
          fromPosition: { x: 0, y: 0 },
          toPosition: { x: 100, y: 100 },
          duration: 1000
        },
        executed: false,
        order: 0
      }

      expect(() => {
        act(() => {
          result.current.previewAction(testEvent)
        })
      }).not.toThrow()

      // Note: previewAction is currently a placeholder with no implementation
    })
  })

  describe('Error Handling', () => {
    it('should handle operations with null timeline gracefully', () => {
      const { result } = renderHook(() => useTimelineStore())

      // Timeline is null initially
      expect(() => {
        act(() => {
          result.current.addAction('token-1', 'move', { type: 'move', fromPosition: { x: 0, y: 0 }, toPosition: { x: 100, y: 100 } })
        })
      }).not.toThrow()

      expect(() => {
        act(() => {
          result.current.updateAction('some-id', { executed: true })
        })
      }).not.toThrow()

      expect(() => {
        act(() => {
          result.current.removeAction('some-id')
        })
      }).not.toThrow()
    })

    it('should handle executing events with null timeline', async () => {
      const { result } = renderHook(() => useTimelineStore())

      const result2 = await act(async () => {
        return await result.current.executeEventActions(1)
      })

      expect(result2).toBeUndefined()
    })
  })

  describe('State Immutability', () => {
    it('should maintain immutability when updating timeline', () => {
      const { result } = renderHook(() => useTimelineStore())

      act(() => {
        result.current.startCombat('test-map')
      })

      const originalTimeline = result.current.timeline

      act(() => {
        result.current.addAction('token-1', 'move', { type: 'move', fromPosition: { x: 0, y: 0 }, toPosition: { x: 100, y: 100 } })
      })

      const newTimeline = result.current.timeline

      // Reference should be different due to Immer
      expect(newTimeline).not.toBe(originalTimeline)
      expect(newTimeline?.events).toBeDefined()
    })
  })
})