/**
 * SpellGrid Molecule Component
 * Sortable grid layout for spell display with loading and empty states
 */

import React from 'react'
import { Grid, List } from 'lucide-react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
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
    setSortBy(sortBy as 'name' | 'level' | 'school' | 'popularity')
    setSortDirection(direction as 'asc' | 'desc')
  }

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode)
  }

  const sortValue = `${selection.sortBy}_${selection.sortDirection}`

  if (isSearching) {
    return (
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          color: 'var(--colors-gray600)'
        }}
      >
        <Text variant="body" size="sm">
          Searching spells...
        </Text>
      </Box>
    )
  }

  if (spells.length === 0) {
    return (
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          color: 'var(--colors-gray600)',
          textAlign: 'center'
        }}
      >
        <Text variant="body" size="md" style={{ marginBottom: '8px' }}>
          No spells found
        </Text>
        <Text variant="body" size="sm" style={{ fontSize: '14px' }}>
          Try adjusting your search criteria or filters
        </Text>
      </Box>
    )
  }

  return (
    <Box
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      {/* Header */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 0'
        }}
      >
        <Text
          variant="body"
          size="sm"
          style={{
            color: 'var(--colors-gray600)'
          }}
        >
          {spells.length} spell{spells.length !== 1 ? 's' : ''}
        </Text>

        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {/* Sort Select */}
          <select
            value={sortValue}
            onChange={handleSortChange}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid var(--colors-gray400)',
              backgroundColor: 'var(--colors-gray100)',
              color: 'var(--colors-gray700)',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
            <option value="level_asc">Level ↑</option>
            <option value="level_desc">Level ↓</option>
            <option value="school_asc">School A-Z</option>
            <option value="school_desc">School Z-A</option>
            <option value="popularity_desc">Most Popular</option>
          </select>

          {/* View Toggle */}
          <Box
            style={{
              display: 'flex',
              borderRadius: '4px',
              overflow: 'hidden',
              border: '1px solid var(--colors-gray400)'
            }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewModeChange('grid')}
              title="Grid view"
              style={{
                padding: '4px 8px',
                backgroundColor: selection.viewMode === 'grid' ? 'var(--colors-dndRed)' : 'var(--colors-gray100)',
                color: selection.viewMode === 'grid' ? 'white' : 'var(--colors-gray700)',
                border: 'none',
                borderRadius: 0
              }}
            >
              <Grid size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewModeChange('list')}
              title="List view"
              style={{
                padding: '4px 8px',
                backgroundColor: selection.viewMode === 'list' ? 'var(--colors-dndRed)' : 'var(--colors-gray100)',
                color: selection.viewMode === 'list' ? 'white' : 'var(--colors-gray700)',
                border: 'none',
                borderRadius: 0
              }}
            >
              <List size={14} />
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Spells Grid */}
      <Box
        style={{
          display: 'grid',
          gap: '12px',
          gridTemplateColumns: selection.viewMode === 'grid'
            ? 'repeat(auto-fill, minmax(280px, 1fr))'
            : '1fr'
        }}
      >
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
      </Box>
    </Box>
  )
}