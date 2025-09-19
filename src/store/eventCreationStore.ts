import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { EventCreationState } from '../types'
import { Position } from '../types'

const useEventCreationStore = create<EventCreationState>()(
  immer((set) => ({
    isCreatingEvent: false,
    isPicking: null,
    selectedTokenId: null,
    fromPosition: null,
    toPosition: null,
    pathPreview: [],

    startEventCreation: (tokenId: string) => set((state) => {
      state.isCreatingEvent = true
      state.selectedTokenId = tokenId
      state.isPicking = null
      state.fromPosition = null
      state.toPosition = null
      state.pathPreview = []
    }),

    cancelEventCreation: () => set((state) => {
      state.isCreatingEvent = false
      state.isPicking = null
      state.selectedTokenId = null
      state.fromPosition = null
      state.toPosition = null
      state.pathPreview = []
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
  }))
)

export default useEventCreationStore