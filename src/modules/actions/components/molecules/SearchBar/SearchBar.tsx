/**
 * Search Bar Component
 * Search input with filters and options
 */

import React from 'react'
import { styled } from '@/foundation/theme'

export type SearchBarProps = {
  searchQuery: string
  placeholder?: string
  showCustomActions?: boolean
  onSearchChange: (query: string) => void
  onToggleCustomActions?: () => void
  onClear?: () => void
  className?: string
}

const Container = styled('div', {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '$2'
})

const SearchInputContainer = styled('div', {
  position: 'relative',
  flex: 1
})

const SearchInput = styled('input', {
  width: '100%',
  padding: '$3 $4 $3 $12',
  backgroundColor: '$gray800',
  border: '1px solid $gray600',
  borderRadius: '$lg',
  color: '$gray100',
  fontSize: '$2',
  outline: 'none',
  transition: 'all 0.2s ease',

  '&::placeholder': {
    color: '$gray400'
  },

  '&:focus': {
    borderColor: '$dndRed',
    backgroundColor: '$gray750',
    boxShadow: '0 0 0 3px rgba(146, 38, 16, 0.1)'
  }
})

const SearchIcon = styled('div', {
  position: 'absolute',
  left: '$3',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '$gray400',
  fontSize: '$3',
  pointerEvents: 'none'
})

const ClearButton = styled('button', {
  position: 'absolute',
  right: '$2',
  top: '50%',
  transform: 'translateY(-50%)',
  width: 24,
  height: 24,
  borderRadius: '$sm',
  border: 'none',
  background: 'transparent',
  color: '$gray400',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',

  '&:hover': {
    background: '$gray700',
    color: '$gray200'
  },

  variants: {
    visible: {
      true: {
        opacity: 1,
        pointerEvents: 'auto'
      },
      false: {
        opacity: 0,
        pointerEvents: 'none'
      }
    }
  }
})

const FilterToggle = styled('button', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$2 $3',
  borderRadius: '$md',
  border: '1px solid $gray600',
  background: '$gray800',
  color: '$gray300',
  fontSize: '$2',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap',

  '&:hover': {
    background: '$gray700',
    borderColor: '$gray500'
  },

  variants: {
    active: {
      true: {
        background: '$purple700',
        borderColor: '$purple600',
        color: '$purple100'
      }
    }
  }
})

const ToggleIcon = styled('span', {
  fontSize: '$3'
})

/**
 * Search bar with custom actions toggle
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  placeholder = "Search actions...",
  showCustomActions = true,
  onSearchChange,
  onToggleCustomActions,
  onClear,
  className
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value)
  }

  const handleClear = () => {
    onSearchChange('')
    if (onClear) {
      onClear()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear()
    }
  }

  return (
    <Container className={className}>
      <SearchInputContainer>
        <SearchIcon>🔍</SearchIcon>
        <SearchInput
          type="text"
          value={searchQuery}
          placeholder={placeholder}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <ClearButton
          visible={searchQuery.length > 0}
          onClick={handleClear}
          title="Clear search"
        >
          ✕
        </ClearButton>
      </SearchInputContainer>

      {onToggleCustomActions && (
        <FilterToggle
          active={showCustomActions}
          onClick={onToggleCustomActions}
          title="Show custom actions"
        >
          <ToggleIcon>✨</ToggleIcon>
          Custom
        </FilterToggle>
      )}
    </Container>
  )
}