import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { WritableDraft } from 'immer'
import type { MapStore, Token } from '../types'
import type { MapObject, SpellMapObject, AttackEventData } from '../types'
import { isToken } from '../types'
import { useHistoryStore } from './historyStore'
import { useLayerStore } from './layerStore'
import { getSyncManager } from '../utils/syncManager'
import { logger } from '../utils/logger'
import { v4 as uuidv4 } from 'uuid'

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
      const mapId = uuidv4()

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
        if (isToken(obj)) {
          if (!obj.labelColor) {
            obj.labelColor = '#E0E0E0'
          }
        }
      })

      state.currentMap = map
      state.selectedObjects = []

      // Broadcast map update to viewer
      try {
        const syncManager = getSyncManager('main')
        syncManager.broadcastMapUpdate(map)
      } catch {
        // Sync manager not initialized or viewer mode - ignore
      }
    }),

    addObject: (object) => {
      saveToHistory()
      set((state) => {
        if (state.currentMap) {
          const objectWithLayer = assignLayerId(object)
          state.currentMap.objects.push(objectWithLayer)

          // Broadcast object added to viewer
          try {
            const syncManager = getSyncManager('main')
            syncManager.broadcastObjectAdded(objectWithLayer)
          } catch {
            // Sync manager not initialized or viewer mode - ignore
          }
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

        // Broadcast spell effect to viewer
        try {
          const syncManager = getSyncManager('main')
          syncManager.broadcastObjectAdded(spellObject)
        } catch {
          // Sync manager not initialized or viewer mode - ignore
        }
      }
    }),

    addAttackEffect: (attack: AttackEventData) => set((state) => {
      if (state.currentMap) {
        // Add attack with animation data
        const attackObject: MapObject = {
          id: uuidv4(),
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
              const duplicateId = uuidv4()
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

          // Broadcast object removal to viewer
          try {
            const syncManager = getSyncManager('main')
            syncManager.broadcastObjectRemoved(id)
          } catch {
            // Sync manager not initialized or viewer mode - ignore
          }
        }
      })
    },

    // Terrain management actions
    setFieldColor: (color) =>
      set((state) => {
        if (state.currentMap) {
          saveToHistory()
          if (!state.currentMap.terrain) {
            state.currentMap.terrain = {
              fieldColor: color,
              drawings: [],
              version: 1
            }
          } else {
            state.currentMap.terrain.fieldColor = color
            state.currentMap.terrain.version += 1
          }
          state.mapVersion += 1
        }
      }),

    addTerrainDrawing: (drawing) =>
      set((state) => {
        if (state.currentMap) {
          saveToHistory()
          if (!state.currentMap.terrain) {
            state.currentMap.terrain = {
              fieldColor: '#1A1A1A',
              drawings: [drawing],
              version: 1
            }
          } else {
            state.currentMap.terrain.drawings.push(drawing)
            state.currentMap.terrain.version += 1
          }
          state.mapVersion += 1
        }
      }),

    removeTerrainDrawing: (id) =>
      set((state) => {
        if (state.currentMap?.terrain) {
          saveToHistory()
          state.currentMap.terrain.drawings = state.currentMap.terrain.drawings.filter(
            (d) => d.id !== id
          )
          state.currentMap.terrain.version += 1
          state.mapVersion += 1
        }
      }),

    clearTerrainDrawings: () =>
      set((state) => {
        if (state.currentMap?.terrain) {
          saveToHistory()
          state.currentMap.terrain.drawings = []
          state.currentMap.terrain.version += 1
          state.mapVersion += 1
        }
      }),

    updateObjectPosition: (id, position) => {
      saveToHistory()
      set((state) => {
        if (state.currentMap) {
          const object = state.currentMap.objects.find(obj => obj.id === id)
          if (object) {
            object.position = position
            // Increment version to force re-render
            state.mapVersion += 1

            // Broadcast position update to viewer
            try {
              const syncManager = getSyncManager('main')
              syncManager.broadcastObjectUpdated(id, { position })
            } catch {
              // Sync manager not initialized or viewer mode - ignore
            }
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

    cleanupExpiredSpells: (currentRound, currentEvent) => set((state) => {
      logger.debug('store', 'cleanupExpiredSpells called', { currentRound, currentEvent })
      if (state.currentMap) {
        state.currentMap.objects = state.currentMap.objects.filter(obj => {
          if (obj.isSpellEffect && obj.spellDuration !== undefined) {
            // Don't remove instant spells (duration 0) - they're handled by animation timeout
            if (obj.spellDuration === 0) {
              logger.debug('store', 'Keeping instant spell', obj.id)
              return true  // Keep instant spells, let animation handle removal
            }

            // Determine expiration based on durationType
            const durationType = obj.durationType || 'rounds' // Default to rounds for backward compatibility
            let shouldKeep = true

            if (durationType === 'rounds' && obj.roundCreated !== undefined) {
              // Round-based duration (continuous spells like Web, Darkness)
              // Lasts for N rounds starting from when cast
              const expiresAtRound = obj.roundCreated + obj.spellDuration
              shouldKeep = currentRound < expiresAtRound
              logger.debug('store', 'Round-based spell expiry check', {
                id: obj.id,
                roundCreated: obj.roundCreated,
                spellDuration: obj.spellDuration,
                expiresAtRound,
                currentRound,
                shouldKeep
              })
            } else if (durationType === 'events' && obj.eventCreated !== undefined && currentEvent !== undefined) {
              // Event-based duration (instant area effects like Fireball burn, cone spells)
              // persistDuration=1 means "lasts for 1 event only" (the creation event)
              // Cleanup happens DURING event transition, so we see the effect until it's removed
              const sameRound = obj.roundCreated === currentRound

              // Calculate how many events have elapsed since creation
              // persistDuration=1 means: "visible for creation event + 1 additional event"
              // Event 1 created, Event 1: eventsElapsed = 0, keep (creation event)
              // Event 1 created, Event 2: eventsElapsed = 1, keep (within duration=1)
              // Event 1 created, Event 3: eventsElapsed = 2, remove (exceeded duration=1)
              const eventsElapsed = currentEvent - obj.eventCreated

              // Keep while eventsElapsed <= persistDuration
              // persistDuration=1: created at event 1, visible at events 1-2, removed at event 3
              shouldKeep = eventsElapsed <= obj.spellDuration && sameRound

              logger.debug('store', 'Event-based spell expiry check', {
                id: obj.id,
                eventCreated: obj.eventCreated,
                spellDuration: obj.spellDuration,
                eventsElapsed,
                currentEvent,
                roundCreated: obj.roundCreated,
                currentRound,
                sameRound,
                shouldKeep
              })
            }

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

    // Status Effect Management
    addStatusEffect: (tokenId, effect) => {
      saveToHistory()
      set((state) => {
        if (state.currentMap) {
          const obj = state.currentMap.objects.find(o => o.id === tokenId && o.type === 'token')
          if (obj && obj.type === 'token') {
            const token = obj as WritableDraft<Token>
            if (!token.statusEffects) {
              token.statusEffects = []
            }
            // Check if effect already exists, if so, update it
            const existingIndex = token.statusEffects.findIndex(e => e.type === effect.type)
            if (existingIndex >= 0) {
              token.statusEffects[existingIndex] = effect
            } else {
              token.statusEffects.push(effect)
            }
            state.mapVersion += 1

            // Broadcast status effect update to viewer
            try {
              const syncManager = getSyncManager('main')
              syncManager.broadcastObjectUpdated(tokenId, { statusEffects: token.statusEffects })
            } catch {
              // Sync manager not initialized or viewer mode - ignore
            }
          }
        }
      })
    },

    removeStatusEffect: (tokenId, effectType) => {
      saveToHistory()
      set((state) => {
        if (state.currentMap) {
          const obj = state.currentMap.objects.find(o => o.id === tokenId && o.type === 'token')
          if (obj && obj.type === 'token') {
            const token = obj as WritableDraft<Token>
            if (token.statusEffects) {
              token.statusEffects = token.statusEffects.filter(e => e.type !== effectType)
              state.mapVersion += 1

              // Broadcast status effect update to viewer
              try {
                const syncManager = getSyncManager('main')
                syncManager.broadcastObjectUpdated(tokenId, { statusEffects: token.statusEffects })
              } catch {
                // Sync manager not initialized or viewer mode - ignore
              }
            }
          }
        }
      })
    },

    clearStatusEffects: (tokenId) => {
      saveToHistory()
      set((state) => {
        if (state.currentMap) {
          const obj = state.currentMap.objects.find(o => o.id === tokenId && o.type === 'token')
          if (obj && obj.type === 'token') {
            const token = obj as WritableDraft<Token>
            token.statusEffects = []
            state.mapVersion += 1

            // Broadcast status effect clear to viewer
            try {
              const syncManager = getSyncManager('main')
              syncManager.broadcastObjectUpdated(tokenId, { statusEffects: [] })
            } catch {
              // Sync manager not initialized or viewer mode - ignore
            }
          }
        }
      })
    },

    cleanupExpiredStatusEffects: (currentRound) => {
      set((state) => {
        if (state.currentMap) {
          let hasChanges = false

          // Iterate through all tokens
          state.currentMap.objects.forEach((obj) => {
            if (obj.type === 'token') {
              const token = obj as WritableDraft<Token>
              if (token.statusEffects && token.statusEffects.length > 0) {
                // Filter out expired effects
                const activeEffects = token.statusEffects.filter((effect) => {
                  // If duration is undefined or 0, effect is indefinite
                  if (!effect.duration || effect.duration === 0) {
                    return true
                  }

                  // Calculate when effect was applied (current round - duration)
                  // We assume effects last for their duration in rounds from when applied
                  // For simplicity, we'll track this by storing roundApplied in the effect
                  if (effect.roundApplied !== undefined) {
                    const expiresAtRound = effect.roundApplied + effect.duration
                    return currentRound < expiresAtRound
                  }

                  // If no roundApplied, keep the effect (backward compatibility)
                  return true
                })

                if (activeEffects.length !== token.statusEffects.length) {
                  token.statusEffects = activeEffects
                  hasChanges = true
                }
              }
            }
          })

          if (hasChanges) {
            state.mapVersion += 1
          }
        }
      })
    },
  }))
)

// Migration function to fix existing tokens without labelColor
export const migrateTokenLabels = () => {
  useMapStore.setState((state) => {
    if (!state.currentMap) return state

    const updatedObjects = state.currentMap.objects.map((obj) => {
      if (isToken(obj)) {
        if (!obj.labelColor) {
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