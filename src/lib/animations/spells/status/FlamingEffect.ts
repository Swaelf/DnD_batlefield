/**
 * Flaming/On Fire Status Effect
 *
 * D&D 5e Specs:
 * - Takes fire damage at start of each turn
 * - Can use action to attempt to extinguish (DC 10 Dexterity check)
 * - Others can use action to help extinguish
 * - Water or smothering automatically extinguishes
 *
 * Visual Features:
 * - Orange/red flames
 * - Particle effects
 * - High intensity
 */

import { AbstractStatusEffect, type StatusEffectConfig } from '../../core/AbstractStatusEffect'
import type { Point } from '../../types'

export type FlamingConfig = {
  position: Point
  intensity?: number
}

export class FlamingEffect extends AbstractStatusEffect {
  constructor(config: FlamingConfig) {
    const { position, intensity = 0.8 } = config

    const effectConfig: StatusEffectConfig = {
      name: 'Flaming',
      effectType: 'flaming',
      position,
      color: '#FF4500', // Orange red
      secondaryColor: '#FFD700', // Gold
      animationType: 'particles',
      duration: 1000, // 1 second cycle (fast flickering)
      intensity,
      layer: 3,
      opacity: 0.75,
      blendMode: 'screen',
      metadata: {
        damagePerTurn: true,
        damageType: 'fire',
        canExtinguish: true
      }
    }

    super(effectConfig)
  }

  static create(position: Point): FlamingEffect {
    return new FlamingEffect({ position })
  }

  static createWithIntensity(position: Point, intensity: number): FlamingEffect {
    return new FlamingEffect({ position, intensity })
  }
}
