import { memo, type FC, type ChangeEvent } from 'react'
import type { Token } from '@/types'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Input } from '@/components/ui/Input'

type TokenInfoSectionProps = {
  token: Token
  onUpdate: (updates: Partial<Token>) => void
}

const TokenInfoSectionComponent: FC<TokenInfoSectionProps> = ({
  token,
  onUpdate
}) => {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {/* Name */}
      <Box>
        <Box marginBottom={1}>
          <Text size="xs" color="gray400">Name</Text>
        </Box>
        <Input
          value={token.name || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate({ name: e.target.value })}
          placeholder="Token name"
          size="sm"
          fullWidth
          style={{ border: '1px solid #525252' }}
        />
      </Box>

      {/* Size and Shape Row */}
      <Box display="flex" gap={2}>
        <Box flexGrow={1}>
          <Box marginBottom={1}>
            <Text size="xs" color="gray400">Size</Text>
          </Box>
          <Box display="flex" gap={1}>
            <select
              value={token.size}
              onChange={(e) => onUpdate({ size: e.target.value as Token['size'] })}
              style={{
                width: '100%',
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor: '#262626',
                border: '1px solid #525252',
                borderRadius: '4px',
                color: '#F5F5F5',
                cursor: 'pointer'
              }}
            >
              <option value="tiny">Tiny</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="huge">Huge</option>
              <option value="gargantuan">Gargantuan</option>
            </select>
          </Box>
        </Box>

        <Box style={{ width: '80px' }}>
          <Box marginBottom={1}>
            <Text size="xs" color="gray400">Shape</Text>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              onClick={() => onUpdate({ shape: 'circle' })}
              size="sm"
              variant={token.shape === 'circle' ? 'primary' : 'outline'}
              style={{
                flex: 1,
                padding: '4px',
                minWidth: '0',
                backgroundColor: token.shape === 'circle' ? '#C9AD6A' : 'transparent',
                borderColor: token.shape === 'circle' ? '#C9AD6A' : '#525252',
                color: token.shape === 'circle' ? '#1A1A1A' : '#D4D4D4'
              }}
            >
              ○
            </Button>
            <Button
              onClick={() => onUpdate({ shape: 'square' })}
              size="sm"
              variant={token.shape === 'square' ? 'primary' : 'outline'}
              style={{
                flex: 1,
                padding: '4px',
                minWidth: '0',
                backgroundColor: token.shape === 'square' ? '#C9AD6A' : 'transparent',
                borderColor: token.shape === 'square' ? '#C9AD6A' : '#525252',
                color: token.shape === 'square' ? '#1A1A1A' : '#D4D4D4'
              }}
            >
              □
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Color */}
      <Box>
        <Box marginBottom={1}>
          <Text size="xs" color="gray400">Color</Text>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <input
            type="color"
            value={token.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              border: '1px solid #525252'
            }}
          />
          <Input
            value={token.color}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate({ color: e.target.value })}
            size="sm"
            fullWidth
            style={{ border: '1px solid #525252' }}
          />
        </Box>
      </Box>
    </Box>
  )
}

export const TokenInfoSection = memo(TokenInfoSectionComponent)
TokenInfoSection.displayName = 'TokenInfoSection'
