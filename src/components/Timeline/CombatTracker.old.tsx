import React, { useState } from 'react'
import { Pause, SkipForward, ChevronUp, ChevronDown, Sparkles, Shield, Clock, Calendar } from 'lucide-react'
import useRoundStore from '@/store/roundStore'
import useMapStore from '@/store/mapStore'
import { EventEditor } from './EventEditor'
import { Box, Text } from '@/components/primitives'
import {
  TrackerContainer,
  StartCombatButton,
  CombatPanel,
  CombatBar,
  RoundCounter,
  NavControls,
  NavButton,
  NextRoundButton,
  StatusSection,
  EventsButton,
  StatusIndicator,
  ControlButton,
  ExpandedSection,
  SpeedControl,
  SpeedLabel,
  SpeedInput,
  SpeedValue,
  TimelineContainer,
  RoundButton,
  EventIndicator,
  StatsGrid,
  StatCard,
  StatLabel,
  StatValue
} from './CombatTracker.styled'

export const CombatTracker: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showEventEditor, setShowEventEditor] = useState(false)
  // Use specific selectors to prevent unnecessary re-renders
  const timeline = useRoundStore(state => state.timeline)
  const currentRound = useRoundStore(state => state.currentRound)
  const isInCombat = useRoundStore(state => state.isInCombat)
  const animationSpeed = useRoundStore(state => state.animationSpeed)
  const startCombat = useRoundStore(state => state.startCombat)
  const endCombat = useRoundStore(state => state.endCombat)
  const nextRound = useRoundStore(state => state.nextRound)
  const previousRound = useRoundStore(state => state.previousRound)
  const setAnimationSpeed = useRoundStore(state => state.setAnimationSpeed)

  // Use specific selectors to prevent unnecessary re-renders
  const currentMap = useMapStore(state => state.currentMap)
  const cleanupExpiredSpells = useMapStore(state => state.cleanupExpiredSpells)

  const handleStartCombat = () => {
    if (currentMap) {
      startCombat(currentMap.id)
    }
  }

  const handleNextRound = async () => {
    await nextRound()
    // Clean up expired spells after round change
    cleanupExpiredSpells(currentRound + 1)
  }

  const currentRoundData = timeline?.rounds.find(r => r.number === currentRound)
  const eventCount = currentRoundData?.events.length || 0

  // Count active spell effects
  const activeSpells = currentMap?.objects.filter(obj => obj.isSpellEffect).length || 0

  if (!isInCombat) {
    return (
      <TrackerContainer>
        <StartCombatButton
          onClick={handleStartCombat}
          disabled={!currentMap}
        >
          <Shield size={20} />
          Start Combat
        </StartCombatButton>
      </TrackerContainer>
    )
  }

  return (
    <>
      <TrackerContainer>
        <CombatPanel>
          {/* Main Combat Bar */}
          <CombatBar>
            {/* Round Counter */}
            <RoundCounter>
              <Clock size={16} color="$secondary" />
              <Text size="xl" weight="bold" color="white">Round {currentRound}</Text>
            </RoundCounter>

            {/* Navigation Controls */}
            <NavControls>
              <NavButton
                onClick={previousRound}
                disabled={currentRound <= 1}
                title="Previous Round (←)"
              >
                <SkipForward size={16} style={{ transform: 'rotate(180deg)' }} />
              </NavButton>

              <NextRoundButton
                onClick={handleNextRound}
                title="Next Round (Space)"
              >
                <SkipForward size={16} />
                Next Round
              </NextRoundButton>
            </NavControls>

            {/* Status Indicators and Event Button */}
            <StatusSection>
              <EventsButton
                onClick={() => setShowEventEditor(true)}
                title="Manage Events"
              >
                <Calendar size={12} />
                <span>Events</span>
              </EventsButton>

              {eventCount > 0 && (
                <StatusIndicator type="events">
                  <Sparkles size={12} />
                  <Text size="sm">{eventCount}</Text>
                </StatusIndicator>
              )}
              {activeSpells > 0 && (
                <StatusIndicator type="spells">
                  <Sparkles size={12} />
                  <Text size="sm">{activeSpells}</Text>
                </StatusIndicator>
              )}
            </StatusSection>

            {/* End Combat */}
            <ControlButton
              onClick={endCombat}
              title="End Combat"
            >
              <Pause size={16} />
            </ControlButton>

            {/* Expand/Collapse */}
            <NavButton
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </NavButton>
          </CombatBar>

          {/* Expanded Section */}
          {isExpanded && (
            <ExpandedSection>
              {/* Speed Control */}
              <SpeedControl>
                <Box display="flex" alignItems="center" gap="2">
                  <SpeedLabel>Animation Speed:</SpeedLabel>
                  <SpeedInput
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.5"
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                  />
                  <SpeedValue>{animationSpeed}x</SpeedValue>
                </Box>
              </SpeedControl>

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
                  <StatValue>{timeline?.rounds.reduce((sum, r) => sum + r.events.length, 0) || 0}</StatValue>
                </StatCard>
                <StatCard>
                  <StatLabel>Active Spells</StatLabel>
                  <StatValue>{activeSpells}</StatValue>
                </StatCard>
              </StatsGrid>
            </ExpandedSection>
          )}
        </CombatPanel>
      </TrackerContainer>

      {/* Event Editor Dialog - Moved outside of positioned container */}
      <EventEditor
        isOpen={showEventEditor}
        onClose={() => setShowEventEditor(false)}
      />
    </>
  )
}