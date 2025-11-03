/**
 * Heal Spell Animation
 *
 * A D&D powerful healing spell that restores a large amount of hit points.
 *
 * D&D 5e Specs:
 * - Level: 6th level evocation
 * - Range: 60 feet
 * - Healing: 70 hit points
 * - Target: One creature
 * - Special: Also ends blindness, deafness, and disease
 *
 * Animation Features:
 * - Brilliant white/golden light burst
 * - Intense radiant glow
 * - Large number of upward-floating particles
 * - More powerful than Cure Wounds
 * - Slightly longer duration for major healing
 */

import { AbstractBurst, type BurstConfig } from '../../core/AbstractBurst'
import type { Point } from '../../types'

export type HealConfig = {
  position: Point // Target creature position
  // Optional overrides
  spellLevel?: number // 6-9, affects healing amount
  power?: 'normal' | 'empowered'
  size?: number // Healing burst radius
  color?: string
}

export class Heal extends AbstractBurst {
  constructor(config: HealConfig) {
    const {
      position,
      spellLevel = 6,
      power = 'normal',
      size = 60, // Larger burst for powerful heal
      color = '#FFFFFF'
    } = config

    // Calculate healing: 70 base + 10 per level above 6th
    const baseHealing = 70
    const bonusHealing = (spellLevel - 6) * 10
    const totalHealing = baseHealing + bonusHealing
    const powerMultiplier = power === 'empowered' ? 1.3 : 1

    const burstConfig: BurstConfig = {
      name: 'Heal',
      position,
      shape: 'star', // Star shape for radiant healing
      radius: size * powerMultiplier,
      duration: 1000, // Longer for major healing
      color,
      opacity: 0.8,

      // Dramatic expansion for major healing
      expansionDuration: 500,
      peakDuration: 300,
      fadeDuration: 200,

      // Intense radiant glow
      glow: {
        enabled: true,
        color: '#FFFFE0', // Brilliant light yellow
        intensity: 1.5 * powerMultiplier,
        radius: size * 2,
        pulsing: true,
        pulseSpeed: 3
      },

      // Many upward-floating particles (powerful positive energy)
      particles: {
        enabled: true,
        count: 80 * powerMultiplier,
        size: 8,
        speed: -120, // Fast upward motion
        lifetime: 1500,
        color: '#FFD700', // Golden light
        spread: 360,
        gravity: false
      },

      // Sound effect
      sound: {
        enabled: true,
        soundId: 'heal_cast',
        volume: 0.8,
        pitch: 1.3 // High pitch for powerful healing
      },

      // Metadata
      metadata: {
        spellLevel,
        school: 'evocation',
        healing: totalHealing,
        power,
        range: 60, // 60 feet
        isHealing: true,
        endsConditions: true, // Ends blindness, deafness, disease
        isMajorHealing: true // Flag for powerful healing
      }
    }

    super(burstConfig)
  }

  /**
   * Create an upcasted Heal (higher spell level)
   */
  static createUpcasted(position: Point, spellLevel: number): Heal {
    return new Heal({
      position,
      spellLevel
    })
  }

  /**
   * Create an empowered Heal
   */
  static createEmpowered(position: Point): Heal {
    return new Heal({
      position,
      power: 'empowered',
      color: '#FFD700', // Golden for empowered
      size: 80
    })
  }

  /**
   * Create maximized Heal (9th level + empowered)
   */
  static createMaximized(position: Point): Heal {
    return new Heal({
      position,
      spellLevel: 9,
      power: 'empowered',
      color: '#FFA500', // Brilliant orange-gold
      size: 100
    })
  }

  /**
   * Create Mass Heal variant (affects multiple targets)
   */
  static createMassHeal(position: Point): Heal {
    return new Heal({
      position,
      spellLevel: 9, // Mass Heal is 9th level
      power: 'empowered',
      color: '#FFFFFF', // Pure white
      size: 150 // Much larger area
    })
  }
}
