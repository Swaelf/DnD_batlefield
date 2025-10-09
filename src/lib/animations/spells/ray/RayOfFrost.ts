/**
 * Ray of Frost Spell Animation
 *
 * A D&D ray spell that fires a frigid beam of blue-white light.
 *
 * D&D 5e Specs:
 * - Level: Cantrip (evocation)
 * - Range: 60 feet
 * - Damage: 1d8 cold damage (scales at higher levels)
 * - Effect: Reduces target speed by 10 feet
 *
 * Animation Features:
 * - Blue-white beam of frost
 * - Flickering icy effect
 * - Flowing frost particles
 * - Tapers toward the end
 * - Instant appearance with fade-out
 * - Ice crystals on impact
 */

import { AbstractRay, type RayConfig } from '../../core/AbstractRay'
import type { Point } from '../../types'

export type RayOfFrostConfig = {
  fromPosition: Point
  toPosition: Point
  // Optional overrides
  casterLevel?: number // 1-20, affects damage and visual intensity
  power?: 'normal' | 'empowered'
  width?: number
  color?: string
}

export class RayOfFrost extends AbstractRay {
  constructor(config: RayOfFrostConfig) {
    const {
      fromPosition,
      toPosition,
      casterLevel = 1,
      power = 'normal',
      width = 8,
      color = '#87CEEB'
    } = config

    // Cantrip scaling: 1d8 at level 1, 2d8 at level 5, 3d8 at level 11, 4d8 at level 17
    const damageDice = Math.floor((casterLevel - 1) / 6) + 1
    const powerMultiplier = power === 'empowered' ? 1.4 : 1
    const finalWidth = width * powerMultiplier

    const rayConfig: RayConfig = {
      name: 'Ray of Frost',
      fromPosition,
      toPosition,
      duration: 500, // Beam persists for 0.5 seconds
      width: finalWidth,
      color,
      size: finalWidth,
      opacity: 0.85,

      // Straight beam (single segment)
      segments: 1,

      // Taper from thick to thin
      taper: true,

      // Flickering icy effect
      flickering: true,

      // Flowing frost particles
      flowing: true,

      // Single ray
      rayCount: 1,

      // Glow effect - icy blue
      glow: {
        enabled: true,
        color: '#B0E0E6',
        intensity: 0.9,
        radius: finalWidth * 3,
        pulsing: false
      },

      // Particle effects - ice crystals
      particles: {
        enabled: true,
        count: 20,
        size: 4,
        speed: 150,
        lifetime: 600,
        color: '#FFFFFF',
        spread: 30, // Narrow spread along beam
        gravity: false
      },

      // Sound effect
      sound: {
        enabled: true,
        soundId: 'ray_of_frost_cast',
        volume: 0.6,
        pitch: 1.2 // Higher pitch for icy sound
      },

      // Metadata
      metadata: {
        spellLevel: 0, // Cantrip
        school: 'evocation',
        damageType: 'cold',
        damageDice,
        power,
        slowEffect: true,
        speedReduction: 10 // feet
      }
    }

    super(rayConfig)
  }

  /**
   * Create Ray of Frost at specific caster level (cantrip scaling)
   */
  static createAtLevel(from: Point, to: Point, casterLevel: number): RayOfFrost {
    return new RayOfFrost({
      fromPosition: from,
      toPosition: to,
      casterLevel
    })
  }

  /**
   * Create empowered Ray of Frost (metamagic or special effect)
   */
  static createEmpowered(from: Point, to: Point): RayOfFrost {
    return new RayOfFrost({
      fromPosition: from,
      toPosition: to,
      power: 'empowered',
      color: '#4682B4', // Darker blue for more powerful
      width: 10
    })
  }

  /**
   * Create Ray of Frost for high-level caster (4d8 damage)
   */
  static createMaximized(from: Point, to: Point): RayOfFrost {
    return new RayOfFrost({
      fromPosition: from,
      toPosition: to,
      casterLevel: 17, // 4d8 damage
      power: 'empowered',
      color: '#0000CD', // Deep blue
      width: 12
    })
  }

  /**
   * Create quick ray (shorter duration, faster cast)
   */
  static createQuick(from: Point, to: Point, casterLevel: number = 1): RayOfFrost {
    const ray = new RayOfFrost({
      fromPosition: from,
      toPosition: to,
      casterLevel
    })
    // Override duration for faster ray
    ray['animation'].duration = 300
    return ray
  }
}
