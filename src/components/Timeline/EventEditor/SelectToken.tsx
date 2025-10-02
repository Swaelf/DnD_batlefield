import { memo, type FC, type ChangeEvent } from 'react'
import { MousePointer, Cloud } from '@/utils/optimizedIcons'
import { Box, Text, Button } from '@/components/primitives'
import type { Token } from '@/types/token'

type SelectTokenProps = {
  selectedToken: string
  setSelectedToken: (tokenId: string) => void
  tokens: Token[]
  isPicking: 'token' | 'from' | 'to' | 'targetToken' | null
  onTokenPick: () => void
  useEnvironmentToken?: boolean
  onUseEnvironmentTokenChange?: (use: boolean) => void
}

const SelectTokenComponent: FC<SelectTokenProps> = ({
  selectedToken,
  setSelectedToken,
  tokens,
  isPicking,
  onTokenPick,
  useEnvironmentToken = false,
  onUseEnvironmentTokenChange
}) => {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Text
        variant="body"
        size="md"
        style={{
          fontWeight: '600',
          color: '#FFFFFF',
          marginBottom: '0'
        }}
      >
        Token
      </Text>

      {/* Environment Token Button */}
      <Button
        onClick={() => {
          const newValue = !useEnvironmentToken
          onUseEnvironmentTokenChange?.(newValue)
          if (newValue) {
            setSelectedToken('void-token')
          } else {
            setSelectedToken('')
          }
        }}
        variant="secondary"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          width: '100%',
          backgroundColor: useEnvironmentToken ? '#1E3A5F' : '#2A2A2A',
          border: useEnvironmentToken ? '2px solid #3B82F6' : '2px solid #4B5563',
          borderRadius: '6px',
          color: useEnvironmentToken ? '#60A5FA' : '#9CA3AF',
          fontWeight: useEnvironmentToken ? '600' : '500',
          transition: 'all 0.2s ease',
          cursor: 'pointer'
        }}
        title={useEnvironmentToken ? 'Using environment token as source' : 'Click to use environment token'}
      >
        <Cloud size={20} color={useEnvironmentToken ? '#60A5FA' : '#6B7280'} strokeWidth={useEnvironmentToken ? 2.5 : 2} />
        <Text
          variant="body"
          size="md"
          style={{
            color: 'inherit',
            flex: 1,
            textAlign: 'left'
          }}
        >
          Environment Token
        </Text>
        {useEnvironmentToken && (
          <Box
            style={{
              padding: '4px 10px',
              backgroundColor: '#3B82F6',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '700',
              color: '#FFFFFF',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            ACTIVE
          </Box>
        )}
      </Button>

      {/* Regular Token Selection - Disabled when using environment token */}
      <Box style={{ display: 'flex', gap: '8px', opacity: useEnvironmentToken ? 0.5 : 1, pointerEvents: useEnvironmentToken ? 'none' : 'auto' }}>
        <Button
          onClick={onTokenPick}
          variant="secondary"
          disabled={useEnvironmentToken}
          style={{
            padding: '10px',
            backgroundColor: isPicking === 'token' ? '#C9AD6A' : '#374151',
            color: isPicking === 'token' ? '#000000' : '#D1D5DB',
            border: isPicking === 'token' ? '1px solid #C9AD6A' : '1px solid #4B5563',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Pick token from map"
        >
          <MousePointer size={16} />
        </Button>
        <Box style={{ flex: 1 }}>
          <select
            value={selectedToken || ''}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedToken(e.target.value)}
            disabled={useEnvironmentToken}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: '#374151',
              border: '1px solid #4B5563',
              borderRadius: '6px',
              color: '#FFFFFF',
              fontSize: '14px',
              cursor: useEnvironmentToken ? 'not-allowed' : 'pointer'
            }}
          >
            <option value="">Select a token...</option>
            {tokens.map((token) => (
              <option key={token.id} value={token.id}>
                {token.name}
              </option>
            ))}
          </select>
        </Box>
      </Box>
    </Box>
  )
}

export const SelectToken = memo(SelectTokenComponent)
SelectToken.displayName = 'SelectToken'