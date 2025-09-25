/**
 * Timeline Header Component
 * Header with controls and round information
 */

import React from 'react'
import { styled } from '@/foundation/theme'
import { RoundCounter, PlayButton } from '../../atoms'
import type { Timeline, TimelinePlaybackState } from '../../../types'

export type TimelineHeaderProps = {
  timeline: Timeline | null
  playback: TimelinePlaybackState
  onStartCombat?: () => void
  onEndCombat?: () => void
  onTogglePlayback?: () => void
  onPreviousRound?: () => void
  onNextRound?: () => void
  onGoToRound?: (round: number) => void
  onSetPlaybackSpeed?: (speed: number) => void
  className?: string
}

const Header = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$3',
  borderBottom: '1px solid $gray600',
  background: '$gray900'
})

const LeftSection = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$4'
})

const CenterSection = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3'
})

const RightSection = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3'
})

const TimelineName = styled('h2', {
  margin: 0,
  fontSize: '$3',
  fontWeight: 600,
  color: '$gray100'
})

const CombatButton = styled('button', {
  padding: '$2 $3',
  borderRadius: '$md',
  border: '1px solid',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '$2',
  fontWeight: 500,
  transition: 'all 0.2s ease',

  variants: {
    variant: {
      start: {
        borderColor: '$green600',
        color: '$green400',

        '&:hover': {
          background: '$green900',
          borderColor: '$green500'
        }
      },
      end: {
        borderColor: '$red600',
        color: '$red400',

        '&:hover': {
          background: '$red900',
          borderColor: '$red500'
        }
      }
    },

    disabled: {
      true: {
        opacity: 0.5,
        cursor: 'not-allowed'
      }
    }
  }
})

const PlaybackControls = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2'
})

const SpeedControl = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2'
})

const SpeedButton = styled('button', {
  padding: '$1 $2',
  borderRadius: '$sm',
  border: '1px solid $gray600',
  background: '$gray800',
  color: '$gray300',
  fontSize: '$1',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    background: '$gray700',
    borderColor: '$gray500'
  },

  variants: {
    active: {
      true: {
        background: '$dndRed',
        borderColor: '$dndRed',
        color: 'white'
      }
    }
  }
})

const SpeedLabel = styled('span', {
  fontSize: '$1',
  color: '$gray400',
  minWidth: 30,
  textAlign: 'center'
})

const StatusBadge = styled('div', {
  padding: '$1 $2',
  borderRadius: '$sm',
  fontSize: '$1',
  fontWeight: 500,

  variants: {
    status: {
      inactive: {
        background: '$gray700',
        color: '$gray300'
      },
      active: {
        background: '$dndRed',
        color: 'white'
      },
      playing: {
        background: '$orange500',
        color: 'white'
      }
    }
  }
})

const SPEED_OPTIONS = [0.25, 0.5, 1, 2, 4]

/**
 * Timeline header with controls and round information
 */
export const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  timeline,
  playback,
  onStartCombat,
  onEndCombat,
  onTogglePlayback,
  onPreviousRound,
  onNextRound,
  onGoToRound,
  onSetPlaybackSpeed,
  className
}) => {
  const canStartCombat = timeline && !timeline.isActive && timeline.rounds.length > 0
  const canEndCombat = timeline?.isActive
  const canGoBack = timeline && timeline.currentRound > 1
  const canGoForward = timeline && timeline.currentRound < timeline.rounds.length
  const totalRounds = timeline?.rounds.length || 0

  const getStatus = () => {
    if (!timeline) return 'inactive'
    if (playback.isPlaying) return 'playing'
    if (timeline.isActive) return 'active'
    return 'inactive'
  }

  const handleSpeedChange = (speed: number) => {
    if (onSetPlaybackSpeed) {
      onSetPlaybackSpeed(speed)
    }
  }

  return (
    <Header className={className}>
      <LeftSection>
        {timeline && (
          <TimelineName>
            {timeline.name}
          </TimelineName>
        )}
        <StatusBadge status={getStatus()}>
          {getStatus() === 'playing' ? 'Playing' :
           getStatus() === 'active' ? 'Combat Active' : 'Inactive'}
        </StatusBadge>
      </LeftSection>

      <CenterSection>
        {timeline && (
          <RoundCounter
            currentRound={timeline.currentRound}
            totalRounds={totalRounds}
            canGoBack={canGoBack}
            canGoForward={canGoForward}
            onPrevious={onPreviousRound}
            onNext={onNextRound}
            onGoToRound={onGoToRound}
            isInCombat={timeline.isActive}
          />
        )}
      </CenterSection>

      <RightSection>
        <PlaybackControls>
          <PlayButton
            isPlaying={playback.isPlaying}
            isDisabled={!timeline?.isActive}
            onToggle={onTogglePlayback || (() => {})}
            size="md"
          />

          <SpeedControl>
            <SpeedLabel>{playback.playbackSpeed}x</SpeedLabel>
            {SPEED_OPTIONS.map(speed => (
              <SpeedButton
                key={speed}
                active={playback.playbackSpeed === speed}
                onClick={() => handleSpeedChange(speed)}
                title={`Set speed to ${speed}x`}
              >
                {speed}x
              </SpeedButton>
            ))}
          </SpeedControl>
        </PlaybackControls>

        {canStartCombat && (
          <CombatButton
            variant="start"
            onClick={onStartCombat}
          >
            Start Combat
          </CombatButton>
        )}

        {canEndCombat && (
          <CombatButton
            variant="end"
            onClick={onEndCombat}
          >
            End Combat
          </CombatButton>
        )}
      </RightSection>
    </Header>
  )
}