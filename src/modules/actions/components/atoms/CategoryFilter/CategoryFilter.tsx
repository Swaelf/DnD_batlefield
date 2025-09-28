/**
 * Category Filter Component
 * Filter buttons for action categories
 */

import React from 'react'
import { Box } from '@/components/primitives'
import type { ActionCategory, ActionCategoryInfo } from '@/types/unifiedAction'

export type CategoryFilterProps = {
  categories: ActionCategoryInfo[]
  activeCategory: ActionCategory | 'all'
  onCategoryChange: (category: ActionCategory | 'all') => void
  className?: string
}

// Helper functions for styling
const getContainerStyles = (): React.CSSProperties => ({
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap' as const,
  alignItems: 'center'
})

const getCategoryButtonStyles = (active = false): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  borderRadius: '8px',
  border: `1px solid ${active ? 'var(--dnd-red)' : 'var(--gray-600)'}`,
  background: active ? 'var(--dnd-red)' : 'var(--gray-800)',
  color: active ? 'white' : 'var(--gray-300)',
  fontSize: '14px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap' as const
})

const getCategoryIconStyles = (): React.CSSProperties => ({
  fontSize: '16px',
  lineHeight: 1
})

const getCategoryLabelStyles = (): React.CSSProperties => ({
  fontWeight: '500'
})

const getCategoryCountStyles = (): React.CSSProperties => ({
  fontSize: '12px',
  opacity: 0.8,
  background: 'rgba(255, 255, 255, 0.1)',
  padding: '2px 6px',
  borderRadius: '4px',
  minWidth: '20px',
  textAlign: 'center' as const
})

/**
 * Category filter component
 */
export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  className
}) => {
  const totalCount = categories.reduce((sum, cat) => sum + cat.count, 0)

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>, active: boolean) => {
    if (!active) {
      e.currentTarget.style.background = 'var(--gray-700)'
      e.currentTarget.style.borderColor = 'var(--gray-500)'
      e.currentTarget.style.color = 'var(--gray-100)'
    } else {
      e.currentTarget.style.background = 'var(--dnd-red-dark)'
      e.currentTarget.style.borderColor = 'var(--dnd-red-dark)'
    }
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>, active: boolean) => {
    if (!active) {
      e.currentTarget.style.background = 'var(--gray-800)'
      e.currentTarget.style.borderColor = 'var(--gray-600)'
      e.currentTarget.style.color = 'var(--gray-300)'
    } else {
      e.currentTarget.style.background = 'var(--dnd-red)'
      e.currentTarget.style.borderColor = 'var(--dnd-red)'
    }
  }

  return (
    <Box className={className} style={getContainerStyles()}>
      <button
        onClick={() => onCategoryChange('all')}
        onMouseEnter={(e) => handleMouseEnter(e, activeCategory === 'all')}
        onMouseLeave={(e) => handleMouseLeave(e, activeCategory === 'all')}
        style={getCategoryButtonStyles(activeCategory === 'all')}
      >
        <span style={getCategoryIconStyles()}>🎯</span>
        <span style={getCategoryLabelStyles()}>All</span>
        <span style={getCategoryCountStyles()}>{totalCount}</span>
      </button>

      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          onMouseEnter={(e) => handleMouseEnter(e, activeCategory === category.id)}
          onMouseLeave={(e) => handleMouseLeave(e, activeCategory === category.id)}
          title={category.description}
          style={getCategoryButtonStyles(activeCategory === category.id)}
        >
          <span style={getCategoryIconStyles()}>{category.icon}</span>
          <span style={getCategoryLabelStyles()}>{category.name}</span>
          <span style={getCategoryCountStyles()}>{category.count}</span>
        </button>
      ))}
    </Box>
  )
}