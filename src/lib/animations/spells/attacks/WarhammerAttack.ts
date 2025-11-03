/**
 * Warhammer Attack Animation
 *
 * D&D 5e Weapon Specs:
 * - Type: Martial melee weapon
 * - Damage: 1d8 bludgeoning (one-handed) or 1d10 bludgeoning (two-handed)
 * - Properties: Versatile
 * - Range: 5 feet (1 square)
 *
 * Animation Features:
 * - Hammer falling from Z-axis
 * - Shockwave burst on impact
 * - Dynamic handle connecting source to hammer
 * - Multiple ring waves (main + trails + aftershocks)
 */

import { AbstractMeleeAttack, type MeleeAttackConfig } from '../../core/AbstractMeleeAttack'
import type { Point } from '../../types'

export type WarhammerConfig = {
  position: Point // Attacker position
  target: Point // Target position
  // Optional overrides
  oneHanded?: boolean // true = 1d8, false = 1d10 (two-handed)
  isCritical?: boolean
  actualDamage?: number
}

export class WarhammerAttack extends AbstractMeleeAttack {
  constructor(config: WarhammerConfig) {
    const {
      position,
      target,
      oneHanded = true,
      isCritical = false,
      actualDamage
    } = config

    const meleeConfig: MeleeAttackConfig = {
      name: 'Warhammer',
      position,
      target,
      attackType: 'swing',
      weaponType: 'mace',
      color: '#8B7355', // Brown/bronze
      duration: 700, // Slower, heavy weapon
      range: 5, // 5 feet (one square)
      size: 35, // Medium-heavy weapon
      trailCount: 0, // No trails (uses shockwave instead)
      impactEffect: true, // Burst shockwave
      metadata: {
        weaponName: 'Warhammer',
        damageType: 'bludgeoning',
        damageDice: oneHanded ? '1d8' : '1d10',
        versatile: true,
        isCritical,
        actualDamage
      }
    }

    super(meleeConfig)
  }

  /**
   * Create one-handed warhammer attack
   */
  static createOneHanded(position: Point, target: Point): WarhammerAttack {
    return new WarhammerAttack({
      position,
      target,
      oneHanded: true
    })
  }

  /**
   * Create two-handed warhammer attack
   */
  static createTwoHanded(position: Point, target: Point): WarhammerAttack {
    return new WarhammerAttack({
      position,
      target,
      oneHanded: false
    })
  }

  /**
   * Create critical hit
   */
  static createCritical(position: Point, target: Point, damage: number): WarhammerAttack {
    return new WarhammerAttack({
      position,
      target,
      isCritical: true,
      actualDamage: damage
    })
  }
}
