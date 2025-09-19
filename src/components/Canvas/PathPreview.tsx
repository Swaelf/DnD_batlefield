import React from 'react'
import { Line, Circle, Arrow, Text } from 'react-konva'
import useEventCreationStore from '@/store/eventCreationStore'
import useAnimationStore from '@/store/animationStore'
// Removed unused useRoundStore import

interface PathPreviewProps {
  gridSize: number
}

export const PathPreview: React.FC<PathPreviewProps> = ({ gridSize }) => {
  const { isPicking, fromPosition, toPosition } = useEventCreationStore()
  const { activePaths } = useAnimationStore()
  // Removed unused timeline and currentRound

  // Calculate distance in grid squares
  const calculateDistance = (from: {x: number, y: number}, to: {x: number, y: number}) => {
    const dx = Math.abs(to.x - from.x) / gridSize
    const dy = Math.abs(to.y - from.y) / gridSize
    return Math.round(Math.sqrt(dx * dx + dy * dy) * 5) // D&D uses 5ft squares
  }

  // Determine if we're picking for a spell (from/to positions)
  const isSpellPicking = isPicking === 'from' || isPicking === 'to'

  return (
    <>
      {/* Event Creation Path Preview - including spell paths */}
      {isPicking && fromPosition && toPosition && (
        <>
          {/* Path line - different style for spells */}
          <Arrow
            points={[
              fromPosition.x,
              fromPosition.y,
              toPosition.x,
              toPosition.y
            ]}
            stroke={isSpellPicking ? "#FF6B6B" : "#4169E1"}
            strokeWidth={3}
            fill={isSpellPicking ? "#FF6B6B" : "#4169E1"}
            dash={isSpellPicking ? [15, 5] : [10, 5]}
            opacity={0.7}
            pointerLength={15}
            pointerWidth={15}
          />

          {/* Start point - spell caster position */}
          <Circle
            x={fromPosition.x}
            y={fromPosition.y}
            radius={isSpellPicking ? 10 : 8}
            fill={isSpellPicking ? "#FFD700" : "#00FF00"}
            stroke="#FFFFFF"
            strokeWidth={2}
          />
          {isSpellPicking && (
            <Circle
              x={fromPosition.x}
              y={fromPosition.y}
              radius={15}
              stroke="#FFD700"
              strokeWidth={2}
              fill="transparent"
              opacity={0.5}
            />
          )}

          {/* End point - spell target */}
          <Circle
            x={toPosition.x}
            y={toPosition.y}
            radius={isSpellPicking ? 10 : 8}
            fill={isSpellPicking ? "#FF4444" : "#FF0000"}
            stroke="#FFFFFF"
            strokeWidth={2}
          />
          {isSpellPicking && (
            <Circle
              x={toPosition.x}
              y={toPosition.y}
              radius={20}
              stroke="#FF4444"
              strokeWidth={2}
              fill="transparent"
              opacity={0.5}
              dash={[5, 5]}
            />
          )}

          {/* Distance label */}
          <Text
            x={(fromPosition.x + toPosition.x) / 2}
            y={(fromPosition.y + toPosition.y) / 2 - 20}
            text={`${calculateDistance(fromPosition, toPosition)} ft`}
            fontSize={14}
            fontFamily="'Scala Sans', sans-serif"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth={1}
            align="center"
            offsetX={20}
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

export default PathPreview