/**
 * Frightened Status Effect
 *
 * D&D 5e Specs:
 * - Disadvantage on ability checks and attack rolls while source is in sight
 * - Can't willingly move closer to source of fear
 * - Common from dragon fear, spells like Cause Fear
 * - Can make saving throw at end of each turn to end effect
 *
 * Visual Features:
 * - Dark shadowy flicker
 * - Ominous dark aura
 * - Trembling effect
 */

import { AbstractStatusEffect, type StatusEffectConfig } from '../../core/AbstractStatusEffect'
import type { Point } from '../../types'

export type FrightenedConfig = {
  position: Point
  intensity?: number
}

export class FrightenedEffect extends AbstractStatusEffect {
  constructor(config: FrightenedConfig) {
    const { position, intensity = 0.7 } = config

    const effectConfig: StatusEffectConfig = {
      name: 'Frightened',
      effectType: 'frightened',
      position,
      color: '#4B0082', // Indigo
      secondaryColor: '#000000', // Black
      animationType: 'flicker',
      duration: 1500, // 1.5 second cycle (nervous)
      intensity,
      layer: 3,
      opacity: 0.6,
      blendMode: 'multiply',
      metadata: {
        disadvantageOnAttacks: true,
        disadvantageOnChecks: true,
        cantApproachSource: true,
        savingThrowEachTurn: true
      }
    }

    super(effectConfig)
  }

  static create(position: Point): FrightenedEffect {
    return new FrightenedEffect({ position })
  }

  static createWithIntensity(position: Point, intensity: number): FrightenedEffect {
    return new FrightenedEffect({ position, intensity })
  }
}
