/**
 * Stone Rain Spell Animation
 *
 * A custom earth spell that creates multiple stone impacts across an area.
 *
 * Spell Specs:
 * - Level: 3rd level evocation
 * - Range: 120 feet
 * - Damage: 3d8 bludgeoning
 * - Area: 25-foot radius (100px)
 * - Effect: Multiple stone impacts in sequence
 *
 * Animation Features:
 * - Multiple burst impacts (12 stones by default)
 * - Sequential timing with intervals
 * - Random impact positions within area
 * - Stone brown colors with gray variety
 * - Dust particle effects
 * - Variable impact sizes
 */

import { AbstractBurst, type BurstConfig } from '../../core/AbstractBurst'
import type { Point } from '../../types'

export type StoneRainConfig = {
  position: Point // Center of stone rain area
  // Optional overrides
  spellLevel?: number // 3-9, affects damage
  power?: 'normal' | 'empowered'
  areaRadius?: number // Total area radius in pixels
  impactSize?: number // Individual stone impact size
  impactCount?: number // Number of stone impacts
  impactInterval?: number // Time between impacts in ms
  color?: string
  secondaryColor?: string
}

/**
 * StoneRain - Multi-burst area spell
 *
 * This is a special implementation that creates multiple sequential burst effects.
 * Since the animation library doesn't have built-in multi-burst support yet,
 * we use AbstractBurst with metadata indicating this is a multi-impact spell.
 *
 * The actual multi-burst sequencing should be handled by the renderer based on
 * the metadata properties (impactCount, impactInterval, etc.)
 */
export class StoneRain extends AbstractBurst {
  constructor(config: StoneRainConfig) {
    const {
      position,
      spellLevel = 3,
      power = 'normal',
      areaRadius = 100, // 25-foot radius
      impactSize = 15, // Small individual impacts
      impactCount = 12, // Number of stone impacts
      impactInterval = 150, // 150ms between impacts
      color = '#8B7355', // Stone brown
      secondaryColor = '#696969' // Gray
    } = config

    // Scale with spell level
    const levelMultiplier = 1 + (spellLevel - 3) * 0.1
    const powerMultiplier = power === 'empowered' ? 1.2 : 1
    const finalAreaRadius = areaRadius * powerMultiplier

    // Total duration = interval * count + final impact duration
    const totalDuration = impactInterval * impactCount + 500

    const burstConfig: BurstConfig = {
      name: 'Stone Rain',
      position,
      shape: 'circle',
      radius: finalAreaRadius, // Total area affected
      duration: totalDuration,
      color,
      opacity: 0.7,

      // Fast individual impacts
      expansionDuration: 150,
      peakDuration: 100,
      fadeDuration: 250,

      // Moderate glow for stone impacts
      glow: {
        enabled: true,
        color: secondaryColor,
        intensity: 0.8 * powerMultiplier,
        radius: impactSize * 2,
        pulsing: false
      },

      // Dust and debris particles
      particles: {
        enabled: true,
        count: 40 * levelMultiplier,
        size: 3,
        speed: 80,
        lifetime: 600,
        color: '#D2B48C', // Tan dust
        spread: 360, // Radial spread
        gravity: true // Particles fall down
      },

      // Sound effect
      sound: {
        enabled: true,
        soundId: 'stone_rain_cast',
        volume: 0.9,
        pitch: 0.8 // Low pitch for heavy stones
      },

      // Multi-burst metadata
      metadata: {
        spellLevel,
        school: 'evocation',
        damageType: 'bludgeoning',
        damageDice: `${spellLevel + 5}d8`, // 3d8 at 3rd, scales up
        saveType: 'dexterity',
        power,
        range: 120, // 120 feet
        area: finalAreaRadius,

        // Multi-burst specific properties
        isMultiBurst: true,
        impactCount,
        impactInterval,
        impactSize,
        secondaryColor,

        // Impact randomization
        randomizePositions: true,
        spreadRadius: finalAreaRadius
      }
    }

    super(burstConfig)
  }

  /**
   * Create an upcasted Stone Rain (higher spell level)
   */
  static createUpcasted(position: Point, spellLevel: number): StoneRain {
    return new StoneRain({
      position,
      spellLevel,
      impactCount: 12 + (spellLevel - 3) * 2 // More impacts at higher levels
    })
  }

  /**
   * Create an empowered Stone Rain
   */
  static createEmpowered(position: Point): StoneRain {
    return new StoneRain({
      position,
      power: 'empowered',
      color: '#A0826D', // Darker brown
      impactCount: 15 // More impacts
    })
  }

  /**
   * Create maximized Stone Rain (9th level + empowered)
   */
  static createMaximized(position: Point): StoneRain {
    return new StoneRain({
      position,
      spellLevel: 9,
      power: 'empowered',
      areaRadius: 150, // Larger area
      impactCount: 20, // Many impacts
      impactSize: 20 // Larger individual impacts
    })
  }

  /**
   * Create Stone Rain with custom impact pattern
   */
  static createCustomPattern(
    position: Point,
    impactCount: number,
    impactInterval: number
  ): StoneRain {
    return new StoneRain({
      position,
      impactCount,
      impactInterval
    })
  }

  /**
   * Generate random impact positions within area
   * (Utility method for renderer to use)
   */
  static generateImpactPositions(
    center: Point,
    areaRadius: number,
    count: number
  ): Point[] {
    const positions: Point[] = []

    for (let i = 0; i < count; i++) {
      // Random angle
      const angle = Math.random() * 2 * Math.PI

      // Random distance from center (using sqrt for uniform distribution)
      const distance = Math.sqrt(Math.random()) * areaRadius

      // Calculate position
      const x = center.x + Math.cos(angle) * distance
      const y = center.y + Math.sin(angle) * distance

      positions.push({ x, y })
    }

    return positions
  }
}
