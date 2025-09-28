/**
 * Search Bar Component
 * Search input with filters and options
 */

import React from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Button } from '@/components/primitives/ButtonVE'

export type SearchBarProps = {
  searchQuery: string
  placeholder?: string
  showCustomActions?: boolean
  onSearchChange: (query: string) => void
  onToggleCustomActions?: () => void
  onClear?: () => void
  className?: string
}


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
    <Box
      className={className}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      {/* Search Input Container */}
      <Box
        style={{
          position: 'relative',
          flex: 1
        }}
      >
        {/* Search Icon */}
        <Box
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--colors-gray400)',
            fontSize: '16px',
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          🔍
        </Box>

        {/* Search Input */}
        <input
          type="text"
          value={searchQuery}
          placeholder={placeholder}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            padding: '12px 16px 12px 48px',
            backgroundColor: 'var(--colors-gray800)',
            border: '1px solid var(--colors-gray600)',
            borderRadius: '8px',
            color: 'var(--colors-gray100)',
            fontSize: '14px',
            outline: 'none',
            transition: 'all 0.2s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--colors-dndRed)'
            e.target.style.backgroundColor = 'var(--colors-gray750)'
            e.target.style.boxShadow = '0 0 0 3px rgba(146, 38, 16, 0.1)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--colors-gray600)'
            e.target.style.backgroundColor = 'var(--colors-gray800)'
            e.target.style.boxShadow = 'none'
          }}
        />

        {/* Clear Button */}
        {searchQuery.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            title="Clear search"
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--colors-gray400)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              padding: 0,
              minWidth: 'auto'
            }}
          >
            ✕
          </Button>
        )}
      </Box>

      {/* Custom Actions Toggle */}
      {onToggleCustomActions && (
        <Button
          variant={showCustomActions ? 'primary' : 'outline'}
          size="sm"
          onClick={onToggleCustomActions}
          title="Show custom actions"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '6px',
            whiteSpace: 'nowrap',
            backgroundColor: showCustomActions ? 'var(--colors-purple700)' : 'var(--colors-gray800)',
            borderColor: showCustomActions ? 'var(--colors-purple600)' : 'var(--colors-gray600)',
            color: showCustomActions ? 'var(--colors-purple100)' : 'var(--colors-gray300)'
          }}
        >
          <span style={{ fontSize: '16px' }}>✨</span>
          Custom
        </Button>
      )}
    </Box>
  )
}