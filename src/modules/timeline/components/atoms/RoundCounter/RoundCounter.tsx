/**
 * Round Counter Component
 * Displays current round number with navigation
 */

import React from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'

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
    <Box
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        color: 'var(--colors-gray300)'
      }}
    >
      {/* Status Indicator */}
      <Box
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: isInCombat ? 'var(--colors-dndRed)' : 'var(--colors-gray600)',
          boxShadow: isInCombat ? '0 0 8px var(--colors-dndRed)' : 'none'
        }}
      />

      {/* Previous Button */}
      <Button
        variant="ghost"
        size="sm"
        disabled={!canGoBack}
        onClick={onPrevious}
        aria-label="Previous round"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          border: '1px solid var(--colors-gray600)',
          backgroundColor: 'var(--colors-gray800)',
          color: 'var(--colors-gray300)',
          cursor: canGoBack ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease',
          opacity: canGoBack ? 1 : 0.5,
          padding: 0,
          minWidth: 'auto'
        }}
        onMouseEnter={(e) => {
          if (canGoBack) {
            e.currentTarget.style.backgroundColor = 'var(--colors-gray700)'
            e.currentTarget.style.borderColor = 'var(--colors-gray500)'
            e.currentTarget.style.color = 'var(--colors-gray100)'
          }
        }}
        onMouseLeave={(e) => {
          if (canGoBack) {
            e.currentTarget.style.backgroundColor = 'var(--colors-gray800)'
            e.currentTarget.style.borderColor = 'var(--colors-gray600)'
            e.currentTarget.style.color = 'var(--colors-gray300)'
          }
        }}
      >
        ←
      </Button>

      {/* Round Display */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontWeight: '600',
          color: isInCombat ? 'var(--colors-dndRed)' : 'var(--colors-gray100)'
        }}
      >
        <Text
          variant="body"
          size="sm"
          style={{
            margin: 0,
            color: 'inherit'
          }}
        >
          Round{' '}
        </Text>

        {isEditing && onGoToRound ? (
          <input
            type="number"
            min={1}
            max={totalRounds}
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
            onBlur={handleInputSubmit}
            onKeyDown={handleInputKeyDown}
            autoFocus
            style={{
              width: '40px',
              padding: '2px',
              borderRadius: '4px',
              border: '1px solid var(--colors-gray600)',
              backgroundColor: 'var(--colors-gray800)',
              color: 'var(--colors-gray100)',
              textAlign: 'center',
              fontSize: '12px',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--colors-dndRed)'
              e.target.style.backgroundColor = 'var(--colors-gray700)'
            }}
          />
        ) : (
          <Text
            variant="body"
            size="sm"
            onClick={handleEdit}
            style={{
              margin: 0,
              color: 'inherit',
              cursor: onGoToRound ? 'pointer' : 'default'
            }}
            title={onGoToRound ? 'Click to edit' : undefined}
          >
            {currentRound}
          </Text>
        )}

        {totalRounds > 0 && (
          <Text
            variant="body"
            size="sm"
            style={{
              margin: 0,
              color: 'var(--colors-gray400)'
            }}
          >
            / {totalRounds}
          </Text>
        )}
      </Box>

      {/* Next Button */}
      <Button
        variant="ghost"
        size="sm"
        disabled={!canGoForward}
        onClick={onNext}
        aria-label="Next round"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          border: '1px solid var(--colors-gray600)',
          backgroundColor: 'var(--colors-gray800)',
          color: 'var(--colors-gray300)',
          cursor: canGoForward ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease',
          opacity: canGoForward ? 1 : 0.5,
          padding: 0,
          minWidth: 'auto'
        }}
        onMouseEnter={(e) => {
          if (canGoForward) {
            e.currentTarget.style.backgroundColor = 'var(--colors-gray700)'
            e.currentTarget.style.borderColor = 'var(--colors-gray500)'
            e.currentTarget.style.color = 'var(--colors-gray100)'
          }
        }}
        onMouseLeave={(e) => {
          if (canGoForward) {
            e.currentTarget.style.backgroundColor = 'var(--colors-gray800)'
            e.currentTarget.style.borderColor = 'var(--colors-gray600)'
            e.currentTarget.style.color = 'var(--colors-gray300)'
          }
        }}
      >
        →
      </Button>
    </Box>
  )
}