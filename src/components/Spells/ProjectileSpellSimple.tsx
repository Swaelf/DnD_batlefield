import React, { useEffect, useRef, useState } from 'react'
import { Circle, Group, Line, RegularPolygon } from 'react-konva'
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
  const [position, setPosition] = useState(spell.fromPosition)
  const [showProjectile, setShowProjectile] = useState(true)
  const [showBurst, setShowBurst] = useState(false)
  const [burstScale, setBurstScale] = useState(0)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const startTimeRef = useRef<number | undefined>(undefined)
  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (!isAnimating || hasStartedRef.current) {
      return
    }

    hasStartedRef.current = true

    const dx = spell.toPosition.x - spell.fromPosition.x
    const dy = spell.toPosition.y - spell.fromPosition.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const speed = spell.projectileSpeed || 500
    const duration = (distance / speed) * 1000 // in milliseconds


    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Update projectile position
      const newX = spell.fromPosition.x + dx * progress
      const newY = spell.fromPosition.y + dy * progress


      setPosition({ x: newX, y: newY })

      if (progress >= 1) {
        // Projectile reached target
        setShowProjectile(false)

        // Show burst if needed
        if (spell.category === 'projectile-burst' && spell.burstRadius) {
          setShowBurst(true)
          animateBurst()
        } else {
          onAnimationComplete?.()
        }
      } else {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }

    const animateBurst = () => {
      const burstStartTime = performance.now()
      const burstDuration = 300 // 300ms for burst

      const burstAnimate = (timestamp: number) => {
        const elapsed = timestamp - burstStartTime
        const progress = Math.min(elapsed / burstDuration, 1)

        setBurstScale(progress)

        if (progress >= 1) {
          setShowBurst(false)
          onAnimationComplete?.()
        } else {
          animationFrameRef.current = requestAnimationFrame(burstAnimate)
        }
      }

      animationFrameRef.current = requestAnimationFrame(burstAnimate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      hasStartedRef.current = false
    }
  }, [isAnimating, spell, onAnimationComplete])

  const dx = spell.toPosition.x - spell.fromPosition.x
  const dy = spell.toPosition.y - spell.fromPosition.y
  const rotation = Math.atan2(dy, dx) * 180 / Math.PI

  // Ensure we have valid sizes
  const projectileSize = spell.size || 10
  const effectiveRadius = Math.max(projectileSize * 0.5, 5)


  return (
    <Group>

      {/* Trail line */}
      {showProjectile && spell.particleEffect !== false && (
        <Line
          points={[
            spell.fromPosition.x,
            spell.fromPosition.y,
            position.x,
            position.y
          ]}
          stroke={spell.color || '#FF6B6B'}
          strokeWidth={Math.max(projectileSize * 0.3, 2)}
          opacity={0.6}
          lineCap="round"
          shadowColor={spell.color || '#FF6B6B'}
          shadowBlur={projectileSize * 0.5}
        />
      )}


      {/* Projectile */}
      {showProjectile && (
        <Group x={position.x} y={position.y} rotation={rotation}>
          {/* Outer glow */}
          <Circle
            x={0}
            y={0}
            radius={effectiveRadius * 1.5}
            fill={spell.color || '#FF6B6B'}
            opacity={0.3}
            shadowColor={spell.color || '#FF6B6B'}
            shadowBlur={projectileSize * 2}
            shadowOpacity={0.8}
          />
          {/* Main projectile body */}
          <Circle
            x={0}
            y={0}
            radius={effectiveRadius}
            fill={spell.color || '#FF6B6B'}
            shadowColor={spell.color || '#FF6B6B'}
            shadowBlur={projectileSize}
            shadowOpacity={0.8}
          />
          {/* Inner core */}
          <Circle
            x={0}
            y={0}
            radius={effectiveRadius * 0.6}
            fill={spell.secondaryColor || '#ffffff'}
            opacity={0.9}
          />
          {/* Direction indicator */}
          <RegularPolygon
            x={effectiveRadius}
            y={0}
            sides={3}
            radius={effectiveRadius * 0.6}
            fill={spell.color || '#FF6B6B'}
            rotation={90}
            opacity={0.8}
          />
        </Group>
      )}

      {/* Burst effect */}
      {showBurst && spell.burstRadius && (
        <>
          {/* Outer burst ring */}
          <Circle
            x={spell.toPosition.x}
            y={spell.toPosition.y}
            radius={spell.burstRadius * burstScale}
            fill={spell.color || '#FF6B6B'}
            opacity={Math.max(0.1, 1 - burstScale * 0.8)}
            shadowColor={spell.color || '#FF6B6B'}
            shadowBlur={spell.burstRadius}
            shadowOpacity={0.6}
          />
          {/* Inner burst core */}
          <Circle
            x={spell.toPosition.x}
            y={spell.toPosition.y}
            radius={spell.burstRadius * burstScale * 0.5}
            fill={spell.secondaryColor || '#FFFF00'}
            opacity={Math.max(0.1, 1 - burstScale * 0.6)}
          />
        </>
      )}
    </Group>
  )
}