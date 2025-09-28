import React, { memo } from 'react'
import { Clock, SkipForward } from 'lucide-react'
import { Text } from '@/components/primitives'
import {
  RoundCounter as RoundCounterContainer,
  NavControls,
  NavButton,
  NextRoundButton
} from './CombatTracker.styled'

type RoundCounterProps = {
  currentRound: number
  onNextRound: () => void
  onPreviousRound: () => void
}

const RoundCounterComponent: React.FC<RoundCounterProps> = ({
  currentRound,
  onNextRound,
  onPreviousRound
}) => {
  return (
    <>
      {/* Round Counter */}
      <RoundCounterContainer>
        <Clock size={16} color="secondary" />
        <Text size="xl" weight="bold" color="textInverse">Round {currentRound}</Text>
      </RoundCounterContainer>

      {/* Navigation Controls */}
      <NavControls>
        <NavButton
          onClick={onPreviousRound}
          disabled={currentRound <= 1}
          title="Previous Round (←)"
        >
          <SkipForward size={16} style={{ transform: 'rotate(180deg)' }} />
        </NavButton>

        <NextRoundButton
          onClick={onNextRound}
          title="Next Round (Space)"
        >
          <SkipForward size={16} />
          Next Round
        </NextRoundButton>
      </NavControls>
    </>
  )
}

export const RoundCounter = memo(RoundCounterComponent)
RoundCounter.displayName = 'RoundCounter'