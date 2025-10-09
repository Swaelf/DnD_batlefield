/**
 * Longsword Attack Animation
 *
 * D&D 5e Weapon Specs:
 * - Type: Martial melee weapon
 * - Damage: 1d8 slashing (one-handed) or 1d10 slashing (two-handed)
 * - Properties: Versatile
 * - Range: 5 feet (1 square)
 *
 * Animation Features:
 * - Sweeping 60-degree cone slash
 * - Motion blur trails (5 fading trails)
 * - Dynamic length (grows/shrinks during sweep)
 * - Range extension bonus at center of sweep
 */

import { AbstractMeleeAttack, type MeleeAttackConfig } from '../../core/AbstractMeleeAttack'
import type { Point } from '../../types'

export type LongswordConfig = {
  position: Point // Attacker position
  target: Point // Target position
  // Optional overrides
  oneHanded?: boolean // true = 1d8, false = 1d10 (two-handed)
  isCritical?: boolean
  actualDamage?: number
}

export class LongswordAttack extends AbstractMeleeAttack {
  constructor(config: LongswordConfig) {
    const {
      position,
      target,
      oneHanded = true,
      isCritical = false,
      actualDamage
    } = config

    const meleeConfig: MeleeAttackConfig = {
      name: 'Longsword',
      position,
      target,
      attackType: 'slash',
      color: '#C0C0C0', // Silver/steel
      duration: 600, // Medium speed
      range: 5, // 5 feet (one square)
      size: 40, // Large weapon
      trailCount: 5, // Motion blur trails
      impactEffect: false, // Slash doesn't need impact
      metadata: {
        weaponName: 'Longsword',
        damageType: 'slashing',
        damageDice: oneHanded ? '1d8' : '1d10',
        versatile: true,
        isCritical,
        actualDamage
      }
    }

    super(meleeConfig)
  }

  /**
   * Create one-handed longsword attack
   */
  static createOneHanded(position: Point, target: Point): LongswordAttack {
    return new LongswordAttack({
      position,
      target,
      oneHanded: true
    })
  }

  /**
   * Create two-handed longsword attack
   */
  static createTwoHanded(position: Point, target: Point): LongswordAttack {
    return new LongswordAttack({
      position,
      target,
      oneHanded: false
    })
  }

  /**
   * Create critical hit
   */
  static createCritical(position: Point, target: Point, damage: number): LongswordAttack {
    return new LongswordAttack({
      position,
      target,
      isCritical: true,
      actualDamage: damage
    })
  }
}
