import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { immer } from 'zustand/middleware/immer'
import type { BattleLogStore } from '../types/stores'
import type { BattleLogEntry, BattleLogFilter } from '../types/timeline'

const useBattleLogStore = create<BattleLogStore>()(
  immer((set, get) => ({
    // State
    entries: [],

    // Actions
    addEntry: (entryData) => {
      const entry: BattleLogEntry = {
        ...entryData,
        id: uuidv4(),
        timestamp: Date.now()
      }

      set((state) => {
        state.entries.push(entry)
      })

      console.log('[BattleLog]', entry.message)
    },

    clearRound: (roundNumber) => {
      set((state) => {
        state.entries = state.entries.filter(
          (entry) => entry.roundNumber !== roundNumber
        )
      })
    },

    clearAll: () => {
      set((state) => {
        state.entries = []
      })
    },

    // Queries
    getEntriesForRound: (roundNumber) => {
      return get().entries.filter((entry) => entry.roundNumber === roundNumber)
    },

    getEntriesForEvent: (roundNumber, eventNumber) => {
      return get().entries.filter(
        (entry) =>
          entry.roundNumber === roundNumber && entry.eventNumber === eventNumber
      )
    },

    filterEntries: (filter: BattleLogFilter) => {
      return get().entries.filter((entry) => {
        if (filter.roundNumber !== undefined && entry.roundNumber !== filter.roundNumber) {
          return false
        }
        if (filter.eventNumber !== undefined && entry.eventNumber !== filter.eventNumber) {
          return false
        }
        if (filter.type !== undefined && entry.type !== filter.type) {
          return false
        }
        if (filter.tokenId !== undefined && entry.tokenId !== filter.tokenId) {
          return false
        }
        return true
      })
    }
  }))
)

export default useBattleLogStore
