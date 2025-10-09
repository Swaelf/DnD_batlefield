/**
 * Regenerating Status Effect
 *
 * D&D 5e Specs:
 * - Regains HP at start of each turn
 * - Typical sources: Troll regeneration, healing spells, magical items
 * - Amount varies by source (e.g., trolls regain 10 HP)
 * - May be suppressed by certain damage types (acid, fire for trolls)
 *
 * Visual Features:
 * - Green healing particles
 * - Upward flowing energy
 * - Vibrant, life-giving aura
 */

import { AbstractStatusEffect, type StatusEffectConfig } from '../../core/AbstractStatusEffect'
import type { Point } from '../../types'

export type RegeneratingConfig = {
  position: Point
  intensity?: number
  healingPerTurn?: number
}

export class RegeneratingEffect extends AbstractStatusEffect {
  constructor(config: RegeneratingConfig) {
    const { position, intensity = 0.7, healingPerTurn = 5 } = config

    const effectConfig: StatusEffectConfig = {
      name: 'Regenerating',
      effectType: 'regenerating',
      position,
      color: '#00FF00', // Bright green
      secondaryColor: '#ADFF2F', // Green yellow
      animationType: 'particles',
      duration: 2000, // 2 second cycle
      intensity,
      layer: 2,
      opacity: 0.65,
      blendMode: 'screen',
      metadata: {
        healingPerTurn,
        canBeSuppressed: true
      }
    }

    super(effectConfig)
  }

  static create(position: Point): RegeneratingEffect {
    return new RegeneratingEffect({ position })
  }

  static createWithHealing(position: Point, healingPerTurn: number): RegeneratingEffect {
    return new RegeneratingEffect({ position, healingPerTurn })
  }

  static createWithIntensity(position: Point, intensity: number): RegeneratingEffect {
    return new RegeneratingEffect({ position, intensity })
  }
}
