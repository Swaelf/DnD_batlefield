/**
 * Dying Status Effect
 *
 * D&D 5e Specs:
 * - Making death saving throws (DC 10)
 * - Unconscious
 * - Three failures = death, three successes = stabilized
 * - Taking damage while dying = automatic failure
 * - Critical hit = two failures
 *
 * Visual Features:
 * - Dark red flicker
 * - Ominous pulsing
 * - High opacity warning
 */

import { AbstractStatusEffect, type StatusEffectConfig } from '../../core/AbstractStatusEffect'
import type { Point } from '../../types'

export type DyingConfig = {
  position: Point
  intensity?: number
}

export class DyingEffect extends AbstractStatusEffect {
  constructor(config: DyingConfig) {
    const { position, intensity = 0.9 } = config

    const effectConfig: StatusEffectConfig = {
      name: 'Dying',
      effectType: 'dying',
      position,
      color: '#8B0000', // Dark red
      secondaryColor: '#000000', // Black
      animationType: 'flicker',
      duration: 1500, // 1.5 second cycle (urgent)
      intensity,
      layer: 4,
      opacity: 0.8,
      blendMode: 'multiply',
      metadata: {
        unconscious: true,
        deathSaves: true,
        criticalCondition: true
      }
    }

    super(effectConfig)
  }

  static create(position: Point): DyingEffect {
    return new DyingEffect({ position })
  }

  static createWithIntensity(position: Point, intensity: number): DyingEffect {
    return new DyingEffect({ position, intensity })
  }
}
