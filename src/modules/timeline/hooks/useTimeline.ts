/**
 * Timeline Facade Hook
 * Main hook providing unified API for timeline functionality
 */

import { useMemo } from 'react'
import { useTimelineStore } from '../store'
import type {
  Timeline,
  Round,
  RoundEvent,
  TimelineId,
  RoundId,
  EventId,
  CreateTimelineData,
  CreateRoundData
} from '../types'
import { type CreateEventData } from '../services'
import {
  selectActiveTimeline,
  selectCurrentRound,
  selectTimelineStats,
  selectCanAdvanceRound,
  selectCanGoBackRound,
  selectPlaybackProgress
} from '../store/selectors'

/**
 * Main timeline hook providing all timeline functionality
 */
export const useTimeline = () => {
  // Get store state and actions
  const store = useTimelineStore()

  // Memoized selectors for performance
  const activeTimeline = useMemo(
    () => selectActiveTimeline(store.timelines, store.activeTimelineId),
    [store.timelines, store.activeTimelineId]
  )

  const currentRound = useMemo(
    () => selectCurrentRound(activeTimeline),
    [activeTimeline]
  )

  const stats = useMemo(
    () => selectTimelineStats(activeTimeline),
    [activeTimeline]
  )

  const canAdvanceRound = useMemo(
    () => selectCanAdvanceRound(activeTimeline),
    [activeTimeline]
  )

  const canGoBackRound = useMemo(
    () => selectCanGoBackRound(activeTimeline),
    [activeTimeline]
  )

  const playbackProgress = useMemo(
    () => selectPlaybackProgress(activeTimeline, store.playback),
    [activeTimeline, store.playback]
  )

  return {
    // State
    timelines: store.timelines,
    activeTimeline,
    activeTimelineId: store.activeTimelineId,
    currentRound,
    isInCombat: activeTimeline?.isActive || false,
    stats,

    // Playback state
    playback: store.playback,
    playbackProgress,
    canAdvanceRound,
    canGoBackRound,

    // Selection state
    selectedEventIds: store.selectedEventIds,
    selectedEvents: store.getSelectedEvents(),

    // Event creation state
    isCreatingEvent: store.isCreatingEvent,
    eventCreationData: store.eventCreationData,

    // Timeline management actions
    createTimeline: store.createTimeline,
    setActiveTimeline: store.setActiveTimeline,
    updateTimeline: store.updateTimeline,
    deleteTimeline: store.deleteTimeline,

    // Combat control
    startCombat: store.startCombat,
    endCombat: store.endCombat,

    // Round management
    addRound: store.addRound,
    removeRound: store.removeRound,
    nextRound: store.nextRound,
    previousRound: store.previousRound,
    goToRound: store.goToRound,
    duplicateRound: store.duplicateRound,

    // Event management
    addEvent: store.addEvent,
    updateEvent: store.updateEvent,
    removeEvent: store.removeEvent,
    duplicateEvent: store.duplicateEvent,
    moveEvent: store.moveEvent,
    clearAllEvents: store.clearAllEvents,

    // Event execution
    executeEvent: store.executeEvent,
    executeRound: store.executeRound,

    // Selection management
    selectEvent: store.selectEvent,
    selectMultipleEvents: store.selectMultipleEvents,
    clearSelection: store.clearSelection,
    toggleEventSelection: store.toggleEventSelection,

    // Playback control
    setPlaybackSpeed: store.setPlaybackSpeed,
    setAutoAdvanceRounds: store.setAutoAdvanceRounds,
    togglePlayback: store.togglePlayback,

    // Event creation workflow
    startEventCreation: store.startEventCreation,
    updateEventCreation: store.updateEventCreation,
    finishEventCreation: store.finishEventCreation,
    cancelEventCreation: store.cancelEventCreation,

    // Utility methods
    getEventById: store.getEventById,
    getRoundById: store.getRoundById
  }
}

/**
 * Hook for timeline-specific operations
 */
export const useTimelineActions = (timelineId?: TimelineId) => {
  const { setActiveTimeline, ...timeline } = useTimeline()

  // Auto-select timeline if provided and different from current
  if (timelineId && timeline.activeTimelineId !== timelineId) {
    setActiveTimeline(timelineId)
  }

  return timeline
}

/**
 * Hook for round-specific operations
 */
export const useRound = (roundId?: RoundId) => {
  const timeline = useTimeline()
  const round = roundId ? timeline.getRoundById(roundId) : timeline.currentRound

  return {
    round,
    events: round?.events || [],
    isCurrentRound: round?.roundNumber === timeline.currentRound,
    canExecute: round && !round.isExecuted,

    // Round-specific actions
    executeRound: () => round && timeline.executeRound(round.id),
    addEvent: (eventData: CreateEventData) => round && timeline.addEvent(round.id, eventData),
    clearAllEvents: () => round && timeline.clearAllEvents(round.id),
    duplicateRound: () => round && timeline.duplicateRound(round.id)
  }
}

/**
 * Hook for event-specific operations
 */
export const useEvent = (eventId?: EventId) => {
  const timeline = useTimeline()
  const event = eventId ? timeline.getEventById(eventId) : null

  return {
    event,
    isSelected: eventId ? timeline.selectedEventIds.includes(eventId) : false,
    canExecute: event && !event.isExecuted,

    // Event-specific actions
    executeEvent: () => event && timeline.executeEvent(event.id),
    updateEvent: (updates: Partial<RoundEvent>) => event && timeline.updateEvent(event.id, updates),
    removeEvent: () => event && timeline.removeEvent(event.id),
    duplicateEvent: () => event && timeline.duplicateEvent(event.id),
    toggleSelection: () => eventId && timeline.toggleEventSelection(eventId)
  }
}