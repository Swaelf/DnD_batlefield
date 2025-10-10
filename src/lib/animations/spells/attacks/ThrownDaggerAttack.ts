/**
 * Thrown Dagger Attack Animation
 *
 * D&D 5e Weapon Specs:
 * - Type: Simple melee weapon (can be thrown)
 * - Damage: 1d4 piercing
 * - Properties: Finesse, light, thrown (20/60)
 * - Range: 20/60 feet (normal/long)
 *
 * Animation Features:
 * - Dagger projectile with spinning (no trail)
 * - Fast flight time
 * - Short range (20 feet normal)
 * - Impact flash on hit
 */

import { AbstractRangedAttack, type RangedAttackConfig } from '../../core/AbstractRangedAttack'
import type { Point } from '../../types'

export type ThrownDaggerConfig = {
  position: Point // Attacker position
  target: Point // Target position
  // Optional overrides
  isCritical?: boolean
  actualDamage?: number
  longRange?: boolean // true = disadvantage range (20-60)
}

export class ThrownDaggerAttack extends AbstractRangedAttack {
  constructor(config: ThrownDaggerConfig) {
    const {
      position,
      target,
      isCritical = false,
      actualDamage,
      longRange = false
    } = config

    const rangedConfig: RangedAttackConfig = {
      name: 'Thrown Dagger',
      position,
      target,
      weaponType: 'thrown',
      color: '#C0C0C0', // Silver blade
      duration: 500, // Fast throw
      range: longRange ? 60 : 20, // Normal or long range
      size: 12, // Larger than arrow
      trailCount: 0, // No trail (simple projectile, different from magic spells)
      spin: true, // Daggers spin when thrown
      metadata: {
        weaponName: 'Dagger (Thrown)',
        damageType: 'piercing',
        damageDice: '1d4',
        normalRange: 20,
        longRange: 60,
        finesse: true,
        light: true,
        thrown: true,
        isCritical,
        actualDamage,
        disadvantage: longRange
      }
    }

    super(rangedConfig)
  }

  /**
   * Create normal range attack (20 feet)
   */
  static createNormalRange(position: Point, target: Point): ThrownDaggerAttack {
    return new ThrownDaggerAttack({
      position,
      target,
      longRange: false
    })
  }

  /**
   * Create long range attack (60 feet, disadvantage)
   */
  static createLongRange(position: Point, target: Point): ThrownDaggerAttack {
    return new ThrownDaggerAttack({
      position,
      target,
      longRange: true
    })
  }

  /**
   * Create critical hit
   */
  static createCritical(position: Point, target: Point, damage: number): ThrownDaggerAttack {
    return new ThrownDaggerAttack({
      position,
      target,
      isCritical: true,
      actualDamage: damage
    })
  }
}
