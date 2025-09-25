/**
 * TokenInitiative Atom Component
 *
 * Initiative badge display with D&D styling.
 * Shows initiative order with gold border and clear typography.
 * Atomic design: 25-40 lines, initiative display focus.
 */

import React from 'react'
import { Circle, Text } from 'react-konva'

export interface TokenInitiativeProps {
  readonly value: number
  readonly x: number
  readonly y: number
  readonly tokenRadius: number
  readonly size?: number
}

export const TokenInitiative: React.FC<TokenInitiativeProps> = React.memo(({
  value,
  x,
  y,
  tokenRadius,
  size = 20
}) => {
  const radius = size / 2
  const badgeX = x + tokenRadius - radius + 2
  const badgeY = y - tokenRadius + radius - 2

  return (
    <>
      {/* Initiative background */}
      <Circle
        x={badgeX}
        y={badgeY}
        radius={radius}
        fill="#922610" // D&D red
        stroke="#C9AD6A" // D&D gold
        strokeWidth={2}
        perfectDrawEnabled={false}
      />

      {/* Initiative value */}
      <Text
        x={badgeX}
        y={badgeY}
        text={value.toString()}
        fontSize={size * 0.6}
        fontFamily="Arial, sans-serif"
        fontStyle="bold"
        fill="#FFFFFF"
        align="center"
        verticalAlign="middle"
        offsetX={value >= 10 ? size * 0.25 : size * 0.125}
        offsetY={size * 0.15}
        perfectDrawEnabled={false}
      />
    </>
  )
})