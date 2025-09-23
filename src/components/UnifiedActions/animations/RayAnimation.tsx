import { memo, useRef, useEffect } from 'react'
import { Group, Line, Circle, Rect } from 'react-konva'
import Konva from 'konva'
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
  const animationRef = useRef<Konva.Animation | null>(null)
  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (!groupRef.current || hasStartedRef.current) return
    hasStartedRef.current = true

    const group = groupRef.current
    const ray = rayRef.current
    const glow = glowRef.current
    const impact = impactRef.current

    if (!ray || !glow) return

    // Parse positions
    const source = typeof action.source === 'object' ? action.source : { x: 0, y: 0 }
    const target = typeof action.target === 'object'
      ? action.target
      : Array.isArray(action.target) && action.target.length > 0
        ? { x: 100, y: 100 } // Default if targeting tokens
        : { x: 100, y: 100 }

    const targetPoint = target as Point

    // Calculate ray properties
    const dx = targetPoint.x - source.x
    const dy = targetPoint.y - source.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Set group position to source
    group.position({ x: 0, y: 0 })
    group.visible(true)

    const duration = action.animation.duration || 500
    const color = action.animation.color || '#00FFFF'
    const width = action.animation.size || 5

    const startTime = Date.now()

    const anim = new Konva.Animation((frame) => {
      if (!frame) return

      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Three phases: extend, hold, fade
      let rayProgress = 0
      let opacity = 1

      if (progress < 0.3) {
        // Extending phase
        rayProgress = progress / 0.3
        opacity = 1
      } else if (progress < 0.7) {
        // Hold phase
        rayProgress = 1
        opacity = 1
      } else {
        // Fade phase
        rayProgress = 1
        opacity = 1 - (progress - 0.7) / 0.3
      }

      // Update ray line
      const currentEndX = source.x + dx * rayProgress
      const currentEndY = source.y + dy * rayProgress
      ray.points([source.x, source.y, currentEndX, currentEndY])
      ray.opacity(opacity)
      ray.strokeWidth(width)

      // Update glow effect
      glow.points([source.x, source.y, currentEndX, currentEndY])
      glow.opacity(opacity * 0.3)
      glow.strokeWidth(width * 3)

      // Add energy effect along the ray
      if (rayProgress > 0) {
        // Pulsing effect
        const pulse = Math.sin(elapsed * 0.01) * 0.3 + 1
        ray.strokeWidth(width * pulse)
        glow.strokeWidth(width * 3 * pulse)
      }

      // Impact effect at the end
      if (impact && rayProgress >= 1 && progress < 0.9) {
        impact.visible(true)
        impact.x(targetPoint.x)
        impact.y(targetPoint.y)

        const impactScale = 1 + (progress - 0.3) * 2
        impact.scaleX(impactScale)
        impact.scaleY(impactScale)
        impact.opacity(opacity * 0.5)
      }

      // Lightning effect for certain categories
      if (action.category === 'lightning') {
        // Add jitter to make it look like lightning
        const jitterPoints: number[] = [source.x, source.y]
        const segments = 5
        for (let i = 1; i < segments; i++) {
          const t = i / segments
          const baseX = source.x + dx * t * rayProgress
          const baseY = source.y + dy * t * rayProgress
          const jitterX = (Math.random() - 0.5) * width * 2
          const jitterY = (Math.random() - 0.5) * width * 2
          jitterPoints.push(baseX + jitterX, baseY + jitterY)
        }
        jitterPoints.push(currentEndX, currentEndY)
        ray.points(jitterPoints)
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

  const color = action.animation.color || '#00FFFF'

  return (
    <Group ref={groupRef} visible={false}>
      {/* Glow effect (wider, semi-transparent) */}
      <Line
        ref={glowRef}
        points={[0, 0, 0, 0]}
        stroke={color}
        strokeWidth={15}
        lineCap="round"
        opacity={0.3}
        shadowColor={color}
        shadowBlur={20}
        shadowOpacity={0.5}
      />

      {/* Main ray */}
      <Line
        ref={rayRef}
        points={[0, 0, 0, 0]}
        stroke={color}
        strokeWidth={5}
        lineCap="round"
        opacity={1}
        shadowColor={color}
        shadowBlur={10}
        shadowOpacity={0.8}
      />

      {/* Impact effect */}
      <Circle
        ref={impactRef}
        radius={20}
        fill={color}
        visible={false}
        opacity={0}
        shadowColor={color}
        shadowBlur={30}
        shadowOpacity={1}
      />
    </Group>
  )
}

export const RayAnimation = memo(RayAnimationComponent)