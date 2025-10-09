/**
 * Entangled/Restrained Status Effect
 *
 * D&D 5e Specs:
 * - Speed becomes 0, can't benefit from bonuses to speed
 * - Attack rolls against restrained creature have advantage
 * - Restrained creature's attack rolls have disadvantage
 * - Restrained creature has disadvantage on Dexterity saving throws
 *
 * Visual Features:
 * - Green vines/tendrils
 * - Wave animation showing binding
 * - Medium-high intensity
 */

import { AbstractStatusEffect, type StatusEffectConfig } from '../../core/AbstractStatusEffect'
import type { Point } from '../../types'

export type EntangledConfig = {
  position: Point
  intensity?: number
}

export class EntangledEffect extends AbstractStatusEffect {
  constructor(config: EntangledConfig) {
    const { position, intensity = 0.7 } = config

    const effectConfig: StatusEffectConfig = {
      name: 'Entangled',
      effectType: 'entangled',
      position,
      color: '#228B22', // Forest green
      secondaryColor: '#006400', // Dark green
      animationType: 'wave',
      duration: 2000, // 2 second cycle
      intensity,
      layer: 2,
      opacity: 0.7,
      blendMode: 'multiply',
      metadata: {
        speedReduction: 1.0, // 100% reduction (speed = 0)
        grantsAdvantage: true,
        disadvantageOnAttacks: true,
        disadvantageOnDexSaves: true
      }
    }

    super(effectConfig)
  }

  static create(position: Point): EntangledEffect {
    return new EntangledEffect({ position })
  }

  static createWithIntensity(position: Point, intensity: number): EntangledEffect {
    return new EntangledEffect({ position, intensity })
  }
}
