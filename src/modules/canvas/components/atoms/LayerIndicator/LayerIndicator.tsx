/**
 * LayerIndicator Atom - Layer visibility and lock status indicator
 *
 * Displays visual indicators for layer state including visibility,
 * lock status, and active state with D&D theming.
 */

import React from 'react'
import { Eye, EyeOff, Lock, Unlock } from 'lucide-react'
import { Box } from '@/components/ui'
import { styled } from '@/styles/theme.config'

export interface LayerIndicatorProps {
  readonly isVisible: boolean
  readonly isLocked: boolean
  readonly isActive: boolean
  readonly onToggleVisible?: () => void
  readonly onToggleLock?: () => void
}

const IndicatorContainer = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$1',
  padding: '$1',
  borderRadius: '$sm',

  variants: {
    active: {
      true: {
        backgroundColor: '$dndRed/10',
        borderLeft: '2px solid $dndRed'
      }
    }
  }
})

const IconButton = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '$4',
  height: '$4',
  borderRadius: '$xs',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '$gray700'
  },

  variants: {
    state: {
      visible: { color: '$success' },
      hidden: { color: '$gray500' },
      locked: { color: '$warning' },
      unlocked: { color: '$gray400' }
    }
  }
})

export const LayerIndicator: React.FC<LayerIndicatorProps> = React.memo(({
  isVisible,
  isLocked,
  isActive,
  onToggleVisible,
  onToggleLock
}) => {
  return (
    <IndicatorContainer active={isActive}>
      <IconButton
        state={isVisible ? 'visible' : 'hidden'}
        onClick={onToggleVisible}
        title={isVisible ? 'Hide layer' : 'Show layer'}
      >
        {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
      </IconButton>

      <IconButton
        state={isLocked ? 'locked' : 'unlocked'}
        onClick={onToggleLock}
        title={isLocked ? 'Unlock layer' : 'Lock layer'}
      >
        {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
      </IconButton>
    </IndicatorContainer>
  )
})

LayerIndicator.displayName = 'LayerIndicator'