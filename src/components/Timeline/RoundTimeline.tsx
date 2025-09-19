import React, { memo } from 'react'
import { Timeline } from '@/types'
import { Box } from '@/components/primitives'
import {
  TimelineContainer,
  RoundButton,
  EventIndicator,
  StatsGrid,
  StatCard,
  StatLabel,
  StatValue
} from './CombatTracker.styled'

type RoundTimelineProps = {
  timeline: Timeline | null
  currentRound: number
  activeSpells: number
}

const RoundTimelineComponent: React.FC<RoundTimelineProps> = ({
  timeline,
  currentRound,
  activeSpells
}) => {
  const totalEvents = timeline?.rounds.reduce((sum, r) => sum + r.events.length, 0) || 0

  return (
    <>
      {/* Round Timeline */}
      <TimelineContainer>
        {Array.from({ length: Math.max(10, currentRound + 2) }, (_, i) => i + 1).map((roundNum) => {
          const round = timeline?.rounds.find(r => r.number === roundNum)
          const hasEvents = round && round.events.length > 0
          const isExecuted = round?.executed

          const getState = () => {
            if (roundNum === currentRound) return 'current'
            if (isExecuted) return 'executed'
            return 'pending'
          }

          return (
            <Box key={roundNum} display="flex" flexDirection="column">
              <RoundButton
                state={getState()}
                onClick={() => {/* goToRound(roundNum) */}}
              >
                <Box>{roundNum}</Box>
              </RoundButton>
              {hasEvents && <EventIndicator />}
            </Box>
          )
        })}
      </TimelineContainer>

      {/* Quick Stats */}
      <StatsGrid>
        <StatCard>
          <StatLabel>Total Rounds</StatLabel>
          <StatValue>{currentRound}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Events</StatLabel>
          <StatValue>{totalEvents}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Active Spells</StatLabel>
          <StatValue>{activeSpells}</StatValue>
        </StatCard>
      </StatsGrid>
    </>
  )
}

export const RoundTimeline = memo(RoundTimelineComponent)
RoundTimeline.displayName = 'RoundTimeline'