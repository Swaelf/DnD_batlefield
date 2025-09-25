/**
 * TokenAura Atom Component
 *
 * Effect aura rendering for spells and abilities.
 * Handles pulsing animation and layered behind token.
 * Atomic design: 25-40 lines, aura visualization focus.
 */

import React, { useRef, useEffect } from 'react'
import { Circle } from 'react-konva'

export interface TokenAuraProps {
  readonly x: number
  readonly y: number
  readonly radius: number
  readonly color: string
  readonly opacity?: number
  readonly animated?: boolean
  readonly pulseSpeed?: number
}

export const TokenAura: React.FC<TokenAuraProps> = React.memo(({
  x,
  y,
  radius,
  color,
  opacity = 0.3,
  animated = true,
  pulseSpeed = 0.02
}) => {
  const auraRef = useRef<any>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    if (!animated || !auraRef.current) return

    let phase = 0
    const animate = () => {
      phase += pulseSpeed
      const pulseOpacity = opacity * (0.7 + 0.3 * Math.sin(phase))

      if (auraRef.current) {
        auraRef.current.opacity(pulseOpacity)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animated, opacity, pulseSpeed])

  return (
    <Circle
      ref={auraRef}
      x={x}
      y={y}
      radius={radius}
      fill={color}
      opacity={opacity}
      perfectDrawEnabled={false}
    />
  )
})