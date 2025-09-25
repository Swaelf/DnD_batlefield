/**
 * Timeline Core Types
 * Base types for timeline, rounds, and events
 */

import type { BrandedString, Point } from '@/foundation/types'

// Branded IDs for type safety
export type TimelineId = BrandedString<'TimelineId'>
export type RoundId = BrandedString<'RoundId'>
export type EventId = BrandedString<'EventId'>

/**
 * Core Timeline represents a combat encounter
 */
export type Timeline = {
  readonly id: TimelineId
  readonly mapId: string
  readonly name: string
  readonly rounds: Round[]
  readonly currentRound: number
  readonly isActive: boolean
  readonly createdAt: Date
  readonly updatedAt: Date
}

/**
 * Round represents a single combat round
 */
export type Round = {
  readonly id: RoundId
  readonly timelineId: TimelineId
  readonly roundNumber: number
  readonly events: RoundEvent[]
  readonly isExecuted: boolean
  readonly executionStartTime: Date | null
  readonly executionEndTime: Date | null
}

/**
 * Base event that occurs within a round
 */
export type RoundEvent = {
  readonly id: EventId
  readonly roundId: RoundId
  readonly type: EventType
  readonly name: string
  readonly order: number
  readonly data: EventData
  readonly isExecuted: boolean
  readonly executionTime: Date | null
  readonly duration: number // milliseconds
  readonly canSkip: boolean
}

/**
 * Event type discriminator
 */
export type EventType =
  | 'move'
  | 'attack'
  | 'spell'
  | 'interaction'
  | 'environmental'
  | 'sequence'

/**
 * Event execution status
 */
export type ExecutionStatus = 'pending' | 'executing' | 'completed' | 'failed' | 'skipped'

/**
 * Timeline state for playback
 */
export type TimelinePlaybackState = {
  readonly isPlaying: boolean
  readonly currentRound: number
  readonly currentEventIndex: number
  readonly playbackSpeed: number // 0.25x to 4x
  readonly autoAdvanceRounds: boolean
}

/**
 * Timeline creation parameters
 */
export type CreateTimelineData = {
  readonly mapId: string
  readonly name: string
}

/**
 * Round creation parameters
 */
export type CreateRoundData = {
  readonly timelineId: TimelineId
  readonly roundNumber?: number // Auto-generated if not provided
}

/**
 * Validation result for timeline operations
 */
export type ValidationResult = {
  readonly isValid: boolean
  readonly errors: ValidationError[]
  readonly warnings: ValidationWarning[]
}

export type ValidationError = {
  readonly field: string
  readonly message: string
  readonly code: string
}

export type ValidationWarning = {
  readonly field: string
  readonly message: string
  readonly code: string
}