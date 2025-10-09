/**
 * UnifiedProjectile - Single projectile component for all spell projectiles
 *
 * Combines the best features from SimpleSpellComponent and AbstractProjectile:
 * - Motion path generators (linear, curved, arc, Magic Missile)
 * - Rich visual effects (trail, glow, pulse, particles)
 * - Multi-phase support (travel → burst → persist)
 * - Mutation system for transformations
 *
 * Replaces 800+ lines of scattered projectile code with unified, maintainable component.
 */

import { type FC, useEffect, useRef, useState } from 'react'
import { Group, Circle, Ring, RegularPolygon } from 'react-konva'
import type { SpellEventData } from '@/types/timeline'
import type { Position } from '@/types/map'
import { createLinearMotion, createMagicMissileCurve, seedFromSpellId } from '@/lib/animation-effects/motion'
import type { MotionPathGenerator } from '@/lib/animation-effects/motion/LinearMotion'
import useMapStore from '@/store/mapStore'

export interface UnifiedProjectileProps {
  spell: SpellEventData
  isAnimating: boolean
  onAnimationComplete?: () => void
}

interface TrailPosition {
  x: number
  y: number
  progress: number
}

/**
 * UnifiedProjectile Component
 *
 * Renders projectile spells with:
 * - Configurable motion paths (straight or curved)
 * - Trail effects with fade
 * - Glow and pulse effects
 * - Two-phase animation for projectile-burst (travel → burst)
 * - Target tracking support
 */
export const UnifiedProjectile: FC<UnifiedProjectileProps> = ({
  spell,
  isAnimating,
  onAnimationComplete
}) => {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [trailPositions, setTrailPositions] = useState<TrailPosition[]>([])
  const animationFrameRef = useRef<number>(0)
  const startTimeRef = useRef<number>(Date.now())
  const motionGeneratorRef = useRef<MotionPathGenerator | null>(null)
  const currentMap = useMapStore(state => state.currentMap)

  // Get current target position if tracking is enabled
  const getTargetPosition = (): Position => {
    if (spell.trackTarget && spell.targetTokenId && currentMap) {
      const targetToken = currentMap.objects.find(obj =>
        obj.id === spell.targetTokenId && obj.type === 'token'
      )
      if (targetToken) {
        return targetToken.position
      }
    }
    return spell.toPosition
  }

  // Create motion generator based on spell configuration
  const createMotionGenerator = (): MotionPathGenerator => {
    const target = getTargetPosition()

    console.log('[UnifiedProjectile] Creating motion generator:', {
      spellName: spell.spellName,
      curved: spell.curved,
      curveHeight: spell.curveHeight,
      curveDirection: spell.curveDirection,
      spellId: spell.id,
      from: spell.fromPosition,
      to: target
    })

    // Check if this spell uses curved path
    if (spell.curved) {
      // Generate stable seed from spell ID or create one from position/timestamp
      let seed: number
      if (spell.id) {
        seed = seedFromSpellId(spell.id)
      } else {
        // Fallback: create stable seed from position and timestamp
        const positionHash = Math.abs(spell.fromPosition.x + spell.fromPosition.y * 1000 + target.x * 100 + target.y * 10000)
        seed = (positionHash % 10000) / 10000
      }
      console.log('[UnifiedProjectile] Using Magic Missile curve with seed:', seed)
      return createMagicMissileCurve(spell.fromPosition, target, {
        baseHeight: spell.curveHeight,
        seed
      })
    }

    // Default to linear motion
    console.log('[UnifiedProjectile] Using linear motion')
    return createLinearMotion(spell.fromPosition, target)
  }

  // Initialize motion generator once when spell changes
  useEffect(() => {
    if (isAnimating) {
      motionGeneratorRef.current = createMotionGenerator()
      startTimeRef.current = Date.now() // Reset start time when spell changes
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spell.id]) // Only recreate when spell ID changes (new spell)

  useEffect(() => {
    console.log('[UnifiedProjectile] Animation effect triggered:', {
      isAnimating,
      isComplete,
      hasMotionGenerator: !!motionGeneratorRef.current
    })

    if (!isAnimating || isComplete) {
      console.log('[UnifiedProjectile] Animation effect BLOCKED:', { isAnimating, isComplete })
      return
    }

    // Use the stored motion generator
    const motionGenerator = motionGeneratorRef.current
    if (!motionGenerator) {
      console.log('[UnifiedProjectile] NO MOTION GENERATOR!')
      return
    }

    // Calculate total duration ONCE outside the animation loop
    let totalDuration = spell.duration || 1000
    const hasBurst = spell.category === 'projectile-burst' || (spell.category === 'projectile' && !!spell.burstRadius)

    if (hasBurst) {
      const burstDuration = spell.burstDuration || 600
      totalDuration = totalDuration + burstDuration
    }

    console.log('[UnifiedProjectile] Starting animation loop for:', spell.spellName, {
      isAnimating,
      isComplete,
      spellDuration: spell.duration,
      spellBurstDuration: spell.burstDuration,
      hasBurst,
      totalDuration
    })

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current
      const currentProgress = Math.min(elapsed / totalDuration, 1)

      setProgress(currentProgress)

      // Update trail positions
      const trailCount = 12
      const newTrailPositions: TrailPosition[] = []

      for (let i = 0; i < trailCount; i++) {
        const trailProgress = Math.max(0, currentProgress - (i * 0.02))
        if (trailProgress === 0 && currentProgress > 0.1) continue

        const position = motionGenerator(trailProgress)
        newTrailPositions.unshift({
          x: position.x,
          y: position.y,
          progress: 1 - (i / trailCount)
        })
      }

      setTrailPositions(newTrailPositions)

      if (currentProgress >= 1) {
        console.log('[UnifiedProjectile] Animation complete:', spell.spellName, 'spell.id:', spell.id)
        setIsComplete(true)
        onAnimationComplete?.()
        console.log('[UnifiedProjectile] onAnimationComplete called')
      } else {
        if (!document.hidden) {
          animationFrameRef.current = requestAnimationFrame(animate)
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnimating, isComplete, spell.duration, onAnimationComplete]) // Only use primitives to prevent restarts

  // Reset when animation should restart
  useEffect(() => {
    if (!isAnimating) {
      setProgress(0)
      setIsComplete(false)
      setTrailPositions([])
      startTimeRef.current = Date.now()
      motionGeneratorRef.current = null // Reset motion generator
    }
  }, [isAnimating])

  // Render projectile or burst based on category and progress
  const renderProjectile = () => {
    const baseRadius = spell.size || 20
    const opacity = 1 - progress * 0.5

    // For projectile-burst (or projectiles with burstRadius), split into two phases
    const shouldUseBurstPhase = spell.category === 'projectile-burst' || (spell.category === 'projectile' && !!spell.burstRadius)

    console.log('[UnifiedProjectile] Render check:', {
      spellName: spell.spellName,
      category: spell.category,
      hasBurstRadius: !!spell.burstRadius,
      burstRadius: spell.burstRadius,
      shouldUseBurstPhase,
      progress
    })

    if (shouldUseBurstPhase) {
      const projectilePhase = 0.7 // 70% travel, 30% burst

      console.log('[UnifiedProjectile] Burst phase check:', {
        progress,
        projectilePhase,
        inProjectilePhase: progress < projectilePhase,
        inBurstPhase: progress >= projectilePhase
      })

      if (progress < projectilePhase) {
        // Phase 1: Projectile travel
        console.log('[UnifiedProjectile] ✈️ Rendering PROJECTILE phase')
        const projectileProgress = progress / projectilePhase
        const motionGenerator = createMotionGenerator()
        const position = motionGenerator(projectileProgress)

        // Calculate angle for directional effect
        const target = getTargetPosition()
        const dx = target.x - spell.fromPosition.x
        const dy = target.y - spell.fromPosition.y
        const angle = Math.atan2(dy, dx)

        const isFireball = spell.spellName?.toLowerCase().includes('fireball')

        // Generate trail for burst phase
        const burstTrailPositions: TrailPosition[] = []
        const trailCount = 15

        for (let i = 0; i < trailCount; i++) {
          const trailProgress = Math.max(0, projectileProgress - (i * 0.025))
          if (trailProgress === 0 && projectileProgress > 0.1) continue

          const trailPos = motionGenerator(trailProgress)
          burstTrailPositions.unshift({
            x: trailPos.x,
            y: trailPos.y,
            progress: 1 - (i / trailCount)
          })
        }

        return (
          <>
            {/* Enhanced trail */}
            {burstTrailPositions.map((pos, index) => {
              const trailRatio = pos.progress
              const trailSize = baseRadius * (0.3 + trailRatio * 0.7)

              if (isFireball) {
                return (
                  <Group key={index}>
                    <Circle
                      x={pos.x}
                      y={pos.y}
                      radius={trailSize * 1.3}
                      fill="#FF8C00"
                      opacity={trailRatio * 0.4}
                    />
                    <Circle
                      x={pos.x}
                      y={pos.y}
                      radius={trailSize}
                      fill={spell.color}
                      opacity={trailRatio * 0.6}
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
                    opacity={trailRatio * 0.5}
                  />
                )
              }
            })}

            {/* Outer glow */}
            <Circle
              x={position.x}
              y={position.y}
              radius={baseRadius * 1.8}
              fill={spell.color}
              opacity={0.25}
            />

            {/* Main projectile */}
            <Circle
              x={position.x}
              y={position.y}
              radius={baseRadius}
              fill={spell.color}
              opacity={opacity}
              shadowColor={spell.color}
              shadowBlur={baseRadius * 2.5}
              shadowOpacity={0.7}
            />

            {/* Inner hot core */}
            <Circle
              x={position.x}
              y={position.y}
              radius={baseRadius * 0.6}
              fill={isFireball ? "#FFD700" : "#FFFFFF"}
              opacity={opacity * 0.9}
            />

            {/* Energy trail direction */}
            <RegularPolygon
              x={position.x - Math.cos(angle) * baseRadius}
              y={position.y - Math.sin(angle) * baseRadius}
              sides={3}
              radius={baseRadius * 0.8}
              fill={spell.color}
              opacity={opacity * 0.5}
              rotation={angle * 180 / Math.PI - 90}
            />

            {/* Leading edge highlight */}
            <Circle
              x={position.x + Math.cos(angle) * baseRadius * 0.8}
              y={position.y + Math.sin(angle) * baseRadius * 0.8}
              radius={baseRadius * 0.4}
              fill="#FFFFFF"
              opacity={opacity}
            />
          </>
        )
      } else {
        // Phase 2: Burst explosion
        console.log('[UnifiedProjectile] 💥 Rendering BURST phase')
        const burstProgress = (progress - projectilePhase) / (1 - projectilePhase)
        const maxBurstRadius = spell.burstRadius || baseRadius * 2
        const burstRadius = maxBurstRadius * (0.3 + burstProgress * 0.7)
        const burstOpacity = (1 - burstProgress) * 0.8
        const target = getTargetPosition()

        console.log('[UnifiedProjectile] Burst values:', {
          burstProgress,
          maxBurstRadius,
          burstRadius,
          burstOpacity,
          targetPos: target
        })

        return (
          <>
            {/* Explosion core */}
            <Circle
              x={target.x}
              y={target.y}
              radius={burstRadius}
              fill={spell.burstColor || spell.color}
              opacity={burstOpacity * 0.3}
            />

            {/* Explosion rings */}
            <Ring
              x={target.x}
              y={target.y}
              innerRadius={burstRadius * 0.5}
              outerRadius={burstRadius}
              fill={spell.burstColor || spell.color}
              opacity={burstOpacity * 0.5}
            />

            <Ring
              x={target.x}
              y={target.y}
              innerRadius={burstRadius * 0.8}
              outerRadius={burstRadius * 1.2}
              fill={spell.secondaryColor || spell.burstColor || spell.color}
              opacity={burstOpacity * 0.3}
            />
          </>
        )
      }
    }

    // Simple projectile (no burst)
    const motionGenerator = createMotionGenerator()
    const position = motionGenerator(progress)

    // Calculate angle for directional effect
    const target = getTargetPosition()
    const dx = target.x - spell.fromPosition.x
    const dy = target.y - spell.fromPosition.y
    const angle = Math.atan2(dy, dx)

    const isFireball = spell.spellName?.toLowerCase().includes('fireball')

    return (
      <>
        {/* Trail effect */}
        {trailPositions.map((pos, index) => {
          const trailRatio = pos.progress
          const trailSize = baseRadius * (0.2 + trailRatio * 0.8)

          if (isFireball) {
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
          x={position.x}
          y={position.y}
          radius={baseRadius * 1.5}
          fill={spell.color}
          opacity={0.3}
        />

        {/* Main projectile body */}
        <Circle
          x={position.x}
          y={position.y}
          radius={baseRadius}
          fill={spell.color}
          opacity={opacity}
          shadowColor={spell.color}
          shadowBlur={baseRadius * 2}
          shadowOpacity={0.6}
        />

        {/* Inner core */}
        <Circle
          x={position.x}
          y={position.y}
          radius={baseRadius * 0.5}
          fill="#FFFFFF"
          opacity={opacity * 0.8}
        />

        {/* Directional energy effect */}
        <RegularPolygon
          x={position.x - Math.cos(angle) * baseRadius * 0.8}
          y={position.y - Math.sin(angle) * baseRadius * 0.8}
          sides={3}
          radius={baseRadius * 0.7}
          fill={spell.color}
          opacity={opacity * 0.4}
          rotation={angle * 180 / Math.PI - 90}
        />

        {/* Front-facing point */}
        <Circle
          x={position.x + Math.cos(angle) * baseRadius}
          y={position.y + Math.sin(angle) * baseRadius}
          radius={baseRadius * 0.3}
          fill="#FFFFFF"
          opacity={opacity * 0.9}
        />
      </>
    )
  }

  if (!isAnimating || isComplete) {
    return null
  }

  return (
    <Group listening={false}>
      {renderProjectile()}
    </Group>
  )
}

UnifiedProjectile.displayName = 'UnifiedProjectile'
