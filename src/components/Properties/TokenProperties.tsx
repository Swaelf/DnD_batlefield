import { memo, type FC, type ChangeEvent } from 'react'
import type { Token } from '@/types'
import { ColorPicker } from './ColorPicker'
import { Heart, Shield, Plus, Minus } from '@/utils/optimizedIcons'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import {
  PanelSection,
  Field,
  FieldLabel,
  Input,
  Select,
  SelectOption
} from '@/components/ui'


type TokenPropertiesProps = {
  token: Token
  onUpdate: (updates: Partial<Token>) => void
}

const TokenPropertiesComponent: FC<TokenPropertiesProps> = ({
  token,
  onUpdate
}) => {
  return (
    <>
    <PanelSection>
      <Field>
        <FieldLabel>Name</FieldLabel>
        <Input
          value={token.name || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate({ name: e.target.value })}
          placeholder="Token name"
          fullWidth
        />
      </Field>

      <Field>
        <FieldLabel>Size</FieldLabel>
        <Select
          value={token.size}
          onValueChange={(value) => onUpdate({ size: value as Token['size'] })}
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
        <Box
          style={{
            display: 'flex',
            gap: '8px'
          }}
        >
          <Button
            onClick={() => onUpdate({ shape: 'circle' })}
            variant={token.shape === 'circle' ? 'primary' : 'outline'}
              style={{
              flex: 1,
              backgroundColor: token.shape === 'circle' ? 'var(--colors-dndRed)' : 'var(--colors-gray800)',
              borderColor: token.shape === 'circle' ? 'var(--colors-dndRed)' : 'var(--colors-gray600)',
              color: token.shape === 'circle' ? 'white' : 'var(--colors-gray300)'
            }}
          >
            Circle
          </Button>
          <Button
            onClick={() => onUpdate({ shape: 'square' })}
            variant={token.shape === 'square' ? 'primary' : 'outline'}
              style={{
              flex: 1,
              backgroundColor: token.shape === 'square' ? 'var(--colors-dndRed)' : 'var(--colors-gray800)',
              borderColor: token.shape === 'square' ? 'var(--colors-dndRed)' : 'var(--colors-gray600)',
              color: token.shape === 'square' ? 'white' : 'var(--colors-gray300)'
            }}
          >
            Square
          </Button>
        </Box>
      </Field>

      <Field>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <input
            type="checkbox"
            id="showLabel"
            checked={token.showLabel || false}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate({ showLabel: e.target.checked })}
            style={{
              width: '16px',
              height: '16px',
              backgroundColor: 'var(--colors-gray800)',
              borderColor: 'var(--colors-gray600)',
              borderRadius: '4px'
            }}
          />
          <FieldLabel
            htmlFor="showLabel"
            style={{
              margin: 0,
              cursor: 'pointer'
            }}
          >
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
              fullWidth
          >
            <SelectOption value="top">Top</SelectOption>
            <SelectOption value="bottom">Bottom</SelectOption>
          </Select>
        </Field>
      )}
    </PanelSection>

    {/* HP Management Section */}
    <PanelSection>
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}
      >
        <Heart size={16} color="#DC2626" />
        <Text
          variant="label"
          style={{
            fontWeight: '600',
            color: 'var(--colors-gray100)'
          }}
        >
          Hit Points
        </Text>
      </Box>

      <Field>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <input
            type="checkbox"
            id="showHP"
            checked={token.showHP || false}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate({ showHP: e.target.checked })}
            style={{
              width: '16px',
              height: '16px',
              backgroundColor: 'var(--colors-gray800)',
              borderColor: 'var(--colors-gray600)',
              borderRadius: '4px'
            }}
          />
          <FieldLabel
            htmlFor="showHP"
            style={{
              margin: 0,
              cursor: 'pointer'
            }}
          >
            Show HP Ring
          </FieldLabel>
        </Box>
      </Field>

      <Field>
        <FieldLabel>Current HP</FieldLabel>
        <Box
          style={{
            display: 'flex',
            gap: '8px'
          }}
        >
          <Input
            type="number"
            value={token.currentHP || 0}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onUpdate({ currentHP: parseInt(e.target.value) || 0 })}
              style={{
              flex: 1
            }}
          />
          <Button
            onClick={() => onUpdate({ currentHP: (token.currentHP || 0) - 1 })}
            variant="outline"
              title="Decrease by 1"
            style={{
              backgroundColor: 'var(--colors-gray800)',
              borderColor: 'var(--colors-gray600)',
              color: 'var(--colors-gray300)'
            }}
          >
            <Minus size={14} />
          </Button>
          <Button
            onClick={() => onUpdate({ currentHP: (token.currentHP || 0) + 1 })}
            variant="outline"
              title="Increase by 1"
            style={{
              backgroundColor: 'var(--colors-gray800)',
              borderColor: 'var(--colors-gray600)',
              color: 'var(--colors-gray300)'
            }}
          >
            <Plus size={14} />
          </Button>
        </Box>
      </Field>

      <Field>
        <FieldLabel>Max HP</FieldLabel>
        <Input
          type="number"
          value={token.maxHP || 0}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onUpdate({ maxHP: parseInt(e.target.value) || 0 })}
          fullWidth
        />
      </Field>

      <Field>
        <FieldLabel>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Shield size={14} color="#3B82F6" />
            <span>Temp HP</span>
          </Box>
        </FieldLabel>
        <Input
          type="number"
          value={token.tempHP || 0}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onUpdate({ tempHP: parseInt(e.target.value) || 0 })}
          fullWidth
        />
      </Field>

      {/* Quick Actions */}
      <Box
        style={{
          display: 'flex',
          gap: '8px',
          marginTop: '12px'
        }}
      >
        <Button
          onClick={() => onUpdate({ currentHP: (token.currentHP || 0) - 5 })}
          variant="outline"
          title="Damage 5"
          style={{
            flex: 1,
            backgroundColor: 'var(--colors-gray800)',
            borderColor: 'var(--colors-gray600)',
            color: 'var(--colors-gray300)'
          }}
        >
          -5
        </Button>
        <Button
          onClick={() => onUpdate({ currentHP: (token.currentHP || 0) + 5 })}
          variant="outline"
          title="Heal 5"
          style={{
            flex: 1,
            backgroundColor: 'var(--colors-gray800)',
            borderColor: 'var(--colors-gray600)',
            color: 'var(--colors-gray300)'
          }}
        >
          +5
        </Button>
        <Button
          onClick={() => onUpdate({ currentHP: token.maxHP || 0 })}
          variant="outline"
          title="Heal to full"
          style={{
            flex: 1,
            backgroundColor: 'var(--colors-gray800)',
            borderColor: 'var(--colors-gray600)',
            color: 'var(--colors-gray300)'
          }}
        >
          Full
        </Button>
        <Button
          onClick={() => onUpdate({ currentHP: 0 })}
          variant="outline"
          title="Knock out"
          style={{
            flex: 1,
            backgroundColor: 'var(--colors-gray800)',
            borderColor: 'var(--colors-gray600)',
            color: 'var(--colors-gray300)'
          }}
        >
          KO
        </Button>
      </Box>

      {/* HP Display */}
      {token.maxHP && (
        <Box
          style={{
            marginTop: '12px',
            padding: '8px',
            backgroundColor: 'var(--colors-gray800)',
            borderRadius: '4px',
            border: '1px solid var(--colors-gray700)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Text
            variant="body"
            size="lg"
            style={{
              fontWeight: 'bold',
              color: 'var(--colors-secondary)'
            }}
          >
            {token.currentHP || 0} / {token.maxHP}
            {token.tempHP ? ` (+${token.tempHP})` : ''}
          </Text>
        </Box>
      )}
    </PanelSection>
    </>
  )
}

export const TokenProperties = memo(TokenPropertiesComponent)
TokenProperties.displayName = 'TokenProperties'