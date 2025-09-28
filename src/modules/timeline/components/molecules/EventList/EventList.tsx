/**
 * Event List Component
 * Displays a list of events with selection and actions
 */

import React from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
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
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          minHeight: '100px'
        }}
      >
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            color: 'var(--colors-gray400)',
            textAlign: 'center',
            minHeight: '150px'
          }}
        >
          <Box
            style={{
              fontSize: '48px',
              marginBottom: '8px',
              opacity: 0.5
            }}
          >
            📝
          </Box>
          <Text
            variant="body"
            size="sm"
            style={{
              margin: 0,
              color: 'var(--colors-gray500)'
            }}
          >
            {emptyMessage}
          </Text>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minHeight: '100px'
      }}
    >
      {/* List Header */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 0',
          borderBottom: '1px solid var(--colors-gray700)',
          marginBottom: '8px'
        }}
      >
        <Text
          variant="body"
          size="xs"
          style={{
            color: 'var(--colors-gray400)'
          }}
        >
          {executedCount} / {totalCount} events completed
        </Text>

        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Button
            variant={sortBy === 'order' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleSort('order')}
            title="Sort by execution order"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              backgroundColor: sortBy === 'order' ? 'var(--colors-dndRed)' : 'var(--colors-gray800)',
              borderColor: sortBy === 'order' ? 'var(--colors-dndRed)' : 'var(--colors-gray600)',
              color: sortBy === 'order' ? 'white' : 'var(--colors-gray300)'
            }}
          >
            Order {getSortIcon('order')}
          </Button>
          <Button
            variant={sortBy === 'name' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleSort('name')}
            title="Sort by name"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              backgroundColor: sortBy === 'name' ? 'var(--colors-dndRed)' : 'var(--colors-gray800)',
              borderColor: sortBy === 'name' ? 'var(--colors-dndRed)' : 'var(--colors-gray600)',
              color: sortBy === 'name' ? 'white' : 'var(--colors-gray300)'
            }}
          >
            Name {getSortIcon('name')}
          </Button>
          <Button
            variant={sortBy === 'type' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleSort('type')}
            title="Sort by type"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              backgroundColor: sortBy === 'type' ? 'var(--colors-dndRed)' : 'var(--colors-gray800)',
              borderColor: sortBy === 'type' ? 'var(--colors-dndRed)' : 'var(--colors-gray600)',
              color: sortBy === 'type' ? 'white' : 'var(--colors-gray300)'
            }}
          >
            Type {getSortIcon('type')}
          </Button>
          <Button
            variant={sortBy === 'duration' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleSort('duration')}
            title="Sort by duration"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              backgroundColor: sortBy === 'duration' ? 'var(--colors-dndRed)' : 'var(--colors-gray800)',
              borderColor: sortBy === 'duration' ? 'var(--colors-dndRed)' : 'var(--colors-gray600)',
              color: sortBy === 'duration' ? 'white' : 'var(--colors-gray300)'
            }}
          >
            Time {getSortIcon('duration')}
          </Button>
        </Box>
      </Box>

      {/* Events Container */}
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
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
      </Box>
    </Box>
  )
}