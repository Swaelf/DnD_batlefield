/**
 * Ice Storm Spell Animation
 *
 * D&D 5e Ice Storm - A hail of rock-hard ice pounds to the ground in a cylinder
 *
 * Spell Specs:
 * - Level: 4th level evocation
 * - Range: 300 feet
 * - Damage: 2d8 bludgeoning + 4d6 cold
 * - Area: Cylinder (20-ft. radius, 40 ft. high)
 * - Effect: Multiple ice impacts in sequence across the area
 *
 * Animation Features:
 * - Light blue circular area (20-ft radius = 200px)
 * - 5 sequential burst impacts (one by one, 800ms intervals)
 * - Each burst is 1 map square diameter (50px diameter = 25px radius)
 * - Random impact positions within area (uniform distribution)
 * - Ice blue colors (#87CEEB) with white highlights
 * - Total duration ~4.1 seconds (4100ms)
 * - Persists for 1 event (difficult terrain)
 */

import { AbstractBurst, type BurstConfig } from '../../core/AbstractBurst'
import type { Point } from '../../types'

export type IceStormConfig = {
  position: Point // Center of ice storm area
  // Optional overrides
  spellLevel?: number // 4-9, affects damage
  power?: 'normal' | 'empowered'
  areaRadius?: number // Total area radius in pixels (default 100px = 20ft)
  impactSize?: number // Individual ice impact size (default 50px = 1 map square)
  impactCount?: number // Number of ice impacts
  impactInterval?: number // Time between impacts in ms
  color?: string
  secondaryColor?: string
}

/**
 * IceStorm - Multi-burst area spell with persistent difficult terrain
 *
 * Creates multiple sequential burst effects representing hail impacts.
 * The area persists as difficult terrain for 1 event.
 */
export class IceStorm extends AbstractBurst {
  constructor(config: IceStormConfig) {
    const {
      position,
      spellLevel = 4,
      power = 'normal',
      areaRadius = 200, // 20-foot radius = 4 grid cells = 200px (50px per cell)
      impactSize = 25, // 1 grid cell diameter = 50px = 25px radius
      impactCount = 5, // Number of ice impacts (sequential burst animations)
      impactInterval = 800, // 800ms between impacts
      color = '#87CEEB', // Light blue (sky blue)
      secondaryColor = '#F0F8FF' // White (alice blue)
    } = config

    // Scale with spell level
    const levelMultiplier = 1 + (spellLevel - 4) * 0.1
    const powerMultiplier = power === 'empowered' ? 1.2 : 1
    const finalAreaRadius = areaRadius * powerMultiplier

    // Total duration: First burst at ~0ms, subsequent bursts at 800ms intervals
    // Burst times: 0ms, 800ms, 1600ms, 2400ms, 3200ms
    // Plus 500ms for the last burst animation = ~3700ms
    // Using 4100ms to match AnimationRegistry and provide buffer time
    const totalDuration = 4100 // (impactCount - 1) * impactInterval + 900ms buffer

    const burstConfig: BurstConfig & {
      persistDuration?: number
      durationType?: 'rounds' | 'events'
      persistColor?: string
      persistOpacity?: number
    } = {
      name: 'Ice Storm',
      position,
      shape: 'circle',
      radius: finalAreaRadius, // Total area affected (20-ft radius)
      duration: totalDuration,
      color,
      opacity: 0.6,

      // Fast individual impacts
      expansionDuration: 150,
      peakDuration: 80,
      fadeDuration: 200,

      // Persistent effect properties (at top level for adapter access)
      persistDuration: 1, // Persists for 1 event
      durationType: 'events' as const,
      persistColor: color,
      persistOpacity: 0.3,

      // Bright glow for ice impacts
      glow: {
        enabled: true,
        color: secondaryColor,
        intensity: 1.2 * powerMultiplier,
        radius: impactSize * 2,
        pulsing: false
      },

      // Ice shard particles
      particles: {
        enabled: true,
        count: 50 * levelMultiplier,
        size: 4,
        speed: 100,
        lifetime: 800,
        color: '#E0F4FF', // Pale blue
        spread: 360, // Radial spread
        gravity: true // Particles fall down
      },

      // Sound effect
      sound: {
        enabled: true,
        soundId: 'ice_storm_cast',
        volume: 0.9,
        pitch: 1.1 // Higher pitch for ice
      },

      // Multi-burst metadata
      metadata: {
        spellLevel,
        school: 'evocation',
        damageType: 'cold-bludgeoning',
        damageDice: '2d8 bludgeoning + 4d6 cold', // D&D 5e damage
        saveType: 'dexterity',
        power,
        range: 300, // 300 feet
        area: finalAreaRadius,

        // Multi-burst specific properties
        isMultiBurst: true,
        impactCount,
        impactInterval,
        impactSize,
        secondaryColor,

        // Impact randomization
        randomizePositions: true,
        spreadRadius: finalAreaRadius,

        // Persistent effect (difficult terrain)
        persistentEffect: 'difficult-terrain'
      }
    }

    super(burstConfig)
  }

  /**
   * Create an upcasted Ice Storm (higher spell level)
   */
  static createUpcasted(position: Point, spellLevel: number): IceStorm {
    return new IceStorm({
      position,
      spellLevel,
      impactCount: 18 + (spellLevel - 4) * 3 // More impacts at higher levels
    })
  }

  /**
   * Create an empowered Ice Storm
   */
  static createEmpowered(position: Point): IceStorm {
    return new IceStorm({
      position,
      power: 'empowered',
      color: '#5F9FD7', // Deeper blue
      impactCount: 24 // More impacts
    })
  }

  /**
   * Create maximized Ice Storm (9th level + empowered)
   */
  static createMaximized(position: Point): IceStorm {
    return new IceStorm({
      position,
      spellLevel: 9,
      power: 'empowered',
      areaRadius: 150, // Larger area
      impactCount: 30, // Many impacts
      impactSize: 60 // Larger individual impacts
    })
  }

  /**
   * Create Ice Storm with custom impact pattern
   */
  static createCustomPattern(
    position: Point,
    impactCount: number,
    impactInterval: number
  ): IceStorm {
    return new IceStorm({
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
