/**
 * Swim Movement
 *
 * D&D 5e Specs:
 * - Movement through water/liquid
 * - Requires Athletics check (DC 12 typical)
 * - Half speed movement (unless swim speed)
 * - May require Constitution checks for endurance
 *
 * Animation Features:
 * - Fluid, wavy easing
 * - Aqua/cyan color
 * - 1800ms duration
 * - Fluid motion indicator
 */

import { AbstractMovement, type MovementConfig } from '../../core/AbstractMovement'
import type { Point } from '../../types'

export type SwimConfig = {
  fromPosition: Point
  toPosition: Point
  speed?: number
  athleticsDC?: number
}

export class SwimMovement extends AbstractMovement {
  constructor(config: SwimConfig) {
    const { fromPosition, toPosition, speed = 15, athleticsDC = 12 } = config

    const movementConfig: MovementConfig = {
      name: 'Swim',
      fromPosition,
      toPosition,
      movementType: 'swim',
      color: '#4ECDC4', // Cyan
      duration: 1800,
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
        fluid: true
      }
    }

    super(movementConfig)
  }

  static create(from: Point, to: Point): SwimMovement {
    return new SwimMovement({ fromPosition: from, toPosition: to })
  }

  static createWithDC(from: Point, to: Point, dc: number): SwimMovement {
    return new SwimMovement({ fromPosition: from, toPosition: to, athleticsDC: dc })
  }
}
