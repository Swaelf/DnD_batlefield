import React, { memo } from 'react'
import { SkipForward } from '@/utils/optimizedIcons'
import { Text } from '@/components/primitives'
import {
  RoundCounter as RoundCounterContainer,
  NavControls,
  NavButton,
  NextRoundButton
} from './CombatTracker.styled.tsx'

type RoundCounterProps = {
  currentGroup: number
  onNextGroup: () => void
  onPreviousGroup: () => void
}

const RoundCounterComponent: React.FC<RoundCounterProps> = ({
  currentGroup,
  onNextGroup,
  onPreviousGroup
}) => {
  return (
    <>
      {/* Event Counter */}
      <RoundCounterContainer>
        <Text size="md" weight="bold" color="text">Event {currentGroup}</Text>
      </RoundCounterContainer>

      {/* Navigation Controls */}
      <NavControls>
        <NavButton
          onClick={onPreviousGroup}
          disabled={currentGroup <= 1}
          title="Previous Event (←)"
        >
          <SkipForward size={20} style={{ transform: 'rotate(180deg)' }} />
        </NavButton>

        <NextRoundButton
          onClick={onNextGroup}
          title="Next Event (Space)"
        >
          <SkipForward size={20} />
        </NextRoundButton>
      </NavControls>
    </>
  )
}

export const EventGroupCounter = memo(RoundCounterComponent)
EventGroupCounter.displayName = 'EventGroupCounter'