import { memo, type FC } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'

type TokenHPIndicatorProps = {
  currentHP: number
  maxHP: number
  tempHP?: number
}

const TokenHPIndicatorComponent: FC<TokenHPIndicatorProps> = ({
  currentHP,
  maxHP,
  tempHP
}) => {
  // Don't render if maxHP is not set
  if (!maxHP || maxHP <= 0) {
    return null
  }

  // Calculate HP percentage
  const hpPercentage = Math.min(100, Math.max(0, (currentHP / maxHP) * 100))

  // Determine color based on HP level
  const getHPColor = () => {
    if (!currentHP || currentHP <= 0) {
      return '#737373' // gray - dead
    }
    if (currentHP <= maxHP / 4) {
      return '#EF4444' // red - critical
    }
    if (currentHP <= maxHP / 2) {
      return '#F59E0B' // orange - wounded
    }
    return '#10B981' // green - healthy
  }

  const hpColor = getHPColor()

  return (
    <Box display="flex" flexDirection="column" gap={1} data-testid="hp-indicator">
      {/* Linear Progress Bar */}
      <Box
        style={{
          height: '8px',
          backgroundColor: '#404040',
          borderRadius: '4px',
          overflow: 'hidden',
          border: '1px solid #525252'
        }}
      >
        <Box
          style={{
            height: '100%',
            width: `${hpPercentage}%`,
            backgroundColor: hpColor,
            transition: 'width 0.3s ease'
          }}
        />
      </Box>

      {/* HP Count Text */}
      <Text
        size="xs"
        weight="semibold"
        style={{ color: hpColor }}
      >
        {currentHP} / {maxHP}{tempHP ? ` (+${tempHP})` : ''}
      </Text>
    </Box>
  )
}

export const TokenHPIndicator = memo(TokenHPIndicatorComponent)
TokenHPIndicator.displayName = 'TokenHPIndicator'
