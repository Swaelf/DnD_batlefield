import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { EventCreationState, Position, ToolType } from '../types'
import { isMoveAction } from '../types'
import useTimelineStore from './timelineStore'
import useMapStore from './mapStore'
import useToolStore from './toolStore'

// Helper function to calculate token's expected position after all pending events
const calculateTokenExpectedPosition = (tokenId: string, currentPreview?: { toPosition: Position | null, selectedTokenId: string | null }): Position | null => {
  const currentMap = useMapStore.getState().currentMap
  const token = currentMap?.objects.find((obj: any) => obj.id === tokenId)
  if (!token) {
    return null
  }

  const roundStore = useTimelineStore.getState()

  // Start with the token's current position
  let expectedPosition = token.position

  // First, apply any timeline events if we're in combat mode
  if (roundStore.isInCombat && roundStore.timeline) {
    const currentRoundData = roundStore.timeline.rounds.find(r => r.number === roundStore.currentRound)
    const currentEventData = currentRoundData?.events.find(e => e.number === roundStore.currentEvent)

    if (currentEventData) {
      // Find all movement actions for this token in the current event
      const tokenMoveEvents = currentEventData.actions
        .filter((event: any) => event.tokenId === tokenId && event.type === 'move' && !event.executed)
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0)) // Sort by execution order

      // Apply timeline events
      if (tokenMoveEvents.length > 0) {
        const lastTimelineEvent = tokenMoveEvents[tokenMoveEvents.length - 1]
        if (isMoveAction(lastTimelineEvent)) {
          expectedPosition = lastTimelineEvent.data.toPosition || expectedPosition
        }
      }
    }
  }

  // Finally, apply current preview state if it exists and matches this token
  if (currentPreview &&
      currentPreview.selectedTokenId === tokenId &&
      currentPreview.toPosition) {
    expectedPosition = currentPreview.toPosition
  }

  return expectedPosition
}

const useEventCreationStore = create<EventCreationState>()(
  immer((set, get) => ({
    isCreatingEvent: false,
    isPicking: null,
    selectedTokenId: null,
    fromPosition: null,
    toPosition: null,
    pathPreview: [],
    savedToolMode: null,

    startEventCreation: (tokenId: string) => set((state) => {
      // Save current tool mode before switching to 'select'
      const currentTool = useToolStore.getState().currentTool
      // Don't save certain transient tools - default to select for better UX
      if (currentTool === 'measure' || currentTool === 'eraser' || currentTool === 'pan') {
        state.savedToolMode = 'select'
      } else {
        state.savedToolMode = currentTool
      }

      // Switch to select tool to avoid interference
      useToolStore.getState().setTool('select' as ToolType)

      // Clear drawing state and templates to prevent preview rendering
      useToolStore.getState().resetDrawingState()

      // If we're starting a new event for the same token and we have a previous destination,
      // use it as the starting point for the new movement (chained movements)
      const previousDestination = (state.selectedTokenId === tokenId && state.toPosition)
        ? state.toPosition
        : null

      // Set up new event creation state
      state.isCreatingEvent = true
      state.selectedTokenId = tokenId
      state.isPicking = null
      state.fromPosition = previousDestination // Use previous destination as new starting point
      state.toPosition = null
      state.pathPreview = []
    }),

    cancelEventCreation: () => set((state) => {
      // Restore saved tool mode
      if (state.savedToolMode) {
        // Ensure we restore a valid tool, defaulting to select if needed
        const toolToRestore = state.savedToolMode
        useToolStore.getState().setTool(toolToRestore as ToolType)
        state.savedToolMode = null
      } else {
        // If no saved tool mode, default to select
        useToolStore.getState().setTool('select' as ToolType)
      }

      // Clear all event creation state
      state.isCreatingEvent = false
      state.isPicking = null
      state.selectedTokenId = null
      state.fromPosition = null
      state.toPosition = null
      state.pathPreview = []

      // Also ensure measurement tool state is cleared if it was active
      const toolState = useToolStore.getState()
      if (toolState.measurementPoints.length > 0) {
        toolState.clearMeasurementPoints()
      }
    }),

    startPickingPosition: (type: 'from' | 'to') => set((state) => {
      // If not already in event creation mode, initialize it
      if (!state.isCreatingEvent) {
        const currentTool = useToolStore.getState().currentTool
        // Don't save certain transient tools - default to select for better UX
        if (currentTool === 'measure' || currentTool === 'eraser' || currentTool === 'pan') {
          state.savedToolMode = 'select'
        } else {
          state.savedToolMode = currentTool
        }
        useToolStore.getState().setTool('select' as ToolType)
        useToolStore.getState().resetDrawingState()
        state.isCreatingEvent = true
      }

      state.isPicking = type
    }),

    startPickingToken: () => set((state) => {
      // If not already in event creation mode, initialize it
      if (!state.isCreatingEvent) {
        const currentTool = useToolStore.getState().currentTool
        // Don't save certain transient tools - default to select for better UX
        if (currentTool === 'measure' || currentTool === 'eraser' || currentTool === 'pan') {
          state.savedToolMode = 'select'
        } else {
          state.savedToolMode = currentTool
        }
        useToolStore.getState().setTool('select' as ToolType)
        useToolStore.getState().resetDrawingState()
        state.isCreatingEvent = true
      }

      state.isPicking = 'token'
    }),

    setPickingMode: (mode: 'from' | 'to' | 'token' | 'targetToken' | null) => set((state) => {
      // If entering picking mode (not null) and not already in event creation, initialize it
      if (mode !== null && !state.isCreatingEvent) {
        const currentTool = useToolStore.getState().currentTool
        // Don't save certain transient tools - default to select for better UX
        if (currentTool === 'measure' || currentTool === 'eraser' || currentTool === 'pan') {
          state.savedToolMode = 'select'
        } else {
          state.savedToolMode = currentTool
        }
        useToolStore.getState().setTool('select' as ToolType)
        useToolStore.getState().resetDrawingState()
        state.isCreatingEvent = true
      }

      // If exiting picking mode (null), always restore tool and clean up
      // This ensures preview modes are restored even if modal is still open
      if (mode === null) {
        if (state.savedToolMode) {
          useToolStore.getState().setTool(state.savedToolMode as ToolType)
          state.savedToolMode = null
        }
        state.isCreatingEvent = false
      }

      state.isPicking = mode
    }),

    setSelectedToken: (tokenId: string) => set((state) => {
      state.selectedTokenId = tokenId
      // Don't clear isPicking here - let the UI components manage the picking state
    }),

    setPosition: (type: 'from' | 'to', position: Position) => set((state) => {
      if (type === 'from') {
        state.fromPosition = position
      } else {
        state.toPosition = position
      }

      // Update path preview
      if (state.fromPosition && state.toPosition) {
        state.pathPreview = [state.fromPosition, state.toPosition]
      }
    }),

    setPathPreview: (path: Position[]) => set((state) => {
      state.pathPreview = path
    }),

    completePositionPicking: () => set((state) => {
      state.isPicking = null

      // If we're done picking and not in the middle of creating an event,
      // restore the previous tool mode and clean up
      if (!state.selectedTokenId && !state.fromPosition && !state.toPosition) {
        if (state.savedToolMode) {
          useToolStore.getState().setTool(state.savedToolMode as ToolType)
        }
        state.isCreatingEvent = false
        state.savedToolMode = null
      }
    }),

    exitPickingMode: () => set((state) => {
      // Only exit picking mode, keep event creation active
      // This is used when user presses Escape to return to modal
      state.isPicking = null
      // Don't clear isCreatingEvent so modal stays active
      // Don't restore tool mode yet - we're still in event creation
    }),


    getTokenExpectedPosition: (tokenId?: string | null) => {
      const state = get()
      const id = tokenId || state.selectedTokenId
      if (!id) return null

      // Get the expected position considering both timeline events and current preview
      // But we need to be careful about which preview to consider - only apply preview
      // for OTHER tokens, not the token we're currently calculating for (avoid circular logic)
      const currentPreview = state.selectedTokenId !== id
        ? { toPosition: state.toPosition, selectedTokenId: state.selectedTokenId }
        : undefined

      const expectedPosition = calculateTokenExpectedPosition(id, currentPreview)

      return expectedPosition
    },
  }))
)

export default useEventCreationStore