/**
 * Withdraw Movement
 *
 * D&D 5e Specs (Pathfinder):
 * - Careful retreat from enemies
 * - First square doesn't provoke
 * - Full-round action (uses action + movement)
 * - Requires clear path
 *
 * Animation Features:
 * - Cautious, controlled easing
 * - Orange color (alert/caution)
 * - 1200ms duration
 * - Defensive posture indicator
 */

import { AbstractMovement, type MovementConfig } from '../../core/AbstractMovement'
import type { Point } from '../../types'

export type WithdrawConfig = {
  fromPosition: Point
  toPosition: Point
  speed?: number
  acrobaticsDC?: number
}

export class WithdrawMovement extends AbstractMovement {
  constructor(config: WithdrawConfig) {
    const { fromPosition, toPosition, speed = 25, acrobaticsDC = 8 } = config

    const movementConfig: MovementConfig = {
      name: 'Withdraw',
      fromPosition,
      toPosition,
      movementType: 'withdraw',
      color: '#FFA500', // Orange
      duration: 1200,
      easing: 'ease-out',
      showTrail: false,
      speed,
      requiresCheck: false,
      dc: acrobaticsDC,
      skill: 'Acrobatics',
      metadata: {
        provokesOpportunityAttacks: false, // First square protected
        costsAction: true, // Full-round action
        cautious: true,
        defensivePosture: true
      }
    }

    super(movementConfig)
  }

  static create(from: Point, to: Point): WithdrawMovement {
    return new WithdrawMovement({ fromPosition: from, toPosition: to })
  }
}
