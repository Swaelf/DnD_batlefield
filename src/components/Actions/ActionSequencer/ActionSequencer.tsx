import React, { memo, useState, useCallback } from 'react'
import { Play, Pause, Plus, Trash2, Copy, Settings } from 'lucide-react'
import {
  SEQUENCE_TYPES,
  SEQUENCE_TIMING,
  SEQUENCE_PRIORITIES,
  SEQUENCE_TEMPLATES
} from '@/constants'
import type { SequenceEventData, SequenceAction, SequenceResult, EventType, EventData, SequenceModifiers, SequenceCondition } from '@/types'
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

// Convert template modifiers to proper SequenceModifiers format
const convertTemplateModifiers = (templateModifiers: unknown): SequenceModifiers | undefined => {
  if (!templateModifiers || typeof templateModifiers !== 'object') return undefined

  const modifiers = templateModifiers as Record<string, unknown>
  const converted: SequenceModifiers = {}

  // Convert underscore format to camelCase
  if (typeof modifiers.damage_bonus === 'string') converted.damageBonus = modifiers.damage_bonus
  if (typeof modifiers.attack_bonus === 'number') converted.attackBonus = modifiers.attack_bonus
  if (typeof modifiers.ac_bonus === 'number') converted.acBonus = modifiers.ac_bonus
  if (typeof modifiers.attack_penalty === 'number') converted.attackPenalty = modifiers.attack_penalty
  if (typeof modifiers.speed_bonus === 'number') converted.speedBonus = modifiers.speed_bonus

  return Object.keys(converted).length > 0 ? converted : undefined
}

type ActionSequencerProps = {
  selectedSequence: Partial<SequenceEventData> | null
  onSequenceChange: (sequence: Partial<SequenceEventData>) => void
  onExecuteSequence?: (sequence: SequenceEventData) => Promise<SequenceResult>
  isExecuting?: boolean
  executionResult?: SequenceResult | null
}

const ActionSequencerComponent: React.FC<ActionSequencerProps> = ({
  selectedSequence,
  onSequenceChange,
  onExecuteSequence,
  isExecuting = false,
  executionResult
}) => {
  const [selectedActionIndex, setSelectedActionIndex] = useState<number>(-1)
  const [previewMode, setPreviewMode] = useState(false)

  const sequence = selectedSequence || {}

  const handleTemplateSelect = useCallback((templateId: string) => {
    const template = SEQUENCE_TEMPLATES[templateId as keyof typeof SEQUENCE_TEMPLATES]
    if (template) {
      const newSequence: Partial<SequenceEventData> = {
        type: 'sequence',
        sequenceName: template.name,
        sequenceType: template.type as SequenceEventData['sequenceType'],
        templateId,
        actions: template.actions.map((action, index) => ({
          id: `action-${index}`,
          type: action.type as Exclude<EventType, 'sequence'>,
          timing: action.timing as SequenceAction['timing'],
          priority: action.priority,
          delay: 'delay' in action && typeof action.delay === 'number' ? action.delay : 0,
          conditions: 'conditions' in action && Array.isArray(action.conditions) ? action.conditions.map((cond: unknown): SequenceCondition =>
            typeof cond === 'object' && cond && 'type' in cond ? ({
              type: String(cond.type) as SequenceCondition['type'],
              value: 'value' in cond ? Number(cond.value) : undefined
            }) : ({ type: 'success' as const })
          ) : [],
          data: {} as Exclude<EventData, SequenceEventData>, // Will be filled by specific action config
          modifiers: 'modifiers' in action ? convertTemplateModifiers(action.modifiers) : undefined,
          optional: false,
        })),
        priority: SEQUENCE_PRIORITIES.NORMAL,
        description: template.description,
      }
      onSequenceChange(newSequence)
    }
  }, [onSequenceChange])

  const handleAddAction = useCallback(() => {
    const newAction: SequenceAction = {
      id: `action-${(sequence.actions?.length || 0) + 1}`,
      type: 'move',
      timing: 'immediate',
      priority: SEQUENCE_PRIORITIES.NORMAL,
      data: {} as Exclude<EventData, SequenceEventData>,
    }

    onSequenceChange({
      ...sequence,
      actions: [...(sequence.actions || []), newAction]
    })
  }, [sequence, onSequenceChange])

  const handleRemoveAction = useCallback((index: number) => {
    const newActions = [...(sequence.actions || [])]
    newActions.splice(index, 1)
    onSequenceChange({
      ...sequence,
      actions: newActions
    })
    setSelectedActionIndex(-1)
  }, [sequence, onSequenceChange])

  const handleDuplicateAction = useCallback((index: number) => {
    if (!sequence.actions) return

    const actionToDuplicate = sequence.actions[index]
    const duplicatedAction: SequenceAction = {
      ...actionToDuplicate,
      id: `action-${sequence.actions.length + 1}`,
    }

    const newActions = [...sequence.actions]
    newActions.splice(index + 1, 0, duplicatedAction)

    onSequenceChange({
      ...sequence,
      actions: newActions
    })
  }, [sequence, onSequenceChange])

  const handleActionUpdate = useCallback((index: number, updates: Partial<SequenceAction>) => {
    if (!sequence.actions) return

    const newActions = [...sequence.actions]
    newActions[index] = { ...newActions[index], ...updates }

    onSequenceChange({
      ...sequence,
      actions: newActions
    })
  }, [sequence, onSequenceChange])

  const handleExecute = useCallback(async () => {
    if (!onExecuteSequence || !sequence.sequenceName) return

    const completeSequence: SequenceEventData = {
      type: 'sequence',
      sequenceName: sequence.sequenceName,
      sequenceType: sequence.sequenceType || 'simple',
      templateId: sequence.templateId,
      actions: sequence.actions || [],
      conditions: sequence.conditions,
      priority: sequence.priority || SEQUENCE_PRIORITIES.NORMAL,
      maxDuration: sequence.maxDuration,
      onSuccess: sequence.onSuccess,
      onFailure: sequence.onFailure,
      description: sequence.description || '',
    }

    await onExecuteSequence(completeSequence)
  }, [onExecuteSequence, sequence])

  const getActionStatusIcon = (index: number) => {
    if (!executionResult) return null

    const actionResult = executionResult.actionResults[index]
    if (!actionResult) return null

    switch (actionResult.status) {
      case 'completed':
        return actionResult.success ? '✅' : '❌'
      case 'running':
        return '⏳'
      case 'pending':
        return '⏸️'
      case 'failed':
        return '💥'
      case 'skipped':
        return '⏭️'
      default:
        return null
    }
  }

  const getSequenceStatusColor = () => {
    if (!executionResult) return '$gray500'

    switch (executionResult.status) {
      case 'completed':
        return '$green600'
      case 'running':
        return '$blue600'
      case 'failed':
        return '$red600'
      case 'paused':
        return '$yellow600'
      case 'cancelled':
        return '$gray600'
      default:
        return '$gray500'
    }
  }

  return (
    <Panel size="sidebar" style={{ borderLeft: '1px solid var(--gray800)' }}>
      <PanelBody>
        <PanelSection>
          <Box display="flex" alignItems="center" style={{ gap: 'var(--space-2)', marginBottom: '12px' }}>
            <Play size={20} />
            <Text size="md" weight="medium">Action Sequencer</Text>
          </Box>

          {/* Sequence Template Selection */}
          <Box style={{ marginBottom: '16px' }}>
            <FieldLabel style={{ marginBottom: '8px' }}>Sequence Templates</FieldLabel>
            <Select
              value=""
              onValueChange={handleTemplateSelect}
              placeholder="Choose a template..."
            >
              {Object.entries(SEQUENCE_TEMPLATES).map(([key, template]) => (
                <SelectOption key={key} value={key}>
                  <Text>{template.name}</Text>
                </SelectOption>
              ))}
            </Select>
          </Box>

          {/* Sequence Configuration */}
          <Box style={{ marginBottom: '16px' }}>
            <FieldLabel style={{ marginBottom: '8px' }}>Sequence Name</FieldLabel>
            <Input
              value={sequence.sequenceName || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSequenceChange({ ...sequence, sequenceName: e.target.value })}
              placeholder="Enter sequence name..."
            />
          </Box>

          <Box style={{ marginBottom: '16px' }}>
            <FieldLabel style={{ marginBottom: '8px' }}>Sequence Type</FieldLabel>
            <Select
              value={sequence.sequenceType || 'simple'}
              onValueChange={(type) => onSequenceChange({ ...sequence, sequenceType: type as SequenceEventData['sequenceType'] })}
            >
              {Object.values(SEQUENCE_TYPES).map((type) => (
                <SelectOption key={type} value={type}>
                  <Text>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                </SelectOption>
              ))}
            </Select>
          </Box>

          <Box style={{ marginBottom: '16px' }}>
            <FieldLabel style={{ marginBottom: '8px' }}>Priority</FieldLabel>
            <Select
              value={sequence.priority?.toString() || SEQUENCE_PRIORITIES.NORMAL.toString()}
              onValueChange={(priority) => onSequenceChange({ ...sequence, priority: parseInt(priority) })}
            >
              <SelectOption value={SEQUENCE_PRIORITIES.CRITICAL.toString()}>Critical (100)</SelectOption>
              <SelectOption value={SEQUENCE_PRIORITIES.HIGH.toString()}>High (75)</SelectOption>
              <SelectOption value={SEQUENCE_PRIORITIES.NORMAL.toString()}>Normal (50)</SelectOption>
              <SelectOption value={SEQUENCE_PRIORITIES.LOW.toString()}>Low (25)</SelectOption>
              <SelectOption value={SEQUENCE_PRIORITIES.BACKGROUND.toString()}>Background (10)</SelectOption>
            </Select>
          </Box>

          {/* Actions List */}
          <Box style={{ marginBottom: '16px' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" style={{ marginBottom: '8px' }}>
              <FieldLabel>Actions ({sequence.actions?.length || 0})</FieldLabel>
              <Button
                onClick={handleAddAction}
                variant="outline"
                size="sm"
                style={{
                  backgroundColor: 'var(--gray800)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--gray700)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--gray800)'}
              >
                <Plus size={14} />
              </Button>
            </Box>

            <Box style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {(sequence.actions || []).map((action, index) => (
                <Box
                  key={action.id}
                  style={{
                    padding: '8px',
                    marginBottom: '8px',
                    backgroundColor: selectedActionIndex === index ? 'var(--colors-gray700)' : 'var(--colors-gray800)',
                    borderRadius: 'var(--radii-sm)',
                    border: '1px solid var(--colors-gray600)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedActionIndex !== index) {
                      e.currentTarget.style.backgroundColor = 'var(--colors-gray700)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedActionIndex !== index) {
                      e.currentTarget.style.backgroundColor = 'var(--colors-gray800)'
                    }
                  }}
                  onClick={() => setSelectedActionIndex(selectedActionIndex === index ? -1 : index)}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" style={{ gap: 'var(--space-2)' }}>
                      <Text size="sm" weight="medium">
                        {index + 1}. {action.type}
                      </Text>
                      <Text size="xs" color="gray400">
                        {action.timing}
                      </Text>
                      {getActionStatusIcon(index) && (
                        <Text size="sm">{getActionStatusIcon(index)}</Text>
                      )}
                    </Box>
                    <Box display="flex" alignItems="center" style={{ gap: 'var(--space-1)' }}>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDuplicateAction(index)
                        }}
                        variant="ghost"
                        size="sm"
                        style={{ padding: '4px' }}
                      >
                        <Copy size={12} />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveAction(index)
                        }}
                        variant="ghost"
                        size="sm"
                        style={{ padding: '4px', color: 'var(--red400)' }}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </Box>
                  </Box>

                  {selectedActionIndex === index && (
                    <Box style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--gray600)' }}>
                      <Box display="flex" style={{ gap: 'var(--space-2)', marginBottom: '8px' }}>
                        <Box style={{ flex: 1 }}>
                          <FieldLabel style={{ marginBottom: '4px' }}>Timing</FieldLabel>
                          <Select
                            value={action.timing}
                            onValueChange={(timing) => handleActionUpdate(index, { timing: timing as SequenceAction['timing'] })}
                            size="sm"
                          >
                            {Object.values(SEQUENCE_TIMING).map((timing) => (
                              <SelectOption key={timing} value={timing}>
                                <Text size="sm">{timing}</Text>
                              </SelectOption>
                            ))}
                          </Select>
                        </Box>
                        <Box style={{ flex: 1 }}>
                          <FieldLabel style={{ marginBottom: '4px' }}>Priority</FieldLabel>
                          <Input
                            type="number"
                            value={action.priority}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleActionUpdate(index, { priority: parseInt(e.target.value) || 0 })}
                            min="0"
                            max="100"
                          />
                        </Box>
                      </Box>

                      {action.timing === 'delayed' && (
                        <Box style={{ marginBottom: '8px' }}>
                          <FieldLabel style={{ marginBottom: '4px' }}>Delay (ms)</FieldLabel>
                          <Input
                            type="number"
                            value={action.delay || 0}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleActionUpdate(index, { delay: parseInt(e.target.value) || 0 })}
                            min="0"
                          />
                        </Box>
                      )}

                      <Box style={{ marginBottom: '8px' }}>
                        <Box display="flex" alignItems="center" style={{ gap: 'var(--space-2)' }}>
                          <input
                            type="checkbox"
                            checked={action.optional || false}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleActionUpdate(index, { optional: e.target.checked })}
                          />
                          <Text size="sm">Optional (sequence continues on failure)</Text>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Execution Controls */}
          <Box style={{ marginBottom: '16px' }}>
            <FieldLabel style={{ marginBottom: '8px' }}>Execution</FieldLabel>
            <Box display="flex" style={{ gap: 'var(--space-2)' }}>
              <Button
                onClick={handleExecute}
                disabled={isExecuting || !sequence.sequenceName || !sequence.actions?.length}
                variant="primary"
                style={{
                  backgroundColor: 'var(--green600)',
                  color: 'var(--white)'
                }}
              >
                {isExecuting ? <Pause size={16} /> : <Play size={16} />}
                {isExecuting ? 'Running...' : 'Execute'}
              </Button>

              <Button
                onClick={() => setPreviewMode(!previewMode)}
                variant="outline"
                style={{
                  backgroundColor: 'var(--gray700)'
                }}
              >
                <Settings size={16} />
                Preview
              </Button>
            </Box>
          </Box>

          {/* Execution Status */}
          {executionResult && (
            <Box style={{ marginBottom: '16px' }}>
              <FieldLabel style={{ marginBottom: '8px' }}>Status</FieldLabel>
              <Box
                style={{
                  padding: '8px',
                  backgroundColor: 'var(--gray800)',
                  borderRadius: '8px',
                  border: `1px solid ${getSequenceStatusColor()}`
                }}
              >
                <Text size="sm" color="gray100">
                  {executionResult.status.toUpperCase()}
                </Text>
                <Text size="xs" color="gray400">
                  Action {executionResult.currentActionIndex + 1} of {executionResult.actionResults.length}
                </Text>
                {executionResult.endTime && (
                  <Text size="xs" color="gray400">
                    Duration: {executionResult.endTime - executionResult.startTime}ms
                  </Text>
                )}
              </Box>
            </Box>
          )}

          {/* Description */}
          <Box style={{ marginBottom: '16px' }}>
            <FieldLabel style={{ marginBottom: '8px' }}>Description</FieldLabel>
            <Input
              value={sequence.description || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSequenceChange({ ...sequence, description: e.target.value })}
              placeholder="Describe the sequence..."
            />
          </Box>
        </PanelSection>
      </PanelBody>
    </Panel>
  )
}

export const ActionSequencer = memo(ActionSequencerComponent)
ActionSequencer.displayName = 'ActionSequencer'