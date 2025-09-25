/**
 * Action Grid Component
 * Grid display of action cards with search and filtering
 */

import React from 'react'
import { styled } from '@/foundation/theme'
import { ActionCard } from '../../atoms'
import type { UnifiedAction, ActionSortBy } from '../../types'

export type ActionGridProps = {
  actions: UnifiedAction[]
  selectedActionId?: string | null
  isLoading?: boolean
  emptyMessage?: string
  sortBy?: ActionSortBy
  sortDirection?: 'asc' | 'desc'
  onActionSelect?: (action: UnifiedAction) => void
  onActionEdit?: (action: UnifiedAction) => void
  onSortChange?: (sortBy: ActionSortBy) => void
  onSortDirectionChange?: (direction: 'asc' | 'desc') => void
  className?: string
}

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minHeight: 200
})

const Header = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$2 0',
  borderBottom: '1px solid $gray700',
  marginBottom: '$3'
})

const ActionCount = styled('span', {
  fontSize: '$2',
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

const Grid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '$3',
  flex: 1,
  alignContent: 'start'
})

const EmptyState = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$6',
  color: '$gray400',
  textAlign: 'center',
  minHeight: 200
})

const EmptyIcon = styled('div', {
  fontSize: '$8',
  marginBottom: '$3',
  opacity: 0.5
})

const EmptyText = styled('p', {
  margin: 0,
  fontSize: '$3',
  color: '$gray300',
  marginBottom: '$2'
})

const EmptySubtext = styled('p', {
  margin: 0,
  fontSize: '$2',
  color: '$gray500'
})

const LoadingState = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$6',
  color: '$gray400',
  minHeight: 200
})

const LoadingSpinner = styled('div', {
  width: 32,
  height: 32,
  border: '2px solid $gray600',
  borderTop: '2px solid $dndRed',
  borderRadius: '$round',
  animation: 'spin 1s linear infinite',

  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  }
})

const SORT_OPTIONS = [
  { value: 'name' as ActionSortBy, label: 'Name' },
  { value: 'type' as ActionSortBy, label: 'Type' },
  { value: 'category' as ActionSortBy, label: 'Category' },
  { value: 'level' as ActionSortBy, label: 'Level' },
  { value: 'recent' as ActionSortBy, label: 'Recent' }
]

/**
 * Action grid with sorting and selection
 */
export const ActionGrid: React.FC<ActionGridProps> = ({
  actions,
  selectedActionId = null,
  isLoading = false,
  emptyMessage = "No actions found",
  sortBy = 'name',
  sortDirection = 'asc',
  onActionSelect,
  onActionEdit,
  onSortChange,
  onSortDirectionChange,
  className
}) => {
  const handleSortChange = (newSortBy: ActionSortBy) => {
    if (sortBy === newSortBy && onSortDirectionChange) {
      // Toggle direction if same sort field
      onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')
    } else if (onSortChange) {
      onSortChange(newSortBy)
    }
  }

  const getSortIcon = (field: ActionSortBy) => {
    if (sortBy !== field) return '↕'
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  if (isLoading) {
    return (
      <Container className={className}>
        <LoadingState>
          <LoadingSpinner />
        </LoadingState>
      </Container>
    )
  }

  if (actions.length === 0) {
    return (
      <Container className={className}>
        <EmptyState>
          <EmptyIcon>🎯</EmptyIcon>
          <EmptyText>No Actions Found</EmptyText>
          <EmptySubtext>{emptyMessage}</EmptySubtext>
        </EmptyState>
      </Container>
    )
  }

  return (
    <Container className={className}>
      <Header>
        <ActionCount>
          {actions.length} action{actions.length !== 1 ? 's' : ''}
        </ActionCount>

        <SortControls>
          {SORT_OPTIONS.map(option => (
            <SortButton
              key={option.value}
              active={sortBy === option.value}
              onClick={() => handleSortChange(option.value)}
              title={`Sort by ${option.label.toLowerCase()}`}
            >
              {option.label} {getSortIcon(option.value)}
            </SortButton>
          ))}
        </SortControls>
      </Header>

      <Grid>
        {actions.map(action => (
          <ActionCard
            key={action.id}
            action={action}
            isSelected={selectedActionId === action.id}
            showEditButton={action.customizable}
            onSelect={onActionSelect}
            onEdit={onActionEdit}
          />
        ))}
      </Grid>
    </Container>
  )
}