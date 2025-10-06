import { type FC, memo, useState, useEffect } from 'react'
import { Circle, Ring } from 'react-konva'
import type { BaseSpellProps } from '../types'

export const AbstractBurst: FC<BaseSpellProps> = memo(({
  spell,
  isAnimating,
  onAnimationComplete
}) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isAnimating) return

    const duration = spell.duration || 600
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

  // Use burstRadius if available, otherwise use size
  const maxRadius = spell.burstRadius || spell.size || 20
  const burstRadius = maxRadius * (0.3 + progress * 0.7) // Expand from 30% to 100%
  const burstOpacity = spell.opacity !== undefined ? spell.opacity : ((1 - progress * 0.5) * 0.8)

  return (
    <>
      <Circle
        x={spell.toPosition.x}
        y={spell.toPosition.y}
        radius={burstRadius}
        fill={spell.color}
        opacity={burstOpacity * 0.3}
      />
      <Ring
        x={spell.toPosition.x}
        y={spell.toPosition.y}
        innerRadius={burstRadius * 0.7}
        outerRadius={burstRadius}
        fill={spell.color}
        opacity={burstOpacity}
      />
    </>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.spell.id === nextProps.spell.id &&
    prevProps.isAnimating === nextProps.isAnimating
  )
})

AbstractBurst.displayName = 'AbstractBurst'
