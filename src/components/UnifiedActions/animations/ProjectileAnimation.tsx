import { memo, useMemo } from 'react'
import type { UnifiedAction } from '@/types/unifiedAction'
import type { Point } from '@/types/geometry'
import { AbstractProjectile } from '@/lib/animation-effects'
import type { AbstractProjectileConfig, ProjectileMutation } from '@/lib/animation-effects'
import { createArc } from '@/lib/animation-effects/motion'

type ProjectileAnimationProps = {
  action: UnifiedAction
  onComplete?: () => void
}

// Force HMR update for animation changes

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

  // Build projectile configuration from animation properties
  const config = useMemo((): AbstractProjectileConfig => {
    const anim = action.animation
    const duration = anim.duration || 1000
    const size = anim.size || 10
    const color = anim.color || '#FF0000'

    // Build effects list based on animation properties
    const effects: Array<'trail' | 'glow' | 'pulse' | 'flash' | 'particles'> = []
    if (anim.trail) effects.push('trail')
    if (anim.glow) effects.push('glow')
    if (anim.pulse) effects.push('pulse')
    if (anim.particles) effects.push('particles')

    // Default effects if none specified
    if (effects.length === 0) {
      effects.push('trail', 'pulse')
    }

    // Determine shape - all projectiles use circle for consistency
    // (Star/triangle shapes can be added via animation flags if needed)
    const shape: 'circle' | 'triangle' | 'star' | 'diamond' = 'circle'

    console.log('[ProjectileAnimation] Config:', {
      category: action.category,
      animationType: anim.type,
      shape,
      color,
      size,
      effects,
      curved: anim.curved,
      burstSize: anim.burstSize
    })

    // Build base config
    const baseConfig: AbstractProjectileConfig = {
      from: source,
      to: target,
      shape,
      color,
      size,
      effects,
      duration,
      onComplete: onComplete,
    }

    // Add curved motion if specified
    if (anim.curved) {
      const curveHeight = anim.curveHeight || 60
      const direction: 'up' | 'down' | 'auto' = anim.curveDirection || 'auto'

      // Determine actual direction if auto
      const actualDirection = direction === 'auto'
        ? (source.y < target.y ? 'up' : 'down')
        : direction

      baseConfig.motion = createArc(
        source,
        target,
        curveHeight,
        actualDirection
      )
    }

    // Add burst mutation for projectile_burst type
    if (anim.type === 'projectile_burst') {
      const burstMutation: ProjectileMutation = {
        trigger: { type: 'progress', value: 1.0 }, // Burst at 100% progress (impact)
        shape: 'circle',
        size: anim.burstSize || size * 4,
        color: anim.burstColor || color,
        effects: ['glow', 'pulse', 'flash'],
        transitionDuration: anim.burstDuration || 400
      }
      baseConfig.mutations = [burstMutation]
    }

    return baseConfig
  }, [action.animation, action.category, source, target, onComplete])

  return <AbstractProjectile config={config} />
}

export const ProjectileAnimation = memo(ProjectileAnimationComponent)