/**
 * Poison Spray Spell Animation
 *
 * A D&D cantrip that sprays poisonous mist.
 *
 * D&D 5e Specs:
 * - Level: Cantrip (conjuration)
 * - Range: 10 feet
 * - Damage: 1d12 poison damage (scaling with level)
 * - Save: Constitution saving throw
 *
 * Animation Features:
 * - 10-foot short cone of green poison mist
 * - Billowing cloud effect
 * - Green/sickly yellow colors
 * - Particle effects for mist droplets
 * - Cantrip damage scaling (1d12 → 4d12)
 */

import { AbstractCone, type ConeConfig } from '../../core/AbstractCone'
import type { Point } from '../../types'

export type PoisonSprayConfig = {
  position: Point // Caster position
  // Direction specification (one required)
  direction?: number // Direction in radians
  targetPosition?: Point // Or point to aim at
  // Optional overrides
  casterLevel?: number // 1-20, affects damage (1d12 at 1st, 2d12 at 5th, etc.)
  power?: 'normal' | 'empowered'
  size?: number // Cone length override (default 50px = 10 feet)
  color?: string
}

export class PoisonSpray extends AbstractCone {
  constructor(config: PoisonSprayConfig) {
    const {
      position,
      direction,
      targetPosition,
      casterLevel = 1,
      power = 'normal',
      size = 50, // 10 feet = 50px
      color = '#9ACD32'
    } = config

    // Cantrip scaling: 1d12 at 1st, 2d12 at 5th, 3d12 at 11th, 4d12 at 17th
    const diceCount = Math.floor((casterLevel - 1) / 6) + 1
    const powerMultiplier = power === 'empowered' ? 1.2 : 1

    const coneConfig: ConeConfig = {
      name: 'Poison Spray',
      position,
      direction,
      targetPosition,
      size,
      angle: 60, // Standard cone
      color,
      opacity: 0.6, // Semi-transparent mist
      duration: 800, // Slightly longer for billowing effect

      // Billowing poison mist
      pulsing: true,
      pulseSpeed: 2,

      // Glow effect - sickly green
      glow: {
        enabled: true,
        color: '#ADFF2F', // Yellow-green glow
        intensity: 0.8 * powerMultiplier,
        radius: size * 1.2,
        pulsing: true,
        pulseSpeed: 2
      },

      // Particle effects - poison droplets
      particles: {
        enabled: true,
        count: 30 * diceCount,
        size: 4,
        speed: 100,
        lifetime: 1000,
        color: '#32CD32', // Lime green droplets
        spread: 60, // Match cone angle
        gravity: true // Droplets fall
      },

      // Sound effect
      sound: {
        enabled: true,
        soundId: 'poison_spray_cast',
        volume: 0.5,
        pitch: 0.9 // Lower pitch for poison
      },

      // Metadata
      metadata: {
        spellLevel: 0, // Cantrip
        school: 'conjuration',
        damageType: 'poison',
        damageDice: `${diceCount}d12`, // Cantrip scaling
        saveType: 'constitution',
        power,
        casterLevel,
        range: 10, // 10-foot cone
        area: Math.round((size / 5) * (size / 5) * 0.5)
      }
    }

    super(coneConfig)
  }

  /**
   * Create Poison Spray at specific caster level (cantrip scaling)
   */
  static createAtLevel(position: Point, target: Point, casterLevel: number): PoisonSpray {
    return new PoisonSpray({
      position,
      targetPosition: target,
      casterLevel
    })
  }

  /**
   * Create empowered Poison Spray
   */
  static createEmpowered(position: Point, target: Point): PoisonSpray {
    return new PoisonSpray({
      position,
      targetPosition: target,
      power: 'empowered',
      color: '#228B22' // Darker forest green
    })
  }

  /**
   * Create high-level Poison Spray (4d12 damage)
   */
  static createMaximized(position: Point, target: Point): PoisonSpray {
    return new PoisonSpray({
      position,
      targetPosition: target,
      casterLevel: 17, // 4d12 damage
      power: 'empowered',
      color: '#006400' // Dark green
    })
  }

  /**
   * Create Poison Spray with specific direction
   */
  static createDirectional(position: Point, direction: number, casterLevel: number = 1): PoisonSpray {
    return new PoisonSpray({
      position,
      direction,
      casterLevel
    })
  }
}
