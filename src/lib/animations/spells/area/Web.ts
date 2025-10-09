/**
 * Web Spell Animation
 *
 * A D&D area effect spell that creates sticky webbing.
 *
 * D&D 5e Specs:
 * - Level: 2nd level conjuration
 * - Range: 60 feet
 * - Area: 20-foot cube
 * - Duration: 1 hour (concentration)
 * - Effect: Sticky webbing that restrains creatures
 *
 * Animation Features:
 * - Spreading web pattern
 * - Pulsing/breathing effect
 * - Persistent for duration
 * - Light beige/white color
 * - Web strand particles
 */

import { AbstractAreaEffect, type AreaEffectConfig } from '../../core/AbstractAreaEffect'
import type { Point } from '../../types'

export type WebConfig = {
  position: Point
  // Optional overrides
  spellLevel?: number // 2-9, affects size
  durationType?: 'time' | 'rounds' | 'events'
  duration?: number // In ms for time, count for rounds/events
  size?: number
  color?: string
}

export class Web extends AbstractAreaEffect {
  constructor(config: WebConfig) {
    const {
      position,
      spellLevel = 2,
      durationType = 'time',
      duration = 3600000, // 1 hour in ms (D&D default)
      size = 100, // 20-foot cube = ~100px
      color = '#F5F5DC'
    } = config

    // Scale with spell level (minimal - web doesn't change much)
    const levelMultiplier = 1 + (spellLevel - 2) * 0.05
    const finalSize = size * levelMultiplier

    const areaConfig: AreaEffectConfig = {
      name: 'Web',
      position,
      shape: 'cube', // 20-foot cube
      size: finalSize,
      color,
      opacity: 0.6, // Semi-transparent for web strands
      duration: 1500, // Animation cycle duration
      persistDuration: duration,
      durationType,

      // Subtle pulsing effect (web strands tightening/loosening)
      pulsing: true,
      pulseSpeed: 0.8, // Slow pulse
      pulseAmplitude: 0.08, // Very subtle

      // No rotation for web
      rotating: false,

      // Web doesn't track targets
      trackTarget: false,

      // Glow effect for magical webbing
      glow: {
        enabled: true,
        color: '#FFFFFF', // White glow
        intensity: 0.4,
        radius: finalSize * 1.1,
        pulsing: true
      },

      // Particle effects - web strands
      particles: {
        enabled: true,
        count: 30,
        size: 2,
        speed: 15, // Very slow drifting
        lifetime: 4000,
        color: '#F0F0F0', // Off-white strands
        spread: 360,
        gravity: false
      },

      // Sound effect
      sound: {
        enabled: true,
        soundId: 'web_cast',
        volume: 0.4,
        pitch: 1.0
      },

      // Metadata
      metadata: {
        spellLevel,
        school: 'conjuration',
        concentration: true,
        restrains: true, // Web restrains creatures
        flammable: true, // Web is flammable in D&D
        size: finalSize / 5 // In feet (20-foot cube)
      }
    }

    super(areaConfig)
  }

  /**
   * Create an upcasted Web (higher spell level = slightly larger area)
   */
  static createUpcasted(position: Point, spellLevel: number): Web {
    return new Web({
      position,
      spellLevel
    })
  }

  /**
   * Create Web with event-based duration (for timeline integration)
   */
  static createEventBased(position: Point, eventDuration: number): Web {
    return new Web({
      position,
      durationType: 'events',
      duration: eventDuration
    })
  }

  /**
   * Create Web with round-based duration (D&D combat rounds)
   */
  static createRoundBased(position: Point, rounds: number): Web {
    return new Web({
      position,
      durationType: 'rounds',
      duration: rounds
    })
  }

  /**
   * Create timed Web (auto-convert duration to ms)
   */
  static createTimed(position: Point, minutes: number): Web {
    return new Web({
      position,
      durationType: 'time',
      duration: minutes * 60 * 1000 // Convert minutes to ms
    })
  }

  /**
   * Create Web with custom appearance
   */
  static createCustom(
    position: Point,
    options: {
      size?: number
      color?: string
      duration?: number
      durationType?: 'time' | 'rounds' | 'events'
    }
  ): Web {
    return new Web({
      position,
      ...options
    })
  }
}
