import { memo, type FC } from 'react'
import { Target, Users } from '@/utils/optimizedIcons'
import { Box, Text, Button } from '@/components/primitives'
import type { Position } from '@/types/map'
import type { Token } from '@/types/token'

type SelectTargetProps = {
  targetPosition: Position
  targetTokenId?: string
  tokens: Token[]
  onPositionPick: () => void
  onTargetTokenPick: () => void
  isPicking: 'token' | 'from' | 'to' | 'targetToken' | null
}

const SelectTargetComponent: FC<SelectTargetProps> = ({
  targetPosition,
  targetTokenId,
  tokens,
  onPositionPick,
  onTargetTokenPick,
  isPicking
}) => {
  const targetToken = targetTokenId ? tokens.find(t => t.id === targetTokenId) : null
  const hasPosition = targetPosition.x !== 0 || targetPosition.y !== 0

  return (
    <Box style={{ display: 'flex', flexDirection: 'column' }}>
      <Text
        variant="body"
        size="md"
        style={{
          fontWeight: '600',
          color: '#FFFFFF',
          marginBottom: '8px'
        }}
      >
        Target
      </Text>

      {/* Target Type Buttons */}
      <Box style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <Button
          onClick={onPositionPick}
          variant="secondary"
          style={{
            padding: '8px 12px',
            backgroundColor: isPicking === 'to' ? '#C9AD6A' : '#374151',
            color: isPicking === 'to' ? '#000000' : '#D1D5DB',
            border: isPicking === 'to' ? '1px solid #C9AD6A' : '1px solid #4B5563',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px'
          }}
          title="Pick position from map"
        >
          <Target size={14} />
          Position
        </Button>

        <Button
          onClick={onTargetTokenPick}
          variant="secondary"
          style={{
            padding: '8px 12px',
            backgroundColor: isPicking === 'targetToken' ? '#C9AD6A' : '#374151',
            color: isPicking === 'targetToken' ? '#000000' : '#D1D5DB',
            border: isPicking === 'targetToken' ? '1px solid #C9AD6A' : '1px solid #4B5563',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px'
          }}
          title="Pick token from map"
        >
          <Users size={14} />
          Token
        </Button>
      </Box>

      {/* Target Display */}
      <Box
        style={{
          padding: '10px 12px',
          backgroundColor: '#374151',
          border: '1px solid #4B5563',
          borderRadius: '6px',
          color: '#FFFFFF',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          minHeight: '38px'
        }}
      >
        {targetToken ? (
          <Box style={{ display: 'flex', flexDirection: 'column' }}>
            <Text variant="body" size="sm" style={{ color: '#C9AD6A', fontWeight: '600' }}>
              🎯 Target Token: {targetToken.name}
            </Text>
            <Text variant="body" size="xs" style={{ color: '#9CA3AF', marginTop: '2px' }}>
              Spells and attacks will track this token's movement
            </Text>
          </Box>
        ) : hasPosition ? (
          <Box style={{ display: 'flex', flexDirection: 'column' }}>
            <Text variant="body" size="sm" style={{ color: '#D1D5DB' }}>
              📍 Fixed Position: X: {Math.round(targetPosition.x)}, Y: {Math.round(targetPosition.y)}
            </Text>
            <Text variant="body" size="xs" style={{ color: '#9CA3AF', marginTop: '2px' }}>
              Spells and attacks will target this exact location
            </Text>
          </Box>
        ) : (
          <Text variant="body" size="sm" style={{ color: '#9CA3AF' }}>
            Select target position or token...
          </Text>
        )}
      </Box>
    </Box>
  )
}

export const SelectTarget = memo(SelectTargetComponent)
SelectTarget.displayName = 'SelectTarget'