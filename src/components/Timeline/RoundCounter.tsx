import { memo, type FC } from 'react'
import { SkipForward, Calendar } from '@/utils/optimizedIcons'
import { Text, Box } from '@/components/primitives'
import {
  RoundCounter as RoundCounterContainer,
  NavControls,
  NavButton,
  NextRoundButton
} from './CombatTracker.styled.tsx'

type RoundCounterProps = {
  currentRound: number
  currentGroup: number
  onNextGroup: () => void
  onPreviousGroup: () => void
  onStartNewRound?: () => void
}

const RoundCounterComponent: FC<RoundCounterProps> = ({
  currentRound,
  currentGroup,
  onNextGroup,
  onPreviousGroup,
  onStartNewRound
}) => {
  return (
    <>
      {/* Round and Event Counter */}
      <RoundCounterContainer>
        <Box display="flex" alignItems="center" gap={2}>
          <Text size="md" weight="bold" color="primary">Round {currentRound}</Text>
          <Text size="md" color="textMuted">•</Text>
          <Text size="md" weight="bold" color="text">Event {currentGroup}</Text>
        </Box>
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

        {onStartNewRound && (
          <NavButton
            onClick={onStartNewRound}
            title="Start New Round"
            style={{ marginLeft: '8px', backgroundColor: 'var(--color-primary)' }}
          >
            <Calendar size={18} />
          </NavButton>
        )}
      </NavControls>
    </>
  )
}

export const EventGroupCounter = memo(RoundCounterComponent)
EventGroupCounter.displayName = 'EventGroupCounter'