import React, { memo } from 'react'
import { Wand2 } from 'lucide-react'
import { SpellEventData } from '@/types/timeline'
import { Box, Button, Text } from '@/components/ui'

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
    <Box css={{
      padding: '$3',
      backgroundColor: '$purple900/30',
      borderRadius: '$lg',
      border: '1px solid $purple700/50'
    }}>
      <Text size="sm" weight="medium" color="gray300" css={{ marginBottom: '$3', color: '$purple300' }}>
        Spell Configuration
      </Text>

      {/* Environment Caster Toggle */}
      <Box display="flex" alignItems="center" gap="2" css={{ marginBottom: '$3' }}>
        <input
          type="checkbox"
          checked={useEnvironmentCaster}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUseEnvironmentCaster(e.target.checked)}
          style={{ accentColor: 'var(--colors-purple500)' }}
        />
        <Text size="xs" color="gray300">Cast from environment (no caster token)</Text>
      </Box>

      {/* Selected Spell Display */}
      {selectedSpell ? (
        <Box css={{
          padding: '$3',
          backgroundColor: '$gray800',
          borderRadius: '$md',
          marginBottom: '$3'
        }}>
          <Box display="flex" alignItems="center" justifyContent="between">
            <Box>
              <Text size="sm" weight="medium" color="white">
                {selectedSpell.spellName || 'Custom Spell'}
              </Text>
              <Text size="xs" color="gray400" css={{ marginTop: '$1' }}>
                {selectedSpell.category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </Box>
            <Box
              css={{
                width: '24px',
                height: '24px',
                borderRadius: '$round',
                backgroundColor: selectedSpell.color || '#ff0000',
                border: '2px solid $gray700'
              }}
            />
          </Box>
        </Box>
      ) : (
        <Box css={{
          padding: '$4',
          backgroundColor: '$gray800',
          borderRadius: '$md',
          marginBottom: '$3',
          textAlign: 'center',
          borderStyle: 'dashed',
          borderWidth: '2px',
          borderColor: '$gray700'
        }}>
          <Text size="sm" color="gray400">
            No spell selected
          </Text>
        </Box>
      )}

      {/* Select Spell Button */}
      <Button
        onClick={onOpenSpellModal}
        variant="secondary"
        css={{
          width: '100%',
          backgroundColor: '$purple600',
          color: '$white',
          '&:hover': {
            backgroundColor: '$purple700'
          }
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