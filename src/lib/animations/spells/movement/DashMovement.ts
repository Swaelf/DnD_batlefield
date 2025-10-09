/**
 * Dash Movement
 *
 * D&D 5e Specs:
 * - Uses action to gain extra movement
 * - Speed: Double normal speed
 * - No special requirements
 * - Provokes opportunity attacks
 *
 * Animation Features:
 * - Faster interpolation (600ms)
 * - Ease-out easing for burst of speed
 * - Golden trail
 */

import { AbstractMovement, type MovementConfig } from '../../core/AbstractMovement'
import type { Point } from '../../types'

export type DashConfig = {
  fromPosition: Point
  toPosition: Point
  speed?: number // Base movement speed (will be doubled)
}

export class DashMovement extends AbstractMovement {
  constructor(config: DashConfig) {
    const { fromPosition, toPosition, speed = 30 } = config

    const movementConfig: MovementConfig = {
      name: 'Dash',
      fromPosition,
      toPosition,
      movementType: 'dash',
      color: '#FFD700', // Gold
      duration: 600, // Faster than walk
      easing: 'ease-out', // Burst of speed
      showTrail: true,
      trailOpacity: 0.4,
      speed: speed * 2, // Double speed
      requiresCheck: false,
      metadata: {
        provokesOpportunityAttacks: true,
        costsAction: true, // Uses action
        doubleSpeed: true
      }
    }

    super(movementConfig)
  }

  /**
   * Create dash movement
   */
  static create(from: Point, to: Point): DashMovement {
    return new DashMovement({ fromPosition: from, toPosition: to })
  }

  /**
   * Create dash with custom base speed
   */
  static createWithSpeed(from: Point, to: Point, speed: number): DashMovement {
    return new DashMovement({ fromPosition: from, toPosition: to, speed })
  }
}
