/**
 * Event Card Component
 * Single event display with execution status
 */

import React from 'react'
import { styled } from '@/foundation/theme'
import type { RoundEvent, EventType } from '../../../types'

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

const Card = styled('div', {
  position: 'relative',
  padding: '$2',
  borderRadius: '$md',
  border: '1px solid $gray600',
  background: '$gray800',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    borderColor: '$gray500',
    background: '$gray750'
  },

  variants: {
    selected: {
      true: {
        borderColor: '$dndRed',
        background: '$gray750',
        boxShadow: '0 0 0 1px $dndRed'
      }
    },

    executed: {
      true: {
        opacity: 0.7,
        background: '$gray850'
      }
    },

    executing: {
      true: {
        borderColor: '$orange500',
        background: '$orange900',
        animation: 'pulse 1s infinite'
      }
    }
  }
})

const Header = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '$2',
  marginBottom: '$1'
})

const EventName = styled('div', {
  fontSize: '$2',
  fontWeight: 600,
  color: '$gray100',
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
})

const EventType = styled('span', {
  fontSize: '$1',
  fontWeight: 500,
  padding: '$1 $2',
  borderRadius: '$sm',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',

  variants: {
    type: {
      move: {
        background: '$blue900',
        color: '$blue200'
      },
      attack: {
        background: '$red900',
        color: '$red200'
      },
      spell: {
        background: '$purple900',
        color: '$purple200'
      },
      interaction: {
        background: '$green900',
        color: '$green200'
      },
      environmental: {
        background: '$yellow900',
        color: '$yellow200'
      },
      sequence: {
        background: '$gray700',
        color: '$gray200'
      }
    }
  }
})

const Details = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  fontSize: '$1',
  color: '$gray400'
})

const OrderBadge = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$1',
  fontSize: '$1',
  color: '$gray300'
})

const Duration = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$1'
})

const StatusIndicator = styled('div', {
  position: 'absolute',
  top: 4,
  right: 4,
  width: 8,
  height: 8,
  borderRadius: '$round',

  variants: {
    status: {
      pending: {
        background: '$gray500'
      },
      executed: {
        background: '$green500'
      },
      executing: {
        background: '$orange500',
        animation: 'pulse 1s infinite'
      },
      failed: {
        background: '$red500'
      }
    }
  }
})

const Actions = styled('div', {
  position: 'absolute',
  top: '50%',
  right: '$2',
  transform: 'translateY(-50%)',
  display: 'flex',
  gap: '$1',
  opacity: 0,
  transition: 'opacity 0.2s ease',

  [`${Card}:hover &`]: {
    opacity: 1
  }
})

const ActionButton = styled('button', {
  width: 20,
  height: 20,
  borderRadius: '$sm',
  border: 'none',
  background: '$gray700',
  color: '$gray300',
  cursor: 'pointer',
  fontSize: '$1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',

  '&:hover': {
    background: '$gray600',
    color: '$gray100'
  },

  variants: {
    action: {
      execute: {
        '&:hover': {
          background: '$green700',
          color: 'white'
        }
      },
      edit: {
        '&:hover': {
          background: '$blue700',
          color: 'white'
        }
      },
      delete: {
        '&:hover': {
          background: '$red700',
          color: 'white'
        }
      }
    }
  }
})

/**
 * Format duration in milliseconds to readable string
 */
const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

/**
 * Get status based on event state
 */
const getEventStatus = (event: RoundEvent, isExecuting: boolean) => {
  if (isExecuting) return 'executing'
  if (event.isExecuted) return 'executed'
  return 'pending'
}

/**
 * Event card component with actions and status
 */
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
  const status = getEventStatus(event, isExecuting)

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onSelect) {
      onSelect(event)
    }
  }

  const handleExecute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onExecute && !event.isExecuted && !isExecuting) {
      onExecute(event)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(event)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(event)
    }
  }

  return (
    <Card
      selected={isSelected}
      executed={event.isExecuted}
      executing={isExecuting}
      onClick={handleCardClick}
      className={className}
    >
      <StatusIndicator status={status} />

      <Header>
        <EventName title={event.name}>
          {event.name}
        </EventName>
        <EventType type={event.type as EventType}>
          {event.type}
        </EventType>
      </Header>

      <Details>
        <OrderBadge>
          #{event.order}
        </OrderBadge>
        <Duration>
          ⏱ {formatDuration(event.duration)}
        </Duration>
        {event.canSkip && (
          <span style={{ fontSize: '10px' }}>⏭ Skippable</span>
        )}
      </Details>

      <Actions>
        {!event.isExecuted && onExecute && (
          <ActionButton
            action="execute"
            onClick={handleExecute}
            disabled={isExecuting}
            title="Execute event"
          >
            ▶
          </ActionButton>
        )}
        {onEdit && (
          <ActionButton
            action="edit"
            onClick={handleEdit}
            title="Edit event"
          >
            ✏
          </ActionButton>
        )}
        {onDelete && (
          <ActionButton
            action="delete"
            onClick={handleDelete}
            title="Delete event"
          >
            🗑
          </ActionButton>
        )}
      </Actions>
    </Card>
  )
}