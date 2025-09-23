import React, { useState, useEffect } from 'react'
import { Save, X, Wand2, Sword } from 'lucide-react'
import { Modal, ModalBody, Box, Text, Button } from '@/components/ui'
import { styled } from '@/styles/theme.config'
import { UnifiedAction } from '@/types'

// Styled components for consistent styling
const StyledInput = styled('input', {
  width: '100%',
  padding: '$2 $3',
  backgroundColor: '$gray700',
  border: '1px solid $gray600',
  borderRadius: '$md',
  color: '$white',
  fontSize: '$sm',
  '&:focus': {
    outline: 'none',
    borderColor: '$secondary',
    boxShadow: '0 0 0 1px $colors$secondary'
  },
  '&::placeholder': {
    color: '$gray500'
  }
})

const StyledSelect = styled('select', {
  width: '100%',
  padding: '$2 $3',
  backgroundColor: '$gray700',
  border: '1px solid $gray600',
  borderRadius: '$md',
  color: '$white',
  fontSize: '$sm',
  '&:focus': {
    outline: 'none',
    borderColor: '$secondary',
    boxShadow: '0 0 0 1px $colors$secondary'
  }
})

const ColorInputWrapper = styled(Box, {
  position: 'relative',
  width: '100%',
  height: '40px',
  borderRadius: '$md',
  border: '1px solid $gray600',
  backgroundColor: '$gray700',
  overflow: 'hidden',
  cursor: 'pointer',
  '&:hover': {
    borderColor: '$gray500'
  },
  '&:focus-within': {
    borderColor: '$secondary',
    boxShadow: '0 0 0 1px $colors$secondary'
  }
})

const colorInputStyles = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  border: 'none',
  outline: 'none',
  cursor: 'pointer',
  backgroundColor: 'transparent',
  borderRadius: '6px'
}

const PropertyGrid = styled(Box, {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '$3',
  variants: {
    columns: {
      3: {
        gridTemplateColumns: 'repeat(3, 1fr)'
      }
    }
  }
})

const PropertySection = styled(Box, {
  marginBottom: '$4'
})

const SectionTitle = styled(Text, {
  fontSize: '$sm',
  fontWeight: '$semibold',
  color: '$gray300',
  marginBottom: '$3'
})

const PropertyLabel = styled(Text, {
  fontSize: '$xs',
  color: '$gray400',
  marginBottom: '$1'
})

const ReadOnlyBox = styled(Box, {
  padding: '$3',
  backgroundColor: '$gray800',
  borderRadius: '$md',
  border: '1px solid $gray600'
})

type ActionCustomizationModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (customAction: UnifiedAction) => void
  baseAction: UnifiedAction | null
}

const ActionCustomizationModalComponent: React.FC<ActionCustomizationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  baseAction
}) => {
  const [customAction, setCustomAction] = useState<UnifiedAction | null>(null)

  // Initialize customAction when baseAction changes
  useEffect(() => {
    if (baseAction) {
      setCustomAction({
        ...baseAction,
        id: `custom-${baseAction.id}-${Date.now()}`,
        name: baseAction.metadata?.name || baseAction.name,
        metadata: {
          ...baseAction.metadata,
          name: baseAction.metadata?.name || baseAction.name
        }
      })
    }
  }, [baseAction])

  if (!isOpen || !baseAction || !customAction) return null

  const isSpell = baseAction.type === 'spell'
  const isAttack = baseAction.type === 'attack'

  const handleSave = () => {
    if (customAction) {
      onSave(customAction)
      onClose()
    }
  }

  const updateProperty = (path: string, value: any) => {
    if (!customAction) return

    const keys = path.split('.')

    // Deep clone the action to avoid mutating read-only objects
    const newAction = JSON.parse(JSON.stringify(customAction))
    let current: any = newAction

    // Navigate to the parent object, creating nested objects as needed
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }

    // Set the final value
    current[keys[keys.length - 1]] = value
    setCustomAction(newAction)
  }

  const renderSpellProperties = () => (
    <Box display="flex" flexDirection="column" gap="4">
      {/* Basic Properties */}
      <PropertySection>
        <SectionTitle>Basic Properties</SectionTitle>
        <PropertyGrid>
          <Box>
            <PropertyLabel>Name</PropertyLabel>
            <StyledInput
              type="text"
              value={customAction.name || ''}
              onChange={(e) => {
                const newName = e.target.value
                // Update both name and metadata.name in a single operation
                if (!customAction) return
                const newAction = JSON.parse(JSON.stringify(customAction))
                newAction.name = newName
                if (!newAction.metadata) newAction.metadata = {}
                newAction.metadata.name = newName
                setCustomAction(newAction)
              }}
              placeholder="Spell name"
            />
          </Box>
          <Box>
            <PropertyLabel>Description</PropertyLabel>
            <StyledInput
              type="text"
              value={customAction.description || ''}
              onChange={(e) => {
                const newDescription = e.target.value
                // Update both description and metadata.description in a single operation
                if (!customAction) return
                const newAction = JSON.parse(JSON.stringify(customAction))
                newAction.description = newDescription
                if (!newAction.metadata) newAction.metadata = {}
                newAction.metadata.description = newDescription
                setCustomAction(newAction)
              }}
              placeholder="Spell description"
            />
          </Box>
        </PropertyGrid>
      </PropertySection>

      {/* Animation Properties */}
      <PropertySection>
        <SectionTitle>Animation Properties</SectionTitle>
        <PropertyGrid columns={3}>
          <Box>
            <PropertyLabel>Color</PropertyLabel>
            <ColorInputWrapper>
              <input
                type="color"
                value={customAction.animation?.color || '#FF4500'}
                onChange={(e) => {
                  console.log('Color changed to:', e.target.value)
                  updateProperty('animation.color', e.target.value)
                }}
                style={colorInputStyles}
              />
            </ColorInputWrapper>
          </Box>
          <Box>
            <PropertyLabel>Size</PropertyLabel>
            <StyledInput
              type="number"
              min="1"
              max="200"
              value={customAction.animation?.size || 50}
              onChange={(e) => updateProperty('animation.size', parseInt(e.target.value))}
            />
          </Box>
          <Box>
            <PropertyLabel>Duration (ms)</PropertyLabel>
            <StyledInput
              type="number"
              min="100"
              max="5000"
              step="100"
              value={customAction.animation?.duration || 1000}
              onChange={(e) => updateProperty('animation.duration', parseInt(e.target.value))}
            />
          </Box>
        </PropertyGrid>
      </PropertySection>

      {/* Animation Type (Read Only) */}
      <PropertySection>
        <SectionTitle>Animation Type (Locked)</SectionTitle>
        <ReadOnlyBox>
          <Text size="sm" color="gray400" css={{ textTransform: 'capitalize' }}>
            {customAction.animation?.type || 'Not specified'}
          </Text>
        </ReadOnlyBox>
      </PropertySection>

      {/* Spell-specific Properties */}
      {customAction.animation?.type === 'projectile' && (
        <PropertySection>
          <SectionTitle>Projectile Properties</SectionTitle>
          <PropertyGrid>
            <Box>
              <PropertyLabel>Speed (px/s)</PropertyLabel>
              <StyledInput
                type="number"
                min="100"
                max="2000"
                step="50"
                value={customAction.projectileSpeed || 500}
                onChange={(e) => updateProperty('projectileSpeed', parseInt(e.target.value))}
              />
            </Box>
            <Box>
              <PropertyLabel>Trail Length</PropertyLabel>
              <StyledInput
                type="number"
                min="0"
                max="20"
                value={customAction.trailLength || 5}
                onChange={(e) => updateProperty('trailLength', parseInt(e.target.value))}
              />
            </Box>
          </PropertyGrid>

          {/* Target Tracking Option */}
          <Box css={{ marginTop: '$3' }}>
            <Box display="flex" alignItems="center" gap="2">
              <input
                type="checkbox"
                id="trackTargetProjectile"
                checked={customAction.animation?.trackTarget || false}
                onChange={(e) => updateProperty('animation.trackTarget', e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: 'var(--colors-secondary)'
                }}
              />
              <PropertyLabel css={{ marginBottom: 0, cursor: 'pointer' }} htmlFor="trackTargetProjectile">
                Track moving targets (projectile follows target if they move)
              </PropertyLabel>
            </Box>
          </Box>
        </PropertySection>
      )}

      {/* Ray Properties */}
      {customAction.animation?.type === 'ray' && (
        <PropertySection>
          <SectionTitle>Ray Properties</SectionTitle>
          <PropertyGrid>
            <Box>
              <PropertyLabel>Beam Width (px)</PropertyLabel>
              <StyledInput
                type="number"
                min="2"
                max="20"
                value={customAction.animation?.size || 8}
                onChange={(e) => updateProperty('animation.size', parseInt(e.target.value))}
              />
            </Box>
          </PropertyGrid>

          {/* Target Tracking Option */}
          <Box css={{ marginTop: '$3' }}>
            <Box display="flex" alignItems="center" gap="2">
              <input
                type="checkbox"
                id="trackTargetRay"
                checked={customAction.animation?.trackTarget || false}
                onChange={(e) => updateProperty('animation.trackTarget', e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: 'var(--colors-secondary)'
                }}
              />
              <PropertyLabel css={{ marginBottom: 0, cursor: 'pointer' }} htmlFor="trackTargetRay">
                Track moving targets (ray follows target if they move)
              </PropertyLabel>
            </Box>
          </Box>
        </PropertySection>
      )}

      {/* Projectile-Burst Properties (for Fireball, etc.) */}
      {customAction.animation?.type === 'projectile_burst' && (
        <PropertySection>
          <SectionTitle>Projectile & Burst Properties</SectionTitle>
          <PropertyGrid columns={3}>
            <Box>
              <PropertyLabel>Projectile Speed (px/s)</PropertyLabel>
              <StyledInput
                type="number"
                min="100"
                max="2000"
                step="50"
                value={customAction.animation?.speed || 500}
                onChange={(e) => updateProperty('animation.speed', parseInt(e.target.value))}
              />
            </Box>
            <Box>
              <PropertyLabel>Trail Length</PropertyLabel>
              <StyledInput
                type="number"
                min="0"
                max="20"
                value={customAction.animation?.trailLength || 8}
                onChange={(e) => updateProperty('animation.trailLength', parseInt(e.target.value))}
              />
            </Box>
            <Box>
              <PropertyLabel>Trail Fade</PropertyLabel>
              <StyledInput
                type="number"
                min="0.1"
                max="1"
                step="0.1"
                value={customAction.animation?.trailFade || 0.8}
                onChange={(e) => updateProperty('animation.trailFade', parseFloat(e.target.value))}
              />
            </Box>
          </PropertyGrid>

          <PropertyGrid>
            <Box>
              <PropertyLabel>Burst Size (radius)</PropertyLabel>
              <StyledInput
                type="number"
                min="20"
                max="200"
                step="10"
                value={customAction.animation?.burstSize || 80}
                onChange={(e) => updateProperty('animation.burstSize', parseInt(e.target.value))}
              />
            </Box>
            <Box>
              <PropertyLabel>Burst Duration (ms)</PropertyLabel>
              <StyledInput
                type="number"
                min="200"
                max="2000"
                step="100"
                value={customAction.animation?.burstDuration || 600}
                onChange={(e) => updateProperty('animation.burstDuration', parseInt(e.target.value))}
              />
            </Box>
          </PropertyGrid>

          <PropertyGrid>
            <Box>
              <PropertyLabel>Linger Duration (ms)</PropertyLabel>
              <StyledInput
                type="number"
                min="0"
                max="5000"
                step="200"
                value={customAction.animation?.persistDuration || 2000}
                onChange={(e) => updateProperty('animation.persistDuration', parseInt(e.target.value))}
              />
            </Box>
            <Box>
              <PropertyLabel>Linger Opacity</PropertyLabel>
              <StyledInput
                type="number"
                min="0.1"
                max="1"
                step="0.1"
                value={customAction.animation?.persistOpacity || 0.4}
                onChange={(e) => updateProperty('animation.persistOpacity', parseFloat(e.target.value))}
              />
            </Box>
          </PropertyGrid>

          {/* Target Tracking Option */}
          <Box css={{ marginTop: '$3' }}>
            <Box display="flex" alignItems="center" gap="2">
              <input
                type="checkbox"
                id="trackTarget"
                checked={customAction.animation?.trackTarget || false}
                onChange={(e) => updateProperty('animation.trackTarget', e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: 'var(--colors-secondary)'
                }}
              />
              <PropertyLabel css={{ marginBottom: 0, cursor: 'pointer' }} htmlFor="trackTarget">
                Track moving targets (projectile follows target if they move)
              </PropertyLabel>
            </Box>
          </Box>
        </PropertySection>
      )}

      {/* Area Spell Properties */}
      {customAction.animation?.type === 'area' && (
        <PropertySection>
          <SectionTitle>Area Effect Properties</SectionTitle>
          <PropertyGrid>
            <Box>
              <PropertyLabel>Effect Size (radius in px)</PropertyLabel>
              <StyledInput
                type="number"
                min="20"
                max="200"
                step="10"
                value={customAction.animation?.size || 60}
                onChange={(e) => updateProperty('animation.size', parseInt(e.target.value))}
              />
            </Box>
            <Box>
              <PropertyLabel>Animation Duration (ms)</PropertyLabel>
              <StyledInput
                type="number"
                min="200"
                max="2000"
                step="100"
                value={customAction.animation?.duration || 800}
                onChange={(e) => updateProperty('animation.duration', parseInt(e.target.value))}
              />
            </Box>
          </PropertyGrid>

          <PropertyGrid>
            <Box>
              <PropertyLabel>Persist Duration (rounds)</PropertyLabel>
              <StyledInput
                type="number"
                min="0"
                max="20"
                step="1"
                value={customAction.animation?.persistDuration || 0}
                onChange={(e) => updateProperty('animation.persistDuration', parseInt(e.target.value))}
              />
            </Box>
            <Box>
              <PropertyLabel>Persist Opacity</PropertyLabel>
              <StyledInput
                type="number"
                min="0.1"
                max="1"
                step="0.1"
                value={customAction.animation?.persistOpacity || 0.7}
                onChange={(e) => updateProperty('animation.persistOpacity', parseFloat(e.target.value))}
              />
            </Box>
          </PropertyGrid>

          <PropertyGrid>
            <Box>
              <PropertyLabel>Persist Color</PropertyLabel>
              <StyledInput
                type="color"
                value={customAction.animation?.persistColor || customAction.animation?.color || '#3D3D2E'}
                onChange={(e) => updateProperty('animation.persistColor', e.target.value)}
              />
            </Box>
            <Box>
              <PropertyLabel>Secondary Color</PropertyLabel>
              <StyledInput
                type="color"
                value={customAction.animation?.secondaryColor || '#4A4A20'}
                onChange={(e) => updateProperty('animation.secondaryColor', e.target.value)}
              />
            </Box>
          </PropertyGrid>
        </PropertySection>
      )}

      {/* Range and Area */}
      <PropertySection>
        <SectionTitle>Range & Area</SectionTitle>
        <PropertyGrid>
          <Box>
            <PropertyLabel>Range (ft)</PropertyLabel>
            <StyledInput
              type="number"
              min="0"
              max="1000"
              step="5"
              value={customAction.range || 30}
              onChange={(e) => updateProperty('range', parseInt(e.target.value))}
            />
          </Box>
          <Box>
            <PropertyLabel>Area of Effect (ft)</PropertyLabel>
            <StyledInput
              type="number"
              min="0"
              max="100"
              step="5"
              value={customAction.areaOfEffect || 0}
              onChange={(e) => updateProperty('areaOfEffect', parseInt(e.target.value))}
            />
          </Box>
        </PropertyGrid>
      </PropertySection>

      {/* Damage */}
      <PropertySection>
        <SectionTitle>Damage</SectionTitle>
        <PropertyGrid>
          <Box>
            <PropertyLabel>Damage Dice</PropertyLabel>
            <StyledInput
              type="text"
              placeholder="8d6"
              value={customAction.damage || ''}
              onChange={(e) => updateProperty('damage', e.target.value)}
            />
          </Box>
          <Box>
            <PropertyLabel>Damage Type</PropertyLabel>
            <StyledSelect
              value={customAction.damageType || 'fire'}
              onChange={(e) => updateProperty('damageType', e.target.value)}
            >
              <option value="fire">Fire</option>
              <option value="cold">Cold</option>
              <option value="lightning">Lightning</option>
              <option value="acid">Acid</option>
              <option value="poison">Poison</option>
              <option value="psychic">Psychic</option>
              <option value="necrotic">Necrotic</option>
              <option value="radiant">Radiant</option>
              <option value="force">Force</option>
              <option value="thunder">Thunder</option>
            </StyledSelect>
          </Box>
        </PropertyGrid>
      </PropertySection>
    </Box>
  )

  const renderAttackProperties = () => (
    <Box display="flex" flexDirection="column" gap="4">
      {/* Basic Properties */}
      <PropertySection>
        <SectionTitle>Basic Properties</SectionTitle>
        <PropertyGrid>
          <Box>
            <PropertyLabel>Name</PropertyLabel>
            <StyledInput
              type="text"
              value={customAction.name || ''}
              onChange={(e) => {
                const newName = e.target.value
                console.log('Attack name changing to:', newName)
                // Update both name and metadata.name in a single operation
                if (!customAction) return
                const newAction = JSON.parse(JSON.stringify(customAction))
                newAction.name = newName
                if (!newAction.metadata) newAction.metadata = {}
                newAction.metadata.name = newName
                setCustomAction(newAction)
              }}
              placeholder="Attack name"
            />
          </Box>
          <Box>
            <PropertyLabel>Description</PropertyLabel>
            <StyledInput
              type="text"
              value={customAction.description || ''}
              onChange={(e) => {
                const newDescription = e.target.value
                // Update both description and metadata.description in a single operation
                if (!customAction) return
                const newAction = JSON.parse(JSON.stringify(customAction))
                newAction.description = newDescription
                if (!newAction.metadata) newAction.metadata = {}
                newAction.metadata.description = newDescription
                setCustomAction(newAction)
              }}
              placeholder="Attack description"
            />
          </Box>
        </PropertyGrid>
      </PropertySection>

      {/* Animation Properties */}
      <PropertySection>
        <SectionTitle>Animation Properties</SectionTitle>
        <PropertyGrid columns={3}>
          <Box>
            <PropertyLabel>Color</PropertyLabel>
            <ColorInputWrapper>
              <input
                type="color"
                value={customAction.animation?.color || '#FF0000'}
                onChange={(e) => {
                  console.log('Attack color changed to:', e.target.value)
                  updateProperty('animation.color', e.target.value)
                }}
                style={colorInputStyles}
              />
            </ColorInputWrapper>
          </Box>
          <Box>
            <PropertyLabel>Size</PropertyLabel>
            <StyledInput
              type="number"
              min="1"
              max="100"
              value={customAction.animation?.size || 30}
              onChange={(e) => updateProperty('animation.size', parseInt(e.target.value))}
            />
          </Box>
          <Box>
            <PropertyLabel>Duration (ms)</PropertyLabel>
            <StyledInput
              type="number"
              min="100"
              max="3000"
              step="100"
              value={customAction.animation?.duration || 800}
              onChange={(e) => updateProperty('animation.duration', parseInt(e.target.value))}
            />
          </Box>
        </PropertyGrid>
      </PropertySection>

      {/* Animation Type (Read Only) */}
      <PropertySection>
        <SectionTitle>Animation Type (Locked)</SectionTitle>
        <ReadOnlyBox>
          <Text size="sm" color="gray400" css={{ textTransform: 'capitalize' }}>
            {customAction.animation?.type || 'slash'}
          </Text>
        </ReadOnlyBox>
      </PropertySection>

      {/* Attack Properties */}
      <PropertySection>
        <SectionTitle>Attack Properties</SectionTitle>
        <PropertyGrid columns={3}>
          <Box>
            <PropertyLabel>Weapon Type</PropertyLabel>
            <StyledSelect
              value={customAction.weaponType || 'sword'}
              onChange={(e) => updateProperty('weaponType', e.target.value)}
            >
              <option value="sword">Sword</option>
              <option value="axe">Axe</option>
              <option value="mace">Mace</option>
              <option value="dagger">Dagger</option>
              <option value="bow">Bow</option>
              <option value="crossbow">Crossbow</option>
              <option value="spear">Spear</option>
              <option value="staff">Staff</option>
            </StyledSelect>
          </Box>
          <Box>
            <PropertyLabel>Attack Bonus</PropertyLabel>
            <StyledInput
              type="number"
              min="0"
              max="20"
              value={customAction.attackBonus || 5}
              onChange={(e) => updateProperty('attackBonus', parseInt(e.target.value))}
            />
          </Box>
          <Box>
            <PropertyLabel>Range (ft)</PropertyLabel>
            <StyledInput
              type="number"
              min="5"
              max="600"
              step="5"
              value={customAction.range || 5}
              onChange={(e) => updateProperty('range', parseInt(e.target.value))}
            />
          </Box>
        </PropertyGrid>
      </PropertySection>

      {/* Damage */}
      <PropertySection>
        <SectionTitle>Damage</SectionTitle>
        <PropertyGrid>
          <Box>
            <PropertyLabel>Damage Dice</PropertyLabel>
            <StyledInput
              type="text"
              placeholder="1d8+3"
              value={customAction.damage || ''}
              onChange={(e) => updateProperty('damage', e.target.value)}
            />
          </Box>
          <Box>
            <PropertyLabel>Damage Type</PropertyLabel>
            <StyledSelect
              value={customAction.damageType || 'slashing'}
              onChange={(e) => updateProperty('damageType', e.target.value)}
            >
              <option value="slashing">Slashing</option>
              <option value="piercing">Piercing</option>
              <option value="bludgeoning">Bludgeoning</option>
              <option value="fire">Fire</option>
              <option value="cold">Cold</option>
              <option value="lightning">Lightning</option>
              <option value="acid">Acid</option>
              <option value="poison">Poison</option>
              <option value="psychic">Psychic</option>
              <option value="necrotic">Necrotic</option>
              <option value="radiant">Radiant</option>
              <option value="force">Force</option>
              <option value="thunder">Thunder</option>
            </StyledSelect>
          </Box>
        </PropertyGrid>
      </PropertySection>
    </Box>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <ModalBody css={{ padding: 0 }}>
        {/* Header */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          css={{
            padding: '$4',
            borderBottom: '1px solid $gray700',
            backgroundColor: '$gray800'
          }}
        >
          <Box display="flex" alignItems="center" gap="2">
            {isSpell ? <Wand2 size={20} color="#8B5CF6" /> : <Sword size={20} color="#EF4444" />}
            <Box>
              <Text size="lg" weight="medium" color="white">
                Customize {isSpell ? 'Spell' : 'Attack'}
              </Text>
              <Text size="sm" color="gray400">
                Based on: {baseAction.name}
              </Text>
            </Box>
          </Box>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            css={{ color: '$gray400' }}
          >
            <X size={18} />
          </Button>
        </Box>

        {/* Content */}
        <Box
          css={{
            padding: '$4',
            maxHeight: '70vh',
            overflowY: 'auto'
          }}
        >
          {/* Properties Form */}
          {isSpell ? renderSpellProperties() : renderAttackProperties()}
        </Box>

        {/* Footer */}
        <Box
          display="flex"
          justifyContent="flex-end"
          gap="2"
          css={{
            padding: '$4',
            borderTop: '1px solid $gray700',
            backgroundColor: '$gray900/50'
          }}
        >
          <Button
            onClick={onClose}
            variant="outline"
            css={{
              backgroundColor: '$gray700',
              color: '$gray300',
              '&:hover': {
                backgroundColor: '$gray600'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            css={{
              backgroundColor: '$secondary',
              color: '$dndBlack',
              '&:hover': { backgroundColor: '$yellow500' }
            }}
          >
            <Save size={16} style={{ marginRight: '4px' }} />
            Save Custom Action
          </Button>
        </Box>
      </ModalBody>
    </Modal>
  )
}

export const ActionCustomizationModal = React.memo(ActionCustomizationModalComponent)
ActionCustomizationModal.displayName = 'ActionCustomizationModal'