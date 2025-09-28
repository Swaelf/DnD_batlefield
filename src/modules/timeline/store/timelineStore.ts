/**
 * Timeline Store
 * Modern Zustand store for timeline state management
 */

import { produce } from 'immer'
import { createStore } from '@/core/state'
import type {
  Timeline,
  Round,
  RoundEvent,
  TimelineId,
  RoundId,
  EventId,
  TimelinePlaybackState,
  CreateTimelineData,
  CreateRoundData
} from '../types'
import { TimelineService, EventService, type CreateEventData } from '../services'

/**
 * Timeline store state
 */
type TimelineState = {
  // Core data
  timelines: Timeline[]
  activeTimelineId: TimelineId | null

  // Playback state
  playback: TimelinePlaybackState

  // UI state
  selectedEventIds: EventId[]
  isCreatingEvent: boolean
  eventCreationData: Partial<CreateEventData> | null

  // Services (injected for testability)
  timelineService: TimelineService
  eventService: EventService
}

/**
 * Timeline store actions
 */
type TimelineActions = {
  // Timeline management
  createTimeline: (data: CreateTimelineData) => TimelineId
  setActiveTimeline: (id: TimelineId | null) => void
  updateTimeline: (id: TimelineId, updates: Partial<Timeline>) => void
  deleteTimeline: (id: TimelineId) => void

  // Combat control
  startCombat: () => void
  endCombat: () => void

  // Round management
  addRound: (data?: Partial<CreateRoundData>) => RoundId
  removeRound: (roundId: RoundId) => void
  nextRound: () => Promise<void>
  previousRound: () => void
  goToRound: (roundNumber: number) => void

  // Event management
  addEvent: (roundId: RoundId, eventData: CreateEventData) => EventId
  updateEvent: (eventId: EventId, updates: Partial<RoundEvent>) => void
  removeEvent: (eventId: EventId) => void
  duplicateEvent: (eventId: EventId) => EventId
  moveEvent: (eventId: EventId, targetRoundId: RoundId, newOrder?: number) => void

  // Event execution
  executeEvent: (eventId: EventId) => Promise<void>
  executeRound: (roundId: RoundId) => Promise<void>

  // Selection management
  selectEvent: (eventId: EventId) => void
  selectMultipleEvents: (eventIds: EventId[]) => void
  clearSelection: () => void
  toggleEventSelection: (eventId: EventId) => void

  // Playback control
  setPlaybackSpeed: (speed: number) => void
  setAutoAdvanceRounds: (enabled: boolean) => void
  togglePlayback: () => void

  // Event creation workflow
  startEventCreation: (data: Partial<CreateEventData>) => void
  updateEventCreation: (updates: Partial<CreateEventData>) => void
  finishEventCreation: (roundId: RoundId) => EventId | null
  cancelEventCreation: () => void

  // Bulk operations
  clearAllEvents: (roundId: RoundId) => void
  duplicateRound: (roundId: RoundId) => RoundId

  // Utility actions
  getActiveTimeline: () => Timeline | null
  getCurrentRound: () => Round | null
  getSelectedEvents: () => RoundEvent[]
  getEventById: (eventId: EventId) => RoundEvent | null
  getRoundById: (roundId: RoundId) => Round | null
}

/**
 * Timeline store with actions
 */
type TimelineStore = TimelineState & TimelineActions

/**
 * Create timeline store instance
 */
export const useTimelineStore = createStore<TimelineStore>(
  (set, get) => ({
    // Initial state
    timelines: [],
    activeTimelineId: null,
    playback: {
      isPlaying: false,
      currentRound: 1,
      currentEventIndex: 0,
      playbackSpeed: 1.0,
      autoAdvanceRounds: true
    },
    selectedEventIds: [],
    isCreatingEvent: false,
    eventCreationData: null,
    timelineService: new TimelineService(),
    eventService: new EventService(),

    // Timeline management actions
    createTimeline: (data: CreateTimelineData) => {
      const { timelineService } = get()
      const timeline = timelineService.createTimeline(data)

      set(produce((state: TimelineState) => {
        state.timelines.push(timeline)
        state.activeTimelineId = timeline.id
      }))

      return timeline.id
    },

    setActiveTimeline: (id: TimelineId | null) => {
      set(produce((state: TimelineState) => {
        state.activeTimelineId = id
        state.selectedEventIds = []
        state.isCreatingEvent = false
        state.eventCreationData = null

        // Reset playback state
        state.playback = {
          ...state.playback,
          isPlaying: false,
          currentRound: 1,
          currentEventIndex: 0
        }
      }))
    },

    updateTimeline: (id: TimelineId, updates: Partial<Timeline>) => {
      set(produce((state: TimelineState) => {
        const timelineIndex = state.timelines.findIndex(t => t.id === id)
        if (timelineIndex !== -1) {
          Object.assign(state.timelines[timelineIndex], updates, {
            updatedAt: new Date()
          })
        }
      }))
    },

    deleteTimeline: (id: TimelineId) => {
      set(produce((state: TimelineState) => {
        state.timelines = state.timelines.filter(t => t.id !== id)
        if (state.activeTimelineId === id) {
          state.activeTimelineId = null
        }
      }))
    },

    // Combat control actions
    startCombat: () => {
      const { activeTimelineId, timelineService } = get()
      if (!activeTimelineId) return

      set(produce((state: TimelineState) => {
        const timeline = state.timelines.find(t => t.id === activeTimelineId)
        if (timeline) {
          const updatedTimeline = timelineService.startCombat(timeline)
          const index = state.timelines.findIndex(t => t.id === activeTimelineId)
          state.timelines[index] = updatedTimeline
          state.playback = {
            ...state.playback,
            isPlaying: false
          }
        }
      }))
    },

    endCombat: () => {
      const { activeTimelineId, timelineService } = get()
      if (!activeTimelineId) return

      set(produce((state: TimelineState) => {
        const timeline = state.timelines.find(t => t.id === activeTimelineId)
        if (timeline) {
          const updatedTimeline = timelineService.endCombat(timeline)
          const index = state.timelines.findIndex(t => t.id === activeTimelineId)
          state.timelines[index] = updatedTimeline
          state.playback = {
            ...state.playback,
            isPlaying: false
          }
        }
      }))
    },

    // Round management actions
    addRound: (data = {}) => {
      const { activeTimelineId, timelineService } = get()
      if (!activeTimelineId) throw new Error('No active timeline')

      let newRoundId: RoundId

      set(produce((state: TimelineState) => {
        const timeline = state.timelines.find(t => t.id === activeTimelineId)
        if (timeline) {
          const createData: CreateRoundData = {
            timelineId: activeTimelineId,
            ...data
          }
          const { timeline: updatedTimeline, round } = timelineService.addRound(timeline, createData)
          const index = state.timelines.findIndex(t => t.id === activeTimelineId)
          state.timelines[index] = updatedTimeline
          newRoundId = round.id
        }
      }))

      return newRoundId!
    },

    removeRound: (roundId: RoundId) => {
      const { activeTimelineId, timelineService } = get()
      if (!activeTimelineId) return

      set(produce((state: TimelineState) => {
        const timeline = state.timelines.find(t => t.id === activeTimelineId)
        if (timeline) {
          const updatedTimeline = timelineService.removeRound(timeline, roundId)
          const index = state.timelines.findIndex(t => t.id === activeTimelineId)
          state.timelines[index] = updatedTimeline

          // Clear selection if selected events were in removed round
          state.selectedEventIds = state.selectedEventIds.filter(eventId => {
            const event = get().getEventById(eventId)
            return event?.roundId !== roundId
          })
        }
      }))
    },

    nextRound: async () => {
      const { activeTimelineId, timelineService } = get()
      if (!activeTimelineId) return

      const timeline = get().timelines.find(t => t.id === activeTimelineId)
      if (!timeline) return

      try {
        const updatedTimeline = await timelineService.nextRound(timeline)

        set(produce((state: TimelineState) => {
          const index = state.timelines.findIndex(t => t.id === activeTimelineId)
          state.timelines[index] = updatedTimeline
          state.playback = {
            ...state.playback,
            currentRound: updatedTimeline.currentRound,
            currentEventIndex: 0
          }
        }))
      } catch (error) {
        console.error('Failed to advance to next round:', error)
      }
    },

    previousRound: () => {
      const { activeTimelineId, timelineService } = get()
      if (!activeTimelineId) return

      set(produce((state: TimelineState) => {
        const timeline = state.timelines.find(t => t.id === activeTimelineId)
        if (timeline) {
          const updatedTimeline = timelineService.previousRound(timeline)
          const index = state.timelines.findIndex(t => t.id === activeTimelineId)
          state.timelines[index] = updatedTimeline
          state.playback = {
            ...state.playback,
            currentRound: updatedTimeline.currentRound,
            currentEventIndex: 0
          }
        }
      }))
    },

    goToRound: (roundNumber: number) => {
      const { activeTimelineId, timelineService } = get()
      if (!activeTimelineId) return

      set(produce((state: TimelineState) => {
        const timeline = state.timelines.find(t => t.id === activeTimelineId)
        if (timeline) {
          const updatedTimeline = timelineService.goToRound(timeline, roundNumber)
          const index = state.timelines.findIndex(t => t.id === activeTimelineId)
          state.timelines[index] = updatedTimeline
          state.playback = {
            ...state.playback,
            currentRound: roundNumber,
            currentEventIndex: 0
          }
        }
      }))
    },

    // Event management actions
    addEvent: (roundId: RoundId, eventData: CreateEventData) => {
      const { activeTimelineId, eventService, timelineService } = get()
      if (!activeTimelineId) throw new Error('No active timeline')

      const event = eventService.createEvent(roundId, eventData)
      let eventId: EventId

      set(produce((state: TimelineState) => {
        const timeline = state.timelines.find(t => t.id === activeTimelineId)
        if (timeline) {
          const updatedTimeline = timelineService.addEvent(timeline, roundId, event)
          const index = state.timelines.findIndex(t => t.id === activeTimelineId)
          state.timelines[index] = updatedTimeline
          eventId = event.id
        }
      }))

      return eventId!
    },

    updateEvent: (eventId: EventId, updates: Partial<RoundEvent>) => {
      const { activeTimelineId, timelineService } = get()
      if (!activeTimelineId) return

      set(produce((state: TimelineState) => {
        const timeline = state.timelines.find(t => t.id === activeTimelineId)
        if (timeline) {
          const updatedTimeline = timelineService.updateEvent(timeline, eventId, updates)
          const index = state.timelines.findIndex(t => t.id === activeTimelineId)
          state.timelines[index] = updatedTimeline
        }
      }))
    },

    removeEvent: (eventId: EventId) => {
      const { activeTimelineId, timelineService } = get()
      if (!activeTimelineId) return

      set(produce((state: TimelineState) => {
        const timeline = state.timelines.find(t => t.id === activeTimelineId)
        if (timeline) {
          const updatedTimeline = timelineService.removeEvent(timeline, eventId)
          const index = state.timelines.findIndex(t => t.id === activeTimelineId)
          state.timelines[index] = updatedTimeline

          // Remove from selection
          state.selectedEventIds = state.selectedEventIds.filter(id => id !== eventId)
        }
      }))
    },

    duplicateEvent: (eventId: EventId) => {
      const event = get().getEventById(eventId)
      if (!event) throw new Error('Event not found')

      const eventData: CreateEventData = {
        name: `${event.name} (Copy)`,
        type: event.type,
        order: event.order + 1,
        data: event.data,
        duration: event.duration,
        canSkip: event.canSkip
      }

      return get().addEvent(event.roundId, eventData)
    },

    moveEvent: (eventId: EventId, targetRoundId: RoundId, newOrder?: number) => {
      const event = get().getEventById(eventId)
      if (!event) return

      // Remove from current location
      get().removeEvent(eventId)

      // Add to new location
      const eventData: CreateEventData = {
        name: event.name,
        type: event.type,
        order: newOrder ?? event.order,
        data: event.data,
        duration: event.duration,
        canSkip: event.canSkip
      }

      return get().addEvent(targetRoundId, eventData)
    },

    // Event execution actions
    executeEvent: async (eventId: EventId) => {
      const { activeTimelineId, timelineService } = get()
      if (!activeTimelineId) return

      const timeline = get().timelines.find(t => t.id === activeTimelineId)
      if (!timeline) return

      try {
        const { timeline: updatedTimeline } = await timelineService.executeEvent(timeline, eventId)

        set(produce((state: TimelineState) => {
          const index = state.timelines.findIndex(t => t.id === activeTimelineId)
          state.timelines[index] = updatedTimeline
        }))
      } catch (error) {
        console.error('Failed to execute event:', error)
      }
    },

    executeRound: async (roundId: RoundId) => {
      const { activeTimelineId, timelineService } = get()
      if (!activeTimelineId) return

      set(produce((state: TimelineState) => {
        const timeline = state.timelines.find(t => t.id === activeTimelineId)
        if (timeline) {
          const updatedTimeline = timelineService.executeRound(timeline, roundId)
          const index = state.timelines.findIndex(t => t.id === activeTimelineId)
          state.timelines[index] = updatedTimeline
        }
      }))
    },

    // Selection actions
    selectEvent: (eventId: EventId) => {
      set(produce((state: TimelineState) => {
        state.selectedEventIds = [eventId]
      }))
    },

    selectMultipleEvents: (eventIds: EventId[]) => {
      set(produce((state: TimelineState) => {
        state.selectedEventIds = [...eventIds]
      }))
    },

    clearSelection: () => {
      set(produce((state: TimelineState) => {
        state.selectedEventIds = []
      }))
    },

    toggleEventSelection: (eventId: EventId) => {
      set(produce((state: TimelineState) => {
        const index = state.selectedEventIds.indexOf(eventId)
        if (index === -1) {
          state.selectedEventIds.push(eventId)
        } else {
          state.selectedEventIds.splice(index, 1)
        }
      }))
    },

    // Playback actions
    setPlaybackSpeed: (speed: number) => {
      set(produce((state: TimelineState) => {
        state.playback = { ...state.playback, playbackSpeed: Math.max(0.25, Math.min(4.0, speed)) }
      }))
    },

    setAutoAdvanceRounds: (enabled: boolean) => {
      set(produce((state: TimelineState) => {
        state.playback = { ...state.playback, autoAdvanceRounds: enabled }
      }))
    },

    togglePlayback: () => {
      set(produce((state: TimelineState) => {
        state.playback = { ...state.playback, isPlaying: !state.playback.isPlaying }
      }))
    },

    // Event creation workflow
    startEventCreation: (data: Partial<CreateEventData>) => {
      set(produce((state: TimelineState) => {
        state.isCreatingEvent = true
        state.eventCreationData = data
      }))
    },

    updateEventCreation: (updates: Partial<CreateEventData>) => {
      set(produce((state: TimelineState) => {
        if (state.eventCreationData) {
          Object.assign(state.eventCreationData, updates)
        }
      }))
    },

    finishEventCreation: (roundId: RoundId) => {
      const { eventCreationData } = get()
      if (!eventCreationData?.name || !eventCreationData?.type || !eventCreationData?.data) {
        return null
      }

      const eventData: CreateEventData = eventCreationData as CreateEventData
      const eventId = get().addEvent(roundId, eventData)

      set(produce((state: TimelineState) => {
        state.isCreatingEvent = false
        state.eventCreationData = null
      }))

      return eventId
    },

    cancelEventCreation: () => {
      set(produce((state: TimelineState) => {
        state.isCreatingEvent = false
        state.eventCreationData = null
      }))
    },

    // Bulk operations
    clearAllEvents: (roundId: RoundId) => {
      const round = get().getRoundById(roundId)
      if (!round) return

      for (const event of round.events) {
        get().removeEvent(event.id)
      }
    },

    duplicateRound: (roundId: RoundId) => {
      const round = get().getRoundById(roundId)
      if (!round) throw new Error('Round not found')

      const newRoundId = get().addRound({
        roundNumber: round.roundNumber + 1
      })

      // Copy all events
      for (const event of round.events) {
        const eventData: CreateEventData = {
          name: event.name,
          type: event.type,
          order: event.order,
          data: event.data,
          duration: event.duration,
          canSkip: event.canSkip
        }
        get().addEvent(newRoundId, eventData)
      }

      return newRoundId
    },

    // Utility getters
    getActiveTimeline: () => {
      const { activeTimelineId, timelines } = get()
      return activeTimelineId ? timelines.find(t => t.id === activeTimelineId) || null : null
    },

    getCurrentRound: () => {
      const timeline = get().getActiveTimeline()
      return timeline ? timeline.rounds.find(r => r.roundNumber === timeline.currentRound) || null : null
    },

    getSelectedEvents: () => {
      const { selectedEventIds } = get()
      return selectedEventIds.map(id => get().getEventById(id)).filter(Boolean) as RoundEvent[]
    },

    getEventById: (eventId: EventId) => {
      const { timelines } = get()
      for (const timeline of timelines) {
        for (const round of timeline.rounds) {
          const event = round.events.find(e => e.id === eventId)
          if (event) return event
        }
      }
      return null
    },

    getRoundById: (roundId: RoundId) => {
      const { timelines } = get()
      for (const timeline of timelines) {
        const round = timeline.rounds.find(r => r.id === roundId)
        if (round) return round
      }
      return null
    }
  })
)