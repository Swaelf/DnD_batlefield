/**
 * Bless Spell Animation
 *
 * A D&D buff spell that empowers allies with divine favor.
 *
 * D&D 5e Specs:
 * - Level: 1st level enchantment
 * - Range: 30 feet
 * - Duration: 1 minute (concentration)
 * - Targets: Up to 3 creatures
 * - Effect: +1d4 to attack rolls and saving throws
 *
 * Animation Features:
 * - Soft golden/holy light around blessed targets
 * - Gentle upward shimmer effect
 * - Small radius burst (blessing aura)
 * - Divine, holy appearance
 * - Can persist as visual indicator
 */

import { AbstractBurst, type BurstConfig } from '../../core/AbstractBurst'
import type { Point } from '../../types'

export type BlessConfig = {
  position: Point // Target creature position
  // Optional overrides
  spellLevel?: number // 1-9, affects number of targets
  power?: 'normal' | 'empowered'
  persistent?: boolean // Whether blessing visual persists
  size?: number // Blessing aura radius
  color?: string
}

export class Bless extends AbstractBurst {
  constructor(config: BlessConfig) {
    const {
      position,
      spellLevel = 1,
      power = 'normal',
      persistent = false,
      size = 30, // Small blessing aura
      color = '#FFFFE0'
    } = config

    // Number of targets increases with spell level (3 + 1 per level above 1st)
    const targetCount = 3 + (spellLevel - 1)
    const powerMultiplier = power === 'empowered' ? 1.2 : 1

    const burstConfig: BurstConfig = {
      name: 'Bless',
      position,
      shape: 'circle',
      radius: size * powerMultiplier,
      duration: 600, // Quick blessing application
      color,
      opacity: 0.6, // Semi-transparent holy light

      // Gentle expansion for blessing
      expansionDuration: 300,
      peakDuration: 200,
      fadeDuration: 100,

      // Soft holy glow
      glow: {
        enabled: true,
        color: '#FFFFFF', // Pure white holy light
        intensity: 0.8 * powerMultiplier,
        radius: size * 1.3,
        pulsing: true,
        pulseSpeed: 1.5 // Slow, gentle pulse
      },

      // Gentle upward shimmer particles
      particles: {
        enabled: true,
        count: 20 * powerMultiplier,
        size: 4,
        speed: -60, // Gentle upward float
        lifetime: 1000,
        color: '#FFD700', // Golden shimmer
        spread: 360,
        gravity: false
      },

      // Sound effect
      sound: {
        enabled: true,
        soundId: 'bless_cast',
        volume: 0.5,
        pitch: 1.4 // High, holy pitch
      },

      // Metadata
      metadata: {
        spellLevel,
        school: 'enchantment',
        duration: 600000, // 10 minutes in ms (1 minute = 10 rounds)
        concentration: true,
        bonusDice: '1d4',
        targetCount,
        power,
        range: 30, // 30 feet
        isBuff: true, // Flag for buff logic
        persistent // Whether visual persists
      }
    }

    super(burstConfig)
  }

  /**
   * Create an upcasted Bless (more targets)
   */
  static createUpcasted(position: Point, spellLevel: number): Bless {
    return new Bless({
      position,
      spellLevel
    })
  }

  /**
   * Create an empowered Bless
   */
  static createEmpowered(position: Point): Bless {
    return new Bless({
      position,
      power: 'empowered',
      color: '#FFD700', // Brighter gold
      size: 40
    })
  }

  /**
   * Create persistent Bless (visual indicator remains)
   */
  static createPersistent(position: Point, spellLevel: number = 1): Bless {
    return new Bless({
      position,
      spellLevel,
      persistent: true
    })
  }

  /**
   * Create Mass Bless (many targets)
   */
  static createMass(position: Point): Bless {
    return new Bless({
      position,
      spellLevel: 9, // Max targets
      power: 'empowered',
      size: 50,
      color: '#FFFFFF' // Pure white for mass blessing
    })
  }
}
