import React, { useEffect, useRef, useState } from 'react'
import { Circle, Group, Line, RegularPolygon, Path } from 'react-konva'
import Konva from 'konva'
import { SpellEventData } from '@/types/timeline'

type ProjectileSpellProps = {
  spell: SpellEventData
  isAnimating: boolean
  onAnimationComplete?: () => void
}

export const ProjectileSpell: React.FC<ProjectileSpellProps> = ({
  spell,
  isAnimating,
  onAnimationComplete
}) => {
  const projectileRef = useRef<Konva.Group>(null)
  const trailRef = useRef<Konva.Line>(null)
  const burstRef = useRef<Konva.Circle>(null)
  const persistentAreaRef = useRef<Konva.Circle>(null)
  const [animationState, setAnimationState] = useState<'projectile' | 'burst' | 'persist' | 'complete'>('projectile')
  const [projectilePos, setProjectilePos] = useState(spell.fromPosition)
  const [burstRadius, setBurstRadius] = useState(0)
  const [burstOpacity, setBurstOpacity] = useState(1)
  const [trailPoints, setTrailPoints] = useState<number[][]>([])
  const [trailOpacities, setTrailOpacities] = useState<number[]>([])
  const animationRef = useRef<Konva.Animation | null>(null)

  // Store curve parameters to use consistently
  const curveParamsRef = useRef<{intensity: number, direction: number} | null>(null)

  console.log('[ProjectileSpell] Mounted:', spell.spellName, 'category:', spell.category)

  useEffect(() => {
    if (!isAnimating) return

    // Calculate distance and angle
    let dx = spell.toPosition.x - spell.fromPosition.x
    let dy = spell.toPosition.y - spell.fromPosition.y
    let distance = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx)

    // Limit range if specified
    if (spell.range && distance > spell.range) {
      const ratio = spell.range / distance
      dx *= ratio
      dy *= ratio
      distance = spell.range
    }

    // Calculate actual target position (may be limited by range)
    const actualTarget = {
      x: spell.fromPosition.x + dx,
      y: spell.fromPosition.y + dy
    }

    // Calculate duration based on speed
    const speed = spell.projectileSpeed || 500 // pixels per second
    const duration = (distance / speed) * 1000 // Convert to milliseconds

    // Start animation with calculated parameters

    let startTime: number | null = null

    // Initialize curve parameters on first run
    if (!curveParamsRef.current) {
      curveParamsRef.current = {
        intensity: 40 + Math.random() * 30, // 40-70 pixels of curve for more visible effect
        direction: Math.random() > 0.5 ? 1 : -1 // Random curve direction
      }
      console.log('[ProjectileSpell] Curve params:', curveParamsRef.current)
    }

    const curveIntensity = curveParamsRef.current.intensity
    const curveDirection = curveParamsRef.current.direction

    // We need to wait a frame to ensure the component is mounted to the layer
    const timeoutId = setTimeout(() => {
      const layer = projectileRef.current?.getLayer()
      if (!layer) {
        return
      }

      // Create the animation using Konva.Animation with the layer
      const anim = new Konva.Animation((frame) => {
      if (!frame) return

      if (!startTime) {
        startTime = frame.time
      }

      const elapsed = frame.time - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Force layer redraw on each frame
      layer.batchDraw()

      if (animationState === 'projectile') {
        // Calculate curve control point (perpendicular to path)
        const midX = spell.fromPosition.x + dx * 0.5
        const midY = spell.fromPosition.y + dy * 0.5
        const perpX = (-dy / distance) * curveIntensity * curveDirection
        const perpY = (dx / distance) * curveIntensity * curveDirection

        // Quadratic bezier curve calculation
        const t = progress
        const oneMinusT = 1 - t

        // B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
        const currentX = oneMinusT * oneMinusT * spell.fromPosition.x +
                        2 * oneMinusT * t * (midX + perpX) +
                        t * t * actualTarget.x
        const currentY = oneMinusT * oneMinusT * spell.fromPosition.y +
                        2 * oneMinusT * t * (midY + perpY) +
                        t * t * actualTarget.y

        // Add slight wobble on top of the curve
        const wobbleAmplitude = 3
        const wobbleFrequency = 6
        const wobble = Math.sin(progress * Math.PI * wobbleFrequency) * wobbleAmplitude * (1 - progress)
        const wobblePerpX = -dy / distance * wobble
        const wobblePerpY = dx / distance * wobble

        setProjectilePos({ x: currentX + wobblePerpX, y: currentY + wobblePerpY })

        // Log curve position occasionally for debugging
        if (Math.floor(progress * 100) % 20 === 0) {
          console.log('[ProjectileSpell] Progress:', progress.toFixed(2), 'Pos:', { x: currentX.toFixed(0), y: currentY.toFixed(0) }, 'Control:', { perpX: perpX.toFixed(0), perpY: perpY.toFixed(0) })
        }

        // Update trail with multiple fading segments
        if (spell.particleEffect !== false) {
          const trailLength = 20 // Number of trail segments
          const newTrailPoints: number[][] = []
          const newOpacities: number[] = []

          for (let i = 0; i < trailLength; i++) {
            const trailProgress = Math.max(0, progress - (i * 0.02))
            if (trailProgress <= 0) break

            // Calculate position on curve for this trail segment
            const tt = trailProgress
            const oneMinusTT = 1 - tt

            const trailX = oneMinusTT * oneMinusTT * spell.fromPosition.x +
                          2 * oneMinusTT * tt * (midX + perpX) +
                          tt * tt * actualTarget.x
            const trailY = oneMinusTT * oneMinusTT * spell.fromPosition.y +
                          2 * oneMinusTT * tt * (midY + perpY) +
                          tt * tt * actualTarget.y

            // Add wobble to trail
            const trailWobble = Math.sin(trailProgress * Math.PI * wobbleFrequency) * wobbleAmplitude * (1 - trailProgress)
            const trailWobblePerpX = -dy / distance * trailWobble
            const trailWobblePerpY = dx / distance * trailWobble

            newTrailPoints.push([trailX + trailWobblePerpX, trailY + trailWobblePerpY])

            // Exponential fade for more dramatic trail effect
            const fadeRatio = i / trailLength
            const opacity = Math.max(0, (1 - fadeRatio * fadeRatio) * 0.8)
            newOpacities.push(opacity)
          }

          setTrailPoints(newTrailPoints)
          setTrailOpacities(newOpacities)
        }

        // Check if projectile reached target
        if (progress >= 1) {
          // Projectile reached target

          // If this is a burst spell, transition to burst
          if (spell.category === 'projectile-burst' && spell.burstRadius) {
            console.log('[ProjectileSpell] Transitioning to burst phase')
            setAnimationState('burst')
            startTime = frame.time // Reset timer for burst
          } else {
            // No burst, complete animation for single projectile
            console.log('[ProjectileSpell] No burst, completing')
            setAnimationState('complete')
            anim.stop()
            onAnimationComplete?.()
          }
        }
      } else if (animationState === 'burst') {
        // Animate burst expansion
        const burstElapsed = frame.time - startTime
        const burstDuration = 300 // 300ms for burst
        const burstProgress = Math.min(burstElapsed / burstDuration, 1)
        console.log('[ProjectileSpell] Burst progress:', burstProgress)

        const radius = Math.max(0, (spell.burstRadius || 30) * burstProgress)
        const opacity = 1 - burstProgress * 0.8

        setBurstRadius(radius)
        setBurstOpacity(opacity)

        if (burstProgress >= 1) {
          console.log('[ProjectileSpell] Burst animation complete')

          // Check if there's a persist duration (only for burst spells, not single projectiles)
          if (spell.category === 'projectile-burst' && spell.persistDuration && spell.persistDuration > 0) {
            console.log('[ProjectileSpell] Starting persist phase')
            setAnimationState('persist')
            startTime = frame.time // Reset timer for persist
          } else {
            setAnimationState('complete')
            anim.stop()
            onAnimationComplete?.()
          }
        }
      } else if (animationState === 'persist') {
        // Keep the area visible for the persist duration
        const persistElapsed = frame.time - startTime
        const persistDuration = (spell.persistDuration || 0) * 1000 // Convert seconds to ms

        if (persistElapsed >= persistDuration) {
          console.log('[ProjectileSpell] Persist phase complete')
          setAnimationState('complete')
          anim.stop()
          onAnimationComplete?.()
        }
      }
      }, layer) // Pass the layer to the animation

      animationRef.current = anim
      anim.start()
      // Animation started successfully
    }, 0) // Small delay to ensure mounting

    return () => {
      // Cleanup animation
      clearTimeout(timeoutId)
      if (animationRef.current) {
        animationRef.current.stop()
        animationRef.current = null
      }
    }
  }, [isAnimating, spell, animationState, onAnimationComplete])

  // Calculate rotation for projectile
  const deltaX = spell.toPosition.x - spell.fromPosition.x
  const deltaY = spell.toPosition.y - spell.fromPosition.y
  const rotation = Math.atan2(deltaY, deltaX) * 180 / Math.PI

  const hasTrail = spell.particleEffect !== false
  const hasBurst = spell.category === 'projectile-burst' && spell.burstRadius

  console.log('[ProjectileSpell] Render state:', animationState, 'hasBurst:', hasBurst)

  return (
    <Group>
      {/* Particle trail with fading segments */}
      {hasTrail && animationState === 'projectile' && trailPoints.length > 0 && (
        <Group>
          {trailPoints.map((point, i) => {
            const sizeRatio = 1 - (i / trailPoints.length) * 0.7
            return (
              <Circle
                key={i}
                x={point[0]}
                y={point[1]}
                radius={Math.max(0.5, spell.size * 0.4 * sizeRatio)}
                fill={spell.color}
                opacity={trailOpacities[i] || 0}
                shadowColor={spell.color}
                shadowBlur={spell.size * 0.2}
                shadowOpacity={trailOpacities[i] * 0.5 || 0}
              />
            )
          })}
        </Group>
      )}

      {/* Projectile */}
      {animationState === 'projectile' && (
        <Group
          ref={projectileRef}
          x={projectilePos.x}
          y={projectilePos.y}
          rotation={rotation}
        >
          {/* Main projectile body */}
          <Circle
            x={0}
            y={0}
            radius={Math.max(1, spell.size * 0.5)}
            fill={spell.color}
            shadowColor={spell.color}
            shadowBlur={spell.size}
            shadowOpacity={0.8}
          />

          {/* Energy core */}
          <Circle
            x={0}
            y={0}
            radius={Math.max(1, spell.size * 0.3)}
            fill={spell.secondaryColor || '#ffffff'}
            opacity={0.9}
          />

          {/* Directional point */}
          <RegularPolygon
            x={spell.size * 0.3}
            y={0}
            sides={3}
            radius={Math.max(1, spell.size * 0.3)}
            fill={spell.color}
            rotation={90}
            opacity={0.8}
          />
        </Group>
      )}

      {/* Burst effect */}
      {hasBurst && animationState === 'burst' && (
        <Circle
          ref={burstRef}
          x={actualTarget.x}
          y={actualTarget.y}
          radius={Math.max(1, burstRadius)}
          fill={spell.color}
          opacity={burstOpacity}
          shadowColor={spell.color}
          shadowBlur={spell.burstRadius! * 0.5}
        />
      )}

      {/* Persistent area after burst - only for projectile-burst */}
      {spell.category === 'projectile-burst' && hasBurst && animationState === 'persist' && spell.persistDuration && spell.persistDuration > 0 && (
        <Circle
          ref={persistentAreaRef}
          x={actualTarget.x}
          y={actualTarget.y}
          radius={Math.max(1, spell.burstRadius || 30)}
          fill={spell.color}
          opacity={0.3}
          stroke={spell.color}
          strokeWidth={2}
          strokeOpacity={0.5}
        />
      )}
    </Group>
  )
}