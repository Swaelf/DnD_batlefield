import { memo, useRef, useEffect, useMemo, useState } from 'react'
import { Group, Circle, Star } from 'react-konva'
import Konva from 'konva'
import { EASING } from '@/lib/animation-effects'
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
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef(Date.now())
  const [progress, setProgress] = useState(0)

  // Parse animation parameters
  const params = useMemo(() => ({
    position: typeof action.target === 'object' && !Array.isArray(action.target)
      ? action.target as Point
      : typeof action.source === 'object'
        ? action.source as Point
        : { x: 0, y: 0 },
    duration: action.animation.duration || 800,
    color: action.animation.color || '#FFFF00',
    size: action.animation.size || 40,
    category: action.category
  }), [action])

  // RAF animation loop
  useEffect(() => {
    startTimeRef.current = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current
      const newProgress = Math.min(elapsed / params.duration, 1)
      setProgress(newProgress)

      if (newProgress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        onComplete?.()
      }
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [params.duration, onComplete])

  // Rendering logic
  useEffect(() => {
    const group = groupRef.current
    const burst = burstRef.current
    if (!group || !burst) return

    group.position(params.position)
    group.visible(true)

    // Create particles on mount
    if (particlesRef.current.length === 0) {
      const particleCount = 8
      for (let i = 0; i < particleCount; i++) {
        const particle = new Konva.Circle({
          x: 0,
          y: 0,
          radius: params.size * 0.1,
          fill: params.color,
          opacity: 0
        })
        group.add(particle)
        particlesRef.current[i] = particle
      }
    }

    // Three phases: expand (0-0.3), flash (0.3-0.5), fade (0.5-1)
    let scale = 1
    let opacity = 1
    let particleDistance = 0
    let burstColor = params.color

    if (progress < 0.3) {
      // Expand phase - ease out
      const expandProgress = EASING.easeOut(progress / 0.3)
      scale = expandProgress * 1.5
      opacity = expandProgress
      particleDistance = 0
    } else if (progress < 0.5) {
      // Flash phase - linear
      const flashProgress = (progress - 0.3) / 0.2
      scale = 1.5 + flashProgress * 0.5
      opacity = 1
      particleDistance = EASING.easeOutCubic(flashProgress) * params.size * 2
      burstColor = flashProgress < 0.5 ? 'white' : params.color
    } else {
      // Fade phase - ease in
      const fadeProgress = EASING.easeIn((progress - 0.5) / 0.5)
      scale = 2 - fadeProgress * 0.5
      opacity = 1 - fadeProgress
      particleDistance = params.size * 2 + fadeProgress * params.size
    }

    // Update burst
    burst.scaleX(scale)
    burst.scaleY(scale)
    burst.opacity(opacity * 0.8)
    burst.fill(burstColor)

    // Update rays
    const elapsed = Date.now() - startTimeRef.current
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
    const particleCount = particlesRef.current.length
    particlesRef.current.forEach((particle, i) => {
      if (particle) {
        const angle = (i / particleCount) * Math.PI * 2
        particle.x(Math.cos(angle) * particleDistance)
        particle.y(Math.sin(angle) * particleDistance)
        particle.opacity(opacity * 0.6)
        particle.scaleX(1 - progress * 0.5)
        particle.scaleY(1 - progress * 0.5)
      }
    })

    // Category-specific effects
    if (params.category === 'explosion') {
      const shake = (Math.random() - 0.5) * 5 * (1 - progress)
      group.x(params.position.x + shake)
      group.y(params.position.y + shake)
    } else if (params.category === 'holy') {
      burst.rotation(elapsed * 0.2)
    } else if (params.category === 'thunder' && Math.random() < 0.1) {
      burst.opacity(1)
      burst.fill('white')
    }

    if (progress >= 1) {
      group.visible(false)
    }
  }, [progress, params])

  return (
    <Group ref={groupRef} visible={false}>
      {/* Background rays */}
      {[...Array(3)].map((_, i) => (
        <Star
          key={`ray-${i}`}
          ref={el => { raysRef.current[i] = el }}
          numPoints={4}
          innerRadius={params.size * 0.3}
          outerRadius={params.size * 1.2}
          fill={params.color}
          opacity={0.3}
          rotation={i * 45}
        />
      ))}

      {/* Main burst */}
      <Circle
        ref={burstRef}
        radius={params.size}
        fill={params.color}
        opacity={0.8}
        shadowColor={params.color}
        shadowBlur={30}
        shadowOpacity={0.8}
      />

      {/* Center flash */}
      <Circle
        radius={params.size * 0.5}
        fill="white"
        opacity={0.6}
      />
    </Group>
  )
}

export const BurstAnimation = memo(BurstAnimationComponent)