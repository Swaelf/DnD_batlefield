import { type FC, memo, useState, useEffect, useMemo } from 'react'
import { Circle } from 'react-konva'
import type { BaseSpellProps, AreaVariant } from '../types'
import { getAreaConfig } from '../variants'
import { getSpellVariant } from '../types'

export const AbstractArea: FC<BaseSpellProps> = memo(({
  spell,
  isAnimating,
  onAnimationComplete
}) => {
  const [progress, setProgress] = useState(0)

  const variant = useMemo(() => getSpellVariant(spell) as AreaVariant, [spell])
  const config = useMemo(() => getAreaConfig(variant), [variant])

  useEffect(() => {
    if (!isAnimating) return

    // For persistent spells, use a short fade-in (200ms) instead of spell.duration
    // This allows the spell to appear quickly while the persistent area remains
    const isPersistent = spell.persistDuration && spell.persistDuration > 0
    const duration = isPersistent ? 200 : (spell.duration || 500)
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
  }, [isAnimating, spell.duration, spell.persistDuration, onAnimationComplete])

  const effectRadius = spell.size || 40
  const areaOpacity = progress * 0.6

  return (
    <>
      {/* Outer fade effect */}
      <Circle
        x={spell.toPosition.x}
        y={spell.toPosition.y}
        radius={effectRadius * (1 + progress * 0.2)}
        fill={spell.color}
        opacity={areaOpacity * 0.3}
      />

      {/* Main area circle */}
      <Circle
        x={spell.toPosition.x}
        y={spell.toPosition.y}
        radius={effectRadius}
        fill={spell.color}
        opacity={areaOpacity}
        stroke={spell.color}
        strokeWidth={2}
      />

      {/* Inner core for darkness variant */}
      {variant === 'darkness' && (
        <Circle
          x={spell.toPosition.x}
          y={spell.toPosition.y}
          radius={effectRadius * 0.7}
          fill={config.coreColor}
          opacity={areaOpacity * 0.5}
        />
      )}
    </>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.spell.id === nextProps.spell.id &&
    prevProps.isAnimating === nextProps.isAnimating
  )
})

AbstractArea.displayName = 'AbstractArea'
