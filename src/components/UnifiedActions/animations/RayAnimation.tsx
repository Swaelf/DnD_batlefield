import { memo, useRef, useEffect, useMemo, useState } from 'react'
import { Group, Line, Circle } from 'react-konva'
import Konva from 'konva'
import { EASING } from '@/lib/animation-effects'
import type { UnifiedAction } from '@/types/unifiedAction'
import type { Point } from '@/types/geometry'

type RayAnimationProps = {
  action: UnifiedAction
  onComplete?: () => void
}

const RayAnimationComponent = ({ action, onComplete }: RayAnimationProps) => {
  const groupRef = useRef<Konva.Group>(null)
  const rayRef = useRef<Konva.Line>(null)
  const glowRef = useRef<Konva.Line>(null)
  const impactRef = useRef<Konva.Circle>(null)
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef(Date.now())
  const [progress, setProgress] = useState(0)

  // Parse animation parameters
  const params = useMemo(() => {
    const source = typeof action.source === 'object' && !Array.isArray(action.source)
      ? action.source as Point
      : { x: 0, y: 0 }

    const target = Array.isArray(action.target)
      ? { x: 100, y: 100 }
      : action.target as Point

    return {
      source,
      target,
      dx: target.x - source.x,
      dy: target.y - source.y,
      duration: action.animation.duration || 500,
      color: action.animation.color || '#00FFFF',
      width: action.animation.size || 5,
      category: action.category
    }
  }, [action])

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
    const ray = rayRef.current
    const glow = glowRef.current
    const impact = impactRef.current
    if (!group || !ray || !glow) return

    group.position({ x: 0, y: 0 })
    group.visible(true)

    // Three phases: extend (0-0.3), hold (0.3-0.7), fade (0.7-1)
    let rayProgress = 0
    let opacity = 1

    if (progress < 0.3) {
      rayProgress = EASING.easeOutCubic(progress / 0.3)
      opacity = 1
    } else if (progress < 0.7) {
      rayProgress = 1
      opacity = 1
    } else {
      rayProgress = 1
      opacity = EASING.easeIn(1 - (progress - 0.7) / 0.3)
    }

    // Calculate current ray end position
    const currentEndX = params.source.x + params.dx * rayProgress
    const currentEndY = params.source.y + params.dy * rayProgress

    // Lightning jitter effect
    let rayPoints: number[]
    if (params.category === 'lightning') {
      rayPoints = [params.source.x, params.source.y]
      const segments = 5
      for (let i = 1; i < segments; i++) {
        const t = i / segments
        const baseX = params.source.x + params.dx * t * rayProgress
        const baseY = params.source.y + params.dy * t * rayProgress
        const jitterX = (Math.random() - 0.5) * params.width * 2
        const jitterY = (Math.random() - 0.5) * params.width * 2
        rayPoints.push(baseX + jitterX, baseY + jitterY)
      }
      rayPoints.push(currentEndX, currentEndY)
    } else {
      rayPoints = [params.source.x, params.source.y, currentEndX, currentEndY]
    }

    // Pulsing effect
    const elapsed = Date.now() - startTimeRef.current
    const pulse = rayProgress > 0 ? Math.sin(elapsed * 0.01) * 0.3 + 1 : 1

    // Update ray
    ray.points(rayPoints)
    ray.opacity(opacity)
    ray.strokeWidth(params.width * pulse)

    // Update glow
    glow.points(rayPoints)
    glow.opacity(opacity * 0.3)
    glow.strokeWidth(params.width * 3 * pulse)

    // Update impact
    if (impact && rayProgress >= 1 && progress < 0.9) {
      impact.visible(true)
      impact.x(params.target.x)
      impact.y(params.target.y)
      const impactScale = 1 + (progress - 0.3) * 2
      impact.scaleX(impactScale)
      impact.scaleY(impactScale)
      impact.opacity(opacity * 0.5)
    }

    if (progress >= 1) {
      group.visible(false)
    }
  }, [progress, params])

  return (
    <Group ref={groupRef} visible={false}>
      {/* Glow effect */}
      <Line
        ref={glowRef}
        points={[0, 0, 0, 0]}
        stroke={params.color}
        strokeWidth={15}
        lineCap="round"
        opacity={0.3}
        shadowColor={params.color}
        shadowBlur={20}
        shadowOpacity={0.5}
      />

      {/* Main ray */}
      <Line
        ref={rayRef}
        points={[0, 0, 0, 0]}
        stroke={params.color}
        strokeWidth={5}
        lineCap="round"
        opacity={1}
        shadowColor={params.color}
        shadowBlur={10}
        shadowOpacity={0.8}
      />

      {/* Impact effect */}
      <Circle
        ref={impactRef}
        radius={20}
        fill={params.color}
        visible={false}
        opacity={0}
        shadowColor={params.color}
        shadowBlur={30}
        shadowOpacity={1}
      />
    </Group>
  )
}

export const RayAnimation = memo(RayAnimationComponent)