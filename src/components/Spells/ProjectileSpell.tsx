import React, { useEffect, useRef, useState } from 'react'
import { Circle, Group, Line, RegularPolygon } from 'react-konva'
import Konva from 'konva'
import { SpellEventData } from '@/types/timeline'

interface ProjectileSpellProps {
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
  const [animationState, setAnimationState] = useState<'projectile' | 'burst' | 'complete'>('projectile')
  const [projectilePos, setProjectilePos] = useState(spell.fromPosition)
  const [burstRadius, setBurstRadius] = useState(0)
  const [burstOpacity, setBurstOpacity] = useState(1)
  const animationRef = useRef<Konva.Animation | null>(null)

  console.log('ProjectileSpell component mounted:', {
    spellName: spell.spellName,
    isAnimating,
    from: spell.fromPosition,
    to: spell.toPosition,
    state: animationState
  })

  useEffect(() => {
    if (!isAnimating) {
      console.log('ProjectileSpell: Not animating, skipping effect')
      return
    }

    // Calculate distance and angle
    const dx = spell.toPosition.x - spell.fromPosition.x
    const dy = spell.toPosition.y - spell.fromPosition.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx)

    // Calculate duration based on speed
    const speed = spell.projectileSpeed || 500 // pixels per second
    const duration = (distance / speed) * 1000 // Convert to milliseconds

    console.log('ProjectileSpell: Starting animation', {
      distance,
      angle: angle * 180 / Math.PI,
      duration: duration + 'ms',
      speed
    })

    let startTime: number | null = null

    // We need to wait a frame to ensure the component is mounted to the layer
    const timeoutId = setTimeout(() => {
      const layer = projectileRef.current?.getLayer()
      if (!layer) {
        console.log('ProjectileSpell: No layer found, cannot animate')
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
        // Animate projectile movement
        const currentX = spell.fromPosition.x + (dx * progress)
        const currentY = spell.fromPosition.y + (dy * progress)

        setProjectilePos({ x: currentX, y: currentY })

        // Update trail if it exists
        if (trailRef.current && spell.particleEffect !== false) {
          trailRef.current.points([
            spell.fromPosition.x,
            spell.fromPosition.y,
            currentX,
            currentY
          ])
          trailRef.current.opacity(1 - progress * 0.5)
        }

        // Check if projectile reached target
        if (progress >= 1) {
          console.log('ProjectileSpell: Projectile reached target')

          // If this is a burst spell, transition to burst
          if (spell.category === 'projectile-burst' && spell.burstRadius) {
            setAnimationState('burst')
            startTime = frame.time // Reset timer for burst
          } else {
            // No burst, complete animation
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

        const radius = Math.max(0, (spell.burstRadius || 30) * burstProgress)
        const opacity = 1 - burstProgress * 0.8

        setBurstRadius(radius)
        setBurstOpacity(opacity)

        if (burstProgress >= 1) {
          console.log('ProjectileSpell: Burst complete')
          setAnimationState('complete')
          anim.stop()
          onAnimationComplete?.()
        }
      }
      }, layer) // Pass the layer to the animation

      animationRef.current = anim
      anim.start()
      console.log('ProjectileSpell: Animation started with layer')
    }, 0) // Small delay to ensure mounting

    return () => {
      console.log('ProjectileSpell: Cleanup')
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

  return (
    <Group>
      {/* Particle trail */}
      {hasTrail && animationState === 'projectile' && (
        <Line
          ref={trailRef}
          points={[spell.fromPosition.x, spell.fromPosition.y, spell.fromPosition.x, spell.fromPosition.y]}
          stroke={spell.color}
          strokeWidth={spell.size * 0.3}
          opacity={0.6}
          lineCap="round"
          shadowColor={spell.color}
          shadowBlur={spell.size * 0.5}
        />
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
          x={spell.toPosition.x}
          y={spell.toPosition.y}
          radius={burstRadius}
          fill={spell.color}
          opacity={burstOpacity}
          shadowColor={spell.color}
          shadowBlur={spell.burstRadius! * 0.5}
        />
      )}
    </Group>
  )
}