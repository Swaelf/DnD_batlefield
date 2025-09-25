/**
 * Play Button Component
 * Play/pause toggle for timeline playback
 */

import React from 'react'
import { styled } from '@/foundation/theme'

export type PlayButtonProps = {
  isPlaying: boolean
  isDisabled?: boolean
  onToggle: () => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const Button = styled('button', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  borderRadius: '$round',
  background: '$dndRed',
  color: 'white',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  position: 'relative',
  overflow: 'hidden',

  '&:hover:not(:disabled)': {
    background: '$dndRedDark',
    transform: 'scale(1.05)'
  },

  '&:active:not(:disabled)': {
    transform: 'scale(0.95)'
  },

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none'
  },

  '&:focus-visible': {
    outline: '2px solid $dndRed',
    outlineOffset: 2
  },

  variants: {
    size: {
      sm: {
        width: 24,
        height: 24,
        fontSize: '$1'
      },
      md: {
        width: 32,
        height: 32,
        fontSize: '$2'
      },
      lg: {
        width: 40,
        height: 40,
        fontSize: '$3'
      }
    },

    playing: {
      true: {
        background: '$orange500'
      }
    }
  }
})

const PlayIcon = styled('div', {
  width: 0,
  height: 0,
  marginLeft: 2,

  variants: {
    size: {
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
  }
})

const PauseIcon = styled('div', {
  display: 'flex',
  gap: 2,

  '&::before, &::after': {
    content: '""',
    backgroundColor: 'currentColor'
  },

  variants: {
    size: {
      sm: {
        '&::before, &::after': {
          width: 2,
          height: 8
        }
      },
      md: {
        '&::before, &::after': {
          width: 3,
          height: 12
        }
      },
      lg: {
        '&::before, &::after': {
          width: 4,
          height: 16
        }
      }
    }
  }
})

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
  return (
    <Button
      playing={isPlaying}
      size={size}
      disabled={isDisabled}
      onClick={onToggle}
      aria-label={isPlaying ? 'Pause' : 'Play'}
      title={isPlaying ? 'Pause timeline' : 'Play timeline'}
      className={className}
    >
      {isPlaying ? (
        <PauseIcon size={size} />
      ) : (
        <PlayIcon size={size} />
      )}
    </Button>
  )
}