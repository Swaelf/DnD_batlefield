import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { RoundStore } from '../types'
import { RoundEvent } from '../types'
import useMapStore from './mapStore'

const useRoundStore = create<RoundStore>()(
  immer((set, get) => ({
    timeline: null,
    currentRound: 1,
    isInCombat: false,
    animationSpeed: 1,

    startCombat: (mapId) => set((state) => {
      state.isInCombat = true
      state.currentRound = 1

      if (!state.timeline) {
        state.timeline = {
          id: crypto.randomUUID(),
          mapId,
          rounds: [{
            id: crypto.randomUUID(),
            number: 1,
            timestamp: Date.now(),
            events: [],
            executed: false
          }],
          currentRound: 1,
          isActive: true,
          history: []
        }
      } else {
        state.timeline.isActive = true
      }
    }),

    endCombat: () => set((state) => {
      state.isInCombat = false
      if (state.timeline) {
        state.timeline.isActive = false
        // Move all rounds to history
        state.timeline.history.push(...state.timeline.rounds)
        state.timeline.rounds = []
      }
    }),

    nextRound: async () => {
      const { timeline, currentRound } = get()
      if (!timeline || !timeline.isActive) return

      // First increment the round
      set((state) => {
        state.currentRound = currentRound + 1

        // Create new round if it doesn't exist
        const nextRoundExists = state.timeline!.rounds.find(r => r.number === state.currentRound)
        if (!nextRoundExists) {
          state.timeline!.rounds.push({
            id: crypto.randomUUID(),
            number: state.currentRound,
            timestamp: Date.now(),
            events: [],
            executed: false
          })
        }

        state.timeline!.currentRound = state.currentRound
      })

      // Clean up expired spell effects when advancing rounds
      // This removes persistent areas that have expired based on their duration
      const newRound = get().currentRound
      useMapStore.getState().cleanupExpiredSpells(newRound)

      // The animation hook will handle executing events when it detects the round change
    },

    previousRound: () => {
      set((state) => {
        if (state.currentRound > 1) {
          state.currentRound -= 1
          if (state.timeline) {
            state.timeline.currentRound = state.currentRound
          }
        }
      })

      // Clean up spell effects when navigating to previous round
      const newRound = get().currentRound
      useMapStore.getState().cleanupExpiredSpells(newRound)
    },

    goToRound: (roundNumber) => {
      set((state) => {
        state.currentRound = roundNumber
        if (state.timeline) {
          state.timeline.currentRound = roundNumber

          // Ensure the round exists
          const roundExists = state.timeline.rounds.find(r => r.number === roundNumber)
          if (!roundExists) {
            state.timeline.rounds.push({
              id: crypto.randomUUID(),
              number: roundNumber,
              timestamp: Date.now(),
              events: [],
              executed: false
            })
            // Sort rounds by number
            state.timeline.rounds.sort((a, b) => a.number - b.number)
          }
        }
      })

      // Clean up spell effects when jumping to a specific round
      useMapStore.getState().cleanupExpiredSpells(roundNumber)
    },

    addEvent: (tokenId, type, data, roundNumber) => set((state) => {
      if (!state.timeline) return

      const targetRound = roundNumber || state.currentRound
      let round = state.timeline.rounds.find(r => r.number === targetRound)

      if (!round) {
        // Create the round if it doesn't exist
        round = {
          id: crypto.randomUUID(),
          number: targetRound,
          timestamp: Date.now(),
          events: [],
          executed: false
        }
        state.timeline.rounds.push(round)
        state.timeline.rounds.sort((a, b) => a.number - b.number)
      }

      const newEvent: RoundEvent = {
        id: crypto.randomUUID(),
        roundNumber: targetRound,
        tokenId,
        type,
        data,
        executed: false,
        order: round.events.length
      }

      const roundIndex = state.timeline.rounds.findIndex(r => r.number === targetRound)
      if (roundIndex !== -1) {
        state.timeline.rounds[roundIndex].events.push(newEvent)
      }
    }),

    updateEvent: (eventId, updates) => set((state) => {
      if (!state.timeline) return

      for (const round of state.timeline.rounds) {
        const eventIndex = round.events.findIndex(e => e.id === eventId)
        if (eventIndex !== -1) {
          Object.assign(round.events[eventIndex], updates)
          break
        }
      }
    }),

    removeEvent: (eventId) => set((state) => {
      if (!state.timeline) return

      for (const round of state.timeline.rounds) {
        const eventIndex = round.events.findIndex(e => e.id === eventId)
        if (eventIndex !== -1) {
          round.events.splice(eventIndex, 1)
          break
        }
      }
    }),

    executeRoundEvents: async (roundNumber) => {
      const { timeline } = get()
      if (!timeline) return

      const round = timeline.rounds.find(r => r.number === roundNumber)
      if (!round || round.executed) return

      // Execute each event by adding it to the map for animation
      for (const event of round.events) {
        // Get mapStore methods - we'll need to import this properly
        const mapStore = (await import('./mapStore')).default.getState()

        switch (event.type) {
          case 'spell':
            // Create proper MapObject for spell
            const spellData = event.data as any
            const spellObject = {
              id: `spell-${Date.now()}-${Math.random()}`,
              type: 'spell' as const,
              position: spellData.fromPosition || { x: 0, y: 0 },
              rotation: 0,
              layer: 10,
              spellData: spellData
            }
            mapStore.addSpellEffect(spellObject)
            break
          case 'attack':
            mapStore.addAttackEffect(event.data as any)
            break
          // Add other event types here as needed
        }
      }

      // Mark events as being executed
      set((state) => {
        const roundIndex = state.timeline!.rounds.findIndex(r => r.number === roundNumber)
        if (roundIndex !== -1) {
          // Mark each event as executed
          state.timeline!.rounds[roundIndex].events.forEach(event => {
            event.executed = true
          })
          state.timeline!.rounds[roundIndex].executed = true
        }
      })

      // Return a promise that resolves when animations complete
      return new Promise((resolve) => {
        // Animation duration calculation
        const maxDuration = round.events.reduce((max, event) => {
          const duration = 'duration' in event.data ? (event.data.duration || 1000) : 1000
          return Math.max(max, duration)
        }, 0)

        setTimeout(resolve, maxDuration / get().animationSpeed)
      })
    },

    previewEvent: (event) => {
      // This will trigger a preview animation
      // Implementation will be in the Canvas component
      // Preview event implementation will be in the Canvas component
    },

    setAnimationSpeed: (speed) => set((state) => {
      state.animationSpeed = Math.max(0.1, Math.min(5, speed))
    }),

    clearTimeline: () => set((state) => {
      state.timeline = null
      state.currentRound = 1
      state.isInCombat = false
    })
  }))
)

export default useRoundStore