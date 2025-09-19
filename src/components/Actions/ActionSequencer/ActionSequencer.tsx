import React, { memo, useState, useCallback } from 'react'
import { Play, Pause, Square, Plus, Trash2, Copy, Settings } from 'lucide-react'
import {
  SEQUENCE_TYPES,
  SEQUENCE_TIMING,
  SEQUENCE_PRIORITIES,
  SEQUENCE_TEMPLATES,
  SEQUENCE_STATUS
} from '@/constants'
import type { SequenceEventData, SequenceAction, SequenceResult } from '@/types'
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
        sequenceType: template.type as any,
        templateId,
        actions: template.actions.map((action, index) => ({
          id: `action-${index}`,
          type: action.type as any,
          timing: action.timing as any,
          priority: action.priority,
          delay: action.delay,
          conditions: action.conditions?.map(cond => ({
            type: cond as any,
          })),
          data: {} as any, // Will be filled by specific action config
          modifiers: action.modifiers,
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
      data: {} as any,
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
    <Panel size="sidebar" css={{ borderLeft: '1px solid $gray800' }}>
      <PanelBody>
        <PanelSection>
          <Box display="flex" alignItems="center" gap="2" css={{ marginBottom: '$3' }}>
            <Play size={20} />
            <Text size="md" weight="medium">Action Sequencer</Text>
          </Box>

          {/* Sequence Template Selection */}
          <Box css={{ marginBottom: '$4' }}>
            <FieldLabel css={{ marginBottom: '$2' }}>Sequence Templates</FieldLabel>
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
          <Box css={{ marginBottom: '$4' }}>
            <FieldLabel css={{ marginBottom: '$2' }}>Sequence Name</FieldLabel>
            <Input
              value={sequence.sequenceName || ''}
              onChange={(e) => onSequenceChange({ ...sequence, sequenceName: e.target.value })}
              placeholder="Enter sequence name..."
              size="sm"
            />
          </Box>

          <Box css={{ marginBottom: '$4' }}>
            <FieldLabel css={{ marginBottom: '$2' }}>Sequence Type</FieldLabel>
            <Select
              value={sequence.sequenceType || 'simple'}
              onValueChange={(type) => onSequenceChange({ ...sequence, sequenceType: type as any })}
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
          <Box css={{ marginBottom: '$4' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" css={{ marginBottom: '$2' }}>
              <FieldLabel>Actions ({sequence.actions?.length || 0})</FieldLabel>
              <Button
                onClick={handleAddAction}
                variant="outline"
                size="sm"
                css={{
                  backgroundColor: '$gray800',
                  '&:hover': { backgroundColor: '$gray700' }
                }}
              >
                <Plus size={14} />
              </Button>
            </Box>

            <Box css={{ maxHeight: '300px', overflowY: 'auto' }}>
              {(sequence.actions || []).map((action, index) => (
                <Box
                  key={action.id}
                  css={{
                    padding: '$2',
                    marginBottom: '$2',
                    backgroundColor: selectedActionIndex === index ? '$gray700' : '$gray800',
                    borderRadius: '$sm',
                    border: '1px solid $gray600',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '$gray700'
                    }
                  }}
                  onClick={() => setSelectedActionIndex(selectedActionIndex === index ? -1 : index)}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap="2">
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
                    <Box display="flex" alignItems="center" gap="1">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDuplicateAction(index)
                        }}
                        variant="ghost"
                        size="sm"
                        css={{ padding: '$1' }}
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
                        css={{ padding: '$1', color: '$red400' }}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </Box>
                  </Box>

                  {selectedActionIndex === index && (
                    <Box css={{ marginTop: '$2', paddingTop: '$2', borderTop: '1px solid $gray600' }}>
                      <Box display="flex" gap="2" css={{ marginBottom: '$2' }}>
                        <Box css={{ flex: 1 }}>
                          <FieldLabel css={{ marginBottom: '$1' }}>Timing</FieldLabel>
                          <Select
                            value={action.timing}
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
                        <Box css={{ flex: 1 }}>
                          <FieldLabel css={{ marginBottom: '$1' }}>Priority</FieldLabel>
                          <Input
                            type="number"
                            value={action.priority}
                            onChange={(e) => handleActionUpdate(index, { priority: parseInt(e.target.value) || 0 })}
                            min="0"
                            max="100"
                            size="sm"
                          />
                        </Box>
                      </Box>

                      {action.timing === 'delayed' && (
                        <Box css={{ marginBottom: '$2' }}>
                          <FieldLabel css={{ marginBottom: '$1' }}>Delay (ms)</FieldLabel>
                          <Input
                            type="number"
                            value={action.delay || 0}
                            onChange={(e) => handleActionUpdate(index, { delay: parseInt(e.target.value) || 0 })}
                            min="0"
                            size="sm"
                          />
                        </Box>
                      )}

                      <Box css={{ marginBottom: '$2' }}>
                        <Box display="flex" alignItems="center" gap="2">
                          <input
                            type="checkbox"
                            checked={action.optional || false}
                            onChange={(e) => handleActionUpdate(index, { optional: e.target.checked })}
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
          <Box css={{ marginBottom: '$4' }}>
            <FieldLabel css={{ marginBottom: '$2' }}>Execution</FieldLabel>
            <Box display="flex" gap="2">
              <Button
                onClick={handleExecute}
                disabled={isExecuting || !sequence.sequenceName || !sequence.actions?.length}
                variant="primary"
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
                {isExecuting ? <Pause size={16} /> : <Play size={16} />}
                {isExecuting ? 'Running...' : 'Execute'}
              </Button>

              <Button
                onClick={() => setPreviewMode(!previewMode)}
                variant="outline"
                css={{
                  backgroundColor: '$gray700',
                  '&:hover': { backgroundColor: '$gray600' }
                }}
              >
                <Settings size={16} />
                Preview
              </Button>
            </Box>
          </Box>

          {/* Execution Status */}
          {executionResult && (
            <Box css={{ marginBottom: '$4' }}>
              <FieldLabel css={{ marginBottom: '$2' }}>Status</FieldLabel>
              <Box
                css={{
                  padding: '$2',
                  backgroundColor: '$gray800',
                  borderRadius: '$sm',
                  border: `1px solid ${getSequenceStatusColor()}`,
                }}
              >
                <Text size="sm" css={{ color: getSequenceStatusColor() }}>
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
          <Box css={{ marginBottom: '$4' }}>
            <FieldLabel css={{ marginBottom: '$2' }}>Description</FieldLabel>
            <Input
              value={sequence.description || ''}
              onChange={(e) => onSequenceChange({ ...sequence, description: e.target.value })}
              placeholder="Describe the sequence..."
              size="sm"
            />
          </Box>
        </PanelSection>
      </PanelBody>
    </Panel>
  )
}

export const ActionSequencer = memo(ActionSequencerComponent)
ActionSequencer.displayName = 'ActionSequencer'