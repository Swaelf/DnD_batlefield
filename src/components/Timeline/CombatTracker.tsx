import { useState, memo, type FC } from 'react'
import { Shield, ArrowLeft, ArrowRight } from '@/utils/optimizedIcons'
import useTimelineStore from '@/store/timelineStore'
import useMapStore from '@/store/mapStore'
import { UnifiedEventEditor } from './UnifiedEventEditor'
import { EventGroupCounter } from './RoundCounter'
import { CombatControls, SpeedControls } from './CombatControls'
import { EventGroupTimeline } from './RoundTimeline'
import {
  TrackerContainer,
  StartCombatButton,
  CombatPanel,
  CombatBar,
  ExpandedSection,
  NavButton
} from './CombatTracker.styled.tsx'

const CombatTrackerComponent: FC = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showEventEditor, setShowEventEditor] = useState(false)

  // Use specific selectors to prevent unnecessary re-renders
  const timeline = useTimelineStore(state => state.timeline)
  const currentRound = useTimelineStore(state => state.currentRound)
  const currentEvent = useTimelineStore(state => state.currentEvent)
  const isInCombat = useTimelineStore(state => state.isInCombat)
  const animationSpeed = useTimelineStore(state => state.animationSpeed)
  const startCombat = useTimelineStore(state => state.startCombat)
  const endCombat = useTimelineStore(state => state.endCombat)
  const startNewRound = useTimelineStore(state => state.startNewRound)
  const nextEvent = useTimelineStore(state => state.nextEvent)
  const previousEvent = useTimelineStore(state => state.previousEvent)
  const nextRound = useTimelineStore(state => state.nextRound)
  const previousRound = useTimelineStore(state => state.previousRound)
  const setAnimationSpeed = useTimelineStore(state => state.setAnimationSpeed)

  // Use specific selectors to prevent unnecessary re-renders
  const currentMap = useMapStore(state => state.currentMap)
  const cleanupExpiredSpells = useMapStore(state => state.cleanupExpiredSpells)

  const handleStartCombat = () => {
    if (currentMap) {
      startCombat(currentMap.id)
    }
  }

  const handleNextEvent = async () => {
    await nextEvent()
    // Get the updated round and event from the store after nextEvent completes
    const { currentRound: updatedRound, currentEvent: updatedEvent } = useTimelineStore.getState()
    // Clean up expired spells after event change
    cleanupExpiredSpells(updatedRound, updatedEvent)
  }

  const currentRoundData = timeline?.rounds.find(r => r.number === currentRound)
  const currentEventData = currentRoundData?.events.find(e => e.number === currentEvent)
  const actionCount = currentEventData?.actions.length || 0

  // Count active spell effects
  const activeSpells = currentMap?.objects.filter(obj => obj.isSpellEffect).length || 0

  // Check if current round is executed (ended)
  const isCurrentRoundExecuted = currentRoundData?.executed || false

  // Check if next round exists
  const nextRoundExists = timeline?.rounds.some(r => r.number === currentRound + 1) || false

  // Disable navigation logic:
  // - Next Round: disabled if current round not executed OR next round doesn't exist
  // - Previous Round: disabled if on round 1
  // - Start New Round: disabled if next round exists (viewing historical round)
  const canGoToNextRound = isCurrentRoundExecuted && nextRoundExists
  const canGoToPreviousRound = currentRound > 1
  const canStartNewRound = !nextRoundExists

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
          {/* Main Combat Bar with Side Arrows */}
          <CombatBar>
            {/* Left Arrow - Previous Round */}
            <NavButton
              onClick={previousRound}
              disabled={!canGoToPreviousRound}
              title="Previous Round (←)"
              style={{ marginRight: 'auto' }}
            >
              <ArrowLeft size={24} />
            </NavButton>

            {/* Round and Event Counter with Navigation */}
            <EventGroupCounter
              currentRound={currentRound}
              currentGroup={currentEvent}
              onNextGroup={handleNextEvent}
              onPreviousGroup={previousEvent}
              onStartNewRound={startNewRound}
              canStartNewRound={canStartNewRound}
            />

            {/* Combat Controls */}
            <CombatControls
              eventCount={actionCount}
              activeSpells={activeSpells}
              animationSpeed={animationSpeed}
              isExpanded={isExpanded}
              onShowEventEditor={() => setShowEventEditor(true)}
              onEndCombat={endCombat}
              onToggleExpanded={() => setIsExpanded(!isExpanded)}
              onSetAnimationSpeed={setAnimationSpeed}
            />

            {/* Right Arrow - Next Round */}
            <NavButton
              onClick={nextRound}
              disabled={!canGoToNextRound}
              title="Next Round (→)"
              style={{ marginLeft: 'auto' }}
            >
              <ArrowRight size={24} />
            </NavButton>
          </CombatBar>

          {/* Expanded Section */}
          {isExpanded && (
            <ExpandedSection>
              {/* Speed Control */}
              <SpeedControls
                animationSpeed={animationSpeed}
                onSetAnimationSpeed={setAnimationSpeed}
              />

              {/* Event Timeline and Stats */}
              <EventGroupTimeline
                timeline={timeline}
                currentGroup={currentEvent}
                activeSpells={activeSpells}
              />
            </ExpandedSection>
          )}
        </CombatPanel>
      </TrackerContainer>

      {/* Unified Event Editor Dialog - Moved outside of positioned container */}
      <UnifiedEventEditor
        isOpen={showEventEditor}
        onClose={() => setShowEventEditor(false)}
      />
    </>
  )
}

export const CombatTracker = memo(CombatTrackerComponent)
CombatTracker.displayName = 'CombatTracker'