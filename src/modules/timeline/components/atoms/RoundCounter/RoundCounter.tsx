/**
 * Round Counter Component
 * Displays current round number with navigation
 */

import React from 'react'
import { styled } from '@/foundation/theme'

export type RoundCounterProps = {
  currentRound: number
  totalRounds: number
  canGoBack: boolean
  canGoForward: boolean
  onPrevious?: () => void
  onNext?: () => void
  onGoToRound?: (round: number) => void
  isInCombat?: boolean
  className?: string
}

const Container = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  fontSize: '$2',
  color: '$gray300'
})

const RoundDisplay = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$1',
  fontWeight: 600,
  color: '$gray100',

  variants: {
    combat: {
      true: {
        color: '$dndRed'
      }
    }
  }
})

const NavigationButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  borderRadius: '$round',
  border: '1px solid $gray600',
  background: '$gray800',
  color: '$gray300',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover:not(:disabled)': {
    background: '$gray700',
    borderColor: '$gray500',
    color: '$gray100'
  },

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed'
  },

  variants: {
    direction: {
      left: {},
      right: {}
    }
  }
})

const RoundInput = styled('input', {
  width: 40,
  padding: '$1',
  borderRadius: '$sm',
  border: '1px solid $gray600',
  background: '$gray800',
  color: '$gray100',
  textAlign: 'center',
  fontSize: '$1',

  '&:focus': {
    outline: 'none',
    borderColor: '$dndRed',
    background: '$gray700'
  }
})

const StatusIndicator = styled('div', {
  width: 8,
  height: 8,
  borderRadius: '$round',
  background: '$gray600',

  variants: {
    status: {
      inactive: {
        background: '$gray600'
      },
      combat: {
        background: '$dndRed',
        boxShadow: '0 0 8px $dndRed'
      }
    }
  }
})

/**
 * Round counter with navigation controls
 */
export const RoundCounter: React.FC<RoundCounterProps> = ({
  currentRound,
  totalRounds,
  canGoBack,
  canGoForward,
  onPrevious,
  onNext,
  onGoToRound,
  isInCombat = false,
  className
}) => {
  const [isEditing, setIsEditing] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(currentRound.toString())

  // Update input value when currentRound changes
  React.useEffect(() => {
    setInputValue(currentRound.toString())
  }, [currentRound])

  const handleEdit = () => {
    if (onGoToRound) {
      setIsEditing(true)
    }
  }

  const handleInputSubmit = () => {
    const newRound = parseInt(inputValue, 10)
    if (!isNaN(newRound) && newRound >= 1 && newRound <= totalRounds && onGoToRound) {
      onGoToRound(newRound)
    } else {
      setInputValue(currentRound.toString())
    }
    setIsEditing(false)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputSubmit()
    } else if (e.key === 'Escape') {
      setInputValue(currentRound.toString())
      setIsEditing(false)
    }
  }

  return (
    <Container className={className}>
      <StatusIndicator status={isInCombat ? 'combat' : 'inactive'} />

      <NavigationButton
        direction="left"
        disabled={!canGoBack}
        onClick={onPrevious}
        aria-label="Previous round"
      >
        ←
      </NavigationButton>

      <RoundDisplay combat={isInCombat}>
        Round{' '}
        {isEditing && onGoToRound ? (
          <RoundInput
            type="number"
            min={1}
            max={totalRounds}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleInputSubmit}
            onKeyDown={handleInputKeyDown}
            autoFocus
          />
        ) : (
          <span
            onClick={handleEdit}
            style={{ cursor: onGoToRound ? 'pointer' : 'default' }}
            title={onGoToRound ? 'Click to edit' : undefined}
          >
            {currentRound}
          </span>
        )}
        {totalRounds > 0 && (
          <span style={{ color: '$gray400' }}>/ {totalRounds}</span>
        )}
      </RoundDisplay>

      <NavigationButton
        direction="right"
        disabled={!canGoForward}
        onClick={onNext}
        aria-label="Next round"
      >
        →
      </NavigationButton>
    </Container>
  )
}