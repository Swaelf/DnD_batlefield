/**
 * Timeline Store Selectors
 * Computed state selectors for performance optimization
 */

import type {
  Timeline,
  Round,
  RoundEvent,
  TimelineId,
  RoundId,
  EventId,
  TimelinePlaybackState
} from '../types'

/**
 * Selector for getting timeline by ID
 */
export const selectTimelineById = (timelines: Timeline[], id: TimelineId | null): Timeline | null => {
  return id ? timelines.find(t => t.id === id) || null : null
}

/**
 * Selector for getting active timeline
 */
export const selectActiveTimeline = (timelines: Timeline[], activeTimelineId: TimelineId | null): Timeline | null => {
  return selectTimelineById(timelines, activeTimelineId)
}

/**
 * Selector for getting current round of active timeline
 */
export const selectCurrentRound = (timeline: Timeline | null): Round | null => {
  if (!timeline) return null
  return timeline.rounds.find(r => r.roundNumber === timeline.currentRound) || null
}

/**
 * Selector for getting all rounds sorted by round number
 */
export const selectSortedRounds = (timeline: Timeline | null): Round[] => {
  if (!timeline) return []
  return [...timeline.rounds].sort((a, b) => a.roundNumber - b.roundNumber)
}

/**
 * Selector for getting events in a specific round, sorted by order
 */
export const selectRoundEvents = (round: Round | null): RoundEvent[] => {
  if (!round) return []
  return [...round.events].sort((a, b) => a.order - b.order)
}

/**
 * Selector for getting all events in timeline
 */
export const selectAllTimelineEvents = (timeline: Timeline | null): RoundEvent[] => {
  if (!timeline) return []

  const allEvents: RoundEvent[] = []
  const sortedRounds = selectSortedRounds(timeline)

  for (const round of sortedRounds) {
    allEvents.push(...selectRoundEvents(round))
  }

  return allEvents
}

/**
 * Selector for getting event by ID across all rounds
 */
export const selectEventById = (timeline: Timeline | null, eventId: EventId): RoundEvent | null => {
  if (!timeline) return null

  for (const round of timeline.rounds) {
    const event = round.events.find(e => e.id === eventId)
    if (event) return event
  }

  return null
}

/**
 * Selector for getting round by ID
 */
export const selectRoundById = (timeline: Timeline | null, roundId: RoundId): Round | null => {
  if (!timeline) return null
  return timeline.rounds.find(r => r.id === roundId) || null
}

/**
 * Selector for getting multiple events by IDs
 */
export const selectEventsByIds = (timeline: Timeline | null, eventIds: EventId[]): RoundEvent[] => {
  if (!timeline) return []

  const events: RoundEvent[] = []
  for (const eventId of eventIds) {
    const event = selectEventById(timeline, eventId)
    if (event) events.push(event)
  }

  return events
}

/**
 * Selector for getting pending (unexecuted) events in current round
 */
export const selectPendingEventsInCurrentRound = (timeline: Timeline | null): RoundEvent[] => {
  const currentRound = selectCurrentRound(timeline)
  if (!currentRound) return []

  return selectRoundEvents(currentRound).filter(event => !event.isExecuted)
}

/**
 * Selector for getting executed events in current round
 */
export const selectExecutedEventsInCurrentRound = (timeline: Timeline | null): RoundEvent[] => {
  const currentRound = selectCurrentRound(timeline)
  if (!currentRound) return []

  return selectRoundEvents(currentRound).filter(event => event.isExecuted)
}

/**
 * Selector for checking if timeline is ready for combat
 */
export const selectIsTimelineReadyForCombat = (timeline: Timeline | null): boolean => {
  if (!timeline) return false
  return timeline.rounds.length > 0 && timeline.rounds.some(r => r.events.length > 0)
}

/**
 * Selector for getting timeline statistics
 */
export const selectTimelineStats = (timeline: Timeline | null) => {
  if (!timeline) {
    return {
      totalRounds: 0,
      totalEvents: 0,
      executedEvents: 0,
      pendingEvents: 0,
      totalDuration: 0,
      averageEventsPerRound: 0
    }
  }

  const allEvents = selectAllTimelineEvents(timeline)
  const executedEvents = allEvents.filter(e => e.isExecuted)
  const totalDuration = allEvents.reduce((sum, event) => sum + event.duration, 0)

  return {
    totalRounds: timeline.rounds.length,
    totalEvents: allEvents.length,
    executedEvents: executedEvents.length,
    pendingEvents: allEvents.length - executedEvents.length,
    totalDuration,
    averageEventsPerRound: timeline.rounds.length > 0 ? allEvents.length / timeline.rounds.length : 0
  }
}

/**
 * Selector for getting round statistics
 */
export const selectRoundStats = (round: Round | null) => {
  if (!round) {
    return {
      totalEvents: 0,
      executedEvents: 0,
      pendingEvents: 0,
      totalDuration: 0,
      isComplete: false
    }
  }

  const events = selectRoundEvents(round)
  const executedEvents = events.filter(e => e.isExecuted)
  const totalDuration = events.reduce((sum, event) => sum + event.duration, 0)

  return {
    totalEvents: events.length,
    executedEvents: executedEvents.length,
    pendingEvents: events.length - executedEvents.length,
    totalDuration,
    isComplete: round.isExecuted
  }
}

/**
 * Selector for getting next unexecuted event in timeline
 */
export const selectNextPendingEvent = (timeline: Timeline | null): RoundEvent | null => {
  if (!timeline || !timeline.isActive) return null

  const sortedRounds = selectSortedRounds(timeline)

  // Start from current round
  const currentRoundIndex = sortedRounds.findIndex(r => r.roundNumber === timeline.currentRound)
  if (currentRoundIndex === -1) return null

  // Check current round first
  for (let i = currentRoundIndex; i < sortedRounds.length; i++) {
    const events = selectRoundEvents(sortedRounds[i])
    const pendingEvent = events.find(event => !event.isExecuted)
    if (pendingEvent) return pendingEvent
  }

  return null
}

/**
 * Selector for checking if round can be advanced
 */
export const selectCanAdvanceRound = (timeline: Timeline | null): boolean => {
  if (!timeline || !timeline.isActive) return false

  const currentRound = selectCurrentRound(timeline)
  if (!currentRound) return false

  // Can advance if current round is executed or has no events
  return currentRound.isExecuted || currentRound.events.length === 0
}

/**
 * Selector for checking if round can go back
 */
export const selectCanGoBackRound = (timeline: Timeline | null): boolean => {
  if (!timeline) return false
  return timeline.currentRound > 1
}

/**
 * Selector for getting playback progress
 */
export const selectPlaybackProgress = (timeline: Timeline | null, playback: TimelinePlaybackState) => {
  if (!timeline) {
    return {
      currentRound: 0,
      totalRounds: 0,
      currentEvent: 0,
      totalEventsInRound: 0,
      overallProgress: 0,
      roundProgress: 0
    }
  }

  const totalRounds = timeline.rounds.length
  const currentRound = selectCurrentRound(timeline)
  const eventsInCurrentRound = currentRound ? selectRoundEvents(currentRound) : []
  const allEvents = selectAllTimelineEvents(timeline)

  // Calculate overall progress based on executed events
  const executedEvents = allEvents.filter(e => e.isExecuted).length
  const overallProgress = allEvents.length > 0 ? (executedEvents / allEvents.length) * 100 : 0

  // Calculate round progress
  const executedInRound = eventsInCurrentRound.filter(e => e.isExecuted).length
  const roundProgress = eventsInCurrentRound.length > 0 ? (executedInRound / eventsInCurrentRound.length) * 100 : 0

  return {
    currentRound: timeline.currentRound,
    totalRounds,
    currentEvent: Math.min(playback.currentEventIndex + 1, eventsInCurrentRound.length),
    totalEventsInRound: eventsInCurrentRound.length,
    overallProgress,
    roundProgress
  }
}

/**
 * Selector for getting events filtered by type
 */
export const selectEventsByType = (timeline: Timeline | null, eventType: string): RoundEvent[] => {
  const allEvents = selectAllTimelineEvents(timeline)
  return allEvents.filter(event => event.type === eventType)
}

/**
 * Selector for getting events that can be executed
 */
export const selectExecutableEvents = (timeline: Timeline | null): RoundEvent[] => {
  const allEvents = selectAllTimelineEvents(timeline)
  return allEvents.filter(event => !event.isExecuted && !event.canSkip === false)
}

/**
 * Selector for checking if timeline has unsaved changes
 */
export const selectHasUnsavedChanges = (timeline: Timeline | null): boolean => {
  if (!timeline) return false

  const now = new Date()
  const timeSinceUpdate = now.getTime() - timeline.updatedAt.getTime()

  // Consider changes unsaved if updated within last 5 minutes and not in a "stable" state
  return timeSinceUpdate < 5 * 60 * 1000 && (
    timeline.isActive ||
    selectPendingEventsInCurrentRound(timeline).length > 0
  )
}