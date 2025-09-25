/**
 * CameraBounds Atom - Viewport bounds visualization
 *
 * Renders visual indicators for camera/viewport boundaries,
 * visible area, and content bounds with optional styling.
 */

import React from 'react'
import { Rect, Group } from 'react-konva'
import type { Rectangle } from '@/types/geometry'

export interface CameraBoundsProps {
  readonly bounds: Rectangle
  readonly visibleBounds?: Rectangle
  readonly contentBounds?: Rectangle
  readonly stroke: string
  readonly strokeWidth: number
  readonly opacity: number
  readonly showVisibleArea?: boolean
  readonly showContentArea?: boolean
  readonly dashArray?: readonly number[]
}

export const CameraBounds: React.FC<CameraBoundsProps> = React.memo(({
  bounds,
  visibleBounds,
  contentBounds,
  stroke,
  strokeWidth,
  opacity,
  showVisibleArea = true,
  showContentArea = false,
  dashArray
}) => {
  return (
    <Group listening={false}>
      {/* Main camera bounds */}
      <Rect
        x={bounds.x}
        y={bounds.y}
        width={bounds.width}
        height={bounds.height}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
        dash={dashArray}
        fill="transparent"
        perfectDrawEnabled={false}
      />

      {/* Visible area bounds */}
      {showVisibleArea && visibleBounds && (
        <Rect
          x={visibleBounds.x}
          y={visibleBounds.y}
          width={visibleBounds.width}
          height={visibleBounds.height}
          stroke={stroke}
          strokeWidth={strokeWidth * 0.5}
          opacity={opacity * 0.7}
          fill="transparent"
          perfectDrawEnabled={false}
        />
      )}

      {/* Content area bounds */}
      {showContentArea && contentBounds && (
        <Rect
          x={contentBounds.x}
          y={contentBounds.y}
          width={contentBounds.width}
          height={contentBounds.height}
          stroke={stroke}
          strokeWidth={strokeWidth * 0.3}
          opacity={opacity * 0.5}
          dash={[2, 2]}
          fill="transparent"
          perfectDrawEnabled={false}
        />
      )}
    </Group>
  )
})

CameraBounds.displayName = 'CameraBounds'