/**
 * Burning Hands Spell Animation
 *
 * A D&D 1st-level evocation spell that creates a cone of flame.
 *
 * D&D 5e Specs:
 * - Level: 1st level evocation
 * - Range: Self (15-foot cone)
 * - Damage: 3d6 fire damage
 * - Save: Dexterity saving throw for half damage
 *
 * Animation Features:
 * - 15-foot cone of roaring flames
 * - Orange/red fire colors with yellow highlights
 * - Particle effects for embers and sparks
 * - Pulsing intensity
 * - Short duration (instant effect)
 */

import { AbstractCone, type ConeConfig } from '../../core/AbstractCone'
import type { Point } from '../../types'

export type BurningHandsConfig = {
  position: Point // Caster position (origin of cone)
  // Direction specification (one required)
  direction?: number // Direction in radians
  targetPosition?: Point // Or point to aim at
  // Optional overrides
  spellLevel?: number // 1-9, affects damage and intensity
  power?: 'normal' | 'empowered'
  size?: number // Cone length override (default 75px = 15 feet)
  color?: string
}

export class BurningHands extends AbstractCone {
  constructor(config: BurningHandsConfig) {
    const {
      position,
      direction,
      targetPosition,
      spellLevel = 1,
      power = 'normal',
      size = 75, // 15 feet = 75px (5px per foot)
      color = '#FF6B35'
    } = config

    // Scale with spell level
    const levelMultiplier = 1 + (spellLevel - 1) * 0.1
    const powerMultiplier = power === 'empowered' ? 1.2 : 1
    const finalSize = size * levelMultiplier

    const coneConfig: ConeConfig = {
      name: 'Burning Hands',
      position,
      direction,
      targetPosition,
      size: finalSize,
      angle: 60, // Standard D&D cone angle
      color,
      opacity: 0.8,
      duration: 600, // Short burst

      // Pulsing fire effect
      pulsing: true,
      pulseSpeed: 3, // Fast pulse for flames

      // Glow effect - bright orange fire
      glow: {
        enabled: true,
        color: '#FFA500', // Orange glow
        intensity: 1.2 * powerMultiplier,
        radius: finalSize * 0.8,
        pulsing: true,
        pulseSpeed: 4
      },

      // Particle effects - fire embers and sparks
      particles: {
        enabled: true,
        count: 50 * powerMultiplier,
        size: 6,
        speed: 150,
        lifetime: 800,
        color: '#FFFF00', // Yellow sparks
        spread: 60, // Match cone angle
        gravity: false
      },

      // Sound effect
      sound: {
        enabled: true,
        soundId: 'burning_hands_cast',
        volume: 0.8,
        pitch: 1.0
      },

      // Metadata
      metadata: {
        spellLevel,
        school: 'evocation',
        damageType: 'fire',
        damageDice: `${spellLevel + 2}d6`, // 3d6 at 1st, 4d6 at 2nd, etc.
        saveType: 'dexterity',
        power,
        range: 15, // 15-foot cone
        area: Math.round((finalSize / 5) * (finalSize / 5) * 0.5) // Approximate sq ft
      }
    }

    super(coneConfig)
  }

  /**
   * Create an upcasted Burning Hands (higher spell level)
   */
  static createUpcasted(position: Point, target: Point, spellLevel: number): BurningHands {
    return new BurningHands({
      position,
      targetPosition: target,
      spellLevel
    })
  }

  /**
   * Create an empowered Burning Hands
   */
  static createEmpowered(position: Point, target: Point): BurningHands {
    return new BurningHands({
      position,
      targetPosition: target,
      power: 'empowered',
      color: '#FF4500' // Brighter red-orange
    })
  }

  /**
   * Create maximized Burning Hands (high level + empowered)
   */
  static createMaximized(position: Point, target: Point): BurningHands {
    return new BurningHands({
      position,
      targetPosition: target,
      spellLevel: 9,
      power: 'empowered',
      color: '#FF0000' // Bright red for maximum power
    })
  }

  /**
   * Create Burning Hands with specific direction (radians)
   */
  static createDirectional(position: Point, direction: number, spellLevel: number = 1): BurningHands {
    return new BurningHands({
      position,
      direction,
      spellLevel
    })
  }
}
