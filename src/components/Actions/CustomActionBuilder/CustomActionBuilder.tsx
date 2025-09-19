import React, { memo, useState, useCallback } from 'react'
import {
  Wrench,
  Save,
  Download,
  Upload,
  Copy,
  Trash2,
  Eye,
  Play,
  Code,
  Wand2
} from 'lucide-react'
import { nanoid } from 'nanoid'
import {
  SEQUENCE_TYPES,
  SEQUENCE_TIMING,
  SEQUENCE_PRIORITIES,
  VALIDATION_RULES,
  SEQUENCE_ERRORS
} from '@/constants'
import type { SequenceEventData, SequenceAction, EventType } from '@/types'
import {
  Box,
  Button,
  Text,
  Select,
  SelectOption,
  Input,
  FieldLabel,
  Panel,
  PanelBody,
  PanelSection
} from '@/components/ui'

type CustomActionBuilderProps = {
  selectedAction: Partial<SequenceEventData> | null
  onActionChange: (action: Partial<SequenceEventData>) => void
  onSaveAction?: (action: SequenceEventData) => void
  onLoadAction?: (actionId: string) => void
  onExportAction?: (action: SequenceEventData) => void
  onImportAction?: (actionData: string) => void
  savedActions?: SequenceEventData[]
}

type ValidationError = {
  field: string
  message: string
  severity: 'error' | 'warning' | 'info'
}

const CustomActionBuilderComponent: React.FC<CustomActionBuilderProps> = ({
  selectedAction,
  onActionChange,
  onSaveAction,
  onLoadAction,
  onExportAction,
  onImportAction,
  savedActions = []
}) => {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [previewMode, setPreviewMode] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const action = selectedAction || {}

  const validateAction = useCallback((actionData: Partial<SequenceEventData>): ValidationError[] => {
    const errors: ValidationError[] = []

    // Check required fields
    if (!actionData.sequenceName?.trim()) {
      errors.push({
        field: 'sequenceName',
        message: 'Sequence name is required',
        severity: 'error'
      })
    }

    if (!actionData.actions || actionData.actions.length === 0) {
      errors.push({
        field: 'actions',
        message: 'At least one action is required',
        severity: 'error'
      })
    }

    // Check max actions
    if (actionData.actions && actionData.actions.length > VALIDATION_RULES.MAX_ACTIONS_PER_SEQUENCE) {
      errors.push({
        field: 'actions',
        message: `Maximum ${VALIDATION_RULES.MAX_ACTIONS_PER_SEQUENCE} actions allowed`,
        severity: 'error'
      })
    }

    // Validate individual actions
    actionData.actions?.forEach((sequenceAction, index) => {
      if (!sequenceAction.type) {
        errors.push({
          field: `actions[${index}].type`,
          message: `Action ${index + 1}: Type is required`,
          severity: 'error'
        })
      }

      if (!sequenceAction.timing) {
        errors.push({
          field: `actions[${index}].timing`,
          message: `Action ${index + 1}: Timing is required`,
          severity: 'error'
        })
      }

      if (sequenceAction.timing === 'delayed' && (!sequenceAction.delay || sequenceAction.delay < 0)) {
        errors.push({
          field: `actions[${index}].delay`,
          message: `Action ${index + 1}: Delay must be specified for delayed timing`,
          severity: 'error'
        })
      }

      if (sequenceAction.delay && sequenceAction.delay > VALIDATION_RULES.MAX_DELAY_MS) {
        errors.push({
          field: `actions[${index}].delay`,
          message: `Action ${index + 1}: Delay cannot exceed ${VALIDATION_RULES.MAX_DELAY_MS}ms`,
          severity: 'error'
        })
      }

      if (sequenceAction.priority < 0 || sequenceAction.priority > 100) {
        errors.push({
          field: `actions[${index}].priority`,
          message: `Action ${index + 1}: Priority must be between 0 and 100`,
          severity: 'error'
        })
      }

      // Check for circular dependencies
      if (sequenceAction.dependencies?.includes(sequenceAction.id)) {
        errors.push({
          field: `actions[${index}].dependencies`,
          message: `Action ${index + 1}: Cannot depend on itself`,
          severity: 'error'
        })
      }
    })

    // Check for circular dependencies between actions
    const hasCircularDependency = (actionId: string, visited: Set<string> = new Set()): boolean => {
      if (visited.has(actionId)) return true
      visited.add(actionId)

      const sequenceAction = actionData.actions?.find(a => a.id === actionId)
      if (!sequenceAction?.dependencies) return false

      return sequenceAction.dependencies.some(depId => hasCircularDependency(depId, visited))
    }

    actionData.actions?.forEach((sequenceAction, index) => {
      if (hasCircularDependency(sequenceAction.id)) {
        errors.push({
          field: `actions[${index}].dependencies`,
          message: `Action ${index + 1}: Circular dependency detected`,
          severity: 'error'
        })
      }
    })

    // Warnings for best practices
    if (actionData.actions && actionData.actions.length > 5) {
      errors.push({
        field: 'actions',
        message: 'Consider breaking down complex sequences into smaller ones',
        severity: 'warning'
      })
    }

    if (actionData.maxDuration && actionData.maxDuration > 30000) {
      errors.push({
        field: 'maxDuration',
        message: 'Long sequences may impact game flow',
        severity: 'warning'
      })
    }

    return errors
  }, [])

  const handleActionChange = useCallback((updates: Partial<SequenceEventData>) => {
    const newAction = { ...action, ...updates }
    onActionChange(newAction)

    // Validate after changes
    const errors = validateAction(newAction)
    setValidationErrors(errors)
  }, [action, onActionChange, validateAction])

  const handleAddAction = useCallback(() => {
    const newSequenceAction: SequenceAction = {
      id: nanoid(),
      type: 'move',
      timing: 'immediate',
      priority: SEQUENCE_PRIORITIES.NORMAL,
      data: {} as any, // Will be configured later
    }

    handleActionChange({
      actions: [...(action.actions || []), newSequenceAction]
    })
  }, [action.actions, handleActionChange])

  const handleRemoveAction = useCallback((index: number) => {
    const newActions = [...(action.actions || [])]
    newActions.splice(index, 1)
    handleActionChange({ actions: newActions })
  }, [action.actions, handleActionChange])

  const handleActionUpdate = useCallback((index: number, updates: Partial<SequenceAction>) => {
    if (!action.actions) return

    const newActions = [...action.actions]
    newActions[index] = { ...newActions[index], ...updates }
    handleActionChange({ actions: newActions })
  }, [action.actions, handleActionChange])

  const handleSave = useCallback(() => {
    if (!onSaveAction) return

    const errors = validateAction(action)
    const hasErrors = errors.some(e => e.severity === 'error')

    if (hasErrors) {
      setValidationErrors(errors)
      return
    }

    const completeAction: SequenceEventData = {
      type: 'sequence',
      sequenceName: action.sequenceName || 'Custom Action',
      sequenceType: action.sequenceType || 'simple',
      templateId: action.templateId,
      actions: action.actions || [],
      conditions: action.conditions,
      priority: action.priority || SEQUENCE_PRIORITIES.NORMAL,
      maxDuration: action.maxDuration,
      onSuccess: action.onSuccess,
      onFailure: action.onFailure,
      description: action.description || '',
    }

    onSaveAction(completeAction)
  }, [action, onSaveAction, validateAction])

  const handleExport = useCallback(() => {
    if (!onExportAction || !action.sequenceName) return

    const completeAction: SequenceEventData = {
      type: 'sequence',
      sequenceName: action.sequenceName,
      sequenceType: action.sequenceType || 'simple',
      templateId: action.templateId,
      actions: action.actions || [],
      conditions: action.conditions,
      priority: action.priority || SEQUENCE_PRIORITIES.NORMAL,
      maxDuration: action.maxDuration,
      onSuccess: action.onSuccess,
      onFailure: action.onFailure,
      description: action.description || '',
    }

    onExportAction(completeAction)
  }, [action, onExportAction])

  const handleImport = useCallback(() => {
    if (!onImportAction) return

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        if (content) {
          onImportAction(content)
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }, [onImportAction])

  const getErrorSeverityColor = (severity: ValidationError['severity']) => {
    switch (severity) {
      case 'error':
        return '$red500'
      case 'warning':
        return '$yellow500'
      case 'info':
        return '$blue500'
      default:
        return '$gray500'
    }
  }

  const hasErrors = validationErrors.some(e => e.severity === 'error')

  return (
    <Panel size="sidebar" css={{ borderLeft: '1px solid $gray800' }}>
      <PanelBody>
        <PanelSection>
          <Box display="flex" alignItems="center" gap="2" css={{ marginBottom: '$3' }}>
            <Wrench size={20} />
            <Text size="md" weight="medium">Custom Action Builder</Text>
          </Box>

          {/* Load Saved Actions */}
          {savedActions.length > 0 && (
            <Box css={{ marginBottom: '$4' }}>
              <FieldLabel css={{ marginBottom: '$2' }}>Load Saved Action</FieldLabel>
              <Select
                value=""
                onValueChange={(actionId) => onLoadAction?.(actionId)}
                placeholder="Choose saved action..."
              >
                {savedActions.map((savedAction) => (
                  <SelectOption key={savedAction.templateId || savedAction.sequenceName} value={savedAction.templateId || savedAction.sequenceName}>
                    <Text>{savedAction.sequenceName}</Text>
                  </SelectOption>
                ))}
              </Select>
            </Box>
          )}

          {/* Basic Configuration */}
          <Box css={{ marginBottom: '$4' }}>
            <FieldLabel css={{ marginBottom: '$2' }}>Action Name *</FieldLabel>
            <Input
              value={action.sequenceName || ''}
              onChange={(e) => handleActionChange({ sequenceName: e.target.value })}
              placeholder="Enter action name..."
              size="sm"
              css={{
                borderColor: validationErrors.some(e => e.field === 'sequenceName') ? '$red500' : '$gray600'
              }}
            />
          </Box>

          <Box css={{ marginBottom: '$4' }}>
            <FieldLabel css={{ marginBottom: '$2' }}>Action Type</FieldLabel>
            <Select
              value={action.sequenceType || 'simple'}
              onValueChange={(type) => handleActionChange({ sequenceType: type as any })}
            >
              {Object.values(SEQUENCE_TYPES).map((type) => (
                <SelectOption key={type} value={type}>
                  <Text>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                </SelectOption>
              ))}
            </Select>
          </Box>

          <Box css={{ marginBottom: '$4' }}>
            <FieldLabel css={{ marginBottom: '$2' }}>Priority</FieldLabel>
            <Select
              value={action.priority?.toString() || SEQUENCE_PRIORITIES.NORMAL.toString()}
              onValueChange={(priority) => handleActionChange({ priority: parseInt(priority) })}
            >
              <SelectOption value={SEQUENCE_PRIORITIES.CRITICAL.toString()}>Critical (100)</SelectOption>
              <SelectOption value={SEQUENCE_PRIORITIES.HIGH.toString()}>High (75)</SelectOption>
              <SelectOption value={SEQUENCE_PRIORITIES.NORMAL.toString()}>Normal (50)</SelectOption>
              <SelectOption value={SEQUENCE_PRIORITIES.LOW.toString()}>Low (25)</SelectOption>
              <SelectOption value={SEQUENCE_PRIORITIES.BACKGROUND.toString()}>Background (10)</SelectOption>
            </Select>
          </Box>

          {/* Actions Builder */}
          <Box css={{ marginBottom: '$4' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" css={{ marginBottom: '$2' }}>
              <FieldLabel>Actions ({action.actions?.length || 0}/{VALIDATION_RULES.MAX_ACTIONS_PER_SEQUENCE}) *</FieldLabel>
              <Button
                onClick={handleAddAction}
                variant="outline"
                size="sm"
                disabled={(action.actions?.length || 0) >= VALIDATION_RULES.MAX_ACTIONS_PER_SEQUENCE}
                css={{
                  backgroundColor: '$gray800',
                  '&:hover:not(:disabled)': { backgroundColor: '$gray700' }
                }}
              >
                <Wand2 size={14} />
              </Button>
            </Box>

            <Box css={{
              maxHeight: '400px',
              overflowY: 'auto',
              border: validationErrors.some(e => e.field === 'actions') ? '1px solid $red500' : '1px solid $gray600',
              borderRadius: '$sm',
              padding: '$2'
            }}>
              {(action.actions || []).map((sequenceAction, index) => (
                <Box
                  key={sequenceAction.id}
                  css={{
                    padding: '$3',
                    marginBottom: '$2',
                    backgroundColor: '$gray800',
                    borderRadius: '$sm',
                    border: '1px solid $gray600',
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between" css={{ marginBottom: '$2' }}>
                    <Text size="sm" weight="medium">
                      Action {index + 1}: {sequenceAction.type}
                    </Text>
                    <Button
                      onClick={() => handleRemoveAction(index)}
                      variant="ghost"
                      size="sm"
                      css={{ color: '$red400', padding: '$1' }}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </Box>

                  <Box display="grid" css={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '$2', marginBottom: '$2' }}>
                    <Box>
                      <FieldLabel css={{ marginBottom: '$1' }}>Type</FieldLabel>
                      <Select
                        value={sequenceAction.type}
                        onValueChange={(type) => handleActionUpdate(index, { type: type as EventType })}
                        size="sm"
                      >
                        <SelectOption value="move">Move</SelectOption>
                        <SelectOption value="attack">Attack</SelectOption>
                        <SelectOption value="spell">Spell</SelectOption>
                        <SelectOption value="interaction">Object</SelectOption>
                        <SelectOption value="environmental">Weather</SelectOption>
                      </Select>
                    </Box>

                    <Box>
                      <FieldLabel css={{ marginBottom: '$1' }}>Timing</FieldLabel>
                      <Select
                        value={sequenceAction.timing}
                        onValueChange={(timing) => handleActionUpdate(index, { timing: timing as any })}
                        size="sm"
                      >
                        {Object.values(SEQUENCE_TIMING).map((timing) => (
                          <SelectOption key={timing} value={timing}>
                            <Text size="sm">{timing}</Text>
                          </SelectOption>
                        ))}
                      </Select>
                    </Box>
                  </Box>

                  <Box display="grid" css={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '$2' }}>
                    <Box>
                      <FieldLabel css={{ marginBottom: '$1' }}>Priority</FieldLabel>
                      <Input
                        type="number"
                        value={sequenceAction.priority}
                        onChange={(e) => handleActionUpdate(index, { priority: parseInt(e.target.value) || 0 })}
                        min="0"
                        max="100"
                        size="sm"
                      />
                    </Box>

                    {sequenceAction.timing === 'delayed' && (
                      <Box>
                        <FieldLabel css={{ marginBottom: '$1' }}>Delay (ms)</FieldLabel>
                        <Input
                          type="number"
                          value={sequenceAction.delay || 0}
                          onChange={(e) => handleActionUpdate(index, { delay: parseInt(e.target.value) || 0 })}
                          min="0"
                          max={VALIDATION_RULES.MAX_DELAY_MS}
                          size="sm"
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
              ))}

              {(!action.actions || action.actions.length === 0) && (
                <Box
                  css={{
                    padding: '$4',
                    textAlign: 'center',
                    color: '$gray500',
                    border: '2px dashed $gray600',
                    borderRadius: '$sm'
                  }}
                >
                  <Text size="sm">No actions added yet. Click the + button to add an action.</Text>
                </Box>
              )}
            </Box>
          </Box>

          {/* Advanced Settings */}
          <Box css={{ marginBottom: '$4' }}>
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="ghost"
              size="sm"
              css={{ color: '$gray400', padding: '$1' }}
            >
              <Code size={14} style={{ marginRight: '4px' }} />
              {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
            </Button>

            {showAdvanced && (
              <Box css={{ marginTop: '$2', padding: '$3', backgroundColor: '$gray800', borderRadius: '$sm' }}>
                <Box css={{ marginBottom: '$3' }}>
                  <FieldLabel css={{ marginBottom: '$2' }}>Max Duration (ms)</FieldLabel>
                  <Input
                    type="number"
                    value={action.maxDuration || ''}
                    onChange={(e) => handleActionChange({ maxDuration: parseInt(e.target.value) || undefined })}
                    placeholder="No limit"
                    min="0"
                    size="sm"
                  />
                </Box>

                <Box css={{ marginBottom: '$3' }}>
                  <FieldLabel css={{ marginBottom: '$2' }}>Template ID</FieldLabel>
                  <Input
                    value={action.templateId || ''}
                    onChange={(e) => handleActionChange({ templateId: e.target.value })}
                    placeholder="Custom template identifier..."
                    size="sm"
                  />
                </Box>
              </Box>
            )}
          </Box>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Box css={{ marginBottom: '$4' }}>
              <FieldLabel css={{ marginBottom: '$2' }}>Validation Issues</FieldLabel>
              <Box css={{ maxHeight: '150px', overflowY: 'auto' }}>
                {validationErrors.map((error, index) => (
                  <Box
                    key={index}
                    css={{
                      padding: '$2',
                      marginBottom: '$1',
                      backgroundColor: '$gray800',
                      borderRadius: '$sm',
                      borderLeft: `3px solid ${getErrorSeverityColor(error.severity)}`
                    }}
                  >
                    <Text size="xs" css={{ color: getErrorSeverityColor(error.severity) }}>
                      {error.severity.toUpperCase()}: {error.message}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Description */}
          <Box css={{ marginBottom: '$4' }}>
            <FieldLabel css={{ marginBottom: '$2' }}>Description</FieldLabel>
            <Input
              value={action.description || ''}
              onChange={(e) => handleActionChange({ description: e.target.value })}
              placeholder="Describe what this action does..."
              size="sm"
            />
          </Box>

          {/* Action Buttons */}
          <Box css={{ marginBottom: '$4' }}>
            <FieldLabel css={{ marginBottom: '$2' }}>Actions</FieldLabel>
            <Box display="grid" css={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '$2' }}>
              <Button
                onClick={handleSave}
                disabled={hasErrors || !action.sequenceName}
                variant="primary"
                size="sm"
                css={{
                  backgroundColor: '$green600',
                  color: '$white',
                  '&:hover:not(:disabled)': {
                    backgroundColor: '$green700'
                  },
                  '&:disabled': {
                    opacity: 0.5,
                    cursor: 'not-allowed'
                  }
                }}
              >
                <Save size={14} style={{ marginRight: '4px' }} />
                Save
              </Button>

              <Button
                onClick={() => setPreviewMode(!previewMode)}
                variant="outline"
                size="sm"
                css={{
                  backgroundColor: '$gray700',
                  '&:hover': { backgroundColor: '$gray600' }
                }}
              >
                <Eye size={14} style={{ marginRight: '4px' }} />
                Preview
              </Button>

              <Button
                onClick={handleExport}
                disabled={hasErrors || !action.sequenceName}
                variant="outline"
                size="sm"
                css={{
                  backgroundColor: '$gray700',
                  '&:hover:not(:disabled)': { backgroundColor: '$gray600' }
                }}
              >
                <Download size={14} style={{ marginRight: '4px' }} />
                Export
              </Button>

              <Button
                onClick={handleImport}
                variant="outline"
                size="sm"
                css={{
                  backgroundColor: '$gray700',
                  '&:hover': { backgroundColor: '$gray600' }
                }}
              >
                <Upload size={14} style={{ marginRight: '4px' }} />
                Import
              </Button>
            </Box>
          </Box>
        </PanelSection>
      </PanelBody>
    </Panel>
  )
}

export const CustomActionBuilder = memo(CustomActionBuilderComponent)
CustomActionBuilder.displayName = 'CustomActionBuilder'