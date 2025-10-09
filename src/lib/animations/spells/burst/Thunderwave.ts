/**
 * Thunderwave Spell Animation
 *
 * A D&D burst spell that creates a thunderous shockwave.
 *
 * D&D 5e Specs:
 * - Level: 1st level evocation
 * - Range: Self (15-foot cube)
 * - Damage: 2d8 thunder damage
 * - Effect: Push creatures 10 feet away
 *
 * Animation Features:
 * - Square-shaped burst from caster
 * - Blue/white electric colors
 * - Rapid expansion with screen shake
 * - Thunder sound effect
 * - Shockwave rings
 */

import { AbstractBurst, type BurstConfig } from '../../core/AbstractBurst'
import type { Point } from '../../types'

export type ThunderwaveConfig = {
  position: Point
  // Optional overrides
  spellLevel?: number // 1-9, affects size and intensity
  direction?: 'north' | 'south' | 'east' | 'west' // Cube direction
  power?: 'normal' | 'empowered'
  size?: number
  color?: string
}

export class Thunderwave extends AbstractBurst {
  constructor(config: ThunderwaveConfig) {
    const {
      position,
      spellLevel = 1,
      direction = 'north',
      power = 'normal',
      size = 150, // 15-foot cube = ~3 grid cells = 150px
      color = '#4169E1'
    } = config

    // Scale damage and effect with spell level
    const levelMultiplier = 1 + (spellLevel - 1) * 0.15
    const powerMultiplier = power === 'empowered' ? 1.25 : 1
    const finalSize = size * levelMultiplier * powerMultiplier

    // Adjust position based on direction (cube extends from caster)
    const adjustedPosition = Thunderwave.getDirectionalPosition(position, finalSize / 2, direction)

    const burstConfig: BurstConfig = {
      name: 'Thunderwave',
      position: adjustedPosition,
      radius: finalSize / 2, // Radius to match cube size
      shape: 'square', // Thunderwave is a cube
      color,
      size: finalSize / 2,
      duration: 600,
      opacity: 0.7,

      // Fast expansion for explosive feel
      expansionDuration: 150,
      peakDuration: 100,
      fadeDuration: 350,

      // Thunder effects
      shockwave: true,
      shake: {
        intensity: 0.4 * powerMultiplier,
        duration: 250
      },

      // Glow effect
      glow: {
        enabled: true,
        color: '#87CEEB',
        intensity: 1,
        radius: finalSize * 0.8,
        pulsing: false
      },

      // Particle effects - electric sparks
      particles: {
        enabled: true,
        count: 40,
        size: 6,
        speed: 300,
        lifetime: 600,
        color: '#FFFFFF',
        spread: 360,
        gravity: false
      },

      // Sound effect
      sound: {
        enabled: true,
        soundId: 'thunderwave_cast',
        volume: 0.8,
        pitch: 1 + (spellLevel - 1) * 0.1
      },

      // Metadata
      metadata: {
        spellLevel,
        school: 'evocation',
        damageType: 'thunder',
        power,
        direction,
        pushDistance: 10 // Push effect in feet
      }
    }

    super(burstConfig)
  }

  /**
   * Get position adjusted for directional cube
   */
  private static getDirectionalPosition(
    center: Point,
    offset: number,
    direction: 'north' | 'south' | 'east' | 'west'
  ): Point {
    switch (direction) {
      case 'north':
        return { x: center.x, y: center.y - offset }
      case 'south':
        return { x: center.x, y: center.y + offset }
      case 'east':
        return { x: center.x + offset, y: center.y }
      case 'west':
        return { x: center.x - offset, y: center.y }
      default:
        return center
    }
  }

  /**
   * Create an upcasted Thunderwave (higher spell level)
   */
  static createUpcasted(position: Point, spellLevel: number): Thunderwave {
    return new Thunderwave({
      position,
      spellLevel
    })
  }

  /**
   * Create an empowered Thunderwave
   */
  static createEmpowered(position: Point): Thunderwave {
    return new Thunderwave({
      position,
      power: 'empowered'
    })
  }

  /**
   * Create a directional Thunderwave
   */
  static createDirectional(
    position: Point,
    direction: 'north' | 'south' | 'east' | 'west'
  ): Thunderwave {
    return new Thunderwave({
      position,
      direction
    })
  }

  /**
   * Create a maximized Thunderwave (9th level)
   */
  static createMaximized(position: Point): Thunderwave {
    return new Thunderwave({
      position,
      spellLevel: 9,
      power: 'empowered',
      color: '#0000FF' // Darker blue for more powerful version
    })
  }
}
