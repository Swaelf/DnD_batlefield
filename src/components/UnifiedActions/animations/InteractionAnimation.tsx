import { memo, useRef, useEffect } from 'react'
import { Group, Rect, Circle, Line, RegularPolygon } from 'react-konva'
import Konva from 'konva'
import type { UnifiedAction } from '@/types/unifiedAction'
import type { Point } from '@/types/geometry'

type InteractionAnimationProps = {
  action: UnifiedAction
  onComplete?: () => void
}

const InteractionAnimationComponent = ({ action, onComplete }: InteractionAnimationProps) => {
  const groupRef = useRef<Konva.Group>(null)
  const iconRef = useRef<Konva.Shape>(null)
  const pulseRef = useRef<Konva.Circle>(null)
  const animationRef = useRef<Konva.Animation | null>(null)
  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (!groupRef.current || hasStartedRef.current) return
    hasStartedRef.current = true

    const group = groupRef.current
    const icon = iconRef.current
    const pulse = pulseRef.current

    if (!icon) return

    // Get interaction position
    const position = typeof action.target === 'object' && !Array.isArray(action.target)
      ? action.target as Point
      : typeof action.source === 'object'
        ? action.source as Point
        : { x: 0, y: 0 }

    // Position group at interaction point
    group.position(position)
    group.visible(true)

    const duration = action.animation.duration || 1000
    const color = action.animation.color || '#FFD700'

    const startTime = Date.now()

    const anim = new Konva.Animation((frame) => {
      if (!frame) return

      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Different animations based on interaction type
      switch (action.category) {
        case 'door':
          // Door opening animation
          if (progress < 0.5) {
            const openProgress = progress * 2
            icon.rotation(openProgress * 90) // Rotate to show opening
            icon.opacity(1)
          } else {
            icon.opacity(2 - progress * 2) // Fade out
          }
          break

        case 'lever':
        case 'switch':
          // Lever/switch animation
          if (progress < 0.3) {
            // Pull down
            icon.scaleY(1 - progress * 2)
            icon.y(progress * 10)
          } else if (progress < 0.6) {
            // Spring back
            const springProgress = (progress - 0.3) / 0.3
            icon.scaleY(0.4 + springProgress * 0.6)
            icon.y(10 - springProgress * 10)
          } else {
            // Hold and fade
            icon.scaleY(1)
            icon.y(0)
            icon.opacity(1 - (progress - 0.6) / 0.4)
          }
          break

        case 'chest':
        case 'container':
          // Chest opening animation
          if (progress < 0.4) {
            const openProgress = progress / 0.4
            icon.scaleY(1 + openProgress * 0.3) // Lid lifting
            if (pulse) {
              pulse.visible(true)
              pulse.scaleX(1 + openProgress)
              pulse.scaleY(1 + openProgress)
              pulse.opacity(0.5 * (1 - openProgress))
            }
          } else {
            icon.scaleY(1.3)
            icon.opacity(1 - (progress - 0.4) / 0.6)
          }
          break

        case 'trap':
          // Trap trigger animation
          if (progress < 0.2) {
            // Flash warning
            icon.fill(progress % 0.1 < 0.05 ? 'red' : color)
            icon.opacity(1)
          } else if (progress < 0.5) {
            // Trigger effect
            const triggerProgress = (progress - 0.2) / 0.3
            icon.scaleX(1 + triggerProgress * 0.5)
            icon.scaleY(1 + triggerProgress * 0.5)
            icon.rotation(triggerProgress * 180)
          } else {
            // Fade out
            icon.opacity(1 - (progress - 0.5) / 0.5)
          }
          break

        case 'button':
        case 'pressure_plate':
          // Button press animation
          if (progress < 0.3) {
            // Press down
            const pressProgress = progress / 0.3
            icon.scaleY(1 - pressProgress * 0.5)
            icon.y(pressProgress * 5)
          } else if (progress < 0.7) {
            // Hold pressed
            icon.scaleY(0.5)
            icon.y(5)
            // Glow effect
            if (pulse) {
              pulse.visible(true)
              pulse.opacity(0.5)
              const pulseScale = 1 + Math.sin((progress - 0.3) * 20) * 0.1
              pulse.scaleX(pulseScale)
              pulse.scaleY(pulseScale)
            }
          } else {
            // Release
            const releaseProgress = (progress - 0.7) / 0.3
            icon.scaleY(0.5 + releaseProgress * 0.5)
            icon.y(5 - releaseProgress * 5)
            icon.opacity(1 - releaseProgress)
          }
          break

        default:
          // Generic interaction animation
          const scaleAmount = 1 + Math.sin(progress * Math.PI) * 0.3
          icon.scaleX(scaleAmount)
          icon.scaleY(scaleAmount)
          icon.opacity(1 - progress * 0.5)

          if (pulse) {
            pulse.visible(true)
            pulse.scaleX(1 + progress * 2)
            pulse.scaleY(1 + progress * 2)
            pulse.opacity((1 - progress) * 0.5)
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

  const renderInteractionIcon = () => {
    const color = action.animation.color || '#FFD700'
    const size = action.animation.size || 30

    switch (action.category) {
      case 'door':
        // Door icon (rectangle)
        return (
          <Rect
            ref={iconRef as any}
            x={-size / 2}
            y={-size}
            width={size}
            height={size * 2}
            fill={color}
            stroke="brown"
            strokeWidth={2}
            cornerRadius={2}
          />
        )

      case 'lever':
      case 'switch':
        // Lever icon (vertical line with circle)
        return (
          <Group ref={iconRef as any}>
            <Line
              points={[0, -size, 0, size]}
              stroke={color}
              strokeWidth={4}
              lineCap="round"
            />
            <Circle
              y={-size}
              radius={6}
              fill={color}
            />
          </Group>
        )

      case 'chest':
      case 'container':
        // Chest icon (rectangle with lid)
        return (
          <Group ref={iconRef as any}>
            <Rect
              x={-size * 0.7}
              y={-size * 0.5}
              width={size * 1.4}
              height={size}
              fill="brown"
              stroke={color}
              strokeWidth={2}
            />
            <Rect
              x={-size * 0.7}
              y={-size * 0.5}
              width={size * 1.4}
              height={size * 0.3}
              fill={color}
            />
          </Group>
        )

      case 'trap':
        // Trap icon (warning triangle)
        return (
          <RegularPolygon
            ref={iconRef as any}
            sides={3}
            radius={size}
            fill={color}
            stroke="red"
            strokeWidth={2}
          />
        )

      case 'button':
      case 'pressure_plate':
        // Button icon (circle)
        return (
          <Circle
            ref={iconRef as any}
            radius={size * 0.6}
            fill={color}
            stroke="gray"
            strokeWidth={2}
          />
        )

      default:
        // Generic interaction icon (gear)
        return (
          <RegularPolygon
            ref={iconRef as any}
            sides={8}
            radius={size}
            fill={color}
            rotation={22.5}
          />
        )
    }
  }

  return (
    <Group ref={groupRef} visible={false}>
      {/* Pulse effect */}
      <Circle
        ref={pulseRef}
        radius={30}
        fill={action.animation.color || '#FFD700'}
        opacity={0}
        visible={false}
      />

      {/* Interaction icon */}
      {renderInteractionIcon()}
    </Group>
  )
}

export const InteractionAnimation = memo(InteractionAnimationComponent)