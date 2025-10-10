/**
 * Longbow Attack Animation
 *
 * D&D 5e Weapon Specs:
 * - Type: Martial ranged weapon
 * - Damage: 1d8 piercing
 * - Properties: Ammunition, heavy, two-handed
 * - Range: 150/600 feet (normal/long)
 *
 * Animation Features:
 * - Arrow projectile without trail (small, simple projectile)
 * - Linear motion
 * - Range limiting (150 feet normal)
 * - Impact flash on hit
 */

import { AbstractRangedAttack, type RangedAttackConfig } from '../../core/AbstractRangedAttack'
import type { Point } from '../../types'

export type LongbowConfig = {
  position: Point // Attacker position
  target: Point // Target position
  // Optional overrides
  isCritical?: boolean
  actualDamage?: number
  longRange?: boolean // true = disadvantage range (150-600)
}

export class LongbowAttack extends AbstractRangedAttack {
  constructor(config: LongbowConfig) {
    const {
      position,
      target,
      isCritical = false,
      actualDamage,
      longRange = false
    } = config

    const rangedConfig: RangedAttackConfig = {
      name: 'Longbow',
      position,
      target,
      weaponType: 'arrow',
      color: '#8B4513', // Brown wood/arrow
      duration: 800, // Medium flight time
      range: longRange ? 600 : 150, // Normal or long range
      size: 8, // Arrow size
      trailCount: 0, // No trail (simple projectile, different from magic spells)
      spin: false, // Arrows don't spin
      metadata: {
        weaponName: 'Longbow',
        damageType: 'piercing',
        damageDice: '1d8',
        normalRange: 150,
        longRange: 600,
        ammunition: true,
        heavy: true,
        twoHanded: true,
        isCritical,
        actualDamage,
        disadvantage: longRange
      }
    }

    super(rangedConfig)
  }

  /**
   * Create normal range attack (150 feet)
   */
  static createNormalRange(position: Point, target: Point): LongbowAttack {
    return new LongbowAttack({
      position,
      target,
      longRange: false
    })
  }

  /**
   * Create long range attack (600 feet, disadvantage)
   */
  static createLongRange(position: Point, target: Point): LongbowAttack {
    return new LongbowAttack({
      position,
      target,
      longRange: true
    })
  }

  /**
   * Create critical hit
   */
  static createCritical(position: Point, target: Point, damage: number): LongbowAttack {
    return new LongbowAttack({
      position,
      target,
      isCritical: true,
      actualDamage: damage
    })
  }
}
