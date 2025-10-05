import { type FC, memo, useState, useEffect } from 'react'
import { Line, Circle } from 'react-konva'
import type { BaseSpellProps } from '../types'

export const AbstractRay: FC<BaseSpellProps> = memo(({
  spell,
  isAnimating,
  onAnimationComplete
}) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isAnimating) return

    const duration = spell.duration || 800
    const startTime = Date.now()
    let animationFrameId: number

    const animate = () => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min(elapsed / duration, 1)

      setProgress(newProgress)

      if (newProgress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      } else {
        onAnimationComplete?.()
      }
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [isAnimating, spell.duration, onAnimationComplete])

  const baseRadius = spell.size || 20
  const rayProgress = Math.min(progress * 2, 1)
  const rayOpacity = 1 - (progress * 0.3)

  const rayDx = spell.toPosition.x - spell.fromPosition.x
  const rayDy = spell.toPosition.y - spell.fromPosition.y
  const rayAngle = Math.atan2(rayDy, rayDx)
  const perpAngle = rayAngle + Math.PI / 2

  const sourceWidth = baseRadius * 0.3
  const targetWidth = baseRadius * 1.5

  const sourceOffset1 = {
    x: spell.fromPosition.x + Math.cos(perpAngle) * sourceWidth,
    y: spell.fromPosition.y + Math.sin(perpAngle) * sourceWidth
  }
  const sourceOffset2 = {
    x: spell.fromPosition.x - Math.cos(perpAngle) * sourceWidth,
    y: spell.fromPosition.y - Math.sin(perpAngle) * sourceWidth
  }
  const targetOffset1 = {
    x: spell.toPosition.x + Math.cos(perpAngle) * targetWidth,
    y: spell.toPosition.y + Math.sin(perpAngle) * targetWidth
  }
  const targetOffset2 = {
    x: spell.toPosition.x - Math.cos(perpAngle) * targetWidth,
    y: spell.toPosition.y - Math.sin(perpAngle) * targetWidth
  }

  const beamPoints = [
    sourceOffset1.x, sourceOffset1.y,
    targetOffset1.x, targetOffset1.y,
    targetOffset2.x, targetOffset2.y,
    sourceOffset2.x, sourceOffset2.y
  ]

  return (
    <>
      {/* Main beam */}
      <Line
        points={beamPoints}
        closed={true}
        fill={spell.color}
        opacity={rayOpacity * 0.6 * rayProgress}
        shadowColor={spell.color}
        shadowBlur={20}
        shadowOpacity={0.8}
      />

      {/* Bright center line */}
      <Line
        points={[
          spell.fromPosition.x,
          spell.fromPosition.y,
          spell.fromPosition.x + rayDx * rayProgress,
          spell.fromPosition.y + rayDy * rayProgress
        ]}
        stroke={spell.color}
        strokeWidth={baseRadius * 0.5}
        opacity={rayOpacity * rayProgress}
        shadowColor={spell.color}
        shadowBlur={baseRadius * 2}
        shadowOpacity={0.9}
        lineCap="round"
      />

      {/* Inner bright core */}
      <Line
        points={[
          spell.fromPosition.x,
          spell.fromPosition.y,
          spell.fromPosition.x + rayDx * rayProgress,
          spell.fromPosition.y + rayDy * rayProgress
        ]}
        stroke="#FFFFFF"
        strokeWidth={baseRadius * 0.2}
        opacity={rayOpacity * 0.9 * rayProgress}
        lineCap="round"
      />

      {/* Origin flash */}
      <Circle
        x={spell.fromPosition.x}
        y={spell.fromPosition.y}
        radius={sourceWidth * 2}
        fill={spell.color}
        opacity={rayOpacity * 0.8 * rayProgress}
      />

      {/* Impact point */}
      <Circle
        x={spell.toPosition.x}
        y={spell.toPosition.y}
        radius={targetWidth * 1.5 * rayProgress}
        fill={spell.color}
        opacity={rayOpacity * 0.4 * rayProgress}
      />

      {/* Impact core */}
      <Circle
        x={spell.toPosition.x}
        y={spell.toPosition.y}
        radius={targetWidth * rayProgress}
        fill="#FFFFFF"
        opacity={rayOpacity * 0.7 * rayProgress}
      />
    </>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.spell.id === nextProps.spell.id &&
    prevProps.isAnimating === nextProps.isAnimating
  )
})

AbstractRay.displayName = 'AbstractRay'
