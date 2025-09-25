/**
 * TokenLabel Atom Component
 *
 * Text label display for tokens with positioning and styling.
 * Handles text stroke for readability and D&D theming.
 * Atomic design: 25-40 lines, focused on text rendering.
 */

import React from 'react'
import { Text } from 'react-konva'
import type { LabelPosition } from '../../../types'

export interface TokenLabelProps {
  readonly text: string
  readonly x: number
  readonly y: number
  readonly tokenRadius: number
  readonly position: LabelPosition
  readonly color?: string
  readonly fontSize?: number
  readonly offset?: number
}

export const TokenLabel: React.FC<TokenLabelProps> = React.memo(({
  text,
  x,
  y,
  tokenRadius,
  position,
  color = '#FFFFFF',
  fontSize = 12,
  offset = 5
}) => {
  if (position === 'hidden' || !text.trim()) {
    return null
  }

  const labelY = position === 'top'
    ? y - tokenRadius - offset - fontSize / 2
    : y + tokenRadius + offset + fontSize / 2

  return (
    <Text
      x={x}
      y={labelY}
      text={text}
      fontSize={fontSize}
      fontFamily="Arial, sans-serif"
      fill={color}
      stroke="#000000"
      strokeWidth={1}
      align="center"
      verticalAlign="middle"
      offsetX={text.length * fontSize * 0.25} // Approximate text width centering
      perfectDrawEnabled={false}
    />
  )
})