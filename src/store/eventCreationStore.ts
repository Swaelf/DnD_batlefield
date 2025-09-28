import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { EventCreationState } from '../types'
import type { Position } from '../types'
import useRoundStore from './roundStore'
import useMapStore from './mapStore'

// Helper function to calculate token's expected position after all pending events
const calculateTokenExpectedPosition = (tokenId: string, currentPreview?: { toPosition: Position | null, selectedTokenId: string | null, selectedSpell: any }): Position | null => {
  const currentMap = useMapStore.getState().currentMap
  const token = currentMap?.objects.find((obj: any) => obj.id === tokenId)
  if (!token) {
    return null
  }

  const roundStore = useRoundStore.getState()

  console.log('🧮 calculateTokenExpectedPosition DEBUG:', {
    tokenId,
    tokenCurrentPosition: token.position,
    isInCombat: roundStore.isInCombat,
    hasTimeline: !!roundStore.timeline,
    currentRound: roundStore.currentRound
  })

  // Start with the token's current position
  let expectedPosition = token.position

  // First, apply any timeline events if we're in combat mode
  if (roundStore.isInCombat && roundStore.timeline) {
    const currentRound = roundStore.timeline.rounds.find(r => r.number === roundStore.currentRound)

    console.log('🧮 Looking for current round:', {
      requestedRound: roundStore.currentRound,
      foundRound: !!currentRound,
      totalRounds: roundStore.timeline.rounds.length,
      allRounds: roundStore.timeline.rounds.map(r => ({number: r.number, eventCount: r.events.length}))
    })

    if (currentRound) {
      // Find all movement events for this token in the current round
      const tokenMoveEvents = currentRound.events
        .filter(event => event.tokenId === tokenId && event.type === 'move' && !event.executed)
        .sort((a, b) => (a.order || 0) - (b.order || 0)) // Sort by execution order

      console.log('🧮 Found movement events:', {
        tokenId,
        totalEvents: currentRound.events.length,
        allEvents: currentRound.events.map(e => ({
          id: e.id,
          tokenId: e.tokenId,
          type: e.type,
          executed: e.executed,
          order: e.order
        })),
        tokenMoveEvents: tokenMoveEvents.map(e => ({
          id: e.id,
          type: e.type,
          executed: e.executed,
          order: e.order,
          fromPos: (e.data as any).fromPosition,
          toPos: (e.data as any).toPosition
        }))
      })

      // Apply timeline events
      if (tokenMoveEvents.length > 0) {
        const lastTimelineEvent = tokenMoveEvents[tokenMoveEvents.length - 1]
        expectedPosition = (lastTimelineEvent.data as any).toPosition || expectedPosition
        console.log('🧮 Applied timeline events, new position:', expectedPosition)
      } else {
        console.log('🧮 No timeline movement events found for token')
      }
    } else {
      console.log('🧮 Current round not found in timeline')
    }
  } else {
    console.log('🧮 Not in combat mode or no timeline')
  }

  // Finally, apply current preview state if it exists and matches this token
  if (currentPreview &&
      currentPreview.selectedTokenId === tokenId &&
      currentPreview.toPosition &&
      !currentPreview.selectedSpell) {
    expectedPosition = currentPreview.toPosition
    console.log('🧮 Applied current preview state, final position:', expectedPosition)
  }

  console.log('🧮 Final calculated expected position:', expectedPosition)
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
    selectedSpell: undefined,

    startEventCreation: (tokenId: string) => set((state) => {
      // If we're starting a new event for the same token and we have a previous destination,
      // use it as the starting point for the new movement (chained movements)
      const previousDestination = (state.selectedTokenId === tokenId && state.toPosition && !state.selectedSpell)
        ? state.toPosition
        : null

      console.log('🔗 startEventCreation CHAINING DEBUG:', {
        tokenId,
        currentState: {
          selectedTokenId: state.selectedTokenId,
          toPosition: state.toPosition,
          selectedSpell: !!state.selectedSpell
        },
        chaining: {
          sameToken: state.selectedTokenId === tokenId,
          hasToPosition: !!state.toPosition,
          noSpell: !state.selectedSpell,
          previousDestination,
          willChain: !!previousDestination
        }
      })

      // Set up new event creation state
      state.isCreatingEvent = true
      state.selectedTokenId = tokenId
      state.isPicking = null
      state.fromPosition = previousDestination // Use previous destination as new starting point
      state.toPosition = null
      state.pathPreview = []
      state.selectedSpell = undefined // ALWAYS clear spell

      console.log('🔗 startEventCreation RESULT:', {
        tokenId,
        resultingState: {
          fromPosition: state.fromPosition,
          toPosition: state.toPosition,
          selectedSpell: state.selectedSpell
        }
      })
    }),

    cancelEventCreation: () => set((state) => {
      state.isCreatingEvent = false
      state.isPicking = null
      state.selectedTokenId = null
      state.fromPosition = null
      state.toPosition = null
      state.pathPreview = []
      state.selectedSpell = undefined
    }),

    startPickingPosition: (type: 'from' | 'to') => set((state) => {
      state.isPicking = type
    }),

    startPickingToken: () => set((state) => {
      state.isPicking = 'token'
    }),

    setSelectedToken: (tokenId: string) => set((state) => {
      state.selectedTokenId = tokenId
      state.isPicking = null
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
    }),

    setSelectedSpell: (spell) => set((state) => {
      state.selectedSpell = spell
      // When a spell is selected, set the from position to the caster's expected position
      if (spell && state.selectedTokenId) {
        const expectedPosition = calculateTokenExpectedPosition(state.selectedTokenId)
        if (expectedPosition) {
          state.fromPosition = expectedPosition
        }
      }
    }),

    clearSpellSelection: () => set((state) => {
      state.selectedSpell = undefined
    }),

    getTokenExpectedPosition: (tokenId?: string | null) => {
      const state = get()
      const id = tokenId || state.selectedTokenId
      if (!id) return null

      // Get the expected position considering both timeline events and current preview
      // But we need to be careful about which preview to consider - only apply preview
      // for OTHER tokens, not the token we're currently calculating for (avoid circular logic)
      const currentPreview = state.selectedTokenId !== id
        ? { toPosition: state.toPosition, selectedTokenId: state.selectedTokenId, selectedSpell: state.selectedSpell }
        : undefined

      console.log('🔄 getTokenExpectedPosition:', {
        requestedTokenId: id,
        currentlySelectedTokenId: state.selectedTokenId,
        willUsePreview: !!currentPreview,
        previewToPosition: currentPreview?.toPosition
      })

      const expectedPosition = calculateTokenExpectedPosition(id, currentPreview)

      return expectedPosition
    },
  }))
)

export default useEventCreationStore