/**
 * GridLine Atom - Individual grid line rendering component
 *
 * Renders a single grid line with proper styling and performance optimization.
 * Used by GridSystem molecule for complete grid composition.
 */

import React from 'react'
import { Line } from 'react-konva'
import type { Point } from '@/types/geometry'

export interface GridLineProps {
  readonly start: Point
  readonly end: Point
  readonly stroke: string
  readonly strokeWidth: number
  readonly opacity: number
  readonly isMajor: boolean
  readonly isDashed?: boolean
  readonly dashArray?: readonly number[]
}

export const GridLine: React.FC<GridLineProps> = React.memo(({
  start,
  end,
  stroke,
  strokeWidth,
  opacity,
  isMajor,
  isDashed = false,
  dashArray = [5, 5]
}) => {
  return (
    <Line
      points={[start.x, start.y, end.x, end.y]}
      stroke={stroke}
      strokeWidth={strokeWidth}
      opacity={opacity}
      dash={isDashed ? dashArray : undefined}
      perfectDrawEnabled={false}
      shadowForStrokeEnabled={false}
      hitStrokeWidth={0}
      listening={false}
    />
  )
})

GridLine.displayName = 'GridLine'