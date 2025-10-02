import { memo, type FC } from 'react'
import type { Token } from '@/types'
import { Heart } from '@/utils/optimizedIcons'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { TokenInfoSection } from './TokenInfoSection'
import { TokenLabelSettings } from './TokenLabelSettings'
import { TokenHPIndicator } from './TokenHPIndicator'
import { TokenHPControls } from './TokenHPControls'
import { TokenQuickActions } from './TokenQuickActions'

type TokenPropertiesProps = {
  token: Token
  onUpdate: (updates: Partial<Token>) => void
}

const TokenPropertiesComponent: FC<TokenPropertiesProps> = ({
  token,
  onUpdate
}) => {
  return (
    <Box display="flex" flexDirection="column" gap={3} padding={3} data-testid="token-properties">
      {/* Token Information */}
      <Box display="flex" flexDirection="column" gap={2}>
        <Text size="xs" weight="semibold" color="gray300">Token Information</Text>

        <TokenInfoSection token={token} onUpdate={onUpdate} />
        <TokenLabelSettings token={token} onUpdate={onUpdate} />
      </Box>

      {/* Divider */}
      <Box style={{
        height: '1px',
        backgroundColor: '#404040',
        margin: '8px 0'
      }} />

      {/* HP Management */}
      <Box display="flex" flexDirection="column" gap={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Heart size={14} color="#EF4444" />
          <Text size="xs" weight="semibold" color="gray300">Hit Points</Text>
        </Box>

        <TokenHPIndicator
          currentHP={token.currentHP || 0}
          maxHP={token.maxHP || 0}
          tempHP={token.tempHP}
        />

        <TokenHPControls token={token} onUpdate={onUpdate} />

        <TokenQuickActions
          currentHP={token.currentHP || 0}
          maxHP={token.maxHP || 0}
          onUpdate={(updates) => onUpdate(updates)}
        />
      </Box>
    </Box>
  )
}

export const TokenProperties = memo(TokenPropertiesComponent)
TokenProperties.displayName = 'TokenProperties'
