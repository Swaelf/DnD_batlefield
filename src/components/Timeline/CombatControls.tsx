import React, { memo } from 'react'
import { Pause, Plus, Sparkles, ChevronUp, ChevronDown } from 'lucide-react'
import { Text, Box } from '@/components/primitives'
import {
  StatusSection,
  EventsButton,
  StatusIndicator,
  ControlButton,
  NavButton,
  SpeedControl,
  SpeedLabel,
  SpeedInput,
  SpeedValue
} from './CombatTracker.styled'

type CombatControlsProps = {
  eventCount: number
  activeSpells: number
  animationSpeed: number
  isExpanded: boolean
  onShowEventEditor: () => void
  onEndCombat: () => void
  onToggleExpanded: () => void
  onSetAnimationSpeed: (speed: number) => void
}

const CombatControlsComponent: React.FC<CombatControlsProps> = ({
  eventCount,
  activeSpells,
  animationSpeed,
  isExpanded,
  onShowEventEditor,
  onEndCombat,
  onToggleExpanded,
  onSetAnimationSpeed
}) => {
  return (
    <>
      {/* Status Indicators and Event Button */}
      <StatusSection>
        <EventsButton
          onClick={onShowEventEditor}
          title="Add Action"
        >
          <Plus size={14} />
          <span>Add Action</span>
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
        onClick={onEndCombat}
        title="End Combat"
      >
        <Pause size={16} />
      </ControlButton>

      {/* Expand/Collapse */}
      <NavButton
        onClick={onToggleExpanded}
      >
        {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </NavButton>
    </>
  )
}

export const CombatControls = memo(CombatControlsComponent)
CombatControls.displayName = 'CombatControls'

type SpeedControlsProps = {
  animationSpeed: number
  onSetAnimationSpeed: (speed: number) => void
}

const SpeedControlsComponent: React.FC<SpeedControlsProps> = ({
  animationSpeed,
  onSetAnimationSpeed
}) => {
  return (
    <SpeedControl>
      <Box display="flex" alignItems="center" gap="2">
        <SpeedLabel>Animation Speed:</SpeedLabel>
        <SpeedInput
          type="range"
          min="0.5"
          max="3"
          step="0.5"
          value={animationSpeed}
          onChange={(e) => onSetAnimationSpeed(parseFloat(e.target.value))}
        />
        <SpeedValue>{animationSpeed}x</SpeedValue>
      </Box>
    </SpeedControl>
  )
}

export const SpeedControls = memo(SpeedControlsComponent)
SpeedControls.displayName = 'SpeedControls'