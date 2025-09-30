import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { AnimationStore } from '../types'
import type { Position } from '../types'

const useAnimationStore = create<AnimationStore>()(
  immer((set) => ({
    activePaths: [],
    isPaused: false, // Add pause state for performance optimization

    startAnimation: (tokenId: string, from: Position, to: Position) => set((state) => {
      // Remove any existing path for this token
      state.activePaths = state.activePaths.filter(p => p.tokenId !== tokenId)

      // Add new path
      state.activePaths.push({
        tokenId,
        from,
        to,
        progress: 0,
        isAnimating: true
      })
    }),

    updateProgress: (tokenId: string, progress: number) => set((state) => {
      const path = state.activePaths.find(p => p.tokenId === tokenId)
      if (path) {
        path.progress = progress
      }
    }),

    endAnimation: (tokenId: string) => set((state) => {
      state.activePaths = state.activePaths.filter(p => p.tokenId !== tokenId)
    }),

    clearAllPaths: () => set((state) => {
      state.activePaths = []
    }),

    pauseAnimations: () => set((state) => {
      state.isPaused = true
    }),

    resumeAnimations: () => set((state) => {
      state.isPaused = false
    })
  }))
)

export default useAnimationStore