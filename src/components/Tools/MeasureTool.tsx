import { memo, type FC } from 'react'
import { Group, Line, Text, Circle } from 'react-konva'
import useToolStore from '@/store/toolStore'

type MeasureToolProps = {
  gridSize: number
}

const MeasureTool: FC<MeasureToolProps> = ({ gridSize }) => {
  // Use specific selectors to prevent unnecessary re-renders
  const currentTool = useToolStore(state => state.currentTool)
  const drawingState = useToolStore(state => state.drawingState)

  if (currentTool !== 'measure' || !drawingState.isDrawing) {
    return null
  }

  const { startPoint, currentPoint } = drawingState
  if (!startPoint || !currentPoint) return null

  // Calculate distance in pixels
  const dx = currentPoint.x - startPoint.x
  const dy = currentPoint.y - startPoint.y
  const distanceInPixels = Math.sqrt(dx * dx + dy * dy)

  // Calculate distance in grid units
  const distanceInSquares = distanceInPixels / gridSize

  // D&D 5e distance calculation (5ft per square)
  // Diagonal movement: every other diagonal costs 10ft instead of 5ft
  const gridDx = Math.abs(Math.round(dx / gridSize))
  const gridDy = Math.abs(Math.round(dy / gridSize))
  const diagonals = Math.min(gridDx, gridDy)
  const straights = Math.abs(gridDx - gridDy)

  // D&D 5e optional rule: first diagonal is 5ft, second is 10ft, alternating
  const diagonalCost = Math.floor(diagonals / 2) * 15 + (diagonals % 2) * 5
  const straightCost = straights * 5
  const totalFeet = diagonalCost + straightCost

  // Calculate midpoint for label
  const midX = (startPoint.x + currentPoint.x) / 2
  const midY = (startPoint.y + currentPoint.y) / 2

  // Calculate angle for text rotation
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)
  const textAngle = Math.abs(angle) > 90 ? angle + 180 : angle

  return (
    <Group>
      {/* Main measuring line */}
      <Line
        points={[startPoint.x, startPoint.y, currentPoint.x, currentPoint.y]}
        stroke="#C9AD6A"
        strokeWidth={2}
        dash={[10, 5]}
        opacity={0.8}
      />

      {/* Start point marker */}
      <Circle
        x={startPoint.x}
        y={startPoint.y}
        radius={4}
        fill="#C9AD6A"
        stroke="#1A1A1A"
        strokeWidth={1}
      />

      {/* End point marker */}
      <Circle
        x={currentPoint.x}
        y={currentPoint.y}
        radius={4}
        fill="#C9AD6A"
        stroke="#1A1A1A"
        strokeWidth={1}
      />

      {/* Distance label background */}
      <Text
        x={midX}
        y={midY - 10}
        text={`${totalFeet} ft (${distanceInSquares.toFixed(1)} sq)`}
        fontSize={14}
        fontFamily="monospace"
        fill="#1A1A1A"
        stroke="#1A1A1A"
        strokeWidth={4}
        align="center"
        rotation={textAngle}
        offsetX={40}
      />

      {/* Distance label */}
      <Text
        x={midX}
        y={midY - 10}
        text={`${totalFeet} ft (${distanceInSquares.toFixed(1)} sq)`}
        fontSize={14}
        fontFamily="monospace"
        fill="#C9AD6A"
        align="center"
        rotation={textAngle}
        offsetX={40}
      />
    </Group>
  )
}

export default memo(MeasureTool)