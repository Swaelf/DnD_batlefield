/**
 * SpellSelector Organism Component
 *
 * Complete spell selection modal interface replacing SpellSelectionModal.
 * Maintains API compatibility while using atomic design patterns.
 * Follows organism design patterns with 100-150 line constraint.
 */

import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { styled } from '@/styles/theme.config'
import { useSpellLibrary } from '../../../hooks'
import { SpellSearch, SpellGrid } from '../../molecules'
import type { UnifiedSpell } from '../../../types'

interface SpellSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (spell: UnifiedSpell) => void
  onEdit?: (spell: UnifiedSpell) => void
}

const ModalOverlay = styled('div', {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
})

const ModalContent = styled('div', {
  background: 'white',
  borderRadius: '$3',
  width: '90vw',
  maxWidth: '1000px',
  height: '90vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)'
})

const ModalHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$4',
  borderBottom: '1px solid $gray300',
  background: '$gray50'
})

const ModalTitle = styled('h2', {
  margin: 0,
  fontSize: '$lg',
  fontWeight: 600,
  color: '$gray900'
})

const CloseButton = styled('button', {
  background: 'none',
  border: 'none',
  padding: '$2',
  borderRadius: '$2',
  cursor: 'pointer',
  color: '$gray600',

  '&:hover': {
    background: '$gray200',
    color: '$gray800'
  }
})

const ModalBody = styled('div', {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
})

const SearchSection = styled('div', {
  padding: '$4',
  borderBottom: '1px solid $gray300'
})

const GridSection = styled('div', {
  flex: 1,
  padding: '$4',
  overflow: 'auto'
})

const ModalFooter = styled('div', {
  padding: '$4',
  borderTop: '1px solid $gray300',
  background: '$gray50',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
})

const FooterInfo = styled('div', {
  fontSize: '$sm',
  color: '$gray600'
})

const FooterActions = styled('div', {
  display: 'flex',
  gap: '$2'
})

const Button = styled('button', {
  padding: '$2 $4',
  borderRadius: '$2',
  border: 'none',
  cursor: 'pointer',
  fontSize: '$sm',
  fontWeight: 500,

  variants: {
    variant: {
      primary: {
        background: '$dndRed',
        color: 'white',

        '&:hover': {
          background: '$red700'
        }
      },
      secondary: {
        background: '$gray200',
        color: '$gray800',

        '&:hover': {
          background: '$gray300'
        }
      }
    }
  }
})

export const SpellSelector: React.FC<SpellSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  onEdit
}) => {
  const {
    searchResults,
    selection,
    libraryStats,
    refreshLibrary,
    getSelectedSpell,
    selectSpell
  } = useSpellLibrary()

  // Initialize library on mount
  useEffect(() => {
    if (isOpen) {
      refreshLibrary()
    }
  }, [isOpen, refreshLibrary])

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
      if (e.key === 'Enter') {
        const selectedSpell = getSelectedSpell()
        if (selectedSpell) {
          handleSelect()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, getSelectedSpell])

  const handleSelect = () => {
    const selectedSpell = getSelectedSpell()
    if (selectedSpell) {
      onSelect(selectedSpell)
    }
  }

  const handleSpellSelect = (spell: UnifiedSpell) => {
    selectSpell(spell.id)
  }

  const handleSpellEdit = (spell: UnifiedSpell) => {
    onEdit?.(spell)
  }

  const selectedSpell = getSelectedSpell()

  if (!isOpen) return null

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Select Spell</ModalTitle>
          <CloseButton onClick={onClose} title="Close">
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <SearchSection>
            <SpellSearch />
          </SearchSection>

          <GridSection>
            <SpellGrid
              spells={searchResults}
              selectedSpellId={selection.selectedSpellId}
              onSpellSelect={handleSpellSelect}
              onSpellEdit={onEdit ? handleSpellEdit : undefined}
              showEditButtons={!!onEdit}
            />
          </GridSection>
        </ModalBody>

        <ModalFooter>
          <FooterInfo>
            {libraryStats.totalSpells} spells available
            {libraryStats.customSpells > 0 && (
              <span> • {libraryStats.customSpells} custom</span>
            )}
          </FooterInfo>

          <FooterActions>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSelect}
              disabled={!selectedSpell}
            >
              Select Spell
            </Button>
          </FooterActions>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  )
}