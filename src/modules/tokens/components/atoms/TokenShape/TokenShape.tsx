/**
 * TokenShape Atom Component
 *
 * Base geometric shape rendering for tokens (circle or square).
 * Handles visual styling with D&D theming and proper shadows.
 * Atomic design: 25-40 lines, single responsibility.
 */

import React from 'react'
import { Circle, Rect } from 'react-konva'
import type { TokenShape as ShapeType } from '../../../types'

export interface TokenShapeProps {
  readonly shape: ShapeType
  readonly x: number
  readonly y: number
  readonly size: number
  readonly color: string
  readonly opacity?: number
  readonly shadowEnabled?: boolean
}

export const TokenShape: React.FC<TokenShapeProps> = React.memo(({
  shape,
  x,
  y,
  size,
  color,
  opacity = 1,
  shadowEnabled = true
}) => {
  const radius = size / 2

  const shadowConfig = shadowEnabled ? {
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowBlur: 4,
    shadowOffset: { x: 2, y: 2 },
    shadowOpacity: 0.6
  } : {}

  if (shape === 'circle') {
    return (
      <Circle
        x={x}
        y={y}
        radius={radius}
        fill={color}
        opacity={opacity}
        perfectDrawEnabled={false}
        {...shadowConfig}
      />
    )
  }

  return (
    <Rect
      x={x - radius}
      y={y - radius}
      width={size}
      height={size}
      fill={color}
      opacity={opacity}
      perfectDrawEnabled={false}
      {...shadowConfig}
    />
  )
})