/**
 * ActionGrid Molecule Component
 * Grid display of action cards with search and filtering
 */

import React from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { ActionCard } from '../../atoms'
import type { UnifiedAction, ActionSortBy } from '@/types/unifiedAction'

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
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: '200px'
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            color: 'var(--colors-gray400)',
            minHeight: '200px'
          }}
        >
          <Box
            style={{
              width: '32px',
              height: '32px',
              border: '2px solid var(--colors-gray600)',
              borderTop: '2px solid var(--colors-dndRed)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
        </Box>
      </Box>
    )
  }

  if (actions.length === 0) {
    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: '200px'
        }}
      >
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            color: 'var(--colors-gray400)',
            textAlign: 'center',
            minHeight: '200px'
          }}
        >
          <Box
            style={{
              fontSize: '48px',
              marginBottom: '12px',
              opacity: 0.5
            }}
          >
            🎯
          </Box>
          <Text
            variant="heading"
            size="md"
            style={{
              margin: 0,
              color: 'var(--colors-gray300)',
              marginBottom: '8px'
            }}
          >
            No Actions Found
          </Text>
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
        height: '100%',
        minHeight: '200px'
      }}
    >
      {/* Header */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 0',
          borderBottom: '1px solid var(--colors-gray700)',
          marginBottom: '12px'
        }}
      >
        <Text
          variant="body"
          size="sm"
          style={{
            color: 'var(--colors-gray400)'
          }}
        >
          {actions.length} action{actions.length !== 1 ? 's' : ''}
        </Text>

        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {SORT_OPTIONS.map(option => (
            <Button
              key={option.value}
              variant={sortBy === option.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleSortChange(option.value)}
              title={`Sort by ${option.label.toLowerCase()}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                backgroundColor: sortBy === option.value ? 'var(--colors-dndRed)' : 'var(--colors-gray800)',
                borderColor: sortBy === option.value ? 'var(--colors-dndRed)' : 'var(--colors-gray600)',
                color: sortBy === option.value ? 'white' : 'var(--colors-gray300)'
              }}
            >
              {option.label} {getSortIcon(option.value)}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Grid */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '12px',
          flex: 1,
          alignContent: 'start'
        }}
      >
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
      </Box>
    </Box>
  )
}