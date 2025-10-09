/**
 * Darkness Spell Animation
 *
 * A D&D area effect spell that creates a sphere of magical darkness.
 *
 * D&D 5e Specs:
 * - Level: 2nd level evocation
 * - Range: 60 feet
 * - Area: 15-foot radius sphere
 * - Duration: 10 minutes (concentration)
 * - Effect: Magical darkness that blocks darkvision
 *
 * Animation Features:
 * - Circular area of effect
 * - Pulsing darkness effect
 * - Can be cast on object or point in space
 * - Tracks moving objects if cast on them
 * - Multiple duration types (time, rounds, events)
 */

import { AbstractAreaEffect, type AreaEffectConfig } from '../../core/AbstractAreaEffect'
import type { Point } from '../../types'

export type DarknessConfig = {
  position: Point
  // Optional overrides
  spellLevel?: number // 2-9, affects size
  durationType?: 'time' | 'rounds' | 'events'
  duration?: number // In ms for time, count for rounds/events
  trackTarget?: boolean // Follow moving object
  intensity?: 'normal' | 'deeper' // Deeper darkness (higher spell slot)
  size?: number
  color?: string
}

export class Darkness extends AbstractAreaEffect {
  constructor(config: DarknessConfig) {
    const {
      position,
      spellLevel = 2,
      durationType = 'time',
      duration = 600000, // 10 minutes in ms (D&D default)
      trackTarget = false,
      intensity = 'normal',
      size = 150, // 15-foot radius = 150px
      color = '#000000'
    } = config

    // Scale with spell level (higher slots = larger area)
    const levelMultiplier = 1 + (spellLevel - 2) * 0.1
    const intensityMultiplier = intensity === 'deeper' ? 1.3 : 1
    const finalSize = size * levelMultiplier * intensityMultiplier

    const areaConfig: AreaEffectConfig = {
      name: 'Darkness',
      position,
      shape: 'circle', // Sphere from top-down view
      size: finalSize,
      color,
      opacity: 0.85, // Very dark but not completely opaque
      duration: 1000, // Animation cycle duration
      persistDuration: duration,
      durationType,

      // Pulsing darkness effect (breathing)
      pulsing: true,
      pulseSpeed: 1.5, // Slow, ominous pulse
      pulseAmplitude: 0.15, // Subtle size variation

      // No rotation for darkness
      rotating: false,

      // Track target if cast on object
      trackTarget,

      // Glow effect for magical darkness
      glow: {
        enabled: true,
        color: '#1a0033', // Very dark purple
        intensity: 0.6,
        radius: finalSize * 1.2,
        pulsing: true
      },

      // Particle effects - dark wisps
      particles: {
        enabled: true,
        count: 25,
        size: 4,
        speed: 30, // Slow drifting
        lifetime: 3000,
        color: '#2a0a4a', // Dark purple
        spread: 360,
        gravity: false
      },

      // Sound effect
      sound: {
        enabled: true,
        soundId: 'darkness_cast',
        volume: 0.5,
        pitch: 0.8 // Lower pitch for ominous feel
      },

      // Metadata
      metadata: {
        spellLevel,
        school: 'evocation',
        concentration: true,
        blocksVision: true,
        blocksDarkvision: true,
        intensity,
        radius: finalSize / 10 // In feet
      }
    }

    super(areaConfig)
  }

  /**
   * Create an upcasted Darkness (higher spell level = larger area)
   */
  static createUpcasted(position: Point, spellLevel: number): Darkness {
    return new Darkness({
      position,
      spellLevel
    })
  }

  /**
   * Create Darkness with event-based duration (for timeline integration)
   */
  static createEventBased(position: Point, eventDuration: number): Darkness {
    return new Darkness({
      position,
      durationType: 'events',
      duration: eventDuration
    })
  }

  /**
   * Create Darkness with round-based duration (D&D combat rounds)
   */
  static createRoundBased(position: Point, rounds: number): Darkness {
    return new Darkness({
      position,
      durationType: 'rounds',
      duration: rounds
    })
  }

  /**
   * Create Darkness that tracks a moving object
   */
  static createTracking(position: Point, duration: number = 600000): Darkness {
    return new Darkness({
      position,
      trackTarget: true,
      duration
    })
  }

  /**
   * Create Deeper Darkness (higher spell slot or special variant)
   */
  static createDeeper(position: Point): Darkness {
    return new Darkness({
      position,
      intensity: 'deeper',
      spellLevel: 4, // Cast at 4th level
      color: '#000000',
      size: 180 // Larger area
    })
  }

  /**
   * Create timed Darkness (auto-convert duration to ms)
   */
  static createTimed(position: Point, minutes: number): Darkness {
    return new Darkness({
      position,
      durationType: 'time',
      duration: minutes * 60 * 1000 // Convert minutes to ms
    })
  }
}
