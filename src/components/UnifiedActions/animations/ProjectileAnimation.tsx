import { memo, useMemo } from 'react'
import type { UnifiedAction } from '@/types/unifiedAction'
import type { Point } from '@/types/geometry'
import { AbstractProjectile } from '@/lib/animation-effects'
import type { AbstractProjectileConfig } from '@/lib/animation-effects'

type ProjectileAnimationProps = {
  action: UnifiedAction
  onComplete?: () => void
}

const ProjectileAnimationComponent = ({ action, onComplete }: ProjectileAnimationProps) => {
  // Parse source and target positions
  const source = useMemo((): Point => {
    return typeof action.source === 'object' && !Array.isArray(action.source)
      ? action.source as Point
      : { x: 0, y: 0 }
  }, [action.source])

  const target = useMemo((): Point => {
    return Array.isArray(action.target)
      ? { x: 100, y: 100 } // Default if targeting tokens
      : action.target as Point
  }, [action.target])

  // Build projectile configuration based on category
  const config = useMemo((): AbstractProjectileConfig => {
    const duration = action.animation.duration || 1000
    const size = action.animation.size || 10
    const color = action.animation.color || '#FF0000'

    switch (action.category) {
      case 'arrow':
      case 'dart':
        return {
          from: source,
          to: target,
          shape: 'triangle',
          color: color,
          size: size,
          effects: ['trail', 'pulse'],
          duration: duration,
          onComplete: onComplete,
        }

      case 'magic_missile':
        return {
          from: source,
          to: target,
          shape: 'star',
          color: color,
          size: size,
          effects: ['trail', 'glow', 'pulse'],
          duration: duration,
          onComplete: onComplete,
        }

      case 'eldritch_blast':
        return {
          from: source,
          to: target,
          shape: 'circle',
          color: color,
          size: size,
          effects: ['trail', 'glow', 'flash'],
          duration: duration,
          onComplete: onComplete,
        }

      default:
        return {
          from: source,
          to: target,
          shape: 'circle',
          color: color,
          size: size,
          effects: ['trail', 'pulse'],
          duration: duration,
          onComplete: onComplete,
        }
    }
  }, [action.category, action.animation.duration, action.animation.size, action.animation.color, source, target, onComplete])

  return <AbstractProjectile config={config} />
}

export const ProjectileAnimation = memo(ProjectileAnimationComponent)