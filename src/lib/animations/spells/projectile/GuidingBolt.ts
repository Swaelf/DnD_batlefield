/**
 * Guiding Bolt Spell Animation
 *
 * A D&D projectile spell that fires a flash of light.
 *
 * D&D 5e Specs:
 * - Level: 1st level evocation
 * - Range: 120 feet
 * - Damage: 4d6 radiant damage
 * - Effect: Target glows, granting advantage on next attack
 *
 * Animation Features:
 * - Golden/yellow light projectile
 * - Straight or slightly arcing path
 * - Bright radiant glow
 * - Trail of light particles
 * - Burst on impact that marks target
 */

import { AbstractProjectile, type ProjectileConfig } from '../../core/AbstractProjectile'
import type { Point } from '../../types'

export type GuidingBoltConfig = {
  fromPosition: Point
  toPosition: Point
  // Optional overrides
  spellLevel?: number // 1-9, affects damage and visual intensity
  curved?: boolean // Slight arc for dramatic effect
  power?: 'normal' | 'empowered'
  speed?: number
  color?: string
}

export class GuidingBolt extends AbstractProjectile {
  constructor(config: GuidingBoltConfig) {
    const {
      fromPosition,
      toPosition,
      spellLevel = 1,
      curved = false,
      power = 'normal',
      speed = 450,
      color = '#F0E68C'
    } = config

    // Scale with spell level
    const levelMultiplier = 1 + (spellLevel - 1) * 0.15
    const powerMultiplier = power === 'empowered' ? 1.25 : 1
    const finalSize = 16 * levelMultiplier * powerMultiplier

    const projectileConfig: ProjectileConfig = {
      name: 'Guiding Bolt',
      fromPosition,
      toPosition,
      speed,
      size: finalSize,
      color,
      opacity: 0.9,
      maxRange: 120 * 5, // 120 feet = 600px (5px per foot)

      // Motion path
      motionPath: {
        type: curved ? 'curved' : 'linear',
        curveHeight: curved ? 40 : undefined,
        easing: 'easeOut'
      },

      // Trail effect - radiant light trail
      trail: {
        enabled: true,
        length: 12,
        fadeSpeed: 0.7,
        color: '#FFD700', // Gold trail
        opacity: 0.8
      },

      // Glow effect - bright radiant
      glow: {
        enabled: true,
        color: '#FFFFE0', // Light yellow
        intensity: 1.2,
        radius: finalSize * 2.5,
        pulsing: true
      },

      // Particle effects - light sparkles
      particles: {
        enabled: true,
        count: 20,
        size: 4,
        speed: 100,
        lifetime: 600,
        color: '#FFFFFF',
        spread: 360,
        gravity: false
      },

      // Impact burst - marks target with glow
      impactEffect: {
        category: 'burst',
        position: toPosition,
        radius: 30,
        shape: 'star',
        color: '#FFD700',
        size: 30,
        opacity: 0.7,
        duration: 800,
        expansionDuration: 200,
        peakDuration: 300,
        fadeDuration: 300,
        glow: {
          enabled: true,
          color: '#FFFFE0',
          intensity: 1,
          radius: 40,
          pulsing: false
        }
      },

      // Sound effect
      sound: {
        enabled: true,
        soundId: 'guiding_bolt_cast',
        volume: 0.7,
        pitch: 1.2
      },

      // Metadata
      metadata: {
        spellLevel,
        school: 'evocation',
        damageType: 'radiant',
        damageDice: `${spellLevel + 3}d6`, // 4d6 at 1st, 5d6 at 2nd, etc.
        power,
        grantsAdvantage: true,
        duration: 1 // Target glows until next attack (1 round)
      }
    }

    super(projectileConfig)
  }

  /**
   * Create an upcasted Guiding Bolt (higher spell level)
   */
  static createUpcasted(from: Point, to: Point, spellLevel: number): GuidingBolt {
    return new GuidingBolt({
      fromPosition: from,
      toPosition: to,
      spellLevel
    })
  }

  /**
   * Create an empowered Guiding Bolt
   */
  static createEmpowered(from: Point, to: Point): GuidingBolt {
    return new GuidingBolt({
      fromPosition: from,
      toPosition: to,
      power: 'empowered',
      color: '#FFD700' // Brighter gold
    })
  }

  /**
   * Create curved Guiding Bolt (dramatic arc)
   */
  static createCurved(from: Point, to: Point): GuidingBolt {
    return new GuidingBolt({
      fromPosition: from,
      toPosition: to,
      curved: true
    })
  }

  /**
   * Create high-level Guiding Bolt
   */
  static createMaximized(from: Point, to: Point): GuidingBolt {
    return new GuidingBolt({
      fromPosition: from,
      toPosition: to,
      spellLevel: 9,
      power: 'empowered',
      curved: true,
      color: '#FFA500' // Orange-gold for maximum power
    })
  }
}
