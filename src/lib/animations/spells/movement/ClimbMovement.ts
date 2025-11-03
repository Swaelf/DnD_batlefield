/**
 * Climb Movement
 *
 * D&D 5e Specs:
 * - Vertical surface climbing
 * - Requires Athletics check (DC 15 typical)
 * - Half speed movement
 * - Hands must be free
 *
 * Animation Features:
 * - Slower, steady easing
 * - Brown/earth tone color
 * - 2000ms duration (very slow)
 * - Vertical indicator
 */

import { AbstractMovement, type MovementConfig } from '../../core/AbstractMovement'
import type { Point } from '../../types'

export type ClimbConfig = {
  fromPosition: Point
  toPosition: Point
  speed?: number
  athleticsDC?: number
}

export class ClimbMovement extends AbstractMovement {
  constructor(config: ClimbConfig) {
    const { fromPosition, toPosition, speed = 15, athleticsDC = 15 } = config

    const movementConfig: MovementConfig = {
      name: 'Climb',
      fromPosition,
      toPosition,
      movementType: 'climb',
      color: '#8B4513', // Brown
      duration: 2000,
      easing: 'ease-in-out',
      showTrail: false,
      speed,
      requiresCheck: true,
      dc: athleticsDC,
      skill: 'Athletics',
      metadata: {
        provokesOpportunityAttacks: true,
        costsAction: false,
        halfSpeed: true,
        vertical: true,
        requiresFreeHands: true
      }
    }

    super(movementConfig)
  }

  static create(from: Point, to: Point): ClimbMovement {
    return new ClimbMovement({ fromPosition: from, toPosition: to })
  }

  static createWithDC(from: Point, to: Point, dc: number): ClimbMovement {
    return new ClimbMovement({ fromPosition: from, toPosition: to, athleticsDC: dc })
  }
}
