import React, { memo } from 'react'
import { Line, Circle, Arrow, Text } from 'react-konva'
import useEventCreationStore from '@/store/eventCreationStore'
import useAnimationStore from '@/store/animationStore'
import useMapStore from '@/store/mapStore'
// Removed unused useTimelineStore import

type PathPreviewProps = {
  gridSize: number
}

const PathPreviewComponent: React.FC<PathPreviewProps> = ({ gridSize }) => {
  // Use specific selectors to prevent unnecessary re-renders
  const isPicking = useEventCreationStore(state => state.isPicking)
  const fromPosition = useEventCreationStore(state => state.fromPosition)
  const toPosition = useEventCreationStore(state => state.toPosition)
  // selectedSpell removed - using unified action system now
  const selectedTokenId = useEventCreationStore(state => state.selectedTokenId)
  const getTokenExpectedPosition = useEventCreationStore(state => state.getTokenExpectedPosition)
  const activePaths = useAnimationStore(state => state.activePaths)

  // Get the selected token's current position for movement preview
  const currentMap = useMapStore(state => state.currentMap)
  const spellPreviewEnabled = useMapStore(state => state.spellPreviewEnabled)
  const selectedToken = selectedTokenId ? currentMap?.objects.find(obj => obj.id === selectedTokenId) : null

  // Calculate distance in grid squares and pixels
  const calculateDistance = (from: {x: number, y: number}, to: {x: number, y: number}) => {
    const dx = Math.abs(to.x - from.x) / gridSize
    const dy = Math.abs(to.y - from.y) / gridSize
    return Math.round(Math.sqrt(dx * dx + dy * dy) * 5) // D&D uses 5ft squares
  }

  const calculatePixelDistance = (from: {x: number, y: number}, to: {x: number, y: number}) => {
    return Math.sqrt(
      Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2)
    )
  }

  // Standard D&D movement speed (can be made configurable per token later)
  const MOVEMENT_SPEED_FEET = 30 // Standard character movement per round
  const movementRangeInPixels = (MOVEMENT_SPEED_FEET / 5) * gridSize

  // Check if we have a valid spell (not just a truthy object)
  const hasValidSpell = false // Disabled - using unified action system now

  // For movement preview, we need either explicit from/to positions OR we're picking 'to' with a selected token
  // AND preview must be enabled
  const isMovementPreview = spellPreviewEnabled && !hasValidSpell && (
    // Case 1: Both positions explicitly set (rare)
    (isPicking && fromPosition && toPosition) ||
    // Case 2: We're picking destination position and have a selected token (common case)
    (isPicking === 'to' && selectedToken && toPosition)
  )

  // Determine the actual from and to positions for rendering
  // Use expected position (after pending events) instead of current position
  const expectedPosition = selectedTokenId ? getTokenExpectedPosition(selectedTokenId) : null

  const actualFromPosition = fromPosition || expectedPosition || (selectedToken ? selectedToken.position : null)

  const actualToPosition = toPosition

  // Check if movement is within range
  const distance = actualFromPosition && actualToPosition
    ? calculatePixelDistance(actualFromPosition, actualToPosition)
    : 0
  const isWithinMovementRange = distance <= movementRangeInPixels

  const showPathPreview = isMovementPreview && actualFromPosition && actualToPosition

  return (
    <>
      {/* Movement Path Preview - only for non-spell events */}
      {showPathPreview && (
        <>
          {/* Movement range indicator */}
          <Circle
            x={actualFromPosition.x}
            y={actualFromPosition.y}
            radius={movementRangeInPixels}
            stroke="#00CED1"
            strokeWidth={1}
            fill="transparent"
            opacity={0.3}
            dash={[8, 8]}
          />
          {/* Movement Path Arrow */}
          <Arrow
            points={[
              actualFromPosition.x,
              actualFromPosition.y,
              actualToPosition.x,
              actualToPosition.y
            ]}
            stroke={isWithinMovementRange ? "#00CED1" : "#FF6B6B"}  // Turquoise for valid, red for invalid
            strokeWidth={3}
            fill={isWithinMovementRange ? "#00CED1" : "#FF6B6B"}
            dash={[10, 5]}
            opacity={0.8}
            pointerLength={18}
            pointerWidth={12}
          />

          {/* Start point - movement origin */}
          <Circle
            x={actualFromPosition.x}
            y={actualFromPosition.y}
            radius={8}
            fill="#00FF7F"  // Spring green for movement start
            stroke="#FFFFFF"
            strokeWidth={2}
          />
          {/* Movement start indicator ring */}
          <Circle
            x={actualFromPosition.x}
            y={actualFromPosition.y}
            radius={12}
            stroke="#00FF7F"
            strokeWidth={2}
            fill="transparent"
            opacity={0.6}
            dash={[3, 3]}
          />

          {/* End point - movement destination */}
          <Circle
            x={actualToPosition.x}
            y={actualToPosition.y}
            radius={10}
            fill={isWithinMovementRange ? "#00CED1" : "#FF6B6B"}  // Turquoise for valid, red for invalid
            stroke="#FFFFFF"
            strokeWidth={2}
          />
          {/* Movement destination indicator */}
          <Circle
            x={actualToPosition.x}
            y={actualToPosition.y}
            radius={16}
            stroke={isWithinMovementRange ? "#00CED1" : "#FF6B6B"}
            strokeWidth={2}
            fill="transparent"
            opacity={0.7}
            dash={[4, 4]}
          />

          {/* Movement Distance label */}
          <Text
            x={(actualFromPosition.x + actualToPosition.x) / 2}
            y={(actualFromPosition.y + actualToPosition.y) / 2 - 25}
            text={`Move: ${calculateDistance(actualFromPosition, actualToPosition)} ft${isWithinMovementRange ? '' : ' (OUT OF RANGE)'}`}
            fontSize={16}
            fontFamily="'Scala Sans', sans-serif"
            fill={isWithinMovementRange ? "#00CED1" : "#FF6B6B"}
            stroke="#000000"
            strokeWidth={1}
            align="center"
            offsetX={isWithinMovementRange ? 30 : 60}  // Wider offset for longer text
          />
        </>
      )}

      {/* Active Animation Paths */}
      {activePaths.map((path) => {
        const currentX = path.from.x + (path.to.x - path.from.x) * path.progress
        const currentY = path.from.y + (path.to.y - path.from.y) * path.progress

        return (
          <React.Fragment key={path.tokenId}>
            {/* Full path (faded) */}
            <Line
              points={[
                path.from.x,
                path.from.y,
                path.to.x,
                path.to.y
              ]}
              stroke="#FFD700"
              strokeWidth={2}
              opacity={0.3}
              dash={[5, 5]}
            />

            {/* Traveled path (bright) */}
            <Line
              points={[
                path.from.x,
                path.from.y,
                currentX,
                currentY
              ]}
              stroke="#FFD700"
              strokeWidth={3}
              opacity={0.8}
            />

            {/* Current position indicator */}
            <Circle
              x={currentX}
              y={currentY}
              radius={6}
              fill="#FFD700"
              stroke="#FFFFFF"
              strokeWidth={2}
            />

            {/* Destination marker */}
            <Circle
              x={path.to.x}
              y={path.to.y}
              radius={8}
              fill="#FF6B6B"
              stroke="#FFFFFF"
              strokeWidth={2}
              opacity={0.7}
            />
          </React.Fragment>
        )
      })}
    </>
  )
}

export const PathPreview = memo(PathPreviewComponent)
PathPreview.displayName = 'PathPreview'

export default PathPreview