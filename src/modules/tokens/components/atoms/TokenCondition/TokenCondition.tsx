/**
 * TokenCondition Atom Component
 *
 * Single D&D 5e condition indicator with icon and color coding.
 * Handles animation effects and proper grid positioning.
 * Atomic design: 25-40 lines, single condition focus.
 */

import React from 'react'
import { Circle, Text } from 'react-konva'
import type { ConditionType } from '../../../types'
import { getConditionVisual } from '../../../constants'

export interface TokenConditionProps {
  readonly condition: ConditionType
  readonly x: number
  readonly y: number
  readonly index: number
  readonly size?: number
  readonly animated?: boolean
}

export const TokenCondition: React.FC<TokenConditionProps> = React.memo(({
  condition,
  x,
  y,
  index,
  size = 12
}) => {
  const visual = getConditionVisual(condition)
  const radius = size / 2

  // Calculate position in grid layout (4 conditions per row)
  const gridX = (index % 4) * (size + 2)
  const gridY = Math.floor(index / 4) * (size + 2)
  const finalX = x + gridX - (size * 1.5) // Center the grid
  const finalY = y + gridY - radius

  const opacity = visual.opacity ?? 1

  return (
    <>
      {/* Condition background circle */}
      <Circle
        x={finalX}
        y={finalY}
        radius={radius}
        fill={visual.color}
        opacity={opacity}
        stroke="#FFFFFF"
        strokeWidth={1}
        perfectDrawEnabled={false}
      />

      {/* Condition icon (simplified as first letter) */}
      <Text
        x={finalX}
        y={finalY}
        text={visual.name.charAt(0).toUpperCase()}
        fontSize={size * 0.6}
        fontFamily="Arial, sans-serif"
        fill="#FFFFFF"
        align="center"
        verticalAlign="middle"
        offsetX={size * 0.15}
        offsetY={size * 0.15}
        perfectDrawEnabled={false}
      />
    </>
  )
})