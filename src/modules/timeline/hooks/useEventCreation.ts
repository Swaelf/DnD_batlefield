/**
 * Event Creation Hook
 * Specialized hook for managing event creation workflow
 */

import { useCallback, useMemo } from 'react'
import { useTimeline } from './useTimeline'
import type {
  EventType,
  EventData,
  RoundId,
  RoundEvent,
  MoveEventData,
  AttackEventData,
  SpellEventData,
  InteractionEventData,
  EnvironmentalEventData,
  SequenceEventData
} from '../types'
import { type CreateEventData } from '../services'

/**
 * Event creation workflow states
 */
type EventCreationStep =
  | 'type-selection'
  | 'basic-details'
  | 'event-data'
  | 'duration-settings'
  | 'review'

/**
 * Hook for managing event creation workflow
 */
export const useEventCreation = () => {
  const timeline = useTimeline()

  // Current step in creation workflow
  const currentStep = useMemo((): EventCreationStep => {
    const { eventCreationData } = timeline

    if (!eventCreationData) return 'type-selection'
    if (!eventCreationData.type) return 'type-selection'
    if (!eventCreationData.name) return 'basic-details'
    if (!eventCreationData.data) return 'event-data'
    if (!eventCreationData.duration) return 'duration-settings'
    return 'review'
  }, [timeline.eventCreationData])

  // Validation for current step
  const stepValidation = useMemo(() => {
    const { eventCreationData } = timeline

    return {
      typeSelection: Boolean(eventCreationData?.type),
      basicDetails: Boolean(eventCreationData?.name && eventCreationData?.type),
      eventData: Boolean(eventCreationData?.data),
      durationSettings: Boolean(eventCreationData?.duration),
      review: Boolean(
        eventCreationData?.name &&
        eventCreationData?.type &&
        eventCreationData?.data &&
        eventCreationData?.duration
      )
    }
  }, [timeline.eventCreationData])

  // Start creation with optional initial data
  const startCreation = useCallback((initialData?: Partial<CreateEventData>) => {
    timeline.startEventCreation(initialData || {})
  }, [timeline])

  // Update event type
  const setEventType = useCallback((type: EventType) => {
    timeline.updateEventCreation({ type })
  }, [timeline])

  // Update basic details
  const setBasicDetails = useCallback((name: string, order?: number) => {
    timeline.updateEventCreation({
      name,
      ...(order !== undefined && { order })
    })
  }, [timeline])

  // Update event data based on type
  const setEventData = useCallback((data: EventData) => {
    timeline.updateEventCreation({ data })
  }, [timeline])

  // Update duration and skip settings
  const setDurationSettings = useCallback((duration: number, canSkip?: boolean) => {
    timeline.updateEventCreation({
      duration,
      ...(canSkip !== undefined && { canSkip })
    })
  }, [timeline])

  // Complete creation and add to timeline
  const completeCreation = useCallback((roundId: RoundId) => {
    return timeline.finishEventCreation(roundId)
  }, [timeline])

  // Cancel creation
  const cancelCreation = useCallback(() => {
    timeline.cancelEventCreation()
  }, [timeline])

  // Go to specific step (for navigation)
  const goToStep = useCallback((step: EventCreationStep) => {
    // This would require more sophisticated state management
    // For now, we'll just log the intent
    console.log(`Navigate to step: ${step}`)
  }, [])

  // Get next available order number for a round
  const getNextOrderForRound = useCallback((roundId: RoundId): number => {
    const round = timeline.getRoundById(roundId)
    if (!round || round.events.length === 0) return 1

    const maxOrder = Math.max(...round.events.map((e: RoundEvent) => e.order))
    return maxOrder + 1
  }, [timeline])

  return {
    // State
    isCreating: timeline.isCreatingEvent,
    currentStep,
    eventCreationData: timeline.eventCreationData,
    stepValidation,

    // Actions
    startCreation,
    setEventType,
    setBasicDetails,
    setEventData,
    setDurationSettings,
    completeCreation,
    cancelCreation,
    goToStep,

    // Utilities
    getNextOrderForRound,
    updateCreationData: timeline.updateEventCreation
  }
}

/**
 * Hook for creating specific event types with type safety
 */
export const useEventTypeCreation = <T extends EventType>(eventType: T) => {
  const eventCreation = useEventCreation()

  // Type-specific data setter with proper typing
  const setTypeSpecificData = useCallback((data: EventDataForType<T>) => {
    eventCreation.setEventData(data as EventData)
  }, [eventCreation])

  // Get current data with proper typing
  const currentData = useMemo(() => {
    const { eventCreationData } = eventCreation
    if (!eventCreationData || eventCreationData.type !== eventType) return null
    return eventCreationData.data as EventDataForType<T> | undefined
  }, [eventCreation.eventCreationData, eventType])

  return {
    ...eventCreation,
    setEventData: setTypeSpecificData,
    currentEventData: currentData
  }
}

// Type helper for getting event data type from event type
type EventDataForType<T extends EventType> =
  T extends 'move' ? MoveEventData :
  T extends 'attack' ? AttackEventData :
  T extends 'spell' ? SpellEventData :
  T extends 'interaction' ? InteractionEventData :
  T extends 'environmental' ? EnvironmentalEventData :
  T extends 'sequence' ? SequenceEventData :
  never

/**
 * Hook for move event creation
 */
export const useMoveEventCreation = () => {
  return useEventTypeCreation('move')
}

/**
 * Hook for attack event creation
 */
export const useAttackEventCreation = () => {
  return useEventTypeCreation('attack')
}

/**
 * Hook for spell event creation
 */
export const useSpellEventCreation = () => {
  return useEventTypeCreation('spell')
}

/**
 * Hook for interaction event creation
 */
export const useInteractionEventCreation = () => {
  return useEventTypeCreation('interaction')
}

/**
 * Hook for environmental event creation
 */
export const useEnvironmentalEventCreation = () => {
  return useEventTypeCreation('environmental')
}

/**
 * Hook for sequence event creation
 */
export const useSequenceEventCreation = () => {
  return useEventTypeCreation('sequence')
}