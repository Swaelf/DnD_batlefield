import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { MapStore } from '../types'
import { MapObject } from '../types'

const useMapStore = create<MapStore>()(
  immer((set) => ({
    currentMap: null,
    selectedObjects: [],
    mapVersion: 0,

    createNewMap: (name) => set((state) => {
      const mapId = crypto.randomUUID()

      // Create void token for environmental spells
      const voidToken = {
        id: 'void-token',
        type: 'token' as const,
        name: 'Environment',
        position: { x: 960, y: 540 }, // Center of default map
        rotation: 0,
        layer: -999, // Always below everything
        size: 'medium' as const,
        color: 'transparent',
        shape: 'circle' as const,
        opacity: 0,
        isVoid: true,
        visible: false,
        locked: true,
        allowedEvents: ['spell'] as const,
        showLabel: false
      }

      state.currentMap = {
        id: mapId,
        name,
        width: 1920,
        height: 1080,
        grid: {
          size: 50,
          type: 'square',
          visible: true,
          snap: true,
          color: '#cccccc'
        },
        objects: [voidToken]
      }
    }),

    loadMap: (map) => set((state) => {
      // Check if void token exists, if not, add it
      const hasVoidToken = map.objects.some(obj => obj.id === 'void-token')
      if (!hasVoidToken) {
        const voidToken = {
          id: 'void-token',
          type: 'token' as const,
          name: 'Environment',
          position: { x: map.width / 2, y: map.height / 2 }, // Center of map
          rotation: 0,
          layer: -999,
          size: 'medium' as const,
          color: 'transparent',
          shape: 'circle' as const,
          opacity: 0,
          isVoid: true,
          visible: false,
          locked: true,
          allowedEvents: ['spell'] as const,
          showLabel: false
        }
        map.objects.unshift(voidToken) // Add at beginning of array
      }

      state.currentMap = map
      state.selectedObjects = []
    }),

    addObject: (object) => set((state) => {
      if (state.currentMap) {
        state.currentMap.objects.push(object)
      }
    }),

    addSpellEffect: (spell) => set((state) => {
      if (state.currentMap) {
        // Add spell with round tracking
        const spellObject: MapObject = {
          ...spell,
          type: 'spell' as const,
          isSpellEffect: true,
          layer: 10 // Spells render on top
        }
        state.currentMap.objects.push(spellObject)
        // Force re-render
        state.mapVersion += 1

      }
    }),

    selectObject: (id) => set((state) => {
      state.selectedObjects = [id]
    }),

    selectMultiple: (ids) => set((state) => {
      state.selectedObjects = ids
    }),

    clearSelection: () => set((state) => {
      state.selectedObjects = []
    }),

    deleteSelected: () => set((state) => {
      if (state.currentMap) {
        state.currentMap.objects = state.currentMap.objects.filter(
          obj => !state.selectedObjects.includes(obj.id)
        )
        state.selectedObjects = []
      }
    }),

    deleteObject: (id) => set((state) => {
      if (state.currentMap) {
        state.currentMap.objects = state.currentMap.objects.filter(obj => obj.id !== id)
        state.selectedObjects = state.selectedObjects.filter(selectedId => selectedId !== id)
      }
    }),

    updateObjectPosition: (id, position) => set((state) => {
      if (state.currentMap) {
        const object = state.currentMap.objects.find(obj => obj.id === id)
        if (object) {
          object.position = position
          // Increment version to force re-render
          state.mapVersion += 1
        }
      }
    }),

    updateObject: (id, updates) => set((state) => {
      if (state.currentMap) {
        const objectIndex = state.currentMap.objects.findIndex(obj => obj.id === id)
        if (objectIndex !== -1) {
          Object.assign(state.currentMap.objects[objectIndex], updates)
        }
      }
    }),

    toggleGridSnap: () => set((state) => {
      if (state.currentMap) {
        state.currentMap.grid.snap = !state.currentMap.grid.snap
      }
    }),

    toggleGridVisibility: () => set((state) => {
      if (state.currentMap) {
        state.currentMap.grid.visible = !state.currentMap.grid.visible
      }
    }),

    updateGridSettings: (settings) => set((state) => {
      if (state.currentMap) {
        Object.assign(state.currentMap.grid, settings)
      }
    }),

    cleanupExpiredSpells: (currentRound) => set((state) => {
      if (state.currentMap) {
        state.currentMap.objects = state.currentMap.objects.filter(obj => {
          if (obj.isSpellEffect && obj.spellDuration !== undefined && obj.roundCreated !== undefined) {
            // Don't remove instant spells (duration 0) - they're handled by animation timeout
            if (obj.spellDuration === 0) {
              return true  // Keep instant spells, let animation handle removal
            }
            // Remove persistent spells that have expired
            const shouldKeep = currentRound < obj.roundCreated + obj.spellDuration
            if (!shouldKeep) {
            }
            return shouldKeep
          }
          return true
        })
      }
    }),
  }))
)

export default useMapStore