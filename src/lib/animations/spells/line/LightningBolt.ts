/**
 * Lightning Bolt Spell Animation
 *
 * A D&D line spell that shoots a bolt of lightning in a straight line.
 *
 * D&D 5e Specs:
 * - Level: 3rd level evocation
 * - Range: Self (100-foot line)
 * - Damage: 8d6 lightning damage
 * - Save: Dexterity saving throw for half damage
 * - Area: 100-foot long, 5-foot wide line
 *
 * Animation Features:
 * - Jagged lightning bolt (segmented ray)
 * - Electric blue/white colors
 * - Flickering/crackling effect
 * - Instant appearance (speed of lightning)
 * - Electric spark particles along path
 * - Screen shake on cast
 */

import { AbstractRay, type RayConfig } from '../../core/AbstractRay'
import type { Point } from '../../types'

export type LightningBoltConfig = {
  fromPosition: Point // Caster position
  toPosition: Point // End point of line
  // Optional overrides
  spellLevel?: number // 3-9, affects damage
  power?: 'normal' | 'empowered'
  width?: number // Line width (default 5 feet = 25px)
  color?: string
}

export class LightningBolt extends AbstractRay {
  constructor(config: LightningBoltConfig) {
    const {
      fromPosition,
      toPosition,
      spellLevel = 3,
      power = 'normal',
      width = 25, // 5 feet = 25px
      color = '#00BFFF'
    } = config

    // Scale with spell level
    const powerMultiplier = power === 'empowered' ? 1.3 : 1
    const finalWidth = width * powerMultiplier

    const rayConfig: RayConfig = {
      name: 'Lightning Bolt',
      fromPosition,
      toPosition,
      duration: 300, // Very fast (lightning speed)
      width: finalWidth,
      color,
      size: finalWidth,
      opacity: 1, // Fully opaque lightning

      // Jagged lightning effect (multiple segments)
      segments: 8, // Creates zigzag lightning path
      taper: false, // Consistent width

      // Intense flickering
      flickering: true,

      // No flowing (lightning is instant)
      flowing: false,

      // Single bolt (not multi-ray)
      rayCount: 1,

      // Intense electric glow
      glow: {
        enabled: true,
        color: '#FFFFFF', // Bright white
        intensity: 2 * powerMultiplier,
        radius: finalWidth * 4,
        pulsing: false // Instant flash
      },

      // Electric spark particles along bolt
      particles: {
        enabled: true,
        count: 60 * powerMultiplier,
        size: 6,
        speed: 200,
        lifetime: 400,
        color: '#FFFF00', // Yellow electric sparks
        spread: 30, // Along bolt path
        gravity: false
      },

      // Sound effect
      sound: {
        enabled: true,
        soundId: 'lightning_bolt_cast',
        volume: 1.0,
        pitch: 1.1 // High pitch for electricity
      },

      // Metadata
      metadata: {
        spellLevel,
        school: 'evocation',
        damageType: 'lightning',
        damageDice: `${spellLevel + 5}d6`, // 8d6 at 3rd, 9d6 at 4th, etc.
        saveType: 'dexterity',
        power,
        range: 100, // 100-foot line
        lineWidth: 5, // 5-foot wide
        area: 500 // 100ft × 5ft = 500 sq ft
      }
    }

    super(rayConfig)
  }

  /**
   * Create an upcasted Lightning Bolt (higher spell level)
   */
  static createUpcasted(from: Point, to: Point, spellLevel: number): LightningBolt {
    return new LightningBolt({
      fromPosition: from,
      toPosition: to,
      spellLevel
    })
  }

  /**
   * Create an empowered Lightning Bolt
   */
  static createEmpowered(from: Point, to: Point): LightningBolt {
    return new LightningBolt({
      fromPosition: from,
      toPosition: to,
      power: 'empowered',
      color: '#0080FF', // Brighter blue
      width: 30
    })
  }

  /**
   * Create maximized Lightning Bolt (9th level + empowered)
   */
  static createMaximized(from: Point, to: Point): LightningBolt {
    return new LightningBolt({
      fromPosition: from,
      toPosition: to,
      spellLevel: 9,
      power: 'empowered',
      color: '#FFFFFF', // Pure white for maximum power
      width: 35
    })
  }

  /**
   * Create Chain Lightning variant (branches to multiple targets)
   */
  static createChainLightning(from: Point, to: Point): LightningBolt {
    return new LightningBolt({
      fromPosition: from,
      toPosition: to,
      spellLevel: 6, // Chain Lightning is 6th level
      power: 'empowered',
      color: '#00FFFF' // Cyan for chain lightning
    })
  }
}
