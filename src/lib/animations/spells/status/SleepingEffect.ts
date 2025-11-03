/**
 * Sleeping/Unconscious Status Effect
 *
 * D&D 5e Specs:
 * - Unconscious
 * - Can't move or speak
 * - Unaware of surroundings
 * - Automatically fails Strength and Dexterity saving throws
 * - Attack rolls against have advantage
 * - Melee attacks within 5 feet are critical hits
 *
 * Visual Features:
 * - Purple/blue overlay
 * - Gentle pulse (breathing)
 * - Peaceful appearance
 */

import { AbstractStatusEffect, type StatusEffectConfig } from '../../core/AbstractStatusEffect'
import type { Point } from '../../types'

export type SleepingConfig = {
  position: Point
  intensity?: number
}

export class SleepingEffect extends AbstractStatusEffect {
  constructor(config: SleepingConfig) {
    const { position, intensity = 0.8 } = config

    const effectConfig: StatusEffectConfig = {
      name: 'Sleeping',
      effectType: 'sleeping',
      position,
      color: '#9370DB', // Medium purple
      secondaryColor: '#4169E1', // Royal blue
      animationType: 'pulse',
      duration: 3000, // 3 second cycle (slow, breathing)
      intensity,
      layer: 3,
      opacity: 0.7,
      blendMode: 'overlay',
      metadata: {
        unconscious: true,
        grantsAdvantage: true,
        meleeCriticals: true,
        awakensOnDamage: true
      }
    }

    super(effectConfig)
  }

  static create(position: Point): SleepingEffect {
    return new SleepingEffect({ position })
  }

  static createWithIntensity(position: Point, intensity: number): SleepingEffect {
    return new SleepingEffect({ position, intensity })
  }
}
