/**
 * Rapier Attack Animation
 *
 * D&D 5e Weapon Specs:
 * - Type: Martial melee weapon
 * - Damage: 1d8 piercing
 * - Properties: Finesse
 * - Range: 5 feet (1 square)
 *
 * Animation Features:
 * - Arrow-shaped wave thrust
 * - Linear piercing motion
 * - Fading trails (4 arrow trails)
 * - Fast, precise attack
 */

import { AbstractMeleeAttack, type MeleeAttackConfig } from '../../core/AbstractMeleeAttack'
import type { Point } from '../../types'

export type RapierConfig = {
  position: Point // Attacker position
  target: Point // Target position
  // Optional overrides
  isCritical?: boolean
  actualDamage?: number
}

export class RapierAttack extends AbstractMeleeAttack {
  constructor(config: RapierConfig) {
    const {
      position,
      target,
      isCritical = false,
      actualDamage
    } = config

    const meleeConfig: MeleeAttackConfig = {
      name: 'Rapier',
      position,
      target,
      attackType: 'thrust',
      weaponType: 'dagger', // Use dagger category for finesse weapons
      color: '#B0B0B0', // Light steel gray
      duration: 500, // Fast weapon
      range: 5, // 5 feet (one square)
      size: 35, // Medium-slim weapon
      trailCount: 4, // Arrow wave trails
      impactEffect: false, // Thrust doesn't need impact
      metadata: {
        weaponName: 'Rapier',
        damageType: 'piercing',
        damageDice: '1d8',
        finesse: true,
        isCritical,
        actualDamage
      }
    }

    super(meleeConfig)
  }

  /**
   * Create standard rapier attack
   */
  static create(position: Point, target: Point): RapierAttack {
    return new RapierAttack({ position, target })
  }

  /**
   * Create critical hit
   */
  static createCritical(position: Point, target: Point, damage: number): RapierAttack {
    return new RapierAttack({
      position,
      target,
      isCritical: true,
      actualDamage: damage
    })
  }
}
