/**
 * TokenBorder Atom Component
 *
 * Selection and drag state border visualization.
 * Handles animated dash patterns and state-based styling.
 * Atomic design: 25-40 lines, border rendering focus.
 */

import React, { useRef, useEffect } from 'react'
import { Circle, Rect } from 'react-konva'
import type { TokenShape } from '../../../types'

export interface TokenBorderProps {
  readonly shape: TokenShape
  readonly x: number
  readonly y: number
  readonly size: number
  readonly isSelected?: boolean
  readonly isDragging?: boolean
  readonly borderColor?: string
  readonly borderWidth?: number
}

export const TokenBorder: React.FC<TokenBorderProps> = React.memo(({
  shape,
  x,
  y,
  size,
  isSelected = false,
  isDragging = false,
  borderColor = '#C9AD6A',
  borderWidth = 2
}) => {
  const borderRef = useRef<any>(null)
  const animationRef = useRef<number>(0)

  const radius = size / 2
  const strokeColor = isDragging ? '#FFD700' : borderColor
  const strokeWidth = (isSelected || isDragging) ? borderWidth + 1 : borderWidth

  // Animated dash pattern for selection
  useEffect(() => {
    if (!isSelected || !borderRef.current) return

    let dashOffset = 0
    const animate = () => {
      dashOffset -= 0.5
      if (borderRef.current) {
        borderRef.current.dashOffset(dashOffset)
      }
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isSelected])

  const dashPattern = isSelected ? [5, 5] : []

  if (shape === 'circle') {
    return (
      <Circle
        ref={borderRef}
        x={x}
        y={y}
        radius={radius}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        dash={dashPattern}
        perfectDrawEnabled={false}
      />
    )
  }

  return (
    <Rect
      ref={borderRef}
      x={x - radius}
      y={y - radius}
      width={size}
      height={size}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      dash={dashPattern}
      perfectDrawEnabled={false}
    />
  )
})