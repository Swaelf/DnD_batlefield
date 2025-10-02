import { memo, type FC, type ChangeEvent } from 'react'
import type { Token } from '@/types'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'

type TokenLabelSettingsProps = {
  token: Token
  onUpdate: (updates: Partial<Token>) => void
}

const TokenLabelSettingsComponent: FC<TokenLabelSettingsProps> = ({
  token,
  onUpdate
}) => {
  return (
    <>
      {/* Show Label Checkbox */}
      <Box display="flex" alignItems="center" gap={2}>
        <input
          type="checkbox"
          id="showLabel"
          checked={token.showLabel || false}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate({ showLabel: e.target.checked })}
          style={{
            width: '14px',
            height: '14px',
            cursor: 'pointer'
          }}
        />
        <label
          htmlFor="showLabel"
          style={{
            cursor: 'pointer',
            fontSize: '12px',
            color: '#D4D4D4'
          }}
        >
          Show Label
        </label>
      </Box>

      {/* Label Position - only show if showLabel is true */}
      {token.showLabel && (
        <Box>
          <Box marginBottom={1}>
            <Text size="xs" color="gray400">Label Position</Text>
          </Box>
          <select
            value={token.labelPosition || 'bottom'}
            onChange={(e) => onUpdate({ labelPosition: e.target.value as Token['labelPosition'] })}
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
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
          </select>
        </Box>
      )}
    </>
  )
}

export const TokenLabelSettings = memo(TokenLabelSettingsComponent)
TokenLabelSettings.displayName = 'TokenLabelSettings'
