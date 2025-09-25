/**
 * Category Filter Component
 * Filter buttons for action categories
 */

import React from 'react'
import { styled } from '@/foundation/theme'
import type { ActionCategory, ActionCategoryInfo } from '../../types'

export type CategoryFilterProps = {
  categories: ActionCategoryInfo[]
  activeCategory: ActionCategory | 'all'
  onCategoryChange: (category: ActionCategory | 'all') => void
  className?: string
}

const Container = styled('div', {
  display: 'flex',
  gap: '$2',
  flexWrap: 'wrap',
  alignItems: 'center'
})

const CategoryButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$2 $3',
  borderRadius: '$lg',
  border: '1px solid $gray600',
  background: '$gray800',
  color: '$gray300',
  fontSize: '$2',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap',

  '&:hover': {
    background: '$gray700',
    borderColor: '$gray500',
    color: '$gray100'
  },

  variants: {
    active: {
      true: {
        background: '$dndRed',
        borderColor: '$dndRed',
        color: 'white',

        '&:hover': {
          background: '$dndRedDark',
          borderColor: '$dndRedDark'
        }
      }
    }
  }
})

const CategoryIcon = styled('span', {
  fontSize: '$3',
  lineHeight: 1
})

const CategoryLabel = styled('span', {
  fontWeight: 500
})

const CategoryCount = styled('span', {
  fontSize: '$1',
  opacity: 0.8,
  background: 'rgba(255, 255, 255, 0.1)',
  padding: '2px 6px',
  borderRadius: '$sm',
  minWidth: 20,
  textAlign: 'center'
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

  return (
    <Container className={className}>
      <CategoryButton
        active={activeCategory === 'all'}
        onClick={() => onCategoryChange('all')}
      >
        <CategoryIcon>🎯</CategoryIcon>
        <CategoryLabel>All</CategoryLabel>
        <CategoryCount>{totalCount}</CategoryCount>
      </CategoryButton>

      {categories.map(category => (
        <CategoryButton
          key={category.id}
          active={activeCategory === category.id}
          onClick={() => onCategoryChange(category.id)}
          title={category.description}
        >
          <CategoryIcon>{category.icon}</CategoryIcon>
          <CategoryLabel>{category.name}</CategoryLabel>
          <CategoryCount>{category.count}</CategoryCount>
        </CategoryButton>
      ))}
    </Container>
  )
}