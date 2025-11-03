/**
 * Sling Attack Animation
 *
 * D&D 5e Weapon Specs:
 * - Type: Simple ranged weapon
 * - Damage: 1d4 bludgeoning
 * - Properties: Ammunition
 * - Range: 30/120 feet (normal/long)
 *
 * Animation Features:
 * - Stone projectile (no trail)
 * - Medium flight time
 * - Short-medium range (30 feet normal)
 * - Impact flash on hit
 */

import { AbstractRangedAttack, type RangedAttackConfig } from '../../core/AbstractRangedAttack'
import type { Point } from '../../types'

export type SlingConfig = {
  position: Point // Attacker position
  target: Point // Target position
  // Optional overrides
  isCritical?: boolean
  actualDamage?: number
  longRange?: boolean // true = disadvantage range (30-120)
}

export class SlingAttack extends AbstractRangedAttack {
  constructor(config: SlingConfig) {
    const {
      position,
      target,
      isCritical = false,
      actualDamage,
      longRange = false
    } = config

    const rangedConfig: RangedAttackConfig = {
      name: 'Sling',
      position,
      target,
      weaponType: 'sling',
      color: '#696969', // Gray stone
      duration: 600, // Medium flight
      range: longRange ? 120 : 30, // Normal or long range
      size: 10, // Stone size
      trailCount: 0, // No trail (simple projectile, different from magic spells)
      spin: false, // Stones don't spin
      metadata: {
        weaponName: 'Sling',
        damageType: 'bludgeoning',
        damageDice: '1d4',
        normalRange: 30,
        longRange: 120,
        ammunition: true,
        isCritical,
        actualDamage,
        disadvantage: longRange
      }
    }

    super(rangedConfig)
  }

  /**
   * Create normal range attack (30 feet)
   */
  static createNormalRange(position: Point, target: Point): SlingAttack {
    return new SlingAttack({
      position,
      target,
      longRange: false
    })
  }

  /**
   * Create long range attack (120 feet, disadvantage)
   */
  static createLongRange(position: Point, target: Point): SlingAttack {
    return new SlingAttack({
      position,
      target,
      longRange: true
    })
  }

  /**
   * Create critical hit
   */
  static createCritical(position: Point, target: Point, damage: number): SlingAttack {
    return new SlingAttack({
      position,
      target,
      isCritical: true,
      actualDamage: damage
    })
  }
}
