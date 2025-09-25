/**
 * SpellGrid Molecule Component
 *
 * Sortable grid layout for spell display with loading and empty states.
 * Follows molecular design patterns with 60-90 line constraint.
 */

import React from 'react'
import { ArrowUpDown, Grid, List } from 'lucide-react'
import { styled } from '@/styles/theme.config'
import { useSpellLibrary } from '../../../hooks'
import { SpellCard } from '../../atoms'
import type { UnifiedSpell } from '../../../types'

interface SpellGridProps {
  spells: UnifiedSpell[]
  selectedSpellId?: string | null
  onSpellSelect?: (spell: UnifiedSpell) => void
  onSpellEdit?: (spell: UnifiedSpell) => void
  showEditButtons?: boolean
  className?: string
}

const GridContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$3'
})

const GridHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$2 0'
})

const SortControls = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2'
})

const SortSelect = styled('select', {
  padding: '$1 $2',
  borderRadius: '$2',
  border: '1px solid $gray400',
  background: '$gray100',
  color: '$gray700',
  fontSize: '$xs',
  cursor: 'pointer',

  '&:focus': {
    outline: 'none',
    borderColor: '$dndRed',
    background: 'white'
  }
})

const ViewToggle = styled('div', {
  display: 'flex',
  borderRadius: '$2',
  overflow: 'hidden',
  border: '1px solid $gray400'
})

const ViewButton = styled('button', {
  padding: '$1 $2',
  background: '$gray100',
  border: 'none',
  cursor: 'pointer',
  color: '$gray700',

  '&:hover': {
    background: '$gray200'
  },

  variants: {
    active: {
      true: {
        background: '$dndRed',
        color: 'white'
      }
    }
  }
})

const SpellsGrid = styled('div', {
  display: 'grid',
  gap: '$3',

  variants: {
    viewMode: {
      grid: {
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'
      },
      list: {
        gridTemplateColumns: '1fr'
      }
    }
  }
})

const EmptyState = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$8',
  color: '$gray600',
  textAlign: 'center'
})

const LoadingState = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$8',
  color: '$gray600'
})

const SpellCount = styled('span', {
  fontSize: '$sm',
  color: '$gray600'
})

export const SpellGrid: React.FC<SpellGridProps> = ({
  spells,
  selectedSpellId,
  onSpellSelect,
  onSpellEdit,
  showEditButtons = false,
  className
}) => {
  const {
    selection,
    isSearching,
    setSortBy,
    setSortDirection,
    setViewMode
  } = useSpellLibrary()

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, direction] = e.target.value.split('_')
    setSortBy(sortBy as any)
    setSortDirection(direction as 'asc' | 'desc')
  }

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode)
  }

  const sortValue = `${selection.sortBy}_${selection.sortDirection}`

  if (isSearching) {
    return (
      <LoadingState>
        <div>Searching spells...</div>
      </LoadingState>
    )
  }

  if (spells.length === 0) {
    return (
      <EmptyState>
        <div>No spells found</div>
        <div style={{ fontSize: '14px', marginTop: '8px' }}>
          Try adjusting your search criteria or filters
        </div>
      </EmptyState>
    )
  }

  return (
    <GridContainer className={className}>
      <GridHeader>
        <SpellCount>
          {spells.length} spell{spells.length !== 1 ? 's' : ''}
        </SpellCount>

        <SortControls>
          <SortSelect value={sortValue} onChange={handleSortChange}>
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
            <option value="level_asc">Level ↑</option>
            <option value="level_desc">Level ↓</option>
            <option value="school_asc">School A-Z</option>
            <option value="school_desc">School Z-A</option>
            <option value="popularity_desc">Most Popular</option>
          </SortSelect>

          <ViewToggle>
            <ViewButton
              active={selection.viewMode === 'grid'}
              onClick={() => handleViewModeChange('grid')}
              title="Grid view"
            >
              <Grid size={14} />
            </ViewButton>
            <ViewButton
              active={selection.viewMode === 'list'}
              onClick={() => handleViewModeChange('list')}
              title="List view"
            >
              <List size={14} />
            </ViewButton>
          </ViewToggle>
        </SortControls>
      </GridHeader>

      <SpellsGrid viewMode={selection.viewMode}>
        {spells.map(spell => (
          <SpellCard
            key={spell.id}
            spell={spell}
            isSelected={selectedSpellId === spell.id}
            showEditButton={showEditButtons}
            onSelect={onSpellSelect}
            onEdit={onSpellEdit}
          />
        ))}
      </SpellsGrid>
    </GridContainer>
  )
}