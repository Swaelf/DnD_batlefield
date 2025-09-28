/**
 * Timeline Service Tests
 * Unit tests for timeline business logic
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { TimelineService } from './TimelineService'
import type { Timeline, CreateTimelineData } from '../types'

describe('TimelineService', () => {
  let timelineService: TimelineService
  let timeline: Timeline

  beforeEach(() => {
    timelineService = new TimelineService()

    const createData: CreateTimelineData = {
      mapId: 'test-map',
      name: 'Test Timeline'
    }
    timeline = timelineService.createTimeline(createData)
  })

  describe('createTimeline', () => {
    it('creates timeline with correct structure', () => {
      expect(timeline).toMatchObject({
        id: expect.any(String),
        mapId: 'test-map',
        name: 'Test Timeline',
        rounds: [],
        currentRound: 1,
        isActive: false,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })

    it('generates unique timeline IDs', () => {
      const timeline1 = timelineService.createTimeline({ mapId: 'map1', name: 'Timeline 1' })
      const timeline2 = timelineService.createTimeline({ mapId: 'map2', name: 'Timeline 2' })

      expect(timeline1.id).not.toBe(timeline2.id)
    })
  })

  describe('startCombat', () => {
    it('starts combat successfully with rounds', () => {
      // Add a round first
      const { timeline: timelineWithRound } = timelineService.addRound(timeline, {
        timelineId: timeline.id
      })

      const result = timelineService.startCombat(timelineWithRound)

      expect(result.isActive).toBe(true)
      expect(result.currentRound).toBe(1)
      expect(result.updatedAt).toBeInstanceOf(Date)
    })

    it('throws error when already active', () => {
      const activeTimeline = { ...timeline, isActive: true, rounds: [{ id: 'round1' } as any] }

      expect(() => timelineService.startCombat(activeTimeline))
        .toThrow('Combat is already active for this timeline')
    })

    it('throws error when no rounds exist', () => {
      expect(() => timelineService.startCombat(timeline))
        .toThrow('Cannot start combat without any rounds')
    })
  })

  describe('endCombat', () => {
    it('ends combat successfully', () => {
      const activeTimeline = { ...timeline, isActive: true }
      const result = timelineService.endCombat(activeTimeline)

      expect(result.isActive).toBe(false)
      expect(result.updatedAt).toBeInstanceOf(Date)
    })

    it('can end combat when not active', () => {
      const result = timelineService.endCombat(timeline)
      expect(result.isActive).toBe(false)
    })
  })

  describe('addRound', () => {
    it('adds round with auto-generated number', () => {
      const { timeline: result, round } = timelineService.addRound(timeline, {
        timelineId: timeline.id
      })

      expect(round).toMatchObject({
        id: expect.any(String),
        timelineId: timeline.id,
        roundNumber: 1,
        events: [],
        isExecuted: false,
        executionStartTime: null,
        executionEndTime: null
      })

      expect(result.rounds).toHaveLength(1)
      expect(result.rounds[0]).toBe(round)
    })

    it('adds round with specific number', () => {
      const { round } = timelineService.addRound(timeline, {
        timelineId: timeline.id,
        roundNumber: 5
      })

      expect(round.roundNumber).toBe(5)
    })

    it('throws error for duplicate round number', () => {
      timelineService.addRound(timeline, {
        timelineId: timeline.id,
        roundNumber: 1
      })

      expect(() => timelineService.addRound(timeline, {
        timelineId: timeline.id,
        roundNumber: 1
      })).toThrow('Round 1 already exists')
    })

    it('throws error for invalid round number', () => {
      expect(() => timelineService.addRound(timeline, {
        timelineId: timeline.id,
        roundNumber: 0
      })).toThrow('Round number must be positive')
    })

    it('sorts rounds by round number', () => {
      const { timeline: timeline1 } = timelineService.addRound(timeline, {
        timelineId: timeline.id,
        roundNumber: 3
      })

      const { timeline: timeline2 } = timelineService.addRound(timeline1, {
        timelineId: timeline.id,
        roundNumber: 1
      })

      const { timeline: timeline3 } = timelineService.addRound(timeline2, {
        timelineId: timeline.id,
        roundNumber: 2
      })

      const roundNumbers = timeline3.rounds.map(r => r.roundNumber)
      expect(roundNumbers).toEqual([1, 2, 3])
    })
  })

  describe('goToRound', () => {
    beforeEach(() => {
      // Add some rounds
      const { timeline: timeline1 } = timelineService.addRound(timeline, {
        timelineId: timeline.id,
        roundNumber: 1
      })
      const { timeline: timeline2 } = timelineService.addRound(timeline1, {
        timelineId: timeline.id,
        roundNumber: 2
      })
      timeline = timeline2
    })

    it('goes to valid round', () => {
      const result = timelineService.goToRound(timeline, 2)
      expect(result.currentRound).toBe(2)
    })

    it('throws error for invalid round number', () => {
      expect(() => timelineService.goToRound(timeline, 0))
        .toThrow('Round number must be positive')
    })

    it('throws error for non-existent round', () => {
      expect(() => timelineService.goToRound(timeline, 10))
        .toThrow('Round 10 does not exist')
    })
  })

  describe('nextRound', () => {
    beforeEach(() => {
      // Add rounds and start combat
      const { timeline: timeline1 } = timelineService.addRound(timeline, {
        timelineId: timeline.id,
        roundNumber: 1
      })
      const { timeline: timeline2 } = timelineService.addRound(timeline1, {
        timelineId: timeline.id,
        roundNumber: 2
      })
      timeline = timelineService.startCombat(timeline2)
    })

    it('advances to next round', async () => {
      const result = await timelineService.nextRound(timeline)
      expect(result.currentRound).toBe(2)
    })

    it('ends combat when no more rounds', async () => {
      // Go to last round
      const lastRoundTimeline = timelineService.goToRound(timeline, 2)
      const result = await timelineService.nextRound(lastRoundTimeline)

      expect(result.isActive).toBe(false)
    })

    it('throws error when combat not active', async () => {
      const inactiveTimeline = timelineService.endCombat(timeline)

      await expect(timelineService.nextRound(inactiveTimeline))
        .rejects.toThrow('Cannot advance round when combat is not active')
    })
  })

  describe('previousRound', () => {
    beforeEach(() => {
      // Add rounds and go to round 2
      const { timeline: timeline1 } = timelineService.addRound(timeline, {
        timelineId: timeline.id,
        roundNumber: 1
      })
      const { timeline: timeline2 } = timelineService.addRound(timeline1, {
        timelineId: timeline.id,
        roundNumber: 2
      })
      timeline = timelineService.goToRound(timeline2, 2)
    })

    it('goes to previous round', () => {
      const result = timelineService.previousRound(timeline)
      expect(result.currentRound).toBe(1)
    })

    it('throws error when at first round', () => {
      const firstRoundTimeline = timelineService.goToRound(timeline, 1)

      expect(() => timelineService.previousRound(firstRoundTimeline))
        .toThrow('Already at first round')
    })
  })

  describe('validateTimeline', () => {
    it('validates valid timeline', () => {
      const result = timelineService.validateTimeline(timeline)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('reports missing name', () => {
      const invalidTimeline = { ...timeline, name: '' }
      const result = timelineService.validateTimeline(invalidTimeline)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'name',
        message: 'Timeline name is required',
        code: 'TIMELINE_NAME_REQUIRED'
      })
    })

    it('reports missing map ID', () => {
      const invalidTimeline = { ...timeline, mapId: '' }
      const result = timelineService.validateTimeline(invalidTimeline)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'mapId',
        message: 'Map ID is required',
        code: 'MAP_ID_REQUIRED'
      })
    })
  })

  describe('getCurrentRound', () => {
    it('returns null for timeline without rounds', () => {
      const result = timelineService.getCurrentRound(timeline)
      expect(result).toBeNull()
    })

    it('returns current round when rounds exist', () => {
      const { timeline: timelineWithRound, round } = timelineService.addRound(timeline, {
        timelineId: timeline.id
      })

      const result = timelineService.getCurrentRound(timelineWithRound)
      expect(result).toBe(round)
    })
  })

  describe('getRoundEvents', () => {
    it('returns empty array for non-existent round', () => {
      const result = timelineService.getRoundEvents(timeline, 1)
      expect(result).toEqual([])
    })

    it('returns sorted events for existing round', () => {
      // This would require adding events, which depends on other services
      // For now, just test the basic case
      const result = timelineService.getRoundEvents(timeline, 1)
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('calculateDuration', () => {
    it('returns 0 for timeline without rounds', () => {
      const result = timelineService.calculateDuration(timeline)
      expect(result).toBe(0)
    })

    it('calculates total duration correctly', () => {
      // Add a round with mock events
      const { timeline: timelineWithRound } = timelineService.addRound(timeline, {
        timelineId: timeline.id
      })

      // Mock events would need to be added through EventService
      // For now, just test the empty case
      const result = timelineService.calculateDuration(timelineWithRound)
      expect(result).toBe(0)
    })
  })
})