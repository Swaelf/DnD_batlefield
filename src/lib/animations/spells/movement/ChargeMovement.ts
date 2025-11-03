/**
 * Charge Movement
 *
 * D&D 5e Specs:
 * - Aggressive forward movement toward an enemy
 * - Requires straight line path (10+ feet)
 * - Grants bonus action after charge
 * - Provokes opportunity attacks
 *
 * Animation Features:
 * - Faster easing (ease-in for acceleration)
 * - Red/orange trail indicating aggression
 * - 800ms duration
 */

import { AbstractMovement, type MovementConfig } from '../../core/AbstractMovement'
import type { Point } from '../../types'

export type ChargeConfig = {
  fromPosition: Point
  toPosition: Point
  speed?: number
}

export class ChargeMovement extends AbstractMovement {
  constructor(config: ChargeConfig) {
    const { fromPosition, toPosition, speed = 40 } = config

    const movementConfig: MovementConfig = {
      name: 'Charge',
      fromPosition,
      toPosition,
      movementType: 'charge',
      color: '#FF6B47', // Orange-red
      duration: 800,
      easing: 'ease-in',
      showTrail: true,
      speed,
      requiresCheck: false,
      metadata: {
        provokesOpportunityAttacks: true,
        costsAction: false,
        bonusActionAfter: true,
        minimumDistance: 10 // Requires 10 feet minimum
      }
    }

    super(movementConfig)
  }

  static create(from: Point, to: Point): ChargeMovement {
    return new ChargeMovement({ fromPosition: from, toPosition: to })
  }
}
