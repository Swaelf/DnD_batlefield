/**
 * Timeline Facade Hook
 * Main hook providing unified API for timeline functionality
 */

import { useMemo } from 'react'
import { useStore } from 'zustand'
import { useTimelineStore } from '../store'
import type {
  RoundEvent,
  TimelineId,
  RoundId,
  EventId
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
  const timelines = useStore(useTimelineStore, state => state.timelines)
  const activeTimelineId = useStore(useTimelineStore, state => state.activeTimelineId)
  const playback = useStore(useTimelineStore, state => state.playback)
  const selectedEventIds = useStore(useTimelineStore, state => state.selectedEventIds)
  const getSelectedEvents = useStore(useTimelineStore, state => state.getSelectedEvents)
  const getRoundById = useStore(useTimelineStore, state => state.getRoundById)
  const getEventById = useStore(useTimelineStore, state => state.getEventById)
  const isCreatingEvent = useStore(useTimelineStore, state => state.isCreatingEvent)
  const eventCreationData = useStore(useTimelineStore, state => state.eventCreationData)
  const storeActions = useStore(useTimelineStore, state => ({
    createTimeline: state.createTimeline,
    deleteTimeline: state.deleteTimeline,
    setActiveTimeline: state.setActiveTimeline,
    addRound: state.addRound,
    removeRound: state.removeRound,
    addEvent: state.addEvent,
    updateEvent: state.updateEvent,
    removeEvent: state.removeEvent,
    executeEvent: state.executeEvent,
    selectEvent: state.selectEvent,
    nextRound: state.nextRound,
    goToRound: state.goToRound,
    startCombat: state.startCombat,
    endCombat: state.endCombat,
    togglePlayback: state.togglePlayback,
    setPlaybackSpeed: state.setPlaybackSpeed,
    updateTimeline: state.updateTimeline,
    previousRound: state.previousRound,
    duplicateRound: state.duplicateRound,
    duplicateEvent: state.duplicateEvent,
    moveEvent: state.moveEvent,
    clearAllEvents: state.clearAllEvents,
    executeRound: state.executeRound,
    selectMultipleEvents: state.selectMultipleEvents,
    clearSelection: state.clearSelection,
    toggleEventSelection: state.toggleEventSelection,
    setAutoAdvanceRounds: state.setAutoAdvanceRounds,
    startEventCreation: state.startEventCreation,
    updateEventCreation: state.updateEventCreation,
    finishEventCreation: state.finishEventCreation,
    cancelEventCreation: state.cancelEventCreation
  }))

  // Memoized selectors for performance
  const activeTimeline = useMemo(
    () => selectActiveTimeline(timelines, activeTimelineId),
    [timelines, activeTimelineId]
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
    () => selectPlaybackProgress(activeTimeline, playback),
    [activeTimeline, playback]
  )

  return {
    // State
    timelines,
    activeTimeline,
    activeTimelineId,
    currentRound,
    isInCombat: activeTimeline?.isActive || false,
    stats,

    // Playback state
    playback,
    playbackProgress,
    canAdvanceRound,
    canGoBackRound,

    // Selection state
    selectedEventIds,
    selectedEvents: getSelectedEvents(),

    // Event creation state
    isCreatingEvent,
    eventCreationData,

    // Timeline management actions
    createTimeline: storeActions.createTimeline,
    setActiveTimeline: storeActions.setActiveTimeline,
    updateTimeline: storeActions.updateTimeline,
    deleteTimeline: storeActions.deleteTimeline,

    // Combat control
    startCombat: storeActions.startCombat,
    endCombat: storeActions.endCombat,

    // Round management
    addRound: storeActions.addRound,
    removeRound: storeActions.removeRound,
    nextRound: storeActions.nextRound,
    previousRound: storeActions.previousRound,
    goToRound: storeActions.goToRound,
    duplicateRound: storeActions.duplicateRound,

    // Event management
    addEvent: storeActions.addEvent,
    updateEvent: storeActions.updateEvent,
    removeEvent: storeActions.removeEvent,
    duplicateEvent: storeActions.duplicateEvent,
    moveEvent: storeActions.moveEvent,
    clearAllEvents: storeActions.clearAllEvents,

    // Event execution
    executeEvent: storeActions.executeEvent,
    executeRound: storeActions.executeRound,

    // Selection management
    selectEvent: storeActions.selectEvent,
    selectMultipleEvents: storeActions.selectMultipleEvents,
    clearSelection: storeActions.clearSelection,
    toggleEventSelection: storeActions.toggleEventSelection,

    // Playback control
    setPlaybackSpeed: storeActions.setPlaybackSpeed,
    setAutoAdvanceRounds: storeActions.setAutoAdvanceRounds,
    togglePlayback: storeActions.togglePlayback,

    // Event creation workflow
    startEventCreation: storeActions.startEventCreation,
    updateEventCreation: storeActions.updateEventCreation,
    finishEventCreation: storeActions.finishEventCreation,
    cancelEventCreation: storeActions.cancelEventCreation,

    // Utility methods
    getEventById,
    getRoundById
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
    isCurrentRound: round?.roundNumber === timeline.currentRound?.roundNumber,
    canExecute: round && !round.isExecuted,

    // Round-specific actions
    executeRound: () => round ? timeline.executeRound(round.id) : undefined,
    addEvent: (eventData: CreateEventData) => round ? timeline.addEvent(round.id, eventData) : undefined,
    clearAllEvents: () => round ? timeline.clearAllEvents(round.id) : undefined,
    duplicateRound: () => round ? timeline.duplicateRound(round.id) : undefined
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