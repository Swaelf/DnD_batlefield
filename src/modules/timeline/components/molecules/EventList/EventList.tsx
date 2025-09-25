/**
 * Event List Component
 * Displays a list of events with selection and actions
 */

import React from 'react'
import { styled } from '@/foundation/theme'
import { EventCard } from '../../atoms'
import type { RoundEvent, EventId } from '../../../types'

export type EventListProps = {
  events: RoundEvent[]
  selectedEventIds?: EventId[]
  executingEventId?: EventId | null
  onEventSelect?: (event: RoundEvent) => void
  onEventEdit?: (event: RoundEvent) => void
  onEventDelete?: (event: RoundEvent) => void
  onEventExecute?: (event: RoundEvent) => void
  emptyMessage?: string
  className?: string
}

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
  minHeight: 100
})

const EmptyState = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$4',
  color: '$gray400',
  textAlign: 'center',
  minHeight: 150
})

const EmptyIcon = styled('div', {
  fontSize: '$6',
  marginBottom: '$2',
  opacity: 0.5
})

const EmptyText = styled('p', {
  margin: 0,
  fontSize: '$2',
  color: '$gray500'
})

const EventsContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2'
})

const ListHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$2 0',
  borderBottom: '1px solid $gray700',
  marginBottom: '$2'
})

const EventCount = styled('span', {
  fontSize: '$1',
  color: '$gray400'
})

const SortControls = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2'
})

const SortButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  gap: '$1',
  padding: '$1 $2',
  borderRadius: '$sm',
  border: '1px solid $gray600',
  background: '$gray800',
  color: '$gray300',
  fontSize: '$1',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    background: '$gray700',
    borderColor: '$gray500'
  },

  variants: {
    active: {
      true: {
        background: '$dndRed',
        borderColor: '$dndRed',
        color: 'white'
      }
    }
  }
})

type SortBy = 'order' | 'name' | 'type' | 'duration'
type SortDirection = 'asc' | 'desc'

/**
 * Event list with sorting and selection
 */
export const EventList: React.FC<EventListProps> = ({
  events,
  selectedEventIds = [],
  executingEventId = null,
  onEventSelect,
  onEventEdit,
  onEventDelete,
  onEventExecute,
  emptyMessage = "No events in this round",
  className
}) => {
  const [sortBy, setSortBy] = React.useState<SortBy>('order')
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc')

  // Sort events based on current sort criteria
  const sortedEvents = React.useMemo(() => {
    const sorted = [...events].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'order':
          aValue = a.order
          bValue = b.order
          break
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'type':
          aValue = a.type
          bValue = b.type
          break
        case 'duration':
          aValue = a.duration
          bValue = b.duration
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [events, sortBy, sortDirection])

  const handleSort = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortBy) => {
    if (sortBy !== field) return '↕'
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  const executedCount = events.filter(e => e.isExecuted).length
  const totalCount = events.length

  if (events.length === 0) {
    return (
      <Container className={className}>
        <EmptyState>
          <EmptyIcon>📝</EmptyIcon>
          <EmptyText>{emptyMessage}</EmptyText>
        </EmptyState>
      </Container>
    )
  }

  return (
    <Container className={className}>
      <ListHeader>
        <EventCount>
          {executedCount} / {totalCount} events completed
        </EventCount>

        <SortControls>
          <SortButton
            active={sortBy === 'order'}
            onClick={() => handleSort('order')}
            title="Sort by execution order"
          >
            Order {getSortIcon('order')}
          </SortButton>
          <SortButton
            active={sortBy === 'name'}
            onClick={() => handleSort('name')}
            title="Sort by name"
          >
            Name {getSortIcon('name')}
          </SortButton>
          <SortButton
            active={sortBy === 'type'}
            onClick={() => handleSort('type')}
            title="Sort by type"
          >
            Type {getSortIcon('type')}
          </SortButton>
          <SortButton
            active={sortBy === 'duration'}
            onClick={() => handleSort('duration')}
            title="Sort by duration"
          >
            Time {getSortIcon('duration')}
          </SortButton>
        </SortControls>
      </ListHeader>

      <EventsContainer>
        {sortedEvents.map(event => (
          <EventCard
            key={event.id}
            event={event}
            isSelected={selectedEventIds.includes(event.id)}
            isExecuting={executingEventId === event.id}
            onSelect={onEventSelect}
            onEdit={onEventEdit}
            onDelete={onEventDelete}
            onExecute={onEventExecute}
          />
        ))}
      </EventsContainer>
    </Container>
  )
}