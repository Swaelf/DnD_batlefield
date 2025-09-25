/**
 * Property Editor Hook
 *
 * Main facade hook for property editing functionality
 * following the established patterns from Timeline, Actions, and Spells modules.
 */

import { useMemo, useCallback } from 'react'
import { usePropertyStore } from '../store'
import type {
  PropertyField,
  PropertyGroup,
  PropertyValues,
  PropertyValidationResult,
  PropertyConfig,
  MultiPropertyState,
  MapObject,
  PropertyGroupId
} from '../types'

/**
 * Main hook for property editing interactions
 * Provides a comprehensive API for property management
 */
export function usePropertyEditor() {
  // Get store state and actions
  const {
    editing,
    multiSelection,
    config,
    history,
    historyIndex,
    isPropertiesPanelOpen,
    collapsedPanels,

    // Actions
    selectObjects,
    clearSelection,
    addToSelection,
    removeFromSelection,
    updateProperty,
    updateMultipleProperties,
    batchUpdateProperties,
    validateObject,
    validateAll,
    clearValidation,
    getSchema,
    getFields,
    getGroups,
    getPropertyValues,
    setPropertyValues,
    resetToDefaults,
    enableMultiSelection,
    disableMultiSelection,
    getCommonProperties,
    updateCommonProperty,
    commitChanges,
    undo,
    redo,
    clearHistory,
    togglePropertiesPanel,
    setActiveGroup,
    toggleGroupExpanded,
    togglePanelCollapsed,
    updateConfig,
    getDirtyObjects,
    saveAll,
    discardChanges
  } = usePropertyStore()

  // Memoized selection state
  const selectionState = useMemo(() => ({
    selectedObjectIds: editing.selectedObjectIds,
    selectedCount: editing.selectedObjectIds.length,
    hasSelection: editing.selectedObjectIds.length > 0,
    isMultiSelection: editing.selectedObjectIds.length > 1,
    multiSelection
  }), [editing.selectedObjectIds, multiSelection])

  // Memoized editing state
  const editingState = useMemo(() => ({
    isDirty: editing.isDirty,
    isValidating: editing.isValidating,
    lastSaved: editing.lastSaved,
    activeGroupId: editing.activeGroupId,
    expandedGroups: editing.expandedGroups,
    dirtyObjectIds: getDirtyObjects()
  }), [
    editing.isDirty,
    editing.isValidating,
    editing.lastSaved,
    editing.activeGroupId,
    editing.expandedGroups,
    getDirtyObjects
  ])

  // Memoized history state
  const historyState = useMemo(() => ({
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    historyLength: history.length,
    currentIndex: historyIndex
  }), [history, historyIndex])

  // Get properties for the first selected object (primary selection)
  const primaryObjectProperties = useMemo(() => {
    if (editing.selectedObjectIds.length === 0) return null

    const primaryObjectId = editing.selectedObjectIds[0]
    const values = getPropertyValues(primaryObjectId)

    if (!values) return null

    const schema = getSchema(values.objectType)
    const fields = getFields(values.objectType)
    const groups = getGroups(values.objectType)

    return {
      objectId: primaryObjectId,
      objectType: values.objectType,
      values,
      schema,
      fields,
      groups,
      validation: editing.validationResults[primaryObjectId] || []
    }
  }, [
    editing.selectedObjectIds,
    editing.currentValues,
    editing.validationResults,
    getPropertyValues,
    getSchema,
    getFields,
    getGroups
  ])

  // Property update with validation
  const updatePropertyWithValidation = useCallback((
    objectId: string,
    fieldKey: string,
    value: unknown,
    skipValidation = false
  ) => {
    updateProperty(objectId, fieldKey, value)

    if (!skipValidation && config.enableDNDValidation) {
      // Debounced validation happens in the store
      // This could trigger additional UI feedback
    }
  }, [updateProperty, config.enableDNDValidation])

  // Batch update with validation
  const batchUpdateWithValidation = useCallback((
    objectIds: readonly string[],
    changes: Record<string, unknown>,
    reason: string
  ) => {
    batchUpdateProperties({
      objectIds,
      changes,
      skipValidation: false,
      reason
    })
  }, [batchUpdateProperties])

  // Get validation summary
  const validationSummary = useMemo(() => {
    const results = Object.values(editing.validationResults).flat()
    const errors = results.filter(r => !r.isValid)
    const warnings = results.filter(r => r.warnings.length > 0)
    const dndNonCompliant = results.filter(r => !r.dndCompliant)

    return {
      totalValidations: results.length,
      errorCount: errors.length,
      warningCount: warnings.length,
      dndComplianceIssues: dndNonCompliant.length,
      hasErrors: errors.length > 0,
      hasWarnings: warnings.length > 0,
      isFullyCompliant: dndNonCompliant.length === 0
    }
  }, [editing.validationResults])

  // UI helpers
  const ui = useMemo(() => ({
    isPropertiesPanelOpen,
    collapsedPanels: Array.from(collapsedPanels),
    isPanelCollapsed: (panelId: string) => collapsedPanels.has(panelId),
    isGroupExpanded: (groupId: string) => editing.expandedGroups.has(groupId),
    togglePropertiesPanel,
    togglePanelCollapsed,
    toggleGroupExpanded,
    setActiveGroup
  }), [
    isPropertiesPanelOpen,
    collapsedPanels,
    editing.expandedGroups,
    togglePropertiesPanel,
    togglePanelCollapsed,
    toggleGroupExpanded,
    setActiveGroup
  ])

  return {
    // State
    selectionState,
    editingState,
    historyState,
    validationSummary,
    primaryObjectProperties,
    config,

    // Selection management
    selectObjects,
    clearSelection,
    addToSelection,
    removeFromSelection,

    // Property editing
    updateProperty: updatePropertyWithValidation,
    updateMultipleProperties,
    batchUpdate: batchUpdateWithValidation,
    resetToDefaults,

    // Multi-selection
    enableMultiSelection,
    disableMultiSelection,
    getCommonProperties,
    updateCommonProperty,

    // Validation
    validateObject,
    validateAll,
    clearValidation,

    // Schema access
    getSchema,
    getFields,
    getGroups,
    getPropertyValues,

    // History
    commitChanges,
    undo,
    redo,
    clearHistory,

    // Persistence
    saveAll,
    discardChanges,

    // Configuration
    updateConfig,

    // UI
    ui
  }
}

/**
 * Hook for property field management
 * Focused on individual field operations
 */
export function usePropertyField(objectId: string, fieldKey: string) {
  const {
    updateProperty,
    getPropertyValues,
    validateObject,
    config
  } = usePropertyStore()

  const propertyValues = getPropertyValues(objectId)

  const fieldState = useMemo(() => {
    if (!propertyValues) {
      return {
        value: undefined,
        isValid: true,
        errors: [],
        warnings: [],
        isDirty: false
      }
    }

    return {
      value: propertyValues.values[fieldKey],
      isValid: !propertyValues.errors[fieldKey],
      errors: propertyValues.errors[fieldKey] || [],
      warnings: propertyValues.warnings[fieldKey] || [],
      isDirty: propertyValues.lastModified > new Date(Date.now() - 1000)
    }
  }, [propertyValues, fieldKey])

  const updateValue = useCallback((value: unknown) => {
    updateProperty(objectId, fieldKey, value)
  }, [updateProperty, objectId, fieldKey])

  const validateField = useCallback(() => {
    if (config.enableDNDValidation) {
      return validateObject(objectId)
    }
    return Promise.resolve([])
  }, [validateObject, objectId, config.enableDNDValidation])

  return {
    ...fieldState,
    updateValue,
    validateField
  }
}

/**
 * Hook for property group management
 * Handles collapsible property groups
 */
export function usePropertyGroups(objectType: MapObject['type']) {
  const {
    getGroups,
    editing,
    toggleGroupExpanded,
    setActiveGroup
  } = usePropertyStore()

  const groups = useMemo(() => getGroups(objectType), [objectType, getGroups])

  const groupStates = useMemo(() => {
    return groups.map(group => ({
      ...group,
      isExpanded: editing.expandedGroups.has(group.id),
      isActive: editing.activeGroupId === group.id
    }))
  }, [groups, editing.expandedGroups, editing.activeGroupId])

  const expandGroup = useCallback((groupId: string) => {
    if (!editing.expandedGroups.has(groupId)) {
      toggleGroupExpanded(groupId)
    }
  }, [toggleGroupExpanded, editing.expandedGroups])

  const collapseGroup = useCallback((groupId: string) => {
    if (editing.expandedGroups.has(groupId)) {
      toggleGroupExpanded(groupId)
    }
  }, [toggleGroupExpanded, editing.expandedGroups])

  const activateGroup = useCallback((groupId: PropertyGroupId) => {
    setActiveGroup(groupId)
    expandGroup(groupId)
  }, [setActiveGroup, expandGroup])

  return {
    groups: groupStates,
    expandGroup,
    collapseGroup,
    activateGroup,
    toggleGroupExpanded
  }
}

/**
 * Hook for property validation
 * Manages validation state and operations
 */
export function usePropertyValidation(objectId?: string) {
  const {
    editing,
    validateObject,
    validateAll,
    clearValidation,
    config
  } = usePropertyStore()

  const validationResults = useMemo(() => {
    if (objectId) {
      return editing.validationResults[objectId] || []
    }
    return Object.values(editing.validationResults).flat()
  }, [editing.validationResults, objectId])

  const validationState = useMemo(() => {
    const errors = validationResults.filter(r => !r.isValid)
    const warnings = validationResults.filter(r => r.warnings.length > 0)
    const dndIssues = validationResults.filter(r => !r.dndCompliant)

    return {
      isValidating: editing.isValidating,
      results: validationResults,
      hasErrors: errors.length > 0,
      hasWarnings: warnings.length > 0,
      hasDNDIssues: dndIssues.length > 0,
      errorCount: errors.length,
      warningCount: warnings.length,
      dndIssueCount: dndIssues.length,
      isValid: errors.length === 0,
      isDNDCompliant: dndIssues.length === 0
    }
  }, [validationResults, editing.isValidating])

  const validate = useCallback(async () => {
    if (objectId) {
      return await validateObject(objectId)
    } else {
      await validateAll()
      return []
    }
  }, [validateObject, validateAll, objectId])

  const clear = useCallback(() => {
    clearValidation(objectId)
  }, [clearValidation, objectId])

  return {
    ...validationState,
    validate,
    clear,
    isEnabled: config.enableDNDValidation,
    enforceOfficial: config.enforceOfficialRules
  }
}

/**
 * Hook for multi-object property editing
 */
export function useMultiPropertyEditor() {
  const {
    multiSelection,
    getCommonProperties,
    updateCommonProperty,
    enableMultiSelection,
    disableMultiSelection
  } = usePropertyStore()

  const multiState = useMemo(() => {
    if (!multiSelection) {
      return {
        isEnabled: false,
        selectedCount: 0,
        commonProperties: {},
        mixedProperties: new Set(),
        canBatchEdit: false
      }
    }

    return {
      isEnabled: true,
      selectedCount: multiSelection.selectedObjectIds.length,
      commonProperties: multiSelection.commonProperties,
      mixedProperties: multiSelection.mixedProperties,
      canBatchEdit: multiSelection.canBatchEdit,
      affectedCount: multiSelection.affectedCount
    }
  }, [multiSelection])

  const updateCommon = useCallback((fieldKey: string, value: unknown) => {
    updateCommonProperty(fieldKey, value)
  }, [updateCommonProperty])

  return {
    ...multiState,
    updateCommon,
    enable: enableMultiSelection,
    disable: disableMultiSelection
  }
}