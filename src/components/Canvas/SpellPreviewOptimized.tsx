import React, { memo, useMemo, useCallback } from 'react'
import { Circle, Group, Text, Line, Wedge } from 'react-konva'
import useEventCreationStore from '@/store/eventCreationStore'
import useMapStore from '@/store/mapStore'
import { SpellEventData } from '@/types/timeline'
import { Position } from '@/types/map'

type SpellPreviewProps = {
  gridSize: number
}

// Memoized calculation hooks for expensive operations
const useSpellCalculations = (
  fromPosition: Position | null,
  toPosition: Position | null,
  selectedSpell: SpellEventData | undefined,
  gridSize: number
) => {
  return useMemo(() => {
    if (!fromPosition || !selectedSpell) {
      return {
        distance: 0,
        distanceInFeet: 0,
        spellRangeInPixels: 0,
        areaRadiusInPixels: 0,
        isInRange: false,
        angle: 0
      }
    }

    // Calculate distance
    const distance = toPosition
      ? Math.sqrt(
          Math.pow(toPosition.x - fromPosition.x, 2) +
          Math.pow(toPosition.y - fromPosition.y, 2)
        )
      : 0

    // Convert pixels to feet (D&D standard: 1 square = 5 feet)
    const distanceInFeet = Math.round(distance / gridSize * 5)

    // Get spell properties
    const spellRange = selectedSpell.range || 0
    const spellRangeInPixels = (spellRange / 5) * gridSize

    // Area radius: burstRadius from UnifiedAction is already in pixels
    const areaRadiusInPixels = selectedSpell.burstRadius || 0

    // Determine if target is in range
    const isInRange = distance <= spellRangeInPixels

    // Calculate angle for directional spells
    const angle = toPosition
      ? Math.atan2(toPosition.y - fromPosition.y, toPosition.x - fromPosition.x) * 180 / Math.PI
      : 0

    return {
      distance,
      distanceInFeet,
      spellRangeInPixels,
      areaRadiusInPixels,
      isInRange,
      angle
    }
  }, [fromPosition, toPosition, selectedSpell, gridSize])
}

// Memoized range indicator component
const RangeIndicator = memo(({
  fromPosition,
  spellRange,
  spellRangeInPixels,
  isInRange
}: {
  fromPosition: Position
  spellRange: number
  spellRangeInPixels: number
  isInRange: boolean
}) => {
  if (spellRange <= 0) return null

  const strokeColor = isInRange ? '#4CAF50' : '#FF5252'

  return (
    <>
      <Circle
        x={fromPosition.x}
        y={fromPosition.y}
        radius={spellRangeInPixels}
        stroke={strokeColor}
        strokeWidth={2}
        fill="transparent"
        opacity={0.3}
        dash={[10, 5]}
        perfectDrawEnabled={false} // Performance optimization
        shadowForStrokeEnabled={false} // Performance optimization
      />
      <Text
        x={fromPosition.x}
        y={fromPosition.y - spellRangeInPixels - 20}
        text={`Range: ${spellRange} ft`}
        fontSize={14}
        fontFamily="'Scala Sans', sans-serif"
        fill={strokeColor}
        stroke="#000000"
        strokeWidth={1}
        align="center"
        offsetX={35}
        perfectDrawEnabled={false}
      />
    </>
  )
})
RangeIndicator.displayName = 'RangeIndicator'

// Memoized area effect component
const AreaEffect = memo(({
  toPosition,
  areaRadiusInPixels,
  gridSize
}: {
  toPosition: Position
  areaRadiusInPixels: number
  gridSize: number
}) => {
  if (areaRadiusInPixels <= 0) return null

  const radiusInFeet = Math.round(areaRadiusInPixels / gridSize * 5)

  return (
    <>
      <Circle
        x={toPosition.x}
        y={toPosition.y}
        radius={areaRadiusInPixels}
        stroke="#FF6B35"
        strokeWidth={3}
        fill="#FF6B35"
        opacity={0.2}
        dash={[8, 4]}
        perfectDrawEnabled={false}
        shadowForStrokeEnabled={false}
      />
      <Circle
        x={toPosition.x}
        y={toPosition.y}
        radius={areaRadiusInPixels * 0.8}
        stroke="#FF4500"
        strokeWidth={1}
        fill="transparent"
        opacity={0.3}
        perfectDrawEnabled={false}
        shadowForStrokeEnabled={false}
      />
      <Text
        x={toPosition.x}
        y={toPosition.y - areaRadiusInPixels - 10}
        text={`${radiusInFeet} ft radius`}
        fontSize={12}
        fontFamily="'Scala Sans', sans-serif"
        fill="#FF6B35"
        stroke="#000000"
        strokeWidth={1}
        align="center"
        offsetX={30}
        perfectDrawEnabled={false}
      />
    </>
  )
})
AreaEffect.displayName = 'AreaEffect'

// Memoized directional spell component
const DirectionalSpell = memo(({
  selectedSpell,
  fromPosition,
  toPosition,
  spellRangeInPixels,
  angle
}: {
  selectedSpell: SpellEventData
  fromPosition: Position
  toPosition: Position
  spellRangeInPixels: number
  angle: number
}) => {
  if (selectedSpell.category === 'cone') {
    return (
      <Wedge
        x={fromPosition.x}
        y={fromPosition.y}
        radius={spellRangeInPixels}
        angle={53} // D&D cone is 53 degrees
        rotation={angle - 26.5}
        fill="#FFA500"
        opacity={0.3}
        stroke="#FFA500"
        strokeWidth={2}
        dash={[10, 5]}
        perfectDrawEnabled={false}
        shadowForStrokeEnabled={false}
      />
    )
  }

  if (selectedSpell.category === 'line') {
    return (
      <Line
        points={[
          fromPosition.x,
          fromPosition.y,
          fromPosition.x + Math.cos(angle * Math.PI / 180) * spellRangeInPixels,
          fromPosition.y + Math.sin(angle * Math.PI / 180) * spellRangeInPixels
        ]}
        stroke="#00CED1"
        strokeWidth={selectedSpell.lineWidth || 10}
        opacity={0.4}
        lineCap="round"
        perfectDrawEnabled={false}
        shadowForStrokeEnabled={false}
      />
    )
  }

  return null
})
DirectionalSpell.displayName = 'DirectionalSpell'

const SpellPreviewOptimizedComponent: React.FC<SpellPreviewProps> = ({ gridSize }) => {
  // Use direct store calls like the original, but with individual selectors
  const isPicking = useEventCreationStore(state => state.isPicking)
  const selectedSpell = useEventCreationStore(state => state.selectedSpell)
  const fromPosition = useEventCreationStore(state => state.fromPosition)
  const toPosition = useEventCreationStore(state => state.toPosition)
  const spellPreviewEnabled = useMapStore(state => state.spellPreviewEnabled)

  // Only show preview when picking position for a spell AND preview is enabled
  const showPreview = spellPreviewEnabled && isPicking === 'to' && selectedSpell && fromPosition

  // Memoized calculations
  const calculations = useSpellCalculations(fromPosition, toPosition, selectedSpell, gridSize)

  // Early return if no preview needed
  if (!showPreview || !fromPosition) {
    return null
  }

  const {
    distanceInFeet,
    spellRangeInPixels,
    areaRadiusInPixels,
    isInRange,
    angle
  } = calculations

  const strokeColor = isInRange ? '#4CAF50' : '#FF5252'
  const spellRange = selectedSpell?.range || 0

  return (
    <Group>
      {/* Range indicator around caster */}
      <RangeIndicator
        fromPosition={fromPosition}
        spellRange={spellRange}
        spellRangeInPixels={spellRangeInPixels}
        isInRange={isInRange}
      />

      {/* Area of effect preview at target position */}
      {toPosition && areaRadiusInPixels > 0 && (
        <AreaEffect
          toPosition={toPosition}
          areaRadiusInPixels={areaRadiusInPixels}
          gridSize={gridSize}
        />
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
            stroke={strokeColor}
            strokeWidth={2}
            opacity={0.5}
            dash={[5, 5]}
            perfectDrawEnabled={false}
            shadowForStrokeEnabled={false}
          />
          <Text
            x={(fromPosition.x + toPosition.x) / 2}
            y={(fromPosition.y + toPosition.y) / 2 - 10}
            text={`${distanceInFeet} ft`}
            fontSize={16}
            fontFamily="'Scala Sans', sans-serif"
            fill={strokeColor}
            stroke="#000000"
            strokeWidth={1}
            align="center"
            offsetX={20}
            perfectDrawEnabled={false}
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
        perfectDrawEnabled={false}
        shadowForStrokeEnabled={false}
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
          perfectDrawEnabled={false}
        />
      )}

      {/* Directional spell preview (cone/line) */}
      {toPosition && (selectedSpell?.category === 'cone' || selectedSpell?.category === 'line') && (
        <DirectionalSpell
          selectedSpell={selectedSpell}
          fromPosition={fromPosition}
          toPosition={toPosition}
          spellRangeInPixels={spellRangeInPixels}
          angle={angle}
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
          perfectDrawEnabled={false}
        />
      )}
    </Group>
  )
}

export const SpellPreviewOptimized = memo(SpellPreviewOptimizedComponent)
SpellPreviewOptimized.displayName = 'SpellPreviewOptimized'

export default SpellPreviewOptimized