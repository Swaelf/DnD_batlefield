import { forwardRef, type CSSProperties } from 'react'
import { Text } from '@/components/primitives/TextVE'
import { Box } from '@/components/primitives/BoxVE'
import { TokenIcon } from './TokenIcon'
import { SIZE_LABELS, type TokenTemplate } from './types'

export type TokenItemProps = {
  token: TokenTemplate
  onClick: (token: TokenTemplate) => void
  className?: string
  style?: CSSProperties
}

export const TokenItem = forwardRef<HTMLButtonElement, TokenItemProps>(
  ({ token, onClick, className, style }, ref) => {
    const itemStyles: CSSProperties = {
      height: 'auto',
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: 'var(--gray800)',
      border: '1px solid var(--gray700)',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ...style,
    }

    return (
      <button
        ref={ref}
        onClick={() => onClick(token)}
        style={itemStyles}
        className={className}
        title={`${token.name} (${SIZE_LABELS[token.size]})`}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--gray700)'
          e.currentTarget.style.borderColor = 'var(--secondary)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--gray800)'
          e.currentTarget.style.borderColor = 'var(--gray700)'
        }}
      >
        <TokenIcon shape={token.shape} color={token.color} />
        <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <Text
            style={{
              fontSize: '12px',
              color: 'var(--gray300)',
              textAlign: 'center',
              fontWeight: '500'
            }}
          >
            {token.name}
          </Text>
          <Text
            style={{
              fontSize: '10px',
              color: 'var(--gray500)',
              textTransform: 'capitalize'
            }}
          >
            {token.size}
          </Text>
        </Box>
      </button>
    )
  }
)

TokenItem.displayName = 'TokenItem'
