import { memo, type FC } from 'react'
import type { Timeline } from '@/types'
import { Box } from '@/components/primitives'
import {
  TimelineContainer,
  RoundButton,
  EventIndicator,
  StatsGrid,
  StatCard,
  StatLabel,
  StatValue
} from './CombatTracker.styled.tsx'

type RoundTimelineProps = {
  timeline: Timeline | null
  currentGroup: number
  activeSpells: number
}

const RoundTimelineComponent: FC<RoundTimelineProps> = ({
  timeline,
  currentGroup,
  activeSpells
}) => {
  const currentRoundData = timeline?.rounds.find(r => r.number === 1) // Round 1 for now
  const totalActions = currentRoundData?.events.reduce((sum, e) => sum + e.actions.length, 0) || 0

  return (
    <>
      {/* Event Timeline */}
      <TimelineContainer>
        {Array.from({ length: Math.max(10, currentGroup + 2) }, (_, i) => i + 1).map((eventNum) => {
          const event = currentRoundData?.events.find(e => e.number === eventNum)
          const hasActions = event && event.actions.length > 0
          const isExecuted = event?.executed

          const getState = () => {
            if (eventNum === currentGroup) return 'current'
            if (isExecuted) return 'executed'
            return 'pending'
          }

          return (
            <Box key={eventNum} display="flex" flexDirection="column">
              <RoundButton
                data-state={getState()}
                onClick={() => {/* goToEvent(eventNum) */}}
              >
                <Box>{eventNum}</Box>
              </RoundButton>
              {hasActions && <EventIndicator />}
            </Box>
          )
        })}
      </TimelineContainer>

      {/* Quick Stats */}
      <StatsGrid>
        <StatCard>
          <StatLabel>Total Events</StatLabel>
          <StatValue>{currentGroup}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Actions</StatLabel>
          <StatValue>{totalActions}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Active Spells</StatLabel>
          <StatValue>{activeSpells}</StatValue>
        </StatCard>
      </StatsGrid>
    </>
  )
}

export const EventGroupTimeline = memo(RoundTimelineComponent)
EventGroupTimeline.displayName = 'EventGroupTimeline'