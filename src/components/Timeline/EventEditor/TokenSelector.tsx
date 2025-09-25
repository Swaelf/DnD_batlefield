import React, { memo } from 'react'
import { MousePointer } from 'lucide-react'
import { Token } from '@/types/token'
import { Box, Button, FieldLabel } from '@/components/ui'

type TokenSelectorProps = {
  selectedToken: string
  setSelectedToken: (tokenId: string) => void
  tokens: Token[]
  isPicking: 'token' | 'from' | 'to' | null
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
    <Box css={{
      padding: '12px',
      backgroundColor: '#171717',
      borderRadius: '8px',
      border: '1px solid #3a3a3a'
    }}>
      <FieldLabel css={{ marginBottom: '8px' }}>Select Token</FieldLabel>
      <Box display="flex" gap="2">
        <Button
          onClick={onTokenPick}
          variant={isPicking === 'token' ? 'primary' : 'secondary'}
          size="icon"
          title="Pick from map"
          css={{
            backgroundColor: isPicking === 'token' ? '#2563eb' : '#3a3a3a',
            color: isPicking === 'token' ? '#ffffff' : '#d1d5db',
            animation: isPicking === 'token' ? 'pulse 2s infinite' : 'none',
            border: '1px solid #4b5563',
            '&:hover': {
              backgroundColor: isPicking === 'token' ? '#1d4ed8' : '#4b5563',
              borderColor: '#C9AD6A'
            }
          }}
        >
          <MousePointer size={16} />
        </Button>
        <Box css={{ flex: 1 }}>
          <select
            value={selectedToken || ''}
            onChange={(e) => setSelectedToken(e.target.value)}
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