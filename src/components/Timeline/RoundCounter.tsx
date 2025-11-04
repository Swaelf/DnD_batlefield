import { memo, type FC } from 'react'
import { SkipForward, Clock } from '@/utils/optimizedIcons'
import { Text, Box } from '@/components/primitives'
import {
  RoundCounter as RoundCounterContainer,
  NavControls,
  NavButton,
  NextRoundButton
} from './styled'

type RoundCounterProps = {
  currentRound: number
  currentGroup: number
  onNextGroup: () => void
  onPreviousGroup: () => void
  onStartNewRound?: () => void
  canStartNewRound?: boolean
}

const RoundCounterComponent: FC<RoundCounterProps> = ({
  currentRound,
  currentGroup,
  onNextGroup,
  onPreviousGroup,
  onStartNewRound,
  canStartNewRound = true
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

      {/* Event Navigation Controls */}
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
            disabled={!canStartNewRound}
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