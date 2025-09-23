import { memo, useRef, useEffect } from 'react'
import { Group, Arc, Line, Path, Circle } from 'react-konva'
import Konva from 'konva'
import type { UnifiedAction } from '@/types/unifiedAction'
import type { Point } from '@/types/geometry'

type MeleeAnimationProps = {
  action: UnifiedAction
  onComplete?: () => void
}

const MeleeAnimationComponent = ({ action, onComplete }: MeleeAnimationProps) => {
  const groupRef = useRef<Konva.Group>(null)
  const slashRef = useRef<Konva.Arc | null>(null)
  const impactRef = useRef<Konva.Circle | null>(null)
  const animationRef = useRef<Konva.Animation | null>(null)
  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (!groupRef.current || hasStartedRef.current) return
    hasStartedRef.current = true

    const group = groupRef.current
    const slash = slashRef.current
    const impact = impactRef.current

    // Parse source position
    const source = typeof action.source === 'object' ? action.source : { x: 0, y: 0 }
    const target = typeof action.target === 'object'
      ? action.target
      : Array.isArray(action.target) && action.target.length > 0
        ? { x: source.x + 50, y: source.y } // Default offset for token target
        : { x: source.x + 50, y: source.y }

    const targetPoint = target as Point

    // Calculate angle to target
    const dx = targetPoint.x - source.x
    const dy = targetPoint.y - source.y
    const angle = Math.atan2(dy, dx) * 180 / Math.PI

    // Position at source
    group.position(source)
    group.visible(true)

    const duration = action.animation.duration || 600
    const color = action.animation.color || '#FFFFFF'
    const size = action.animation.size || 30

    // Create animation based on type
    if (action.animation.type === 'melee_swing' && slash) {
      // Swing animation (arc)
      slash.visible(true)
      slash.rotation(angle - 45) // Offset for swing arc

      const startTime = Date.now()

      const anim = new Konva.Animation((frame) => {
        if (!frame) return

        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Eased progress for smooth animation
        const easedProgress = 1 - Math.pow(1 - progress, 3)

        // Animate the arc sweep
        slash.angle(easedProgress * 90) // Sweep 90 degrees
        slash.opacity(1 - progress * 0.5) // Fade out

        // Scale effect
        const scale = 1 + easedProgress * 0.3
        slash.scaleX(scale)
        slash.scaleY(scale)

        // Add impact flash at end
        if (progress > 0.7 && impact) {
          impact.visible(true)
          impact.opacity((1 - progress) * 3)
          impact.scaleX(1 + (progress - 0.7) * 3)
          impact.scaleY(1 + (progress - 0.7) * 3)
        }

        if (progress >= 1) {
          anim.stop()
          group.visible(false)
          onComplete?.()
        }
      })

      animationRef.current = anim
      anim.start()

    } else {
      // Slash animation (straight lines)
      const slashLines: Konva.Line[] = []
      const slashGroup = new Konva.Group()
      group.add(slashGroup)

      // Create multiple slash lines for effect
      for (let i = 0; i < 3; i++) {
        const line = new Konva.Line({
          points: [0, 0, 0, 0],
          stroke: color,
          strokeWidth: 3 - i,
          lineCap: 'round',
          opacity: 0,
          shadowColor: color,
          shadowBlur: 10,
          shadowOpacity: 0.5
        })
        slashGroup.add(line)
        slashLines.push(line)
      }

      const startTime = Date.now()

      const anim = new Konva.Animation((frame) => {
        if (!frame) return

        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Create slash effect
        slashLines.forEach((line, index) => {
          const delay = index * 0.05
          const lineProgress = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)))

          if (lineProgress > 0) {
            line.opacity(1 - lineProgress * 0.7)

            // Calculate slash endpoints
            const slashLength = size * 2
            const offsetAngle = angle + (index - 1) * 15 // Spread the slashes
            const startX = Math.cos(offsetAngle * Math.PI / 180) * slashLength * 0.2
            const startY = Math.sin(offsetAngle * Math.PI / 180) * slashLength * 0.2
            const endX = Math.cos(offsetAngle * Math.PI / 180) * slashLength * lineProgress
            const endY = Math.sin(offsetAngle * Math.PI / 180) * slashLength * lineProgress

            line.points([startX, startY, endX, endY])
          }
        })

        // Add impact effect
        if (progress > 0.5 && impact) {
          impact.visible(true)
          impact.x(dx * 0.7)
          impact.y(dy * 0.7)
          impact.opacity((1 - progress) * 2)
          impact.scaleX(1 + (progress - 0.5) * 4)
          impact.scaleY(1 + (progress - 0.5) * 4)
        }

        if (progress >= 1) {
          anim.stop()
          group.visible(false)
          onComplete?.()
        }
      })

      animationRef.current = anim
      anim.start()
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop()
        animationRef.current = null
      }
    }
  }, [action, onComplete])

  const color = action.animation.color || '#FFFFFF'
  const size = action.animation.size || 30

  return (
    <Group ref={groupRef} visible={false}>
      {/* Swing arc for melee_swing */}
      {action.animation.type === 'melee_swing' && (
        <Arc
          ref={slashRef}
          innerRadius={size}
          outerRadius={size * 2}
          angle={0}
          fill={color}
          opacity={0.7}
          visible={false}
        />
      )}

      {/* Impact flash */}
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