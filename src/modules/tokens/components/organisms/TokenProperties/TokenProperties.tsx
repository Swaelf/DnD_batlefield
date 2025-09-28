/**
 * TokenProperties Organism Component
 * Complete token property editing interface with D&D 5e integration
 */

import React from 'react'
import { Settings, X, RotateCcw, Save } from 'lucide-react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import type { Token, TokenUpdate } from '../../../types'

export interface TokenPropertiesProps {
  readonly token: Token
  readonly onUpdate: (updates: TokenUpdate) => void
  readonly onClose?: () => void
  readonly isOpen?: boolean
}


export const TokenProperties: React.FC<TokenPropertiesProps> = React.memo(({
  token,
  onUpdate,
  onClose,
  isOpen = true
}) => {
  const [localToken, setLocalToken] = React.useState(token)

  // Update local token when prop changes
  React.useEffect(() => {
    setLocalToken(token)
  }, [token])

  const handleFieldChange = React.useCallback(<K extends keyof Token>(
    field: K,
    value: Token[K]
  ) => {
    setLocalToken(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleLabelChange = React.useCallback(<K extends keyof Token['label']>(
    field: K,
    value: Token['label'][K]
  ) => {
    setLocalToken(prev => ({
      ...prev,
      label: { ...prev.label, [field]: value }
    }))
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
  }, [localToken, onUpdate])

  const handleReset = React.useCallback(() => {
    setLocalToken(token)
  }, [token])

  if (!isOpen) return null

  return (
    <Box
      style={{
        backgroundColor: 'var(--colors-gray900)',
        border: '1px solid var(--colors-gray700)',
        borderRadius: '8px',
        width: '320px',
        maxHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        color: 'var(--colors-gray100)'
      }}
    >
      {/* Header */}
      <Box
        style={{
          padding: '12px',
          borderBottom: '1px solid var(--colors-gray700)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Text
          variant="heading"
          size="md"
          style={{
            color: 'var(--colors-dndGold)',
            fontWeight: '600',
            margin: 0
          }}
        >
          Token Properties
        </Text>
        <Box style={{ display: 'flex', gap: '4px' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => console.log('Settings')}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--colors-gray400)',
              padding: '4px'
            }}
          >
            <Settings size={16} />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--colors-gray400)',
                padding: '4px'
              }}
            >
              <X size={16} />
            </Button>
          )}
        </Box>
      </Box>

      {/* Content */}
      <Box
        style={{
          flex: 1,
          padding: '12px',
          overflowY: 'auto'
        }}
      >
        {/* Basic Properties */}
        <Box style={{ marginBottom: '16px' }}>
          <Text
            variant="heading"
            size="sm"
            style={{
              color: 'var(--colors-dndGold)',
              fontWeight: '600',
              margin: '0 0 8px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Basic
          </Text>

          <Box style={{ marginBottom: '12px' }}>
            <Text
              as="label"
              variant="body"
              size="sm"
              style={{
                display: 'block',
                color: 'var(--colors-gray200)',
                fontWeight: '500',
                marginBottom: '4px'
              }}
            >
              Name
            </Text>
            <input
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: 'var(--colors-gray800)',
                border: '1px solid var(--colors-gray600)',
                borderRadius: '6px',
                color: 'var(--colors-gray100)',
                fontSize: '14px'
              }}
              value={localToken.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('name', e.target.value)}
            />
          </Box>

          <Box style={{ marginBottom: '12px' }}>
            <Text
              as="label"
              variant="body"
              size="sm"
              style={{
                display: 'block',
                color: 'var(--colors-gray200)',
                fontWeight: '500',
                marginBottom: '4px'
              }}
            >
              Size
            </Text>
            <select
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: 'var(--colors-gray800)',
                border: '1px solid var(--colors-gray600)',
                borderRadius: '6px',
                color: 'var(--colors-gray100)',
                fontSize: '14px',
                cursor: 'pointer'
              }}
              value={localToken.size}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFieldChange('size', e.target.value as any)}
            >
              <option value="tiny">Tiny</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="huge">Huge</option>
              <option value="gargantuan">Gargantuan</option>
            </select>
          </Box>

          <Box style={{ marginBottom: '12px' }}>
            <Text
              as="label"
              variant="body"
              size="sm"
              style={{
                display: 'block',
                color: 'var(--colors-gray200)',
                fontWeight: '500',
                marginBottom: '4px'
              }}
            >
              Category
            </Text>
            <select
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: 'var(--colors-gray800)',
                border: '1px solid var(--colors-gray600)',
                borderRadius: '6px',
                color: 'var(--colors-gray100)',
                fontSize: '14px',
                cursor: 'pointer'
              }}
              value={localToken.category}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFieldChange('category', e.target.value as any)}
            >
              <option value="player">Player</option>
              <option value="enemy">Enemy</option>
              <option value="npc">NPC</option>
              <option value="object">Object</option>
              <option value="environment">Environment</option>
            </select>
          </Box>

          <Box
            style={{
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <input
              type="checkbox"
              checked={localToken.isPlayer}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('isPlayer', e.target.checked)}
              style={{ accentColor: 'var(--colors-dndGold)' }}
            />
            <Text
              as="label"
              variant="body"
              size="sm"
              style={{
                color: 'var(--colors-gray200)',
                fontWeight: '500'
              }}
            >
              Player Character
            </Text>
          </Box>
        </Box>

        {/* Appearance */}
        <Box style={{ marginBottom: '16px' }}>
          <Text
            variant="heading"
            size="sm"
            style={{
              color: 'var(--colors-dndGold)',
              fontWeight: '600',
              margin: '0 0 8px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Appearance
          </Text>

          <Box style={{ marginBottom: '12px' }}>
            <Text
              as="label"
              variant="body"
              size="sm"
              style={{
                display: 'block',
                color: 'var(--colors-gray200)',
                fontWeight: '500',
                marginBottom: '4px'
              }}
            >
              Shape
            </Text>
            <select
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: 'var(--colors-gray800)',
                border: '1px solid var(--colors-gray600)',
                borderRadius: '6px',
                color: 'var(--colors-gray100)',
                fontSize: '14px',
                cursor: 'pointer'
              }}
              value={localToken.shape}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFieldChange('shape', e.target.value as any)}
            >
              <option value="circle">Circle</option>
              <option value="square">Square</option>
            </select>
          </Box>

          <Box style={{ marginBottom: '12px' }}>
            <Text
              as="label"
              variant="body"
              size="sm"
              style={{
                display: 'block',
                color: 'var(--colors-gray200)',
                fontWeight: '500',
                marginBottom: '4px'
              }}
            >
              Color
            </Text>
            <input
              type="color"
              value={localToken.color}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('color', e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                padding: '4px',
                backgroundColor: 'var(--colors-gray800)',
                border: '1px solid var(--colors-gray600)',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            />
          </Box>

          <Box style={{ marginBottom: '12px' }}>
            <Text
              as="label"
              variant="body"
              size="sm"
              style={{
                display: 'block',
                color: 'var(--colors-gray200)',
                fontWeight: '500',
                marginBottom: '4px'
              }}
            >
              Opacity
            </Text>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={localToken.opacity}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('opacity', parseFloat(e.target.value))}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: 'var(--colors-gray800)',
                border: '1px solid var(--colors-gray600)',
                borderRadius: '6px',
                color: 'var(--colors-gray100)',
                fontSize: '14px'
              }}
            />
          </Box>
        </Box>

        {/* Label */}
        <Box style={{ marginBottom: 0 }}>
          <Text
            variant="heading"
            size="sm"
            style={{
              color: 'var(--colors-dndGold)',
              fontWeight: '600',
              margin: '0 0 8px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Label
          </Text>

          <Box style={{ marginBottom: '12px' }}>
            <Text
              as="label"
              variant="body"
              size="sm"
              style={{
                display: 'block',
                color: 'var(--colors-gray200)',
                fontWeight: '500',
                marginBottom: '4px'
              }}
            >
              Text
            </Text>
            <input
              value={localToken.label.text}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLabelChange('text', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: 'var(--colors-gray800)',
                border: '1px solid var(--colors-gray600)',
                borderRadius: '6px',
                color: 'var(--colors-gray100)',
                fontSize: '14px'
              }}
            />
          </Box>

          <Box style={{ marginBottom: '12px' }}>
            <Text
              as="label"
              variant="body"
              size="sm"
              style={{
                display: 'block',
                color: 'var(--colors-gray200)',
                fontWeight: '500',
                marginBottom: '4px'
              }}
            >
              Position
            </Text>
            <select
              value={localToken.label.position}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleLabelChange('position', e.target.value as any)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: 'var(--colors-gray800)',
                border: '1px solid var(--colors-gray600)',
                borderRadius: '6px',
                color: 'var(--colors-gray100)',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="hidden">Hidden</option>
            </select>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        style={{
          padding: '12px',
          borderTop: '1px solid var(--colors-gray700)',
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end'
        }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'transparent',
            color: 'var(--colors-gray300)',
            border: '1px solid var(--colors-gray600)'
          }}
        >
          <RotateCcw size={16} />
          Reset
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'var(--colors-dndRed)',
            color: 'var(--colors-gray100)',
            border: '1px solid var(--colors-dndRed)'
          }}
        >
          <Save size={16} />
          Save
        </Button>
      </Box>
    </Box>
  )
})