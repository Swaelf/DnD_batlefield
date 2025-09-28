/**
 * TimelineHeader Molecule Component
 * Header with controls and round information
 */

import React from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
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
  const canGoBack = timeline ? timeline.currentRound > 1 : false
  const canGoForward = timeline ? timeline.currentRound < timeline.rounds.length : false
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
    <Box
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px',
        borderBottom: '1px solid var(--colors-gray600)',
        backgroundColor: 'var(--colors-gray900)'
      }}
    >
      {/* Left Section */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        {timeline && (
          <Text
            variant="heading"
            size="lg"
            style={{
              margin: 0,
              fontWeight: '600',
              color: 'var(--colors-gray100)'
            }}
          >
            {timeline.name}
          </Text>
        )}
        <Box
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: getStatus() === 'playing' ? 'var(--colors-orange500)' :
                           getStatus() === 'active' ? 'var(--colors-dndRed)' : 'var(--colors-gray700)',
            color: getStatus() === 'inactive' ? 'var(--colors-gray300)' : 'white'
          }}
        >
          {getStatus() === 'playing' ? 'Playing' :
           getStatus() === 'active' ? 'Combat Active' : 'Inactive'}
        </Box>
      </Box>

      {/* Center Section */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
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
      </Box>

      {/* Right Section */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        {/* Playback Controls */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <PlayButton
            isPlaying={playback.isPlaying}
            isDisabled={!timeline?.isActive}
            onToggle={onTogglePlayback || (() => {})}
            size="md"
          />

          {/* Speed Control */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Text
              variant="body"
              size="xs"
              style={{
                color: 'var(--colors-gray400)',
                minWidth: '30px',
                textAlign: 'center'
              }}
            >
              {playback.playbackSpeed}x
            </Text>
            {SPEED_OPTIONS.map(speed => (
              <Button
                key={speed}
                variant={playback.playbackSpeed === speed ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleSpeedChange(speed)}
                title={`Set speed to ${speed}x`}
                style={{
                  fontSize: '12px',
                  backgroundColor: playback.playbackSpeed === speed ? 'var(--colors-dndRed)' : 'var(--colors-gray800)',
                  borderColor: playback.playbackSpeed === speed ? 'var(--colors-dndRed)' : 'var(--colors-gray600)',
                  color: playback.playbackSpeed === speed ? 'white' : 'var(--colors-gray300)'
                }}
              >
                {speed}x
              </Button>
            ))}
          </Box>
        </Box>

        {/* Combat Controls */}
        {canStartCombat && (
          <Button
            variant="outline"
            size="md"
            onClick={onStartCombat}
            style={{
              borderColor: 'var(--colors-green600)',
              color: 'var(--colors-green400)',
              backgroundColor: 'transparent'
            }}
          >
            Start Combat
          </Button>
        )}

        {canEndCombat && (
          <Button
            variant="outline"
            size="md"
            onClick={onEndCombat}
            style={{
              borderColor: 'var(--colors-red600)',
              color: 'var(--colors-red400)',
              backgroundColor: 'transparent'
            }}
          >
            End Combat
          </Button>
        )}
      </Box>
    </Box>
  )
}