import React, { memo } from 'react'
import { Wand2 } from '@/utils/optimizedIcons'
import type { SpellEventData } from '@/types/timeline'
import { Box, Text, Button } from '@/components/primitives'

// Component uses primitive components with style prop for styling

type SpellConfigurationProps = {
  selectedSpell: Partial<SpellEventData> | null
  useEnvironmentCaster: boolean
  setUseEnvironmentCaster: (value: boolean) => void
  onOpenSpellModal: () => void
}

const SpellConfigurationComponent: React.FC<SpellConfigurationProps> = ({
  selectedSpell,
  useEnvironmentCaster,
  setUseEnvironmentCaster,
  onOpenSpellModal
}) => {
  return (
    <Box
      style={{
        padding: '12px',
        backgroundColor: 'rgba(76, 29, 149, 0.3)',
        borderRadius: '8px',
        border: '1px solid rgba(109, 40, 217, 0.5)'
      }}
    >
      {/* Header */}
      <Text
        style={{
          fontSize: '14px',
          fontWeight: '500',
          color: 'var(--gray-300)',
          marginBottom: '12px'
        }}
      >
        Spell Configuration
      </Text>

      {/* Environment Caster Toggle */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}
      >
        <input
          type="checkbox"
          checked={useEnvironmentCaster}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUseEnvironmentCaster(e.target.checked)}
          style={{ accentColor: 'var(--colors-purple500)' }}
        />
        <Text style={{ fontSize: '12px', color: 'var(--gray-300)' }}>
          Cast from environment (no caster token)
        </Text>
      </Box>

      {/* Selected Spell Display */}
      {selectedSpell ? (
        <Box
          style={{
            padding: '12px',
            backgroundColor: 'var(--gray-800)',
            borderRadius: '6px',
            marginBottom: '12px'
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Text style={{ fontSize: '14px', fontWeight: '500', color: 'var(--gray-100)' }}>
                {selectedSpell.spellName || 'Custom Spell'}
              </Text>
              <Text
                style={{
                  fontSize: '12px',
                  color: 'var(--gray-400)',
                  marginTop: '4px'
                }}
              >
                {selectedSpell.category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </Box>
            <Box
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '2px solid var(--gray-700)',
                backgroundColor: selectedSpell.color || '#ff0000'
              }}
            />
          </Box>
        </Box>
      ) : (
        <Box
          style={{
            padding: '16px',
            backgroundColor: 'var(--gray-800)',
            borderRadius: '6px',
            marginBottom: '12px',
            textAlign: 'center',
            borderStyle: 'dashed',
            borderWidth: '2px',
            borderColor: 'var(--gray-700)'
          }}
        >
          <Text style={{ fontSize: '14px', color: 'var(--gray-400)' }}>
            No spell selected
          </Text>
        </Box>
      )}

      {/* Select Spell Button */}
      <Button
        onClick={onOpenSpellModal}
        style={{
          width: '100%',
          backgroundColor: 'var(--purple-600)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '8px 16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.backgroundColor = 'var(--purple-700)'
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.backgroundColor = 'var(--purple-600)'
        }}
      >
        <Wand2 size={16} style={{ marginRight: '8px' }} />
        {selectedSpell ? 'Change Spell' : 'Select Spell'}
      </Button>
    </Box>
  )
}

export const SpellConfiguration = memo(SpellConfigurationComponent)
SpellConfiguration.displayName = 'SpellConfiguration'