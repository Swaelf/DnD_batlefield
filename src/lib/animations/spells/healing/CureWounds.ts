/**
 * Cure Wounds Spell Animation
 *
 * A D&D healing spell that restores hit points with warm, golden light.
 *
 * D&D 5e Specs:
 * - Level: 1st level evocation
 * - Range: Touch
 * - Healing: 1d8 + spellcasting modifier
 * - Target: One creature
 *
 * Animation Features:
 * - Warm golden/yellow light burst around target
 * - Gentle pulsing glow effect
 * - Upward-floating light particles (positive energy)
 * - Soft, soothing appearance (not aggressive)
 * - Brief duration for touch healing
 */

import { AbstractBurst, type BurstConfig } from '../../core/AbstractBurst'
import type { Point } from '../../types'

export type CureWoundsConfig = {
  position: Point // Target creature position
  // Optional overrides
  spellLevel?: number // 1-9, affects healing and intensity
  healingBonus?: number // Spellcasting modifier bonus
  power?: 'normal' | 'empowered'
  size?: number // Healing burst radius
  color?: string
}

export class CureWounds extends AbstractBurst {
  constructor(config: CureWoundsConfig) {
    const {
      position,
      spellLevel = 1,
      healingBonus = 0,
      power = 'normal',
      size = 40, // Gentle burst around target
      color = '#FFD700'
    } = config

    // Calculate healing amount: 1d8 per level + bonus
    const healingDice = spellLevel
    const averageHealing = (healingDice * 4.5) + healingBonus // Average d8 = 4.5
    const powerMultiplier = power === 'empowered' ? 1.2 : 1

    const burstConfig: BurstConfig = {
      name: 'Cure Wounds',
      position,
      shape: 'circle',
      radius: size * powerMultiplier,
      duration: 800, // Gentle, not instant
      color,
      opacity: 0.7,

      // Gentle expansion for healing
      expansionDuration: 400,
      peakDuration: 200,
      fadeDuration: 200,

      // Soft pulsing glow
      glow: {
        enabled: true,
        color: '#FFFFE0', // Light yellow
        intensity: 0.9 * powerMultiplier,
        radius: size * 1.5,
        pulsing: true,
        pulseSpeed: 2
      },

      // Upward-floating light particles (positive energy)
      particles: {
        enabled: true,
        count: 30 * powerMultiplier,
        size: 6,
        speed: -80, // Negative = upward
        lifetime: 1200,
        color: '#FFFFFF', // White light
        spread: 360, // All around target
        gravity: false // Float upward
      },

      // Sound effect
      sound: {
        enabled: true,
        soundId: 'cure_wounds_cast',
        volume: 0.6,
        pitch: 1.2 // Higher pitch for healing
      },

      // Metadata
      metadata: {
        spellLevel,
        school: 'evocation',
        healingDice: `${healingDice}d8`,
        healingBonus,
        averageHealing: Math.round(averageHealing),
        power,
        range: 'touch',
        isHealing: true // Flag for special healing logic
      }
    }

    super(burstConfig)
  }

  /**
   * Create an upcasted Cure Wounds (higher spell level)
   */
  static createUpcasted(position: Point, spellLevel: number, healingBonus: number = 0): CureWounds {
    return new CureWounds({
      position,
      spellLevel,
      healingBonus
    })
  }

  /**
   * Create an empowered Cure Wounds
   */
  static createEmpowered(position: Point, healingBonus: number = 0): CureWounds {
    return new CureWounds({
      position,
      healingBonus,
      power: 'empowered',
      color: '#FFA500' // Brighter orange-gold
    })
  }

  /**
   * Create maximized Cure Wounds (9th level + empowered)
   */
  static createMaximized(position: Point, healingBonus: number = 0): CureWounds {
    return new CureWounds({
      position,
      spellLevel: 9,
      healingBonus,
      power: 'empowered',
      color: '#FF8C00', // Dark orange for maximum healing
      size: 60
    })
  }

  /**
   * Create quick heal (shorter duration)
   */
  static createQuick(position: Point, spellLevel: number = 1, healingBonus: number = 0): CureWounds {
    const heal = new CureWounds({
      position,
      spellLevel,
      healingBonus
    })
    // Override durations for faster heal
    heal['animation'].duration = 500
    heal['animation'].expansionDuration = 250
    heal['animation'].peakDuration = 100
    heal['animation'].fadeDuration = 150
    return heal
  }
}
