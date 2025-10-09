/**
 * Sacred Flame Spell Animation
 *
 * A D&D cantrip that calls down radiant flame from above.
 *
 * D&D 5e Specs:
 * - Level: Cantrip (evocation)
 * - Range: 60 feet
 * - Damage: 1d8 radiant damage (scales with level)
 * - Save: Dexterity saving throw (no effect on success)
 * - Effect: Flame-like radiance descends on creature from above
 * - Special: Ignores cover
 *
 * Animation Features:
 * - Vertical pillar of golden radiant light
 * - Top-down descending animation
 * - Radiant glow and shimmer
 * - Holy sparkle particles
 * - Cantrip scaling at 5th, 11th, 17th levels
 */

import { AbstractBurst, type BurstConfig } from '../../core/AbstractBurst'
import type { Point } from '../../types'

export type SacredFlameConfig = {
  position: Point // Target position
  // Optional overrides
  casterLevel?: number // 1-20, affects damage (1d8 → 4d8)
  power?: 'normal' | 'empowered'
  size?: number // Pillar radius
  height?: number // Visual height indicator
  color?: string
}

export class SacredFlame extends AbstractBurst {
  constructor(config: SacredFlameConfig) {
    const {
      position,
      casterLevel = 1,
      power = 'normal',
      size = 25, // 5-foot radius pillar
      height = 60, // Visual height for pillar effect
      color = '#FFD700'
    } = config

    // Cantrip scaling: 1d8 at 1st, 2d8 at 5th, 3d8 at 11th, 4d8 at 17th
    const diceCount = Math.floor((casterLevel - 1) / 6) + 1
    const powerMultiplier = power === 'empowered' ? 1.3 : 1

    const burstConfig: BurstConfig = {
      name: 'Sacred Flame',
      position,
      shape: 'circle', // Circular pillar base
      radius: size * powerMultiplier,
      duration: 800, // Medium duration for dramatic effect
      color,
      opacity: 0.9,

      // Pillar-specific timing: descend → peak → fade
      expansionDuration: 300, // Descending from above
      peakDuration: 200, // Bright radiant moment
      fadeDuration: 300, // Ascending/fading

      // Radiant glow effect
      glow: {
        enabled: true,
        color: '#FFFFFF', // Pure white radiance
        intensity: 2 * powerMultiplier, // Intense holy light
        radius: size * 3,
        pulsing: true,
        pulseSpeed: 2 // Fast holy pulse
      },

      // Holy sparkle particles (ascending from pillar)
      particles: {
        enabled: true,
        count: 30 * diceCount, // More particles with higher level
        size: 5,
        speed: -120, // Negative = upward (ascending to heavens)
        lifetime: 800,
        color: '#FFFACD', // Light golden yellow sparkles
        spread: 360, // Radial spread from pillar
        gravity: false // Divine particles float upward
      },

      // Sound effect
      sound: {
        enabled: true,
        soundId: 'sacred_flame_cast',
        volume: 0.8,
        pitch: 1.4 // High pitch for divine magic
      },

      // Metadata
      metadata: {
        spellLevel: 0, // Cantrip
        school: 'evocation',
        damageType: 'radiant',
        damageDice: `${diceCount}d8`, // Cantrip scaling
        saveType: 'dexterity',
        power,
        casterLevel,
        range: 60, // 60 feet
        ignoresCover: true, // Special property
        isPillar: true, // Flag for pillar spell type
        pillarHeight: height
      }
    }

    super(burstConfig)
  }

  /**
   * Create Sacred Flame at specific caster level (cantrip scaling)
   */
  static createAtLevel(position: Point, casterLevel: number): SacredFlame {
    return new SacredFlame({
      position,
      casterLevel
    })
  }

  /**
   * Create empowered Sacred Flame
   */
  static createEmpowered(position: Point, casterLevel: number = 1): SacredFlame {
    return new SacredFlame({
      position,
      casterLevel,
      power: 'empowered',
      color: '#FFF8DC' // Brighter cornsilk for empowered
    })
  }

  /**
   * Create maximized Sacred Flame (4d8 damage)
   */
  static createMaximized(position: Point): SacredFlame {
    return new SacredFlame({
      position,
      casterLevel: 17, // 4d8 damage
      power: 'empowered',
      color: '#FFFAFA', // Pure white for maximum radiance
      size: 30, // Larger pillar
      height: 80 // Taller pillar
    })
  }

  /**
   * Create Sacred Flame with custom radiant color
   */
  static createCustomRadiance(
    position: Point,
    casterLevel: number,
    radianceColor: string
  ): SacredFlame {
    return new SacredFlame({
      position,
      casterLevel,
      color: radianceColor
    })
  }
}
