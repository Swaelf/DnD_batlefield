import React, { memo } from 'react'
import { MousePointer } from '@/utils/optimizedIcons'
import type { Token } from '@/types/token'
import { Box, Button } from '@/components/ui'
import { Label } from '@/components/primitives'
import * as styles from './TokenSelector.css'

type TokenSelectorProps = {
  selectedToken: string
  setSelectedToken: (tokenId: string) => void
  tokens: Token[]
  isPicking: 'token' | 'from' | 'to' | 'targetToken' | null
  onTokenPick: () => void
}

const TokenSelectorComponent: React.FC<TokenSelectorProps> = ({
  selectedToken,
  setSelectedToken,
  tokens,
  isPicking,
  onTokenPick
}) => {
  return (
    <Box
      padding={12}
      backgroundColor="background"
      borderRadius="md"
      borderWidth={1}
      borderStyle="solid"
      borderColor="border"
    >
      <Box marginBottom={8}>
        <Label size="sm" weight="medium" color="gray300">Select Token</Label>
      </Box>
      <Box display="flex" gap={2}>
        <Button
          onClick={onTokenPick}
          size="icon"
          title="Pick from map"
          className={isPicking === 'token' ? styles.pickerButton.picking : styles.pickerButton.normal}
        >
          <MousePointer size={16} />
        </Button>
        <Box flexGrow={1}>
          <select
            value={selectedToken || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedToken(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              backgroundColor: '#1a1a1a',
              color: '#e5e5e5',
              border: '1px solid #3a3a3a',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              outline: 'none',
            }}
            onFocus={(e) => e.target.style.borderColor = '#C9AD6A'}
            onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
          >
            <option value="" style={{ backgroundColor: '#1a1a1a' }}>
              {tokens.length === 0 ? 'No tokens available' : 'Select a token...'}
            </option>
            {tokens.map(token => (
              <option
                key={token.id}
                value={token.id}
                style={{ backgroundColor: '#1a1a1a' }}
              >
                {token.name || `Token ${token.id.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </Box>
      </Box>
    </Box>
  )
}

export const TokenSelector = memo(TokenSelectorComponent)
TokenSelector.displayName = 'TokenSelector'