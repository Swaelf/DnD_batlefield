import React, { memo, useMemo } from 'react'
import { Circle, Group, Text, Line, Wedge } from 'react-konva'
import useEventCreationStore from '@/store/eventCreationStore'
import useMapStore from '@/store/mapStore'
import type { Position } from '@/types/map'

type SpellPreviewProps = {
  gridSize: number
}

const SpellPreviewComponent: React.FC<SpellPreviewProps> = ({ gridSize }) => {
  // Get the current spell being configured
  const isPicking = useEventCreationStore(state => state.isPicking)
  const selectedSpell = useEventCreationStore(state => state.selectedSpell)
  const fromPosition = useEventCreationStore(state => state.fromPosition)
  const toPosition = useEventCreationStore(state => state.toPosition)
  const spellPreviewEnabled = useMapStore(state => state.spellPreviewEnabled)

  // Only show preview when picking position for a spell AND preview is enabled
  const showPreview = spellPreviewEnabled && isPicking === 'to' && selectedSpell && fromPosition


  // Calculate distance between caster and target
  const distance = useMemo(() => {
    if (!fromPosition || !toPosition) return 0
    const dx = toPosition.x - fromPosition.x
    const dy = toPosition.y - fromPosition.y
    return Math.sqrt(dx * dx + dy * dy)
  }, [fromPosition, toPosition])

  // Convert pixels to feet (D&D standard: 1 square = 5 feet)
  const distanceInFeet = Math.round(distance / gridSize * 5)

  // Get spell properties
  const spellRange = selectedSpell?.range || 0
  const spellRangeInPixels = (spellRange / 5) * gridSize // Convert feet to pixels

  // Area radius: burstRadius from UnifiedAction is already in pixels
  const areaRadiusInPixels = selectedSpell?.burstRadius || 0

  // Determine if target is in range
  const isInRange = distance <= spellRangeInPixels

  if (!showPreview || !fromPosition) {
    return null
  }

  return (
    <Group>
      {/* Range indicator circle around caster */}
      {spellRange > 0 && (
        <>
          {/* Range circle */}
          <Circle
            x={fromPosition.x}
            y={fromPosition.y}
            radius={spellRangeInPixels}
            stroke={isInRange ? '#4CAF50' : '#FF5252'}
            strokeWidth={2}
            fill="transparent"
            opacity={0.3}
            dash={[10, 5]}
          />

          {/* Range label */}
          <Text
            x={fromPosition.x}
            y={fromPosition.y - spellRangeInPixels - 20}
            text={`Range: ${spellRange} ft`}
            fontSize={14}
            fontFamily="'Scala Sans', sans-serif"
            fill={isInRange ? '#4CAF50' : '#FF5252'}
            stroke="#000000"
            strokeWidth={1}
            align="center"
            offsetX={35}
          />
        </>
      )}

      {/* Area of effect preview at target position */}
      {toPosition && areaRadiusInPixels > 0 && (
        <>
          {/* Area effect circle */}
          <Circle
            x={toPosition.x}
            y={toPosition.y}
            radius={areaRadiusInPixels}
            stroke="#FF6B35"
            strokeWidth={3}
            fill="#FF6B35"
            opacity={0.2}
            dash={[8, 4]}
          />

          {/* Inner circle for clarity */}
          <Circle
            x={toPosition.x}
            y={toPosition.y}
            radius={areaRadiusInPixels * 0.8}
            stroke="#FF4500"
            strokeWidth={1}
            fill="transparent"
            opacity={0.3}
          />

          {/* Area radius label */}
          <Text
            x={toPosition.x}
            y={toPosition.y - areaRadiusInPixels - 10}
            text={`${Math.round(areaRadiusInPixels / gridSize * 5)} ft radius`}
            fontSize={12}
            fontFamily="'Scala Sans', sans-serif"
            fill="#FF6B35"
            stroke="#000000"
            strokeWidth={1}
            align="center"
            offsetX={30}
          />

          {/* Grid square indicators - show affected squares */}
          {/* Commented out for performance - this is expensive to calculate on every mouse move */}
          {/* {renderAffectedSquares(toPosition, areaRadiusInPixels, gridSize)} */}
        </>
      )}

      {/* Line from caster to target */}
      {toPosition && (
        <>
          <Line
            points={[
              fromPosition.x,
              fromPosition.y,
              toPosition.x,
              toPosition.y
            ]}
            stroke={isInRange ? '#4CAF50' : '#FF5252'}
            strokeWidth={2}
            opacity={0.5}
            dash={[5, 5]}
          />

          {/* Distance label */}
          <Text
            x={(fromPosition.x + toPosition.x) / 2}
            y={(fromPosition.y + toPosition.y) / 2 - 10}
            text={`${distanceInFeet} ft`}
            fontSize={16}
            fontFamily="'Scala Sans', sans-serif"
            fill={isInRange ? '#4CAF50' : '#FF5252'}
            stroke="#000000"
            strokeWidth={1}
            align="center"
            offsetX={20}
          />
        </>
      )}

      {/* Caster position indicator */}
      <Circle
        x={fromPosition.x}
        y={fromPosition.y}
        radius={10}
        fill="#FFD700"
        stroke="#FFFFFF"
        strokeWidth={2}
        opacity={0.8}
      />

      {/* Spell name indicator */}
      {selectedSpell?.spellName && (
        <Text
          x={fromPosition.x}
          y={fromPosition.y + 25}
          text={selectedSpell.spellName}
          fontSize={14}
          fontFamily="'Scala Sans', sans-serif"
          fill="#FFD700"
          stroke="#000000"
          strokeWidth={1}
          align="center"
          offsetX={selectedSpell.spellName.length * 4}
        />
      )}

      {/* Cone spell preview (if applicable) */}
      {selectedSpell?.category === 'cone' && toPosition && (
        <Wedge
          x={fromPosition.x}
          y={fromPosition.y}
          radius={spellRangeInPixels}
          angle={53} // D&D cone is 53 degrees
          rotation={calculateAngle(fromPosition, toPosition) - 26.5}
          fill="#FFA500"
          opacity={0.3}
          stroke="#FFA500"
          strokeWidth={2}
          dash={[10, 5]}
        />
      )}

      {/* Line spell preview (if applicable) */}
      {selectedSpell?.category === 'line' && toPosition && (
        <Line
          points={[
            fromPosition.x,
            fromPosition.y,
            fromPosition.x + Math.cos(calculateAngle(fromPosition, toPosition) * Math.PI / 180) * spellRangeInPixels,
            fromPosition.y + Math.sin(calculateAngle(fromPosition, toPosition) * Math.PI / 180) * spellRangeInPixels
          ]}
          stroke="#00CED1"
          strokeWidth={selectedSpell?.lineWidth || 10}
          opacity={0.4}
          lineCap="round"
        />
      )}

      {/* Out of range warning */}
      {toPosition && !isInRange && (
        <Text
          x={toPosition.x}
          y={toPosition.y + 30}
          text="OUT OF RANGE!"
          fontSize={16}
          fontFamily="'Scala Sans', sans-serif"
          fill="#FF5252"
          stroke="#000000"
          strokeWidth={1}
          align="center"
          offsetX={50}
        />
      )}
    </Group>
  )
}

// Helper function to calculate angle between two points
function calculateAngle(from: Position, to: Position): number {
  const dx = to.x - from.x
  const dy = to.y - from.y
  return Math.atan2(dy, dx) * 180 / Math.PI
}

export const SpellPreview = memo(SpellPreviewComponent)
SpellPreview.displayName = 'SpellPreview'

export default SpellPreview