import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { immer } from 'zustand/middleware/immer'

export interface LayerEffect {
  id: string
  type: string
  enabled: boolean
  settings: Record<string, any>
}

export interface LayerDefinition {
  id: string
  name: string
  type: 'background' | 'terrain' | 'grid' | 'objects' | 'tokens' | 'effects' | 'fog' | 'ui'
  visible: boolean
  locked: boolean
  opacity: number
  zIndex: number
  color?: string // For visualization in LayerPanel
  defaultForType?: string[] // Which object types default to this layer
  isDeletable: boolean // Prevent deletion of system layers
  // Advanced features for Phase 19
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light' | 'color-dodge' | 'color-burn'
  effects?: LayerEffect[]
  isGroup?: boolean
  parentId?: string // For nested layers
  thumbnail?: string // Base64 encoded thumbnail
  isReference?: boolean // Non-printing reference layer
  isolationMode?: boolean // Only show this layer
}

export interface LayerStore {
  layers: LayerDefinition[]
  activeLayerId: string | null

  // Basic Actions
  createLayer: (params: Partial<LayerDefinition> & { name: string }) => LayerDefinition
  deleteLayer: (layerId: string) => void
  updateLayer: (layerId: string, updates: Partial<LayerDefinition>) => void
  moveLayer: (layerId: string, direction: 'up' | 'down') => void
  setActiveLayer: (layerId: string | null) => void
  toggleLayerVisibility: (layerId: string) => void
  toggleLayerLock: (layerId: string) => void

  // Advanced Actions - Phase 19
  duplicateLayer: (layerId: string) => LayerDefinition
  mergeLayer: (sourceLayerId: string, targetLayerId: string) => void
  reorderLayers: (draggedLayerId: string, targetIndex: number) => void
  createLayerGroup: (layerIds: string[], groupName: string) => LayerDefinition
  ungroupLayer: (groupId: string) => void
  toggleLayerIsolation: (layerId: string) => void
  generateThumbnail: (layerId: string) => Promise<string>

  // Effect Management
  addLayerEffect: (layerId: string, effect: Omit<LayerEffect, 'id'>) => void
  removeLayerEffect: (layerId: string, effectId: string) => void
  updateLayerEffect: (layerId: string, effectId: string, updates: Partial<LayerEffect>) => void

  // Utility functions
  getLayerById: (layerId: string) => LayerDefinition | undefined
  getDefaultLayerForObjectType: (objectType: string) => string
  migrateNumericLayer: (numericLayer: number) => string
  getLayerZIndex: (layerId: string) => number
  getLayerHierarchy: () => LayerDefinition[]
  getVisibleLayers: () => LayerDefinition[]
  getLayerChildren: (parentId: string) => LayerDefinition[]
}

// D&D Battle Map Layer Hierarchy
const DEFAULT_LAYERS: LayerDefinition[] = [
  {
    id: 'background',
    name: 'Background',
    type: 'background',
    visible: true,
    locked: false,
    opacity: 1,
    zIndex: -100,
    color: '#4B5563',
    defaultForType: ['background', 'image'],
    isDeletable: false
  },
  {
    id: 'terrain',
    name: 'Terrain',
    type: 'terrain',
    visible: true,
    locked: false,
    opacity: 1,
    zIndex: 10,
    color: '#059669',
    defaultForType: ['shape'],
    isDeletable: false
  },
  {
    id: 'grid',
    name: 'Grid',
    type: 'grid',
    visible: true,
    locked: true, // Grid typically locked
    opacity: 0.6,
    zIndex: 20,
    color: '#6B7280',
    defaultForType: [],
    isDeletable: false
  },
  {
    id: 'objects',
    name: 'Objects',
    type: 'objects',
    visible: true,
    locked: false,
    opacity: 1,
    zIndex: 30,
    color: '#7C3AED',
    defaultForType: ['text', 'staticObject'],
    isDeletable: false
  },
  {
    id: 'tokens',
    name: 'Tokens',
    type: 'tokens',
    visible: true,
    locked: false,
    opacity: 1,
    zIndex: 40,
    color: '#DC2626',
    defaultForType: ['token'],
    isDeletable: false
  },
  {
    id: 'effects',
    name: 'Spell Effects',
    type: 'effects',
    visible: true,
    locked: false,
    opacity: 1,
    zIndex: 50,
    color: '#EA580C',
    defaultForType: ['spell', 'attack', 'persistent-area', 'staticEffect'],
    isDeletable: false
  },
  {
    id: 'fog',
    name: 'Fog of War',
    type: 'fog',
    visible: true,
    locked: false,
    opacity: 0.8,
    zIndex: 60,
    color: '#374151',
    defaultForType: ['fog'],
    isDeletable: false
  },
  {
    id: 'ui',
    name: 'UI Overlay',
    type: 'ui',
    visible: true,
    locked: true, // UI elements typically locked
    opacity: 1,
    zIndex: 70,
    color: '#F59E0B',
    defaultForType: ['measure', 'selection'],
    isDeletable: false
  }
]

export const useLayerStore = create<LayerStore>()(
  immer((set, get) => ({
    layers: DEFAULT_LAYERS,
    activeLayerId: 'tokens', // Default to tokens layer for object creation

    createLayer: (params: Partial<LayerDefinition> & { name: string }) => {
      const newId = `layer-${Date.now()}`

      const newLayer: LayerDefinition = {
        type: 'objects',
        visible: true,
        locked: false,
        opacity: 1,
        zIndex: 35, // Default between objects and tokens
        isDeletable: true,
        ...params,
        id: newId // Ensure ID is always our generated one
      }

      set((state) => {
        state.layers.push(newLayer)
        state.layers.sort((a, b) => a.zIndex - b.zIndex)
      })

      return newLayer
    },

    deleteLayer: (layerId: string) =>
      set((state) => {
        const layer = state.layers.find(l => l.id === layerId)
        if (!layer || !layer.isDeletable) return

        // Remove layer
        state.layers = state.layers.filter(l => l.id !== layerId)

        // If this was the active layer, set active to nearest layer
        if (state.activeLayerId === layerId) {
          state.activeLayerId = state.layers.find(l => l.type === 'tokens')?.id ||
                                 state.layers[0]?.id ||
                                 null
        }
      }),

    updateLayer: (layerId: string, updates: Partial<LayerDefinition>) =>
      set((state) => {
        const layer = state.layers.find(l => l.id === layerId)
        if (layer) {
          Object.assign(layer, updates)
          // Re-sort if zIndex changed
          if ('zIndex' in updates) {
            state.layers.sort((a, b) => a.zIndex - b.zIndex)
          }
        }
      }),

    moveLayer: (layerId: string, direction: 'up' | 'down') =>
      set((state) => {
        const layerIndex = state.layers.findIndex(l => l.id === layerId)
        if (layerIndex === -1) return

        const targetIndex = direction === 'up' ? layerIndex - 1 : layerIndex + 1
        if (targetIndex < 0 || targetIndex >= state.layers.length) return

        // Swap layers
        const [layer] = state.layers.splice(layerIndex, 1)
        state.layers.splice(targetIndex, 0, layer)

        // Update zIndex values
        state.layers.forEach((layer, index) => {
          layer.zIndex = index * 10
        })
      }),

    setActiveLayer: (layerId: string | null) =>
      set((state) => {
        state.activeLayerId = layerId
      }),

    toggleLayerVisibility: (layerId: string) =>
      set((state) => {
        const layer = state.layers.find(l => l.id === layerId)
        if (layer) {
          layer.visible = !layer.visible
        }
      }),

    toggleLayerLock: (layerId: string) =>
      set((state) => {
        const layer = state.layers.find(l => l.id === layerId)
        if (layer) {
          layer.locked = !layer.locked
        }
      }),

    // Utility functions
    getLayerById: (layerId: string) => {
      return get().layers.find(l => l.id === layerId)
    },

    getDefaultLayerForObjectType: (objectType: string) => {
      const layers = get().layers
      for (const layer of layers) {
        if (layer.defaultForType?.includes(objectType)) {
          return layer.id
        }
      }
      return 'objects' // fallback
    },

    migrateNumericLayer: (numericLayer: number) => {
      if (numericLayer < 0) return 'background'
      if (numericLayer <= 15) return 'terrain'
      if (numericLayer <= 25) return 'objects'
      if (numericLayer <= 35) return 'tokens'
      if (numericLayer <= 55) return 'effects'
      if (numericLayer <= 65) return 'fog'
      return 'ui'
    },

    getLayerZIndex: (layerId: string) => {
      const layer = get().getLayerById(layerId)
      return layer?.zIndex || 0
    },

    // Advanced Actions - Phase 19
    duplicateLayer: (layerId: string) => {
      const state = get()
      const layer = state.getLayerById(layerId)
      if (!layer) return layer as unknown as LayerDefinition

      const newLayer: LayerDefinition = {
        ...layer,
        id: `layer-${Date.now()}`,
        name: `${layer.name} Copy`,
        zIndex: layer.zIndex + 1,
        isDeletable: true
      }

      set((state) => {
        // Shift other layers up if needed
        state.layers.forEach(l => {
          if (l.zIndex > layer.zIndex) {
            l.zIndex += 1
          }
        })

        state.layers.push(newLayer)
        state.layers.sort((a, b) => a.zIndex - b.zIndex)
      })

      return newLayer
    },

    mergeLayer: (sourceLayerId: string, targetLayerId: string) =>
      set((state) => {
        const sourceLayer = state.layers.find(l => l.id === sourceLayerId)
        const targetLayer = state.layers.find(l => l.id === targetLayerId)

        if (!sourceLayer || !targetLayer || !sourceLayer.isDeletable) return

        // Remove source layer
        state.layers = state.layers.filter(l => l.id !== sourceLayerId)

        // Update active layer if needed
        if (state.activeLayerId === sourceLayerId) {
          state.activeLayerId = targetLayerId
        }
      }),

    reorderLayers: (draggedLayerId: string, targetIndex: number) =>
      set((state) => {
        const draggedIndex = state.layers.findIndex(l => l.id === draggedLayerId)
        if (draggedIndex === -1 || targetIndex < 0 || targetIndex >= state.layers.length) return

        // Remove dragged layer and insert at target index
        const [draggedLayer] = state.layers.splice(draggedIndex, 1)
        state.layers.splice(targetIndex, 0, draggedLayer)

        // Update zIndex values based on new order
        state.layers.forEach((layer, index) => {
          layer.zIndex = index * 10
        })

        state.layers.sort((a, b) => a.zIndex - b.zIndex)
      }),

    createLayerGroup: (layerIds: string[], groupName: string) => {
      const state = get()
      const layers = layerIds.map(id => state.getLayerById(id)).filter(Boolean) as LayerDefinition[]
      if (layers.length === 0) return layers[0]

      const groupLayer: LayerDefinition = {
        id: `group-${Date.now()}`,
        name: groupName,
        type: 'objects',
        visible: true,
        locked: false,
        opacity: 1,
        zIndex: Math.min(...layers.map(l => l.zIndex)),
        isDeletable: true,
        isGroup: true
      }

      set((state) => {
        // Update child layers to reference group
        layers.forEach(layer => {
          const stateLayer = state.layers.find(l => l.id === layer.id)
          if (stateLayer) {
            stateLayer.parentId = groupLayer.id
          }
        })

        state.layers.push(groupLayer)
        state.layers.sort((a, b) => a.zIndex - b.zIndex)
      })

      return groupLayer
    },

    ungroupLayer: (groupId: string) =>
      set((state) => {
        const group = state.layers.find(l => l.id === groupId && l.isGroup)
        if (!group) return

        // Remove parent reference from child layers
        state.layers.forEach(layer => {
          if (layer.parentId === groupId) {
            delete layer.parentId
          }
        })

        // Remove group layer
        state.layers = state.layers.filter(l => l.id !== groupId)

        // Update active layer if needed
        if (state.activeLayerId === groupId) {
          state.activeLayerId = state.layers.find(l => l.type === 'tokens')?.id || null
        }
      }),

    toggleLayerIsolation: (layerId: string) =>
      set((state) => {
        const layer = state.layers.find(l => l.id === layerId)
        if (!layer) return

        const isIsolated = layer.isolationMode || false

        // Toggle isolation mode
        layer.isolationMode = !isIsolated

        if (!isIsolated) {
          // Entering isolation mode - hide other layers
          state.layers.forEach(l => {
            if (l.id !== layerId) {
              l.visible = false
            }
          })
          layer.visible = true
        } else {
          // Exiting isolation mode - restore visibility
          state.layers.forEach(l => {
            l.visible = true
          })
        }
      }),

    generateThumbnail: async (layerId: string) => {
      const state = get()
      const layer = state.getLayerById(layerId)
      if (!layer) return ''

      try {
        // Create a canvas to generate thumbnail
        const canvas = document.createElement('canvas')
        canvas.width = 64
        canvas.height = 64
        const ctx = canvas.getContext('2d')

        if (!ctx) return ''

        // Fill with layer color or default
        ctx.fillStyle = layer.color || '#C9AD6A'
        ctx.fillRect(0, 0, 64, 64)

        // Add layer initial or icon
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 32px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(layer.name.charAt(0).toUpperCase(), 32, 32)

        // Convert to base64
        const thumbnail = canvas.toDataURL('image/png')

        // Update layer with thumbnail
        set((state) => {
          const stateLayer = state.layers.find(l => l.id === layerId)
          if (stateLayer) {
            stateLayer.thumbnail = thumbnail
          }
        })

        return thumbnail
      } catch (error) {
        console.error('Failed to generate thumbnail:', error)
        return ''
      }
    },

    // Effect Management
    addLayerEffect: (layerId: string, effect: Omit<LayerEffect, 'id'>) =>
      set((state) => {
        const layer = state.layers.find(l => l.id === layerId)
        if (!layer) return

        const newEffect: LayerEffect = {
          ...effect,
          id: uuidv4()
        }

        if (!layer.effects) {
          layer.effects = []
        }

        layer.effects.push(newEffect)
      }),

    removeLayerEffect: (layerId: string, effectId: string) =>
      set((state) => {
        const layer = state.layers.find(l => l.id === layerId)
        if (!layer || !layer.effects) return

        layer.effects = layer.effects.filter(e => e.id !== effectId)
      }),

    updateLayerEffect: (layerId: string, effectId: string, updates: Partial<LayerEffect>) =>
      set((state) => {
        const layer = state.layers.find(l => l.id === layerId)
        if (!layer || !layer.effects) return

        const effect = layer.effects.find(e => e.id === effectId)
        if (effect) {
          Object.assign(effect, updates)
        }
      }),

    // Utility functions
    getLayerHierarchy: () => {
      const state = get()
      const rootLayers = state.layers.filter(l => !l.parentId)
      return rootLayers.sort((a, b) => a.zIndex - b.zIndex)
    },

    getVisibleLayers: () => {
      const state = get()
      return state.layers.filter(l => l.visible).sort((a, b) => a.zIndex - b.zIndex)
    },

    getLayerChildren: (parentId: string) => {
      const state = get()
      return state.layers.filter(l => l.parentId === parentId).sort((a, b) => a.zIndex - b.zIndex)
    }
  }))
)