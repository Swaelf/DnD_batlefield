/**
 * LayerIndicator Atom - Layer visibility and lock status indicator
 *
 * Displays visual indicators for layer state including visibility,
 * lock status, and active state with D&D theming.
 */

import React from 'react'
import { Eye, EyeOff, Lock, Unlock } from 'lucide-react'
import { Box } from '@/components/primitives'

export interface LayerIndicatorProps {
  readonly isVisible: boolean
  readonly isLocked: boolean
  readonly isActive: boolean
  readonly onToggleVisible?: () => void
  readonly onToggleLock?: () => void
}

// Helper functions for styling
const getIndicatorContainerStyles = (isActive = false): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px',
  borderRadius: '4px',
  backgroundColor: isActive ? 'rgba(146, 38, 16, 0.1)' : 'transparent',
  borderLeft: isActive ? '2px solid var(--dnd-red)' : 'none'
})

const getIconButtonStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '16px',
  height: '16px',
  borderRadius: '2px',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
})

const getIconButtonColor = (state: 'visible' | 'hidden' | 'locked' | 'unlocked') => {
  const colors = {
    visible: 'var(--success)',
    hidden: 'var(--gray-500)',
    locked: 'var(--warning)',
    unlocked: 'var(--gray-400)'
  }
  return colors[state]
}

export const LayerIndicator: React.FC<LayerIndicatorProps> = React.memo(({
  isVisible,
  isLocked,
  isActive,
  onToggleVisible,
  onToggleLock
}) => {
  const visibilityState = isVisible ? 'visible' : 'hidden'
  const lockState = isLocked ? 'locked' : 'unlocked'

  return (
    <Box style={getIndicatorContainerStyles(isActive)}>
      <Box
        onClick={onToggleVisible}
        title={isVisible ? 'Hide layer' : 'Show layer'}
        style={{
          ...getIconButtonStyles(),
          color: getIconButtonColor(visibilityState)
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
          e.currentTarget.style.backgroundColor = 'var(--gray-700)'
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
      </Box>

      <Box
        onClick={onToggleLock}
        title={isLocked ? 'Unlock layer' : 'Lock layer'}
        style={{
          ...getIconButtonStyles(),
          color: getIconButtonColor(lockState)
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
          e.currentTarget.style.backgroundColor = 'var(--gray-700)'
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
      </Box>
    </Box>
  )
})

LayerIndicator.displayName = 'LayerIndicator'