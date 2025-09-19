import React, { memo } from 'react'
import { Token } from '@/types'
import { ColorPicker } from './ColorPicker'
import {
  PanelSection,
  Field,
  FieldLabel,
  Input,
  Select,
  SelectOption,
  Button,
  Box
} from '@/components/ui'

type TokenPropertiesProps = {
  token: Token
  onUpdate: (updates: Partial<Token>) => void
}

const TokenPropertiesComponent: React.FC<TokenPropertiesProps> = ({
  token,
  onUpdate
}) => {
  return (
    <PanelSection>
      <Field>
        <FieldLabel>Name</FieldLabel>
        <Input
          value={token.name || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ name: e.target.value })}
          placeholder="Token name"
          fullWidth
          size="sm"
        />
      </Field>

      <Field>
        <FieldLabel>Size</FieldLabel>
        <Select
          value={token.size}
          onValueChange={(value) => onUpdate({ size: value as Token['size'] })}
          size="sm"
          fullWidth
        >
          <SelectOption value="tiny">Tiny (2.5ft)</SelectOption>
          <SelectOption value="small">Small (5ft)</SelectOption>
          <SelectOption value="medium">Medium (5ft)</SelectOption>
          <SelectOption value="large">Large (10ft)</SelectOption>
          <SelectOption value="huge">Huge (15ft)</SelectOption>
          <SelectOption value="gargantuan">Gargantuan (20ft+)</SelectOption>
        </Select>
      </Field>

      <Field>
        <FieldLabel>Color</FieldLabel>
        <ColorPicker
          color={token.color}
          onChange={(color) => onUpdate({ color })}
        />
      </Field>

      <Field>
        <FieldLabel>Shape</FieldLabel>
        <Box display="flex" gap="2">
          <Button
            onClick={() => onUpdate({ shape: 'circle' })}
            variant={token.shape === 'circle' ? 'primary' : 'outline'}
            size="sm"
            fullWidth
          >
            Circle
          </Button>
          <Button
            onClick={() => onUpdate({ shape: 'square' })}
            variant={token.shape === 'square' ? 'primary' : 'outline'}
            size="sm"
            fullWidth
          >
            Square
          </Button>
        </Box>
      </Field>

      <Field>
        <Box display="flex" alignItems="center" gap="2">
          <input
            type="checkbox"
            id="showLabel"
            checked={token.showLabel || false}
            onChange={(e) => onUpdate({ showLabel: e.target.checked })}
            style={{
              width: '16px',
              height: '16px',
              backgroundColor: 'var(--colors-gray800)',
              borderColor: 'var(--colors-gray600)',
              borderRadius: '4px',
            }}
          />
          <FieldLabel htmlFor="showLabel" css={{ margin: 0, cursor: 'pointer' }}>
            Show Label
          </FieldLabel>
        </Box>
      </Field>

      {token.showLabel && (
        <Field>
          <FieldLabel>Label Position</FieldLabel>
          <Select
            value={token.labelPosition || 'bottom'}
            onValueChange={(value) => onUpdate({ labelPosition: value as Token['labelPosition'] })}
            size="sm"
            fullWidth
          >
            <SelectOption value="top">Top</SelectOption>
            <SelectOption value="bottom">Bottom</SelectOption>
          </Select>
        </Field>
      )}
    </PanelSection>
  )
}

export const TokenProperties = memo(TokenPropertiesComponent)
TokenProperties.displayName = 'TokenProperties'