/**
 * Chilled/Frozen Status Effect
 *
 * D&D 5e Specs:
 * - Speed reduced (typically halved)
 * - May have vulnerability to cold damage
 * - May have difficulty with Dexterity-based actions
 * - Severe cold can lead to exhaustion
 *
 * Visual Features:
 * - Icy blue shimmer
 * - Frost particles
 * - Cool color palette
 */

import { AbstractStatusEffect, type StatusEffectConfig } from '../../core/AbstractStatusEffect'
import type { Point } from '../../types'

export type ChilledConfig = {
  position: Point
  intensity?: number
}

export class ChilledEffect extends AbstractStatusEffect {
  constructor(config: ChilledConfig) {
    const { position, intensity = 0.6 } = config

    const effectConfig: StatusEffectConfig = {
      name: 'Chilled',
      effectType: 'chilled',
      position,
      color: '#00FFFF', // Cyan
      secondaryColor: '#4169E1', // Royal blue
      animationType: 'shimmer',
      duration: 2500, // 2.5 second cycle
      intensity,
      layer: 2,
      opacity: 0.65,
      blendMode: 'screen',
      metadata: {
        speedReduction: 0.5, // 50% reduction
        vulnerabilityToCold: true
      }
    }

    super(effectConfig)
  }

  static create(position: Point): ChilledEffect {
    return new ChilledEffect({ position })
  }

  static createWithIntensity(position: Point, intensity: number): ChilledEffect {
    return new ChilledEffect({ position, intensity })
  }
}
