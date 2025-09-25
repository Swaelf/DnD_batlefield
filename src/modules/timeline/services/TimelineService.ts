/**
 * Timeline Service
 * Core business logic for timeline and combat management
 */

import { nanoid } from 'nanoid'
import type {
  Timeline,
  Round,
  RoundEvent,
  TimelineId,
  RoundId,
  EventId,
  CreateTimelineData,
  CreateRoundData,
  ValidationResult,
  ExecutionStatus
} from '../types'

/**
 * Service for managing timeline operations
 */
export class TimelineService {
  /**
   * Create a new timeline
   */
  createTimeline(data: CreateTimelineData): Timeline {
    const now = new Date()

    return {
      id: nanoid() as TimelineId,
      mapId: data.mapId,
      name: data.name,
      rounds: [],
      currentRound: 1,
      isActive: false,
      createdAt: now,
      updatedAt: now
    }
  }

  /**
   * Start combat for a timeline
   */
  startCombat(timeline: Timeline): Timeline {
    if (timeline.isActive) {
      throw new Error('Combat is already active for this timeline')
    }

    if (timeline.rounds.length === 0) {
      throw new Error('Cannot start combat without any rounds')
    }

    return {
      ...timeline,
      isActive: true,
      currentRound: 1,
      updatedAt: new Date()
    }
  }

  /**
   * End combat for a timeline
   */
  endCombat(timeline: Timeline): Timeline {
    return {
      ...timeline,
      isActive: false,
      updatedAt: new Date()
    }
  }

  /**
   * Add a new round to timeline
   */
  addRound(timeline: Timeline, data: CreateRoundData): { timeline: Timeline; round: Round } {
    const roundNumber = data.roundNumber ?? timeline.rounds.length + 1

    // Validate round number
    if (roundNumber <= 0) {
      throw new Error('Round number must be positive')
    }

    // Check if round already exists
    const existingRound = timeline.rounds.find(r => r.roundNumber === roundNumber)
    if (existingRound) {
      throw new Error(`Round ${roundNumber} already exists`)
    }

    const round: Round = {
      id: nanoid() as RoundId,
      timelineId: timeline.id,
      roundNumber,
      events: [],
      isExecuted: false,
      executionStartTime: null,
      executionEndTime: null
    }

    const updatedTimeline: Timeline = {
      ...timeline,
      rounds: [...timeline.rounds, round].sort((a, b) => a.roundNumber - b.roundNumber),
      updatedAt: new Date()
    }

    return { timeline: updatedTimeline, round }
  }

  /**
   * Remove a round from timeline
   */
  removeRound(timeline: Timeline, roundId: RoundId): Timeline {
    const rounds = timeline.rounds.filter(r => r.id !== roundId)

    if (rounds.length === timeline.rounds.length) {
      throw new Error('Round not found')
    }

    // If we removed the current round, adjust current round
    let currentRound = timeline.currentRound
    const removedRound = timeline.rounds.find(r => r.id === roundId)
    if (removedRound && removedRound.roundNumber <= timeline.currentRound) {
      currentRound = Math.max(1, timeline.currentRound - 1)
    }

    return {
      ...timeline,
      rounds,
      currentRound,
      updatedAt: new Date()
    }
  }

  /**
   * Go to a specific round
   */
  goToRound(timeline: Timeline, roundNumber: number): Timeline {
    if (roundNumber < 1) {
      throw new Error('Round number must be positive')
    }

    const round = timeline.rounds.find(r => r.roundNumber === roundNumber)
    if (!round) {
      throw new Error(`Round ${roundNumber} does not exist`)
    }

    return {
      ...timeline,
      currentRound: roundNumber,
      updatedAt: new Date()
    }
  }

  /**
   * Advance to next round
   */
  nextRound(timeline: Timeline): Promise<Timeline> {
    if (!timeline.isActive) {
      throw new Error('Cannot advance round when combat is not active')
    }

    const currentRoundIndex = timeline.rounds.findIndex(r => r.roundNumber === timeline.currentRound)
    if (currentRoundIndex === -1) {
      throw new Error('Current round not found')
    }

    // Execute current round if not already executed
    let updatedTimeline = timeline
    const currentRound = timeline.rounds[currentRoundIndex]
    if (!currentRound.isExecuted) {
      updatedTimeline = this.executeRound(updatedTimeline, currentRound.id)
    }

    // Move to next round
    const nextRoundNumber = timeline.currentRound + 1
    const nextRound = timeline.rounds.find(r => r.roundNumber === nextRoundNumber)

    if (!nextRound) {
      // No more rounds, end combat
      return Promise.resolve(this.endCombat(updatedTimeline))
    }

    return Promise.resolve({
      ...updatedTimeline,
      currentRound: nextRoundNumber,
      updatedAt: new Date()
    })
  }

  /**
   * Go to previous round
   */
  previousRound(timeline: Timeline): Timeline {
    if (timeline.currentRound <= 1) {
      throw new Error('Already at first round')
    }

    const previousRoundNumber = timeline.currentRound - 1
    return this.goToRound(timeline, previousRoundNumber)
  }

  /**
   * Execute all events in a round
   */
  executeRound(timeline: Timeline, roundId: RoundId): Timeline {
    const roundIndex = timeline.rounds.findIndex(r => r.id === roundId)
    if (roundIndex === -1) {
      throw new Error('Round not found')
    }

    const round = timeline.rounds[roundIndex]
    if (round.isExecuted) {
      return timeline // Already executed
    }

    // Sort events by execution order
    const sortedEvents = [...round.events].sort((a, b) => a.order - b.order)

    // Mark round as executed
    const updatedRound: Round = {
      ...round,
      isExecuted: true,
      executionStartTime: new Date(),
      executionEndTime: new Date() // Will be updated after execution
    }

    const updatedRounds = [...timeline.rounds]
    updatedRounds[roundIndex] = updatedRound

    return {
      ...timeline,
      rounds: updatedRounds,
      updatedAt: new Date()
    }
  }

  /**
   * Execute a specific event
   */
  async executeEvent(timeline: Timeline, eventId: EventId): Promise<{ timeline: Timeline; status: ExecutionStatus }> {
    // Find the event
    let eventFound = false
    let updatedTimeline = timeline

    for (let roundIndex = 0; roundIndex < timeline.rounds.length; roundIndex++) {
      const round = timeline.rounds[roundIndex]
      const eventIndex = round.events.findIndex(e => e.id === eventId)

      if (eventIndex !== -1) {
        const event = round.events[eventIndex]
        eventFound = true

        if (event.isExecuted) {
          return { timeline, status: 'completed' }
        }

        // Execute the event
        const executedEvent: RoundEvent = {
          ...event,
          isExecuted: true,
          executionTime: new Date()
        }

        const updatedEvents = [...round.events]
        updatedEvents[eventIndex] = executedEvent

        const updatedRound: Round = {
          ...round,
          events: updatedEvents
        }

        const updatedRounds = [...timeline.rounds]
        updatedRounds[roundIndex] = updatedRound

        updatedTimeline = {
          ...timeline,
          rounds: updatedRounds,
          updatedAt: new Date()
        }

        break
      }
    }

    if (!eventFound) {
      throw new Error('Event not found')
    }

    return { timeline: updatedTimeline, status: 'completed' }
  }

  /**
   * Add event to a round
   */
  addEvent(timeline: Timeline, roundId: RoundId, event: Omit<RoundEvent, 'id' | 'roundId'>): Timeline {
    const roundIndex = timeline.rounds.findIndex(r => r.id === roundId)
    if (roundIndex === -1) {
      throw new Error('Round not found')
    }

    const round = timeline.rounds[roundIndex]
    const newEvent: RoundEvent = {
      id: nanoid() as EventId,
      roundId,
      ...event
    }

    const updatedRound: Round = {
      ...round,
      events: [...round.events, newEvent]
    }

    const updatedRounds = [...timeline.rounds]
    updatedRounds[roundIndex] = updatedRound

    return {
      ...timeline,
      rounds: updatedRounds,
      updatedAt: new Date()
    }
  }

  /**
   * Update an existing event
   */
  updateEvent(timeline: Timeline, eventId: EventId, updates: Partial<RoundEvent>): Timeline {
    let updated = false
    const updatedRounds = timeline.rounds.map(round => {
      const eventIndex = round.events.findIndex(e => e.id === eventId)
      if (eventIndex === -1) return round

      const updatedEvents = [...round.events]
      updatedEvents[eventIndex] = { ...updatedEvents[eventIndex], ...updates }
      updated = true

      return {
        ...round,
        events: updatedEvents
      }
    })

    if (!updated) {
      throw new Error('Event not found')
    }

    return {
      ...timeline,
      rounds: updatedRounds,
      updatedAt: new Date()
    }
  }

  /**
   * Remove an event
   */
  removeEvent(timeline: Timeline, eventId: EventId): Timeline {
    let removed = false
    const updatedRounds = timeline.rounds.map(round => {
      const events = round.events.filter(e => e.id !== eventId)
      if (events.length < round.events.length) {
        removed = true
      }
      return { ...round, events }
    })

    if (!removed) {
      throw new Error('Event not found')
    }

    return {
      ...timeline,
      rounds: updatedRounds,
      updatedAt: new Date()
    }
  }

  /**
   * Validate timeline data
   */
  validateTimeline(timeline: Timeline): ValidationResult {
    const errors = []
    const warnings = []

    // Basic validation
    if (!timeline.name.trim()) {
      errors.push({ field: 'name', message: 'Timeline name is required', code: 'TIMELINE_NAME_REQUIRED' })
    }

    if (!timeline.mapId.trim()) {
      errors.push({ field: 'mapId', message: 'Map ID is required', code: 'MAP_ID_REQUIRED' })
    }

    // Round validation
    const roundNumbers = timeline.rounds.map(r => r.roundNumber)
    const duplicateRounds = roundNumbers.filter((num, index) => roundNumbers.indexOf(num) !== index)
    if (duplicateRounds.length > 0) {
      errors.push({ field: 'rounds', message: 'Duplicate round numbers found', code: 'DUPLICATE_ROUNDS' })
    }

    // Check for gaps in round numbers
    if (timeline.rounds.length > 0) {
      const minRound = Math.min(...roundNumbers)
      const maxRound = Math.max(...roundNumbers)
      for (let i = minRound; i <= maxRound; i++) {
        if (!roundNumbers.includes(i)) {
          warnings.push({ field: 'rounds', message: `Gap in round sequence at round ${i}`, code: 'ROUND_GAP' })
        }
      }
    }

    // Event validation
    for (const round of timeline.rounds) {
      const eventOrders = round.events.map(e => e.order)
      const duplicateOrders = eventOrders.filter((order, index) => eventOrders.indexOf(order) !== index)
      if (duplicateOrders.length > 0) {
        errors.push({ field: `round.${round.roundNumber}.events`, message: 'Duplicate event orders found', code: 'DUPLICATE_EVENT_ORDERS' })
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Get current round
   */
  getCurrentRound(timeline: Timeline): Round | null {
    return timeline.rounds.find(r => r.roundNumber === timeline.currentRound) || null
  }

  /**
   * Get events for a specific round
   */
  getRoundEvents(timeline: Timeline, roundNumber: number): RoundEvent[] {
    const round = timeline.rounds.find(r => r.roundNumber === roundNumber)
    return round ? [...round.events].sort((a, b) => a.order - b.order) : []
  }

  /**
   * Calculate total timeline duration
   */
  calculateDuration(timeline: Timeline): number {
    return timeline.rounds.reduce((total, round) => {
      const roundDuration = round.events.reduce((sum, event) => sum + event.duration, 0)
      return total + roundDuration
    }, 0)
  }
}