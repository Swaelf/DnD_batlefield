/**
 * SpellSelector Organism Component
 * Complete spell selection modal interface
 */

import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { useSpellLibrary } from '../../../hooks'
import { SpellSearch, SpellGrid } from '../../molecules'
import type { UnifiedSpell } from '../../../types'

interface SpellSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (spell: UnifiedSpell) => void
  onEdit?: (spell: UnifiedSpell) => void
}


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
    <Box
      onClick={onClose}
      style={{
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
      }}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--colors-gray900)',
          borderRadius: '12px',
          width: '90vw',
          maxWidth: '1000px',
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--colors-gray700)'
        }}
      >
        {/* Modal Header */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderBottom: '1px solid var(--colors-gray700)',
            backgroundColor: 'var(--colors-gray800)'
          }}
        >
          <Text
            variant="heading"
            size="lg"
            style={{
              margin: 0,
              fontWeight: '600',
              color: 'var(--colors-gray100)'
            }}
          >
            Select Spell
          </Text>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            title="Close"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              padding: '8px',
              borderRadius: '4px',
              cursor: 'pointer',
              color: 'var(--colors-gray400)'
            }}
          >
            <X size={20} />
          </Button>
        </Box>

        {/* Modal Body */}
        <Box
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Search Section */}
          <Box
            style={{
              padding: '16px',
              borderBottom: '1px solid var(--colors-gray700)'
            }}
          >
            <SpellSearch />
          </Box>

          {/* Grid Section */}
          <Box
            style={{
              flex: 1,
              padding: '16px',
              overflow: 'auto'
            }}
          >
            <SpellGrid
              spells={[...searchResults]}
              selectedSpellId={selection.selectedSpellId}
              onSpellSelect={handleSpellSelect}
              onSpellEdit={onEdit ? handleSpellEdit : undefined}
              showEditButtons={!!onEdit}
            />
          </Box>
        </Box>

        {/* Modal Footer */}
        <Box
          style={{
            padding: '16px',
            borderTop: '1px solid var(--colors-gray700)',
            backgroundColor: 'var(--colors-gray800)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Text
            variant="body"
            size="sm"
            style={{
              color: 'var(--colors-gray400)'
            }}
          >
            {libraryStats.totalSpells} spells available
            {libraryStats.customSpells > 0 && (
              <span> • {libraryStats.customSpells} custom</span>
            )}
          </Text>

          <Box
            style={{
              display: 'flex',
              gap: '8px'
            }}
          >
            <Button
              variant="outline"
              onClick={onClose}
              style={{
                backgroundColor: 'var(--colors-gray800)',
                borderColor: 'var(--colors-gray600)',
                color: 'var(--colors-gray300)'
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSelect}
              disabled={!selectedSpell}
              style={{
                backgroundColor: selectedSpell ? 'var(--colors-dndRed)' : 'var(--colors-gray700)',
                borderColor: selectedSpell ? 'var(--colors-dndRed)' : 'var(--colors-gray600)',
                color: selectedSpell ? 'white' : 'var(--colors-gray500)',
                opacity: selectedSpell ? 1 : 0.6
              }}
            >
              Select Spell
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}