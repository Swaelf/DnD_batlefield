import { memo, type FC, type ChangeEvent } from 'react'
import type { Token } from '@/types'
import { Shield, Plus, Minus } from '@/utils/optimizedIcons'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Input } from '@/components/ui/Input'

type TokenHPControlsProps = {
  token: Token
  onUpdate: (updates: Partial<Token>) => void
}

const TokenHPControlsComponent: FC<TokenHPControlsProps> = ({
  token,
  onUpdate
}) => {
  return (
    <>
      {/* Show HP Ring Checkbox */}
      <Box display="flex" alignItems="center" gap={2}>
        <input
          type="checkbox"
          id="showHP"
          checked={token.showHP || false}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate({ showHP: e.target.checked })}
          style={{
            width: '14px',
            height: '14px',
            cursor: 'pointer'
          }}
        />
        <label
          htmlFor="showHP"
          style={{
            cursor: 'pointer',
            fontSize: '12px',
            color: '#D4D4D4'
          }}
        >
          Show HP Ring
        </label>
      </Box>

      {/* Current and Max HP */}
      <Box display="flex" gap={2}>
        <Box flexGrow={1}>
          <Box marginBottom={1}>
            <Text size="xs" color="gray400">Current HP</Text>
          </Box>
          <Box display="flex" gap={1}>
            <Input
              type="number"
              value={token.currentHP || 0}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onUpdate({ currentHP: parseInt(e.target.value) || 0 })}
              size="sm"
              fullWidth
              style={{ border: '1px solid #525252' }}
            />
            <Button
              onClick={() => onUpdate({ currentHP: Math.max(0, (token.currentHP || 0) - 1) })}
              size="sm"
              variant="outline"
              title="Decrease by 1"
              style={{ padding: '4px 6px' }}
            >
              <Minus size={12} />
            </Button>
            <Button
              onClick={() => onUpdate({ currentHP: (token.currentHP || 0) + 1 })}
              size="sm"
              variant="outline"
              title="Increase by 1"
              style={{ padding: '4px 6px' }}
            >
              <Plus size={12} />
            </Button>
          </Box>
        </Box>

        <Box style={{ width: '80px' }}>
          <Box marginBottom={1}>
            <Text size="xs" color="gray400">Max HP</Text>
          </Box>
          <Input
            type="number"
            value={token.maxHP || 0}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onUpdate({ maxHP: parseInt(e.target.value) || 0 })}
            size="sm"
            fullWidth
            style={{ border: '1px solid #525252' }}
          />
        </Box>
      </Box>

      {/* Temp HP */}
      <Box>
        <Box marginBottom={1} display="flex" alignItems="center" gap={1}>
          <Shield size={12} color="#3B82F6" />
          <Text size="xs" color="gray400">Temporary HP</Text>
        </Box>
        <Input
          type="number"
          value={token.tempHP || 0}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onUpdate({ tempHP: parseInt(e.target.value) || 0 })}
          size="sm"
          fullWidth
          style={{ border: '1px solid #525252' }}
        />
      </Box>
    </>
  )
}

export const TokenHPControls = memo(TokenHPControlsComponent)
TokenHPControls.displayName = 'TokenHPControls'
