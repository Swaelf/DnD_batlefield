import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useRoundStore from '../roundStore'
import { RoundEvent } from '@/types'

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
    useRoundStore.setState({
      timeline: null,
      currentRound: 1,
      isInCombat: false,
      animationSpeed: 1
    })
    vi.clearAllMocks()
  })

  describe('Combat Management', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useRoundStore())

      expect(result.current.timeline).toBeNull()
      expect(result.current.currentRound).toBe(1)
      expect(result.current.isInCombat).toBe(false)
      expect(result.current.animationSpeed).toBe(1)
    })

    it('should start combat with new timeline', () => {
      const { result } = renderHook(() => useRoundStore())

      act(() => {
        result.current.startCombat('map-123')
      })

      expect(result.current.isInCombat).toBe(true)
      expect(result.current.currentRound).toBe(1)
      expect(result.current.timeline).toBeDefined()
      expect(result.current.timeline?.mapId).toBe('map-123')
      expect(result.current.timeline?.isActive).toBe(true)
      expect(result.current.timeline?.rounds).toHaveLength(1)
      expect(result.current.timeline?.rounds[0].number).toBe(1)
    })

    it('should reactivate existing timeline when starting combat', () => {
      const { result } = renderHook(() => useRoundStore())

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

    it('should end combat and move rounds to history', () => {
      const { result } = renderHook(() => useRoundStore())

      // Start combat and add some rounds
      act(() => {
        result.current.startCombat('map-123')
        result.current.nextRound()
      })

      const roundsBeforeEnd = result.current.timeline?.rounds.length

      act(() => {
        result.current.endCombat()
      })

      expect(result.current.isInCombat).toBe(false)
      expect(result.current.timeline?.isActive).toBe(false)
      expect(result.current.timeline?.rounds).toHaveLength(0)
      expect(result.current.timeline?.history).toHaveLength(roundsBeforeEnd || 0)
    })
  })

  describe('Round Navigation', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useRoundStore())
      act(() => {
        result.current.startCombat('test-map')
      })
    })

    it('should advance to next round and create new round', async () => {
      const { result } = renderHook(() => useRoundStore())

      await act(async () => {
        await result.current.nextRound()
      })

      expect(result.current.currentRound).toBe(2)
      expect(result.current.timeline?.currentRound).toBe(2)
      expect(result.current.timeline?.rounds).toHaveLength(2)

      const round2 = result.current.timeline?.rounds.find(r => r.number === 2)
      expect(round2).toBeDefined()
      expect(round2?.events).toEqual([])
    })

    it('should not advance round if not in combat', async () => {
      const { result } = renderHook(() => useRoundStore())

      act(() => {
        result.current.endCombat()
      })

      const currentRoundBefore = result.current.currentRound

      await act(async () => {
        await result.current.nextRound()
      })

      expect(result.current.currentRound).toBe(currentRoundBefore)
    })

    it('should go to previous round', () => {
      const { result } = renderHook(() => useRoundStore())

      // Go to round 3 first
      act(() => {
        result.current.goToRound(3)
      })

      expect(result.current.currentRound).toBe(3)

      // Go back one round
      act(() => {
        result.current.previousRound()
      })

      expect(result.current.currentRound).toBe(2)
      expect(result.current.timeline?.currentRound).toBe(2)
    })

    it('should not go below round 1', () => {
      const { result } = renderHook(() => useRoundStore())

      act(() => {
        result.current.previousRound()
      })

      expect(result.current.currentRound).toBe(1)
    })

    it('should jump to specific round and create if needed', () => {
      const { result } = renderHook(() => useRoundStore())

      act(() => {
        result.current.goToRound(5)
      })

      expect(result.current.currentRound).toBe(5)
      expect(result.current.timeline?.currentRound).toBe(5)

      const round5 = result.current.timeline?.rounds.find(r => r.number === 5)
      expect(round5).toBeDefined()
      expect(round5?.number).toBe(5)
    })

    it('should maintain round order when jumping around', () => {
      const { result } = renderHook(() => useRoundStore())

      act(() => {
        result.current.goToRound(3)
        result.current.goToRound(1)
        result.current.goToRound(5)
      })

      const rounds = result.current.timeline?.rounds || []
      const roundNumbers = rounds.map(r => r.number).sort((a, b) => a - b)
      expect(roundNumbers).toEqual([1, 3, 5])
    })
  })

  describe('Event Management', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useRoundStore())
      act(() => {
        result.current.startCombat('test-map')
      })
    })

    it('should add event to current round', () => {
      const { result } = renderHook(() => useRoundStore())

      const eventData = {
        type: 'move' as const,
        fromPosition: { x: 100, y: 100 },
        toPosition: { x: 200, y: 200 },
        duration: 1000
      }

      act(() => {
        result.current.addEvent('token-1', 'move', eventData)
      })

      const round1 = result.current.timeline?.rounds.find(r => r.number === 1)
      expect(round1?.events).toHaveLength(1)
      expect(round1?.events[0].tokenId).toBe('token-1')
      expect(round1?.events[0].type).toBe('move')
      expect(round1?.events[0].data).toEqual(eventData)
      expect(round1?.events[0].executed).toBe(false)
    })

    it('should add event to specific round', () => {
      const { result } = renderHook(() => useRoundStore())

      const eventData = {
        type: 'spell' as const,
        spellName: 'Fireball',
        category: 'projectile-burst' as const,
        fromPosition: { x: 100, y: 100 },
        toPosition: { x: 200, y: 200 }
      }

      act(() => {
        result.current.addEvent('token-2', 'spell', eventData, 3)
      })

      const round3 = result.current.timeline?.rounds.find(r => r.number === 3)
      expect(round3).toBeDefined()
      expect(round3?.events).toHaveLength(1)
      expect(round3?.events[0].roundNumber).toBe(3)
    })

    it('should create round when adding event to non-existent round', () => {
      const { result } = renderHook(() => useRoundStore())

      const eventData = { type: 'move' as const }

      act(() => {
        result.current.addEvent('token-1', 'move', eventData, 10)
      })

      const round10 = result.current.timeline?.rounds.find(r => r.number === 10)
      expect(round10).toBeDefined()
      expect(round10?.events).toHaveLength(1)

      // Rounds should be sorted
      const rounds = result.current.timeline?.rounds || []
      const roundNumbers = rounds.map(r => r.number)
      expect(roundNumbers).toEqual([1, 10])
    })

    it('should assign proper order to events', () => {
      const { result } = renderHook(() => useRoundStore())

      act(() => {
        result.current.addEvent('token-1', 'move', { type: 'move' })
        result.current.addEvent('token-2', 'spell', { type: 'spell' })
        result.current.addEvent('token-3', 'move', { type: 'move' })
      })

      const round1 = result.current.timeline?.rounds.find(r => r.number === 1)
      expect(round1?.events[0].order).toBe(0)
      expect(round1?.events[1].order).toBe(1)
      expect(round1?.events[2].order).toBe(2)
    })

    it('should update existing event', () => {
      const { result } = renderHook(() => useRoundStore())

      // Add event first
      act(() => {
        result.current.addEvent('token-1', 'move', { type: 'move', duration: 1000 })
      })

      const eventId = result.current.timeline?.rounds[0].events[0].id
      expect(eventId).toBeDefined()

      // Update the event
      act(() => {
        result.current.updateEvent(eventId!, { executed: true })
      })

      const updatedEvent = result.current.timeline?.rounds[0].events[0]
      expect(updatedEvent?.executed).toBe(true)
    })

    it('should remove event', () => {
      const { result } = renderHook(() => useRoundStore())

      // Add multiple events
      act(() => {
        result.current.addEvent('token-1', 'move', { type: 'move' })
        result.current.addEvent('token-2', 'spell', { type: 'spell' })
      })

      const eventId = result.current.timeline?.rounds[0].events[0].id
      expect(result.current.timeline?.rounds[0].events).toHaveLength(2)

      // Remove first event
      act(() => {
        result.current.removeEvent(eventId!)
      })

      expect(result.current.timeline?.rounds[0].events).toHaveLength(1)
      expect(result.current.timeline?.rounds[0].events[0].tokenId).toBe('token-2')
    })

    it('should not crash when updating non-existent event', () => {
      const { result } = renderHook(() => useRoundStore())

      expect(() => {
        act(() => {
          result.current.updateEvent('non-existent-id', { executed: true })
        })
      }).not.toThrow()
    })

    it('should not crash when removing non-existent event', () => {
      const { result } = renderHook(() => useRoundStore())

      expect(() => {
        act(() => {
          result.current.removeEvent('non-existent-id')
        })
      }).not.toThrow()
    })
  })

  describe('Event Execution', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useRoundStore())
      act(() => {
        result.current.startCombat('test-map')
      })
    })

    it('should execute round events and mark as executed', async () => {
      const { result } = renderHook(() => useRoundStore())

      // Add events to round 1
      act(() => {
        result.current.addEvent('token-1', 'move', { type: 'move', duration: 100 })
        result.current.addEvent('token-2', 'spell', { type: 'spell', duration: 200 })
      })

      await act(async () => {
        await result.current.executeRoundEvents(1)
      })

      const round1 = result.current.timeline?.rounds.find(r => r.number === 1)
      expect(round1?.executed).toBe(true)
      expect(round1?.events[0].executed).toBe(true)
      expect(round1?.events[1].executed).toBe(true)
    })

    it('should not execute already executed round', async () => {
      const { result } = renderHook(() => useRoundStore())

      // Add and execute round
      act(() => {
        result.current.addEvent('token-1', 'move', { type: 'move' })
      })

      await act(async () => {
        await result.current.executeRoundEvents(1)
      })

      // Try to execute again
      const result2 = await act(async () => {
        return await result.current.executeRoundEvents(1)
      })

      expect(result2).toBeUndefined() // Should return early
    })

    it('should handle round with no events', async () => {
      const { result } = renderHook(() => useRoundStore())

      // Execute empty round
      await act(async () => {
        await result.current.executeRoundEvents(1)
      })

      const round1 = result.current.timeline?.rounds.find(r => r.number === 1)
      expect(round1?.executed).toBe(true)
      expect(round1?.events).toHaveLength(0)
    })

    it('should respect animation speed in execution timing', async () => {
      const { result } = renderHook(() => useRoundStore())

      // Set faster animation speed
      act(() => {
        result.current.setAnimationSpeed(2)
      })

      act(() => {
        result.current.addEvent('token-1', 'move', { type: 'move', duration: 1000 })
      })

      const startTime = Date.now()
      await act(async () => {
        await result.current.executeRoundEvents(1)
      })
      const endTime = Date.now()

      // With speed 2, 1000ms should take ~500ms
      const actualDuration = endTime - startTime
      expect(actualDuration).toBeLessThan(800) // Some buffer for test execution
    })
  })

  describe('Animation Speed', () => {
    it('should set animation speed within valid range', () => {
      const { result } = renderHook(() => useRoundStore())

      act(() => {
        result.current.setAnimationSpeed(2.5)
      })

      expect(result.current.animationSpeed).toBe(2.5)
    })

    it('should clamp animation speed to minimum', () => {
      const { result } = renderHook(() => useRoundStore())

      act(() => {
        result.current.setAnimationSpeed(0.05)
      })

      expect(result.current.animationSpeed).toBe(0.1)
    })

    it('should clamp animation speed to maximum', () => {
      const { result } = renderHook(() => useRoundStore())

      act(() => {
        result.current.setAnimationSpeed(10)
      })

      expect(result.current.animationSpeed).toBe(5)
    })
  })

  describe('Timeline Management', () => {
    it('should clear timeline and reset state', () => {
      const { result } = renderHook(() => useRoundStore())

      // Set up some state
      act(() => {
        result.current.startCombat('test-map')
        result.current.nextRound()
        result.current.addEvent('token-1', 'move', { type: 'move' })
      })

      expect(result.current.timeline).toBeDefined()
      expect(result.current.currentRound).toBe(2)
      expect(result.current.isInCombat).toBe(true)

      // Clear timeline
      act(() => {
        result.current.clearTimeline()
      })

      expect(result.current.timeline).toBeNull()
      expect(result.current.currentRound).toBe(1)
      expect(result.current.isInCombat).toBe(false)
    })

    it('should handle preview event without crashing', () => {
      const { result } = renderHook(() => useRoundStore())

      // Mock console.log to verify it's called
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const testEvent = {
        id: 'test',
        roundNumber: 1,
        tokenId: 'token-1',
        type: 'move' as const,
        data: { type: 'move' as const },
        executed: false,
        order: 0
      }

      expect(() => {
        act(() => {
          result.current.previewEvent(testEvent)
        })
      }).not.toThrow()

      expect(consoleSpy).toHaveBeenCalledWith('Previewing event:', testEvent)
      consoleSpy.mockRestore()
    })
  })

  describe('Error Handling', () => {
    it('should handle operations with null timeline gracefully', () => {
      const { result } = renderHook(() => useRoundStore())

      // Timeline is null initially
      expect(() => {
        act(() => {
          result.current.addEvent('token-1', 'move', { type: 'move' })
        })
      }).not.toThrow()

      expect(() => {
        act(() => {
          result.current.updateEvent('some-id', { executed: true })
        })
      }).not.toThrow()

      expect(() => {
        act(() => {
          result.current.removeEvent('some-id')
        })
      }).not.toThrow()
    })

    it('should handle executing events with null timeline', async () => {
      const { result } = renderHook(() => useRoundStore())

      const result2 = await act(async () => {
        return await result.current.executeRoundEvents(1)
      })

      expect(result2).toBeUndefined()
    })
  })

  describe('State Immutability', () => {
    it('should maintain immutability when updating timeline', () => {
      const { result } = renderHook(() => useRoundStore())

      act(() => {
        result.current.startCombat('test-map')
      })

      const originalTimeline = result.current.timeline

      act(() => {
        result.current.addEvent('token-1', 'move', { type: 'move' })
      })

      const newTimeline = result.current.timeline

      // Reference should be different due to Immer
      expect(newTimeline).not.toBe(originalTimeline)
      expect(newTimeline?.rounds).toBeDefined()
    })
  })
})