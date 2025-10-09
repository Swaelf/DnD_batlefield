/**
 * Magic Missile Spell Animation
 *
 * A D&D cantrip that fires multiple homing projectiles.
 *
 * D&D 5e Specs:
 * - Level: 1st level evocation
 * - Range: 120 feet
 * - Missiles: 3 at base level, +1 per spell level above 1st
 * - Damage: 1d4+1 force damage per missile
 * - Special: Never misses (auto-hit)
 *
 * Animation Features:
 * - Curved/homing projectiles
 * - Purple/blue magical energy
 * - Glowing trail
 * - Small impact burst
 * - Multiple missiles can target different enemies
 */

import { AbstractProjectile, type ProjectileConfig } from '../../core/AbstractProjectile'
import type { Point } from '../../types'

export type MagicMissileConfig = {
  fromPosition: Point
  toPosition: Point
  // Optional overrides
  spellLevel?: number // 1-9, affects number of missiles
  missileIndex?: number // Which missile in the volley (for staggering)
  speed?: number
  size?: number
  color?: string
  curved?: boolean
}

export class MagicMissile extends AbstractProjectile {
  constructor(config: MagicMissileConfig) {
    const {
      fromPosition,
      toPosition,
      spellLevel = 1,
      missileIndex = 0,
      speed = 600,
      size = 8,
      color = '#9D4EDD',
      curved = true
    } = config

    // Calculate missile count (3 + spell level - 1)
    const missileCount = 2 + spellLevel

    // Create projectile configuration
    const projectileConfig: ProjectileConfig = {
      name: 'Magic Missile',
      fromPosition,
      toPosition,
      speed,
      size,
      color,
      opacity: 1,
      rotateToDirection: true,

      // Motion path - always curved for visual "seeking" effect
      motionPath: {
        type: curved ? 'curved' : 'linear',
        startPosition: fromPosition,
        endPosition: toPosition,
        duration: 0, // Calculated from speed
        curveHeight: curved ? 60 : 0,
        curveDirection: missileIndex % 2 === 0 ? 'up' : 'down', // Alternate curve direction
        easing: 'easeInOut'
      },

      // Trail effect - magical energy trail
      trail: {
        enabled: true,
        length: 12,
        fadeSpeed: 0.9,
        color: '#7209B7', // Darker purple
        opacity: 0.8
      },

      // Glow effect - bright magical glow
      glow: {
        enabled: true,
        color: '#C77DFF',
        intensity: 1,
        radius: size * 2,
        pulsing: true,
        pulseSpeed: 5
      },

      // Small impact burst
      impactEffect: {
        category: 'burst',
        name: 'Magic Missile Impact',
        position: toPosition,
        shape: 'star',
        radius: 40,
        color: '#9D4EDD',
        size: 40,
        duration: 300,
        expansionDuration: 100,
        fadeDuration: 200,
        opacity: 0.9,

        particles: {
          enabled: true,
          count: 15,
          size: 4,
          speed: 100,
          lifetime: 400,
          color: '#C77DFF',
          spread: 360,
          gravity: false
        }
      },

      // Sound effect
      sound: {
        enabled: true,
        soundId: 'magic_missile_cast',
        volume: 0.5,
        pitch: 1 + missileIndex * 0.1 // Slightly different pitch per missile
      },

      // D&D 5e range
      maxRange: 120, // 120 feet

      // Homing behavior
      trackTarget: false, // Not true homing, just curved

      // Metadata
      metadata: {
        spellLevel,
        school: 'evocation',
        damageType: 'force',
        missileIndex,
        missileCount,
        autoHit: true // Magic Missile never misses
      }
    }

    super(projectileConfig)
  }

  /**
   * Create a volley of magic missiles
   * Returns an array of missiles that can be played with stagger
   */
  static createVolley(
    fromPosition: Point,
    targets: Point[],
    spellLevel: number = 1
  ): MagicMissile[] {
    const missileCount = 2 + spellLevel
    const missiles: MagicMissile[] = []

    for (let i = 0; i < missileCount; i++) {
      // Cycle through targets if there are fewer targets than missiles
      const targetIndex = i % targets.length
      const target = targets[targetIndex]

      missiles.push(
        new MagicMissile({
          fromPosition,
          toPosition: target,
          spellLevel,
          missileIndex: i
        })
      )
    }

    return missiles
  }

  /**
   * Play missiles in a staggered sequence
   */
  static playVolleyStaggered(
    missiles: MagicMissile[],
    staggerDelay: number = 100
  ): void {
    missiles.forEach((missile, index) => {
      setTimeout(() => {
        missile.play()
      }, index * staggerDelay)
    })
  }

  /**
   * Create and play an instant volley
   */
  static castVolley(
    fromPosition: Point,
    targets: Point[],
    spellLevel: number = 1,
    staggerDelay: number = 100
  ): MagicMissile[] {
    const missiles = MagicMissile.createVolley(fromPosition, targets, spellLevel)
    MagicMissile.playVolleyStaggered(missiles, staggerDelay)
    return missiles
  }

  /**
   * Create an upcasted magic missile (more missiles)
   */
  static createUpcasted(
    fromPosition: Point,
    toPosition: Point,
    spellLevel: number
  ): MagicMissile {
    return new MagicMissile({
      fromPosition,
      toPosition,
      spellLevel
    })
  }

  /**
   * Create a straight-line magic missile (no curve)
   */
  static createStraight(fromPosition: Point, toPosition: Point): MagicMissile {
    return new MagicMissile({
      fromPosition,
      toPosition,
      curved: false,
      speed: 800 // Faster when straight
    })
  }
}
