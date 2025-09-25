/**
 * TokenVisuals Molecule Component
 *
 * Combines TokenShape and TokenBorder for complete visual rendering.
 * Handles layering, selection states, and visual composition.
 * Molecular design: 60-90 lines, visual composition focus.
 */

import React from 'react'
import { Group } from 'react-konva'
import { TokenShape, TokenBorder, TokenAura } from '../../atoms'
import type { Token } from '../../../types'

export interface TokenVisualsProps {
  readonly token: Token
  readonly gridSize: number
  readonly isSelected?: boolean
  readonly isDragging?: boolean
  readonly isHovered?: boolean
  readonly aura?: {
    readonly radius: number
    readonly color: string
    readonly animated?: boolean
  }
}

export const TokenVisuals: React.FC<TokenVisualsProps> = React.memo(({
  token,
  gridSize,
  isSelected = false,
  isDragging = false,
  isHovered = false,
  aura
}) => {
  const { position, size, shape, color, opacity, borderColor, borderWidth } = token

  // Calculate token size in pixels
  const sizeData = React.useMemo(() => {
    const gridSquares = size === 'tiny' ? 0.5 :
                      size === 'small' || size === 'medium' ? 1 :
                      size === 'large' ? 2 :
                      size === 'huge' ? 3 : 4 // gargantuan

    const diameter = gridSquares * gridSize
    const radius = diameter / 2

    return { diameter, radius, gridSquares }
  }, [size, gridSize])

  // Determine visual states
  const finalOpacity = isDragging ? opacity * 0.7 : opacity
  const showBorder = isSelected || isDragging || isHovered || borderColor
  const showAura = aura && aura.radius > 0

  return (
    <Group>
      {/* Aura layer (behind token) */}
      {showAura && (
        <TokenAura
          x={position.x}
          y={position.y}
          radius={aura.radius}
          color={aura.color}
          animated={aura.animated}
        />
      )}

      {/* Main token shape */}
      <TokenShape
        shape={shape}
        x={position.x}
        y={position.y}
        size={sizeData.diameter}
        color={color}
        opacity={finalOpacity}
        shadowEnabled={!isDragging}
      />

      {/* Border overlay */}
      {showBorder && (
        <TokenBorder
          shape={shape}
          x={position.x}
          y={position.y}
          size={sizeData.diameter}
          isSelected={isSelected}
          isDragging={isDragging}
          borderColor={borderColor}
          borderWidth={borderWidth}
        />
      )}

      {/* Hover glow effect */}
      {isHovered && !isSelected && (
        <TokenShape
          shape={shape}
          x={position.x}
          y={position.y}
          size={sizeData.diameter + 4}
          color="#FFFFFF"
          opacity={0.2}
          shadowEnabled={false}
        />
      )}
    </Group>
  )
})