import { memo, useMemo, useRef, useEffect, useState } from 'react'
import { Group, Arc, Line, Circle } from 'react-konva'
import Konva from 'konva'
import { EASING } from '@/lib/animation-effects'
import type { UnifiedAction } from '@/types/unifiedAction'
import type { Point } from '@/types/geometry'

type MeleeAnimationProps = {
  action: UnifiedAction
  onComplete?: () => void
}

const MeleeAnimationComponent = ({ action, onComplete }: MeleeAnimationProps) => {
  const slashRef = useRef<Konva.Arc>(null)
  const slashLinesRef = useRef<Konva.Line[]>([])
  const impactRef = useRef<Konva.Circle>(null)
  const startTimeRef = useRef<number>(Date.now())
  const rafRef = useRef<number | undefined>(undefined)

  const [progress, setProgress] = useState(0)

  // Parse positions and calculate parameters
  const params = useMemo(() => {
    const source = typeof action.source === 'object' && !Array.isArray(action.source)
      ? action.source as Point
      : { x: 0, y: 0 }

    const target = Array.isArray(action.target)
      ? { x: source.x + 50, y: source.y }
      : action.target as Point

    const targetPoint = target as Point
    const dx = targetPoint.x - source.x
    const dy = targetPoint.y - source.y
    const angle = Math.atan2(dy, dx) * 180 / Math.PI

    return {
      source,
      angle,
      duration: action.animation.duration || 600,
      color: action.animation.color || '#FFFFFF',
      size: action.animation.size || 30,
      dx,
      dy
    }
  }, [action])

  // Animation loop using RAF
  useEffect(() => {
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
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [params.duration, onComplete])

  // Swing animation rendering
  useEffect(() => {
    if (action.animation.type !== 'melee_swing') return

    const slash = slashRef.current
    const impact = impactRef.current
    if (!slash) return

    const easedProgress = EASING.easeOutCubic(progress)

    slash.angle(easedProgress * 90)
    slash.opacity(1 - progress * 0.5)
    slash.scaleX(1 + easedProgress * 0.3)
    slash.scaleY(1 + easedProgress * 0.3)

    if (progress > 0.7 && impact) {
      impact.visible(true)
      const flashProgress = (progress - 0.7) / 0.3
      impact.opacity((1 - flashProgress) * 0.8)
      impact.scaleX(1 + flashProgress * 3)
      impact.scaleY(1 + flashProgress * 3)
    }
  }, [progress, action.animation.type])

  // Slash animation rendering
  useEffect(() => {
    if (action.animation.type !== 'melee_slash') return

    const impact = impactRef.current
    const { angle, size, dx, dy } = params

    slashLinesRef.current.forEach((line, index) => {
      const delay = index * 0.05
      const lineProgress = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)))

      if (lineProgress > 0) {
        line.opacity(1 - lineProgress * 0.7)

        const slashLength = size * 2
        const offsetAngle = angle + (index - 1) * 15
        const radians = offsetAngle * Math.PI / 180
        const startX = Math.cos(radians) * slashLength * 0.2
        const startY = Math.sin(radians) * slashLength * 0.2
        const endX = Math.cos(radians) * slashLength * lineProgress
        const endY = Math.sin(radians) * slashLength * lineProgress

        line.points([startX, startY, endX, endY])
      }
    })

    if (progress > 0.5 && impact) {
      impact.visible(true)
      impact.x(dx * 0.7)
      impact.y(dy * 0.7)
      const flashProgress = (progress - 0.5) / 0.5
      impact.opacity((1 - flashProgress) * 0.8)
      impact.scaleX(1 + flashProgress * 4)
      impact.scaleY(1 + flashProgress * 4)
    }
  }, [progress, action.animation.type, params])

  const { source, angle, color, size } = params

  return (
    <Group x={source.x} y={source.y}>
      {action.animation.type === 'melee_swing' && (
        <Arc
          ref={slashRef}
          innerRadius={size}
          outerRadius={size * 2}
          angle={0}
          rotation={angle - 45}
          fill={color}
          opacity={0.7}
        />
      )}

      {action.animation.type === 'melee_slash' && (
        <>
          {[0, 1, 2].map((i) => (
            <Line
              key={i}
              ref={(ref) => {
                if (ref) slashLinesRef.current[i] = ref
              }}
              points={[0, 0, 0, 0]}
              stroke={color}
              strokeWidth={3 - i}
              lineCap="round"
              opacity={0}
              shadowColor={color}
              shadowBlur={10}
              shadowOpacity={0.5}
            />
          ))}
        </>
      )}

      <Circle
        ref={impactRef}
        radius={size * 0.5}
        fill={color}
        visible={false}
        opacity={0}
      />
    </Group>
  )
}

export const MeleeAnimation = memo(MeleeAnimationComponent)