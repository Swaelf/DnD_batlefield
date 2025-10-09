/**
 * Poisoned Status Effect
 *
 * D&D 5e Specs:
 * - Disadvantage on attack rolls and ability checks
 * - Common condition from poison damage or disease
 * - Can be cured with Lesser Restoration or similar magic
 *
 * Visual Features:
 * - Sickly green particles
 * - Bubbling toxic effect
 * - Medium intensity
 */

import { AbstractStatusEffect, type StatusEffectConfig } from '../../core/AbstractStatusEffect'
import type { Point } from '../../types'

export type PoisonedConfig = {
  position: Point
  intensity?: number
}

export class PoisonedEffect extends AbstractStatusEffect {
  constructor(config: PoisonedConfig) {
    const { position, intensity = 0.6 } = config

    const effectConfig: StatusEffectConfig = {
      name: 'Poisoned',
      effectType: 'poisoned',
      position,
      color: '#00FF00', // Bright green
      secondaryColor: '#228B22', // Forest green
      animationType: 'bubbles',
      duration: 3000, // 3 second cycle
      intensity,
      layer: 2,
      opacity: 0.6,
      blendMode: 'multiply',
      metadata: {
        disadvantageOnAttacks: true,
        disadvantageOnChecks: true
      }
    }

    super(effectConfig)
  }

  static create(position: Point): PoisonedEffect {
    return new PoisonedEffect({ position })
  }

  static createWithIntensity(position: Point, intensity: number): PoisonedEffect {
    return new PoisonedEffect({ position, intensity })
  }
}
