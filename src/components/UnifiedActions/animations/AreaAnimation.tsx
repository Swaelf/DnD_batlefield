import { memo, useRef, useEffect } from 'react'
import { Group, Circle, Rect, RegularPolygon, Ring } from 'react-konva'
import Konva from 'konva'
import type { UnifiedAction, CircularArea, SquareArea } from '@/types/unifiedAction'
import type { Point } from '@/types/geometry'

type AreaAnimationProps = {
  action: UnifiedAction
  onComplete?: () => void
}

const AreaAnimationComponent = ({ action, onComplete }: AreaAnimationProps) => {
  const groupRef = useRef<Konva.Group>(null)
  const areaRef = useRef<Konva.Shape>(null)
  const pulseRef = useRef<Konva.Shape>(null)
  const animationRef = useRef<Konva.Animation | null>(null)
  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (!groupRef.current || hasStartedRef.current) return
    hasStartedRef.current = true

    const group = groupRef.current
    const area = areaRef.current
    const pulse = pulseRef.current

    if (!area) return

    // Get area position
    const position = typeof action.target === 'object' && !Array.isArray(action.target)
      ? action.target as Point
      : action.effects.areaOfEffect?.type === 'circle'
        ? (action.effects.areaOfEffect as CircularArea).center
        : action.effects.areaOfEffect?.type === 'square'
          ? (action.effects.areaOfEffect as SquareArea).center
          : { x: 0, y: 0 }

    // Position group at area center
    group.position(position)
    group.visible(true)

    const duration = action.animation.duration || 1500
    const persistDuration = action.effects.persistDuration || 0
    const color = action.animation.color || '#FF6600'

    const startTime = Date.now()

    const anim = new Konva.Animation((frame) => {
      if (!frame) return

      const elapsed = Date.now() - startTime
      const totalDuration = duration + persistDuration
      const progress = Math.min(elapsed / totalDuration, 1)

      // Different phases based on persistence
      let animProgress = 0
      let opacity = 1

      if (persistDuration > 0) {
        // Has persistence - fade in, hold, fade out
        if (elapsed < duration * 0.3) {
          // Fade in
          animProgress = elapsed / (duration * 0.3)
          opacity = animProgress
        } else if (elapsed < duration + persistDuration) {
          // Hold
          animProgress = 1
          opacity = 1

          // Add pulsing effect during hold
          const pulseSpeed = 0.003
          const pulseAmount = Math.sin(elapsed * pulseSpeed) * 0.1 + 1
          area.scaleX(pulseAmount)
          area.scaleY(pulseAmount)
        } else {
          // Fade out
          animProgress = 1
          opacity = 1 - (elapsed - duration - persistDuration) / (duration * 0.3)
        }
      } else {
        // No persistence - expand and fade
        if (progress < 0.5) {
          animProgress = progress * 2
          opacity = 1
        } else {
          animProgress = 1
          opacity = 2 - progress * 2
        }
      }

      // Update main area
      area.opacity(opacity * 0.6)

      // Update pulse effect
      if (pulse) {
        const pulseScale = 1 + animProgress * 0.5
        pulse.scaleX(pulseScale)
        pulse.scaleY(pulseScale)
        pulse.opacity(Math.max(0, (1 - animProgress) * 0.4))
      }

      // Category-specific effects
      if (action.category === 'fire') {
        // Flickering effect for fire
        const flicker = Math.random() * 0.2 + 0.8
        area.opacity(opacity * 0.6 * flicker)
      } else if (action.category === 'ice') {
        // Crystallize effect for ice
        const crystals = Math.floor(animProgress * 6)
        if (area instanceof Konva.RegularPolygon) {
          area.sides(Math.max(3, crystals))
        }
      } else if (action.category === 'poison') {
        // Bubbling effect for poison
        const bubble = Math.sin(elapsed * 0.005) * 0.05 + 1
        area.scaleX(bubble)
        area.scaleY(bubble)
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

  const renderAreaShape = () => {
    const color = action.animation.color || '#FF6600'
    const areaOfEffect = action.effects.areaOfEffect

    if (!areaOfEffect) {
      // Default circular area
      const radius = action.animation.size || 50
      return (
        <>
          <Circle
            ref={pulseRef}
            radius={radius}
            fill={color}
            opacity={0.2}
          />
          <Ring
            ref={areaRef as any}
            innerRadius={radius * 0.7}
            outerRadius={radius}
            fill={color}
            opacity={0.6}
            shadowColor={color}
            shadowBlur={20}
            shadowOpacity={0.5}
          />
        </>
      )
    }

    switch (areaOfEffect.type) {
      case 'circle': {
        const circle = areaOfEffect as CircularArea
        return (
          <>
            <Circle
              ref={pulseRef}
              radius={circle.radius}
              fill={color}
              opacity={0.2}
            />
            <Ring
              ref={areaRef as any}
              innerRadius={Math.max(1, circle.radius * 0.7)}
              outerRadius={circle.radius}
              fill={color}
              opacity={0.6}
              shadowColor={color}
              shadowBlur={20}
              shadowOpacity={0.5}
            />
          </>
        )
      }

      case 'square': {
        const square = areaOfEffect as SquareArea
        const offset = -square.size / 2
        return (
          <>
            <Rect
              ref={pulseRef}
              x={offset}
              y={offset}
              width={square.size}
              height={square.size}
              fill={color}
              opacity={0.2}
            />
            <Rect
              ref={areaRef as any}
              x={offset}
              y={offset}
              width={square.size}
              height={square.size}
              fill={color}
              opacity={0.6}
              shadowColor={color}
              shadowBlur={20}
              shadowOpacity={0.5}
            />
          </>
        )
      }

      default:
        return (
          <Circle
            ref={areaRef as any}
            radius={50}
            fill={color}
            opacity={0.6}
          />
        )
    }
  }

  return (
    <Group ref={groupRef} visible={false}>
      {renderAreaShape()}
    </Group>
  )
}

export const AreaAnimation = memo(AreaAnimationComponent)