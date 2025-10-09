/**
 * Fireball Spell Animation
 *
 * A classic D&D projectile spell with explosion on impact.
 *
 * D&D 5e Specs:
 * - Level: 3rd level evocation
 * - Range: 150 feet
 * - Area: 20-foot radius sphere (burst)
 * - Damage: 8d6 fire damage
 *
 * Animation Features:
 * - Straight or slightly curved projectile
 * - Orange/red flame colors
 * - Fire trail effect
 * - Large explosion burst on impact
 * - Optional persistent burning area
 */

import { AbstractProjectile, type ProjectileConfig } from '../../core/AbstractProjectile'
import type { Point, BurstConfig } from '../../types'

export type FireballConfig = {
  fromPosition: Point
  toPosition: Point
  // Optional overrides
  power?: 'normal' | 'empowered' | 'maximized'
  curveAmount?: number // 0-1, how much curve (0 = straight)
  speed?: number
  size?: number
  color?: string
  trailLength?: number
  burstRadius?: number
  persistDuration?: number
}

export class Fireball extends AbstractProjectile {
  constructor(config: FireballConfig) {
    const {
      fromPosition,
      toPosition,
      power = 'normal',
      curveAmount = 0.2,
      speed = 500,
      size = 20,
      color = '#FF6B35',
      trailLength = 8,
      burstRadius = 200, // 20-foot radius = 4 grid cells = 200px (50px per cell)
      persistDuration = 1 // Persist for 1 event (burning ground effect)
    } = config

    // Calculate enhanced size/color based on power
    const powerMultiplier = power === 'maximized' ? 1.5 : power === 'empowered' ? 1.25 : 1
    const enhancedSize = size * powerMultiplier
    const enhancedBurstRadius = burstRadius * powerMultiplier

    // Create projectile configuration
    const projectileConfig: ProjectileConfig = {
      name: 'Fireball',
      fromPosition,
      toPosition,
      speed,
      size: enhancedSize,
      color,
      opacity: 1,
      rotateToDirection: false, // Fireball is spherical, no rotation needed

      // Motion path - slight curve for visual interest
      motionPath: {
        type: curveAmount > 0 ? 'curved' : 'linear',
        startPosition: fromPosition,
        endPosition: toPosition,
        duration: 0, // Will be calculated from speed
        curveHeight: curveAmount > 0 ? 60 * curveAmount : undefined,
        easing: 'easeOut'
      },

      // Trail effect - fire trail
      trail: {
        enabled: true,
        length: trailLength,
        fadeSpeed: 0.8,
        color: '#FF4500', // Darker orange-red
        opacity: 0.6
      },

      // Glow effect - orange glow
      glow: {
        enabled: true,
        color: '#FF8C00',
        intensity: 0.8,
        radius: enhancedSize * 1.5,
        pulsing: true,
        pulseSpeed: 3
      },

      // Impact burst - explosion
      impactEffect: {
        category: 'burst',
        name: 'Fireball Explosion',
        position: toPosition, // Will be updated on impact
        shape: 'circle',
        radius: enhancedBurstRadius,
        color: '#FF4500',
        size: enhancedBurstRadius,
        duration: 600,
        expansionDuration: 300,
        fadeDuration: 300,
        opacity: 0.8,

        // Explosion effects
        shockwave: true,
        shake: {
          intensity: 0.3 * powerMultiplier,
          duration: 200
        },

        // Glow effect for explosion
        glow: {
          enabled: true,
          color: '#FF6B35',
          intensity: 1,
          radius: enhancedBurstRadius * 1.2
        },

        // Particle effects
        particles: {
          enabled: true,
          count: 30,
          size: 8,
          speed: 200,
          lifetime: 800,
          color: '#FF8C00',
          gravity: false
        }
      } as BurstConfig,

      // Sound effect
      sound: {
        enabled: true,
        soundId: 'fireball_cast',
        volume: 0.7
      },

      // D&D 5e range: 150 feet = 30 grid cells (5 feet per cell)
      // But limiting to 24 grid cells = 120 feet for better gameplay
      maxRange: 120, // 120 feet = 24 grid cells

      // Metadata
      metadata: {
        spellLevel: 3,
        school: 'evocation',
        damageType: 'fire',
        power,
        persistDuration
      }
    }

    super(projectileConfig)
  }

  /**
   * Create an empowered fireball (25% larger)
   */
  static createEmpowered(fromPosition: Point, toPosition: Point): Fireball {
    return new Fireball({
      fromPosition,
      toPosition,
      power: 'empowered'
    })
  }

  /**
   * Create a maximized fireball (50% larger)
   */
  static createMaximized(fromPosition: Point, toPosition: Point): Fireball {
    return new Fireball({
      fromPosition,
      toPosition,
      power: 'maximized'
    })
  }

  /**
   * Create a delayed blast fireball (bigger, with slight delay)
   */
  static createDelayedBlast(
    fromPosition: Point,
    toPosition: Point,
    delay: number = 1000
  ): Fireball {
    const fireball = new Fireball({
      fromPosition,
      toPosition,
      power: 'maximized',
      burstRadius: 280, // Larger explosion (30-foot radius)
      speed: 300 // Slower projectile
    })

    // Add delay before playing
    setTimeout(() => {
      fireball.play()
    }, delay)

    return fireball
  }

  /**
   * Create a persistent fireball (leaves burning area)
   */
  static createPersistent(
    fromPosition: Point,
    toPosition: Point,
    persistDuration: number = 2000
  ): Fireball {
    return new Fireball({
      fromPosition,
      toPosition,
      persistDuration
    })
  }
}
