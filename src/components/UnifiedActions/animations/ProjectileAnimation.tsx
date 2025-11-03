import { memo, useEffect, useRef, useState } from 'react'
import { Group, Circle } from 'react-konva'
import type { UnifiedAction } from '@/types/unifiedAction'
import type { Point } from '@/types/geometry'
import { createLinearMotion } from '@/lib/animation-effects/motion'
import type { MotionPathGenerator } from '@/lib/animation-effects/motion/LinearMotion'
import { GRID_SIZES, DISTANCE_UNITS } from '@/constants/grid'

type ProjectileAnimationProps = {
  action: UnifiedAction
  onComplete?: () => void
}

interface TrailPosition {
  x: number
  y: number
  progress: number
}

const ProjectileAnimationComponent = ({ action, onComplete }: ProjectileAnimationProps) => {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [trailPositions, setTrailPositions] = useState<TrailPosition[]>([])
  const animationFrameRef = useRef<number>(0)
  const startTimeRef = useRef<number>(Date.now())
  const motionGeneratorRef = useRef<MotionPathGenerator | null>(null)

  // Parse source and target positions
  const getSourcePosition = (): Point => {
    if (typeof action.source === 'object' && !Array.isArray(action.source)) {
      return action.source as Point
    }
    console.warn('[ProjectileAnimation] Invalid source, using default:', action.source)
    return { x: 0, y: 0 }
  }

  const getRawTargetPosition = (): Point => {
    if (Array.isArray(action.target)) {
      console.log('[ProjectileAnimation] Target is array (tokens), using default')
      return { x: 100, y: 100 }
    }
    return action.target as Point
  }

  // Calculate weapon range and limit target position
  const getTargetPosition = (): Point => {
    const source = getSourcePosition()
    const rawTarget = getRawTargetPosition()

    // Get weapon range from action metadata
    const weaponRange = action.metadata?.range || action.animation.range || 150 // Default 150ft

    // Convert range in feet to pixels
    const pixelsPerSquare = GRID_SIZES.MEDIUM // 50 pixels
    const feetPerSquare = DISTANCE_UNITS.FEET_PER_SQUARE // 5 feet
    const maxRangeInPixels = (weaponRange / feetPerSquare) * pixelsPerSquare

    // Calculate distance from source to target
    const dx = rawTarget.x - source.x
    const dy = rawTarget.y - source.y
    const actualDistance = Math.sqrt(dx * dx + dy * dy)

    // If target is within range, use it as-is
    if (actualDistance <= maxRangeInPixels) {
      return rawTarget
    }

    // If target is beyond range, limit it to maximum range
    const angle = Math.atan2(dy, dx)
    const limitedTarget: Point = {
      x: source.x + Math.cos(angle) * maxRangeInPixels,
      y: source.y + Math.sin(angle) * maxRangeInPixels
    }

    console.log('[ProjectileAnimation] Target limited from', rawTarget, 'to', limitedTarget, 'at range', maxRangeInPixels)
    return limitedTarget
  }

  // Create motion generator based on action configuration
  const createMotionGenerator = (): MotionPathGenerator => {
    const source = getSourcePosition()
    const target = getTargetPosition()

    console.log('[ProjectileAnimation] Creating motion generator:', {
      actionName: action.name,
      category: action.category,
      from: source,
      to: target
    })

    // For now, use linear motion (curved motion can be added later)
    return createLinearMotion(source, target)
  }

  // Initialize motion generator once
  useEffect(() => {
    const source = getSourcePosition()
    const target = getTargetPosition()
    motionGeneratorRef.current = createMotionGenerator()
    console.log('[ProjectileAnimation] Initialized:', { source, target })
  }, [action.id])

  // Animation loop
  useEffect(() => {
    if (isComplete) return

    const motionGenerator = motionGeneratorRef.current
    if (!motionGenerator) return

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current
      const duration = action.animation.duration || 1000
      const currentProgress = Math.min(elapsed / duration, 1)

      setProgress(currentProgress)

      // Update trail positions
      const trailCount = 8
      const newTrailPositions: TrailPosition[] = []

      for (let i = 0; i < trailCount; i++) {
        const trailProgress = Math.max(0, currentProgress - (i * 0.03))
        if (trailProgress === 0 && currentProgress > 0.1) continue

        const position = motionGenerator(trailProgress)
        newTrailPositions.unshift({
          x: position.x,
          y: position.y,
          progress: 1 - (i / trailCount)
        })
      }

      setTrailPositions(newTrailPositions)

      if (currentProgress >= 1) {
        setIsComplete(true)
        onComplete?.()
      } else {
        if (!document.hidden) {
          animationFrameRef.current = requestAnimationFrame(animate)
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isComplete, action, onComplete])

  // Reset when needed
  useEffect(() => {
    return () => {
      setProgress(0)
      setIsComplete(false)
      setTrailPositions([])
      startTimeRef.current = Date.now()
      motionGeneratorRef.current = null
    }
  }, [])

  if (isComplete) {
    return null
  }

  const motionGenerator = motionGeneratorRef.current
  if (!motionGenerator) {
    return null
  }

  const position = motionGenerator(progress)
  const size = action.animation.size || 10
  const color = action.animation.color || '#FF0000'
  const opacity = 1 - progress * 0.3

  // Calculate angle for directional effect
  const target = getTargetPosition()
  const source = getSourcePosition()
  const dx = target.x - source.x
  const dy = target.y - source.y
  const angle = Math.atan2(dy, dx)

  return (
    <Group listening={false}>
      {/* Trail effect */}
      {trailPositions.map((pos, index) => {
        const trailRatio = pos.progress
        const trailSize = size * (0.3 + trailRatio * 0.7)

        return (
          <Circle
            key={index}
            x={pos.x}
            y={pos.y}
            radius={trailSize}
            fill={color}
            opacity={trailRatio * 0.5}
          />
        )
      })}

      {/* Glow effect */}
      <Circle
        x={position.x}
        y={position.y}
        radius={size * 1.5}
        fill={color}
        opacity={0.3}
      />

      {/* Main projectile body */}
      <Circle
        x={position.x}
        y={position.y}
        radius={size}
        fill={color}
        opacity={opacity}
        shadowColor={color}
        shadowBlur={size * 2}
        shadowOpacity={0.6}
      />

      {/* Inner core */}
      <Circle
        x={position.x}
        y={position.y}
        radius={size * 0.5}
        fill="#FFFFFF"
        opacity={opacity * 0.8}
      />

      {/* Front-facing point */}
      <Circle
        x={position.x + Math.cos(angle) * size}
        y={position.y + Math.sin(angle) * size}
        radius={size * 0.3}
        fill="#FFFFFF"
        opacity={opacity * 0.9}
      />
    </Group>
  )
}

export const ProjectileAnimation = memo(ProjectileAnimationComponent)