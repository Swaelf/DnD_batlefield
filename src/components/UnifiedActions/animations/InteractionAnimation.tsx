import { memo, useRef, useEffect, useMemo, useState } from 'react'
import { Group, Rect, Circle, Line, RegularPolygon } from 'react-konva'
import Konva from 'konva'
import { EASING } from '@/lib/animation-effects'
import type { UnifiedAction } from '@/types/unifiedAction'
import type { Point } from '@/types/geometry'

type InteractionAnimationProps = {
  action: UnifiedAction
  onComplete?: () => void
}

const InteractionAnimationComponent = ({ action, onComplete }: InteractionAnimationProps) => {
  const groupRef = useRef<Konva.Group>(null)
  const iconRef = useRef<Konva.Shape | Konva.Group | null>(null)
  const pulseRef = useRef<Konva.Circle>(null)
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
    duration: action.animation.duration || 1000,
    color: action.animation.color || '#FFD700',
    size: action.animation.size || 30,
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
    const icon = iconRef.current
    const pulse = pulseRef.current
    if (!group || !icon) return

    group.position(params.position)
    group.visible(true)

    // Category-specific animations
    switch (params.category) {
      case 'door':
        if (progress < 0.5) {
          const openProgress = EASING.easeOut(progress * 2)
          icon.rotation(openProgress * 90)
          icon.opacity(1)
        } else {
          icon.opacity(EASING.easeIn(2 - progress * 2))
        }
        break

      case 'lever':
      case 'switch':
        if (progress < 0.3) {
          const pullProgress = EASING.easeIn(progress / 0.3)
          icon.scaleY(1 - pullProgress * 0.6)
          icon.y(pullProgress * 10)
        } else if (progress < 0.6) {
          const springProgress = EASING.easeOutElastic((progress - 0.3) / 0.3)
          icon.scaleY(0.4 + springProgress * 0.6)
          icon.y(10 - springProgress * 10)
        } else {
          icon.scaleY(1)
          icon.y(0)
          icon.opacity(EASING.easeIn(1 - (progress - 0.6) / 0.4))
        }
        break

      case 'chest':
      case 'container':
        if (progress < 0.4) {
          const openProgress = EASING.easeOut(progress / 0.4)
          icon.scaleY(1 + openProgress * 0.3)
          if (pulse) {
            pulse.visible(true)
            pulse.scaleX(1 + openProgress)
            pulse.scaleY(1 + openProgress)
            pulse.opacity(0.5 * (1 - openProgress))
          }
        } else {
          icon.scaleY(1.3)
          icon.opacity(EASING.easeIn(1 - (progress - 0.4) / 0.6))
        }
        break

      case 'trap':
        if (progress < 0.2) {
          if (icon instanceof Konva.Shape) {
            icon.fill(progress % 0.1 < 0.05 ? 'red' : params.color)
          }
          icon.opacity(1)
        } else if (progress < 0.5) {
          const triggerProgress = EASING.easeOut((progress - 0.2) / 0.3)
          icon.scaleX(1 + triggerProgress * 0.5)
          icon.scaleY(1 + triggerProgress * 0.5)
          icon.rotation(triggerProgress * 180)
        } else {
          icon.opacity(EASING.easeIn(1 - (progress - 0.5) / 0.5))
        }
        break

      case 'button':
      case 'pressure_plate':
        if (progress < 0.3) {
          const pressProgress = EASING.easeOut(progress / 0.3)
          icon.scaleY(1 - pressProgress * 0.5)
          icon.y(pressProgress * 5)
        } else if (progress < 0.7) {
          icon.scaleY(0.5)
          icon.y(5)
          if (pulse) {
            pulse.visible(true)
            pulse.opacity(0.5)
            const pulseScale = 1 + Math.sin((progress - 0.3) * 20) * 0.1
            pulse.scaleX(pulseScale)
            pulse.scaleY(pulseScale)
          }
        } else {
          const releaseProgress = EASING.easeIn((progress - 0.7) / 0.3)
          icon.scaleY(0.5 + releaseProgress * 0.5)
          icon.y(5 - releaseProgress * 5)
          icon.opacity(1 - releaseProgress)
        }
        break

      default:
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
      group.visible(false)
    }
  }, [progress, params])

  const renderInteractionIcon = () => {
    const color = action.animation.color || '#FFD700'
    const size = action.animation.size || 30

    switch (action.category) {
      case 'door':
        // Door icon (rectangle)
        return (
          <Rect
            ref={iconRef as React.RefObject<Konva.Rect>}
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
          <Group ref={iconRef as React.RefObject<Konva.Group>}>
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
          <Group ref={iconRef as React.RefObject<Konva.Group>}>
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
            ref={iconRef as React.RefObject<Konva.RegularPolygon>}
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
            ref={iconRef as React.RefObject<Konva.Circle>}
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
            ref={iconRef as React.RefObject<Konva.RegularPolygon>}
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