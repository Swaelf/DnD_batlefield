import { memo, useRef, useEffect } from 'react'
import { Group, Circle, RegularPolygon, Line } from 'react-konva'
import Konva from 'konva'
import type { UnifiedAction } from '@/types/unifiedAction'
import type { Point } from '@/types/geometry'

type ProjectileAnimationProps = {
  action: UnifiedAction
  onComplete?: () => void
}

const ProjectileAnimationComponent = ({ action, onComplete }: ProjectileAnimationProps) => {
  const groupRef = useRef<Konva.Group>(null)
  const projectileRef = useRef<Konva.Circle | Konva.RegularPolygon>(null)
  const trailRef = useRef<Konva.Line>(null)
  const animationRef = useRef<Konva.Animation | null>(null)
  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (!groupRef.current || hasStartedRef.current) return
    hasStartedRef.current = true

    const group = groupRef.current
    const projectile = projectileRef.current
    const trail = trailRef.current

    if (!projectile) return

    // Parse source and target positions
    const source = typeof action.source === 'object' && !Array.isArray(action.source)
      ? action.source as Point
      : { x: 0, y: 0 }

    // Parse target position
    const target = Array.isArray(action.target)
      ? { x: 100, y: 100 } // Default if targeting tokens
      : action.target as Point

    const targetPoint = target as Point

    // Calculate distance and angle
    const dx = targetPoint.x - source.x
    const dy = targetPoint.y - source.y
    // const distance = Math.sqrt(dx * dx + dy * dy) // Unused - may need for speed calc later
    const angle = Math.atan2(dy, dx)

    // Position at source
    group.position(source)
    group.visible(true)

    // Set initial projectile properties
    projectile.visible(true)
    // const size = action.animation.size || 10 // Unused - defined inline below

    // Configure trail if present
    const trailPoints: number[] = []
    const maxTrailLength = 5

    // Create animation
    const startTime = Date.now()
    const duration = action.animation.duration || 1000

    const anim = new Konva.Animation((frame) => {
      if (!frame) return

      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Calculate easing
      let easedProgress = progress
      switch (action.animation.easing) {
        case 'easeIn':
          easedProgress = progress * progress
          break
        case 'easeOut':
          easedProgress = 1 - (1 - progress) * (1 - progress)
          break
        case 'easeInOut':
          easedProgress = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2
          break
      }

      // Update projectile position
      const currentX = dx * easedProgress
      const currentY = dy * easedProgress
      projectile.x(currentX)
      projectile.y(currentY)

      // Update trail
      if (trail) {
        trailPoints.push(currentX, currentY)
        if (trailPoints.length > maxTrailLength * 2) {
          trailPoints.splice(0, 2)
        }
        trail.points([...trailPoints])
        trail.opacity(Math.max(0, 1 - progress * 0.5))
      }

      // Rotate projectile if it's an arrow/dart
      if (action.category === 'arrow' || action.category === 'dart') {
        projectile.rotation(angle * 180 / Math.PI)
      }

      // Add pulse effect
      const pulseScale = 1 + Math.sin(elapsed * 0.01) * 0.1
      projectile.scaleX(pulseScale)
      projectile.scaleY(pulseScale)

      // Check if complete
      if (progress >= 1) {
        anim.stop()

        // Fade out effect
        projectile.to({
          opacity: 0,
          scaleX: 2,
          scaleY: 2,
          duration: 0.2,
          onFinish: () => {
            group.visible(false)
            onComplete?.()
          }
        })
      }
    })

    animationRef.current = anim
    anim.start()

    return () => {
      if (animationRef.current) {
        animationRef.current.stop()
        animationRef.current = null
      }
    }
  }, [action, onComplete])

  const renderProjectileShape = () => {
    const size = action.animation.size || 10
    const color = action.animation.color || '#FF0000'

    // Different shapes based on category
    switch (action.category) {
      case 'arrow':
      case 'dart':
        // Arrow shape (triangle)
        return (
          <RegularPolygon
            ref={projectileRef as any}
            sides={3}
            radius={size}
            fill={color}
            opacity={0.9}
            shadowColor={color}
            shadowBlur={10}
            shadowOpacity={0.5}
          />
        )

      case 'magic_missile':
        // Glowing orb with star
        return (
          <>
            <Circle
              ref={projectileRef as any}
              radius={size}
              fill={color}
              opacity={0.8}
              shadowColor={color}
              shadowBlur={20}
              shadowOpacity={0.8}
            />
            <RegularPolygon
              sides={4}
              radius={size * 0.6}
              fill="white"
              opacity={0.9}
              rotation={45}
            />
          </>
        )

      case 'eldritch_blast':
        // Crackling energy
        return (
          <Circle
            ref={projectileRef as any}
            radius={size}
            fill={color}
            opacity={0.9}
            shadowColor={color}
            shadowBlur={30}
            shadowOpacity={1}
            stroke="purple"
            strokeWidth={2}
          />
        )

      default:
        // Default projectile (circle)
        return (
          <Circle
            ref={projectileRef as any}
            radius={size}
            fill={color}
            opacity={0.9}
            shadowColor={color}
            shadowBlur={15}
            shadowOpacity={0.6}
          />
        )
    }
  }

  return (
    <Group ref={groupRef} visible={false}>
      {/* Trail effect */}
      <Line
        ref={trailRef}
        points={[]}
        stroke={action.animation.color || '#FF0000'}
        strokeWidth={3}
        lineCap="round"
        lineJoin="round"
        opacity={0.5}
        shadowColor={action.animation.color || '#FF0000'}
        shadowBlur={5}
      />

      {/* Projectile */}
      {renderProjectileShape()}
    </Group>
  )
}

export const ProjectileAnimation = memo(ProjectileAnimationComponent)