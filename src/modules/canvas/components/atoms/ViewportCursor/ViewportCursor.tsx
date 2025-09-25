/**
 * ViewportCursor Atom - Custom cursor rendering for canvas tools
 *
 * Renders custom cursors that follow the mouse pointer for different
 * canvas tools with proper styling and visual feedback.
 */

import React from 'react'
import { Circle, Group, Line } from 'react-konva'
import type { Point } from '@/types/geometry'
import type { CanvasCursorType } from '../../types'

export interface ViewportCursorProps {
  readonly type: CanvasCursorType
  readonly position: Point
  readonly size: number
  readonly color: string
  readonly opacity: number
  readonly isVisible: boolean
  readonly snapToGrid?: boolean
  readonly gridSize?: number
}

export const ViewportCursor: React.FC<ViewportCursorProps> = React.memo(({
  type,
  position,
  size,
  color,
  opacity,
  isVisible,
  snapToGrid = false,
  gridSize = 50
}) => {
  if (!isVisible) return null

  const snappedPosition = snapToGrid && gridSize > 0
    ? {
        x: Math.round(position.x / gridSize) * gridSize,
        y: Math.round(position.y / gridSize) * gridSize
      }
    : position

  const renderCursor = () => {
    switch (type) {
      case 'crosshair':
        return (
          <Group x={snappedPosition.x} y={snappedPosition.y}>
            <Line
              points={[-size, 0, size, 0]}
              stroke={color}
              strokeWidth={1}
              opacity={opacity}
            />
            <Line
              points={[0, -size, 0, size]}
              stroke={color}
              strokeWidth={1}
              opacity={opacity}
            />
          </Group>
        )

      case 'draw':
        return (
          <Circle
            x={snappedPosition.x}
            y={snappedPosition.y}
            radius={size / 2}
            stroke={color}
            strokeWidth={2}
            opacity={opacity}
            fill="transparent"
          />
        )

      case 'erase':
        return (
          <Group x={snappedPosition.x} y={snappedPosition.y}>
            <Circle
              radius={size / 2}
              stroke={color}
              strokeWidth={2}
              opacity={opacity}
              fill="transparent"
            />
            <Line
              points={[-size/3, -size/3, size/3, size/3]}
              stroke={color}
              strokeWidth={2}
              opacity={opacity}
            />
            <Line
              points={[-size/3, size/3, size/3, -size/3]}
              stroke={color}
              strokeWidth={2}
              opacity={opacity}
            />
          </Group>
        )

      case 'zoom-in':
        return (
          <Group x={snappedPosition.x} y={snappedPosition.y}>
            <Circle
              radius={size / 2}
              stroke={color}
              strokeWidth={2}
              opacity={opacity}
              fill="transparent"
            />
            <Line
              points={[-size/4, 0, size/4, 0]}
              stroke={color}
              strokeWidth={2}
              opacity={opacity}
            />
            <Line
              points={[0, -size/4, 0, size/4]}
              stroke={color}
              strokeWidth={2}
              opacity={opacity}
            />
          </Group>
        )

      case 'zoom-out':
        return (
          <Group x={snappedPosition.x} y={snappedPosition.y}>
            <Circle
              radius={size / 2}
              stroke={color}
              strokeWidth={2}
              opacity={opacity}
              fill="transparent"
            />
            <Line
              points={[-size/4, 0, size/4, 0]}
              stroke={color}
              strokeWidth={2}
              opacity={opacity}
            />
          </Group>
        )

      default:
        return (
          <Circle
            x={snappedPosition.x}
            y={snappedPosition.y}
            radius={2}
            fill={color}
            opacity={opacity}
          />
        )
    }
  }

  return (
    <Group listening={false}>
      {renderCursor()}
      {snapToGrid && (
        <Circle
          x={snappedPosition.x}
          y={snappedPosition.y}
          radius={3}
          fill={color}
          opacity={opacity * 0.5}
        />
      )}
    </Group>
  )
})

ViewportCursor.displayName = 'ViewportCursor'