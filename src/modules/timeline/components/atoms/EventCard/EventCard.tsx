/**
 * Event Card Component
 * Single event display with execution status
 */

import React from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import {
  Move,
  Eye,
  EyeOff,
  Zap,
  Sword,
  Settings,
  Cloud,
  Play,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import type { RoundEvent } from '../../../types'
import type {
  MoveEventData,
  AttackEventData,
  SpellEventData,
  InteractionEventData,
  EnvironmentalEventData,
  SequenceEventData
} from '../../../types/events'

export type EventCardProps = {
  event: RoundEvent
  isSelected?: boolean
  isExecuting?: boolean
  onEdit?: (event: RoundEvent) => void
  onDelete?: (event: RoundEvent) => void
  onExecute?: (event: RoundEvent) => void
  onSelect?: (event: RoundEvent) => void
  className?: string
}

// Event type configuration
const eventTypeConfig = {
  move: {
    icon: <Move size={16} />,
    color: '#3b82f6',
    label: 'Move'
  },
  appear: {
    icon: <Eye size={16} />,
    color: '#10b981',
    label: 'Appear'
  },
  disappear: {
    icon: <EyeOff size={16} />,
    color: '#f59e0b',
    label: 'Disappear'
  },
  spell: {
    icon: <Zap size={16} />,
    color: '#8b5cf6',
    label: 'Spell'
  },
  attack: {
    icon: <Sword size={16} />,
    color: '#ef4444',
    label: 'Attack'
  },
  interaction: {
    icon: <Settings size={16} />,
    color: '#06b6d4',
    label: 'Interaction'
  },
  environmental: {
    icon: <Cloud size={16} />,
    color: '#84cc16',
    label: 'Environmental'
  },
  sequence: {
    icon: <Play size={16} />,
    color: '#ec4899',
    label: 'Sequence'
  }
} as const

export const EventCard: React.FC<EventCardProps> = ({
  event,
  isSelected = false,
  isExecuting = false,
  onEdit,
  onDelete,
  onExecute,
  onSelect,
  className
}) => {
  const config = eventTypeConfig[event.type as keyof typeof eventTypeConfig]
  const isExecuted = event.isExecuted

  // Handle card click
  const handleCardClick = () => {
    if (onSelect && !isExecuting) {
      onSelect(event)
    }
  }

  // Handle edit click
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit && !isExecuting && !isExecuted) {
      onEdit(event)
    }
  }

  // Handle delete click
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete && !isExecuting) {
      onDelete(event)
    }
  }

  // Handle execute click
  const handleExecute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onExecute && !isExecuted && !isExecuting) {
      onExecute(event)
    }
  }

  // Format event description
  const getEventDescription = () => {
    const { type, data } = event

    switch (type) {
      case 'move':
        if (data.type === 'move') {
          const moveData = data as MoveEventData
          return `Move to (${Math.round(moveData.endPosition.x)}, ${Math.round(moveData.endPosition.y)})`
        }
        break
      case 'interaction':
        if (data.type === 'interaction') {
          const interactionData = data as InteractionEventData
          return interactionData.interactionType || 'Interact with object'
        }
        break
      case 'environmental':
        if (data.type === 'environmental') {
          const envData = data as EnvironmentalEventData
          return envData.effectType || 'Environmental effect'
        }
        break
      case 'spell':
        if (data.type === 'spell') {
          const spellData = data as SpellEventData
          return spellData.spellId ? `Cast ${spellData.spellId}` : 'Cast spell'
        }
        break
      case 'attack':
        if (data.type === 'attack') {
          const attackData = data as AttackEventData
          return attackData.weapon.name ? `Attack with ${attackData.weapon.name}` : 'Attack'
        }
        break
      case 'sequence':
        if (data.type === 'sequence') {
          const sequenceData = data as SequenceEventData
          return sequenceData.sequenceType ? `Execute ${sequenceData.sequenceType} sequence` : 'Execute sequence'
        }
        break
      default:
        break
    }
    return 'Unknown event'
  }

  return (
    <Box
      className={className}
      style={{
        position: 'relative',
        padding: '12px',
        borderRadius: '8px',
        border: `1px solid ${isSelected ? config?.color || 'var(--colors-secondary)' : 'var(--colors-gray600)'}`,
        backgroundColor: isExecuted ? 'var(--colors-gray850)' : 'var(--colors-gray800)',
        cursor: isExecuting ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: isExecuted ? 0.7 : 1
      }}
      onClick={handleCardClick}
    >
      {/* Execution status indicator */}
      {isExecuting && (
        <Box
          style={{
            position: 'absolute',
            top: '-2px',
            left: '-2px',
            right: '-2px',
            bottom: '-2px',
            borderRadius: '8px',
            background: `linear-gradient(45deg, ${config?.color || 'var(--colors-secondary)'}, transparent, ${config?.color || 'var(--colors-secondary)'})`,
            backgroundSize: '200% 200%',
            animation: 'gradient 2s ease infinite',
            zIndex: -1
          }}
        />
      )}

      {/* Event Header */}
      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Event type icon */}
          <Box
            style={{
              color: config?.color || 'var(--colors-gray400)',
              opacity: isExecuted ? 0.6 : 1
            }}
          >
            {config?.icon || <AlertCircle size={16} />}
          </Box>

          {/* Event type and order */}
          <Box>
            <Text
              variant="body"
              size="sm"
              style={{
                fontWeight: '600',
                color: isExecuted ? 'var(--colors-gray400)' : 'var(--colors-gray200)'
              }}
            >
              {config?.label || 'Unknown'}
            </Text>
            {event.order !== undefined && (
              <Text
                variant="body"
                size="xs"
                style={{
                  color: 'var(--colors-gray500)',
                  marginLeft: '4px'
                }}
              >
                #{event.order}
              </Text>
            )}
          </Box>
        </Box>

        {/* Status icons */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {isExecuting && (
            <Box style={{ color: 'var(--colors-warning)' }}>
              <Clock size={14} />
            </Box>
          )}
          {isExecuted && (
            <Box style={{ color: 'var(--colors-success)' }}>
              <CheckCircle size={14} />
            </Box>
          )}
        </Box>
      </Box>

      {/* Event description */}
      <Text
        variant="body"
        size="sm"
        style={{
          color: isExecuted ? 'var(--colors-gray500)' : 'var(--colors-gray300)',
          marginBottom: '8px',
          lineHeight: '1.4'
        }}
      >
        {getEventDescription()}
      </Text>

      {/* Token ID */}
      <Text
        variant="body"
        size="xs"
        style={{
          color: 'var(--colors-gray500)',
          marginBottom: '8px'
        }}
      >
        Token: {event.data && 'tokenId' in event.data ? (event.data as any).tokenId : 'N/A'}
      </Text>

      {/* Event-specific details */}
      {event.type === 'spell' && event.data && (
        <Box style={{ marginBottom: '8px' }}>
          <Text
            variant="body"
            size="xs"
            style={{ color: 'var(--colors-purple400)' }}
          >
            {(event.data as any).category && `${(event.data as any).category} spell`}
          </Text>
        </Box>
      )}

      {event.type === 'attack' && event.data && (
        <Box style={{ marginBottom: '8px' }}>
          <Text
            variant="body"
            size="xs"
            style={{ color: 'var(--colors-red400)' }}
          >
            {(event.data as any).damage && `Damage: ${(event.data as any).damage}`}
          </Text>
        </Box>
      )}

      {event.type === 'move' && event.data && (
        <Box style={{ marginBottom: '8px' }}>
          <Text
            variant="body"
            size="xs"
            style={{ color: 'var(--colors-blue400)' }}
          >
            {(event.data as any).duration && `Duration: ${(event.data as any).duration}ms`}
          </Text>
        </Box>
      )}

      {/* Action buttons */}
      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box style={{ display: 'flex', gap: '4px' }}>
          {/* Edit button */}
          {onEdit && !isExecuted && !isExecuting && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              style={{ padding: '4px' }}
            >
              <Edit size={12} />
            </Button>
          )}

          {/* Delete button */}
          {onDelete && !isExecuting && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              style={{ padding: '4px', color: 'var(--colors-error)' }}
            >
              <Trash2 size={12} />
            </Button>
          )}
        </Box>

        {/* Execute button */}
        {onExecute && !isExecuted && !isExecuting && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExecute}
            style={{
              fontSize: '11px',
              padding: '4px 8px',
              borderColor: config?.color,
              color: config?.color
            }}
          >
            Execute
          </Button>
        )}

        {/* Execution status */}
        {isExecuting && (
          <Text
            variant="body"
            size="xs"
            style={{
              color: 'var(--colors-warning)',
              fontWeight: '500'
            }}
          >
            Executing...
          </Text>
        )}

        {isExecuted && (
          <Text
            variant="body"
            size="xs"
            style={{
              color: 'var(--colors-success)',
              fontWeight: '500'
            }}
          >
            Completed
          </Text>
        )}
      </Box>

      {/* Round information */}
      <Box
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          backgroundColor: 'var(--colors-gray700)',
          padding: '2px 6px',
          borderRadius: '10px'
        }}
      >
        <Text
          variant="body"
          size="xs"
          style={{ color: 'var(--colors-gray300)' }}
        >
          R{event.roundId || 'N/A'}
        </Text>
      </Box>
    </Box>
  )
}

export default EventCard