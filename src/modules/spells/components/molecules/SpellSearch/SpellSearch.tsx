/**
 * SpellSearch Molecule Component
 *
 * Advanced search interface for spells with school and level filtering.
 * Follows molecular design patterns with 60-90 line constraint.
 */

import React from 'react'
import { Search, X, Settings } from 'lucide-react'
import { styled } from '@/styles/theme.config'
import { useSpellLibrary } from '../../../hooks'
import type { SpellSchoolId, SpellCategoryId } from '../../../types'

interface SpellSearchProps {
  onToggleCustom?: () => void
  className?: string
}

const SearchContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2'
})

const SearchInputRow = styled('div', {
  display: 'flex',
  gap: '$2',
  alignItems: 'center'
})

const SearchWrapper = styled('div', {
  position: 'relative',
  flex: 1
})

const SearchInput = styled('input', {
  width: '100%',
  padding: '$2 $3',
  paddingLeft: '$8',
  borderRadius: '$2',
  border: '1px solid $gray400',
  fontSize: '$sm',
  background: '$gray100',
  color: '$gray900',

  '&:focus': {
    outline: 'none',
    borderColor: '$dndRed',
    background: 'white'
  },

  '&::placeholder': {
    color: '$gray600'
  }
})

const SearchIcon = styled(Search, {
  position: 'absolute',
  left: '$2',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '$gray600',
  size: 16
})

const ClearButton = styled('button', {
  position: 'absolute',
  right: '$2',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  padding: '$1',
  borderRadius: '$1',
  cursor: 'pointer',
  color: '$gray600',

  '&:hover': {
    color: '$gray800',
    background: '$gray200'
  }
})

const CustomToggle = styled('button', {
  display: 'flex',
  alignItems: 'center',
  gap: '$1',
  padding: '$2',
  borderRadius: '$2',
  border: '1px solid $gray400',
  background: '$gray100',
  color: '$gray700',
  fontSize: '$xs',
  cursor: 'pointer',
  whiteSpace: 'nowrap',

  '&:hover': {
    background: '$gray200'
  },

  variants: {
    active: {
      true: {
        background: '$dndRed',
        color: 'white',
        borderColor: '$dndRed'
      }
    }
  }
})

const FilterRow = styled('div', {
  display: 'flex',
  gap: '$2',
  alignItems: 'center',
  flexWrap: 'wrap'
})

const Select = styled('select', {
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

export const SpellSearch: React.FC<SpellSearchProps> = ({
  onToggleCustom,
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
    <SearchContainer className={className}>
      <SearchInputRow>
        <SearchWrapper>
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder="Search spells..."
            value={selection.searchQuery}
            onChange={handleQueryChange}
          />
          {selection.searchQuery && (
            <ClearButton onClick={handleClear} title="Clear search">
              <X size={14} />
            </ClearButton>
          )}
        </SearchWrapper>

        <CustomToggle
          active={selection.showCustomSpells}
          onClick={toggleCustomSpells}
          title="Include custom spells"
        >
          <Settings size={12} />
          Custom
        </CustomToggle>
      </SearchInputRow>

      <FilterRow>
        <Select value={selection.activeSchool} onChange={handleSchoolChange}>
          <option value="all">All Schools</option>
          {schools.map(school => (
            <option key={school.id} value={school.id}>
              {school.name} ({school.count})
            </option>
          ))}
        </Select>

        <Select value={selection.activeCategory} onChange={handleCategoryChange}>
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name} ({category.count})
            </option>
          ))}
        </Select>

        <Select
          value={`${selection.levelFilter.min}-${selection.levelFilter.max}`}
          onChange={handleLevelChange}
        >
          <option value="0-9">All Levels</option>
          <option value="0-0">Cantrips</option>
          <option value="1-2">Low (1-2)</option>
          <option value="3-5">Mid (3-5)</option>
          <option value="6-9">High (6-9)</option>
        </Select>
      </FilterRow>
    </SearchContainer>
  )
}