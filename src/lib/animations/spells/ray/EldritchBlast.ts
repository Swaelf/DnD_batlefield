/**
 * Eldritch Blast Spell Animation
 *
 * A D&D cantrip warlock spell that fires a beam of crackling energy.
 *
 * D&D 5e Specs:
 * - Level: Cantrip (evocation)
 * - Range: 120 feet
 * - Damage: 1d10 force damage
 * - Effect: Beam of crackling energy
 *
 * Animation Features:
 * - Purple/violet force beam
 * - No tapering (consistent width)
 * - Crackling energy effect
 * - Instant appearance
 * - Multiple beams at higher levels (2 at 5th, 3 at 11th, 4 at 17th)
 */

import { AbstractRay, type RayConfig } from '../../core/AbstractRay'
import type { Point } from '../../types'

export type EldritchBlastConfig = {
  fromPosition: Point
  toPosition: Point
  // Optional overrides
  casterLevel?: number // 1-20, affects number of beams
  power?: 'normal' | 'empowered'
  width?: number
  color?: string
}

export class EldritchBlast extends AbstractRay {
  constructor(config: EldritchBlastConfig) {
    const {
      fromPosition,
      toPosition,
      casterLevel = 1,
      power = 'normal',
      width = 10,
      color = '#8B00FF'
    } = config

    // Cantrip scaling: 1 beam at 1st, 2 at 5th, 3 at 11th, 4 at 17th
    const beamCount = Math.floor((casterLevel - 1) / 6) + 1
    const powerMultiplier = power === 'empowered' ? 1.3 : 1
    const finalWidth = width * powerMultiplier

    const rayConfig: RayConfig = {
      name: 'Eldritch Blast',
      fromPosition,
      toPosition,
      duration: 400, // Faster than Ray of Frost
      width: finalWidth,
      color,
      size: finalWidth,
      opacity: 0.9,

      // Straight beam (single segment)
      segments: 1,

      // No taper (consistent width warlock energy)
      taper: false,

      // Crackling effect
      flickering: true,

      // Energy flowing along beam
      flowing: true,

      // No expansion
      expanding: false,

      // Multiple beams for higher levels
      rayCount: beamCount,
      spread: 10, // Degrees between beams

      // Glow effect - purple/violet force energy
      glow: {
        enabled: true,
        color: '#9370DB',
        intensity: 1,
        radius: finalWidth * 3.5,
        pulsing: false
      },

      // Particle effects - crackling energy
      particles: {
        enabled: true,
        count: 25,
        size: 5,
        speed: 200,
        lifetime: 500,
        color: '#DA70D6', // Orchid purple
        spread: 25, // Narrow spread along beam
        gravity: false
      },

      // Sound effect
      sound: {
        enabled: true,
        soundId: 'eldritch_blast_cast',
        volume: 0.7,
        pitch: 0.9 // Lower pitch for warlock magic
      },

      // Metadata
      metadata: {
        spellLevel: 0, // Cantrip
        school: 'evocation',
        damageType: 'force',
        damageDice: beamCount, // Number of d10s
        power,
        beamCount
      }
    }

    super(rayConfig)
  }

  /**
   * Create Eldritch Blast at specific caster level (cantrip scaling)
   */
  static createAtLevel(from: Point, to: Point, casterLevel: number): EldritchBlast {
    return new EldritchBlast({
      fromPosition: from,
      toPosition: to,
      casterLevel
    })
  }

  /**
   * Create empowered Eldritch Blast (Agonizing Blast invocation)
   */
  static createEmpowered(from: Point, to: Point): EldritchBlast {
    return new EldritchBlast({
      fromPosition: from,
      toPosition: to,
      power: 'empowered',
      color: '#9400D3', // Darker violet for empowered
      width: 12
    })
  }

  /**
   * Create Eldritch Blast for high-level warlock (4 beams)
   */
  static createMaximized(from: Point, to: Point): EldritchBlast {
    return new EldritchBlast({
      fromPosition: from,
      toPosition: to,
      casterLevel: 17, // 4 beams
      power: 'empowered',
      color: '#8B008B', // Dark magenta
      width: 13
    })
  }

  /**
   * Create quick blast (shorter duration)
   */
  static createQuick(from: Point, to: Point, casterLevel: number = 1): EldritchBlast {
    const blast = new EldritchBlast({
      fromPosition: from,
      toPosition: to,
      casterLevel
    })
    // Override duration for faster blast
    blast['animation'].duration = 300
    return blast
  }
}
