/**
 * Stunned Status Effect
 *
 * D&D 5e Specs:
 * - Cannot move or take actions
 * - Automatically fails Strength and Dexterity saving throws
 * - Attack rolls against stunned creature have advantage
 *
 * Visual Features:
 * - Gold spinning stars
 * - High intensity spin animation
 * - Bright overlay effect
 */

import { AbstractStatusEffect, type StatusEffectConfig } from '../../core/AbstractStatusEffect'
import type { Point } from '../../types'

export type StunnedConfig = {
  position: Point
  intensity?: number
}

export class StunnedEffect extends AbstractStatusEffect {
  constructor(config: StunnedConfig) {
    const { position, intensity = 0.8 } = config

    const effectConfig: StatusEffectConfig = {
      name: 'Stunned',
      effectType: 'stunned',
      position,
      color: '#FFD700', // Gold
      secondaryColor: '#FFA500', // Orange
      animationType: 'spin',
      duration: 2000, // 2 second cycle
      intensity,
      layer: 3,
      opacity: 0.7,
      blendMode: 'screen',
      metadata: {
        preventsMovement: true,
        preventsActions: true,
        grantsAdvantage: true
      }
    }

    super(effectConfig)
  }

  /**
   * Create stunned effect
   */
  static create(position: Point): StunnedEffect {
    return new StunnedEffect({ position })
  }

  /**
   * Create with custom intensity
   */
  static createWithIntensity(position: Point, intensity: number): StunnedEffect {
    return new StunnedEffect({ position, intensity })
  }
}
