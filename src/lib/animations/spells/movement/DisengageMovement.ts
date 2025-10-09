/**
 * Disengage Movement
 *
 * D&D 5e Specs:
 * - Use action to move without opportunity attacks
 * - Full normal speed
 * - No special requirements
 * - Tactical retreat option
 *
 * Animation Features:
 * - Smooth, controlled easing
 * - Teal color (tactical/defensive)
 * - 1000ms duration (normal speed)
 * - Defensive movement indicator
 */

import { AbstractMovement, type MovementConfig } from '../../core/AbstractMovement'
import type { Point } from '../../types'

export type DisengageConfig = {
  fromPosition: Point
  toPosition: Point
  speed?: number
}

export class DisengageMovement extends AbstractMovement {
  constructor(config: DisengageConfig) {
    const { fromPosition, toPosition, speed = 30 } = config

    const movementConfig: MovementConfig = {
      name: 'Disengage',
      fromPosition,
      toPosition,
      movementType: 'disengage',
      color: '#20B2AA', // Teal
      duration: 1000,
      easing: 'ease-in-out',
      showTrail: false,
      speed,
      requiresCheck: false,
      metadata: {
        provokesOpportunityAttacks: false, // Primary benefit
        costsAction: true, // Uses your action
        defensive: true,
        tacticalRetreat: true
      }
    }

    super(movementConfig)
  }

  static create(from: Point, to: Point): DisengageMovement {
    return new DisengageMovement({ fromPosition: from, toPosition: to })
  }
}
