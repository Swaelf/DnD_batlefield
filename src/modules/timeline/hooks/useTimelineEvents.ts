/**
 * Timeline Events Hook
 * Hook for subscribing to and handling timeline domain events
 */

import { useEffect, useCallback, useMemo } from 'react'
import { useEventBus } from '@/core/events'
import { useTimeline } from './useTimeline'
import type { EventId, RoundId, Timeline, RoundEvent } from '../types'

/**
 * Timeline domain events
 */
export type TimelineEventPayload = {
  TIMELINE_CREATED: { timelineId: string; timeline: Timeline }
  TIMELINE_ACTIVATED: { timelineId: string }
  TIMELINE_DELETED: { timelineId: string }

  COMBAT_STARTED: { timelineId: string }
  COMBAT_ENDED: { timelineId: string }

  ROUND_ADDED: { timelineId: string; roundId: string; roundNumber: number }
  ROUND_REMOVED: { timelineId: string; roundId: string }
  ROUND_ADVANCED: { timelineId: string; fromRound: number; toRound: number }

  EVENT_CREATED: { timelineId: string; roundId: string; eventId: string; event: RoundEvent }
  EVENT_UPDATED: { timelineId: string; eventId: string; event: RoundEvent }
  EVENT_DELETED: { timelineId: string; eventId: string }
  EVENT_EXECUTED: { timelineId: string; eventId: string; success: boolean }
  EVENT_SELECTED: { timelineId: string; eventIds: string[] }

  PLAYBACK_STARTED: { timelineId: string }
  PLAYBACK_STOPPED: { timelineId: string }
  PLAYBACK_SPEED_CHANGED: { timelineId: string; speed: number }
}

/**
 * Hook for timeline event handling
 */
export const useTimelineEvents = () => {
  const { emit, on, off } = useEventBus()
  const timeline = useTimeline()

  // Emit timeline events when state changes
  useEffect(() => {
    if (!timeline.activeTimelineId) return

    // Emit combat state changes
    const activeTimeline = timeline.activeTimeline
    if (activeTimeline) {
      if (activeTimeline.isActive) {
        emit('COMBAT_STARTED', { timelineId: timeline.activeTimelineId })
      }
    }
  }, [timeline.activeTimeline?.isActive, timeline.activeTimelineId, emit])

  // Event emission helpers
  const emitTimelineCreated = useCallback((timelineObj: Timeline) => {
    emit('TIMELINE_CREATED', { timelineId: timelineObj.id, timeline: timelineObj })
  }, [emit])

  const emitTimelineActivated = useCallback((timelineId: string) => {
    emit('TIMELINE_ACTIVATED', { timelineId })
  }, [emit])

  const emitTimelineDeleted = useCallback((timelineId: string) => {
    emit('TIMELINE_DELETED', { timelineId })
  }, [emit])

  const emitCombatStarted = useCallback((timelineId: string) => {
    emit('COMBAT_STARTED', { timelineId })
  }, [emit])

  const emitCombatEnded = useCallback((timelineId: string) => {
    emit('COMBAT_ENDED', { timelineId })
  }, [emit])

  const emitRoundAdded = useCallback((timelineId: string, roundId: string, roundNumber: number) => {
    emit('ROUND_ADDED', { timelineId, roundId, roundNumber })
  }, [emit])

  const emitRoundRemoved = useCallback((timelineId: string, roundId: string) => {
    emit('ROUND_REMOVED', { timelineId, roundId })
  }, [emit])

  const emitRoundAdvanced = useCallback((timelineId: string, fromRound: number, toRound: number) => {
    emit('ROUND_ADVANCED', { timelineId, fromRound, toRound })
  }, [emit])

  const emitEventCreated = useCallback((timelineId: string, roundId: string, eventId: string, event: RoundEvent) => {
    emit('EVENT_CREATED', { timelineId, roundId, eventId, event })
  }, [emit])

  const emitEventUpdated = useCallback((timelineId: string, eventId: string, event: RoundEvent) => {
    emit('EVENT_UPDATED', { timelineId, eventId, event })
  }, [emit])

  const emitEventDeleted = useCallback((timelineId: string, eventId: string) => {
    emit('EVENT_DELETED', { timelineId, eventId })
  }, [emit])

  const emitEventExecuted = useCallback((timelineId: string, eventId: string, success: boolean) => {
    emit('EVENT_EXECUTED', { timelineId, eventId, success })
  }, [emit])

  const emitEventSelected = useCallback((timelineId: string, eventIds: string[]) => {
    emit('EVENT_SELECTED', { timelineId, eventIds })
  }, [emit])

  const emitPlaybackStarted = useCallback((timelineId: string) => {
    emit('PLAYBACK_STARTED', { timelineId })
  }, [emit])

  const emitPlaybackStopped = useCallback((timelineId: string) => {
    emit('PLAYBACK_STOPPED', { timelineId })
  }, [emit])

  const emitPlaybackSpeedChanged = useCallback((timelineId: string, speed: number) => {
    emit('PLAYBACK_SPEED_CHANGED', { timelineId, speed })
  }, [emit])

  return {
    // Event emission helpers
    emitTimelineCreated,
    emitTimelineActivated,
    emitTimelineDeleted,
    emitCombatStarted,
    emitCombatEnded,
    emitRoundAdded,
    emitRoundRemoved,
    emitRoundAdvanced,
    emitEventCreated,
    emitEventUpdated,
    emitEventDeleted,
    emitEventExecuted,
    emitEventSelected,
    emitPlaybackStarted,
    emitPlaybackStopped,
    emitPlaybackSpeedChanged,

    // Event subscription methods
    on,
    off
  }
}

/**
 * Hook for listening to specific timeline events
 */
export const useTimelineEventSubscription = <K extends keyof TimelineEventPayload>(
  eventType: K,
  handler: (payload: TimelineEventPayload[K]) => void,
  deps: React.DependencyList = []
) => {
  const { on, off } = useEventBus()

  useEffect(() => {
    const subscription = on(eventType, handler)
    return () => subscription.unsubscribe()
  }, [eventType, handler, on, off, ...deps])
}

/**
 * Hook for timeline playback events
 */
export const usePlaybackEvents = () => {
  const timeline = useTimeline()
  const { emitPlaybackStarted, emitPlaybackStopped, emitPlaybackSpeedChanged } = useTimelineEvents()

  // Enhanced playback controls that emit events
  const startPlayback = useCallback(() => {
    if (!timeline.activeTimelineId) return

    timeline.togglePlayback()
    if (!timeline.playback.isPlaying) {
      emitPlaybackStarted(timeline.activeTimelineId)
    }
  }, [timeline, emitPlaybackStarted])

  const stopPlayback = useCallback(() => {
    if (!timeline.activeTimelineId) return

    if (timeline.playback.isPlaying) {
      timeline.togglePlayback()
      emitPlaybackStopped(timeline.activeTimelineId)
    }
  }, [timeline, emitPlaybackStopped])

  const setPlaybackSpeed = useCallback((speed: number) => {
    if (!timeline.activeTimelineId) return

    timeline.setPlaybackSpeed(speed)
    emitPlaybackSpeedChanged(timeline.activeTimelineId, speed)
  }, [timeline, emitPlaybackSpeedChanged])

  return {
    ...timeline.playback,
    startPlayback,
    stopPlayback,
    setPlaybackSpeed,
    togglePlayback: timeline.togglePlayback
  }
}

/**
 * Hook for combat flow events
 */
export const useCombatEvents = () => {
  const timeline = useTimeline()
  const {
    emitCombatStarted,
    emitCombatEnded,
    emitRoundAdvanced,
    emitEventExecuted
  } = useTimelineEvents()

  // Enhanced combat controls that emit events
  const startCombat = useCallback(async () => {
    if (!timeline.activeTimelineId) return

    timeline.startCombat()
    emitCombatStarted(timeline.activeTimelineId)
  }, [timeline, emitCombatStarted])

  const endCombat = useCallback(() => {
    if (!timeline.activeTimelineId) return

    timeline.endCombat()
    emitCombatEnded(timeline.activeTimelineId)
  }, [timeline, emitCombatEnded])

  const nextRound = useCallback(async () => {
    if (!timeline.activeTimelineId) return

    const currentRound = timeline.currentRound?.roundNumber || 1
    await timeline.nextRound()
    const newRound = timeline.currentRound?.roundNumber || 1

    if (newRound !== currentRound) {
      emitRoundAdvanced(timeline.activeTimelineId, currentRound, newRound)
    }
  }, [timeline, emitRoundAdvanced])

  const executeEvent = useCallback(async (eventId: EventId) => {
    if (!timeline.activeTimelineId) return

    try {
      await timeline.executeEvent(eventId)
      emitEventExecuted(timeline.activeTimelineId, eventId, true)
    } catch (error) {
      console.error('Failed to execute event:', error)
      emitEventExecuted(timeline.activeTimelineId, eventId, false)
    }
  }, [timeline, emitEventExecuted])

  return {
    startCombat,
    endCombat,
    nextRound,
    previousRound: timeline.previousRound,
    goToRound: timeline.goToRound,
    executeEvent,
    executeRound: timeline.executeRound
  }
}

/**
 * Hook for event management with event emission
 */
export const useEventManagement = () => {
  const timeline = useTimeline()
  const {
    emitEventCreated,
    emitEventUpdated,
    emitEventDeleted,
    emitEventSelected
  } = useTimelineEvents()

  const addEvent = useCallback((roundId: RoundId, eventData: any) => {
    if (!timeline.activeTimelineId) return

    const eventId = timeline.addEvent(roundId, eventData)
    const event = timeline.getEventById(eventId as EventId)

    if (event) {
      emitEventCreated(timeline.activeTimelineId, roundId, eventId, event)
    }

    return eventId
  }, [timeline, emitEventCreated])

  const updateEvent = useCallback((eventId: EventId, updates: Partial<RoundEvent>) => {
    if (!timeline.activeTimelineId) return

    timeline.updateEvent(eventId, updates)
    const event = timeline.getEventById(eventId)

    if (event) {
      emitEventUpdated(timeline.activeTimelineId, eventId, event)
    }
  }, [timeline, emitEventUpdated])

  const removeEvent = useCallback((eventId: EventId) => {
    if (!timeline.activeTimelineId) return

    timeline.removeEvent(eventId)
    emitEventDeleted(timeline.activeTimelineId, eventId)
  }, [timeline, emitEventDeleted])

  const selectEvents = useCallback((eventIds: EventId[]) => {
    if (!timeline.activeTimelineId) return

    timeline.selectMultipleEvents(eventIds)
    emitEventSelected(timeline.activeTimelineId, eventIds)
  }, [timeline, emitEventSelected])

  return {
    addEvent,
    updateEvent,
    removeEvent,
    selectEvents,
    duplicateEvent: timeline.duplicateEvent,
    moveEvent: timeline.moveEvent
  }
}

/**
 * Hook for subscribing to all timeline events (for debugging/logging)
 */
export const useTimelineEventLogger = (enabled: boolean = false) => {
  const { on } = useEventBus()

  useEffect(() => {
    if (!enabled) return

    const subscriptions = (Object.keys({
      TIMELINE_CREATED: true,
      TIMELINE_ACTIVATED: true,
      TIMELINE_DELETED: true,
      COMBAT_STARTED: true,
      COMBAT_ENDED: true,
      ROUND_ADDED: true,
      ROUND_REMOVED: true,
      ROUND_ADVANCED: true,
      EVENT_CREATED: true,
      EVENT_UPDATED: true,
      EVENT_DELETED: true,
      EVENT_EXECUTED: true,
      EVENT_SELECTED: true,
      PLAYBACK_STARTED: true,
      PLAYBACK_STOPPED: true,
      PLAYBACK_SPEED_CHANGED: true
    }) as (keyof TimelineEventPayload)[]).map(eventType => {
      return on(eventType, (payload) => {
        console.log(`[Timeline Event] ${eventType}:`, payload)
      })
    })

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe())
    }
  }, [enabled, on])
}