/**
 * Breath Weapon Animation
 *
 * A generic dragon breath weapon / Breath of the Dragon effect.
 * Supports multiple damage types and ranges based on dragon type.
 *
 * D&D 5e Dragonborn Breath Weapon:
 * - Range: 15 feet (cone) or 30 feet (line) depending on ancestry
 * - Damage: 2d6 (scales with level)
 * - Save: Dexterity or Constitution
 *
 * Animation Features:
 * - Variable cone length (15/30/60 feet)
 * - Multiple damage type colors (fire, cold, acid, lightning, poison)
 * - Intense particle effects
 * - Dragon-themed visual style
 */

import { AbstractCone, type ConeConfig } from '../../core/AbstractCone'
import type { Point } from '../../types'

export type BreathType = 'fire' | 'cold' | 'acid' | 'lightning' | 'poison'

export type BreathWeaponConfig = {
  position: Point // Caster/dragon position
  // Direction specification (one required)
  direction?: number // Direction in radians
  targetPosition?: Point // Or point to aim at
  // Breath weapon specific
  breathType?: BreathType // Type of breath weapon
  range?: 15 | 30 | 60 // Cone range in feet
  // Optional overrides
  damageLevel?: number // Character/dragon level for damage scaling
  power?: 'normal' | 'empowered'
  color?: string // Override default color for breath type
}

export class BreathWeapon extends AbstractCone {
  constructor(config: BreathWeaponConfig) {
    const {
      position,
      direction,
      targetPosition,
      breathType = 'fire',
      range = 15,
      damageLevel = 1,
      power = 'normal',
      color
    } = config

    // Damage scaling: 2d6 base, increases every 6 levels
    const diceCount = 2 + Math.floor(damageLevel / 6)
    const powerMultiplier = power === 'empowered' ? 1.3 : 1

    // Convert range to pixels (5px per foot)
    const size = range * 5

    // Default colors by breath type
    const breathColors: Record<BreathType, string> = {
      fire: '#FF6B35',
      cold: '#87CEEB',
      acid: '#9ACD32',
      lightning: '#FFD700',
      poison: '#32CD32'
    }

    // Glow colors by type
    const glowColors: Record<BreathType, string> = {
      fire: '#FFA500',
      cold: '#E0FFFF',
      acid: '#ADFF2F',
      lightning: '#FFFF00',
      poison: '#ADFF2F'
    }

    const finalColor = color || breathColors[breathType]

    const coneConfig: ConeConfig = {
      name: `${breathType.charAt(0).toUpperCase() + breathType.slice(1)} Breath`,
      position,
      direction,
      targetPosition,
      size,
      angle: 60, // Standard cone angle
      color: finalColor,
      opacity: 0.8,
      duration: 700, // Dragon breath duration

      // Intense pulsing effect
      pulsing: true,
      pulseSpeed: 4,

      // Glow effect - intense dragon energy
      glow: {
        enabled: true,
        color: glowColors[breathType],
        intensity: 1.5 * powerMultiplier,
        radius: size * 0.9,
        pulsing: true,
        pulseSpeed: 5
      },

      // Particle effects - intense breath particles
      particles: {
        enabled: true,
        count: 100 * powerMultiplier,
        size: 10,
        speed: 250,
        lifetime: 900,
        color: glowColors[breathType],
        spread: 60, // Match cone angle
        gravity: breathType === 'acid' || breathType === 'poison' // Only acid/poison fall
      },

      // Sound effect
      sound: {
        enabled: true,
        soundId: `breath_weapon_${breathType}`,
        volume: 1.0,
        pitch: 0.85 // Deep dragon roar
      },

      // Metadata
      metadata: {
        breathType,
        damageType: breathType,
        damageDice: `${diceCount}d6`,
        saveType: breathType === 'cold' || breathType === 'poison' ? 'constitution' : 'dexterity',
        power,
        damageLevel,
        range,
        area: Math.round((size / 5) * (size / 5) * 0.5)
      }
    }

    super(coneConfig)
  }

  /**
   * Create Fire Breath
   */
  static createFireBreath(position: Point, target: Point, damageLevel: number = 1): BreathWeapon {
    return new BreathWeapon({
      position,
      targetPosition: target,
      breathType: 'fire',
      range: 15,
      damageLevel
    })
  }

  /**
   * Create Cold Breath (White/Silver Dragon)
   */
  static createColdBreath(position: Point, target: Point, damageLevel: number = 1): BreathWeapon {
    return new BreathWeapon({
      position,
      targetPosition: target,
      breathType: 'cold',
      range: 30, // Longer range for cold
      damageLevel
    })
  }

  /**
   * Create Acid Breath (Black/Copper Dragon)
   */
  static createAcidBreath(position: Point, target: Point, damageLevel: number = 1): BreathWeapon {
    return new BreathWeapon({
      position,
      targetPosition: target,
      breathType: 'acid',
      range: 15,
      damageLevel
    })
  }

  /**
   * Create Lightning Breath (Blue/Bronze Dragon)
   */
  static createLightningBreath(position: Point, target: Point, damageLevel: number = 1): BreathWeapon {
    return new BreathWeapon({
      position,
      targetPosition: target,
      breathType: 'lightning',
      range: 30,
      damageLevel
    })
  }

  /**
   * Create Poison Breath (Green Dragon)
   */
  static createPoisonBreath(position: Point, target: Point, damageLevel: number = 1): BreathWeapon {
    return new BreathWeapon({
      position,
      targetPosition: target,
      breathType: 'poison',
      range: 15,
      damageLevel
    })
  }

  /**
   * Create ancient dragon breath (maximum power)
   */
  static createAncientBreath(position: Point, target: Point, breathType: BreathType): BreathWeapon {
    return new BreathWeapon({
      position,
      targetPosition: target,
      breathType,
      range: 60, // Ancient dragons have longer range
      damageLevel: 20, // Maximum damage scaling
      power: 'empowered'
    })
  }
}
