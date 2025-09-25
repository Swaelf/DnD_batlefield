/**
 * TokenProperties Organism Component
 *
 * Complete token property editing interface with D&D 5e integration.
 * Replaces legacy TokenProperties.tsx with modern form architecture.
 * Organism design: 100-150 lines, comprehensive property editing.
 */

import React from 'react'
import { styled } from '@/styles/theme.config'
import { Settings, X, RotateCcw, Save } from 'lucide-react'
import type { Token, TokenUpdate } from '../../../types'
import { ValidationService } from '../../../services'

export interface TokenPropertiesProps {
  readonly token: Token
  readonly onUpdate: (updates: TokenUpdate) => void
  readonly onClose?: () => void
  readonly isOpen?: boolean
}

const PropertiesContainer = styled('div', {
  backgroundColor: '$gray900',
  border: '1px solid $gray700',
  borderRadius: '$lg',
  width: '320px',
  maxHeight: '600px',
  display: 'flex',
  flexDirection: 'column',
  color: '$gray100'
})

const PropertiesHeader = styled('div', {
  padding: '$3',
  borderBottom: '1px solid $gray700',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
})

const PropertiesTitle = styled('h3', {
  color: '$dndGold',
  fontSize: '$md',
  fontWeight: '600',
  margin: 0
})

const HeaderActions = styled('div', {
  display: 'flex',
  gap: '$1'
})

const HeaderButton = styled('button', {
  backgroundColor: 'transparent',
  border: 'none',
  color: '$gray400',
  cursor: 'pointer',
  padding: '$1',
  borderRadius: '$sm',

  '&:hover': {
    color: '$gray100',
    backgroundColor: '$gray800'
  }
})

const PropertiesContent = styled('div', {
  flex: 1,
  padding: '$3',
  overflowY: 'auto'
})

const PropertyGroup = styled('div', {
  marginBottom: '$4',

  '&:last-child': {
    marginBottom: 0
  }
})

const GroupTitle = styled('h4', {
  color: '$dndGold',
  fontSize: '$sm',
  fontWeight: '600',
  margin: '0 0 $2 0',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
})

const PropertyField = styled('div', {
  marginBottom: '$3'
})

const FieldLabel = styled('label', {
  display: 'block',
  color: '$gray200',
  fontSize: '$sm',
  fontWeight: '500',
  marginBottom: '$1'
})

const FieldInput = styled('input', {
  width: '100%',
  padding: '$2',
  backgroundColor: '$gray800',
  border: '1px solid $gray600',
  borderRadius: '$md',
  color: '$gray100',
  fontSize: '$sm',

  '&:focus': {
    outline: 'none',
    borderColor: '$dndGold'
  }
})

const FieldSelect = styled('select', {
  width: '100%',
  padding: '$2',
  backgroundColor: '$gray800',
  border: '1px solid $gray600',
  borderRadius: '$md',
  color: '$gray100',
  fontSize: '$sm',
  cursor: 'pointer',

  '&:focus': {
    outline: 'none',
    borderColor: '$dndGold'
  }
})

const ColorInput = styled('input', {
  width: '100%',
  height: '36px',
  padding: '$1',
  backgroundColor: '$gray800',
  border: '1px solid $gray600',
  borderRadius: '$md',
  cursor: 'pointer',

  '&:focus': {
    outline: 'none',
    borderColor: '$dndGold'
  }
})

const CheckboxField = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2'
})

const Checkbox = styled('input', {
  accentColor: '$dndGold'
})

const PropertiesFooter = styled('div', {
  padding: '$3',
  borderTop: '1px solid $gray700',
  display: 'flex',
  gap: '$2',
  justifyContent: 'flex-end'
})

const FooterButton = styled('button', {
  padding: '$2 $3',
  borderRadius: '$md',
  fontSize: '$sm',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  variants: {
    variant: {
      primary: {
        backgroundColor: '$dndRed',
        color: '$gray100',
        border: '1px solid $dndRed',

        '&:hover': {
          backgroundColor: '$red700'
        }
      },
      secondary: {
        backgroundColor: 'transparent',
        color: '$gray300',
        border: '1px solid $gray600',

        '&:hover': {
          backgroundColor: '$gray800',
          color: '$gray100'
        }
      }
    }
  }
})

export const TokenProperties: React.FC<TokenPropertiesProps> = React.memo(({
  token,
  onUpdate,
  onClose,
  isOpen = true
}) => {
  const [localToken, setLocalToken] = React.useState(token)
  const [isDirty, setIsDirty] = React.useState(false)

  // Validation service
  const validationService = React.useMemo(() => ValidationService.getInstance(), [])

  // Update local token when prop changes
  React.useEffect(() => {
    setLocalToken(token)
    setIsDirty(false)
  }, [token])

  const handleFieldChange = React.useCallback(<K extends keyof Token>(
    field: K,
    value: Token[K]
  ) => {
    setLocalToken(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }, [])

  const handleLabelChange = React.useCallback(<K extends keyof Token['label']>(
    field: K,
    value: Token['label'][K]
  ) => {
    setLocalToken(prev => ({
      ...prev,
      label: { ...prev.label, [field]: value }
    }))
    setIsDirty(true)
  }, [])

  const handleSave = React.useCallback(() => {
    const updates: TokenUpdate = {
      name: localToken.name,
      size: localToken.size,
      shape: localToken.shape,
      color: localToken.color,
      borderColor: localToken.borderColor,
      borderWidth: localToken.borderWidth,
      opacity: localToken.opacity,
      category: localToken.category,
      isPlayer: localToken.isPlayer,
      label: localToken.label,
      lastModified: new Date()
    }

    onUpdate(updates)
    setIsDirty(false)
  }, [localToken, onUpdate])

  const handleReset = React.useCallback(() => {
    setLocalToken(token)
    setIsDirty(false)
  }, [token])

  if (!isOpen) return null

  return (
    <PropertiesContainer>
      <PropertiesHeader>
        <PropertiesTitle>Token Properties</PropertiesTitle>
        <HeaderActions>
          <HeaderButton onClick={() => console.log('Settings')}>
            <Settings size={16} />
          </HeaderButton>
          {onClose && (
            <HeaderButton onClick={onClose}>
              <X size={16} />
            </HeaderButton>
          )}
        </HeaderActions>
      </PropertiesHeader>

      <PropertiesContent>
        {/* Basic Properties */}
        <PropertyGroup>
          <GroupTitle>Basic</GroupTitle>

          <PropertyField>
            <FieldLabel>Name</FieldLabel>
            <FieldInput
              value={localToken.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
            />
          </PropertyField>

          <PropertyField>
            <FieldLabel>Size</FieldLabel>
            <FieldSelect
              value={localToken.size}
              onChange={(e) => handleFieldChange('size', e.target.value as any)}
            >
              <option value="tiny">Tiny</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="huge">Huge</option>
              <option value="gargantuan">Gargantuan</option>
            </FieldSelect>
          </PropertyField>

          <PropertyField>
            <FieldLabel>Category</FieldLabel>
            <FieldSelect
              value={localToken.category}
              onChange={(e) => handleFieldChange('category', e.target.value as any)}
            >
              <option value="player">Player</option>
              <option value="enemy">Enemy</option>
              <option value="npc">NPC</option>
              <option value="object">Object</option>
              <option value="environment">Environment</option>
            </FieldSelect>
          </PropertyField>

          <PropertyField>
            <CheckboxField>
              <Checkbox
                type="checkbox"
                checked={localToken.isPlayer}
                onChange={(e) => handleFieldChange('isPlayer', e.target.checked)}
              />
              <FieldLabel>Player Character</FieldLabel>
            </CheckboxField>
          </PropertyField>
        </PropertyGroup>

        {/* Appearance */}
        <PropertyGroup>
          <GroupTitle>Appearance</GroupTitle>

          <PropertyField>
            <FieldLabel>Shape</FieldLabel>
            <FieldSelect
              value={localToken.shape}
              onChange={(e) => handleFieldChange('shape', e.target.value as any)}
            >
              <option value="circle">Circle</option>
              <option value="square">Square</option>
            </FieldSelect>
          </PropertyField>

          <PropertyField>
            <FieldLabel>Color</FieldLabel>
            <ColorInput
              type="color"
              value={localToken.color}
              onChange={(e) => handleFieldChange('color', e.target.value)}
            />
          </PropertyField>

          <PropertyField>
            <FieldLabel>Opacity</FieldLabel>
            <FieldInput
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={localToken.opacity}
              onChange={(e) => handleFieldChange('opacity', parseFloat(e.target.value))}
            />
          </PropertyField>
        </PropertyGroup>

        {/* Label */}
        <PropertyGroup>
          <GroupTitle>Label</GroupTitle>

          <PropertyField>
            <FieldLabel>Text</FieldLabel>
            <FieldInput
              value={localToken.label.text}
              onChange={(e) => handleLabelChange('text', e.target.value)}
            />
          </PropertyField>

          <PropertyField>
            <FieldLabel>Position</FieldLabel>
            <FieldSelect
              value={localToken.label.position}
              onChange={(e) => handleLabelChange('position', e.target.value as any)}
            >
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="hidden">Hidden</option>
            </FieldSelect>
          </PropertyField>
        </PropertyGroup>
      </PropertiesContent>

      <PropertiesFooter>
        <FooterButton variant="secondary" onClick={handleReset}>
          <RotateCcw size={16} />
          Reset
        </FooterButton>
        <FooterButton variant="primary" onClick={handleSave}>
          <Save size={16} />
          Save
        </FooterButton>
      </PropertiesFooter>
    </PropertiesContainer>
  )
})