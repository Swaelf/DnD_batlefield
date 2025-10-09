/**
 * Dazed Status Effect
 *
 * D&D 5e Specs (homebrew/variant):
 * - Can't take reactions
 * - Movement speed reduced
 * - May have disadvantage on concentration checks
 * - Common from psychic damage or stunning effects
 *
 * Visual Features:
 * - Yellow swirling stars
 * - Dizzy spin effect
 * - Medium intensity
 */

import { AbstractStatusEffect, type StatusEffectConfig } from '../../core/AbstractStatusEffect'
import type { Point } from '../../types'

export type DazedConfig = {
  position: Point
  intensity?: number
}

export class DazedEffect extends AbstractStatusEffect {
  constructor(config: DazedConfig) {
    const { position, intensity = 0.6 } = config

    const effectConfig: StatusEffectConfig = {
      name: 'Dazed',
      effectType: 'dazed',
      position,
      color: '#FFFF00', // Yellow
      secondaryColor: '#FFA500', // Orange
      animationType: 'spin',
      duration: 2000, // 2 second cycle
      intensity,
      layer: 3,
      opacity: 0.6,
      blendMode: 'screen',
      metadata: {
        noReactions: true,
        speedReduction: 0.3, // 30% reduction
        disadvantageOnConcentration: true
      }
    }

    super(effectConfig)
  }

  static create(position: Point): DazedEffect {
    return new DazedEffect({ position })
  }

  static createWithIntensity(position: Point, intensity: number): DazedEffect {
    return new DazedEffect({ position, intensity })
  }
}
