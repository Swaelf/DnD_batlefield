import { memo, useRef, useEffect, useMemo, useState } from 'react'
import { Group, Circle, Rect, Ring } from 'react-konva'
import Konva from 'konva'
import { EASING } from '@/lib/animation-effects'
import type { UnifiedAction, CircularArea, SquareArea } from '@/types/unifiedAction'
import type { Point } from '@/types/geometry'

type AreaAnimationProps = {
  action: UnifiedAction
  onComplete?: () => void
}

const AreaAnimationComponent = ({ action, onComplete }: AreaAnimationProps) => {
  const groupRef = useRef<Konva.Group>(null)
  const areaRef = useRef<Konva.Shape | Konva.Circle | Konva.Ring | Konva.Rect>(null)
  const pulseRef = useRef<Konva.Shape | Konva.Circle | Konva.Rect>(null)
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef(Date.now())
  const [progress, setProgress] = useState(0)

  // Parse animation parameters
  const params = useMemo(() => {
    const position = typeof action.target === 'object' && !Array.isArray(action.target)
      ? action.target as Point
      : action.effects.areaOfEffect?.type === 'circle'
        ? (action.effects.areaOfEffect as CircularArea).center
        : action.effects.areaOfEffect?.type === 'square'
          ? (action.effects.areaOfEffect as SquareArea).center
          : { x: 0, y: 0 }

    return {
      position,
      duration: action.animation.duration || 1500,
      persistDuration: action.effects.persistDuration || 0,
      color: action.animation.color || '#FF6600',
      category: action.category,
      areaOfEffect: action.effects.areaOfEffect
    }
  }, [action])

  // RAF animation loop
  useEffect(() => {
    startTimeRef.current = Date.now()
    const totalDuration = params.duration + params.persistDuration

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current
      const newProgress = Math.min(elapsed / totalDuration, 1)
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
  }, [params.duration, params.persistDuration, onComplete])

  // Rendering logic
  useEffect(() => {
    const group = groupRef.current
    const area = areaRef.current
    const pulse = pulseRef.current
    if (!group || !area) return

    group.position(params.position)
    group.visible(true)

    const elapsed = Date.now() - startTimeRef.current
    let animProgress = 0
    let opacity = 1

    if (params.persistDuration > 0) {
      // Fade in, hold, fade out
      const fadeInEnd = params.duration * 0.3
      const holdEnd = params.duration + params.persistDuration

      if (elapsed < fadeInEnd) {
        animProgress = EASING.easeOut(elapsed / fadeInEnd)
        opacity = animProgress
      } else if (elapsed < holdEnd) {
        animProgress = 1
        opacity = 1
        // Pulsing during hold
        const pulseAmount = Math.sin(elapsed * 0.003) * 0.1 + 1
        area.scaleX(pulseAmount)
        area.scaleY(pulseAmount)
      } else {
        animProgress = 1
        opacity = EASING.easeIn(1 - (elapsed - holdEnd) / (params.duration * 0.3))
      }
    } else {
      // Expand and fade
      if (progress < 0.5) {
        animProgress = EASING.easeOut(progress * 2)
        opacity = 1
      } else {
        animProgress = 1
        opacity = EASING.easeIn(2 - progress * 2)
      }
    }

    // Update area
    area.opacity(opacity * 0.6)

    // Update pulse
    if (pulse) {
      const pulseScale = 1 + animProgress * 0.5
      pulse.scaleX(pulseScale)
      pulse.scaleY(pulseScale)
      pulse.opacity(Math.max(0, (1 - animProgress) * 0.4))
    }

    // Category effects
    if (params.category === 'fire') {
      const flicker = Math.random() * 0.2 + 0.8
      area.opacity(opacity * 0.6 * flicker)
    } else if (params.category === 'ice') {
      const crystals = Math.floor(animProgress * 6)
      if (area instanceof Konva.RegularPolygon) {
        area.sides(Math.max(3, crystals))
      }
    } else if (params.category === 'poison') {
      const bubble = Math.sin(elapsed * 0.005) * 0.05 + 1
      area.scaleX(bubble)
      area.scaleY(bubble)
    }

    if (progress >= 1) {
      group.visible(false)
    }
  }, [progress, params])

  const renderAreaShape = () => {
    const color = action.animation.color || '#FF6600'
    const areaOfEffect = action.effects.areaOfEffect

    if (!areaOfEffect) {
      // Default circular area
      const radius = action.animation.size || 50
      return (
        <>
          <Circle
            ref={pulseRef as React.Ref<Konva.Circle>}
            radius={radius}
            fill={color}
            opacity={0.2}
          />
          <Ring
            ref={areaRef as React.Ref<Konva.Ring>}
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
              ref={pulseRef as React.Ref<Konva.Circle>}
              radius={circle.radius}
              fill={color}
              opacity={0.2}
            />
            <Ring
              ref={areaRef as React.Ref<Konva.Ring>}
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
              ref={pulseRef as React.Ref<Konva.Rect>}
              x={offset}
              y={offset}
              width={square.size}
              height={square.size}
              fill={color}
              opacity={0.2}
            />
            <Rect
              ref={areaRef as React.Ref<Konva.Rect>}
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
            ref={areaRef as React.Ref<Konva.Circle>}
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