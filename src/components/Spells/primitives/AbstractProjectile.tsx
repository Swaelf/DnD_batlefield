import { type FC, memo, useState, useEffect, useMemo } from 'react'
import { Group, Circle, Star, RegularPolygon } from 'react-konva'
import type { BaseSpellProps, TrailPosition, ProjectileVariant } from '../types'
import { getProjectileConfig } from '../variants'
import { getSpellVariant } from '../types'

export const AbstractProjectile: FC<BaseSpellProps> = memo(({
  spell,
  isAnimating,
  onAnimationComplete
}) => {
  const [progress, setProgress] = useState(0)
  const [trailPositions, setTrailPositions] = useState<TrailPosition[]>([])

  // Get variant configuration
  const variant = useMemo(() => getSpellVariant(spell) as ProjectileVariant, [spell])
  const config = useMemo(() => getProjectileConfig(variant), [variant])

  // Animation logic
  useEffect(() => {
    if (!isAnimating) return

    const duration = spell.duration || 1000
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

  // Trail effect generation
  useEffect(() => {
    if (!isAnimating || progress === 0) return

    const dx = spell.toPosition.x - spell.fromPosition.x
    const dy = spell.toPosition.y - spell.fromPosition.y

    const newTrail: TrailPosition[] = []
    const trailCount = 15

    for (let i = 0; i < trailCount; i++) {
      const trailProgress = Math.max(0, progress - (i * 0.02))
      if (trailProgress === 0 && progress > 0.05) continue

      let x, y

      if (variant === 'magic-missile') {
        // Enhanced curved path for magic missile
        const baseHeight = spell.curveHeight || 50
        const spellId = spell.id || 'default'
        const seed1 = spellId.charCodeAt(0) % 100 / 100
        const seed2 = spellId.charCodeAt(Math.min(1, spellId.length - 1)) % 100 / 100
        const seed3 = spellId.charCodeAt(Math.min(2, spellId.length - 1)) % 100 / 100

        const heightVariation = (seed1 - 0.5) * 80
        const curveHeight = Math.max(20, baseHeight + heightVariation)

        let directionMultiplier = 1
        const directionSeed = seed2

        if (directionSeed < 0.33) {
          directionMultiplier = 1
        } else if (directionSeed < 0.66) {
          directionMultiplier = -1
        } else {
          const mirrorSeed = seed3
          directionMultiplier = mirrorSeed < 0.5 ? 1 : -1
        }

        const asymmetryFactor = (seed3 - 0.5) * 0.5
        const adjustedProgress = Math.max(0, Math.min(1, trailProgress + asymmetryFactor))
        const curveFactor = Math.sin(adjustedProgress * Math.PI) * curveHeight * directionMultiplier

        const baseX = spell.fromPosition.x + dx * trailProgress
        const baseY = spell.fromPosition.y + dy * trailProgress

        const length = Math.sqrt(dx * dx + dy * dy)
        const perpX = length > 0 ? -dy / length : 0
        const perpY = length > 0 ? dx / length : 0

        x = baseX + perpX * curveFactor
        y = baseY + perpY * curveFactor
      } else {
        x = spell.fromPosition.x + dx * trailProgress
        y = spell.fromPosition.y + dy * trailProgress
      }

      newTrail.unshift({ x, y, progress: 1 - (i / trailCount) })
    }

    setTrailPositions(newTrail)
  }, [progress, isAnimating, spell, variant])

  // Calculate current position
  const currentPosition = useMemo(() => {
    const dx = spell.toPosition.x - spell.fromPosition.x
    const dy = spell.toPosition.y - spell.fromPosition.y

    let x, y

    if (variant === 'magic-missile') {
      const baseHeight = spell.curveHeight || 50
      const spellId = spell.id || 'default'
      const seed1 = spellId.charCodeAt(0) % 100 / 100
      const seed2 = spellId.charCodeAt(Math.min(1, spellId.length - 1)) % 100 / 100
      const seed3 = spellId.charCodeAt(Math.min(2, spellId.length - 1)) % 100 / 100

      const heightVariation = (seed1 - 0.5) * 80
      const curveHeight = Math.max(20, baseHeight + heightVariation)

      let directionMultiplier = 1
      const directionSeed = seed2

      if (directionSeed < 0.33) {
        directionMultiplier = 1
      } else if (directionSeed < 0.66) {
        directionMultiplier = -1
      } else {
        const mirrorSeed = seed3
        directionMultiplier = mirrorSeed < 0.5 ? 1 : -1
      }

      const asymmetryFactor = (seed3 - 0.5) * 0.5
      const adjustedProgress = Math.max(0, Math.min(1, progress + asymmetryFactor))
      const curveFactor = Math.sin(adjustedProgress * Math.PI) * curveHeight * directionMultiplier

      const baseX = spell.fromPosition.x + dx * progress
      const baseY = spell.fromPosition.y + dy * progress

      const length = Math.sqrt(dx * dx + dy * dy)
      const perpX = length > 0 ? -dy / length : 0
      const perpY = length > 0 ? dx / length : 0

      x = baseX + perpX * curveFactor
      y = baseY + perpY * curveFactor
    } else {
      x = spell.fromPosition.x + dx * progress
      y = spell.fromPosition.y + dy * progress
    }

    return { x, y, angle: Math.atan2(dy, dx) }
  }, [progress, spell, variant])

  const baseRadius = spell.size || 20
  const opacity = 1 - progress * 0.5

  return (
    <>
      {/* Trail effect */}
      {trailPositions.map((pos, index) => {
        const trailRatio = pos.progress
        const trailSize = baseRadius * (0.2 + trailRatio * 0.8)

        if (config.trailStyle === 'fire') {
          return (
            <Group key={index}>
              <Circle
                x={pos.x}
                y={pos.y}
                radius={trailSize * 1.2}
                fill="#FF6B35"
                opacity={trailRatio * 0.3}
              />
              <Circle
                x={pos.x}
                y={pos.y}
                radius={trailSize}
                fill={spell.color}
                opacity={trailRatio * 0.5}
              />
            </Group>
          )
        } else {
          return (
            <Circle
              key={index}
              x={pos.x}
              y={pos.y}
              radius={trailSize}
              fill={spell.color}
              opacity={trailRatio * 0.6}
            />
          )
        }
      })}

      {/* Glow effect */}
      <Circle
        x={currentPosition.x}
        y={currentPosition.y}
        radius={baseRadius * 1.5}
        fill={spell.color}
        opacity={0.3 * config.glowIntensity}
      />

      {/* Main projectile body */}
      {config.projectileShape === 'star' ? (
        <Star
          x={currentPosition.x}
          y={currentPosition.y}
          numPoints={4}
          innerRadius={baseRadius * 0.5}
          outerRadius={baseRadius}
          fill={spell.color}
          opacity={opacity}
          rotation={progress * 360}
          shadowColor={spell.color}
          shadowBlur={baseRadius * 2}
          shadowOpacity={0.7}
        />
      ) : (
        <>
          <Circle
            x={currentPosition.x}
            y={currentPosition.y}
            radius={baseRadius}
            fill={spell.color}
            opacity={opacity}
            shadowColor={spell.color}
            shadowBlur={baseRadius * 2}
            shadowOpacity={0.6}
          />
          <Circle
            x={currentPosition.x}
            y={currentPosition.y}
            radius={baseRadius * 0.5}
            fill={config.coreColor}
            opacity={opacity * 0.8}
          />
        </>
      )}

      {/* Directional energy effect */}
      <RegularPolygon
        x={currentPosition.x - Math.cos(currentPosition.angle) * baseRadius * 0.8}
        y={currentPosition.y - Math.sin(currentPosition.angle) * baseRadius * 0.8}
        sides={3}
        radius={baseRadius * 0.7}
        fill={spell.color}
        opacity={opacity * 0.4}
        rotation={currentPosition.angle * 180 / Math.PI - 90}
      />

      {/* Front-facing point */}
      <Circle
        x={currentPosition.x + Math.cos(currentPosition.angle) * baseRadius}
        y={currentPosition.y + Math.sin(currentPosition.angle) * baseRadius}
        radius={baseRadius * 0.3}
        fill="#FFFFFF"
        opacity={opacity * 0.9}
      />
    </>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.spell.id === nextProps.spell.id &&
    prevProps.isAnimating === nextProps.isAnimating
  )
})

AbstractProjectile.displayName = 'AbstractProjectile'
