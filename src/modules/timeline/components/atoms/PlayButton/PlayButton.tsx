/**
 * Play Button Component
 * Play/pause toggle for timeline playback
 */

import React from 'react'
import { Box } from '@/components/primitives'

export type PlayButtonProps = {
  isPlaying: boolean
  isDisabled?: boolean
  onToggle: () => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// Helper functions for styling
const getButtonStyles = (isPlaying = false, isDisabled = false, size: PlayButtonProps['size'] = 'md') => {
  const sizeStyles = {
    sm: { width: '24px', height: '24px' },
    md: { width: '32px', height: '32px' },
    lg: { width: '40px', height: '40px' }
  }

  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '50%',
    background: isPlaying ? 'var(--orange-500)' : 'var(--dnd-red)',
    color: 'white',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative' as const,
    overflow: 'hidden',
    opacity: isDisabled ? 0.5 : 1,
    ...sizeStyles[size]
  }
}

const getPlayIconStyles = (size: PlayButtonProps['size'] = 'md') => {
  const sizeStyles = {
    sm: {
      borderLeft: '6px solid currentColor',
      borderTop: '4px solid transparent',
      borderBottom: '4px solid transparent'
    },
    md: {
      borderLeft: '8px solid currentColor',
      borderTop: '6px solid transparent',
      borderBottom: '6px solid transparent'
    },
    lg: {
      borderLeft: '10px solid currentColor',
      borderTop: '8px solid transparent',
      borderBottom: '8px solid transparent'
    }
  }

  return {
    width: 0,
    height: 0,
    marginLeft: '2px',
    ...sizeStyles[size]
  }
}

const getPauseIconStyles = (size: PlayButtonProps['size'] = 'md') => {
  const sizeStyles = {
    sm: { width: '2px', height: '8px' },
    md: { width: '3px', height: '12px' },
    lg: { width: '4px', height: '16px' }
  }

  return {
    display: 'flex',
    gap: '2px',
    ...sizeStyles[size]
  }
}

const getPauseBarStyles = (size: PlayButtonProps['size'] = 'md') => {
  const sizeStyles = {
    sm: { width: '2px', height: '8px' },
    md: { width: '3px', height: '12px' },
    lg: { width: '4px', height: '16px' }
  }

  return {
    backgroundColor: 'currentColor',
    ...sizeStyles[size]
  }
}

/**
 * Play/pause button with animated icon
 */
export const PlayButton: React.FC<PlayButtonProps> = ({
  isPlaying,
  isDisabled = false,
  onToggle,
  size = 'md',
  className
}) => {
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      e.currentTarget.style.background = isPlaying ? 'var(--orange-600)' : 'var(--dnd-red-dark)'
      e.currentTarget.style.transform = 'scale(1.05)'
    }
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      e.currentTarget.style.background = isPlaying ? 'var(--orange-500)' : 'var(--dnd-red)'
      e.currentTarget.style.transform = 'scale(1)'
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      e.currentTarget.style.transform = 'scale(0.95)'
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      e.currentTarget.style.transform = 'scale(1.05)'
    }
  }

  return (
    <button
      disabled={isDisabled}
      onClick={onToggle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      aria-label={isPlaying ? 'Pause' : 'Play'}
      title={isPlaying ? 'Pause timeline' : 'Play timeline'}
      className={className}
      style={getButtonStyles(isPlaying, isDisabled, size)}
    >
      {isPlaying ? (
        <Box style={getPauseIconStyles(size)}>
          <Box style={getPauseBarStyles(size)} />
          <Box style={getPauseBarStyles(size)} />
        </Box>
      ) : (
        <Box style={getPlayIconStyles(size)} />
      )}
    </button>
  )
}