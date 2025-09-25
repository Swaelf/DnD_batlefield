/**
 * Property Store
 *
 * Zustand store with Immer integration for property editing state management
 * following the established patterns from Timeline, Actions, and Spells modules.
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { devtools } from 'zustand/middleware'
import type {
  PropertyField,
  PropertyGroup,
  PropertyValues,
  PropertySchema,
  PropertyValidationResult,
  PropertyChange,
  PropertyConfig,
  PropertyBatchUpdate,
  PropertyHistoryEntry,
  MultiPropertyState,
  MapObject,
  PropertyId,
  PropertyGroupId
} from '../types'
import { PropertyValidationService, PropertySchemaService } from '../services'

/**
 * Property editing state for selected objects
 */
type PropertyEditingState = {
  readonly selectedObjectIds: readonly string[]
  readonly currentValues: Record<string, PropertyValues>
  readonly validationResults: Record<string, readonly PropertyValidationResult[]>
  readonly isDirty: boolean
  readonly isValidating: boolean
  readonly lastSaved: Date | null
  readonly activeGroupId: PropertyGroupId | null
  readonly expandedGroups: Set<string>
}

/**
 * Complete property store state
 */
type PropertyStore = {
  // Services
  readonly validationService: PropertyValidationService
  readonly schemaService: PropertySchemaService

  // Editing state
  readonly editing: PropertyEditingState

  // Multi-selection state
  readonly multiSelection: MultiPropertyState | null

  // Configuration
  readonly config: PropertyConfig

  // Change history for undo/redo
  readonly history: readonly PropertyHistoryEntry[]
  readonly historyIndex: number

  // UI state
  readonly isPropertiesPanelOpen: boolean
  readonly collapsedPanels: Set<string>

  // Actions - Object Selection
  selectObjects: (objectIds: readonly string[]) => void
  clearSelection: () => void
  addToSelection: (objectId: string) => void
  removeFromSelection: (objectId: string) => void

  // Actions - Property Editing
  updateProperty: (objectId: string, fieldKey: string, value: unknown) => void
  updateMultipleProperties: (objectId: string, changes: Record<string, unknown>) => void
  batchUpdateProperties: (update: PropertyBatchUpdate) => void

  // Actions - Validation
  validateObject: (objectId: string) => Promise<readonly PropertyValidationResult[]>
  validateAll: () => Promise<void>
  clearValidation: (objectId?: string) => void

  // Actions - Schema Management
  getSchema: (objectType: MapObject['type']) => PropertySchema | null
  getFields: (objectType: MapObject['type']) => readonly PropertyField[]
  getGroups: (objectType: MapObject['type']) => readonly PropertyGroup[]

  // Actions - Value Management
  getPropertyValues: (objectId: string) => PropertyValues | null
  setPropertyValues: (objectId: string, values: PropertyValues) => void
  resetToDefaults: (objectId: string) => void

  // Actions - Multi-Selection
  enableMultiSelection: (objectIds: readonly string[]) => void
  disableMultiSelection: () => void
  getCommonProperties: () => Record<string, unknown>
  updateCommonProperty: (fieldKey: string, value: unknown) => void

  // Actions - History
  commitChanges: (description: string) => void
  undo: () => boolean
  redo: () => boolean
  clearHistory: () => void

  // Actions - UI State
  togglePropertiesPanel: () => void
  setActiveGroup: (groupId: PropertyGroupId | null) => void
  toggleGroupExpanded: (groupId: string) => void
  togglePanelCollapsed: (panelId: string) => void

  // Actions - Configuration
  updateConfig: (config: Partial<PropertyConfig>) => void

  // Actions - Utility
  getDirtyObjects: () => string[]
  saveAll: () => Promise<void>
  discardChanges: (objectId?: string) => void
}

/**
 * Default editing state
 */
const defaultEditingState: PropertyEditingState = {
  selectedObjectIds: [],
  currentValues: {},
  validationResults: {},
  isDirty: false,
  isValidating: false,
  lastSaved: null,
  activeGroupId: null,
  expandedGroups: new Set()
}

/**
 * Default configuration
 */
const defaultConfig: PropertyConfig = {
  enableDNDValidation: true,
  enforceOfficialRules: false,
  allowCustomProperties: true,
  showHelpText: true,
  showWarnings: true,
  autoSave: true,
  autoSaveDelay: 2000,
  validationDelay: 300
}

/**
 * Create property store with Immer and devtools middleware
 */
export const usePropertyStore = create<PropertyStore>()(
  devtools(
    immer((set, get) => ({
      // Initialize services
      validationService: new PropertyValidationService({
        enableDNDValidation: defaultConfig.enableDNDValidation,
        enforceOfficialRules: defaultConfig.enforceOfficialRules
      }),
      schemaService: new PropertySchemaService(),

      // Initialize state
      editing: defaultEditingState,
      multiSelection: null,
      config: defaultConfig,
      history: [],
      historyIndex: -1,
      isPropertiesPanelOpen: true,
      collapsedPanels: new Set(),

      // Object Selection Actions
      selectObjects: (objectIds) => {
        set((state) => {
          state.editing.selectedObjectIds = objectIds
          state.multiSelection = objectIds.length > 1
            ? get().createMultiSelectionState(objectIds)
            : null

          // Load property values for selected objects
          for (const objectId of objectIds) {
            if (!state.editing.currentValues[objectId]) {
              // Initialize with default values - would typically load from map store
              const objectType = get().inferObjectType(objectId)
              if (objectType) {
                const fields = get().getFields(objectType)
                const defaultValues: Record<string, unknown> = {}

                fields.forEach(field => {
                  if (field.defaultValue !== undefined) {
                    defaultValues[field.key] = field.defaultValue
                  }
                })

                state.editing.currentValues[objectId] = {
                  objectId,
                  objectType,
                  values: defaultValues,
                  isValid: true,
                  errors: {},
                  warnings: {},
                  lastModified: new Date()
                }
              }
            }
          }
        })

        // Auto-validate if enabled
        if (get().config.enableDNDValidation) {
          get().validateAll()
        }
      },

      clearSelection: () => {
        set((state) => {
          state.editing.selectedObjectIds = []
          state.multiSelection = null
        })
      },

      addToSelection: (objectId) => {
        set((state) => {
          if (!state.editing.selectedObjectIds.includes(objectId)) {
            state.editing.selectedObjectIds = [...state.editing.selectedObjectIds, objectId]

            if (state.editing.selectedObjectIds.length > 1) {
              state.multiSelection = get().createMultiSelectionState(state.editing.selectedObjectIds)
            }
          }
        })
      },

      removeFromSelection: (objectId) => {
        set((state) => {
          state.editing.selectedObjectIds = state.editing.selectedObjectIds.filter(id => id !== objectId)

          if (state.editing.selectedObjectIds.length <= 1) {
            state.multiSelection = null
          } else {
            state.multiSelection = get().createMultiSelectionState(state.editing.selectedObjectIds)
          }
        })
      },

      // Property Editing Actions
      updateProperty: (objectId, fieldKey, value) => {
        set((state) => {
          const propertyValues = state.editing.currentValues[objectId]
          if (propertyValues) {
            propertyValues.values[fieldKey] = value
            propertyValues.lastModified = new Date()
            state.editing.isDirty = true

            // Clear previous validation for this field
            delete propertyValues.errors[fieldKey]
            delete propertyValues.warnings[fieldKey]
          }
        })

        // Schedule validation
        if (get().config.enableDNDValidation) {
          setTimeout(() => {
            get().validateObject(objectId)
          }, get().config.validationDelay)
        }

        // Schedule auto-save
        if (get().config.autoSave) {
          setTimeout(() => {
            // Auto-save logic would be implemented here
          }, get().config.autoSaveDelay)
        }
      },

      updateMultipleProperties: (objectId, changes) => {
        set((state) => {
          const propertyValues = state.editing.currentValues[objectId]
          if (propertyValues) {
            Object.entries(changes).forEach(([key, value]) => {
              propertyValues.values[key] = value
            })
            propertyValues.lastModified = new Date()
            state.editing.isDirty = true
          }
        })

        get().validateObject(objectId)
      },

      batchUpdateProperties: (update) => {
        const changes: PropertyChange[] = []

        set((state) => {
          update.objectIds.forEach(objectId => {
            const propertyValues = state.editing.currentValues[objectId]
            if (propertyValues) {
              Object.entries(update.changes).forEach(([key, newValue]) => {
                const oldValue = propertyValues.values[key]
                if (oldValue !== newValue) {
                  changes.push({
                    objectId,
                    field: key,
                    oldValue,
                    newValue,
                    timestamp: new Date(),
                    isValid: true // Will be updated by validation
                  })
                  propertyValues.values[key] = newValue
                }
              })
              propertyValues.lastModified = new Date()
            }
          })
          state.editing.isDirty = true
        })

        // Validate all affected objects
        if (!update.skipValidation) {
          update.objectIds.forEach(objectId => {
            get().validateObject(objectId)
          })
        }

        // Record history
        if (changes.length > 0) {
          get().addHistoryEntry({
            changes,
            description: update.reason
          })
        }
      },

      // Validation Actions
      validateObject: async (objectId) => {
        const { validationService, schemaService, editing } = get()
        const propertyValues = editing.currentValues[objectId]

        if (!propertyValues) return []

        set((state) => {
          state.editing.isValidating = true
        })

        const fields = schemaService.getFields(propertyValues.objectType)
        const validationResults = validationService.validateProperties(fields, propertyValues)

        set((state) => {
          state.editing.validationResults[objectId] = validationResults.results
          const values = state.editing.currentValues[objectId]
          if (values) {
            values.isValid = validationResults.isValid
            values.errors = validationResults.errors
            values.warnings = validationResults.warnings
          }
          state.editing.isValidating = false
        })

        return validationResults.results
      },

      validateAll: async () => {
        const { editing } = get()
        const validationPromises = editing.selectedObjectIds.map(objectId =>
          get().validateObject(objectId)
        )
        await Promise.all(validationPromises)
      },

      clearValidation: (objectId) => {
        set((state) => {
          if (objectId) {
            delete state.editing.validationResults[objectId]
            const values = state.editing.currentValues[objectId]
            if (values) {
              values.errors = {}
              values.warnings = {}
            }
          } else {
            state.editing.validationResults = {}
            Object.values(state.editing.currentValues).forEach(values => {
              values.errors = {}
              values.warnings = {}
            })
          }
        })
      },

      // Schema Management Actions
      getSchema: (objectType) => {
        return get().schemaService.getSchema(objectType)
      },

      getFields: (objectType) => {
        return get().schemaService.getFields(objectType)
      },

      getGroups: (objectType) => {
        return get().schemaService.getGroups(objectType)
      },

      // Value Management Actions
      getPropertyValues: (objectId) => {
        return get().editing.currentValues[objectId] || null
      },

      setPropertyValues: (objectId, values) => {
        set((state) => {
          state.editing.currentValues[objectId] = values
        })
      },

      resetToDefaults: (objectId) => {
        const objectType = get().inferObjectType(objectId)
        if (!objectType) return

        const fields = get().getFields(objectType)
        const defaultValues: Record<string, unknown> = {}

        fields.forEach(field => {
          if (field.defaultValue !== undefined) {
            defaultValues[field.key] = field.defaultValue
          }
        })

        set((state) => {
          state.editing.currentValues[objectId] = {
            objectId,
            objectType,
            values: defaultValues,
            isValid: true,
            errors: {},
            warnings: {},
            lastModified: new Date()
          }
          state.editing.isDirty = true
        })
      },

      // Multi-Selection Actions
      enableMultiSelection: (objectIds) => {
        set((state) => {
          state.multiSelection = get().createMultiSelectionState(objectIds)
        })
      },

      disableMultiSelection: () => {
        set((state) => {
          state.multiSelection = null
        })
      },

      getCommonProperties: () => {
        const { multiSelection } = get()
        return multiSelection?.commonProperties || {}
      },

      updateCommonProperty: (fieldKey, value) => {
        const { multiSelection } = get()
        if (!multiSelection) return

        get().batchUpdateProperties({
          objectIds: multiSelection.selectedObjectIds,
          changes: { [fieldKey]: value },
          skipValidation: false,
          reason: `Update ${fieldKey} for ${multiSelection.selectedObjectIds.length} objects`
        })
      },

      // History Actions
      commitChanges: (description) => {
        const { editing } = get()
        if (!editing.isDirty) return

        // This would typically save changes to the main map store
        set((state) => {
          state.editing.isDirty = false
          state.editing.lastSaved = new Date()
        })

        get().addHistoryEntry({
          changes: [],
          description
        })
      },

      undo: () => {
        const { history, historyIndex } = get()
        if (historyIndex > 0) {
          // Implement undo logic
          set((state) => {
            state.historyIndex = state.historyIndex - 1
          })
          return true
        }
        return false
      },

      redo: () => {
        const { history, historyIndex } = get()
        if (historyIndex < history.length - 1) {
          // Implement redo logic
          set((state) => {
            state.historyIndex = state.historyIndex + 1
          })
          return true
        }
        return false
      },

      clearHistory: () => {
        set((state) => {
          state.history = []
          state.historyIndex = -1
        })
      },

      // UI State Actions
      togglePropertiesPanel: () => {
        set((state) => {
          state.isPropertiesPanelOpen = !state.isPropertiesPanelOpen
        })
      },

      setActiveGroup: (groupId) => {
        set((state) => {
          state.editing.activeGroupId = groupId
        })
      },

      toggleGroupExpanded: (groupId) => {
        set((state) => {
          if (state.editing.expandedGroups.has(groupId)) {
            state.editing.expandedGroups.delete(groupId)
          } else {
            state.editing.expandedGroups.add(groupId)
          }
        })
      },

      togglePanelCollapsed: (panelId) => {
        set((state) => {
          if (state.collapsedPanels.has(panelId)) {
            state.collapsedPanels.delete(panelId)
          } else {
            state.collapsedPanels.add(panelId)
          }
        })
      },

      // Configuration Actions
      updateConfig: (config) => {
        set((state) => {
          Object.assign(state.config, config)
        })

        // Update validation service configuration
        const { validationService } = get()
        validationService.updateConfig({
          enableDNDValidation: config.enableDNDValidation,
          enforceOfficialRules: config.enforceOfficialRules
        })
      },

      // Utility Actions
      getDirtyObjects: () => {
        const { editing } = get()
        return editing.selectedObjectIds.filter(objectId => {
          const values = editing.currentValues[objectId]
          return values && values.lastModified > (editing.lastSaved || new Date(0))
        })
      },

      saveAll: async () => {
        // Would implement saving all dirty objects to map store
        get().commitChanges('Save all property changes')
      },

      discardChanges: (objectId) => {
        if (objectId) {
          get().resetToDefaults(objectId)
        } else {
          const { editing } = get()
          editing.selectedObjectIds.forEach(id => {
            get().resetToDefaults(id)
          })
        }
      },

      // Helper Methods
      createMultiSelectionState: (objectIds: readonly string[]): MultiPropertyState => {
        const { editing } = get()
        const commonProperties: Record<string, unknown> = {}
        const mixedProperties = new Set<string>()

        if (objectIds.length === 0) {
          return {
            selectedObjectIds: objectIds,
            commonProperties,
            mixedProperties,
            canBatchEdit: false,
            affectedCount: 0
          }
        }

        // Find common properties across all selected objects
        const firstObject = editing.currentValues[objectIds[0]]
        if (firstObject) {
          Object.entries(firstObject.values).forEach(([key, value]) => {
            let isCommon = true

            for (let i = 1; i < objectIds.length; i++) {
              const otherObject = editing.currentValues[objectIds[i]]
              if (!otherObject || otherObject.values[key] !== value) {
                isCommon = false
                mixedProperties.add(key)
                break
              }
            }

            if (isCommon) {
              commonProperties[key] = value
            }
          })
        }

        return {
          selectedObjectIds: objectIds,
          commonProperties,
          mixedProperties,
          canBatchEdit: objectIds.length > 1,
          affectedCount: objectIds.length
        }
      },

      inferObjectType: (objectId: string): MapObject['type'] | null => {
        // This would typically look up the object type from the map store
        // For now, return 'token' as default
        return 'token'
      },

      addHistoryEntry: (entry: { changes: PropertyChange[]; description: string }) => {
        set((state) => {
          const historyEntry: PropertyHistoryEntry = {
            id: Date.now().toString(),
            timestamp: new Date(),
            objectIds: [...new Set(entry.changes.map(c => c.objectId))],
            changes: entry.changes,
            description: entry.description,
            canUndo: true
          }

          // Remove any history after current index
          state.history = state.history.slice(0, state.historyIndex + 1)

          // Add new entry
          state.history = [...state.history, historyEntry]
          state.historyIndex = state.history.length - 1

          // Limit history size
          const maxHistory = 50
          if (state.history.length > maxHistory) {
            state.history = state.history.slice(-maxHistory)
            state.historyIndex = state.history.length - 1
          }
        })
      }
    })),
    {
      name: 'property-store',
      version: 1
    }
  )
)