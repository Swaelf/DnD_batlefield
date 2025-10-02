import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { MapStore } from '../types'
import type { MapObject, SpellMapObject, AttackEventData } from '../types'
import { useHistoryStore } from './historyStore'
import { useLayerStore } from './layerStore'

// Helper function to save current state to history before modifications
const saveToHistory = () => {
  const currentMap = useMapStore.getState().currentMap
  if (currentMap) {
    const historyStore = useHistoryStore.getState()
    historyStore.pushState(currentMap)
  }
}

// Helper function to assign layer ID to objects based on type and active layer
const assignLayerId = (object: MapObject): MapObject => {
  const layerStore = useLayerStore.getState()

  // If object already has a layerId, use it
  if (object.layerId) {
    return object
  }

  // Use active layer if set, otherwise default layer for object type
  const layerId = layerStore.activeLayerId || layerStore.getDefaultLayerForObjectType(object.type)
  const layer = layerStore.getLayerById(layerId)

  return {
    ...object,
    layerId,
    layer: layer?.zIndex || object.layer || 0 // Update numeric layer to match
  }
}

const useMapStore = create<MapStore>()(
  immer((set) => ({
    currentMap: null,
    selectedObjects: [],
    mapVersion: 0,
    spellPreviewEnabled: false, // Action preview disabled by default (spells and movement)

    createNewMap: (name) => set((state) => {
      const mapId = crypto.randomUUID()

      // Create void token for environmental spells (invisible, used only for event system)
      const voidToken = {
        id: 'void-token',
        type: 'token' as const,
        name: 'Environment',
        position: { x: -10000, y: -10000 }, // Off-screen, will be calculated dynamically from viewport
        rotation: 0,
        layer: -999, // Always below everything
        size: 'medium' as const,
        color: 'transparent',
        shape: 'circle' as const,
        opacity: 0,
        isVoid: true,
        visible: false, // Never render on canvas
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
          position: { x: -10000, y: -10000 }, // Off-screen, calculated dynamically
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
      } else {
        // Update existing void token to be off-screen (position calculated dynamically)
        const voidTokenIndex = map.objects.findIndex(obj => obj.id === 'void-token')
        if (voidTokenIndex !== -1) {
          map.objects[voidTokenIndex].position = { x: -10000, y: -10000 }
          map.objects[voidTokenIndex].visible = false
        }
      }

      // Migration: Add labelColor to existing tokens that don't have it
      map.objects.forEach((obj) => {
        if (obj.type === 'token') {
          const token = obj as any // Token type
          if (!token.labelColor) {
            token.labelColor = '#E0E0E0'
          }
        }
      })

      state.currentMap = map
      state.selectedObjects = []
    }),

    addObject: (object) => {
      saveToHistory()
      set((state) => {
        if (state.currentMap) {
          const objectWithLayer = assignLayerId(object)
          state.currentMap.objects.push(objectWithLayer)
        }
      })
    },

    addSpellEffect: (spell: SpellMapObject) => set((state) => {
      if (state.currentMap) {
        // Add spell/persistent area with round tracking
        // Preserve ALL properties from the original spell object
        const spellObject: MapObject = {
          ...spell, // First spread all original properties
          // Then ensure critical properties are set
          layer: spell.layer !== undefined ? spell.layer : (spell.type === 'persistent-area' ? 9 : 10),
          isSpellEffect: spell.isSpellEffect !== undefined ? spell.isSpellEffect : true,
          roundCreated: spell.roundCreated,
          spellDuration: spell.spellDuration
        }

        state.currentMap.objects.push(spellObject)
        // Force re-render
        state.mapVersion += 1
      }
    }),

    addAttackEffect: (attack: AttackEventData) => set((state) => {
      if (state.currentMap) {
        // Add attack with animation data
        const attackObject: MapObject = {
          id: crypto.randomUUID(),
          type: 'attack' as const,
          position: attack.fromPosition,
          rotation: 0,
          layer: 9, // Attacks render below spells but above other objects
          isAttackEffect: true,
          attackData: attack
        }
        state.currentMap.objects.push(attackObject)
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

    deleteSelected: () => {
      saveToHistory()
      set((state) => {
        if (state.currentMap) {
          state.currentMap.objects = state.currentMap.objects.filter(
            obj => !state.selectedObjects.includes(obj.id)
          )
          state.selectedObjects = []
        }
      })
    },

    duplicateSelected: (offset = { x: 50, y: 50 }) => {
      saveToHistory()
      set((state) => {
        if (state.currentMap && state.selectedObjects.length > 0) {
          const duplicatedObjects = []
          const newSelectedIds = []

          for (const selectedId of state.selectedObjects) {
            const originalObject = state.currentMap.objects.find(obj => obj.id === selectedId)
            if (originalObject) {
              const duplicateId = crypto.randomUUID()
              const duplicatedObject = {
                ...originalObject,
                id: duplicateId,
                position: {
                  x: originalObject.position.x + offset.x,
                  y: originalObject.position.y + offset.y
                }
              }
              duplicatedObjects.push(duplicatedObject)
              newSelectedIds.push(duplicateId)
            }
          }

          // Add duplicated objects to the map
          state.currentMap.objects.push(...duplicatedObjects)
          // Select the duplicated objects
          state.selectedObjects = newSelectedIds
        }
      })
    },

    deleteObject: (id) => {
      saveToHistory()
      set((state) => {
        if (state.currentMap) {
          state.currentMap.objects = state.currentMap.objects.filter(obj => obj.id !== id)
          state.selectedObjects = state.selectedObjects.filter(selectedId => selectedId !== id)
        }
      })
    },

    updateObjectPosition: (id, position) => {
      saveToHistory()
      set((state) => {
        if (state.currentMap) {
          const object = state.currentMap.objects.find(obj => obj.id === id)
          if (object) {
            object.position = position
            // Increment version to force re-render
            state.mapVersion += 1
          }
        }
      })
    },

    batchUpdatePosition: (objectIds, deltaPosition) => {
      saveToHistory()
      set((state) => {
        if (state.currentMap) {
          for (const id of objectIds) {
            const object = state.currentMap.objects.find(obj => obj.id === id)
            if (object) {
              object.position = {
                x: object.position.x + deltaPosition.x,
                y: object.position.y + deltaPosition.y
              }
            }
          }
          // Increment version to force re-render
          state.mapVersion += 1
        }
      })
    },

    updateObject: (id, updates) => {
      saveToHistory()
      set((state) => {
        if (state.currentMap) {
          const objectIndex = state.currentMap.objects.findIndex(obj => obj.id === id)
          if (objectIndex !== -1) {
            Object.assign(state.currentMap.objects[objectIndex], updates)
          }
        }
      })
    },

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

    toggleSpellPreview: () => set((state) => {
      state.spellPreviewEnabled = !state.spellPreviewEnabled
    }),

    updateGridSettings: (settings) => set((state) => {
      if (state.currentMap) {
        Object.assign(state.currentMap.grid, settings)
      }
    }),

    cleanupExpiredSpells: (currentRound) => set((state) => {
      console.log('[mapStore.cleanupExpiredSpells] Called with currentRound:', currentRound)
      if (state.currentMap) {
        state.currentMap.objects = state.currentMap.objects.filter(obj => {
          if (obj.isSpellEffect && obj.spellDuration !== undefined && obj.roundCreated !== undefined) {
            // Don't remove instant spells (duration 0) - they're handled by animation timeout
            if (obj.spellDuration === 0) {
              console.log('[mapStore.cleanupExpiredSpells] Keeping instant spell:', obj.id)
              return true  // Keep instant spells, let animation handle removal
            }
            // Remove persistent spells that have expired
            // A spell created in round 1 with duration 1 should persist through round 2
            // So it expires AFTER round 2, meaning we remove it when currentRound > expiresAtRound
            const expiresAtRound = obj.roundCreated + obj.spellDuration
            const shouldKeep = currentRound <= expiresAtRound
            console.log('[mapStore.cleanupExpiredSpells] Persistent spell:', {
              id: obj.id,
              roundCreated: obj.roundCreated,
              spellDuration: obj.spellDuration,
              expiresAtRound,
              currentRound,
              shouldKeep
            })

            return shouldKeep
          }
          return true
        })
      }
    }),

    clearMapObjects: () => set((state) => {
      if (state.currentMap) {
        // Keep only the void-token, remove all other objects
        state.currentMap.objects = state.currentMap.objects.filter(obj => obj.id === 'void-token')
        state.selectedObjects = []
      }
    }),
  }))
)

// Migration function to fix existing tokens without labelColor
export const migrateTokenLabels = () => {
  useMapStore.setState((state) => {
    if (!state.currentMap) return state

    const updatedObjects = state.currentMap.objects.map((obj) => {
      if (obj.type === 'token') {
        const token = obj as any // Token type
        if (!token.labelColor) {
          return { ...obj, labelColor: '#E0E0E0' }
        }
      }
      return obj
    })

    return {
      ...state,
      currentMap: {
        ...state.currentMap,
        objects: updatedObjects
      },
      mapVersion: state.mapVersion + 1
    }
  })
}

export default useMapStore