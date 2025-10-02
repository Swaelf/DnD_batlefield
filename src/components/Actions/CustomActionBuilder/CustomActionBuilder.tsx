import { useState, useCallback, useMemo, type ChangeEvent } from 'react'
import {
  Save,
  Download,
  Upload,
  Code,
  Plus,
  Minus
} from '@/utils/optimizedIcons'
import { nanoid } from 'nanoid'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Input } from '@/components/ui/Input'
import { FieldLabel } from '@/components/ui/FieldLabel'
import { Select } from '@/components/ui/Select'
// import { Modal } from '@/components/ui/Modal' // Unused for now
import type { SequenceEventData, SequenceAction, EventType, EventData } from '@/types'

// Constants - these should be imported from constants file
const SEQUENCE_TYPES = ['simple', 'conditional', 'parallel', 'loop', 'branch'] as const
const SEQUENCE_TIMING = ['immediate', 'delayed', 'conditional'] as const
const ACTION_TYPES = ['move', 'attack', 'spell', 'interaction', 'environmental'] as const
const VALIDATION_RULES = {
  MAX_ACTIONS_PER_SEQUENCE: 10,
  MAX_DELAY_MS: 10000,
  MIN_PRIORITY: 0,
  MAX_PRIORITY: 100
}

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

export const CustomActionBuilder = ({
  selectedAction,
  onActionChange,
  onSaveAction,
  // onLoadAction, // TODO: Implement action loading
  onExportAction,
  onImportAction,
  // savedActions = [] // TODO: Implement saved actions
}: CustomActionBuilderProps) => {
  const [, setValidationErrors] = useState<ValidationError[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [, setShowValidation] = useState(false)

  const action = selectedAction || {
    sequenceName: '',
    sequenceType: 'simple' as const,
    actions: [],
    priority: 50,
    description: ''
  }

  // Validation logic
  const validateAction = useCallback((actionData: Partial<SequenceEventData>): ValidationError[] => {
    const errors: ValidationError[] = []

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

      if (sequenceAction.timing === 'delayed' && (!sequenceAction.delay || sequenceAction.delay < 0)) {
        errors.push({
          field: `actions[${index}].delay`,
          message: `Action ${index + 1}: Delay must be positive for delayed actions`,
          severity: 'error'
        })
      }

      if (sequenceAction.priority < VALIDATION_RULES.MIN_PRIORITY || sequenceAction.priority > VALIDATION_RULES.MAX_PRIORITY) {
        errors.push({
          field: `actions[${index}].priority`,
          message: `Action ${index + 1}: Priority must be between ${VALIDATION_RULES.MIN_PRIORITY} and ${VALIDATION_RULES.MAX_PRIORITY}`,
          severity: 'error'
        })
      }
    })

    return errors
  }, [])

  // Update validation errors when action changes
  const currentErrors = useMemo(() => {
    return validateAction(action)
  }, [action, validateAction])

  // Event handlers
  const handleActionChange = useCallback((updates: Partial<SequenceEventData>) => {
    const updatedAction = { ...action, ...updates }
    onActionChange(updatedAction)
  }, [action, onActionChange])

  const handleAddAction = useCallback(() => {
    const newAction: Partial<SequenceAction> = {
      id: nanoid(),
      type: 'move',
      timing: 'immediate',
      priority: 50,
      data: {} as Exclude<EventData, SequenceEventData> // This would need proper typing based on action type
    }

    const updatedActions = [...(action.actions || []), newAction as SequenceAction]
    handleActionChange({ actions: updatedActions })
  }, [action.actions, handleActionChange])

  const handleRemoveAction = useCallback((index: number) => {
    const updatedActions = action.actions?.filter((_, i) => i !== index) || []
    handleActionChange({ actions: updatedActions })
  }, [action.actions, handleActionChange])

  const handleActionUpdate = useCallback((index: number, updates: Partial<SequenceAction>) => {
    const updatedActions = action.actions?.map((sequenceAction, i) =>
      i === index ? { ...sequenceAction, ...updates } : sequenceAction
    ) || []
    handleActionChange({ actions: updatedActions })
  }, [action.actions, handleActionChange])

  const handleSave = useCallback(() => {
    const errors = validateAction(action)
    if (errors.length === 0 && action.sequenceName && onSaveAction) {
      onSaveAction(action as SequenceEventData)
    } else {
      setValidationErrors(errors)
      setShowValidation(true)
    }
  }, [action, validateAction, onSaveAction])

  const handleExport = useCallback(() => {
    const errors = validateAction(action)
    if (errors.length === 0 && action.sequenceName && onExportAction) {
      onExportAction(action as SequenceEventData)
    } else {
      setValidationErrors(errors)
      setShowValidation(true)
    }
  }, [action, validateAction, onExportAction])

  const hasErrors = currentErrors.filter(e => e.severity === 'error').length > 0

  return (
    <Box padding={4}>
      {/* Header */}
      <Box marginBottom={4}>
        <Text as="h2" size="lg" weight="semibold">
          Custom Action Builder
        </Text>
        <Text size="sm" color="textSecondary">
          Create complex action sequences with conditional execution and timing controls
        </Text>
      </Box>

      {/* Basic Settings */}
      <Box marginBottom={4}>
        <Text as="h3" size="md" weight="medium">
          Basic Settings
        </Text>

        {/* Sequence Name */}
        <Box marginBottom={3}>
          <FieldLabel htmlFor="sequenceName" required>
            Sequence Name
          </FieldLabel>
          <Input
            id="sequenceName"
            value={action.sequenceName || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleActionChange({ sequenceName: e.target.value })
            }
            placeholder="Enter sequence name..."
          />
        </Box>

        {/* Sequence Type */}
        <Box marginBottom={3}>
          <FieldLabel htmlFor="sequenceType">
            Sequence Type
          </FieldLabel>
          <Select
            value={action.sequenceType || 'simple'}
            onValueChange={(value: string) =>
              handleActionChange({ sequenceType: value as SequenceEventData['sequenceType'] })
            }
          >
            {SEQUENCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </Select>
        </Box>

        {/* Priority */}
        <Box marginBottom={3}>
          <FieldLabel htmlFor="priority">
            Priority (0-100)
          </FieldLabel>
          <Input
            id="priority"
            type="number"
            value={action.priority || 50}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleActionChange({ priority: parseInt(e.target.value) || 50 })
            }
            min="0"
            max="100"
          />
        </Box>
      </Box>

      {/* Actions List */}
      <Box marginBottom={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={3}>
          <Text as="h3" size="md" weight="medium">
            Actions ({action.actions?.length || 0})
          </Text>
          <Button
            onClick={handleAddAction}
            variant="outline"
            size="sm"
          >
            <Plus size={14} style={{ marginRight: '4px' }} />
            Add Action
          </Button>
        </Box>

        {/* Actions Container */}
        <Box
          style={{
            maxHeight: '300px',
            overflowY: 'auto',
            border: '1px solid var(--gray600)',
            borderRadius: 'var(--radii-sm)',
            padding: '8px'
          }}
        >
          {action.actions && action.actions.length > 0 ? (
            action.actions.map((sequenceAction, index) => (
              <Box
                key={sequenceAction.id || index}
                padding={3}
                marginBottom={2}
                style={{
                  backgroundColor: 'var(--gray800)',
                  borderRadius: 'var(--radii-sm)',
                  border: '1px solid var(--gray700)'
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
                  <Text size="sm" weight="medium">
                    Action {index + 1}
                  </Text>
                  <Button
                    onClick={() => handleRemoveAction(index)}
                    variant="ghost"
                    size="sm"
                  >
                    <Minus size={14} />
                  </Button>
                </Box>

                {/* Action Type */}
                <Box marginBottom={2}>
                  <FieldLabel>Type</FieldLabel>
                  <Select
                    value={sequenceAction.type || 'move'}
                    onValueChange={(value: string) =>
                      handleActionUpdate(index, { type: value as Exclude<EventType, 'sequence'> })
                    }
                  >
                    {ACTION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </Select>
                </Box>

                {/* Timing */}
                <Box marginBottom={2}>
                  <FieldLabel>Timing</FieldLabel>
                  <Select
                    value={sequenceAction.timing || 'immediate'}
                    onValueChange={(value: string) =>
                      handleActionUpdate(index, { timing: value as SequenceAction['timing'] })
                    }
                  >
                    {SEQUENCE_TIMING.map((timing) => (
                      <option key={timing} value={timing}>
                        {timing.charAt(0).toUpperCase() + timing.slice(1)}
                      </option>
                    ))}
                  </Select>
                </Box>

                {/* Priority and Delay Grid */}
                <Box display="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }} gap={2}>
                  <Box>
                    <FieldLabel>Priority</FieldLabel>
                    <Input
                      type="number"
                      value={sequenceAction.priority || 50}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleActionUpdate(index, { priority: parseInt(e.target.value) || 0 })
                      }
                      min="0"
                      max="100"
                    />
                  </Box>

                  {sequenceAction.timing === 'delayed' && (
                    <Box>
                      <FieldLabel>Delay (ms)</FieldLabel>
                      <Input
                        type="number"
                        value={sequenceAction.delay || 0}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleActionUpdate(index, { delay: parseInt(e.target.value) || 0 })
                        }
                        min="0"
                        max={VALIDATION_RULES.MAX_DELAY_MS}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            ))
          ) : (
            <Box
              padding={4}
              style={{
                textAlign: 'center',
                color: 'var(--gray500)',
                border: '2px dashed var(--gray600)',
                borderRadius: 'var(--radii-sm)'
              }}
            >
              <Text size="sm">No actions added yet. Click the + button to add an action.</Text>
            </Box>
          )}
        </Box>
      </Box>

      {/* Advanced Settings Toggle */}
      <Box marginBottom={4}>
        <Button
          onClick={() => setShowAdvanced(!showAdvanced)}
          variant="ghost"
          size="sm"
          style={{ color: 'var(--gray400)' }}
        >
          <Code size={14} style={{ marginRight: '4px' }} />
          {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
        </Button>

        {showAdvanced && (
          <Box
            marginTop={2}
            padding={3}
            style={{
              backgroundColor: 'var(--gray800)',
              borderRadius: 'var(--radii-sm)'
            }}
          >
            <Box marginBottom={3}>
              <FieldLabel htmlFor="maxDuration">
                Max Duration (ms)
              </FieldLabel>
              <Input
                id="maxDuration"
                type="number"
                value={action.maxDuration || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleActionChange({ maxDuration: parseInt(e.target.value) || undefined })
                }
                placeholder="No limit"
                min="0"
              />
            </Box>

            <Box marginBottom={3}>
              <FieldLabel htmlFor="templateId">
                Template ID
              </FieldLabel>
              <Input
                id="templateId"
                value={action.templateId || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleActionChange({ templateId: e.target.value })
                }
                placeholder="Optional template reference"
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* Validation Errors */}
      {currentErrors.length > 0 && (
        <Box marginBottom={4}>
          <Box marginBottom={2}>
            <FieldLabel>Validation Issues</FieldLabel>
          </Box>
          <Box style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {currentErrors.map((error, index) => (
              <Box
                key={index}
                padding={2}
                marginBottom={1}
                style={{
                  backgroundColor: 'var(--gray800)',
                  borderRadius: 'var(--radii-sm)',
                  borderLeft: `3px solid ${
                    error.severity === 'error' ? 'var(--error)' :
                    error.severity === 'warning' ? 'var(--warning)' : 'var(--info)'
                  }`
                }}
              >
                <Text size="xs" color="error">
                  {error.severity.toUpperCase()}: {error.message}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Description */}
      <Box marginBottom={4}>
        <FieldLabel htmlFor="description">
          Description
        </FieldLabel>
        <Input
          id="description"
          value={action.description || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleActionChange({ description: e.target.value })
          }
          placeholder="Describe what this action does..."
        />
      </Box>

      {/* Action Buttons */}
      <Box marginBottom={4}>
        <Box marginBottom={2}>
          <FieldLabel>Actions</FieldLabel>
        </Box>
        <Box display="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }} gap={2}>
          <Button
            onClick={handleSave}
            disabled={hasErrors || !action.sequenceName}
            variant="primary"
            size="sm"
          >
            <Save size={14} style={{ marginRight: '4px' }} />
            Save
          </Button>

          <Button
            onClick={handleExport}
            disabled={hasErrors || !action.sequenceName}
            variant="outline"
            size="sm"
          >
            <Download size={14} style={{ marginRight: '4px' }} />
            Export
          </Button>

          <Button
            onClick={() => onImportAction?.('')}
            variant="outline"
            size="sm"
          >
            <Upload size={14} style={{ marginRight: '4px' }} />
            Import
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default CustomActionBuilder