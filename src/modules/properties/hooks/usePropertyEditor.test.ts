/**
 * Property Editor Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePropertyEditor, usePropertyField } from './usePropertyEditor'

// Mock the store
vi.mock('../store', () => ({
  usePropertyStore: vi.fn(() => ({
    editing: {
      selectedObjectIds: ['test-object-1'],
      currentValues: {
        'test-object-1': {
          objectId: 'test-object-1',
          objectType: 'token',
          values: { name: 'Test Token', size: 'medium' },
          isValid: true,
          errors: {},
          warnings: {},
          lastModified: new Date()
        }
      },
      validationResults: {},
      isDirty: false,
      isValidating: false,
      lastSaved: null,
      activeGroupId: null,
      expandedGroups: new Set()
    },
    multiSelection: null,
    config: {
      enableDNDValidation: true,
      enforceOfficialRules: false,
      allowCustomProperties: true,
      showHelpText: true,
      showWarnings: true,
      autoSave: true,
      autoSaveDelay: 2000,
      validationDelay: 300
    },
    history: [],
    historyIndex: -1,
    isPropertiesPanelOpen: true,
    collapsedPanels: new Set(),

    // Mock actions
    selectObjects: vi.fn(),
    clearSelection: vi.fn(),
    addToSelection: vi.fn(),
    removeFromSelection: vi.fn(),
    updateProperty: vi.fn(),
    updateMultipleProperties: vi.fn(),
    batchUpdateProperties: vi.fn(),
    validateObject: vi.fn(() => Promise.resolve([])),
    validateAll: vi.fn(() => Promise.resolve()),
    clearValidation: vi.fn(),
    getSchema: vi.fn(() => null),
    getFields: vi.fn(() => []),
    getGroups: vi.fn(() => []),
    getPropertyValues: vi.fn((id) => id === 'test-object-1' ? {
      objectId: 'test-object-1',
      objectType: 'token',
      values: { name: 'Test Token', size: 'medium' },
      isValid: true,
      errors: {},
      warnings: {},
      lastModified: new Date()
    } : null),
    setPropertyValues: vi.fn(),
    resetToDefaults: vi.fn(),
    enableMultiSelection: vi.fn(),
    disableMultiSelection: vi.fn(),
    getCommonProperties: vi.fn(() => ({})),
    updateCommonProperty: vi.fn(),
    commitChanges: vi.fn(),
    undo: vi.fn(() => true),
    redo: vi.fn(() => false),
    clearHistory: vi.fn(),
    togglePropertiesPanel: vi.fn(),
    setActiveGroup: vi.fn(),
    toggleGroupExpanded: vi.fn(),
    togglePanelCollapsed: vi.fn(),
    updateConfig: vi.fn(),
    getDirtyObjects: vi.fn(() => []),
    saveAll: vi.fn(() => Promise.resolve()),
    discardChanges: vi.fn()
  }))
}))

describe('usePropertyEditor Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('provides property editor state', () => {
    const { result } = renderHook(() => usePropertyEditor())

    expect(result.current.selectionState).toMatchObject({
      selectedObjectIds: ['test-object-1'],
      selectedCount: 1,
      hasSelection: true,
      isMultiSelection: false
    })

    expect(result.current.editingState).toMatchObject({
      isDirty: false,
      isValidating: false,
      dirtyObjectIds: []
    })

    expect(result.current.config).toMatchObject({
      enableDNDValidation: true,
      enforceOfficialRules: false
    })
  })

  it('provides selection management functions', () => {
    const { result } = renderHook(() => usePropertyEditor())

    expect(typeof result.current.selectObjects).toBe('function')
    expect(typeof result.current.clearSelection).toBe('function')
    expect(typeof result.current.addToSelection).toBe('function')
    expect(typeof result.current.removeFromSelection).toBe('function')
  })

  it('provides property editing functions', () => {
    const { result } = renderHook(() => usePropertyEditor())

    expect(typeof result.current.updateProperty).toBe('function')
    expect(typeof result.current.updateMultipleProperties).toBe('function')
    expect(typeof result.current.batchUpdate).toBe('function')
    expect(typeof result.current.resetToDefaults).toBe('function')
  })

  it('provides validation functions', () => {
    const { result } = renderHook(() => usePropertyEditor())

    expect(typeof result.current.validateObject).toBe('function')
    expect(typeof result.current.validateAll).toBe('function')
    expect(typeof result.current.clearValidation).toBe('function')
  })

  it('provides schema access functions', () => {
    const { result } = renderHook(() => usePropertyEditor())

    expect(typeof result.current.getSchema).toBe('function')
    expect(typeof result.current.getFields).toBe('function')
    expect(typeof result.current.getGroups).toBe('function')
    expect(typeof result.current.getPropertyValues).toBe('function')
  })

  it('provides history management', () => {
    const { result } = renderHook(() => usePropertyEditor())

    expect(result.current.historyState).toMatchObject({
      canUndo: false,
      canRedo: false,
      historyLength: 0,
      currentIndex: -1
    })

    expect(typeof result.current.undo).toBe('function')
    expect(typeof result.current.redo).toBe('function')
    expect(typeof result.current.clearHistory).toBe('function')
  })

  it('provides UI state management', () => {
    const { result } = renderHook(() => usePropertyEditor())

    expect(result.current.ui).toMatchObject({
      isPropertiesPanelOpen: true,
      collapsedPanels: [],
      isPanelCollapsed: expect.any(Function),
      isGroupExpanded: expect.any(Function),
      togglePropertiesPanel: expect.any(Function),
      togglePanelCollapsed: expect.any(Function),
      toggleGroupExpanded: expect.any(Function),
      setActiveGroup: expect.any(Function)
    })
  })

  it('calculates validation summary correctly', () => {
    const { result } = renderHook(() => usePropertyEditor())

    expect(result.current.validationSummary).toMatchObject({
      totalValidations: 0,
      errorCount: 0,
      warningCount: 0,
      dndComplianceIssues: 0,
      hasErrors: false,
      hasWarnings: false,
      isFullyCompliant: true
    })
  })

  it('provides primary object properties', () => {
    const { result } = renderHook(() => usePropertyEditor())

    expect(result.current.primaryObjectProperties).toMatchObject({
      objectId: 'test-object-1',
      objectType: 'token',
      values: expect.objectContaining({
        values: { name: 'Test Token', size: 'medium' }
      })
    })
  })

  it('calls property update with validation', async () => {
    const mockUpdateProperty = vi.fn()
    vi.mocked(require('../store').usePropertyStore).mockReturnValue({
      ...vi.mocked(require('../store').usePropertyStore)(),
      updateProperty: mockUpdateProperty
    })

    const { result } = renderHook(() => usePropertyEditor())

    act(() => {
      result.current.updateProperty('test-object-1', 'name', 'New Name')
    })

    expect(mockUpdateProperty).toHaveBeenCalledWith('test-object-1', 'name', 'New Name')
  })
})

describe('usePropertyField Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('provides field state for existing property', () => {
    const { result } = renderHook(() =>
      usePropertyField('test-object-1', 'name')
    )

    expect(result.current).toMatchObject({
      value: 'Test Token',
      isValid: true,
      errors: [],
      warnings: [],
      isDirty: false
    })

    expect(typeof result.current.updateValue).toBe('function')
    expect(typeof result.current.validateField).toBe('function')
  })

  it('handles non-existent object gracefully', () => {
    const { result } = renderHook(() =>
      usePropertyField('non-existent', 'name')
    )

    expect(result.current).toMatchObject({
      value: undefined,
      isValid: true,
      errors: [],
      warnings: [],
      isDirty: false
    })
  })

  it('updates field value', () => {
    const mockUpdateProperty = vi.fn()
    vi.mocked(require('../store').usePropertyStore).mockReturnValue({
      ...vi.mocked(require('../store').usePropertyStore)(),
      updateProperty: mockUpdateProperty
    })

    const { result } = renderHook(() =>
      usePropertyField('test-object-1', 'name')
    )

    act(() => {
      result.current.updateValue('Updated Name')
    })

    expect(mockUpdateProperty).toHaveBeenCalledWith('test-object-1', 'name', 'Updated Name')
  })

  it('validates field when validation is enabled', async () => {
    const mockValidateObject = vi.fn(() => Promise.resolve([]))
    vi.mocked(require('../store').usePropertyStore).mockReturnValue({
      ...vi.mocked(require('../store').usePropertyStore)(),
      validateObject: mockValidateObject,
      config: { enableDNDValidation: true }
    })

    const { result } = renderHook(() =>
      usePropertyField('test-object-1', 'name')
    )

    await act(async () => {
      await result.current.validateField()
    })

    expect(mockValidateObject).toHaveBeenCalledWith('test-object-1')
  })
})