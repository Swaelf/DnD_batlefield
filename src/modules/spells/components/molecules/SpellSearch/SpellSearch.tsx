/**
 * SpellSearch Molecule Component
 * Advanced search interface for spells with school and level filtering
 */

import React from 'react'
import { Search, X, Settings } from 'lucide-react'
import { Box } from '@/components/primitives/BoxVE'
import { Button } from '@/components/primitives/ButtonVE'
import { useSpellLibrary } from '../../../hooks'
import type { SpellSchoolId, SpellCategoryId } from '../../../types'

interface SpellSearchProps {
  onToggleCustom?: () => void
  className?: string
}


export const SpellSearch: React.FC<SpellSearchProps> = ({
  onToggleCustom: _onToggleCustom,
  className
}) => {
  const {
    selection,
    schools,
    categories,
    setSearchQuery,
    setActiveSchool,
    setActiveCategory,
    setLevelFilter,
    toggleCustomSpells
  } = useSpellLibrary()

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleClear = () => {
    setSearchQuery('')
  }

  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setActiveSchool(value === 'all' ? 'all' : value as SpellSchoolId)
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setActiveCategory(value === 'all' ? 'all' : value as SpellCategoryId)
  }

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [min, max] = e.target.value.split('-').map(Number)
    setLevelFilter(min, max)
  }

  return (
    <Box
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      {/* Search Input Row */}
      <Box
        style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}
      >
        {/* Search Input Wrapper */}
        <Box
          style={{
            position: 'relative',
            flex: 1
          }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--colors-gray600)',
              pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            placeholder="Search spells..."
            value={selection.searchQuery}
            onChange={handleQueryChange}
            style={{
              width: '100%',
              padding: '8px 12px',
              paddingLeft: '32px',
              borderRadius: '4px',
              border: '1px solid var(--colors-gray400)',
              fontSize: '14px',
              backgroundColor: 'var(--colors-gray100)',
              color: 'var(--colors-gray900)',
              outline: 'none'
            }}
          />
          {selection.searchQuery && (
            <button
              onClick={handleClear}
              title="Clear search"
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                padding: '4px',
                borderRadius: '4px',
                cursor: 'pointer',
                color: 'var(--colors-gray600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={14} />
            </button>
          )}
        </Box>

        {/* Custom Toggle */}
        <Button
          variant={selection.showCustomSpells ? 'primary' : 'outline'}
          size="sm"
          onClick={toggleCustomSpells}
          title="Include custom spells"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            whiteSpace: 'nowrap',
            fontSize: '12px',
            backgroundColor: selection.showCustomSpells ? 'var(--colors-dndRed)' : 'var(--colors-gray100)',
            color: selection.showCustomSpells ? 'white' : 'var(--colors-gray700)',
            borderColor: selection.showCustomSpells ? 'var(--colors-dndRed)' : 'var(--colors-gray400)'
          }}
        >
          <Settings size={12} />
          Custom
        </Button>
      </Box>

      {/* Filter Row */}
      <Box
        style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        <select
          value={selection.activeSchool}
          onChange={handleSchoolChange}
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid var(--colors-gray400)',
            backgroundColor: 'var(--colors-gray100)',
            color: 'var(--colors-gray700)',
            fontSize: '12px',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="all">All Schools</option>
          {schools.map(school => (
            <option key={school.id} value={school.id}>
              {school.name} ({school.count})
            </option>
          ))}
        </select>

        <select
          value={selection.activeCategory}
          onChange={handleCategoryChange}
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid var(--colors-gray400)',
            backgroundColor: 'var(--colors-gray100)',
            color: 'var(--colors-gray700)',
            fontSize: '12px',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name} ({category.count})
            </option>
          ))}
        </select>

        <select
          value={`${selection.levelFilter.min}-${selection.levelFilter.max}`}
          onChange={handleLevelChange}
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid var(--colors-gray400)',
            backgroundColor: 'var(--colors-gray100)',
            color: 'var(--colors-gray700)',
            fontSize: '12px',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="0-9">All Levels</option>
          <option value="0-0">Cantrips</option>
          <option value="1-2">Low (1-2)</option>
          <option value="3-5">Mid (3-5)</option>
          <option value="6-9">High (6-9)</option>
        </select>
      </Box>
    </Box>
  )
}