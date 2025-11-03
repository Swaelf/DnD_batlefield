/**
 * Cone of Cold Spell Animation
 *
 * A D&D 5th-level evocation spell that blasts freezing air.
 *
 * D&D 5e Specs:
 * - Level: 5th level evocation
 * - Range: Self (60-foot cone)
 * - Damage: 8d8 cold damage
 * - Save: Constitution saving throw for half damage
 *
 * Animation Features:
 * - 60-foot cone of freezing wind
 * - Blue/white ice colors with crystalline effects
 * - Particle effects for ice shards and snowflakes
 * - Pulsing cold intensity
 * - Frost trails
 */

import { AbstractCone, type ConeConfig } from '../../core/AbstractCone'
import type { Point } from '../../types'

export type ConeOfColdConfig = {
  position: Point // Caster position
  // Direction specification (one required)
  direction?: number // Direction in radians
  targetPosition?: Point // Or point to aim at
  // Optional overrides
  spellLevel?: number // 5-9, affects damage and size
  power?: 'normal' | 'empowered'
  size?: number // Cone length override (default 300px = 60 feet)
  color?: string
}

export class ConeOfCold extends AbstractCone {
  constructor(config: ConeOfColdConfig) {
    const {
      position,
      direction,
      targetPosition,
      spellLevel = 5,
      power = 'normal',
      size = 300, // 60 feet = 300px
      color = '#87CEEB'
    } = config

    // Scale with spell level
    const levelMultiplier = 1 + (spellLevel - 5) * 0.15
    const powerMultiplier = power === 'empowered' ? 1.3 : 1
    const finalSize = size * levelMultiplier

    const coneConfig: ConeConfig = {
      name: 'Cone of Cold',
      position,
      direction,
      targetPosition,
      size: finalSize,
      angle: 60, // Standard D&D cone
      color,
      opacity: 0.75,
      duration: 800, // Longer for freezing effect

      // Pulsing freezing effect
      pulsing: true,
      pulseSpeed: 2.5,

      // Glow effect - icy blue-white
      glow: {
        enabled: true,
        color: '#E0FFFF', // Light cyan glow
        intensity: 1.5 * powerMultiplier,
        radius: finalSize * 0.7,
        pulsing: true,
        pulseSpeed: 3
      },

      // Particle effects - ice shards and snowflakes
      particles: {
        enabled: true,
        count: 80 * powerMultiplier,
        size: 8,
        speed: 200,
        lifetime: 1200,
        color: '#FFFFFF', // White ice crystals
        spread: 60, // Match cone angle
        gravity: false
      },

      // Sound effect
      sound: {
        enabled: true,
        soundId: 'cone_of_cold_cast',
        volume: 0.9,
        pitch: 0.8 // Lower pitch for deep cold
      },

      // Metadata
      metadata: {
        spellLevel,
        school: 'evocation',
        damageType: 'cold',
        damageDice: `${spellLevel + 3}d8`, // 8d8 at 5th, 9d8 at 6th, etc.
        saveType: 'constitution',
        power,
        range: 60, // 60-foot cone
        area: Math.round((finalSize / 5) * (finalSize / 5) * 0.5)
      }
    }

    super(coneConfig)
  }

  /**
   * Create an upcasted Cone of Cold (higher spell level)
   */
  static createUpcasted(position: Point, target: Point, spellLevel: number): ConeOfCold {
    return new ConeOfCold({
      position,
      targetPosition: target,
      spellLevel
    })
  }

  /**
   * Create an empowered Cone of Cold
   */
  static createEmpowered(position: Point, target: Point): ConeOfCold {
    return new ConeOfCold({
      position,
      targetPosition: target,
      power: 'empowered',
      color: '#4682B4' // Steel blue for empowered
    })
  }

  /**
   * Create maximized Cone of Cold (9th level + empowered)
   */
  static createMaximized(position: Point, target: Point): ConeOfCold {
    return new ConeOfCold({
      position,
      targetPosition: target,
      spellLevel: 9,
      power: 'empowered',
      color: '#191970' // Midnight blue for maximum cold
    })
  }

  /**
   * Create Cone of Cold with specific direction
   */
  static createDirectional(position: Point, direction: number, spellLevel: number = 5): ConeOfCold {
    return new ConeOfCold({
      position,
      direction,
      spellLevel
    })
  }

  /**
   * Create quick frost (shorter duration)
   */
  static createQuickFrost(position: Point, target: Point): ConeOfCold {
    const cone = new ConeOfCold({
      position,
      targetPosition: target
    })
    // Override duration for quick blast
    cone['animation'].duration = 500
    return cone
  }
}
