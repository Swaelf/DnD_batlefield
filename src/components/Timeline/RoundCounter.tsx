import { memo, type FC } from 'react'
import { SkipForward, Clock } from '@/utils/optimizedIcons'
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
  onStartNewRound
}) => {
  return (
    <>
      {/* Round and Event Counter - Display in column */}
      <RoundCounterContainer>
        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          <Text size="sm" weight="bold" color="primary" style={{ whiteSpace: 'nowrap' }}>
            Round {currentRound}
          </Text>
          <Text size="sm" weight="bold" color="text" style={{ whiteSpace: 'nowrap' }}>
            Event {currentGroup}
          </Text>
        </Box>
      </RoundCounterContainer>

      {/* Navigation Controls - Center */}
      <NavControls>
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
            <Clock size={18} />
          </NavButton>
        )}
      </NavControls>
    </>
  )
}

export const EventGroupCounter = memo(RoundCounterComponent)
EventGroupCounter.displayName = 'EventGroupCounter'