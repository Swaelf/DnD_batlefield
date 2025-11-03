/**
 * Fly Movement
 *
 * D&D 5e Specs:
 * - Aerial movement (magical or natural)
 * - Full fly speed (typically 60 feet)
 * - Requires concentration for spell-based flight
 * - Can hover or must keep moving (species dependent)
 *
 * Animation Features:
 * - Smooth, elevated easing
 * - Purple/lavender color
 * - 800ms duration (faster than ground)
 * - Elevation indicator
 */

import { AbstractMovement, type MovementConfig } from '../../core/AbstractMovement'
import type { Point } from '../../types'

export type FlyConfig = {
  fromPosition: Point
  toPosition: Point
  speed?: number
  acrobaticsDC?: number
}

export class FlyMovement extends AbstractMovement {
  constructor(config: FlyConfig) {
    const { fromPosition, toPosition, speed = 60, acrobaticsDC = 10 } = config

    const movementConfig: MovementConfig = {
      name: 'Fly',
      fromPosition,
      toPosition,
      movementType: 'fly',
      color: '#B19CD9', // Lavender
      duration: 800,
      easing: 'ease-out',
      showTrail: false,
      speed,
      requiresCheck: false, // Only check in difficult conditions
      dc: acrobaticsDC,
      skill: 'Acrobatics',
      metadata: {
        provokesOpportunityAttacks: false, // Flying avoids ground-based attacks
        costsAction: false,
        elevation: true,
        requiresConcentration: true // For spell-based flight
      }
    }

    super(movementConfig)
  }

  static create(from: Point, to: Point): FlyMovement {
    return new FlyMovement({ fromPosition: from, toPosition: to })
  }

  static createWithDC(from: Point, to: Point, dc: number): FlyMovement {
    return new FlyMovement({ fromPosition: from, toPosition: to, acrobaticsDC: dc })
  }
}
