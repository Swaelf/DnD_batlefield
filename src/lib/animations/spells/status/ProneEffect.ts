/**
 * Prone Status Effect
 *
 * D&D 5e Specs:
 * - Disadvantage on attack rolls
 * - Attack rolls against prone creature have advantage (within 5 feet)
 * - Attack rolls against prone creature have disadvantage (beyond 5 feet)
 * - Costs half movement to stand up
 *
 * Visual Features:
 * - Gray downward arrows
 * - Pulsing ground indicator
 * - Low opacity overlay
 */

import { AbstractStatusEffect, type StatusEffectConfig } from '../../core/AbstractStatusEffect'
import type { Point } from '../../types'

export type ProneConfig = {
  position: Point
  intensity?: number
}

export class ProneEffect extends AbstractStatusEffect {
  constructor(config: ProneConfig) {
    const { position, intensity = 0.5 } = config

    const effectConfig: StatusEffectConfig = {
      name: 'Prone',
      effectType: 'prone',
      position,
      color: '#808080', // Gray
      secondaryColor: '#A9A9A9', // Dark gray
      animationType: 'pulse',
      duration: 2500, // 2.5 second cycle
      intensity,
      layer: 1,
      opacity: 0.5,
      blendMode: 'multiply',
      metadata: {
        disadvantageOnAttacks: true,
        costsMovementToStand: true,
        affectsRangedAttacks: true
      }
    }

    super(effectConfig)
  }

  static create(position: Point): ProneEffect {
    return new ProneEffect({ position })
  }

  static createWithIntensity(position: Point, intensity: number): ProneEffect {
    return new ProneEffect({ position, intensity })
  }
}
