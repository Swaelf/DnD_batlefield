import React, { useState, memo } from 'react'
import { Shield } from 'lucide-react'
import useRoundStore from '@/store/roundStore'
import useMapStore from '@/store/mapStore'
import { EventEditor } from './EventEditor'
import { RoundCounter } from './RoundCounter'
import { CombatControls, SpeedControls } from './CombatControls'
import { RoundTimeline } from './RoundTimeline'
import {
  TrackerContainer,
  StartCombatButton,
  CombatPanel,
  CombatBar,
  ExpandedSection
} from './CombatTracker.styled'

const CombatTrackerComponent: React.FC = () => {
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
            {/* Round Counter and Navigation */}
            <RoundCounter
              currentRound={currentRound}
              onNextRound={handleNextRound}
              onPreviousRound={previousRound}
            />

            {/* Combat Controls */}
            <CombatControls
              eventCount={eventCount}
              activeSpells={activeSpells}
              animationSpeed={animationSpeed}
              isExpanded={isExpanded}
              onShowEventEditor={() => setShowEventEditor(true)}
              onEndCombat={endCombat}
              onToggleExpanded={() => setIsExpanded(!isExpanded)}
              onSetAnimationSpeed={setAnimationSpeed}
            />
          </CombatBar>

          {/* Expanded Section */}
          {isExpanded && (
            <ExpandedSection>
              {/* Speed Control */}
              <SpeedControls
                animationSpeed={animationSpeed}
                onSetAnimationSpeed={setAnimationSpeed}
              />

              {/* Round Timeline and Stats */}
              <RoundTimeline
                timeline={timeline}
                currentRound={currentRound}
                activeSpells={activeSpells}
              />
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

export const CombatTracker = memo(CombatTrackerComponent)
CombatTracker.displayName = 'CombatTracker'