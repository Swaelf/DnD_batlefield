/**
 * Action Selector Component
 * Main action selection interface - replaces ActionSelectionModal
 */

import React, { useEffect } from 'react'
import { styled } from '@/foundation/theme'
import { SearchBar, ActionGrid } from '../../molecules'
import { CategoryFilter } from '../../atoms'
import { useActionLibrary } from '../../../hooks'
import type { UnifiedAction } from '../../../types'

export type ActionSelectorProps = {
  isOpen: boolean
  onClose: () => void
  onSelect: (action: UnifiedAction) => void
  onEdit?: (action: UnifiedAction) => void
  className?: string
}

const Overlay = styled('div', {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.75)',
  zIndex: 50,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$4'
})

const Modal = styled('div', {
  width: '100%',
  maxWidth: '90vw',
  height: '90vh',
  background: '$gray900',
  borderRadius: '$lg',
  border: '1px solid $gray600',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
})

const Header = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$4',
  borderBottom: '1px solid $gray700',
  background: '$gray900'
})

const Title = styled('h2', {
  margin: 0,
  fontSize: '$4',
  fontWeight: 600,
  color: '$gray100'
})

const CloseButton = styled('button', {
  width: 32,
  height: 32,
  borderRadius: '$md',
  border: 'none',
  background: '$gray800',
  color: '$gray400',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '$3',
  transition: 'all 0.2s ease',

  '&:hover': {
    background: '$gray700',
    color: '$gray200'
  }
})

const FilterSection = styled('div', {
  padding: '$4',
  borderBottom: '1px solid $gray700',
  background: '$gray850'
})

const FilterRow = styled('div', {
  display: 'flex',
  gap: '$4',
  alignItems: 'center',
  marginBottom: '$3',

  '&:last-child': {
    marginBottom: 0
  }
})

const Content = styled('div', {
  flex: 1,
  padding: '$4',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column'
})

const StatsSection = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '$4',
  padding: '$2 0'
})

const Stats = styled('div', {
  display: 'flex',
  gap: '$4',
  fontSize: '$2',
  color: '$gray400'
})

const Stat = styled('span', {
  display: 'flex',
  alignItems: 'center',
  gap: '$1'
})

const ViewToggle = styled('div', {
  display: 'flex',
  borderRadius: '$md',
  border: '1px solid $gray600',
  overflow: 'hidden'
})

const ViewButton = styled('button', {
  padding: '$2 $3',
  border: 'none',
  background: '$gray800',
  color: '$gray300',
  fontSize: '$2',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    background: '$gray700'
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

/**
 * Action selector modal component
 */
export const ActionSelector: React.FC<ActionSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  onEdit,
  className
}) => {
  const {
    selection,
    searchResults,
    isSearching,
    categories,
    setSearchQuery,
    setActiveCategory,
    setSortBy,
    setSortDirection,
    setViewMode,
    toggleCustomActions,
    selectAction,
    getSelectedAction,
    refreshLibrary
  } = useActionLibrary()

  // Load actions on mount
  useEffect(() => {
    if (isOpen) {
      refreshLibrary()
    }
  }, [isOpen, refreshLibrary])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const handleActionSelect = (action: UnifiedAction) => {
    selectAction(action.id)
  }

  const handleActionDoubleSelect = (action: UnifiedAction) => {
    onSelect(action)
    onClose()
  }

  const handleActionEdit = (action: UnifiedAction) => {
    if (onEdit) {
      onEdit(action)
    }
  }

  const handleSelectConfirm = () => {
    const selected = getSelectedAction()
    if (selected) {
      onSelect(selected)
      onClose()
    }
  }

  if (!isOpen) return null

  const totalActions = searchResults.length
  const selectedAction = getSelectedAction()

  return (
    <Overlay onClick={onClose} className={className}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Select Action</Title>
          <CloseButton onClick={onClose} title="Close">
            ✕
          </CloseButton>
        </Header>

        <FilterSection>
          <FilterRow>
            <SearchBar
              searchQuery={selection.searchQuery}
              showCustomActions={selection.showCustomActions}
              onSearchChange={setSearchQuery}
              onToggleCustomActions={toggleCustomActions}
              placeholder="Search spells, attacks, and more..."
            />
          </FilterRow>

          <FilterRow>
            <CategoryFilter
              categories={categories}
              activeCategory={selection.activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </FilterRow>
        </FilterSection>

        <Content>
          <StatsSection>
            <Stats>
              <Stat>📊 {totalActions} actions</Stat>
              {isSearching && (
                <Stat>⏳ Searching...</Stat>
              )}
              {selectedAction && (
                <Stat>✅ {selectedAction.name} selected</Stat>
              )}
            </Stats>

            <ViewToggle>
              <ViewButton
                active={selection.viewMode === 'grid'}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                ⊞
              </ViewButton>
              <ViewButton
                active={selection.viewMode === 'list'}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                ☰
              </ViewButton>
            </ViewToggle>
          </StatsSection>

          <ActionGrid
            actions={searchResults}
            selectedActionId={selection.selectedActionId}
            isLoading={isSearching}
            sortBy={selection.sortBy}
            sortDirection={selection.sortDirection}
            onActionSelect={handleActionSelect}
            onActionEdit={handleActionEdit}
            onSortChange={setSortBy}
            onSortDirectionChange={setSortDirection}
            emptyMessage="Try adjusting your search or category filter"
          />
        </Content>

        {selectedAction && (
          <div style={{
            padding: '16px',
            borderTop: '1px solid #374151',
            background: '#111827',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ color: '#9CA3AF' }}>
              Selected: <strong style={{ color: '#F9FAFB' }}>{selectedAction.name}</strong>
            </div>
            <button
              onClick={handleSelectConfirm}
              style={{
                padding: '8px 16px',
                background: '#922610',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Select Action
            </button>
          </div>
        )}
      </Modal>
    </Overlay>
  )
}