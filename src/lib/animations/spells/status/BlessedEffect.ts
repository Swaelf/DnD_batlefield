/**
 * Blessed Status Effect
 *
 * D&D 5e Specs:
 * - Add 1d4 to attack rolls and saving throws
 * - Lasts for 1 minute (concentration)
 * - Can affect up to 3 creatures
 * - 1st-level enchantment spell
 *
 * Visual Features:
 * - Golden holy light
 * - Gentle shimmer
 * - Warm, positive aura
 */

import { AbstractStatusEffect, type StatusEffectConfig } from '../../core/AbstractStatusEffect'
import type { Point } from '../../types'

export type BlessedConfig = {
  position: Point
  intensity?: number
  spellLevel?: number
}

export class BlessedEffect extends AbstractStatusEffect {
  constructor(config: BlessedConfig) {
    const { position, intensity = 0.7, spellLevel = 1 } = config

    const effectConfig: StatusEffectConfig = {
      name: 'Blessed',
      effectType: 'blessed',
      position,
      color: '#FFD700', // Gold
      secondaryColor: '#FFFACD', // Lemon chiffon
      animationType: 'shimmer',
      duration: 3000, // 3 second cycle (gentle)
      intensity,
      layer: 3,
      opacity: 0.7,
      blendMode: 'screen',
      metadata: {
        bonus: '1d4',
        affectsAttacks: true,
        affectsSavingThrows: true,
        spellLevel,
        requiresConcentration: true
      }
    }

    super(effectConfig)
  }

  static create(position: Point): BlessedEffect {
    return new BlessedEffect({ position })
  }

  static createWithSpellLevel(position: Point, spellLevel: number): BlessedEffect {
    return new BlessedEffect({ position, spellLevel })
  }

  static createWithIntensity(position: Point, intensity: number): BlessedEffect {
    return new BlessedEffect({ position, intensity })
  }
}
