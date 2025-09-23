import { memo, useRef, useEffect } from 'react'
import { Group, Circle, Star, RegularPolygon } from 'react-konva'
import Konva from 'konva'
import type { UnifiedAction } from '@/types/unifiedAction'
import type { Point } from '@/types/geometry'

type BurstAnimationProps = {
  action: UnifiedAction
  onComplete?: () => void
}

const BurstAnimationComponent = ({ action, onComplete }: BurstAnimationProps) => {
  const groupRef = useRef<Konva.Group>(null)
  const burstRef = useRef<Konva.Circle>(null)
  const raysRef = useRef<(Konva.Star | null)[]>([])
  const particlesRef = useRef<(Konva.Circle | null)[]>([])
  const animationRef = useRef<Konva.Animation | null>(null)
  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (!groupRef.current || hasStartedRef.current) return
    hasStartedRef.current = true

    const group = groupRef.current
    const burst = burstRef.current

    if (!burst) return

    // Get burst position
    const position = typeof action.target === 'object' && !Array.isArray(action.target)
      ? action.target as Point
      : typeof action.source === 'object'
        ? action.source as Point
        : { x: 0, y: 0 }

    // Position group at burst center
    group.position(position)
    group.visible(true)

    const duration = action.animation.duration || 800
    const color = action.animation.color || '#FFFF00'
    const size = action.animation.size || 40

    // Create particles for extra effect
    const particles: Konva.Circle[] = []
    const particleCount = 8
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2
      const particle = new Konva.Circle({
        x: 0,
        y: 0,
        radius: size * 0.1,
        fill: color,
        opacity: 0
      })
      group.add(particle)
      particles.push(particle)
      particlesRef.current[i] = particle
    }

    const startTime = Date.now()

    const anim = new Konva.Animation((frame) => {
      if (!frame) return

      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Three phases: expand, flash, fade
      let scale = 1
      let opacity = 1
      let particleDistance = 0

      if (progress < 0.3) {
        // Expand phase
        const expandProgress = progress / 0.3
        scale = expandProgress * 1.5
        opacity = expandProgress
        particleDistance = 0
      } else if (progress < 0.5) {
        // Flash phase
        const flashProgress = (progress - 0.3) / 0.2
        scale = 1.5 + flashProgress * 0.5
        opacity = 1
        particleDistance = flashProgress * size * 2

        // Flash effect
        burst.fill(flashProgress < 0.5 ? 'white' : color)
      } else {
        // Fade phase
        const fadeProgress = (progress - 0.5) / 0.5
        scale = 2 - fadeProgress * 0.5
        opacity = 1 - fadeProgress
        particleDistance = size * 2 + fadeProgress * size

        burst.fill(color)
      }

      // Update main burst
      burst.scaleX(scale)
      burst.scaleY(scale)
      burst.opacity(opacity * 0.8)

      // Update rays
      raysRef.current.forEach((ray, i) => {
        if (ray) {
          const rayScale = scale * (1 + Math.sin(elapsed * 0.01 + i) * 0.1)
          ray.scaleX(rayScale)
          ray.scaleY(rayScale)
          ray.rotation(elapsed * 0.1 * (i % 2 === 0 ? 1 : -1))
          ray.opacity(opacity * 0.5)
        }
      })

      // Update particles
      particles.forEach((particle, i) => {
        const angle = (i / particleCount) * Math.PI * 2
        particle.x(Math.cos(angle) * particleDistance)
        particle.y(Math.sin(angle) * particleDistance)
        particle.opacity(opacity * 0.6)
        particle.scaleX(1 - progress * 0.5)
        particle.scaleY(1 - progress * 0.5)
      })

      // Category-specific effects
      if (action.category === 'explosion') {
        // Add shake effect
        const shake = (Math.random() - 0.5) * 5 * (1 - progress)
        group.x(position.x + shake)
        group.y(position.y + shake)
      } else if (action.category === 'holy') {
        // Add rotation for holy burst
        burst.rotation(elapsed * 0.2)
      } else if (action.category === 'thunder') {
        // Flash effect for thunder
        if (Math.random() < 0.1) {
          burst.opacity(1)
          burst.fill('white')
        }
      }

      if (progress >= 1) {
        anim.stop()
        group.visible(false)
        onComplete?.()
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

  const color = action.animation.color || '#FFFF00'
  const size = action.animation.size || 40

  return (
    <Group ref={groupRef} visible={false}>
      {/* Background rays */}
      {[...Array(3)].map((_, i) => (
        <Star
          key={`ray-${i}`}
          ref={el => { raysRef.current[i] = el }}
          numPoints={4}
          innerRadius={size * 0.3}
          outerRadius={size * 1.2}
          fill={color}
          opacity={0.3}
          rotation={i * 45}
        />
      ))}

      {/* Main burst */}
      <Circle
        ref={burstRef}
        radius={size}
        fill={color}
        opacity={0.8}
        shadowColor={color}
        shadowBlur={30}
        shadowOpacity={0.8}
      />

      {/* Center flash */}
      <Circle
        radius={size * 0.5}
        fill="white"
        opacity={0.6}
      />
    </Group>
  )
}

export const BurstAnimation = memo(BurstAnimationComponent)