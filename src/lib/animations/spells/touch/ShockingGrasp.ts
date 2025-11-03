/**
 * Shocking Grasp Spell Animation
 *
 * A D&D touch cantrip that delivers an electric shock on contact.
 *
 * D&D 5e Specs:
 * - Level: Cantrip (evocation)
 * - Range: Touch
 * - Damage: 1d8 lightning damage (scales with level)
 * - Effect: Target can't take reactions until start of its next turn
 * - Advantage: Against targets wearing metal armor
 *
 * Animation Features:
 * - Small electric burst at touch point
 * - Blue/white electric arcs
 * - Crackling electricity effect
 * - Very short duration (instant touch)
 * - Electric spark particles
 * - Small radius (touch only)
 */

import { AbstractBurst, type BurstConfig } from '../../core/AbstractBurst'
import type { Point } from '../../types'

export type ShockingGraspConfig = {
  position: Point // Touch contact point
  // Optional overrides
  casterLevel?: number // 1-20, affects damage (1d8 → 4d8)
  power?: 'normal' | 'empowered'
  hasAdvantage?: boolean // True if target wears metal armor
  size?: number // Touch burst radius
  color?: string
}

export class ShockingGrasp extends AbstractBurst {
  constructor(config: ShockingGraspConfig) {
    const {
      position,
      casterLevel = 1,
      power = 'normal',
      hasAdvantage = false,
      size = 25, // Small touch burst
      color = '#00BFFF'
    } = config

    // Cantrip scaling: 1d8 at 1st, 2d8 at 5th, 3d8 at 11th, 4d8 at 17th
    const diceCount = Math.floor((casterLevel - 1) / 6) + 1
    const powerMultiplier = power === 'empowered' ? 1.2 : 1
    const advantageMultiplier = hasAdvantage ? 1.15 : 1 // Visual bonus for advantage

    const burstConfig: BurstConfig = {
      name: 'Shocking Grasp',
      position,
      shape: 'circle',
      radius: size * powerMultiplier * advantageMultiplier,
      duration: 400, // Very fast touch
      color,
      opacity: 0.9,

      // Fast expansion for electric touch
      expansionDuration: 150,
      peakDuration: 100,
      fadeDuration: 150,

      // Electric glow
      glow: {
        enabled: true,
        color: '#FFFFFF', // Bright white electric
        intensity: 1.5 * powerMultiplier,
        radius: size * 2,
        pulsing: false // Instant shock
      },

      // Electric spark particles
      particles: {
        enabled: true,
        count: 25 * diceCount,
        size: 4,
        speed: 150,
        lifetime: 500,
        color: '#FFFF00', // Yellow sparks
        spread: 360, // All directions from touch
        gravity: false
      },

      // Sound effect
      sound: {
        enabled: true,
        soundId: 'shocking_grasp_cast',
        volume: 0.7,
        pitch: 1.3 // High pitch for electric shock
      },

      // Metadata
      metadata: {
        spellLevel: 0, // Cantrip
        school: 'evocation',
        damageType: 'lightning',
        damageDice: `${diceCount}d8`, // Cantrip scaling
        power,
        casterLevel,
        hasAdvantage,
        range: 'touch',
        preventReactions: true, // Special effect
        isTouch: true // Flag for touch spell logic
      }
    }

    super(burstConfig)
  }

  /**
   * Create Shocking Grasp at specific caster level (cantrip scaling)
   */
  static createAtLevel(position: Point, casterLevel: number): ShockingGrasp {
    return new ShockingGrasp({
      position,
      casterLevel
    })
  }

  /**
   * Create Shocking Grasp with advantage (metal armor)
   */
  static createWithAdvantage(position: Point, casterLevel: number = 1): ShockingGrasp {
    return new ShockingGrasp({
      position,
      casterLevel,
      hasAdvantage: true,
      color: '#0080FF', // Brighter blue for advantage
      size: 30 // Slightly larger for advantage
    })
  }

  /**
   * Create empowered Shocking Grasp
   */
  static createEmpowered(position: Point, casterLevel: number = 1): ShockingGrasp {
    return new ShockingGrasp({
      position,
      casterLevel,
      power: 'empowered',
      color: '#00FFFF' // Cyan for empowered
    })
  }

  /**
   * Create high-level Shocking Grasp (4d8 damage)
   */
  static createMaximized(position: Point): ShockingGrasp {
    return new ShockingGrasp({
      position,
      casterLevel: 17, // 4d8 damage
      power: 'empowered',
      hasAdvantage: true,
      color: '#FFFFFF', // Pure white for maximum shock
      size: 35
    })
  }
}
